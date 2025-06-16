import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './account/account.module';
import { CategoryModule } from './category/category.module';
import { TransactionModule } from './transaction/transaction.module';
import { StatisticsModule } from './statistics/statistics.module';
import { DestinataireModule } from './destinataire/destinataire.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    UserModule,
    AuthModule,
    AccountModule,
    CategoryModule,
    TransactionModule,
    StatisticsModule,
    DestinataireModule,
  ],
})
export class AppModule {}
