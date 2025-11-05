import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  IsString as IsStringCustom,
  IsOptional,
  IsBoolean,
  IsUrl,
} from 'class-validator';
import { CreateProductDto } from 'src/products/dto';
import { CreateProductImageWithoutProductDto } from './product-image-data.dto';

/**
 * DTO for individual image data in bulk creation
 */
class ProductImageDataDto {
  /**
   * Image URL
   */
  @IsStringCustom()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  /**
   * Whether this is the primary image
   */
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

/**
 * DTO for bulk creating product images
 */
export class BulkCreateProductImageDto {
  /**
   * Product ID
   */
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  /**
   * Array of images to create
   */
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one image is required' })
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageWithoutProductDto)
  images: CreateProductImageWithoutProductDto[];
}
