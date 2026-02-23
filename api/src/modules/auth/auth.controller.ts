import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from '@be-aliant/common';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * POST /login – autenticação pública
     * Retorna: { access_token: string }
     */
    @ApiOperation({ summary: 'Autenticar usuário e obter token JWT' })
    @Post('login')
    @HttpCode(HttpStatus.OK)
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}
