import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  const app: INestApplication = await NestFactory.create(AppModule);

  // Permettre CORS si nécessaire
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Budget Tracker API')
    .setDescription('The Budget Tracker API description')
    .setVersion('0.1')
    // Assurez-vous que le nom correspond exactement à celui utilisé dans vos contrôleurs
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token', // Ce nom doit correspondre à celui utilisé dans @ApiBearerAuth()
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Options supplémentaires pour SwaggerUI
  const customOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };

  SwaggerModule.setup('api', app, document, customOptions);

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
