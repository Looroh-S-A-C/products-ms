import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  CreateChainDto,
  UpdateChainDto,
  DeleteChainDto,
  PaginationDto,
  PaginationResponse,
  Chain,
} from 'qeai-sdk';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ChainService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ChainService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('ChainService connected to the database');
  }

  /**
   * Create a new chain
   */
  async create(createChainDto: CreateChainDto): Promise<Chain> {
    return await this.chain.create({ data: createChainDto });
  }

  /**
   * Find all chains with pagination
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Chain>> {
    const { limit, page } = paginationDto;
    const total = await this.chain.count({ where: { deletedAt: null } });
    const lastPage = Math.ceil(total / limit);
    const chains: PaginationResponse<Chain> = {
      list: await this.chain.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { deletedAt: null },
      }),
      meta: {
        total,
        page,
        lastPage,
      },
    };
    return chains;
  }

  /**
   * Find one chain by ID
   */
  async findOne(id: string): Promise<Chain> {
    const chain = await this.chain.findUnique({
      where: { id, deletedAt: null },
    });
    if (!chain) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Chain with id ${id} not found`,
      });
    }
    return chain;
  }

  /**
   * Update an existing chain.
   *
   * @param updateChainDto - Data Transfer Object containing the chain ID and updated fields.
   * @returns The updated chain record.
   * @throws NotFoundException if the chain does not exist.
   *
   * This method validates the existence of the chain, then updates it with the provided data.
   * Avoids side effects such as logging the DTO directly in production code.
   */
  async update(updateChainDto: UpdateChainDto): Promise<Chain> {
    this.logger.debug(`Updating chain with id: ${updateChainDto.chainId}`);
    const { chainId, ...data } = updateChainDto;
    await this.findOne(chainId!);
    return this.chain.update({
      where: { id: chainId },
      data,
    });
  }

  /**
   * Delete a chain
   */
  async delete(deleteChainDto: DeleteChainDto): Promise<Chain> {
    const { chainId, deletedBy } = deleteChainDto;
    const data = {
      deletedBy,
      deletedAt: new Date(),
    };
    await this.findOne(chainId);
    return this.chain.update({
      where: { id: chainId },
      data,
    });
  }
}
