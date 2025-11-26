import { Controller, Logger } from '@nestjs/common';
import { ProductScheduleService } from './product-schedule.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  PRODUCT_COMMANDS,
  CreateProductScheduleDto,
  UpdateProductScheduleDto,
  ReplaceProductSchedulesByProductIdDto,
  IsAvailableAtTimeDto,
} from 'qeai-sdk';

/**
 * Controller for managing product schedules.
 * Handles NATS message patterns for product availability schedule operations and logs events with error handling.
 */
@Controller()
export class ProductScheduleController {
  private readonly logger = new Logger(ProductScheduleController.name);

  /**
   * Constructor injecting the ProductScheduleService.
   * @param productScheduleService Service layer for managing product schedules.
   */
  constructor(
    private readonly productScheduleService: ProductScheduleService,
  ) {}

  /**
   * Create a new product schedule.
   * @param createProductScheduleDto - Object containing schedule creation data.
   * @returns Created product schedule.
   */
  @MessagePattern(PRODUCT_COMMANDS.SCHEDULE_CREATE)
  async create(@Payload() createProductScheduleDto: CreateProductScheduleDto) {
    this.logger.debug('Creating a new product schedule');
    try {
      return await this.productScheduleService.create(createProductScheduleDto);
    } catch (err) {
      this.logger.error('Error creating product schedule', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Find all schedules for a product.
   * @param productId - String identifier for the product.
   * @returns Array of product schedules.
   */
  @MessagePattern(PRODUCT_COMMANDS.SCHEDULE_FIND_BY_PRODUCT)
  async findByProductId(@Payload('productId') productId: string) {
    this.logger.debug(`Finding all schedules for productId: ${productId}`);
    try {
      return await this.productScheduleService.findByProductId(productId);
    } catch (err) {
      this.logger.error(
        `Error finding product schedules for productId: ${productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Replace all schedules for a product.
   * @param replaceByProductIdDto - Object containing product ID and schedules array.
   * @returns Array of created schedules.
   */
  @MessagePattern(PRODUCT_COMMANDS.SCHEDULE_REPLACE_BY_PRODUCT)
  async replaceByProductId(
    @Payload() replaceByProductIdDto: ReplaceProductSchedulesByProductIdDto,
  ) {
    this.logger.debug(
      `Replacing schedules for productId: ${replaceByProductIdDto.productId}`,
    );
    try {
      return await this.productScheduleService.replaceByProductId(
        replaceByProductIdDto,
      );
    } catch (err) {
      this.logger.error(
        `Error replacing product schedules for productId: ${replaceByProductIdDto.productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Check if product is available at specific time.
   * @param isAvailableAtTimeDto - Object containing product ID, day of week and time.
   * @returns Boolean indicating availability.
   */
  @MessagePattern(PRODUCT_COMMANDS.SCHEDULE_IS_AVAILABLE_AT_TIME)
  async isAvailableAtTime(
    @Payload() isAvailableAtTimeDto: IsAvailableAtTimeDto,
  ) {
    this.logger.debug(
      `Checking availability for productId: ${isAvailableAtTimeDto.productId} at ${isAvailableAtTimeDto.time} on ${isAvailableAtTimeDto.dayOfWeek}`,
    );
    try {
      return await this.productScheduleService.isAvailableAtTime(
        isAvailableAtTimeDto,
      );
    } catch (err) {
      this.logger.error(
        `Error checking availability for productId: ${isAvailableAtTimeDto.productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Find product schedule by ID.
   * @param id - String identifier for the product schedule.
   * @returns Product schedule details.
   */
  @MessagePattern(PRODUCT_COMMANDS.SCHEDULE_FIND_ONE)
  async findOne(@Payload('id') id: string) {
    this.logger.debug(`Finding product schedule with id: ${id}`);
    try {
      return await this.productScheduleService.findOne(id);
    } catch (err) {
      this.logger.error(
        `Error finding product schedule with id: ${id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Update product schedule by ID.
   * @param updateProductScheduleDto - Object containing ID and update data.
   * @returns Updated product schedule.
   */
  @MessagePattern(PRODUCT_COMMANDS.SCHEDULE_UPDATE)
  async update(@Payload() updateProductScheduleDto: UpdateProductScheduleDto) {
    this.logger.debug(
      `Updating product schedule with id: ${updateProductScheduleDto.productScheduleId}`,
    );
    try {
      return await this.productScheduleService.update(updateProductScheduleDto);
    } catch (err) {
      this.logger.error(
        `Error updating product schedule with id: ${updateProductScheduleDto.productScheduleId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Delete product schedule by ID.
   * @param id - String identifier for the product schedule.
   * @returns Deleted product schedule.
   */
  @MessagePattern(PRODUCT_COMMANDS.SCHEDULE_REMOVE)
  async remove(@Payload('id') id: string) {
    this.logger.debug(`Removing (soft) product schedule with id: ${id}`);
    try {
      return await this.productScheduleService.remove(id);
    } catch (err) {
      this.logger.error(
        `Error removing product schedule with id: ${id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Delete all schedules for a product.
   * @param productId - String identifier for the product.
   * @returns Number of deleted schedules.
   */
  @MessagePattern(PRODUCT_COMMANDS.SCHEDULE_REMOVE_BY_PRODUCT)
  async removeByProductId(@Payload('productId') productId: string) {
    this.logger.debug(
      `Removing all product schedules for productId: ${productId}`,
    );
    try {
      return await this.productScheduleService.removeByProductId(productId);
    } catch (err) {
      this.logger.error(
        `Error removing all product schedules for productId: ${productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }
}
