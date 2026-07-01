export enum UsersSortBy {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}

export const usersSortMap: Record<UsersSortBy, string> = {
  [UsersSortBy.CreatedAt]: 'created_at',
  [UsersSortBy.Login]: 'login',
  [UsersSortBy.Email]: 'email',
};

// export const textFields = new Set(['login', 'email']);
