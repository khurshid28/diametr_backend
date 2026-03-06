import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { PrismaClientService } from 'src/_prisma_client/prisma_client.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private readonly token = process.env.TELEGRAM_BOT_TOKEN;
  private readonly chatId = process.env.TELEGRAM_CHAT_ID;
  private lastDailySummaryDate = '';

  constructor(private readonly prisma: PrismaClientService) {}

  // ─── Daily cron: 20:00 UZT (15:00 UTC) ──────────────────────────
  onModuleInit() {
    if (!this.token || !this.chatId) {
      this.logger.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set — bot disabled');
      return;
    }

    // Check every minute
    setInterval(() => this.checkDailySummary(), 60_000);
    this.logger.log('Telegram bot initialized ✅');
  }

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
