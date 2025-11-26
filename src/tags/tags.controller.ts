import { Controller, Logger } from '@nestjs/common';
import { TagsService } from './tags.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  TAG_COMMANDS,
  CreateTagDto,
  UpdateTagDto,
  DeleteTagDto,
  SearchByNameDto,
  PaginationDto,
} from 'qeai-sdk';

/**
 * Controller for managing tags.
 * Handles NATS message patterns for tag operations and logs events with error handling.
 */
@Controller()
export class TagsController {
  private readonly logger = new Logger(TagsController.name);

  /**
   * Constructor injecting the tags service.
   * @param tagsService Service layer for tag management.
   */
  constructor(private readonly tagsService: TagsService) {}

  /**
   * Handles the creation of a new tag.
   * @param createTagDto Tag creation data
   * @returns Created tag
   */
  @MessagePattern(TAG_COMMANDS.CREATE)
  async create(@Payload() createTagDto: CreateTagDto) {
    this.logger.debug('Creating a new tag');
    try {
      return await this.tagsService.create(createTagDto);
    } catch (err) {
      this.logger.error('Error creating tag', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Retrieves all tags with pagination support.
   * @param paginationDto Pagination parameters
   * @returns Paginated list of tags
   */
  @MessagePattern(TAG_COMMANDS.FIND_ALL)
  async findAll(@Payload() paginationDto: PaginationDto) {
    this.logger.debug(
      `Fetching all tags. Page: ${paginationDto.page}, Limit: ${paginationDto.limit}`,
    );
    try {
      return await this.tagsService.findAll(paginationDto);
    } catch (err) {
      this.logger.error('Error fetching all tags', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Search tags by name.
   * @param data name for search
   * @returns Array of matching tags
   */
  @MessagePattern(TAG_COMMANDS.SEARCH_BY_NAME)
  async searchByName(@Payload() searchByNameDto: SearchByNameDto) {
    this.logger.debug(`Searching tags by name: ${searchByNameDto.name}`);
    try {
      return await this.tagsService.searchByName(searchByNameDto);
    } catch (err) {
      this.logger.error(
        `Error searching tags by name: ${searchByNameDto.name}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Gets most used tags.
   * @param limit (optional) max number of tags
   * @returns Array of most used tags
   */
  @MessagePattern(TAG_COMMANDS.GET_MOST_USED)
  async getMostUsed(@Payload('limit') limit?: number) {
    this.logger.debug(`Retrieving most used tags. Limit: ${limit}`);
    try {
      return await this.tagsService.getMostUsed(limit);
    } catch (err) {
      this.logger.error('Error retrieving most used tags', err.stack);
      if (err instanceof RpcException) throw err;
      this.logger.error('Creating Rpc Exception error');
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Retrieves tags by product ID.
   * @param productId Product ID to search tags for.
   * @returns Array of tags associated with the product.
   */
  @MessagePattern(TAG_COMMANDS.FIND_BY_PRODUCT_ID)
  async findByProductId(@Payload('productId') productId: string) {
    this.logger.debug(`Retrieving tags for product ID: ${productId}`);
    try {
      return await this.tagsService.findByProductId(productId);
    } catch (err) {
      this.logger.error(
        `Error retrieving tags for product ID: ${productId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Find tag by ID.
   * @param id ID of the tag to retrieve
   * @returns Tag details
   */
  @MessagePattern(TAG_COMMANDS.FIND_ONE)
  async findOne(@Payload('id') id: string) {
    this.logger.debug(`Fetching tag with id: ${id}`);
    try {
      return await this.tagsService.findOne(id);
    } catch (err) {
      this.logger.error(`Error fetching tag with id: ${id}`, err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Updates a tag by ID.
   * @param updateTagDto Data containing ID and update information.
   * @returns Updated tag
   */
  @MessagePattern(TAG_COMMANDS.UPDATE)
  async update(@Payload() updateTagDto: UpdateTagDto) {
    this.logger.debug(`Updating tag with id: ${updateTagDto.tagId}`);
    try {
      return await this.tagsService.update(updateTagDto);
    } catch (err) {
      this.logger.error(
        `Error updating tag with id: ${updateTagDto.tagId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Soft deletes a tag by ID.
   * @param deleteTagDto Data containing ID and deletedBy info.
   * @returns Deleted (soft deleted) tag
   */
  @MessagePattern(TAG_COMMANDS.REMOVE)
  async remove(@Payload() deleteTagDto: DeleteTagDto) {
    this.logger.debug(`Deleting tag with id: ${deleteTagDto.tagId}`);
    try {
      return await this.tagsService.remove(deleteTagDto);
    } catch (err) {
      this.logger.error(
        `Error deleting tag with id: ${deleteTagDto.tagId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }
}
