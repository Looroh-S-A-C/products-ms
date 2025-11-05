import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuCategoryDto } from './create-menu-category.dto';

/**
 * DTO for updating a menu category
 */
export class UpdateMenuCategoryDto extends PartialType(CreateMenuCategoryDto) {
  /**
   * User who updated the menu category
   * @example "user456"
   */
  updatedBy?: string;
}

