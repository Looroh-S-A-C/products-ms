import { Controller, Logger } from '@nestjs/common';
import { ChainService } from './chain.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  CHAIN_COMMANDS,
  CreateChainDto,
  UpdateChainDto,
  DeleteChainDto,
  PaginationDto,
} from 'qeai-sdk';

/**
 * Controller for managing restaurant chains.
 *
 * Exposes microservice message patterns for CRUD operations,
 * delegating business logic to ChainService.
 */
@Controller('chains')
export class ChainController {
  private readonly logger = new Logger(ChainController.name);

  /**
   * Constructor injecting the chain service.
   * @param chainService Service layer for chain management.
   */
  constructor(private readonly chainService: ChainService) {}

  /**
   * Handles the creation of a new chain.
   * @param createChainDto Data transfer object for chain creation.
   * @returns The created chain entity.
   */
  @MessagePattern(CHAIN_COMMANDS.CREATE)
  async create(@Payload() createChainDto: CreateChainDto) {
    this.logger.debug('Creating a new chain');
    try {
      return await this.chainService.create(createChainDto);
    } catch (err) {
      this.logger.error('Error creating chain', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Retrieves paginated list of all chains.
   * @param paginationDto Pagination parameters.
   * @returns An object containing chains data and metadata.
   */
  @MessagePattern(CHAIN_COMMANDS.FIND_ALL)
  async findAll(@Payload() paginationDto: PaginationDto) {
    this.logger.debug(
      `Fetching all chains. Page: ${paginationDto.page}, Limit: ${paginationDto.limit}`,
    );
    try {
      return await this.chainService.findAll(paginationDto);
    } catch (err) {
      this.logger.error('Error fetching all chains', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Retrieves a chain by its unique identifier.
   * @param id Chain identifier.
   * @returns The chain entity if found.
   */
  @MessagePattern(CHAIN_COMMANDS.FIND_ONE)
  async findOne(@Payload() id: string) {
    this.logger.debug(`Fetching chain with id: ${id}`);
    try {
      return await this.chainService.findOne(id);
    } catch (err) {
      this.logger.error(`Error fetching chain with id: ${id}`, err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Updates an existing chain.
   * @param updateChainDto Data transfer object containing update details.
   * @returns The updated chain entity.
   */
  @MessagePattern(CHAIN_COMMANDS.UPDATE)
  async update(@Payload() updateChainDto: UpdateChainDto) {
    this.logger.debug(`Updating chain with id: ${updateChainDto.chainId}`);
    try {
      return await this.chainService.update(updateChainDto);
    } catch (err) {
      this.logger.error(
        `Error updating chain with id: ${updateChainDto.chainId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Soft deletes a chain by marking it with deletedAt and deletedBy.
   * @param deleteChainDto Data transfer object for deletion details.
   * @returns The updated (soft deleted) chain entity.
   */
  @MessagePattern(CHAIN_COMMANDS.DELETE)
  async delete(@Payload() deleteChainDto: DeleteChainDto) {
    this.logger.debug(`Deleting chain with id: ${deleteChainDto.chainId}`);
    try {
      return await this.chainService.delete(deleteChainDto);
    } catch (err) {
      this.logger.error(
        `Error deleting chain with id: ${deleteChainDto.chainId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }
}
