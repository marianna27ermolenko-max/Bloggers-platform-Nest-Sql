import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../application/user-service';
import { UserViewDtoAdmin } from './view-dto/users.view-dto';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { ApiBasicAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { BasicAuthGuard } from '../../guard/basic/basic-auth.guard';
import { Public } from '../../guard/decorators/public.decorator';
import { CommandBus } from '@nestjs/cqrs';

@Controller('users')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basicAuth')
@ApiTags('users')
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
  ) {
    console.log('UsersController created');
  }

  @Public()
  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserViewDtoAdmin> {
    return this.usersQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Public()
  @Get()
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDtoAdmin[]>> {
    return this.usersQueryRepository.getAll(query);
  }

  @ApiBody({ description: 'Create new post', type: CreateUserInputDto })
  @Post()
  async createUser(
    @Body() body: CreateUserInputDto,
  ): Promise<UserViewDtoAdmin> {
    const userId = await this.usersService.createUser(body);
    return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.usersService.deleteUser(id);
  }
}
