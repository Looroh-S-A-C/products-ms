import { Controller, Logger } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  QUESTION_COMMANDS,
  CreateQuestionDto,
  UpdateQuestionDto,
  DeleteQuestionDto,
  SearchByNameDto,
  PaginationDto,
} from 'qeai-sdk';
import { QuestionType } from '@prisma/client';

/**
 * Controller for managing questions.
 * Handles NATS message patterns for question operations and logs events with error handling.
 */
@Controller()
export class QuestionsController {
  private readonly logger = new Logger(QuestionsController.name);

  /**
   * Constructor injecting the questions service.
   * @param questionsService Service layer for question management.
   */
  constructor(private readonly questionsService: QuestionsService) {}

  /**
   * Handles creation of a new question.
   * @param createQuestionDto Question creation data
   * @returns Created question
   */
  @MessagePattern(QUESTION_COMMANDS.CREATE)
  async create(@Payload() createQuestionDto: CreateQuestionDto) {
    this.logger.debug('Creating a new question');
    try {
      return await this.questionsService.create(createQuestionDto);
    } catch (err) {
      this.logger.error('Error creating question', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Retrieves all questions with pagination support.
   * @param paginationDto Pagination parameters
   * @returns Paginated list of questions
   */
  @MessagePattern(QUESTION_COMMANDS.FIND_ALL)
  async findAll(@Payload() paginationDto: PaginationDto) {
    this.logger.debug(
      `Fetching all questions. Page: ${paginationDto.page}, Limit: ${paginationDto.limit}`,
    );
    try {
      return await this.questionsService.findAll(paginationDto);
    } catch (err) {
      this.logger.error('Error fetching all questions', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Search questions by name.
   * @param name Name to search for
   * @returns Array of matching questions
   */
  @MessagePattern(QUESTION_COMMANDS.SEARCH_BY_NAME)
  async searchByName(@Payload() searchByNameDto: SearchByNameDto) {
    const { name } = searchByNameDto;
    this.logger.debug(`Searching questions by name: ${name}`);
    try {
      return await this.questionsService.searchByName(searchByNameDto);
    } catch (err) {
      this.logger.error(
        `Error searching questions by name: ${name}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Find questions by type.
   * @param type Question type
   * @returns Array of questions of the specified type
   */
  @MessagePattern(QUESTION_COMMANDS.FIND_BY_TYPE)
  async findByType(@Payload('type') type: QuestionType) {
    this.logger.debug(`Fetching questions by type: ${type}`);
    try {
      return await this.questionsService.findByType(type);
    } catch (err) {
      this.logger.error(`Error fetching questions by type: ${type}`, err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Find questions by product ID.
   * @param productId Product ID to search questions for
   * @returns Array of questions associated with the product
   */
  @MessagePattern(QUESTION_COMMANDS.FIND_BY_PRODUCT_ID)
  async findByProductId(@Payload('productId') productId: string) {
    this.logger.debug(`Fetching questions for product ID: ${productId}`);
    try {
      return await this.questionsService.findByProductId(productId);
    } catch (err) {
      this.logger.error(
        `Error fetching questions for product ID: ${productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Find question by ID.
   * @param id Question ID
   * @returns Question details
   */
  @MessagePattern(QUESTION_COMMANDS.FIND_ONE)
  async findOne(@Payload('id') id: string) {
    this.logger.debug(`Fetching question with id: ${id}`);
    try {
      return await this.questionsService.findOne(id);
    } catch (err) {
      this.logger.error(`Error fetching question with id: ${id}`, err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Update question by ID.
   * @param updateQuestionDto Data for updating the question
   * @returns Updated question
   */
  @MessagePattern(QUESTION_COMMANDS.UPDATE)
  async update(@Payload() updateQuestionDto: UpdateQuestionDto) {
    this.logger.debug(
      `Updating question with id: ${updateQuestionDto.questionId}`,
    );
    try {
      return await this.questionsService.update(updateQuestionDto);
    } catch (err) {
      this.logger.error(
        `Error updating question with id: ${updateQuestionDto.questionId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Soft delete question by ID.
   * @param deleteQuestionDto Data for deleting the question
   * @returns Deleted (soft deleted) question
   */
  @MessagePattern(QUESTION_COMMANDS.REMOVE)
  async remove(@Payload() deleteQuestionDto: DeleteQuestionDto) {
    this.logger.debug(
      `Deleting question with id: ${deleteQuestionDto.questionId}`,
    );
    try {
      return await this.questionsService.remove(deleteQuestionDto);
    } catch (err) {
      this.logger.error(
        `Error deleting question with id: ${deleteQuestionDto.questionId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }
}
