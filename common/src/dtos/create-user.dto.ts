import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'Daniel', description: 'Nome completo do usuário' })
    @IsString()
    @MinLength(2)
    name: string;

    @ApiProperty({ example: 'daniel@teste.com', description: 'E-mail único do usuário' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '123456', description: 'Senha mínima de 6 caracteres' })
    @IsString()
    @MinLength(6)
    password: string;
}
