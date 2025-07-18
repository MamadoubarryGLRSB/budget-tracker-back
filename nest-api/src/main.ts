import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  try {
    const app: INestApplication = await NestFactory.create(AppModule);

    // CORS
    app.enableCors();

    // Swagger
    const config = new DocumentBuilder()
      .setTitle('Budget Tracker API')
      .setDescription('The Budget Tracker API description')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter JWT token',
          in: 'header',
        },
        'access-token',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    
    console.log(`🚀 Application is running on port ${port}`);
    console.log(`📚 Documentation: https://your-app.railway.app/api`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
