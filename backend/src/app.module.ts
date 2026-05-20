import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CheckinModule } from './checkin/checkin.module';
import { Checkin } from './checkin/checkin.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'checkin.db',
      entities: [Checkin],
      synchronize: true,
    }),
    CheckinModule,
  ],
})
export class AppModule {}
