import { Controller, Logger } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  DeleteQuestionDto,
  SearchByNameDto,
} from './dtos';
import { PaginationDto } from '../common/dto/pagination.dto';
import { QuestionType } from '@prisma/client';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

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
  @MessagePattern('questions.create')
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
  @MessagePattern('questions.findAll')
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
  @MessagePattern('questions.searchByName')
  async searchByName(@Payload() searchByNameDto : SearchByNameDto) {
    const { name } = searchByNameDto;
    this.logger.debug(`Searching questions by name: ${name}`);
    try {
      return await this.questionsService.searchByName(searchByNameDto);
    } catch (err) {
      this.logger.error(`Error searching questions by name: ${name}`, err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Find questions by type.
   * @param type Question type
   * @returns Array of questions of the specified type
   */
  @MessagePattern('questions.findByType')
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
  @MessagePattern('questions.findByProductId')
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
  @MessagePattern('questions.findOne')
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
  @MessagePattern('questions.update')
  async update(@Payload() updateQuestionDto: UpdateQuestionDto) {
    this.logger.debug(`Updating question with id: ${updateQuestionDto.id}`);
    try {
      return await this.questionsService.update(updateQuestionDto);
    } catch (err) {
      this.logger.error(
        `Error updating question with id: ${updateQuestionDto.id}`,
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
  @MessagePattern('questions.remove')
  async remove(@Payload() deleteQuestionDto: DeleteQuestionDto) {
    this.logger.debug(`Deleting question with id: ${deleteQuestionDto.id}`);
    try {
      return await this.questionsService.remove(deleteQuestionDto);
    } catch (err) {
      this.logger.error(
        `Error deleting question with id: ${deleteQuestionDto.id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }
}
