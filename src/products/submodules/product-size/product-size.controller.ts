import { Controller, Logger } from '@nestjs/common';
import { ProductSizeService } from './product-size.service';
import {
  CreateProductSizeDto,
  ReplaceByProductIdDto,
  UpdateProductSizeDto,
} from './dtos';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

/**
 * Controller for managing product sizes.
 * Handles NATS message patterns for product size variant operations and logs events with error handling.
 */
@Controller()
export class ProductSizeController {

  
  private readonly logger = new Logger(ProductSizeController.name);

  /**
   * Constructor injecting the ProductSizeService.
   * @param productSizeService Service layer for managing product sizes.
   */
  constructor(private readonly productSizeService: ProductSizeService) {}

  /**
   * Creates a new product size.
   * @param createProductSizeDto Object containing size creation data.
   * @returns Created product size.
   */
  @MessagePattern('product-size.create')
  async create(@Payload() createProductSizeDto: CreateProductSizeDto) {
    this.logger.debug('Creating a new product size');
    try {
      return await this.productSizeService.create(createProductSizeDto);
    } catch (err) {
      this.logger.error('Error creating product size', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Finds all sizes for a product.
   * @param productId String identifier for the product.
   * @returns Array of product sizes.
   */
  @MessagePattern('product-size.findByProductId')
  async findByProductId(@Payload('productId') productId: string) {
    this.logger.debug(`Finding all sizes for productId: ${productId}`);
    try {
      return await this.productSizeService.findByProductId(productId);
    } catch (err) {
      this.logger.error(
        `Error finding product sizes for productId: ${productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Replaces all sizes for a product.
   * @param replaceByProductIdDto Object containing product ID, sizes array, and deletedBy.
   * @returns Array of created sizes.
   */
  @MessagePattern('product-size.replaceByProductId')
  async replaceByProductId(@Payload() replaceByProductIdDto: ReplaceByProductIdDto) {
    this.logger.debug(
      `Replacing sizes for productId: ${replaceByProductIdDto.productId}`,
    );
    try {
      return await this.productSizeService.replaceByProductId(replaceByProductIdDto);
    } catch (err) {
      this.logger.error(
        `Error replacing product sizes for productId: ${replaceByProductIdDto.productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Finds product size by ID.
   * @param id String identifier for the product size.
   * @returns Product size details.
   */
  @MessagePattern('product-size.findOne')
  async findOne(@Payload('id') id: string) {
    this.logger.debug(`Finding product size with id: ${id}`);
    try {
      return await this.productSizeService.findOne(id);
    } catch (err) {
      this.logger.error(
        `Error finding product size with id: ${id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Updates product size by ID.
   * @param updateProductSizeDto Object containing ID and update data.
   * @returns Updated product size.
   */
  @MessagePattern('product-size.update')
  async update(@Payload() updateProductSizeDto: UpdateProductSizeDto) {
    this.logger.debug(
      `Updating product size with id: ${updateProductSizeDto.id}`,
    );
    try {
      return await this.productSizeService.update(updateProductSizeDto);
    } catch (err) {
      this.logger.error(
        `Error updating product size with id: ${updateProductSizeDto.id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Soft deletes product size by ID.
   * @param id String identifier for the product size.
   * @returns Updated (soft-deleted) product size.
   */
  @MessagePattern('product-size.remove')
  async remove(@Payload('id') id: string) {
    this.logger.debug(`Removing (soft) product size with id: ${id}`);
    try {
      return await this.productSizeService.remove(id);
    } catch (err) {
      this.logger.error(
        `Error removing product size with id: ${id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Deletes all sizes for a product.
   * @param productId String identifier for the product.
   * @returns Number of deleted sizes.
   */
  @MessagePattern('product-size.removeByProductId')
  async removeByProductId(@Payload('productId') productId: string) {
    this.logger.debug(
      `Removing all product sizes for productId: ${productId}`,
    );
    try {
      return await this.productSizeService.removeByProductId(productId);
    } catch (err) {
      this.logger.error(
        `Error removing all product sizes for productId: ${productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }
}
