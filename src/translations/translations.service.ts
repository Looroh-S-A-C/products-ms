import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';
import {
  CreateTranslationDto,
  UpdateTranslationDto,
  DeleteTranslationDto,
  TranslationEntityType,
  Translation,
} from 'qeai-sdk';

@Injectable()
export class TranslationsService extends PrismaClient {
  private readonly logger = new Logger(TranslationsService.name);

  /**
   * Create a new translation
   */
  async create(
    createTranslationDto: CreateTranslationDto,
  ): Promise<Translation> {
    return await this.translation.create({
      data: createTranslationDto,
    });
  }

  /**
   * Find all translations for a specific entity
   */
  async findAllByEntity(
    entityType: TranslationEntityType,
    entityId: string,
  ): Promise<Translation[]> {
    const where: any = { [entityType]: entityId };
    return await this.translation.findMany({
      where,
    });
  }

  /**
   * Find one translation by ID
   */
  async findOne(id: string): Promise<Translation> {
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
  async update(
    updateTranslationDto: UpdateTranslationDto,
  ): Promise<Translation> {
    const { translationId, ...data } = updateTranslationDto;
    await this.findOne(translationId);
    return this.translation.update({
      where: { id: translationId },
      data,
    });
  }

  /**
   * Delete a translation
   */
  async delete(
    deleteTranslationDto: DeleteTranslationDto,
  ): Promise<Translation> {
    const { translationId } = deleteTranslationDto;
    await this.findOne(translationId);
    return this.translation.delete({
      where: { id: translationId },
    });
  }
}
