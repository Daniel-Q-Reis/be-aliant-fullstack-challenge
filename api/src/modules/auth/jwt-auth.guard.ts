import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard JWT reutilizável.
 * Aplicado nos controllers protegidos via @UseGuards(JwtAuthGuard).
 * O AuthModule exporta este guard para que outros módulos não precisem
 * importar @nestjs/passport diretamente.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') { }
