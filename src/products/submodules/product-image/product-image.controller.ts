import { Controller, Logger } from '@nestjs/common';
import { ProductImageService } from './product-image.service';
import {
  CreateProductImageDto,
  UpdateProductImageDto,
  BulkCreateProductImageDto,
  SetPrimaryImageDto,
} from './dtos';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

/**
 * Controller for managing product images.
 * Handles NATS message patterns for product image operations and logs events with error handling.
 */
@Controller()
export class ProductImageController {
  private readonly logger = new Logger(ProductImageController.name);

  constructor(private readonly productImageService: ProductImageService) {}

  /**
   * Create a new product image.
   * @param createProductImageDto Object containing image creation data.
   * @returns Created product image.
   */
  @MessagePattern('product-image.create')
  async create(@Payload() createProductImageDto: CreateProductImageDto) {
    this.logger.debug('Creating a new product image');
    try {
      return await this.productImageService.create(createProductImageDto);
    } catch (err) {
      this.logger.error('Error creating product image', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Find all images for a product.
   * @param productId String identifier for the product.
   * @returns Array of product images.
   */
  @MessagePattern('product-image.findByProductId')
  async findByProductId(@Payload('productId') productId: string) {
    this.logger.debug(`Finding all images for productId: ${productId}`);
    try {
      return await this.productImageService.findByProductId(productId);
    } catch (err) {
      this.logger.error(
        `Error finding product images for productId: ${productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Bulk create images for a product.
   * @param bulkCreateProductImageDto Object containing product ID and images array.
   * @returns Array of created images.
   */
  @MessagePattern('product-image.bulkCreate')
  async bulkCreate(
    @Payload() bulkCreateProductImageDto: BulkCreateProductImageDto,
  ) {
    this.logger.debug(
      `Bulk creating images for productId: ${bulkCreateProductImageDto.productId}`,
    );
    try {
      return await this.productImageService.bulkCreate(
        bulkCreateProductImageDto,
      );
    } catch (err) {
      this.logger.error(
        `Error bulk creating images for productId: ${bulkCreateProductImageDto.productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Set primary image for a product.
   * @param setPrimaryImageDto Object containing product ID and image ID.
   * @returns Updated image.
   */
  @MessagePattern('product-image.setPrimary')
  async setPrimary(@Payload() setPrimaryImageDto: SetPrimaryImageDto) {
    this.logger.debug(
      `Setting primary image for productId: ${setPrimaryImageDto.productId} and imageId: ${setPrimaryImageDto.imageId}`,
    );
    try {
      return await this.productImageService.setPrimary(setPrimaryImageDto);
    } catch (err) {
      this.logger.error(
        `Error setting primary image for productId: ${setPrimaryImageDto.productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Find product image by ID.
   * @param id String identifier for the product image.
   * @returns Product image details.
   */
  @MessagePattern('product-image.findOne')
  async findOne(@Payload('id') id: string) {
    this.logger.debug(`Finding product image with id: ${id}`);
    try {
      return await this.productImageService.findOne(id);
    } catch (err) {
      this.logger.error(
        `Error finding product image with id: ${id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Update product image by ID.
   * @param updateProductImageDto Object containing ID and update data.
   * @returns Updated product image.
   */
  @MessagePattern('product-image.update')
  async update(
    @Payload()
    updateProductImageDto: UpdateProductImageDto,
  ) {
    this.logger.debug(
      `Updating product image with id: ${updateProductImageDto.id}`,
    );
    try {
      return await this.productImageService.update(updateProductImageDto);
    } catch (err) {
      this.logger.error(
        `Error updating product image with id: ${updateProductImageDto.id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Delete product image by ID.
   * @param removeProductImageDto Object containing ID and deletedBy.
   * @returns Updated (soft-deleted) product image.
   */
  @MessagePattern('product-image.remove')
  async remove(@Payload('id') id: string) {
    this.logger.debug(`Removing (soft) product image with id: ${id}`);
    try {
      return await this.productImageService.remove(id);
    } catch (err) {
      this.logger.error(
        `Error removing product image with id: ${id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Delete all images for a product.
   * @param removeByProductIdDto Object containing productId and deletedBy.
   * @returns Number of deleted images.
   */
  @MessagePattern('product-image.removeByProductId')
  async removeByProductId(@Payload('productId') productId: string) {
    this.logger.debug(
      `Removing all product images for productId: ${productId}`,
    );
    try {
      return await this.productImageService.removeByProductId(productId);
    } catch (err) {
      this.logger.error(
        `Error removing all product images for productId: ${productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }
}
