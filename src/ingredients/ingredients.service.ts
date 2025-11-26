import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  CreateIngredientDto,
  UpdateIngredientDto,
  DeleteIngredientDto,
  PaginationDto,
  SearchByNameDto,
  Ingredient,
  PaginationResponse,
} from 'qeai-sdk';
import { RpcException } from '@nestjs/microservices';

/**
 * Service responsible for managing ingredients in the system
 * Handles CRUD operations for ingredients and their relationships
 */
@Injectable()
export class IngredientsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(IngredientsService.name);

  /**
   * Initialize database connection when module starts
   */
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  /**
   * Create a new ingredient
   * @param createIngredientDto - Data for creating the ingredient
   * @returns Created ingredient
   */
  async create(createIngredientDto: CreateIngredientDto): Promise<Ingredient> {
    this.logger.log(`Creating ingredient: ${createIngredientDto.name}`);
    return this.ingredient.create({
      data: createIngredientDto,
    });
  }

  /**
   * Find all ingredients with pagination
   * @param paginationDto - Pagination parameters
   * @returns Paginated list of ingredients
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Ingredient>> {
    const { limit, page } = paginationDto;
    const where = {
      status: true,
      deletedAt: null,
    };

    const total = await this.ingredient.count({ where });
    const lastPage = Math.ceil(total / limit);

    return {
      list: await this.ingredient.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  /**
   * Find ingredient by ID
   * @param id - Ingredient ID
   * @returns Ingredient details
   * @throws NotFoundException if ingredient not found
   */
  async findOne(id: string): Promise<Ingredient> {
    const ingredient = await this.ingredient.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!ingredient) {
      throw new RpcException({
        status: 404,
        message: `Ingredient with id ${id} not found`,
      });
    }

    return ingredient;
  }

  /**
   * Update ingredient by ID
   * @param id - Ingredient ID
   * @param updateIngredientDto - Update data
   * @returns Updated ingredient
   */
  async update(updateIngredientDto: UpdateIngredientDto): Promise<Ingredient> {
    const { ingredientId, ...toUpdate } = updateIngredientDto;
    await this.findOne(ingredientId!);

    this.logger.log(`Updating ingredient: ${ingredientId}`);
    return this.ingredient.update({
      where: { id: ingredientId },
      data: toUpdate,
    });
  }

  /**
   * Soft delete ingredient by ingredientId
   * @param deleteIngredientDto - Delete data including deletedBy
   * @returns Updated ingredient
   */
  async remove(deleteIngredientDto: DeleteIngredientDto): Promise<Ingredient> {
    const { ingredientId, deletedBy } = deleteIngredientDto;
    await this.findOne(ingredientId);

    this.logger.log(`Soft deleting ingredient: ${ingredientId}`);
    return this.ingredient.update({
      where: { id: ingredientId },
      data: {
        status: false,
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  /**
   * Validate that ingredients exist by their IDs
   * @param ids - Array of ingredient IDs
   * @returns Array of valid ingredients
   * @throws NotFoundException if any ingredient not found
   */
  // async validateIngredients(ids: string[]) {
  //   const uniqueIds = Array.from(new Set(ids));
  //   const ingredients = await this.ingredient.findMany({
  //     where: {
  //       id: { in: uniqueIds },
  //       status: true,
  //       deletedAt: null,
  //     },
  //   });

  //   if (ingredients.length !== uniqueIds.length) {
  //     throw new RpcException({
  //       status: 404,
  //       message: 'Some ingredients were not found',
  //     });
  //   }

  //   return ingredients;
  // }

  /**
   * Search ingredients by name
   * @param name - Name to search for
   * @param paginationDto - Pagination parameters
   * @returns Paginated list of of matching ingredients
   */
  async searchByName(
    searchByName: SearchByNameDto,
  ): Promise<PaginationResponse<Ingredient>> {
    const { limit, page, name } = searchByName;
    const where = {
      status: true,
      deletedAt: null,
    };

    const total = await this.ingredient.count({
      where: { name: { contains: name, mode: 'insensitive' }, ...where },
    });
    const lastPage = Math.ceil(total / limit);
    const ingredientsList = await this.ingredient.findMany({
      where: { name: { contains: name, mode: 'insensitive' }, ...where },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
    });
    return {
      list: ingredientsList,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }
}
