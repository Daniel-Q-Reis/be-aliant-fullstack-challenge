import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
    let service: AuthService;

    const mockUsersService = {
        findByEmail: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mock.jwt.token'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('deve retornar access_token em login válido', async () => {
            const hashedPassword = await bcrypt.hash('secret123', 10);
            mockUsersService.findByEmail.mockResolvedValue({
                id: 'uuid-1',
                email: 'daniel@test.com',
                password: hashedPassword,
            });

            const result = await service.login({
                email: 'daniel@test.com',
                password: 'secret123',
            });

            expect(result).toHaveProperty('access_token');
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: 'uuid-1',
                email: 'daniel@test.com',
            });
        });

        it('deve lançar UnauthorizedException em senha incorreta', async () => {
            const hashedPassword = await bcrypt.hash('senhaCorreta', 10);
            mockUsersService.findByEmail.mockResolvedValue({
                id: 'uuid-1',
                email: 'daniel@test.com',
                password: hashedPassword,
            });

            await expect(
                service.login({ email: 'daniel@test.com', password: 'senhaErrada' }),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('deve lançar UnauthorizedException se o usuário não existir', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);

            await expect(
                service.login({ email: 'naoexiste@test.com', password: 'qualquer' }),
            ).rejects.toThrow(UnauthorizedException);
        });
    });
});
