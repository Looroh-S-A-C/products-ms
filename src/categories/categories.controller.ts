import { Controller, Logger } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CreateCategoryDto, UpdateCategoryDto, DeleteCategoryDto } from './dtos';
import { PaginationDto } from '../common/dto/pagination.dto';

/**
 * Controller for managing categories.
 * Handles NATS message patterns for category operations and provides logging/error handling.
 */
@Controller()
export class CategoriesController {
  private readonly logger = new Logger(CategoriesController.name);

  /**
   * Constructor injecting the categories service.
   * @param categoriesService Service layer for category management.
   */
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Handles the creation of a new category.
   * @param createCategoryDto Category creation data.
   * @returns Created category.
   */
  @MessagePattern('category.create')
  async createCategory(@Payload() createCategoryDto: CreateCategoryDto) {
    this.logger.debug('Creating a new category');
    try {
      return await this.categoriesService.create(createCategoryDto);
    } catch (err) {
      this.logger.error('Error creating category', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Retrieves all categories with pagination support.
   * @param paginationDto Pagination parameters.
   * @returns Paginated list of categories.
   */
  @MessagePattern('category.find-all')
  async findAllCategories(@Payload() paginationDto: PaginationDto) {
    this.logger.debug(
      `Fetching all categories. Page: ${paginationDto.page}, Limit: ${paginationDto.limit}`,
    );
    try {
      return await this.categoriesService.findAll(paginationDto);
    } catch (err) {
      this.logger.error('Error fetching all categories', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Retrieves a specific category by its ID.
   * @param id Category ID.
   * @returns The category details.
   */
  @MessagePattern('category.find-one')
  async findOneCategory(@Payload('id') id: string) {
    this.logger.debug(`Fetching category with id: ${id}`);
    try {
      return await this.categoriesService.findOne(id);
    } catch (err) {
      this.logger.error(`Error fetching category with id: ${id}`, err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Updates an existing category.
   * @param updateCategoryDto Data containing ID and update information.
   * @returns Updated category.
   */
  @MessagePattern('category.update')
  async updateCategory(@Payload() updateCategoryDto: UpdateCategoryDto) {
    this.logger.debug(`Updating category with id: ${updateCategoryDto.id}`);
    try {
      return await this.categoriesService.update(updateCategoryDto);
    } catch (err) {
      this.logger.error(
        `Error updating category with id: ${updateCategoryDto.id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Soft deletes a category by ID.
   * @param deleteCategoryDto Data containing ID and deletedBy info.
   * @returns Deleted (soft deleted) category.
   */
  @MessagePattern('category.delete')
  async deleteCategory(@Payload() deleteCategoryDto: DeleteCategoryDto) {
    this.logger.debug(`Deleting category with id: ${deleteCategoryDto.id}`);
    try {
      return await this.categoriesService.delete(deleteCategoryDto);
    } catch (err) {
      this.logger.error(
        `Error deleting category with id: ${deleteCategoryDto.id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }
}
