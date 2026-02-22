import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    // Endpoint de health check — confirma que a API está no ar
    @Get('health')
    health(): { status: string; timestamp: string } {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
}
