import { Controller } from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  TRANSLATION_COMMANDS,
  CreateTranslationDto,
  UpdateTranslationDto,
  DeleteTranslationDto,
  FindTranslationsByEntityDto,
} from 'qeai-sdk';

@Controller()
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @MessagePattern(TRANSLATION_COMMANDS.CREATE)
  createTranslation(@Payload() createTranslationDto: CreateTranslationDto) {
    return this.translationsService.create(createTranslationDto);
  }

  @MessagePattern(TRANSLATION_COMMANDS.FIND_ALL_BY_ENTITY)
  findAllByEntity(@Payload() payload: FindTranslationsByEntityDto) {
    return this.translationsService.findAllByEntity(
      payload.entityType,
      payload.entityId,
    );
  }

  @MessagePattern(TRANSLATION_COMMANDS.FIND_ONE)
  findOneTranslation(@Payload() id: string) {
    return this.translationsService.findOne(id);
  }

  @MessagePattern(TRANSLATION_COMMANDS.UPDATE)
  updateTranslation(@Payload() updateTranslationDto: UpdateTranslationDto) {
    return this.translationsService.update(updateTranslationDto);
  }

  @MessagePattern(TRANSLATION_COMMANDS.DELETE)
  deleteTranslation(@Payload() deleteTranslationDto: DeleteTranslationDto) {
    return this.translationsService.delete(deleteTranslationDto);
  }
}
