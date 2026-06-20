import { pipesSetup } from './pipes.setup';
import { INestApplication } from '@nestjs/common';
// import { globalPrefixSetup } from './global-prefix.setup';
import { swaggerSetup } from './swagger.setup';
import cookieParser from 'cookie-parser';
import { Express } from 'express';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  pipesSetup(app);
  // globalPrefixSetup(app);
  swaggerSetup(app, isSwaggerEnabled);

  app.use(cookieParser());

  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.set('trust proxy', true);
}
