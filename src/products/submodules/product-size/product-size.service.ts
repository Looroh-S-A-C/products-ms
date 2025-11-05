import { Injectable, Logger, OnModuleInit, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  CreateProductSizeDto,
  ReplaceByProductIdDto,
  UpdateProductSizeDto,
} from './dtos';
import { RpcException } from '@nestjs/microservices';

/**
 * Service responsible for managing product sizes
 * Handles CRUD operations for product size variants
 * Implements service patterns as in ProductTagService (consistency, error handling, messages)
 */
@Injectable()
export class ProductSizeService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductSizeService.name);

  /**
   * Initialize database connection when module starts
   */
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  /**
   * Create a new product size
   * @param createProductSizeDto - Data for creating the size
   * @returns Success message and created product size
   */
  async create(createProductSizeDto: CreateProductSizeDto) {
    try {
      this.logger.log(
        `Creating product size for product: ${createProductSizeDto.productId}`,
      );
      const created = await this.productSize.create({
        data: createProductSizeDto,
        select: {
          id: true,
          name: true,
          price: true,
          status: true,
        },
      });
      return {
        message: `Product size: [${created.name}] was created successfully`,
        size: created,
      };
    } catch (error) {
      this.logger.error(
        'Error creating product size',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to create product size',
      });
    }
  }

  /**
   * Find all sizes for a product
   * @param productId - Product ID
   * @returns Array of product sizes
   */
  async findByProductId(productId: string) {
    try {
      const productSizes = await this.productSize.findMany({
        where: {
          productId,
          status: true,
        },
        select: {
          id: true,
          name: true,
          status: true,
          price: true,
        },
        orderBy: { name: 'asc' },
      });
      return productSizes;
    } catch (error) {
      this.logger.error(
        'Error finding product sizes by productId',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to find product sizes',
      });
    }
  }

  /**
   * Find product size by ID
   * @param id - Product size ID
   * @returns Product size details
   * @throws RpcException if product size not found
   */
  async findOne(id: string) {
    try {
      const productSize = await this.productSize.findUnique({
        where: { id },
        omit: {
          createdAt: true,
          productId: true,
          updatedAt: true,
        },
      });

      if (!productSize) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Product size with id ${id} not found`,
        });
      }

      return productSize;
    } catch (error) {
      this.logger.error(
        `Error finding product size with id: ${id}`,
        error.stack || error.message,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to find product size',
      });
    }
  }

  /**
   * Update product size by ID
   * @param updateProductSizeDto - Update data with ID
   * @returns Success message and updated product size
   */
  async update(updateProductSizeDto: UpdateProductSizeDto) {
    const { id, ...toUpdate } = updateProductSizeDto;
    try {
      await this.findOne(id);

      this.logger.log(`Updating product size: ${id}`);
      const updated = await this.productSize.update({
        where: { id },
        data: toUpdate,
        omit: {
          createdAt: true,
          updatedAt: true,
          productId: true,
        },
      });
      return {
        message: `Product size [${updated.name}] was updated successfully`,
        size: updated,
      };
    } catch (error) {
      this.logger.error(
        `Error updating product size with id: ${id}`,
        error.stack || error.message,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to update product size',
      });
    }
  }

  /**
   * Delete product size by ID
   * @param id - Product size ID
   * @returns Success message
   */
  async remove(id: string) {
    try {
      await this.findOne(id);
      this.logger.log(`Deleting product size: ${id}`);
      await this.productSize.delete({ where: { id } });
      return {
        message: `Product size: ${id} was deleted successfully`,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting product size with id: ${id}`,
        error.stack || error.message,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to delete product size',
      });
    }
  }

  /**
   * Delete all sizes for a product
   * @param productId - Product ID
   * @returns Success message with number of deleted sizes
   */
  async removeByProductId(productId: string) {
    try {
      this.logger.log(`Deleting all sizes for product: ${productId}`);
      const result = await this.productSize.deleteMany({
        where: {
          productId,
        },
      });
      return {
        message: `${result.count} product sizes for product: ${productId} were deleted successfully`,
      };
    } catch (error) {
      this.logger.error(
        'Error deleting product sizes by productId',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error.message || 'Unable to delete product sizes by product id',
      });
    }
  }

  /**
   * Bulk create sizes for a product
   * @param productId - Product ID
   * @param sizes - Array of size data
   * @returns Success message with count of created sizes
   */
  async bulkCreate(
    productId: string,
    sizes: Omit<CreateProductSizeDto, 'productId'>[],
  ) {
    try {
      this.logger.log(`Bulk creating sizes for product: ${productId}`);

      const sizeData = sizes.map((size) => ({
        ...size,
        productId,
      }));

      const { count } = await this.productSize.createMany({
        data: sizeData,
      });
      return {
        message: `${count} product sizes for product ${productId} have been created successfully.`,
      };
    } catch (error) {
      this.logger.error(
        'Error bulk creating product sizes',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to bulk create product sizes',
      });
    }
  }

  /**
   * Replace all sizes for a product
   * @param replaceByProductIdDto - Replace data with product ID and sizes
   * @returns Success message with count of created sizes
   */
  async replaceByProductId(replaceByProductIdDto: ReplaceByProductIdDto) {
    const { productId, sizes } = replaceByProductIdDto;
    try {
      this.logger.log(`Replacing all sizes for product: ${productId}`);

      // Delete existing sizes
      await this.removeByProductId(productId);

      // Create new sizes
      return this.bulkCreate(productId, sizes);
    } catch (error) {
      this.logger.error(
        'Error replacing product sizes',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to replace product sizes',
      });
    }
  }
}
