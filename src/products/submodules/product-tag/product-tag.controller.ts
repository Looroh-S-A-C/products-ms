import { Controller, Logger } from '@nestjs/common';
import { ProductTagService } from './product-tag.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { PRODUCT_COMMANDS, ProductTagDto, ReplaceProductTagsByProductIdDto } from 'qeai-sdk';

/**
 * Controller for managing product-tag relationships.
 * Handles NATS message patterns for product-tag association operations and logs events with error handling.
 */
@Controller()
export class ProductTagController {
  private readonly logger = new Logger(ProductTagController.name);

  /**
   * Constructor injecting the product-tag service.
   * @param productTagService Service layer for managing product-tag relationships.
   */
  constructor(private readonly productTagService: ProductTagService) {}

  /**
   * Creates a new product-tag relationship.
   * @param createProductTagDto Object containing data for relationship creation.
   * @returns Created product-tag relationship.
   */
  @MessagePattern(PRODUCT_COMMANDS.TAG_CREATE)
  async create(@Payload() createProductTagDto: ProductTagDto) {
    this.logger.debug('Creating a new product-tag relationship');
    try {
      return await this.productTagService.create(createProductTagDto);
    } catch (err) {
      this.logger.error('Error creating product-tag relationship', err.stack);
      if (err instanceof RpcException) throw err;
      console.log({ errCatch: err.message });
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Finds all tags for a product.
   * @param productId String identifier for the product.
   * @returns Array of product-tag relationships.
   */
  @MessagePattern(PRODUCT_COMMANDS.TAG_FIND_BY_PRODUCT)
  async findByProductId(@Payload('productId') productId: string) {
    this.logger.debug(`Finding all tags for productId: ${productId}`);
    try {
      return await this.productTagService.findByProductId(productId);
    } catch (err) {
      this.logger.error(
        `Error finding product tags for productId: ${productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Replaces all tag relationships for a product.
   * @param replaceByProductIdDto Object containing product ID and array of tag IDs.
   * @returns Array of created relationships.
   */
  @MessagePattern(PRODUCT_COMMANDS.TAG_REPLACE_BY_PRODUCT)
  async replaceByProductId(
    @Payload() replaceByProductIdDto: ReplaceProductTagsByProductIdDto,
  ) {
    this.logger.debug(
      `Replacing tags for productId: ${replaceByProductIdDto.productId} with tags: ${replaceByProductIdDto.tagIds?.join(',')}`,
    );
    try {
      return await this.productTagService.replaceByProductId(
        replaceByProductIdDto,
      );
    } catch (err) {
      this.logger.error(
        `Error replacing product tags for productId: ${replaceByProductIdDto.productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Finds a product-tag relationship by IDs.
   * @param findOneDto Object containing productId and tagId.
   * @returns Product-tag relationship details.
   */
  @MessagePattern(PRODUCT_COMMANDS.TAG_FIND_ONE)
  async findOne(@Payload() findOneDto: ProductTagDto) {
    this.logger.debug(
      `Finding one product-tag relationship for productId: ${findOneDto.productId}, tagId: ${findOneDto.tagId}`,
    );
    try {
      return await this.productTagService.findOne(findOneDto);
    } catch (err) {
      this.logger.error(
        `Error finding product-tag for productId: ${findOneDto.productId}, tagId: ${findOneDto.tagId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Deletes a product-tag relationship by IDs.
   * @param removeDto Object containing productId and tagId.
   * @returns Deleted product-tag relationship.
   */
  @MessagePattern(PRODUCT_COMMANDS.TAG_REMOVE)
  async remove(@Payload() removeDto: ProductTagDto) {
    this.logger.debug(
      `Removing product-tag relationship for productId: ${removeDto.productId}, tagId: ${removeDto.tagId}`,
    );
    try {
      return await this.productTagService.remove(removeDto);
    } catch (err) {
      this.logger.error(
        `Error removing product-tag for productId: ${removeDto.productId}, tagId: ${removeDto.tagId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Deletes all tag relationships for a product.
   * @param productId String identifier for the product.
   * @returns Number of deleted relationships.
   */
  @MessagePattern(PRODUCT_COMMANDS.TAG_REMOVE_BY_PRODUCT)
  async removeByProductId(@Payload('productId') productId: string) {
    this.logger.debug(
      `Removing all product-tag relationships for productId: ${productId}`,
    );
    try {
      return await this.productTagService.removeByProductId(productId);
    } catch (err) {
      this.logger.error(
        `Error removing all product-tag relationships for productId: ${productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }
}
