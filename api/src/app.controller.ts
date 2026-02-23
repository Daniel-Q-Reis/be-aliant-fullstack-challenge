import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
    // Endpoint de health check — confirma que a API está no ar
    @ApiOperation({ summary: 'Verifica se a API está no ar' })
    @Get('health')
    health(): { status: string; timestamp: string } {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
}
