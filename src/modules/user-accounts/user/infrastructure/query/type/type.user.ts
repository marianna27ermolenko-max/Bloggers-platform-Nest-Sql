export type UserDbSqlViewModel = {
  id: number;
  login: string;
  email: string;
  createdAt: Date;
};

export type UserRow = {
  id: number;
  login: string;
  email: string;
  createdAt: string;
};
