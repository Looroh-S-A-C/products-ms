import { Injectable, Logger, OnModuleInit, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  CreateProductScheduleDto,
  ReplaceProductSchedulesByProductIdDto,
  IsAvailableAtTimeDto,
  UpdateProductScheduleDto,
  SubResourceResponseData,
  ReplaceSubResourceResponseData,
  DeleteSubResourceResponseData,
  ProductSchedule
} from 'qeai-sdk';
import { RpcException } from '@nestjs/microservices';

/**
 * Type that defines the response for single schedule operations.
 */
type WriteProductScheduleResponse = SubResourceResponseData<
  Omit<ProductSchedule, 'productId'>,
  'schedule'
>;

/**
 * Service responsible for managing product schedules.
 * Handles CRUD operations for product availability schedules,
 * consistent with project standards and type-safe responses.
 */
@Injectable()
export class ProductScheduleService
  extends PrismaClient
  implements OnModuleInit
{
  private readonly logger = new Logger(ProductScheduleService.name);

  /**
   * Initialize database connection when module starts
   */
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  /**
   * Create a new product schedule.
   * @param createProductScheduleDto Data for creating the schedule.
   * @returns Created product schedule.
   */
  async create(
    createProductScheduleDto: CreateProductScheduleDto,
  ): Promise<WriteProductScheduleResponse> {
    try {
      this.logger.log(
        `Creating product schedule for product: ${createProductScheduleDto.productId}`,
      );
      const created = await this.productSchedule.create({
        data: createProductScheduleDto,
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
      });
      const { productId, product, ...schedule } = created;
      return {
        message: `Product schedule for product: [${product.name}] was created successfully`,
        productId,
        schedule,
      };
    } catch (error) {
      this.logger.error(
        'Error creating product schedule',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to create product schedule',
      });
    }
  }

  /**
   * Find all schedules for a product.
   * @param productId Product ID.
   * @returns Array of product schedules.
   */
  async findByProductId(
    productId: string,
  ): Promise<Omit<ProductSchedule, 'productId'>[]> {
    try {
      const schedules = await this.productSchedule.findMany({
        where: { productId },
        select: {
          id: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
        },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      });
      return schedules;
    } catch (error) {
      this.logger.error(
        'Error finding product schedules by productId',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to find product schedules',
      });
    }
  }

  /**
   * Find product schedule by ID.
   * @param id Product schedule ID.
   * @returns Product schedule details.
   * @throws RpcException if product schedule not found.
   */
  async findOne(id: string): Promise<ProductSchedule> {
    try {
      const productSchedule = await this.productSchedule.findUnique({
        where: { id },
      });

      if (!productSchedule) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Product schedule with id ${id} not found`,
        });
      }

      return productSchedule;
    } catch (error) {
      this.logger.error(
        `Error finding product schedule with id: ${id}`,
        error.stack || error.message,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to find product schedule',
      });
    }
  }

  /**
   * Update product schedule by ID.
   * @param updateProductScheduleDto Update data with ID.
   * @returns Success message and updated product schedule.
   */
  async update(
    updateProductScheduleDto: UpdateProductScheduleDto,
  ): Promise<WriteProductScheduleResponse> {
    const { productScheduleId, ...toUpdate } = updateProductScheduleDto;
    try {
      const existing = await this.findOne(productScheduleId);

      this.logger.log(`Updating product schedule: ${productScheduleId}`);
      const updated = await this.productSchedule.update({
        where: { id: productScheduleId },
        data: toUpdate,
        include: {
          product: { select: { name: true } },
        },
      });
      const { product, productId, ...schedule } = updated;
      return {
        message: `Product schedule: [${productScheduleId}] for product [${product.name}] was updated successfully`,
        productId: existing.productId,
        schedule,
      };
    } catch (error) {
      this.logger.error(
        `Error updating product schedule with id: ${productScheduleId}`,
        error.stack || error.message,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to update product schedule',
      });
    }
  }

  /**
   * Delete product schedule by ID.
   * @param id Product schedule ID.
   * @returns Success message and deleted count.
   */
  async remove(id: string): Promise<DeleteSubResourceResponseData> {
    try {
      const found = await this.findOne(id);
      this.logger.log(`Deleting product schedule: ${id}`);
      const deleted = await this.productSchedule.delete({
        where: { id },
        include: { product: { select: { name: true } } },
      });
      const { productId, product } = deleted;
      return {
        message: `Product schedule [${id}] for product [${product.name}] was deleted successfully`,
        productId,
        deletedCount: 1,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting product schedule with id: ${id}`,
        error.stack || error.message,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to delete product schedule',
      });
    }
  }

  /**
   * Delete all schedules for a product.
   * @param productId Product ID.
   * @returns Success message with number of deleted schedules.
   */
  async removeByProductId(
    productId: string,
  ): Promise<DeleteSubResourceResponseData> {
    try {
      this.logger.log(`Deleting all schedules for product: ${productId}`);
      const result = await this.productSchedule.deleteMany({
        where: { productId },
      });
      return {
        message: `${result.count} schedules for product: ${productId} were deleted successfully`,
        productId,
        deletedCount: result.count,
      };
    } catch (error) {
      this.logger.error(
        'Error deleting product schedules by productId',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error.message || 'Unable to delete product schedules by product id',
      });
    }
  }

  /**
   * Bulk create schedules for a product.
   * @param productId Product ID.
   * @param schedules Array of schedule data.
   * @returns Success message with count of created schedules.
   */
  async bulkCreate(
    productId: string,
    schedules: Omit<CreateProductScheduleDto, 'productId'>[],
  ): Promise<ReplaceSubResourceResponseData> {
    try {
      this.logger.log(`Bulk creating schedules for product: ${productId}`);

      const scheduleData = schedules.map((schedule) => ({
        ...schedule,
        productId,
      }));

      const { count } = await this.productSchedule.createMany({
        data: scheduleData,
      });
      return {
        message: `${count} schedules for product ${productId} have been created successfully.`,
        productId,
        createdCount: count,
      };
    } catch (error) {
      this.logger.error(
        'Error bulk creating product schedules',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to bulk create product schedules',
      });
    }
  }

  /**
   * Replace all schedules for a product.
   * @param replaceByProductIdDto Replace data with product ID and schedules.
   * @returns Success message with count of created schedules.
   */
  async replaceByProductId(
    replaceByProductIdDto: ReplaceProductSchedulesByProductIdDto,
  ): Promise<ReplaceSubResourceResponseData> {
    const { productId, schedules } = replaceByProductIdDto;
    try {
      this.logger.log(`Replacing all schedules for product: ${productId}`);

      // Delete existing schedules
      await this.removeByProductId(productId);

      // Create new schedules
      return await this.bulkCreate(productId, schedules);
    } catch (error) {
      this.logger.error(
        'Error replacing product schedules',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to replace product schedules',
      });
    }
  }

  /**
   * Check if product is available at specific time.
   * @param isAvailableAtTimeDto Availability check data.
   * @returns Boolean indicating availability.
   */
  async isAvailableAtTime(
    isAvailableAtTimeDto: IsAvailableAtTimeDto,
  ): Promise<{ isAvailable: boolean }> {
    const { productId, dayOfWeek, time } = isAvailableAtTimeDto;
    try {
      const schedule = await this.productSchedule.findFirst({
        where: {
          productId,
          dayOfWeek,
          startTime: { lte: time },
          endTime: { gte: time },
        },
      });
      return { isAvailable: !!schedule };
    } catch (error) {
      this.logger.error(
        'Error checking product schedule availability',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to check product availability',
      });
    }
  }
}
