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
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { ApiBasicAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { BasicAuthGuard } from '../../guard/basic/basic-auth.guard';
import { Public } from '../../guard/decorators/public.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../infrastructure/query/users-sql-query-repository';
import { UserViewSqlDtoAdmin } from './view-dto/users.view.sql-dto';
import { CreateUserCommand } from '../application/usecases/create-user.usecase';
import { DeleteCommand } from '../application/usecases/delete-user.usecase';

@Controller('sa/users')
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basicAuth')
@ApiTags('users')
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private usersSqlQueryRepository: UsersQueryRepository,
  ) {
    console.log('UsersController created');
  }

  @Public()
  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async getById(@Param('id') id: string): Promise<UserViewSqlDtoAdmin> {
    return this.usersSqlQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Public()
  @Get()
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewSqlDtoAdmin[]>> {
    return this.usersSqlQueryRepository.getUsers(query);
  }

  @ApiBody({ description: 'Create new post', type: CreateUserInputDto })
  @Post()
  async createUser(
    @Body() body: CreateUserInputDto,
  ): Promise<UserViewSqlDtoAdmin> {
    const { login, email, password } = body;
    const userId = await this.commandBus.execute(
      new CreateUserCommand(login, email, password),
    );
    return this.usersSqlQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @ApiParam({ name: 'id', type: String })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteCommand(id));
  }
}
