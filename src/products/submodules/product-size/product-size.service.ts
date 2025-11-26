import {
  Injectable,
  Logger,
  OnModuleInit,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  CreateProductSizeDto,
  ReplaceProductSizesByProductIdDto,
  UpdateProductSizeDto,
  SubResourceResponseData,
  ReplaceSubResourceResponseData,
  DeleteSubResourceResponseData,
  ProductSize,
} from 'qeai-sdk';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { SERVICES, PRODUCT_EVENTS } from 'qeai-sdk';
import { productSizeMap } from 'src/products/mappers/size.map';

/**
 * Type that defines the response for single product size operations.
 */
type WriteProductSizeResponse = SubResourceResponseData<
  Omit<ProductSize, 'productId'>,
  'size'
>;

/**
 * Service responsible for managing product sizes.
 * Handles CRUD operations for product sizes consistent with project standards
 * and type-safe responses.
 */
@Injectable()
export class ProductSizeService extends PrismaClient implements OnModuleInit {
  constructor(
    @Inject(SERVICES.NATS_SERVICE) private readonly client: ClientProxy,
  ) {
    super();
  }

  private readonly logger = new Logger(ProductSizeService.name);

  /**
   * Initialize database connection when module starts.
   */
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  /**
   * Create a new product size.
   * @param createProductSizeDto Data for creating the size.
   * @returns Created product size response.
   */
  async create(
    createProductSizeDto: CreateProductSizeDto,
  ): Promise<WriteProductSizeResponse> {
    try {
      this.logger.log(
        `Creating product size for product: ${createProductSizeDto.productId}`,
      );
      const created = await this.productSize.create({
        data: createProductSizeDto,
        include: {
          product: {
            select: { name: true },
          },
        },
      });

      this.client.emit(PRODUCT_EVENTS.SIZE_CREATED, {
        productId: createProductSizeDto.productId,
      });

      const { ...size } = created;
      return {
        message: `Product size: [${created.name}] for product: [${''}] was created successfully`,
        productId: createProductSizeDto.productId,
        size: productSizeMap(size),
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
   * Find all sizes for a product.
   * @param productId Product ID.
   * @returns Array of product sizes.
   */
  async findByProductId(
    productId: string,
  ): Promise<Omit<ProductSize, 'productId'>[]> {
    try {
      const productSizes = await this.productSize.findMany({
        where: {
          productId,
          status: true,
        },
        orderBy: { name: 'asc' },
      });
      return productSizes.map(productSizeMap);
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
   * Find product size by ID.
   * @param id Product size ID.
   * @returns Product size details.
   * @throws RpcException if product size not found.
   */
  async findOne(id: string): Promise<Omit<ProductSize, 'productId'>> {
    try {
      const productSize = await this.productSize.findUnique({
        where: { id },
      });

      if (!productSize) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Product size with id ${id} not found`,
        });
      }

      return productSizeMap(productSize);
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
   * Update product size by ID.
   * @param updateProductSizeDto Update data with ID.
   * @returns Success message and updated product size.
   */
  async update(
    updateProductSizeDto: UpdateProductSizeDto,
  ): Promise<WriteProductSizeResponse> {
    const { productSizeId, ...toUpdate } = updateProductSizeDto;
    try {
      const existing = await this.productSize.findUnique({
        where: { id: productSizeId },
      });

      if (!existing) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Product size with id ${productSizeId} not found`,
        });
      }

      this.logger.log(`Updating product size: ${productSizeId}`);
      const updated = await this.productSize.update({
        where: { id: productSizeId },
        data: toUpdate,
      });
      return {
        message: `Product size: [${updated.name}] for product: [${existing.productId}] was updated successfully`,
        productId: existing.productId,
        size: productSizeMap(updated),
      };
    } catch (error) {
      this.logger.error(
        `Error updating product size with id: ${productSizeId}`,
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
   * Delete product size by ID.
   * @param id Product size ID.
   * @returns Success message and deleted count.
   */
  async remove(id: string): Promise<DeleteSubResourceResponseData> {
    try {
      const found = await this.productSize.findUnique({ where: { id } });
      if (!found) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Product size with id ${id} not found`,
        });
      }
      this.logger.log(`Deleting product size: ${id}`);
      await this.productSize.delete({ where: { id } });
      return {
        message: `Product size: [${id}] for product: [${found.productId}] was deleted successfully`,
        productId: found.productId,
        deletedCount: 1,
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
   * Delete all sizes for a product.
   * @param productId Product ID.
   * @returns Success message with number of deleted sizes.
   */
  async removeByProductId(
    productId: string,
  ): Promise<DeleteSubResourceResponseData> {
    try {
      this.logger.log(`Deleting all sizes for product: ${productId}`);
      const result = await this.productSize.deleteMany({
        where: {
          productId,
        },
      });
      return {
        message: `${result.count} product sizes for product: ${productId} were deleted successfully`,
        productId,
        deletedCount: result.count,
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
   * Bulk create sizes for a product.
   * @param productId Product ID.
   * @param sizes Array of size data.
   * @returns Success message with count of created sizes.
   */
  async bulkCreate(
    productId: string,
    sizes: Omit<CreateProductSizeDto, 'productId'>[],
  ): Promise<ReplaceSubResourceResponseData> {
    try {
      this.logger.log(`Bulk creating sizes for product: ${productId}`);

      const sizeData = sizes.map((size) => ({
        ...size,
        productId,
      }));

      const { count } = await this.productSize.createMany({
        data: sizeData,
      });

      if (count) this.client.emit(PRODUCT_EVENTS.SIZE_CREATED, { productId });

      return {
        message: `${count} product sizes for product [${productId}] have been created successfully.`,
        productId,
        createdCount: count,
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
   * Replace all sizes for a product.
   * @param replaceByProductIdDto Replace data with product ID and sizes.
   * @returns Success message with count of created sizes.
   */
  async replaceByProductId(
    replaceByProductIdDto: ReplaceProductSizesByProductIdDto,
  ): Promise<ReplaceSubResourceResponseData> {
    const { productId, sizes } = replaceByProductIdDto;
    try {
      this.logger.log(`Replacing all sizes for product: ${productId}`);

      // Delete existing sizes
      await this.removeByProductId(productId);

      // Create new sizes
      return await this.bulkCreate(productId, sizes);
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
