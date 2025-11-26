import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  CreateTagDto,
  DeleteTagDto,
  UpdateTagDto,
  PaginationDto,
  SearchByNameDto,
  Tag,
  PaginationResponse,
} from 'qeai-sdk';
import { RpcException } from '@nestjs/microservices';

/**
 * Service responsible for managing tags in the system
 * Handles CRUD operations for tags and their relationships with products
 */
@Injectable()
export class TagsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(TagsService.name);

  /**
   * Initialize database connection when module starts
   */
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  /**
   * Create a new tag
   * @param createTagDto - Data for creating the tag
   * @returns Created tag
   */
  async create(createTagDto: CreateTagDto): Promise<Tag> {
    this.logger.log(`Creating tag: ${createTagDto.name}`);
    return this.tag.create({
      data: createTagDto,
    });
  }

  /**
   * Find all tags with pagination
   * @param paginationDto - Pagination parameters
   * @returns Paginated list of tags
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Tag>> {
    const { limit, page } = paginationDto;
    const where = {
      deletedAt: null,
    };

    const total = await this.tag.count({ where });
    const lastPage = Math.ceil(total / limit);
    const tags = await this.tag.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
    return {
      list: tags,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  /**
   * Find tag by ID
   * @param id - Tag ID
   * @returns Tag details
   * @throws NotFoundException if tag not found
   */
  async findOne(id: string): Promise<Tag> {
    const tag = await this.tag.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!tag) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Tag with id ${id} not found`,
      });
    }

    return tag;
  }

  /**
   * Update tag by ID
   * @param id - Tag ID
   * @param updateTagDto - Update data
   * @returns Updated tag
   */
  async update(updateTagDto: UpdateTagDto): Promise<Tag> {
    const { tagId, ...toUpdate } = updateTagDto;
    await this.findOne(tagId!);

    this.logger.log(`Updating tag: ${tagId}`);
    return this.tag.update({
      where: { id: tagId },
      data: toUpdate,
    });
  }

  /**
   * Soft delete tag by tagId
   * @param deleteTagDto - Delete data including deletedBy
   * @returns Updated tag
   */
  async remove(deleteTagDto: DeleteTagDto): Promise<Tag> {
    const { tagId, deletedBy } = deleteTagDto;
    await this.findOne(tagId);

    this.logger.log(`Soft deleting tag: ${tagId}`);
    return this.tag.update({
      where: { id: tagId },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  /**
   * Validate that tags exist by their IDs
   * @param ids - Array of tag IDs
   * @returns Array of valid tags
   * @throws NotFoundException if any tag not found
   */
  async validateTags(ids: string[]): Promise<Tag[]> {
    const uniqueIds = Array.from(new Set(ids));
    const tags = await this.tag.findMany({
      where: {
        id: { in: uniqueIds },
        deletedAt: null,
      },
    });

    if (tags.length !== uniqueIds.length) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Some tags were not found',
      });
    }

    return tags;
  }

  /**
   * Search tags by name
   * @param name - Name to search for
   * @returns Array of matching tags
   */
  async searchByName(
    searchByName: SearchByNameDto,
  ): Promise<PaginationResponse<Tag>> {
    const { limit, page, name } = searchByName;
    const where = {
      deletedAt: null,
    };

    const total = await this.tag.count({
      where: { name: { contains: name, mode: 'insensitive' }, ...where },
    });
    const lastPage = Math.ceil(total / limit);
    const tags = await this.tag.findMany({
      where: { name: { contains: name, mode: 'insensitive' }, ...where },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
    });
    return {
      list: tags,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  /**
   * Find tags by product ID
   * @param productId - Product ID
   * @returns Array of tags associated with the product
   */
  async findByProductId(productId: string): Promise<Tag[]> {
    const tags = await this.tag.findMany({
      where: {
        products: {
          some: {
            productId,
          },
        },
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
    });
    return tags;
  }
  /**
   * Get most used tags
   * @param limit - Number of tags to return
   * @returns Array of most used tags
   */
  async getMostUsed(limit: number = 10): Promise<Tag[]> {
    const tags = await this.tag.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        products: {
          _count: 'desc',
        },
      },
      take: limit,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
    return tags;
  }
}
