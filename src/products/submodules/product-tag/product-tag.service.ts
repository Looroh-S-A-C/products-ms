import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  ProductTagDto,
  ReplaceProductTagsByProductIdDto,
  Tag,
  SubResourceResponseData,
  DeleteSubResourceResponseData,
  ReplaceSubResourceResponseData,
} from 'qeai-sdk';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { SERVICES, PRODUCT_EVENTS } from 'qeai-sdk';

/**
 * Type that defines the response for single product-tag operations.
 */
type TagResponse = Omit<
  Tag,
  | 'createdAt'
  | 'updatedAt'
  | 'deletedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'deletedBy'
>;

/**
 * Service responsible for managing product-tag relationships.
 * Handles CRUD operations for product-tag associations in a scalable and clear manner.
 */
@Injectable()
export class ProductTagService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductTagService.name);

  constructor(
    @Inject(SERVICES.NATS_SERVICE) private readonly client: ClientProxy,
  ) {
    super();
  }
  /**
   * Initialize database connection when module starts.
   */
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  /**
   * Create a new product-tag relationship.
   * @param createProductTagDto - Data for creating the relationship
   * @returns Created product-tag relationship
   */
  async create(
    createProductTagDto: ProductTagDto,
  ): Promise<SubResourceResponseData<TagResponse, 'tag'>> {
    this.logger.log(
      `Creating product-tag relationship for product: ${createProductTagDto.productId}`,
    );
    try {
      const created = await this.productTag.create({
        data: createProductTagDto,
        omit: {
          productId: true,
          tagId: true,
        },
        include: {
          product: {
            select: {
              name: true,
            },
          },
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.client.emit(PRODUCT_EVENTS.TAG_CREATED, {
        productId: createProductTagDto.productId,
      });
      const {
        product: { name },
        tag,
      } = created;

      return {
        message: `Tag [${created.tag.name}] was added successfully to product [${name}].`,
        productId: createProductTagDto.productId,
        tag,
      };
    } catch (error) {
      this.logger.error(
        'Error creating product-tag relationship',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to create product-tag relationship',
      });
    }
  }

  /**
   * Find all tags for a product.
   * @param productId - Product ID
   * @returns Array of tag relationships
   */
  async findByProductId(productId: string): Promise<TagResponse[]> {
    this.logger.log(`Finding all tags for productId: ${productId}`);
    try {
      const productTags = await this.productTag.findMany({
        where: { productId },
        include: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        omit: {
          tagId: true,
          productId: true,
        },
        orderBy: { tag: { name: 'asc' } },
      });

      return productTags.map((proTag) => ({
        id: proTag.tag.id,
        name: proTag.tag.name,
      }));
    } catch (error) {
      this.logger.error(
        'Error finding tags by productId',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to find product tags',
      });
    }
  }

  /**
   * Find all products for a tag.
   * @param tagId - Tag ID
   * @returns Array of product-tag relationships
   */
  async findByTagId(tagId: string) : Promise<any> {
    try {
      return await this.productTag.findMany({
        where: { tagId },
        include: {
          product: true,
          tag: true,
        },
        orderBy: { product: { name: 'asc' } },
      });
    } catch (error) {
      this.logger.error(
        'Error finding products by tagId',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to find products for tag',
      });
    }
  }

  /**
   * Find product-tag relationship by IDs.
   * @param findOneDto - Find data with product ID and tag ID
   * @returns Tag relationship details
   * @throws RpcException if relationship not found
   */
  async findOne(findOneDto: ProductTagDto): Promise<TagResponse> {
    const { productId, tagId } = findOneDto;
    try {
      const productTag = await this.productTag.findUnique({
        where: {
          productId_tagId: {
            productId,
            tagId,
          },
        },
        omit: { productId: true, tagId: true },
        include: {
          tag: true,
        },
      });

      if (!productTag) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Product-tag relationship with productId:${productId} and tagId:${tagId} not found`,
        });
      }

      return {
        id: productTag.tag.id,
        name: productTag.tag.name,
      };
    } catch (error) {
      this.logger.error(
        'Error finding product-tag relationship',
        error.stack || error.message,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to find product-tag relationship',
      });
    }
  }

  /**
   * Delete product-tag relationship by IDs.
   * @param removeDto - Remove data with product ID and tag ID
   * @returns Delete response object
   */
  async remove(
    removeDto: ProductTagDto,
  ): Promise<DeleteSubResourceResponseData> {
    const { productId, tagId } = removeDto;
    const found = await this.findOne({ productId, tagId });

    this.logger.log(`Deleting product-tag relationship: ${productId}-${tagId}`);
    try {
      await this.productTag.delete({
        where: {
          productId_tagId: {
            productId,
            tagId,
          },
        },
      });
      return {
        message: `Tag relationship [${found.name}] for product [${productId}] was deleted successfully`,
        productId,
        deletedCount: 1,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting product-tag relationship: (${productId},${tagId})`,
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to delete product-tag relationship',
      });
    }
  }

  /**
   * Delete all tag relationships for a product.
   * @param productId - Product ID
   * @returns Delete response object
   */
  async removeByProductId(
    productId: string,
  ): Promise<DeleteSubResourceResponseData> {
    this.logger.log(`Deleting all tag relationships for product: ${productId}`);
    try {
      const result = await this.productTag.deleteMany({
        where: { productId },
      });
      return {
        message: `${result.count} tag relationships for product: [${productId}] were deleted successfully`,
        productId,
        deletedCount: result.count,
      };
    } catch (error) {
      this.logger.error(
        'Error deleting all product-tag relationships for product',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error.message ||
          'Unable to delete product-tag relationships by product id',
      });
    }
  }

  /**
   * Bulk create tag relationships for a product.
   * @param productId - Product ID
   * @param tagIds - Array of tag IDs
   * @returns Bulk create response
   */
  async bulkCreate(
    productId: string,
    tagIds: string[],
  ): Promise<ReplaceSubResourceResponseData> {
    this.logger.log(
      `Bulk creating tag relationships for product: ${productId}`,
    );
    try {
      const relationshipData = tagIds.map((tagId) => ({
        productId,
        tagId,
      }));

      const { count } = await this.productTag.createMany({
        data: relationshipData,
      });

      if (count) this.client.emit(PRODUCT_EVENTS.TAG_CREATED, { productId });

      return {
        message: `${count} tag relationships for product [${productId}] have been created successfully.`,
        productId,
        createdCount: count,
      };
    } catch (error) {
      this.logger.error(
        'Error bulk creating product-tag relationships',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error.message || 'Unable to bulk create product-tag relationships',
      });
    }
  }

  /**
   * Replace all tag relationships for a product.
   * @param replaceByProductIdDto - Replace data with product ID and tag IDs
   * @returns Replace response object
   */
  async replaceByProductId(
    replaceByProductIdDto: ReplaceProductTagsByProductIdDto,
  ): Promise<ReplaceSubResourceResponseData> {
    const { productId, tagIds } = replaceByProductIdDto;
    this.logger.log(
      `Replacing all tag relationships for product: ${productId}`,
    );
    try {
      // Delete existing relationships
      await this.removeByProductId(productId);

      // Create new relationships
      return this.bulkCreate(productId, tagIds);
    } catch (error) {
      this.logger.error(
        'Error replacing product-tag relationships',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to replace product-tag relationships',
      });
    }
  }
}
