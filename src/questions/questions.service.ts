import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient, QuestionType } from '@prisma/client';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  DeleteQuestionDto,
  SearchByNameDto,
  PaginationDto,
  Question,
  PaginationResponse,
  QuestionRelationship,
} from 'qeai-sdk';
import { RpcException } from '@nestjs/microservices';

/**
 * Service responsible for managing questions in the system
 * Handles CRUD operations for questions and their relationships with products
 */
@Injectable()
export class QuestionsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(QuestionsService.name);

  /**
   * Initialize database connection when module starts
   */
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  /**
   * Create a new question
   * @param createQuestionDto - Data for creating the question
   * @returns Created question
   */
  async create(createQuestionDto: CreateQuestionDto): Promise<Question> {
    this.logger.log(`Creating question: ${createQuestionDto.name}`);
    return this.question.create({
      data: createQuestionDto,
    });
  }

  /**
   * Find all questions with pagination
   * @param paginationDto - Pagination parameters
   * @returns Paginated list of questions
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Question>> {
    const { limit, page } = paginationDto;
    const where = {
      isActive: true,
      deletedAt: null,
    };

    const total = await this.question.count({ where });
    const lastPage = Math.ceil(total / limit);

    const questions = await this.question.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        translations: true,
      },
    });

    return {
      list: questions,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  /**
   * Find question by ID
   * @param id - Question ID
   * @returns Question details
   * @throws NotFoundException if question not found
   */
  async findOne(id: string): Promise<Question> {
    const question = await this.question.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        translations: true,
        questionProducts: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!question) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Question with id ${id} not found`,
      });
    }

    return question;
  }

  /**
   * Update question by ID
   * @param id - Question ID
   * @param updateQuestionDto - Update data
   * @returns Updated question
   */
  async update(updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const { questionId, ...toUpdate } = updateQuestionDto;
    await this.findOne(questionId!);

    this.logger.log(`Updating question: ${questionId}`);
    return this.question.update({
      where: { id: questionId },
      data: toUpdate,
    });
  }

  /**
   * Soft delete question by questionId
   * @param deleteQuestionDto - Delete data including deletedBy
   * @returns Updated question
   */
  async remove(deleteQuestionDto: DeleteQuestionDto): Promise<Question> {
    const { questionId, deletedBy } = deleteQuestionDto;
    await this.findOne(questionId);

    this.logger.log(`Soft deleting question: ${questionId}`);
    return this.question.update({
      where: { id: questionId },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  /**
   * Validate that questions exist by their IDs
   * @param ids - Array of question IDs
   * @returns Array of valid questions
   * @throws NotFoundException if any question not found
   */
  async validateQuestions(ids: string[]): Promise<Question[]> {
    const uniqueIds = Array.from(new Set(ids));
    const questions = await this.question.findMany({
      where: {
        id: { in: uniqueIds },
        isActive: true,
        deletedAt: null,
      },
    });

    if (questions.length !== uniqueIds.length) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Some questions were not found',
      });
    }

    return questions;
  }

  /**
   * Find questions by type
   * @param type - Question type
   * @returns Array of questions of the specified type
   */
  async findByType(type: QuestionType): Promise<Question[]> {
    return this.question.findMany({
      where: {
        type,
        isActive: true,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
      include: {
        translations: true,
      },
    });
  }

  /**
   * Find questions by product ID
   * @param productId - Product ID
   * @returns Array of questions associated with the product
   */
  async findByProductId(productId: string): Promise<QuestionRelationship[]> {
    return this.questionProduct.findMany({
      where: {
        productId,
      },
      select: {
        id: true,
        itemType: true,
        position: true,
        question: {
          omit: {
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
            createdBy: true,
            updatedBy: true,
            deletedBy: true,
          },
        },
      },
      orderBy: {
        question: {
          name: 'asc',
        },
      },
    });
  }

  /**
   * Search questions by name
   * @param name - Name to search for
   * @returns Array of matching questions
   */
  async searchByName(searchByNameDto: SearchByNameDto): Promise<PaginationResponse<Question>> {
    const { name, page, limit } = searchByNameDto;
    const where = {
      isActive: true,
      deletedAt: null,
    };

    const total = await this.question.count({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
        ...where,
      },
    });
    const lastPage = Math.ceil(total / limit);

    const questions = await this.question.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
        ...where,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
      include: {
        translations: true,
      },
    });

    return {
      list: questions,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }
}
