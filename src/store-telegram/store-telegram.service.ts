import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';
import { SmsService } from 'src/sms/sms.service';
import { JwtService } from '@nestjs/jwt';

const STORE_BOT_COMMANDS = [
  { command: 'start', description: '🛒 Botni ishga tushirish va do\'konga kirish' },
  { command: 'login', description: '🔑 Tizimga kirish yoki qayta kirish' },
  { command: 'orders', description: '📦 Mening buyurtmalarim' },
  { command: 'language', description: '🌐 Tilni o\'zgartirish (uz/ru)' },
  { command: 'help', description: '❓ Yordam va komandalar ro\'yxati' },
];

type UserState = {
  state: 'idle' | 'waiting_code';
  smsId?: string;
  phone?: string;
};

@Injectable()
export class StoreTelegramService implements OnModuleInit {
  private readonly logger = new Logger(StoreTelegramService.name);
  private readonly token = process.env.STORE_BOT_TOKEN ?? '';
  private readonly webhookBase = (process.env.STORE_BOT_WEBHOOK_URL ?? '').replace(/\/$/, '');
  private readonly storeUrl = 'https://diametr.uz/store';

  // In-memory state machine per chat_id
  private readonly userStates = new Map<string, UserState>();
  private readonly ORDERS_PER_PAGE = 3;

  constructor(
    private readonly prisma: PrismaClientService,
    private readonly smsService: SmsService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    if (!this.token) {
      this.logger.warn('STORE_BOT_TOKEN topilmadi — store bot o\'chirilgan');
      return;
    }
    await this.registerCommands();
    if (this.webhookBase) {
      await this.setWebhook(`${this.webhookBase}/api/v1/store/webhook`);
    } else {
      this.logger.warn('STORE_BOT_WEBHOOK_URL topilmadi — webhook o\'rnatilmadi');
    }
    this.logger.log('Store bot ishga tushdi ✅');
  }

  // ─── Webhook & commands setup ───────────────────────────────────

  private async setWebhook(url: string) {
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.token}/setWebhook`,
        { url, drop_pending_updates: true },
        { timeout: 8000 },
      );
      this.logger.log(`Store bot webhook set: ${url} ✅`);
    } catch (e: any) {
      this.logger.error(`setWebhook error: ${e?.message}`);
    }
  }

  private async registerCommands() {
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.token}/setMyCommands`,
        { commands: STORE_BOT_COMMANDS },
        { timeout: 8000 },
      );
    } catch (e: any) {
      this.logger.error(`registerCommands error: ${e?.message}`);
    }
  }

  // ─── Update handler ─────────────────────────────────────────────

  async handleUpdate(update: any) {
    // Handle inline keyboard callbacks (language selection)
    if (update?.callback_query) {
      await this.handleCallback(update.callback_query);
      return;
    }

    const message = update?.message ?? update?.edited_message;
    if (!message) return;

    const chatId = String(message.chat?.id);
    if (!chatId) return;

    // Handle shared contact (phone number)
    if (message.contact) {
      await this.handleContact(chatId, message.contact);
      return;
    }

    const text: string = (message.text ?? '').trim();

    // Check current state
    const state = this.userStates.get(chatId);
    if (state?.state === 'waiting_code' && text && !text.startsWith('/')) {
      await this.handleSmsCode(chatId, text);
      return;
    }

    if (text.startsWith('/')) {
      const cmd = text.split(' ')[0].split('@')[0].toLowerCase();
      await this.handleCommand(cmd, chatId, message.from);
    }
  }

  private async handleCommand(cmd: string, chatId: string, from?: any) {
    switch (cmd) {
      case '/start':
      case '/login':
        return this.cmdStart(chatId);
      case '/orders':
        return this.cmdOrders(chatId);
      case '/language':
        return this.cmdLanguage(chatId);
      case '/help':
        return this.cmdHelp(chatId);
    }
  }

  // ─── Commands ───────────────────────────────────────────────────

  private async cmdStart(chatId: string) {
    const user = await this.prisma.user.findFirst({ where: { chat_id: chatId } });

    if (user) {
      const lang = user.lang ?? 'uz';
      const token = await this.generateToken(user);
      const url = `${this.storeUrl}?token=${token}`;
      const text =
        lang === 'ru'
          ? `👋 <b>Добро пожаловать, ${user.fullname ?? user.phone}!</b>\n\n🛒 Нажмите кнопку ниже чтобы открыть магазин.`
          : `👋 <b>Xush kelibsiz, ${user.fullname ?? user.phone}!</b>\n\n🛒 Quyidagi tugmani bosib do'konga o'ting.`;
      await this.sendMessage(chatId, text, {
        inline_keyboard: [[
          { text: '🛒 Do\'konga o\'tish', web_app: { url } },
        ]],
      });
    } else {
      const text =
        `👋 <b>Diametr Store botiga xush kelibsiz!</b>\n\n` +
        `🔑 Davom etish uchun telefon raqamingizni ulashing.\n\n` +
        `📱 Quyidagi tugmani bosing:`;
      await this.sendMessage(chatId, text, {
        keyboard: [[
          { text: '📱 Telefon raqamni ulashish', request_contact: true },
        ]],
        resize_keyboard: true,
        one_time_keyboard: true,
      });
    }
  }

  private async cmdOrders(chatId: string, page = 0) {
    const user = await this.prisma.user.findFirst({ where: { chat_id: chatId } });
    const lang = user?.lang ?? 'uz';

    if (!user) {
      const text =
        lang === 'ru'
          ? '🔑 Вы не вошли в систему. Используйте /login для входа.'
          : '🔑 Siz tizimga kirmagansiz. Kirish uchun /login dan foydalaning.';
      return this.reply(chatId, text);
    }

    const total = await this.prisma.order.count({ where: { user_id: user.id } });

    if (total === 0) {
      const text =
        lang === 'ru'
          ? '📭 У вас пока нет заказов.'
          : '📭 Hali buyurtmalaringiz yo\'q.';
      return this.reply(chatId, text);
    }

    const totalPages = Math.ceil(total / this.ORDERS_PER_PAGE);
    const safePage = Math.max(0, Math.min(page, totalPages - 1));

    const orders = await this.prisma.order.findMany({
      where: { user_id: user.id },
      skip: safePage * this.ORDERS_PER_PAGE,
      take: this.ORDERS_PER_PAGE,
      orderBy: { createdt: 'desc' },
      include: { shop: { select: { name: true } } },
    });

    const { text, keyboard } = this.buildOrdersPage(orders, lang, safePage, totalPages, total);
    await this.sendMessage(chatId, text, { inline_keyboard: keyboard });
  }

  private buildOrdersPage(
    orders: any[],
    lang: string,
    page: number,
    totalPages: number,
    total: number,
  ): { text: string; keyboard: any[][] } {
    const statusEmoji: Record<string, string> = {
      STARTED: '⏳', FINISHED: '🏁', CONFIRMED: '✅', CANCELED: '❌',
    };
    const statusLabel: Record<string, Record<string, string>> = {
      STARTED:   { uz: 'Jarayonda',     ru: 'В процессе' },
      FINISHED:  { uz: 'Yetkazildi',    ru: 'Доставлен' },
      CONFIRMED: { uz: 'Tasdiqlandi',   ru: 'Подтверждён' },
      CANCELED:  { uz: 'Bekor qilindi', ru: 'Отменён' },
    };
    const nums = ['1️⃣', '2️⃣', '3️⃣'];
    const divider = '─────────────────────';

    const header =
      lang === 'ru'
        ? `📦 <b>Мои заказы</b>  ·  Всего: ${total}`
        : `📦 <b>Buyurtmalarim</b>  ·  Jami: ${total} ta`;

    const lines = orders.map((o, i) => {
      const num = nums[i] ?? `${page * this.ORDERS_PER_PAGE + i + 1}.`;
      const emoji = statusEmoji[o.status] ?? '⚪';
      const sl = statusLabel[o.status]?.[lang] ?? o.status;
      const shop = o.shop?.name ?? '—';
      const amount = (o.amount ?? 0).toLocaleString('ru-RU');
      const d = new Date(o.createdt);
      const date =
        `${String(d.getDate()).padStart(2, '0')}.` +
        `${String(d.getMonth() + 1).padStart(2, '0')}.` +
        `${d.getFullYear()}`;
      return (
        `${num} <b>#${o.id}</b>  ·  ${shop}\n` +
        `    ${emoji} ${sl}\n` +
        `    💰 ${amount} so'm   ·   📅 ${date}`
      );
    });

    const pageInfo =
      lang === 'ru'
        ? `📄 Страница ${page + 1} / ${totalPages}`
        : `📄 Sahifa ${page + 1} / ${totalPages}`;

    const text = `${header}\n${divider}\n\n${lines.join('\n\n')}\n\n${divider}\n${pageInfo}`;

    const navRow: any[] = [];
    if (page > 0) {
      navRow.push({
        text: '◀️ ' + (lang === 'ru' ? 'Назад' : 'Oldingi'),
        callback_data: `orders_${page - 1}`,
      });
    }
    if (page < totalPages - 1) {
      navRow.push({
        text: (lang === 'ru' ? 'Далее' : 'Keyingi') + ' ▶️',
        callback_data: `orders_${page + 1}`,
      });
    }

    return { text, keyboard: navRow.length > 0 ? [navRow] : [] };
  }

  private async cmdLanguage(chatId: string) {
    const text = '🌐 Tilni tanlang / Выберите язык:';
    await this.sendMessage(chatId, text, {
      inline_keyboard: [[
        { text: '🇺🇿 O\'zbek', callback_data: 'lang_uz' },
        { text: '🇷🇺 Русский', callback_data: 'lang_ru' },
      ]],
    });
  }

  private async cmdHelp(chatId: string) {
    const user = await this.prisma.user.findFirst({ where: { chat_id: chatId } });
    const lang = user?.lang ?? 'uz';

    const lines = STORE_BOT_COMMANDS.map((c) => `/${c.command} — ${c.description}`).join('\n');
    const text =
      lang === 'ru'
        ? `❓ <b>Список команд:</b>\n\n${lines}\n\n🛒 Магазин: ${this.storeUrl}`
        : `❓ <b>Komandalar ro'yxati:</b>\n\n${lines}\n\n🛒 Do'kon: ${this.storeUrl}`;
    await this.reply(chatId, text);
  }

  // ─── Contact handler ─────────────────────────────────────────────

  private async handleContact(chatId: string, contact: any) {
    let phone: string = contact.phone_number ?? '';
    if (!phone.startsWith('+')) phone = '+' + phone;

    try {
      const result = await this.smsService.send({ phone });
      this.userStates.set(chatId, { state: 'waiting_code', smsId: result.id, phone });

      const text =
        `✅ <b>SMS yuborildi!</b>\n\n` +
        `📱 Raqam: <code>${phone}</code>\n\n` +
        `🔢 SMS orqali kelgan 6 raqamli kodni kiriting:`;
      await this.sendMessage(chatId, text, { remove_keyboard: true });
    } catch (e: any) {
      this.logger.error(`handleContact sms.send error: ${e?.message}`);
      await this.reply(chatId, '❌ SMS yuborishda xatolik. Qayta /start yozing.');
    }
  }

  // ─── SMS code handler ────────────────────────────────────────────

  private async handleSmsCode(chatId: string, code: string) {
    const state = this.userStates.get(chatId);
    if (!state?.smsId) {
      return this.reply(chatId, '❌ Sessiya topilmadi. /start yozing.');
    }

    try {
      const result = await this.smsService.verify({
        id: state.smsId,
        code,
        chat_id: chatId,
        lang: 'uz',
      });

      this.userStates.delete(chatId);

      const token = result.access_token;
      const url = `${this.storeUrl}?token=${token}`;
      const user = result.user;
      const text =
        `✅ <b>Muvaffaqiyatli kirdingiz!</b>\n\n` +
        `👤 Raqam: ${user.phone}\n\n` +
        `🛒 Do'konga o'tish uchun tugmani bosing:`;

      await this.sendMessage(chatId, text, {
        inline_keyboard: [[
          { text: '🛒 Do\'konga o\'tish', web_app: { url } },
        ]],
      });
    } catch (e: any) {
      const msg = e?.message ?? '';
      if (msg.includes('noto\'g\'ri') || msg.includes('Kod')) {
        await this.reply(chatId, '❌ Kod noto\'g\'ri. Qayta kiriting yoki /start yozing.');
      } else if (msg.includes('muddati')) {
        this.userStates.delete(chatId);
        await this.reply(chatId, '⏰ Kod muddati tugagan. /start yozing.');
      } else {
        this.userStates.delete(chatId);
        await this.reply(chatId, '❌ Xatolik yuz berdi. /start yozing.');
      }
    }
  }

  // ─── Callback query (language) ───────────────────────────────────

  private async handleCallback(callbackQuery: any) {
    const chatId = String(callbackQuery.message?.chat?.id);
    const messageId: number = callbackQuery.message?.message_id;
    const data: string = callbackQuery.data ?? '';

    // Orders pagination: orders_0, orders_1, ...
    if (data.startsWith('orders_')) {
      const page = parseInt(data.split('_')[1], 10) || 0;
      const user = await this.prisma.user.findFirst({ where: { chat_id: chatId } });
      if (user) {
        const lang = user.lang ?? 'uz';
        const total = await this.prisma.order.count({ where: { user_id: user.id } });
        const totalPages = Math.ceil(total / this.ORDERS_PER_PAGE);
        const safePage = Math.max(0, Math.min(page, totalPages - 1));
        const orders = await this.prisma.order.findMany({
          where: { user_id: user.id },
          skip: safePage * this.ORDERS_PER_PAGE,
          take: this.ORDERS_PER_PAGE,
          orderBy: { createdt: 'desc' },
          include: { shop: { select: { name: true } } },
        });
        const { text, keyboard } = this.buildOrdersPage(orders, lang, safePage, totalPages, total);
        await this.editMessage(chatId, messageId, text, { inline_keyboard: keyboard });
      }
      await this.answerCallback(callbackQuery.id);
      return;
    }

    if (data === 'lang_uz' || data === 'lang_ru') {
      const lang = data.replace('lang_', '');
      const user = await this.prisma.user.findFirst({ where: { chat_id: chatId } });
      if (user) {
        await this.prisma.user.update({ where: { id: user.id }, data: { lang } });
      }
      const text =
        lang === 'ru'
          ? '✅ Язык изменён на <b>Русский</b> 🇷🇺'
          : '✅ Til <b>O\'zbek</b> ga o\'zgartirildi 🇺🇿';
      await this.reply(chatId, text);
      await this.answerCallback(callbackQuery.id);
    }
  }

  // ─── User notifications (called from OrderService) ───────────────

  async notifyUserNewOrder(order: any) {
    const chatId = order.user?.chat_id;
    if (!chatId) return;
    const lang = order.user?.lang ?? 'uz';
    const shop = order.shop;
    const deliveryType: string = order.delivery_type ?? '';
    const amount = (order.amount ?? 0).toLocaleString();

    if (deliveryType === 'MARKET') {
      // Olib ketish — do'kon manzili va lokatsiyasini yuborish
      const shopAddr = shop?.address ?? '—';
      const text = lang === 'ru'
        ? `✅ <b>Заказ #${order.id} принят!</b>\n🏪 Магазин: ${shop?.name ?? '—'}\n💰 Сумма: ${amount} сум\n\n🛒 <b>Самовывоз</b>\n📍 Адрес магазина: ${shopAddr}\n\nОтслеживайте статус через /orders`
        : `✅ <b>#${order.id} buyurtmangiz qabul qilindi!</b>\n🏪 Do'kon: ${shop?.name ?? '—'}\n💰 Summa: ${amount} so'm\n\n🛒 <b>Olib ketish</b>\n📍 Do'kon manzili: ${shopAddr}\n\n/orders orqali kuzating`;
      await this.reply(chatId, text);
      // Do'kon koordinatasi mavjud bo'lsa lokatsiya yuborish
      if (shop?.lat && shop?.lon) {
        await this.sendLocation(chatId, shop.lat, shop.lon);
      }
    } else {
      // Yetkazib berish (YANDEX / FIXED)
      const deliveryAddr = order.address ?? '—';
      const text = lang === 'ru'
        ? `✅ <b>Заказ #${order.id} принят!</b>\n🏪 Магазин: ${shop?.name ?? '—'}\n💰 Сумма: ${amount} сум\n\n🚚 <b>Доставка</b>\n📍 Адрес доставки: ${deliveryAddr}\n⏰ Доставим в течение 24 часов\n\nОтслеживайте статус через /orders`
        : `✅ <b>#${order.id} buyurtmangiz qabul qilindi!</b>\n🏪 Do'kon: ${shop?.name ?? '—'}\n💰 Summa: ${amount} so'm\n\n🚚 <b>Yetkazib berish</b>\n📍 Manzil: ${deliveryAddr}\n⏰ 24 soat ichida yetkaziladi\n\n/orders orqali kuzating`;
      await this.reply(chatId, text);
      // Buyurtma beruvchining koordinatasi mavjud bo'lsa lokatsiya yuborish
      if (order.lat && order.lon) {
        await this.sendLocation(chatId, order.lat, order.lon);
      }
    }
  }

  async notifyUserOrderFinished(order: any) {
    const chatId = await this.getChatIdByOrder(order);
    if (!chatId) return;
    const lang = await this.getUserLang(order);
    const text = lang === 'ru'
      ? `🏁 <b>Заказ #${order.id} завершён магазином.</b>\nДля подтверждения получения нажмите /orders`
      : `🏁 <b>#${order.id} buyurtmangiz do'kon tomonidan tugatildi.</b>\nQabul qilganingizni tasdiqlash uchun /orders`;
    await this.reply(chatId, text);
  }

  async notifyUserOrderConfirmed(order: any) {
    const chatId = await this.getChatIdByOrder(order);
    if (!chatId) return;
    const lang = await this.getUserLang(order);
    const text = lang === 'ru'
      ? `🎉 <b>Заказ #${order.id} подтверждён!</b>\nСпасибо за покупку в Diametr.uz`
      : `🎉 <b>#${order.id} buyurtmangiz tasdiqlandi!</b>\nDiametr.uz dan xarid qilganingiz uchun rahmat`;
    await this.reply(chatId, text);
  }

  async notifyUserOrderCanceled(order: any) {
    const chatId = await this.getChatIdByOrder(order);
    if (!chatId) return;
    const lang = await this.getUserLang(order);
    const text = lang === 'ru'
      ? `❌ <b>Заказ #${order.id} отменён.</b>\nЕсли у вас есть вопросы, свяжитесь с поддержкой.`
      : `❌ <b>#${order.id} buyurtmangiz bekor qilindi.</b>\nSavollaringiz bo'lsa, qo'llab-quvvatlash bilan bog'laning.`;
    await this.reply(chatId, text);
  }

  // ─── Private helpers ─────────────────────────────────────────────

  private async getChatIdByOrder(order: any): Promise<string | null> {
    if (order.user?.chat_id) return order.user.chat_id;
    if (!order.user_id) return null;
    const user = await this.prisma.user.findUnique({ where: { id: order.user_id } });
    return user?.chat_id ?? null;
  }

  private async getUserLang(order: any): Promise<string> {
    if (order.user?.lang) return order.user.lang;
    if (!order.user_id) return 'uz';
    const user = await this.prisma.user.findUnique({ where: { id: order.user_id } });
    return user?.lang ?? 'uz';
  }

  private async generateToken(user: any): Promise<string> {
    return this.jwtService.signAsync(
      { user_id: user.id, role: user.role, source: 'STORE_BOT' },
      { expiresIn: '2h' },
    );
  }

  private async sendLocation(chatId: string, lat: number, lon: number) {
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.token}/sendLocation`,
        { chat_id: chatId, latitude: lat, longitude: lon },
        { timeout: 8000 },
      );
    } catch (e: any) {
      this.logger.error(`store bot sendLocation error (chat ${chatId}): ${e?.message}`);
    }
  }

  private async answerCallback(callbackQueryId: string) {
    await axios.post(
      `https://api.telegram.org/bot${this.token}/answerCallbackQuery`,
      { callback_query_id: callbackQueryId },
      { timeout: 5000 },
    ).catch(() => {});
  }

  private async editMessage(chatId: string, messageId: number, text: string, replyMarkup?: any) {
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.token}/editMessageText`,
        {
          chat_id: chatId,
          message_id: messageId,
          text,
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        },
        { timeout: 8000 },
      );
    } catch (e: any) {
      this.logger.error(`store bot editMessage error (chat ${chatId}): ${e?.message}`);
    }
  }

  private async reply(chatId: string, text: string) {
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.token}/sendMessage`,
        { chat_id: chatId, text, parse_mode: 'HTML' },
        { timeout: 8000 },
      );
    } catch (e: any) {
      this.logger.error(`store bot reply error (chat ${chatId}): ${e?.message}`);
    }
  }

  private async sendMessage(chatId: string, text: string, replyMarkup: any) {
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.token}/sendMessage`,
        { chat_id: chatId, text, parse_mode: 'HTML', reply_markup: replyMarkup },
        { timeout: 8000 },
      );
    } catch (e: any) {
      this.logger.error(`store bot sendMessage error (chat ${chatId}): ${e?.message}`);
    }
  }
}
