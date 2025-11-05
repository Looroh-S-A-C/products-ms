import { Injectable, Logger, OnModuleInit, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  CreateProductRecipeDto,
  ReplaceByProductIdDto,
  UpdateProductRecipeDto,
} from './dtos';
import { RpcException } from '@nestjs/microservices';

/**
 * Service responsible for managing product recipes
 * Handles CRUD operations for product-ingredient relationships
 */
@Injectable()
export class ProductRecipeService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductRecipeService.name);

  /**
   * Initialize database connection when module starts
   */
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  /**
   * Create a new product recipe entry
   * @param createProductRecipeDto - Data for creating the recipe entry
   * @returns Created recipe entry with a message (standardized)
   */
  async create(createProductRecipeDto: CreateProductRecipeDto) {
    this.logger.log(
      `Creating product-recipe relationship for product: ${createProductRecipeDto.productId}`,
    );
    try {
      const created = await this.productRecipe.create({
        data: createProductRecipeDto,
        select: {
          id: true,
          quantity: true,
          productId: true,
          unit: true,
          ingredient: {
            select: {
              id: true,
              name: true,
              status: true,
              unit: true,
            },
          },
        },
      });
      return {
        message: `Ingredient [${created.ingredient?.name}] was added to product successfully`,
        ...created,
      };
    } catch (error) {
      this.logger.error(
        'Error creating product-recipe relationship',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to create product recipe',
      });
    }
  }

  /**
   * Find all recipe entries for a product
   * @param productId - Product ID
   * @returns Array of ingredient-only relationships for the product
   */
  async findByProductId(productId: string) {
    this.logger.log(
      `Finding all product-recipe relationships for productId: ${productId}`,
    );
    try {
      const productRecipes = await this.productRecipe.findMany({
        where: { productId },
        omit: {
          ingredientId: true, 
        },
        include: {
          ingredient: {
            select: {
              id: true,
              name: true,
              unit: true,
            },
          },
        },
        orderBy: { ingredient: { name: 'asc' } },
      });
      return productRecipes;
    } catch (error) {
      this.logger.error(
        'Error finding product-recipe relationships by productId',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to find product recipes',
      });
    }
  }

  /**
   * Find recipe entry by ID
   * @param id - Recipe entry ID
   * @returns Ingredient-only relationship details
   * @throws RpcException if recipe entry not found
   */
  async findOne(id: string) {
    try {
      const recipe = await this.productRecipe.findUnique({
        where: { id },
        omit: {
          productId: true,
          ingredientId: true
        },
        include: {
          ingredient: true,
        },
      });
      if (!recipe) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Product-recipe relationship not found`,
        });
      }
      return recipe;
    } catch (error) {
      this.logger.error(
        `Error finding product-recipe relationship with id: ${id}`,
        error.stack || error.message,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to find product recipe',
      });
    }
  }

  /**
   * Update recipe entry by ID
   * @param updateProductRecipeDto - Update data
   * @returns Updated ingredient relationship
   */
  async update(updateProductRecipeDto: UpdateProductRecipeDto) {
    const { id, ...toUpdate } = updateProductRecipeDto;
    await this.findOne(id); // Checks existence and throws RpcException if not found.
    this.logger.log(`Updating product-recipe relationship: ${id}`);
    try {
      const updated = await this.productRecipe.update({
        where: { id },
        data: toUpdate,
        include: {
          ingredient: true,
        },
      });
      return {
        message: `Ingredient [${updated.ingredient?.name}] was updated successfully in product-recipe relationship`,
        // id: updated.id,
        ...updated.ingredient,
      };
    } catch (error) {
      this.logger.error(
        `Error updating product-recipe relationship with id: ${id}`,
        error.stack || error.message,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to update product recipe',
      });
    }
  }

  /**
   * Delete recipe entry by ID
   * @param id - Recipe entry ID
   * @returns Deleted recipe relationship message
   */
  async remove(id: string) {
    const recipe = await this.productRecipe.findUnique({
      where: { id },
      include: { ingredient: true },
    });
    if (!recipe) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Product-recipe relationship not found`,
      });
    }
    this.logger.log(`Deleting product-recipe relationship: ${id}`);
    try {
      await this.productRecipe.delete({
        where: { id },
      });
      return {
        message: `Ingredient [${recipe.ingredient?.name}] was removed from product-recipe successfully`,
        id,
      };
    } catch (error) {
      this.logger.error(
        `Error deleting product-recipe relationship with id: ${id}`,
        error.stack || error.message,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to delete product recipe',
      });
    }
  }

  /**
   * Delete all recipe entries for a product
   * @param productId - Product ID
   * @returns Message and count of deleted relationships
   */
  async removeByProductId(productId: string) {
    this.logger.log(
      `Deleting all product-recipe relationships for product: ${productId}`,
    );
    try {
      const result = await this.productRecipe.deleteMany({
        where: { productId },
      });
      return {
        message: `${
          result.count
        } product-recipe relationships for product: ${productId} were deleted successfully`,
        productId,
        deletedCount: result.count,
      };
    } catch (error) {
      this.logger.error(
        'Error deleting product-recipe relationships by productId',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error.message || 'Unable to delete product recipes by product id',
      });
    }
  }

  /**
   * Bulk create recipe entries for a product
   * @param productId - Product ID
   * @param recipes - Array of recipe data
   * @returns Message and count of created recipes
   */
  async bulkCreate(
    productId: string,
    recipes: Omit<CreateProductRecipeDto, 'productId'>[],
  ) {
    this.logger.log(
      `Bulk creating product-recipe relationships for product: ${productId}`,
    );
    try {
      const recipeData = recipes.map((recipe) => ({
        ...recipe,
        productId,
      }));
      const { count } = await this.productRecipe.createMany({
        data: recipeData,
      });
      return {
        message: `${count} product-recipe relationships for product ${productId} have been created successfully.`,
        productId,
        createdCount: count,
      };
    } catch (error) {
      this.logger.error(
        'Error bulk creating product-recipe relationships',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to bulk create product recipes',
      });
    }
  }

  /**
   * Replace all recipe entries for a product
   * @param replaceByProductIdDto - Replace data with product ID and recipes
   * @returns Message and count of created recipes
   */
  async replaceByProductId(replaceByProductIdDto: ReplaceByProductIdDto) {
    const { productId, recipes } = replaceByProductIdDto;
    this.logger.log(
      `Replacing all product-recipe relationships for product: ${productId}`,
    );
    try {
      // Delete existing relationships
      await this.removeByProductId(productId);

      // Create new relationships
      return this.bulkCreate(productId, recipes);
    } catch (error) {
      this.logger.error(
        'Error replacing product-recipe relationships',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Unable to replace product recipes',
      });
    }
  }
}
