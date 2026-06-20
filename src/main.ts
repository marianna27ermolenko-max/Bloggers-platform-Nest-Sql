import { NestFactory } from '@nestjs/core';
import { appSetup } from './setup/app.setup';
import { initAppModule } from './init-app-module';
import { CoreConfig } from './core/core.config';

async function bootstrap() {
  // как бы вручную инжектим в инициализацию модуля нужную зависимость, донастраивая динамический модуль
  const DynamicAppModule = await initAppModule();

  // и уже потом создаём приложение на основе донастроенного модуля
  const app = await NestFactory.create(DynamicAppModule);

  const coreConfig = app.get<CoreConfig>(CoreConfig);

  appSetup(app, coreConfig.isSwaggerEnabled); // глобальные настройки приложения

  const port = coreConfig.port;

  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
    console.log('NODE_ENV: ', coreConfig.env);
  });
}

void bootstrap();
