import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request, @Body() data: LoginDto) {
    return await this.authService.login(data);
  }
}
