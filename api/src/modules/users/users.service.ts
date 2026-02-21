import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserEntity, CreateUserDto, UpdateUserDto } from '@be-aliant/common';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly usersRepository: Repository<UserEntity>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<UserEntity> {
        const exists = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        });

        if (exists) {
            throw new ConflictException('Email already in use');
        }

        // Hash da senha antes de persistir – nunca armazenar senha em plaintext
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });

        return this.usersRepository.save(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
        const user = await this.usersRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Re-hash da senha somente se o campo for fornecido na atualização
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        Object.assign(user, updateUserDto);
        return this.usersRepository.save(user);
    }

    /**
     * Método interno – não exposto via HTTP.
     * Usado pelo AuthService para validar credenciais de login.
     */
    async findByEmail(email: string): Promise<UserEntity | null> {
        return this.usersRepository.findOne({ where: { email } });
    }
}
