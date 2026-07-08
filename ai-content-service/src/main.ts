import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS globally
  app.enableCors({
    origin: '*', // For production, replace '*' with your frontend URL like 'https://myfrontend.com'
    methods: 'GET,HEAD,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
