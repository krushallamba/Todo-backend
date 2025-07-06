import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();


  console.log("backned is at port:", process.env.PORT ?? 3001)

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
