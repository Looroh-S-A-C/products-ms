import { Controller } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import {
  CreateIngredientDto,
  DeleteIngredientDto,
  UpdateIngredientDto,
} from './dtos';
import { PaginationDto } from '../common/dto/pagination.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { SearchByNameDto } from './dtos/search-by-name.dto';

/**
 * Controller for managing ingredients.
 *
 * Exposes microservice message patterns for CRUD operations,
 * delegating business logic to IngredientsService.
 */
@Controller()
export class IngredientsController {
  private readonly logger = new Logger(IngredientsController.name);

  /**
   * Constructor injecting the ingredients service.
   * @param ingredientsService Service layer for ingredient management.
   */
  constructor(private readonly ingredientsService: IngredientsService) {}

  /**
   * Handles the creation of a new ingredient.
   * @param createIngredientDto Data transfer object for ingredient creation.
   * @returns The created ingredient entity.
   */
  @MessagePattern('ingredients.create')
  async create(@Payload() createIngredientDto: CreateIngredientDto) {
    this.logger.debug('Creating a new ingredient');
    try {
      return await this.ingredientsService.create(createIngredientDto);
    } catch (err) {
      this.logger.error('Error creating ingredient', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Retrieves paginated list of all ingredients.
   * @param paginationDto Pagination parameters.
   * @returns An object containing ingredients data and metadata.
   */
  @MessagePattern('ingredients.findAll')
  async findAll(@Payload() paginationDto: PaginationDto) {
    this.logger.debug(
      `Fetching all ingredients. Page: ${paginationDto.page}, Limit: ${paginationDto.limit}`,
    );
    try {
      return await this.ingredientsService.findAll(paginationDto);
    } catch (err) {
      this.logger.error('Error fetching all ingredients', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Searches ingredients by name.
   * @param name Name of the ingredient to search for.
   * @returns Array of matching ingredients.
   */
  @MessagePattern('ingredients.searchByName')
  async searchByName(@Payload() searchByNameDto: SearchByNameDto) {
    this.logger.debug(`Searching ingredients with name: ${searchByNameDto.name}`);
    try {
      return await this.ingredientsService.searchByName(searchByNameDto);
    } catch (err) {
      this.logger.error(
        `Error searching ingredients by name: ${searchByNameDto.name}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Retrieves an ingredient by its unique identifier.
   * @param id Ingredient identifier.
   * @returns The ingredient entity if found.
   */
  @MessagePattern('ingredients.findOne')
  async findOne(@Payload() id: string) {
    this.logger.debug(`Fetching ingredient with id: ${id}`);
    try {
      return await this.ingredientsService.findOne(id);
    } catch (err) {
      this.logger.error(`Error fetching ingredient with id: ${id}`, err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Updates an existing ingredient.
   * @param updateIngredientDto Data transfer object containing update details.
   * @returns The updated ingredient entity.
   */
  @MessagePattern('ingredients.update')
  async update(@Payload() updateIngredientDto: UpdateIngredientDto) {
    this.logger.debug(`Updating ingredient with id: ${updateIngredientDto.id}`);
    try {
      return await this.ingredientsService.update(updateIngredientDto);
    } catch (err) {
      this.logger.error(
        `Error updating ingredient with id: ${updateIngredientDto.id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Soft deletes an ingredient by marking it as deleted.
   * @param deleteIngredientDto Data transfer object for deletion details.
   * @returns The updated (soft deleted) ingredient entity.
   */
  @MessagePattern('ingredients.delete')
  async delete(@Payload() deleteIngredientDto: DeleteIngredientDto) {
    this.logger.debug(`Deleting ingredient with id: ${deleteIngredientDto.id}`);
    try {
      return await this.ingredientsService.remove(deleteIngredientDto);
    } catch (err) {
      this.logger.error(
        `Error deleting ingredient with id: ${deleteIngredientDto.id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }
}
