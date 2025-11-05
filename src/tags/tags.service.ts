import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateTagDto, DeleteTagDto, UpdateTagDto } from './dtos';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';
import { SearchByNameDto } from './dtos/search-by-name.dto';

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
  async create(createTagDto: CreateTagDto) {
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
  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const where = {
      deletedAt: null,
    };

    const total = await this.tag.count({ where });
    const lastPage = Math.ceil(total / limit);

    return {
      list: await this.tag.findMany({
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
      }),
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
  async findOne(id: string) {
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
  async update(updateTagDto: UpdateTagDto) {
    const { id, ...toUpdate } = updateTagDto;
    await this.findOne(id);

    this.logger.log(`Updating tag: ${id}`);
    return this.tag.update({
      where: { id },
      data: toUpdate,
    });
  }

  /**
   * Soft delete tag by ID
   * @param deleteTagDto - Delete data including deletedBy
   * @returns Updated tag
   */
  async remove(deleteTagDto: DeleteTagDto) {
    const { id, deletedBy } = deleteTagDto;
    await this.findOne(id);

    this.logger.log(`Soft deleting tag: ${id}`);
    return this.tag.update({
      where: { id },
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
  async validateTags(ids: string[]) {
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
  async searchByName(searchByName: SearchByNameDto) {
    const { limit, page, name } = searchByName;
    const where = {
      deletedAt: null,
    };

    const total = await this.tag.count({
      where: { name: { contains: name, mode: 'insensitive' }, ...where },
    });
    const lastPage = Math.ceil(total / limit);
    const tagsList = await this.tag.findMany({
      where: { name: { contains: name, mode: 'insensitive' }, ...where },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
    });
    return {
      list: tagsList,
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
  async findByProductId(productId: string) {
    return this.tag.findMany({
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
  }

  /**
   * Get most used tags
   * @param limit - Number of tags to return
   * @returns Array of most used tags
   */
  async getMostUsed(limit: number = 10) {
    return this.tag.findMany({
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
        } ,
      },
    });
  }
}
