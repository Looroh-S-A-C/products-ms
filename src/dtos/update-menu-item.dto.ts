import { PartialType } from '@nestjs/mapped-types';
import { CreateMenuItemDto } from './create-menu-item.dto';

/**
 * DTO for updating a menu item
 */
export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {
  /**
   * User who updated the menu item
   * @example "user456"
   */
  updatedBy?: string;
}

