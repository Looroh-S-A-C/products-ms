import {
  Injectable,
  Logger,
  OnModuleInit,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  CreateProductRecipeDto,
  PRODUCT_EVENTS,
  ReplaceProductRecipesByProductIdDto,
  UpdateProductRecipeDto,
  RecipeRelationship,
  SubResourceResponseData,
  DeleteSubResourceResponseData,
  ReplaceSubResourceResponseData,
} from 'qeai-sdk';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { SERVICES } from 'qeai-sdk';

/**
 * Service responsible for managing product-recipe relationships.
 * Handles CRUD operations for product-ingredient associations.
 */
@Injectable()
export class ProductRecipeService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductRecipeService.name);

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
   * Create a new product-recipe relationship.
   * @param createProductRecipeDto - Data for creating the relationship
   * @returns Created product-recipe relationship
   */
  async create(
    createProductRecipeDto: CreateProductRecipeDto,
  ): Promise<SubResourceResponseData<RecipeRelationship, 'relationship'>> {
    this.logger.log(
      `Creating product-recipe relationship for product: ${createProductRecipeDto.productId}`,
    );
    try {
      const created = await this.productRecipe.create({
        data: createProductRecipeDto,
        select: {
          product: {
            select: { name: true },
          },
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

      this.client.emit(PRODUCT_EVENTS.RECIPE_CREATED, {
        productId: created.productId,
      });
      const {
        productId,
        product: { name },
        ...ingredient
      } = created;
      return {
        message: `Ingredient [${created.ingredient?.name}] was added to product [${name}] successfully`,
        productId: productId,
        relationship: ingredient,
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
   * Find all recipe entries for a product.
   * @param productId - Product ID
   * @returns Array of product-recipe relationships
   */
  async findByProductId(productId: string): Promise<RecipeRelationship[]> {
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
              status: true,
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
   * Find a product-recipe relationship by ID.
   * @param id - Recipe relationship ID
   * @returns Product-recipe relationship details
   * @throws RpcException if relationship not found
   */
  async findOne(id: string): Promise<RecipeRelationship> {
    try {
      const recipe = await this.productRecipe.findUnique({
        where: { id },
        omit: {
          productId: true,
          ingredientId: true,
        },
        include: {
          ingredient: true,
        },
      });
      if (!recipe) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Product-recipe relationship with id ${id} not found`,
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
   * Update a product-recipe relationship by ID.
   * @param updateProductRecipeDto - Update data
   * @returns Updated relationship
   */
  async update(
    updateProductRecipeDto: UpdateProductRecipeDto,
  ): Promise<SubResourceResponseData<RecipeRelationship, 'relationship'>> {
    const { productRecipeId, ...toUpdate } = updateProductRecipeDto;
    await this.findOne(productRecipeId); // Checks existence and throws RpcException if not found.
    this.logger.log(`Updating product-recipe relationship: ${productRecipeId}`);
    try {
      const updated = await this.productRecipe.update({
        where: { id: productRecipeId },
        data: toUpdate,
        include: {
          ingredient: true,
        },
      });
      return {
        message: `Ingredient [${updated.ingredient?.name}] was updated successfully in product-recipe relationship`,
        productId: updated.productId,
        relationship: updated,
      };
    } catch (error) {
      this.logger.error(
        `Error updating product-recipe relationship with id: ${productRecipeId}`,
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
   * Delete a product-recipe relationship by ID.
   * @param id - Recipe relationship ID
   * @returns Delete response object
   */
  async remove(id: string): Promise<DeleteSubResourceResponseData> {
    const recipe = await this.productRecipe.findUnique({
      where: { id },
      include: { ingredient: { select: { name: true, id: true } } },
    });
    if (!recipe) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Product-recipe relationship with id ${id} not found`,
      });
    }
    this.logger.log(`Deleting product-recipe relationship: ${id}`);
    try {
      await this.productRecipe.delete({
        where: { id },
      });
      return {
        message: `Ingredient [${recipe.ingredient?.name}] was removed from product-recipe successfully`,
        productId: recipe.productId,
        deletedCount: 1,
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
   * Delete all product-recipe relationships for a product.
   * @param productId - Product ID
   * @returns Count of deleted relationships
   */
  async removeByProductId(
    productId: string,
  ): Promise<DeleteSubResourceResponseData> {
    this.logger.log(
      `Deleting all product-recipe relationships for product: ${productId}`,
    );
    try {
      const result = await this.productRecipe.deleteMany({
        where: { productId },
      });
      return {
        message: `${result.count} product-recipe relationships for product: [${productId}] were deleted successfully`,
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
   * Bulk create product-recipe relationships for a product.
   * @param productId - Product ID
   * @param recipes - Array of recipe data
   * @returns Message and count of created recipes
   */
  async bulkCreate(
    productId: string,
    recipes: Omit<CreateProductRecipeDto, 'productId'>[],
  ): Promise<ReplaceSubResourceResponseData> {
    this.logger.log(
      `Bulk creating product-recipe relationships for product: ${productId}`,
    );
    try {
      const recipeData = recipes.map((recipe) => ({
        ...recipe,
        productId,
      }));

      const result = await this.productRecipe.createMany({
        data: recipeData,
      });

      if (result.count)
        this.client.emit(PRODUCT_EVENTS.RECIPE_CREATED, { productId });

      return {
        message: `${result.count} product-recipe relationships for product ${productId} have been created successfully.`,
        productId,
        createdCount: result.count,
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
   * Replace all product-recipe relationships for a product.
   * @param replaceByProductIdDto - Replace data with product ID and recipes
   * @returns Message and count of created recipes
   */
  async replaceByProductId(
    replaceByProductIdDto: ReplaceProductRecipesByProductIdDto,
  ): Promise<ReplaceSubResourceResponseData> {
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
