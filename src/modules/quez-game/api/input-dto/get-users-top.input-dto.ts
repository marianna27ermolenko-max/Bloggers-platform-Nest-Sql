import { IsOptional } from 'class-validator';
import { BaseQueryParams } from 'src/core/dto/base.query-params.input-dto';

export enum UsersTopSort {
  avgScores = 'avgScores',
  sumScore = 'sumScore',
  winsCount = 'winsCount',
  lossesCount = 'lossesCount',
}

export type UsersTopSortParam = {
  field: UsersTopSort;
  direction: 'asc' | 'desc';
};

export class GetUsersTopInputModel extends BaseQueryParams {
  @IsOptional()
  sort?: string | string[];

  getSortParams(): UsersTopSortParam[] {
    const sortArray = !this.sort
      ? ['avgScores desc', 'sumScore desc']
      : Array.isArray(this.sort)
        ? this.sort
        : [this.sort];

    return sortArray.map((sortItem) => {
      const [field, direction] = sortItem.trim().split(/\s+/);

      return {
        field: field as UsersTopSort,
        direction: direction as 'asc' | 'desc',
      };
    });
  }
}
