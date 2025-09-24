import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // all endpoints start with /api
  app.enableCors(); // allows the frontend to call the backend in dev
  await app.listen(3000); // backend runs on http://localhost:3000
}
bootstrap();
