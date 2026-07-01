import { configModule } from './config-dynamic-module';
import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { CoreModule } from './core/core.module';
import { TestingModule } from './modules/testing/testing.module';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';
import { ThrottlerModule } from '@nestjs/throttler';
import { CoreConfig } from './core/core.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    configModule,
    CoreModule,
    MongooseModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => {
        const uri = coreConfig.mongoURI;
        console.log('DB_URI', uri);

        return {
          uri: uri,
        };
      },
      inject: [CoreConfig],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: Number(process.env.SQL_PORT) || 5432,
      username: process.env.SQL_USERNAME,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_NAME_DATABES,
      autoLoadEntities: false,
      synchronize: false,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 10000,
          limit: 5,
        },
      ],
    }),
    UserAccountsModule,
    BloggersPlatformModule,
    TestingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    //регистрация глобальных exception filters
    //важен порядок регистрации! Первым сработает DomainHttpExceptionsFilter!
    { provide: APP_FILTER, useClass: AllHttpExceptionsFilter },
    { provide: APP_FILTER, useClass: DomainHttpExceptionsFilter },
  ],
})
export class AppModule {
  static forRoot(coreConfig: CoreConfig): DynamicModule {
    // такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль.
    // чтобы не обращаться в декораторе к переменной окружения через process.env в декораторе, потому что
    // запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS

    return {
      module: AppModule,
      imports: [...(coreConfig.includeTestingModule ? [TestingModule] : [])], // Add dynamic modules here
    };
  }
}
