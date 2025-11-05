import { Injectable, Logger, OnModuleInit, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  CreateProductQuestionDto,
  FindByProductIdAndTypeDto,
  ReplaceByProductIdDto,
  UpdateProductQuestionDto,
} from './dtos';
import { RpcException } from '@nestjs/microservices';

/**
 * Service responsible for managing product-question relationships
 * Handles CRUD operations for product-question associations
 */
@Injectable()
export class ProductQuestionService
  extends PrismaClient
  implements OnModuleInit
{
  private readonly logger = new Logger(ProductQuestionService.name);

  /**
   * Initialize database connection when module starts
   */
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  /**
   * Create a new product-question relationship
   * @param createProductQuestionDto - Data for creating the relationship
   * @returns Created product-question relationship
   */
  async create(createProductQuestionDto: CreateProductQuestionDto) {
    this.logger.log(
      `Creating product-question relationship for product: ${createProductQuestionDto.productId}`,
    );
    try {
      const created = await this.questionProduct.create({
        data: createProductQuestionDto,
        select: {
          id: true,
          position: true,
          itemType: true,
          question: {
            omit: {
              createdAt: true,
              createdBy: true,
              deletedAt: true,
              deletedBy: true,
              updatedAt: true,
              updatedBy: true,
            },
          },
        },
      });
      return created;
    } catch (error) {
      this.logger.error(
        'Error creating product-question relationship',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error.message || 'Unable to create product-question relationship',
      });
    }
  }

  /**
   * Find all questions for a product
   * @param productId - Product ID
   * @returns Array of product-question relationships
   */
  async findByProductId(productId: string) {
    this.logger.log(
      `Finding all product-question relationships for productId: ${productId}`,
    );
    try {
      const result = await this.questionProduct.findMany({
        where: { productId },
        omit: {
          questionId: true,
          productId: true,
        },
        include: {
          question: {
            include: {
              translations: true,
            },
          },
        },
        orderBy: { position: 'asc' },
      });
      return result;
    } catch (error) {
      this.logger.error(
        'Error finding product-question relationships by productId',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error.message || 'Unable to find product-question relationships',
      });
    }
  }

  /**
   * Find all products for a question
   * @param questionId - Question ID
   * @returns Array of product-question relationships
   */
  async findByQuestionId(questionId: string) {
    this.logger.log(
      `Finding all product-question relationships for questionId: ${questionId}`,
    );
    try {
      const result = await this.questionProduct.findMany({
        where: { questionId },
        include: {
          product: true,
          question: true,
        },
        orderBy: { product: { name: 'asc' } },
      });
      return result;
    } catch (error) {
      this.logger.error(
        'Error finding product-question relationships by questionId',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error.message ||
          'Unable to find product-question relationships by questionId',
      });
    }
  }

  /**
   * Find product-question relationship by ID
   * @param id - Relationship ID
   * @returns Product-question relationship details
   * @throws RpcException if relationship not found
   */
  async findOne(id: string) {
    try {
      const productQuestion = await this.questionProduct.findUnique({
        where: { id },
        include: {
          product: true,
          question: {
            include: {
              translations: true,
            },
          },
        },
      });
      if (!productQuestion) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Product-question relationship with id ${id} not found`,
        });
      }
      return productQuestion;
    } catch (error) {
      this.logger.error(
        `Error finding product-question relationship with id: ${id}`,
        error.stack || error.message,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error.message || 'Unable to find product-question relationship',
      });
    }
  }

  /**
   * Update product-question relationship by ID
   * @param updateProductQuestionDto - Update data
   * @returns Updated product-question relationship
   */
  async update(updateProductQuestionDto: UpdateProductQuestionDto) {
    const { id, ...toUpdate } = updateProductQuestionDto;
    await this.findOne(id); // Throws if not found.
    this.logger.log(`Updating product-question relationship: ${id}`);
    try {
      const updated = await this.questionProduct.update({
        where: { id },
        data: toUpdate,
        select: {
          id: true,
          position: true,
          itemType: true,
          question: {
            omit: {
              createdAt: true,
              createdBy: true,
              deletedAt: true,
              deletedBy: true,
              updatedAt: true,
              updatedBy: true,
            },
          },
        },
      });
      return updated;
    } catch (error) {
      this.logger.error(
        `Error updating product-question relationship with id: ${id}`,
        error.stack || error.message,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error.message || 'Unable to update product-question relationship',
      });
    }
  }

  /**
   * Delete product-question relationship by ID
   * @param id - Relationship ID
   * @returns Deleted product-question relationship
   */
  async remove(id: string) {
    await this.findOne(id);
    this.logger.log(`Deleting product-question relationship: ${id}`);
    try {
      const deleted = await this.questionProduct.delete({
        where: { id },
      });
      return deleted;
    } catch (error) {
      this.logger.error(
        `Error deleting product-question relationship with id: ${id}`,
        error.stack || error.message,
      );
      if (error instanceof RpcException) throw error;
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error.message || 'Unable to delete product-question relationship',
      });
    }
  }

  /**
   * Delete all question relationships for a product
   * @param productId - Product ID
   * @returns Count of deleted relationships
   */
  async removeByProductId(productId: string) {
    this.logger.log(
      `Deleting all question relationships for product: ${productId}`,
    );
    try {
      const result = await this.questionProduct.deleteMany({
        where: { productId },
      });
      return {
        message: `${result.count} product-question relationships for product: ${productId} were deleted successfully`,
        productId,
        deletedCount: result.count,
      };
    } catch (error) {
      this.logger.error(
        'Error deleting product-question relationships by productId',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error.message ||
          'Unable to delete product-question relationships by product id',
      });
    }
  }

  /**
   * Bulk create question relationships for a product
   * @param productId - Product ID
   * @param questions - Array of question data
   * @returns Message and count of created relationships
   */
  async bulkCreate(
    productId: string,
    questions: Omit<CreateProductQuestionDto, 'productId'>[],
  ) {
    this.logger.log(
      `Bulk creating question relationships for product: ${productId}`,
    );
    try {
      const relationshipData = questions.map((question, index) => ({
        ...question,
        productId,
        position: question.position || index,
      }));

      const result = await this.questionProduct.createMany({
        data: relationshipData,
      });

      return {
        message: `${result.count} product-question relationships for product ${productId} have been created successfully.`,
        productId,
        createdCount: result.count,
      };
    } catch (error) {
      this.logger.error(
        'Error bulk creating product-question relationships',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error.message ||
          'Unable to bulk create product-question relationships',
      });
    }
  }

  /**
   * Replace all question relationships for a product
   * @param replaceByProductId - Replace data with product ID and questions
   * @returns Message and count of created relationships
   */
  async replaceByProductId(replaceByProductId: ReplaceByProductIdDto) {
    const { productId, questions } = replaceByProductId;
    this.logger.log(
      `Replacing all question relationships for product: ${productId}`,
    );
    try {
      // Delete existing relationships
      await this.removeByProductId(productId);

      // Create new relationships
      return this.bulkCreate(productId, questions);
    } catch (error) {
      this.logger.error(
        'Error replacing product-question relationships',
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error.message || 'Unable to replace product-question relationships',
      });
    }
  }

  /**
   * Find questions by type for a product
   * @param findByProductIdAndTypeDto - Data with productId and type
   * @returns Array of product-question relationships
   */
  async findByProductIdAndType(
    findByProductIdAndTypeDto: FindByProductIdAndTypeDto,
  ) {
    const { productId, type } = findByProductIdAndTypeDto;
    let include = {};
    switch (type) {
      case 'ANSWER':
        include = {
          product: {
            include: {
              translations: true,
            },
          },
        };
        break;
      case 'QUESTION':
        include = {
          question: {
            include: {
              translations: true,
            },
          },
        };
        break;
    }
    this.logger.log(
      `Finding product-question relationships for productId: ${productId} and type: ${type}`,
    );
    try {
      const result = await this.questionProduct.findMany({
        where: {
          productId,
          itemType: type,
        },
        omit: {
          productId: true,
          questionId: true,
        },
        include,
        orderBy: { position: 'asc' },
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Error finding product-question relationships for productId: ${productId} and type: ${type}`,
        error.stack || error.message,
      );
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          error.message ||
          'Unable to find product-question relationships by type',
      });
    }
  }
}
