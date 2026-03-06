import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';

// Allowed admin Telegram user IDs (can be extended via env)
const ADMIN_IDS = (process.env.TELEGRAM_ADMIN_IDS ?? '')
  .split(',')
  .map((id) => Number(id.trim()))
  .filter(Boolean);

const BOT_COMMANDS = [
  { command: 'start',   description: '🚀 Botni ishga tushirish' },
  { command: 'help',    description: '📖 Yordam va buyruqlar' },
  { command: 'stats',   description: '📊 Bugungi statistika (admin)' },
  { command: 'orders',  description: '📦 So\'nggi 10 ta buyurtma (admin)' },
  { command: 'status',  description: '🔍 Buyurtma holati: /status 123' },
];

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private readonly token = process.env.TELEGRAM_BOT_TOKEN;
  private readonly chatId = process.env.TELEGRAM_CHAT_ID;
  private lastDailySummaryDate = '';

  constructor(private readonly prisma: PrismaClientService) {}

  // ─── Init ─────────────────────────────────────────────────────────
  async onModuleInit() {
    if (!this.token || !this.chatId) {
      this.logger.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — bot disabled');
      return;
    }

    // Register commands with BotFather
    await this.registerCommands();

    // Set webhook if BACKEND_URL is defined
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl) {
      await this.setWebhook(`${backendUrl}/telegram/webhook`);
    }

    // Check every minute for daily summary
    setInterval(() => this.checkDailySummary(), 60_000);
    this.logger.log('Telegram bot initialized ✅');
  }

  private async registerCommands() {
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.token}/setMyCommands`,
        { commands: BOT_COMMANDS },
        { timeout: 8000 },
      );
      this.logger.log('Bot commands registered ✅');
    } catch (e: any) {
      this.logger.error(`registerCommands error: ${e?.message}`);
    }
  }

  private async setWebhook(url: string) {
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.token}/setWebhook`,
        { url, drop_pending_updates: true },
        { timeout: 8000 },
      );
      this.logger.log(`Webhook set: ${url} ✅`);
    } catch (e: any) {
      this.logger.error(`setWebhook error: ${e?.message}`);
    }
  }

  // ─── Webhook update handler ───────────────────────────────────────
  async handleUpdate(update: any) {
    try {
      const message = update?.message ?? update?.edited_message;
      if (!message) return;

      const chatId = message.chat?.id;
      const userId = message.from?.id;
      const text: string = message.text ?? '';

      if (!text.startsWith('/')) return;

      const [rawCmd, ...args] = text.split(' ');
      const cmd = rawCmd.split('@')[0].toLowerCase(); // handle /cmd@BotUsername

      switch (cmd) {
        case '/start':
          await this.cmdStart(chatId);
          break;
        case '/help':
          await this.cmdHelp(chatId);
          break;
        case '/stats':
          await this.cmdStats(chatId, userId);
          break;
        case '/orders':
          await this.cmdOrders(chatId, userId);
          break;
        case '/status':
          await this.cmdStatus(chatId, userId, args[0]);
          break;
        default:
          await this.reply(chatId, '❓ Noma\'lum buyruq. /help orqali ro\'yxatni ko\'ring.');
      }
    } catch (e: any) {
      this.logger.error(`handleUpdate error: ${e?.message}`);
    }
  }

  // ─── Commands ─────────────────────────────────────────────────────

  private async cmdStart(chatId: number) {
    const text =
      `👋 <b>Diametr.uz botiga xush kelibsiz!</b>\n\n` +
      `🏗 Qurilish materiallari platformasining rasmiy yordamchisi.\n\n` +
      `<b>Nima qila olaman?</b>\n` +
      `📦 Buyurtmalar haqida bildirishnoma berish\n` +
      `📊 Kunlik statistika yuborish\n` +
      `🔍 Buyurtma holati tekshirish\n\n` +
      `Buyruqlar ro'yxati uchun /help yozing ⬇️`;
    await this.reply(chatId, text);
  }

  private async cmdHelp(chatId: number) {
    const lines = BOT_COMMANDS
      .map((c) => `/${c.command} — ${c.description}`)
      .join('\n');
    const text = `📖 <b>Buyruqlar ro'yxati:</b>\n\n${lines}`;
    await this.reply(chatId, text);
  }

  private async cmdStats(chatId: number, userId: number) {
    if (!this.isAdmin(userId)) {
      return this.reply(chatId, '🚫 Faqat adminlar uchun!');
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const uztMidnight = new Date(todayStart.getTime() - 5 * 60 * 60 * 1000);

    const [orders, users, shops] = await Promise.all([
      this.prisma.order.findMany({
        where: { createdt: { gte: uztMidnight } },
        select: { status: true, amount: true },
      }),
      this.prisma.user.count(),
      this.prisma.shop.count({ where: { work_status: 'WORKING' } }),
    ]);

    const total = orders.reduce((s, o) => s + (o.amount ?? 0), 0);
    const statusMap: Record<string, string> = {
      STARTED: '🟡 Yangi',
      FINISHED: '🔵 Tasdiqlandi',
      CONFIRMED: '✅ Yetkazildi',
      CANCELED: '❌ Bekor',
    };
    const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {});

    const statusLines = Object.entries(byStatus)
      .map(([s, c]) => `  ${statusMap[s] ?? s}: ${c} ta`)
      .join('\n') || '  — buyurtma yo\'q';

    const today = new Date().toLocaleDateString('uz-UZ', { timeZone: 'Asia/Tashkent' });
    const text =
      `📊 <b>Bugungi statistika</b> (${today})\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `📦 Buyurtmalar: <b>${orders.length} ta</b>\n` +
      `💰 Jami summa: <b>${total.toLocaleString()} so'm</b>\n\n` +
      `📋 Holat bo'yicha:\n${statusLines}\n\n` +
      `👥 Jami foydalanuvchilar: <b>${users}</b>\n` +
      `🏪 Faol do'konlar: <b>${shops}</b>`;

    await this.reply(chatId, text);
  }

  private async cmdOrders(chatId: number, userId: number) {
    if (!this.isAdmin(userId)) {
      return this.reply(chatId, '🚫 Faqat adminlar uchun!');
    }

    const orders = await this.prisma.order.findMany({
      take: 10,
      orderBy: { createdt: 'desc' },
      include: { shop: { select: { name: true } } },
    });

    if (!orders.length) {
      return this.reply(chatId, '📭 Hali buyurtmalar yo\'q.');
    }

    const statusEmoji: Record<string, string> = {
      STARTED: '🟡', FINISHED: '🔵', CONFIRMED: '✅', CANCELED: '❌',
    };

    const lines = orders
      .map((o) => {
        const emoji = statusEmoji[o.status] ?? '⚪';
        const amount = (o.amount ?? 0).toLocaleString();
        const shop = o.shop?.name ?? '—';
        return `${emoji} #${o.id} | ${shop} | ${amount} so'm`;
      })
      .join('\n');

    await this.reply(chatId, `📦 <b>So'nggi 10 ta buyurtma:</b>\n\n${lines}`);
  }

  private async cmdStatus(chatId: number, userId: number, idArg?: string) {
    const orderId = Number(idArg);
    if (!orderId || isNaN(orderId)) {
      return this.reply(chatId, '❗ Buyurtma ID kiriting:\n<code>/status 123</code>');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { shop: { select: { name: true } } },
    });

    if (!order) {
      return this.reply(chatId, `❌ #${orderId} raqamli buyurtma topilmadi.`);
    }

    const statusMap: Record<string, string> = {
      STARTED: '🟡 Yangi — ko\'rib chiqilmoqda',
      FINISHED: '🔵 Tasdiqlandi — yetkazishga tayyor',
      CONFIRMED: '✅ Yetkazildi — yakunlangan',
      CANCELED: '❌ Bekor qilindi',
    };

    const created = order.createdt
      ? new Date(order.createdt).toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })
      : '—';

    const text =
      `🔍 <b>Buyurtma #${order.id}</b>\n` +
      `━━━━━━━━━━━━━━━━━\n` +
      `🏪 Do'kon: ${order.shop?.name ?? '—'}\n` +
      `📍 Manzil: ${order.address ?? '—'}\n` +
      `💰 Summa: <b>${(order.amount ?? 0).toLocaleString()} so'm</b>\n` +
      `📅 Sana: ${created}\n\n` +
      `📌 Holat: ${statusMap[order.status] ?? order.status}`;

    await this.reply(chatId, text);
  }

  // ─── Daily cron: 20:00 UZT ───────────────────────────────────────

  private async checkDailySummary() {
    try {
      // UZT = UTC+5
      const now = new Date();
      const uztHour = (now.getUTCHours() + 5) % 24;
      const uztMin = now.getUTCMinutes();
      const today = now.toISOString().slice(0, 10);

      if (uztHour === 20 && uztMin < 5 && this.lastDailySummaryDate !== today) {
        this.lastDailySummaryDate = today;
        await this.sendDailySummary();
      }
    } catch (e) {
      this.logger.error('checkDailySummary error', e);
    }
  }

  private async sendDailySummary() {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    // UZT midnight = UTC 19:00 prev day
    const uztMidnight = new Date(todayStart.getTime() - 5 * 60 * 60 * 1000);

    const orders = await this.prisma.order.findMany({
      where: {
        createdt: { gte: uztMidnight },
        work_status: 'WORKING',
      },
      include: { shop: { select: { name: true } } },
    });

    if (orders.length === 0) return;

    const total = orders.reduce((s, o) => s + (o.amount ?? 0), 0);
    const statusMap: Record<string, string> = {
      STARTED: '🟡 Yangi',
      FINISHED: '🔵 Tasdiqlandi',
      CONFIRMED: '✅ Yetkazildi',
      CANCELED: '❌ Bekor',
    };

    const byStatus: Record<string, number> = {};
    for (const o of orders) {
      byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
    }

    const statusLines = Object.entries(byStatus)
      .map(([s, c]) => `${statusMap[s] ?? s}: ${c} ta`)
      .join('\n');

    const msg =
      `📊 <b>Kunlik hisobot</b>\n` +
      `📅 ${new Date().toLocaleDateString('uz-UZ', { timeZone: 'Asia/Tashkent' })}\n\n` +
      `📦 Jami buyurtmalar: <b>${orders.length} ta</b>\n` +
      `💰 Jami summa: <b>${total.toLocaleString()} so'm</b>\n\n` +
      `${statusLines}`;

    await this.send(msg);
  }

  // ─── Public methods ───────────────────────────────────────────────

  async notifyNewOrder(order: any) {
    if (!this.isEnabled()) return;

    const products = order.products
      ?.map((p: any) => {
        const name = p.shop_product?.product_item?.product?.name ?? '—';
        const item = p.shop_product?.product_item?.name ?? '';
        return `  • ${name} (${item}) x${p.count} — ${(p.amount ?? 0).toLocaleString()} so'm`;
      })
      .join('\n') ?? '';

    const discount =
      order.discount_amount
        ? `\n🏷 Chegirma: -${order.discount_amount.toLocaleString()} so'm (${order.discount_percent}%)`
        : '';

    const msg =
      `🛍 <b>Yangi buyurtma #${order.id}</b>\n\n` +
      `🏪 Do'kon: ${order.shop?.name ?? '—'}\n` +
      `📍 Manzil: ${order.address ?? '—'}\n` +
      `💳 To'lov: ${this.payLabel(order.payment_type)}\n` +
      `🚚 Yetkazish: ${this.deliveryLabel(order.delivery_type)}\n\n` +
      `📦 Mahsulotlar:\n${products}` +
      `${discount}\n\n` +
      `💰 <b>Jami: ${(order.amount ?? 0).toLocaleString()} so'm</b>`;

    await this.send(msg);
  }

  async notifyOrderFinished(orderId: number) {
    if (!this.isEnabled()) return;
    await this.send(
      `🔵 <b>Buyurtma #${orderId} tasdiqlandi</b>\n` +
      `Do'kon tasdiqladi — yetkazishga tayyor ✅`
    );
  }

  async notifyOrderConfirmed(orderId: number) {
    if (!this.isEnabled()) return;
    await this.send(
      `✅ <b>Buyurtma #${orderId} yetkazildi!</b>\n` +
      `Mijoz mahsulotlarni qabul qildi 🎉`
    );
  }

  async notifyOrderCanceled(orderId: number, reason?: string) {
    if (!this.isEnabled()) return;
    await this.send(
      `❌ <b>Buyurtma #${orderId} bekor qilindi</b>` +
      (reason ? `\nSabab: ${reason}` : '')
    );
  }

  // ─── Helpers ──────────────────────────────────────────────────────

  private isEnabled() {
    return !!(this.token && this.chatId);
  }

  private isAdmin(userId: number): boolean {
    // Always allow if no admin IDs are configured (fallback: only main chat)
    if (ADMIN_IDS.length === 0) return String(userId) === String(this.chatId);
    return ADMIN_IDS.includes(userId);
  }

  /** Reply to a specific chat (used by command handlers) */
  private async reply(chatId: number, text: string) {
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.token}/sendMessage`,
        { chat_id: chatId, text, parse_mode: 'HTML' },
        { timeout: 8000 },
      );
    } catch (e: any) {
      this.logger.error(`Telegram reply error: ${e?.message}`);
    }
  }

  private payLabel(type?: string | null) {
    const map: Record<string, string> = {
      cash: '💵 Naqd',
      payme: '💙 Payme',
      click: '🟠 Click',
      uzum: '🟣 Uzum',
    };
    return map[type ?? ''] ?? type ?? '—';
  }

  private deliveryLabel(type?: string | null) {
    const map: Record<string, string> = {
      MARKET: '🛒 Market yetkazma',
      YANDEX: '🚕 Yandex Deliver',
      FIXED: '📦 Belgilangan narx',
    };
    return map[type ?? ''] ?? type ?? '—';
  }

  private async send(text: string) {
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.token}/sendMessage`,
        { chat_id: this.chatId, text, parse_mode: 'HTML' },
        { timeout: 8000 },
      );
    } catch (e: any) {
      this.logger.error(`Telegram send error: ${e?.message}`);
    }
  }
}
