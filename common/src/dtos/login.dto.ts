import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'admin@be-aliant.com', description: 'E-mail cadastrado' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '123456', description: 'Senha do usuário' })
    @IsString()
    password: string;
}
