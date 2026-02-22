import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from '@be-aliant/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * POST /users – cadastro público (sem autenticação)
     */
    @ApiOperation({ summary: 'Criar novo usuário (público)' })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    /**
     * PUT /users/:id – atualização protegida por JWT
     */
    @ApiOperation({ summary: 'Atualizar dados do usuário (requer JWT)' })
    @ApiBearerAuth()
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto);
    }
}
