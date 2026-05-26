import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Repository } from 'typeorm';
import { Checkin } from './checkin.entity';
import { CheckinGateway } from './checkin.gateway';

const uploadsDir = join(process.cwd(), 'uploads');

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

  async findAll(): Promise<Checkin[]> {
    return this.checkinRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async resetAll(): Promise<void> {
    const checkins = await this.checkinRepository.find();

    await Promise.all(
      checkins.map(async (checkin) => {
        const filePath = join(uploadsDir, checkin.photoPath);
        if (existsSync(filePath)) {
          await unlink(filePath).catch(() => undefined);
        }
      }),
    );

    await this.checkinRepository.clear();
    this.checkinGateway.broadcastReset();
  }

  async deleteById(id: number): Promise<number> {
    const checkin = await this.checkinRepository.findOne({ where: { id } });
    if (!checkin) {
      throw new NotFoundException('Check-in not found');
    }

    const filePath = join(uploadsDir, checkin.photoPath);
    if (existsSync(filePath)) {
      await unlink(filePath).catch(() => undefined);
    }

    await this.checkinRepository.remove(checkin);
    const count = await this.getCount();
    this.checkinGateway.broadcastDeleteCheckin({ id, count });
    return count;
  }
}
