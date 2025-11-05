import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuDto } from './create-menu.dto';

/**
 * DTO for updating a menu
 */
export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  /**
   * User who updated the menu
   * @example "user456"
   */
  updatedBy?: string;
}

