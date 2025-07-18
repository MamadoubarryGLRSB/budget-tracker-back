import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  try {
    console.log('Starting NestJS application...');
    
    const app: INestApplication = await NestFactory.create(AppModule);
    console.log('NestJS app created successfully');

    // Permettre CORS si nécessaire
    app.enableCors();
    console.log('CORS enabled');

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

    console.log('Swagger config created');

    const document = SwaggerModule.createDocument(app, config);
    console.log('Swagger document generated');

    // Options supplémentaires pour SwaggerUI
    const customOptions = {
      swaggerOptions: {
        persistAuthorization: true,
      },
    };

    SwaggerModule.setup('api', app, document, customOptions);
    console.log('Swagger UI setup complete');

    const port = process.env.PORT || 3000;
    console.log(`Environment PORT: ${process.env.PORT}`);
    console.log(`Attempting to listen on port: ${port}`);
    
    await app.listen(port, '0.0.0.0');
    console.log(`NestJS application is running on port ${port}`);
    console.log(`Swagger documentation available at: http://localhost:${port}/api`);
  } catch (error) {
    console.error('Failed to start application:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

bootstrap();
