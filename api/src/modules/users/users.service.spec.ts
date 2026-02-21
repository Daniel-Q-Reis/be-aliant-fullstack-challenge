import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from '@be-aliant/common';
import { UsersService } from './users.service';

describe('UsersService', () => {
    let service: UsersService;

    const mockRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(UserEntity),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('deve criar um usuário com senha hasheada', async () => {
            const dto = { name: 'Daniel', email: 'daniel@test.com', password: 'secret123' };

            mockRepository.findOne.mockResolvedValue(null);
            mockRepository.create.mockReturnValue({ ...dto });
            mockRepository.save.mockResolvedValue({ id: 'uuid-1', ...dto, password: 'hashed' });

            const hashSpy = jest.spyOn(bcrypt, 'hash');
            await service.create(dto);

            expect(hashSpy).toHaveBeenCalledWith('secret123', 10);
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('deve lançar ConflictException se o email já existir', async () => {
            mockRepository.findOne.mockResolvedValue({ id: 'uuid-1', email: 'daniel@test.com' });

            await expect(
                service.create({ name: 'Daniel', email: 'daniel@test.com', password: 'secret123' }),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('update', () => {
        it('deve lançar NotFoundException se o usuário não existir', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update('id-inexistente', { name: 'Novo' })).rejects.toThrow(
                NotFoundException,
            );
        });

        it('deve re-hashear a senha se for fornecida', async () => {
            const existingUser = { id: 'uuid-1', name: 'Daniel', password: 'oldhash' };
            mockRepository.findOne.mockResolvedValue(existingUser);
            mockRepository.save.mockResolvedValue({ ...existingUser, password: 'newhash' });

            const hashSpy = jest.spyOn(bcrypt, 'hash');
            await service.update('uuid-1', { password: 'novasenha' });

            expect(hashSpy).toHaveBeenCalledWith('novasenha', 10);
        });
    });
});
