import { Controller, Logger } from '@nestjs/common';
import { ProductRecipeService } from './product-recipe.service';
import {
  CreateProductRecipeDto,
  UpdateProductRecipeDto,
  ReplaceByProductIdDto,
} from './dtos';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

/**
 * Controller for managing product recipes.
 * Handles NATS message patterns for product-ingredient relationship operations and logs events with error handling.
 */
@Controller()
export class ProductRecipeController {
  private readonly logger = new Logger(ProductRecipeController.name);

  /**
   * Injects the ProductRecipeService.
   * @param productRecipeService Service layer for managing product recipes.
   */
  constructor(private readonly productRecipeService: ProductRecipeService) {}

  /**
   * Create a new product recipe entry.
   * @param createProductRecipeDto - Object containing recipe creation data.
   * @returns Created recipe entry.
   */
  @MessagePattern('product-recipe.create')
  async create(@Payload() createProductRecipeDto: CreateProductRecipeDto) {
    this.logger.debug('Creating a new product recipe entry');
    try {
      return await this.productRecipeService.create(createProductRecipeDto);
    } catch (err) {
      this.logger.error('Error creating product recipe entry', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Find all recipe entries for a product.
   * @param productId - Product ID.
   * @returns Array of recipe entries.
   */
  @MessagePattern('product-recipe.findByProductId')
  async findByProductId(@Payload('productId') productId: string) {
    this.logger.debug(`Finding all recipe entries for productId: ${productId}`);
    try {
      return await this.productRecipeService.findByProductId(productId);
    } catch (err) {
      this.logger.error(
        `Error finding recipe entries for productId: ${productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Replace all recipe entries for a product.
   * @param replaceByProductIdDto - Object containing product ID and recipes array.
   * @returns Array of created recipe entries.
   */
  @MessagePattern('product-recipe.replaceByProductId')
  async replaceByProductId(@Payload() replaceByProductIdDto: ReplaceByProductIdDto) {
    this.logger.debug(
      `Replacing recipes for productId: ${replaceByProductIdDto.productId}`,
    );
    try {
      return await this.productRecipeService.replaceByProductId(replaceByProductIdDto);
    } catch (err) {
      this.logger.error(
        `Error replacing recipes for productId: ${replaceByProductIdDto.productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Find recipe entry by ID.
   * @param id - Recipe entry ID.
   * @returns Recipe entry details.
   */
  @MessagePattern('product-recipe.findOne')
  async findOne(@Payload('id') id: string) {
    this.logger.debug(`Finding recipe entry with id: ${id}`);
    try {
      return await this.productRecipeService.findOne(id);
    } catch (err) {
      this.logger.error(
        `Error finding recipe entry with id: ${id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Update recipe entry by ID.
   * @param updateProductRecipeDto - Object containing update data with ID.
   * @returns Updated recipe entry.
   */
  @MessagePattern('product-recipe.update')
  async update(@Payload() updateProductRecipeDto: UpdateProductRecipeDto) {
    this.logger.debug(
      `Updating recipe entry with id: ${updateProductRecipeDto.id}`,
    );
    try {
      return await this.productRecipeService.update(updateProductRecipeDto);
    } catch (err) {
      this.logger.error(
        `Error updating recipe entry with id: ${updateProductRecipeDto.id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Delete recipe entry by ID.
   * @param id - Recipe entry ID.
   * @returns Deleted recipe entry.
   */
  @MessagePattern('product-recipe.remove')
  async remove(@Payload('id') id: string) {
    this.logger.debug(`Removing recipe entry with id: ${id}`);
    try {
      return await this.productRecipeService.remove(id);
    } catch (err) {
      this.logger.error(
        `Error removing recipe entry with id: ${id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Delete all recipe entries for a product.
   * @param productId - Product ID.
   * @returns Number of deleted entries.
   */
  @MessagePattern('product-recipe.removeByProductId')
  async removeByProductId(@Payload('productId') productId: string) {
    this.logger.debug(
      `Removing all recipe entries for productId: ${productId}`,
    );
    try {
      return await this.productRecipeService.removeByProductId(productId);
    } catch (err) {
      this.logger.error(
        `Error removing all recipe entries for productId: ${productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }
}
