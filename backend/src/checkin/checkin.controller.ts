import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { CheckinService } from './checkin.service';
import {
  containsProfanityInFields,
  PROFANITY_ERROR_CODE,
} from './profanity.utils';

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
      limits: { fileSize: 15 * 1024 * 1024 },
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

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (
      containsProfanityInFields({
        name: trimmedName,
        message: trimmedMessage,
      })
    ) {
      throw new BadRequestException(PROFANITY_ERROR_CODE);
    }

    const checkin = await this.checkinService.create(
      trimmedName,
      trimmedMessage,
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

  @Get()
  async findAll() {
    const checkins = await this.checkinService.findAll();
    return checkins.map((c) => ({
      id: c.id,
      name: c.name,
      message: c.message,
      photoUrl: `/uploads/${c.photoPath}`,
      createdAt: c.createdAt,
    }));
  }

  @Delete(':id')
  async deleteOne(@Param('id', ParseIntPipe) id: number) {
    const count = await this.checkinService.deleteById(id);
    return { success: true, id, count };
  }

  @Delete()
  async resetAll() {
    await this.checkinService.resetAll();
    return { success: true };
  }
}
