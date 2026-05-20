import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checkin } from './checkin.entity';
import { CheckinGateway } from './checkin.gateway';

@Injectable()
export class CheckinService {
  constructor(
    @InjectRepository(Checkin)
    private readonly checkinRepository: Repository<Checkin>,
    private readonly checkinGateway: CheckinGateway,
  ) {}

  async create(
    name: string,
    message: string,
    photoPath: string,
  ): Promise<Checkin> {
    const checkin = this.checkinRepository.create({
      name,
      message,
      photoPath,
    });
    const saved = await this.checkinRepository.save(checkin);

    this.checkinGateway.broadcastNewCheckin({
      id: saved.id,
      name: saved.name,
      message: saved.message,
      photoUrl: `/uploads/${saved.photoPath}`,
    });

    return saved;
  }

  async getCount(): Promise<number> {
    return this.checkinRepository.count();
  }
}
