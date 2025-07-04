import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  check(): string {
    return 'Mahad test server is working !!!\n';
  }
}
