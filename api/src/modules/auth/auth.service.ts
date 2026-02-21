import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from '@be-aliant/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async login(loginDto: LoginDto): Promise<{ access_token: string }> {
        const user = await this.usersService.findByEmail(loginDto.email);

        // Valida existência do usuário e correspondência de senha em uma única mensagem
        // genérica para não expor se o email existe ou não (security best practice)
        if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
