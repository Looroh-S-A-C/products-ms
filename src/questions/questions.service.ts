import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient, QuestionType } from '@prisma/client';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  DeleteQuestionDto,
  SearchByNameDto,
} from './dtos';

import { PaginationDto } from '../common/dto/pagination.dto';
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
  async create(createQuestionDto: CreateQuestionDto) {
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
  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const where = {
      isActive: true,
      deletedAt: null,
    };

    const total = await this.question.count({ where });
    const lastPage = Math.ceil(total / limit);

    return {
      list: await this.question.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          translations: true,
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
   * Find question by ID
   * @param id - Question ID
   * @returns Question details
   * @throws NotFoundException if question not found
   */
  async findOne(id: string) {
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
  async update(updateQuestionDto: UpdateQuestionDto) {
    const { id, ...toUpdate } = updateQuestionDto;
    await this.findOne(id);

    this.logger.log(`Updating question: ${id}`);
    return this.question.update({
      where: { id },
      data: toUpdate,
    });
  }

  /**
   * Soft delete question by ID
   * @param deleteQuestionDto - Delete data including deletedBy
   * @returns Updated question
   */
  async remove(deleteQuestionDto: DeleteQuestionDto) {
    const { id, deletedBy } = deleteQuestionDto;
    await this.findOne(id);

    this.logger.log(`Soft deleting question: ${id}`);
    return this.question.update({
      where: { id },
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
  async validateQuestions(ids: string[]) {
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
  async findByType(type: QuestionType) {
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
  async findByProductId(productId: string) {
    return this.question.findMany({
      where: {
        questionProducts: {
          some: {
            productId,
          },
        },
        isActive: true,
        deletedAt: null,
      },
      orderBy: { name: 'asc' },
      include: {
        translations: true,
        questionProducts: {
          where: {
            productId,
          },
        },
      },
    });
  }

  /**
   * Search questions by name
   * @param name - Name to search for
   * @returns Array of matching questions
   */
  async searchByName(searchByNameDto: SearchByNameDto) {
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
      }
    });
    const lastPage = Math.ceil(total / limit);

    return {
      list: await this.question.findMany({
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
      }),
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }
}
