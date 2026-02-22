import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // CORS habilitado – origins restritas via variável de ambiente em produção
    app.enableCors();

    // Validação global: rejeita campos não mapeados nos DTOs e transforma tipos automaticamente
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Filtro global: padroniza todas as respostas de erro em { statusCode, message, error }
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Interceptor de logging: registra método + path + status + tempo de resposta
    app.useGlobalInterceptors(
        new LoggingInterceptor(),
        // ClassSerializerInterceptor ativa @Exclude() nas entidades na serialização HTTP
        new ClassSerializerInterceptor(app.get(Reflector)),
    );

    // Documentação interativa OpenAPI — disponível em /api/docs
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Be.Aliant API')
        .setDescription('API de Gestão de Pedidos e Usuários')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT ?? 3000;
    await app.listen(port);
}

bootstrap();

