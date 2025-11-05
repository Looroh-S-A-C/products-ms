import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';
import {
  CreateTranslationDto,
  UpdateTranslationDto,
  DeleteTranslationDto,
} from './dtos';
import { TranslationEntityType } from './enums/translation-entity-type.enum';

@Injectable()
export class TranslationsService extends PrismaClient {
  private readonly logger = new Logger(TranslationsService.name);

  /**
   * Create a new translation
   */
  async create(createTranslationDto: CreateTranslationDto) {
    return await this.translation.create({
      data: createTranslationDto,
    });
  }

  /**
   * Find all translations for a specific entity
   */
  async findAllByEntity(entityType: TranslationEntityType, entityId: string) {
    const where: any = { [entityType]: entityId };
    return await this.translation.findMany({
      where,
    });
  }

  /**
   * Find one translation by ID
   */
  async findOne(id: string) {
    const translation = await this.translation.findUnique({
      where: { id },
    });
    if (!translation) {
      throw new NotFoundException({
        message: `Translation with id ${id} not found`,
      });
    }
    return translation;
  }

  /**
   * Update a translation
   */
  async update(updateTranslationDto: UpdateTranslationDto) {
    const { id, ...data } = updateTranslationDto;
    await this.findOne(id);
    return this.translation.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a translation
   */
  async delete(deleteTranslationDto: DeleteTranslationDto) {
    const { id } = deleteTranslationDto;
    await this.findOne(id);
    return this.translation.delete({
      where: { id },
    });
  }
}
