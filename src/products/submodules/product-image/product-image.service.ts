import { Injectable, Logger, OnModuleInit, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  BulkCreateProductImageDto,
  CreateProductImageDto,
  DeleteSubResourceResponseData,
  ProductImage,
  ReplaceSubResourceResponseData,
  SetPrimaryImageDto,
  SubResourceResponseData,
  UpdateProductImageDto,
} from 'qeai-sdk';
import { RpcException } from '@nestjs/microservices';

/**
 * Service responsible for managing product images.
 * Handles CRUD operations for product images and provides robust error handling and logging.
 */
type WriteProductImageResponse = SubResourceResponseData<
  Omit<ProductImage, 'productId'>,
  'image'
>;

@Injectable()
export class ProductImageService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductImageService.name);

  /**
   * Initialize database connection when module starts
   */
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  /**
   * Create a new product image.
   * @param createProductImageDto Data for creating the image.
   * @returns Created product image.
   */
  async create(
    createProductImageDto: CreateProductImageDto,
  ): Promise<WriteProductImageResponse> {
    try {
      this.logger.log(
        `Creating product image for product: ${createProductImageDto.productId}`,
      );
      const created = await this.productImage.create({
        data: createProductImageDto,
        include: {
          product: true,
        },
      });
      const { product, productId, ...image } = created;
      return {
        message: `Product image for product: [${product.name}] was created successfully`,
        productId,
        image,
      };
    } catch (error) {
      this.logger.error(
        'Error creating product image',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to create product image',
      });
    }
  }

  /**
   * Find all images for a product.
   * @param productId Product ID.
   * @returns Array of product images.
   */
  async findByProductId(
    productId: string,
  ): Promise<Pick<ProductImage, 'id' | 'url' | 'isPrimary'>[]> {
    try {
      const images = await this.productImage.findMany({
        where: { productId },
        select: {
          id: true,
          url: true,
          isPrimary: true,
        },
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      });
      return images;
    } catch (error) {
      this.logger.error(
        'Error finding product images by productId',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to find product images',
      });
    }
  }

  /**
   * Find product image by ID.
   * @param id Product image ID.
   * @returns Product image details.
   * @throws RpcException if product image not found.
   */
  async findOne(id: string): Promise<ProductImage> {
    try {
      const productImage = await this.productImage.findUnique({
        where: { id },
      });

      if (!productImage) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Product image with id ${id} not found`,
        });
      }

      return productImage;
    } catch (error) {
      this.logger.error(
        `Error finding product image with id: ${id}`,
        error.stack || error.message,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to find product image',
      });
    }
  }

  /**
   * Update product image by ID.
   * @param updateProductImageDto Update data.
   * @returns Success message and updated product image.
   */
  async update(
    updateProductImageDto: UpdateProductImageDto,
  ): Promise<WriteProductImageResponse> {
    const { productImageId, ...toUpdate } = updateProductImageDto;
    try {
      await this.findOne(productImageId);

      this.logger.log(`Updating product image: ${productImageId}`);
      const updated = await this.productImage.update({
        where: { id: productImageId },
        data: toUpdate,
      });
      const { productId, ...image } = updated;
      return {
        message: `Product image: ${updated.id} was updated successfully`,
        productId,
        image,
      };
    } catch (error) {
      this.logger.error(
        `Error updating product image with id: ${productImageId}`,
        error.stack || error.message,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to update product image',
      });
    }
  }

  /**
   * Delete product image by ID.
   * @param id Product image ID.
   * @returns Success message.
   */
  async remove(id: string): Promise<DeleteSubResourceResponseData> {
    try {
      await this.findOne(id);
      this.logger.log(`Deleting product image: ${id}`);
      const deleted = await this.productImage.delete({
        where: { id },
        include: { product: true },
      });
      const {
        productId,
        url,
        product: { name },
      } = deleted;
      return {
        message: `Product image: ${url} for product ${name}, was deleted  successfully`,
        productId,
        deletedCount: 1,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting product image with id: ${id}`,
        error.stack || error.message,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to delete product image',
      });
    }
  }

  /**
   * Delete all images for a product.
   * @param productId Product ID.
   * @returns Success message with number of deleted images.
   */
  async removeByProductId(
    productId: string,
  ): Promise<DeleteSubResourceResponseData> {
    try {
      this.logger.log(`Deleting all images for product: ${productId}`);
      const result = await this.productImage.deleteMany({
        where: { productId },
      });
      return {
        message: `${result.count} images for product: ${productId} were deleted successfully`,
        productId,
        deletedCount: result.count,
      };
    } catch (error) {
      this.logger.error(
        'Error deleting product images by productId',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error.message || 'Unable to delete product images by product id',
      });
    }
  }

  /**
   * Set primary image for a product.
   * @param setPrimaryImageDto DTO with imageId and productId.
   * @returns Success message and updated image.
   */
  async setPrimary(
    setPrimaryImageDto: SetPrimaryImageDto,
  ): Promise<WriteProductImageResponse> {
    const { imageId, productId } = setPrimaryImageDto;
    try {
      this.logger.log(`Setting primary image for product: ${productId}`);

      // Unset all other primary images for this product.
      await this.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });

      // Set the specified image as primary
      const updated = await this.productImage.update({
        where: {
          id: imageId,
          productId,
        },
        include: {
          product: {
            select: {
              name: true,
            },
          },
        },
        data: { isPrimary: true },
      });
      const { product, productId: id, ...image } = updated;

      return {
        message: `Image [${updated.url}] is now primary for product [${updated.product.name}]`,
        productId,
        image,
      };
    } catch (error) {
      this.logger.error(
        `Error setting primary image for product: ${productId}`,
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to set primary product image',
      });
    }
  }

  /**
   * Bulk create images for a product.
   * @param bulkCreateProductImageDto DTO containing productId and images.
   * @returns Success message with count of created images.
   */
  async bulkCreate(
    bulkCreateProductImageDto: BulkCreateProductImageDto,
  ): Promise<ReplaceSubResourceResponseData> {
    const { images, productId } = bulkCreateProductImageDto;
    try {
      this.logger.log(`Bulk creating images for product: ${productId}`);

      const imageData = images.map((image) => ({
        ...image,
        productId,
      }));

      const { count } = await this.productImage.createMany({
        data: imageData,
      });
      return {
        message: `${count} images for product ${productId} have been created successfully.`,
        productId,
        createdCount: count,
      };
    } catch (error) {
      this.logger.error(
        'Error bulk creating product images',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to bulk create product images',
      });
    }
  }
}
