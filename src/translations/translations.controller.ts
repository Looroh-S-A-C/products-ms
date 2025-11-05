import { Controller } from '@nestjs/common';
import { TranslationsService } from './translations.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateTranslationDto,
  UpdateTranslationDto,
  DeleteTranslationDto,
  FindTranslationsByEntityDto,
} from './dtos';

@Controller()
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @MessagePattern('translation.create')
  createTranslation(@Payload() createTranslationDto: CreateTranslationDto) {
    return this.translationsService.create(createTranslationDto);
  }

  @MessagePattern('translation.find-all-by-entity')
  findAllByEntity(@Payload() payload: FindTranslationsByEntityDto) {
    return this.translationsService.findAllByEntity(
      payload.entityType,
      payload.entityId,
    );
  }

  @MessagePattern('translation.find-one')
  findOneTranslation(@Payload() id: string) {
    return this.translationsService.findOne(id);
  }

  @MessagePattern('translation.update')
  updateTranslation(@Payload() updateTranslationDto: UpdateTranslationDto) {
    return this.translationsService.update(updateTranslationDto);
  }

  @MessagePattern('translation.delete')
  deleteTranslation(@Payload() deleteTranslationDto: DeleteTranslationDto) {
    return this.translationsService.delete(deleteTranslationDto);
  }
}

