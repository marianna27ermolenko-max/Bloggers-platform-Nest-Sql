import { IsEnum, IsOptional } from 'class-validator';
import { BaseQueryParams } from 'src/core/dto/base.query-params.input-dto';

export enum GameSortBy {
  pairCreatedDate = 'pairCreatedDate',
  status = 'status',
  startGameDate = 'startGameDate',
  finishGameDate = 'finishGameDate',
}

export class GetGameQueryParams extends BaseQueryParams {
  @IsEnum(GameSortBy)
  @IsOptional()
  sortBy: GameSortBy = GameSortBy.pairCreatedDate;
}
