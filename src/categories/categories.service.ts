import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  DeleteCategoryDto,
} from './dtos';
import { PaginationDto } from '../common';
import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class CategoriesService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(CategoriesService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('CategoriesService connected to the database');
  }

  /**
   * Create a new category
   */
  async create(createCategoryDto: CreateCategoryDto) {
    return await this.category.create({
      data: createCategoryDto,
    });
  }

  /**
   * Find all categories with pagination
   */
  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const where = {
      status: true,
      deletedAt: null,
    };
    const total = await this.category.count({ where });
    const lastPage = Math.ceil(total / limit);
    return {
      list: await this.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  /**
   * Find one category by ID
   */
  async findOne(id: string) {
    const category = await this.category.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
    if (!category) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Category with id ${id} not found`,
      });
    }
    return category;
  }

  /**
   * Update a category
   */
  async update(updateCategoryDto: UpdateCategoryDto) {
    const { id, ...data } = updateCategoryDto;
    await this.findOne(id);
    return this.category.update({
      where: { id, deletedAt: null },
      data,
    });
  }

  /**
   * Soft delete a category
   */
  async delete(deleteCategoryDto: DeleteCategoryDto) {
    const { id, deletedBy } = deleteCategoryDto;
    await this.findOne(id);
    return this.category.update({
      where: { id },
      data: {
        status: false,
        deletedBy: deletedBy,
        deletedAt: new Date(),
      },
    });
  }
}
