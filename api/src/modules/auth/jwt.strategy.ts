import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
    sub: string;
    email: string;
}

/**
 * Estratégia JWT do Passport.
 * Extrai e valida o Bearer token do header Authorization.
 * O resultado de validate() é injetado em request.user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload): Promise<{ id: string; email: string }> {
        return { id: payload.sub, email: payload.email };
    }
}
