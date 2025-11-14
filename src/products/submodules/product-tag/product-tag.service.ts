import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient, Tag } from '@prisma/client';
import {
  CreateProductTagDto,
  FindOneDto,
  RemoveDto,
  ReplaceByProductIdDto,
} from './dtos';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { EVENTS, NATS_SERVICE } from 'src/common/constants';

/**
 * Service responsible for managing product-tag relationships
 * Handles CRUD operations for product-tag associations
 */
@Injectable()
export class ProductTagService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductTagService.name);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }
  /**
   * Initialize database connection when module starts
   */
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  /**
   * Create a new product-tag relationship
   * @param createProductTagDto - Data for creating the relationship
   * @returns Created product-tag relationship
   */
  async create(createProductTagDto: CreateProductTagDto) {
    this.logger.log(
      `Creating product-tag relationship for product: ${createProductTagDto.productId}`,
    );
    const created = await this.productTag.create({
      data: createProductTagDto,
      omit: {
        productId: true,
        tagId: true,
      },
      include: {
        tag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    this.client.emit(EVENTS.PRODUCT_TAG_CREATED, {
      productId: createProductTagDto.productId,
    });
    return {
      message: `Tag: [${created.tag.name}] was added successful`,
      productId: createProductTagDto.productId,
      ...created,
    };
  }

  /**
   * Find all tags for a product
   * @param productId - Product ID
   * @returns Array of product-tag relationships
   */
  async findByProductId(productId: string) {
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
      ...proTag['tag'],
    }));
  }

  /**
   * Find all products for a tag
   * @param tagId - Tag ID
   * @returns Array of product-tag relationships
   */
  async findByTagId(tagId: string) {
    return this.productTag.findMany({
      where: { tagId },
      include: {
        product: true,
        tag: true,
      },
      orderBy: { product: { name: 'asc' } },
    });
  }

  /**
   * Find product-tag relationship by IDs
   * @param findOneDto - Find data with product ID and tag ID
   * @returns Product-tag relationship details
   * @throws NotFoundException if relationship not found
   */
  async findOne(findOneDto: FindOneDto) {
    const { productId, tagId } = findOneDto;
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
        message: `Product-tag relationship not found`,
      });
    }

    return {
      ...productTag.tag,
    };
  }

  /**
   * Delete product-tag relationship by IDs
   * @param removeDto - Remove data with product ID and tag ID
   * @returns Deleted product-tag relationship
   */
  async remove(removeDto: RemoveDto) {
    const { productId, tagId } = removeDto;
    await this.findOne({ productId, tagId });

    this.logger.log(`Deleting product-tag relationship: ${productId}-${tagId}`);
    await this.productTag.delete({
      where: {
        productId_tagId: {
          productId,
          tagId,
        },
      },
    });
    return {
      message: `Product-tag relationship: ${productId}-${tagId} was deleted successfully`,
    };
  }

  /**
   * Delete all tag relationships for a product
   * @param productId - Product ID
   * @returns Number of deleted relationships
   */
  async removeByProductId(productId: string) {
    this.logger.log(`Deleting all tag relationships for product: ${productId}`);
    const result = await this.productTag.deleteMany({
      where: { productId },
    });
    return {
      message: `${result.count} tag relationships for product: ${productId} were deleted successfully`,
    };
  }

  /**
   * Bulk create tag relationships for a product
   * @param productId - Product ID
   * @param tagIds - Array of tag IDs
   * @returns Array of created relationships
   */
  async bulkCreate(productId: string, tagIds: string[]) {
    this.logger.log(
      `Bulk creating tag relationships for product: ${productId}`,
    );

    const relationshipData = tagIds.map((tagId) => ({
      productId,
      tagId,
    }));

    const { count } = await this.productTag.createMany({
      data: relationshipData,
    });

    if (count) this.client.emit(EVENTS.PRODUCT_TAG_CREATED, { productId });

    return {
      message: `${count} tag relationships for product ${productId} have been created successfully.`,
      productId,
      createdCount: count,
    };
  }

  /**
   * Replace all tag relationships for a product
   * @param replaceByProductIdDto - Replace data with product ID and tag IDs
   * @returns Array of created relationships
   */
  async replaceByProductId(replaceByProductIdDto: ReplaceByProductIdDto) {
    const { productId, tagIds } = replaceByProductIdDto;
    this.logger.log(
      `Replacing all tag relationships for product: ${productId}`,
    );

    // Delete existing relationships
    await this.removeByProductId(productId);

    // Create new relationships
    return this.bulkCreate(productId, tagIds);
  }
}
