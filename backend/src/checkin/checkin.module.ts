import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Checkin } from './checkin.entity';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';
import { CheckinGateway } from './checkin.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Checkin])],
  controllers: [CheckinController],
  providers: [CheckinService, CheckinGateway],
})
export class CheckinModule {}
