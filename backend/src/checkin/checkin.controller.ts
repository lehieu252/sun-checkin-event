import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { CheckinService } from './checkin.service';

const uploadsDir = join(process.cwd(), 'uploads');

if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

@Controller('checkins')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname) || '.jpg';
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(new BadRequestException('Only image files are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @Body('message') message: string,
  ) {
    if (!name?.trim()) {
      throw new BadRequestException('Name is required');
    }
    if (!message?.trim()) {
      throw new BadRequestException('Message is required');
    }
    if (!file) {
      throw new BadRequestException('Photo is required');
    }

    const checkin = await this.checkinService.create(
      name.trim(),
      message.trim(),
      file.filename,
    );

    return {
      id: checkin.id,
      name: checkin.name,
      message: checkin.message,
      photoUrl: `/uploads/${checkin.photoPath}`,
    };
  }

  @Get('count')
  async getCount() {
    const count = await this.checkinService.getCount();
    return { count };
  }
}
