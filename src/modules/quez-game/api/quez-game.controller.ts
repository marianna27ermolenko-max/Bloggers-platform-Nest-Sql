import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAccessAuthGuard } from 'src/modules/user-accounts/guard/bearer/jwt.access-auth.guard';
import { ExtractUserFromRequest } from 'src/modules/user-accounts/guard/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from 'src/modules/user-accounts/guard/dto/user-context.dto';
import { AnswerInputModel } from '../dto/quez-game/create-answer.input.dto';
import { AnswerViewModel } from './view-dto/answer.view.model';
import { GamePairViewModel } from './view-dto/game.pair.view.model';
import { ConnectionGameCommand } from '../application/usecases/game/create-connection.game.usecase';
import { CreateAnswersCommand } from '../application/usecases/game/create-answer.usecase';
import { GetMyCurrentGameQuery } from '../application/queries/getMyCurrent-game.query';
import { GetGamesByIdQuery } from '../application/queries/geGame.by.id-query';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view-dto';
import { CurrentAndFinishedGameByUserIdQuery } from '../application/queries/getMyCurrentAndFinishedGame-query';
import { GetGameQueryParams } from './input-dto/get-myGame-query.params';
import { MyStatisticViewModel } from './view-dto/my.statistic.view.model';
import { MyStatisticQuery } from '../application/queries/getMyStatistic.query';
import { UsersTopViewModel } from './view-dto/users.top.view.model';
import { GetUsersTopInputModel } from './input-dto/get-users-top.input-dto';
import { GetUsersTopQuery } from '../application/queries/getUsersTop.query';

@Controller('pair-game-quiz')
export class QuizGameController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {
    console.log('QuezGameController created');
  }

  @Get('/pairs/my')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessAuthGuard)
  async getMyGame(
    @ExtractUserFromRequest() user: UserContextDto,
    @Query() query: GetGameQueryParams,
  ): Promise<PaginatedViewDto<GamePairViewModel[]>> {
    return this.queryBus.execute(
      new CurrentAndFinishedGameByUserIdQuery(user.id, query),
    );
  }

  @Get('/users/top')
  @HttpCode(HttpStatus.OK)
  async getUsersTop(
    @Query() query: GetUsersTopInputModel,
  ): Promise<PaginatedViewDto<UsersTopViewModel[]>> {
    return this.queryBus.execute(new GetUsersTopQuery(query));
  }

  @Get('/users/my-statistic')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessAuthGuard)
  async getUserStatistic(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<MyStatisticViewModel> {
    return this.queryBus.execute(new MyStatisticQuery(user.id));
  }

  @Get('/pairs/my-current')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessAuthGuard)
  async getMyCurrentGame(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GamePairViewModel> {
    return this.queryBus.execute(new GetMyCurrentGameQuery(user.id));
  }

  @Get('/pairs/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessAuthGuard)
  async getGameById(
    @Param('id', ParseUUIDPipe) id: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GamePairViewModel> {
    return this.queryBus.execute(new GetGamesByIdQuery(id, user.id));
  }

  @Post('/pairs/connection')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessAuthGuard)
  async connectGame(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<GamePairViewModel> {
    return this.commandBus.execute(new ConnectionGameCommand(user.id));
  }

  @Post('/pairs/my-current/answers')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessAuthGuard)
  async sendAnswer(
    @ExtractUserFromRequest() user: UserContextDto,
    @Body() body: AnswerInputModel,
  ): Promise<AnswerViewModel> {
    return this.commandBus.execute(
      new CreateAnswersCommand(user.id, body.answer),
    );
  }
}
