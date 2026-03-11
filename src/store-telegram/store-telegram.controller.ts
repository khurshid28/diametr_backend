import { Controller, Post, Body, Logger } from '@nestjs/common';
import { StoreTelegramService } from './store-telegram.service';

@Controller('store')
export class StoreTelegramController {
  private readonly logger = new Logger(StoreTelegramController.name);

  constructor(private readonly storeTelegram: StoreTelegramService) {}

  @Post('webhook')
  async handleWebhook(@Body() update: any) {
    try {
      await this.storeTelegram.handleUpdate(update);
    } catch (e: any) {
      this.logger.error(`webhook error: ${e?.message}`);
    }
    return { ok: true };
  }
}
