import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * UpdateUserDto: todos os campos de CreateUserDto são opcionais.
 * Permite atualização parcial sem reenviar campos não alterados.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) { }
