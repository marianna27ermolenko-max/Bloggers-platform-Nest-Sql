// import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import 'dotenv/config';

// config();

export default new DataSource({
  url: process.env.SQL_URI,
  type: 'postgres',
  migrations: ['migrations/*.ts'],
  entities: ['src/**/*.entity.ts'], //'src/**/*.entity.ts' //Blog, Post, Comment
});

console.log('SQL_URL:', process.env.SQL_URI);
