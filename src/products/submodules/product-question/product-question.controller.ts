import { Controller, Logger } from '@nestjs/common';
import { ProductQuestionService } from './product-question.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  PRODUCT_COMMANDS,
  CreateProductQuestionDto,
  UpdateProductQuestionDto,
  FindProductQuestionByProductIdAndTypeDto,
  ReplaceProductQuestionsByProductIdDto,
} from 'qeai-sdk';

/**
 * Controller for managing product-question relationships.
 * Handles NATS message patterns for product-question association operations and logs events with error handling.
 */
@Controller()
export class ProductQuestionController {
  private readonly logger = new Logger(ProductQuestionController.name);

  constructor(
    private readonly productQuestionService: ProductQuestionService,
  ) {}

  /**
   * Create a new product-question relationship
   * @param createProductQuestionDto - Object containing relationship creation data
   * @returns Created product-question relationship
   */
  @MessagePattern(PRODUCT_COMMANDS.QUESTION_CREATE)
  async create(@Payload() createProductQuestionDto: CreateProductQuestionDto) {
    this.logger.debug('Creating a new product-question relationship');
    try {
      return await this.productQuestionService.create(createProductQuestionDto);
    } catch (err) {
      this.logger.error(
        'Error creating product-question relationship',
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Find all questions for a product
   * @param productId - Product ID
   * @returns Array of product-question relationships
   */
  @MessagePattern(PRODUCT_COMMANDS.QUESTION_FIND_BY_PRODUCT)
  async findByProductId(@Payload('productId') productId: string) {
    this.logger.debug(
      `Finding all product-question relationships for productId: ${productId}`,
    );
    try {
      return await this.productQuestionService.findByProductId(productId);
    } catch (err) {
      this.logger.error(
        `Error finding product-question relationships for productId: ${productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Find questions by type for a product
   * @param findByProductIdAndTypeDto - Object containing product ID and question type
   * @returns Array of product-question relationships
   */
  @MessagePattern(PRODUCT_COMMANDS.QUESTION_FIND_BY_PRODUCT_AND_TYPE)
  async findByProductIdAndType(
    @Payload()
    findByProductIdAndTypeDto: FindProductQuestionByProductIdAndTypeDto,
  ) {
    this.logger.debug(
      `Finding product-question relationships by productId and type: ${JSON.stringify(findByProductIdAndTypeDto)}`,
    );
    try {
      return await this.productQuestionService.findByProductIdAndType(
        findByProductIdAndTypeDto,
      );
    } catch (err) {
      this.logger.error(
        `Error finding product-question relationships by productId and type: ${JSON.stringify(findByProductIdAndTypeDto)}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Replace all question relationships for a product
   * @param replaceByProductIdDto - Object containing product ID, questions array and deletedBy
   * @returns Array of created relationships
   */
  @MessagePattern(PRODUCT_COMMANDS.QUESTION_REPLACE_BY_PRODUCT)
  async replaceByProductId(
    @Payload() replaceByProductIdDto: ReplaceProductQuestionsByProductIdDto,
  ) {
    this.logger.debug(
      `Replacing product-question relationships for productId: ${replaceByProductIdDto.productId}`,
    );
    try {
      return await this.productQuestionService.replaceByProductId(
        replaceByProductIdDto,
      );
    } catch (err) {
      this.logger.error(
        `Error replacing product-question relationships for productId: ${replaceByProductIdDto.productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Find product-question relationship by ID
   * @param id - Relationship ID
   * @returns Product-question relationship details
   */
  @MessagePattern(PRODUCT_COMMANDS.QUESTION_FIND_ONE)
  async findOne(@Payload('id') id: string) {
    this.logger.debug(`Finding product-question relationship with id: ${id}`);
    try {
      return await this.productQuestionService.findOne(id);
    } catch (err) {
      this.logger.error(
        `Error finding product-question relationship with id: ${id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Update product-question relationship by ID
   * @param updateProductQuestionDto - Object containing ID and update data
   * @returns Updated product-question relationship
   */
  @MessagePattern(PRODUCT_COMMANDS.QUESTION_UPDATE)
  async update(@Payload() updateProductQuestionDto: UpdateProductQuestionDto) {
    this.logger.debug(
      `Updating product-question relationship with id: ${updateProductQuestionDto.productQuestionId}`,
    );
    try {
      return await this.productQuestionService.update(updateProductQuestionDto);
    } catch (err) {
      this.logger.error(
        `Error updating product-question relationship with id: ${updateProductQuestionDto.productQuestionId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Delete product-question relationship by ID
   * @param id - Relationship ID
   * @returns Deleted product-question relationship
   */
  @MessagePattern(PRODUCT_COMMANDS.QUESTION_REMOVE)
  async remove(@Payload('id') id: string) {
    this.logger.debug(`Removing product-question relationship with id: ${id}`);
    try {
      return await this.productQuestionService.remove(id);
    } catch (err) {
      this.logger.error(
        `Error removing product-question relationship with id: ${id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Delete all question relationships for a product
   * @param productId - Product ID
   * @returns Number of deleted relationships
   */
  @MessagePattern(PRODUCT_COMMANDS.QUESTION_REMOVE_BY_PRODUCT)
  async removeByProductId(@Payload('productId') productId: string) {
    this.logger.debug(
      `Removing all product-question relationships for productId: ${productId}`,
    );
    try {
      return await this.productQuestionService.removeByProductId(productId);
    } catch (err) {
      this.logger.error(
        `Error removing all product-question relationships for productId: ${productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }
}
