import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateChainDto, UpdateChainDto } from './dtos';
import { PaginationDto } from '../common';
import { DeleteChainDto } from './dtos/delete-chain.dto';
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
  async create(createChainDto: CreateChainDto) {
    return await this.chain.create({ data: createChainDto });
  }

  /**
   * Find all chains with pagination
   */
  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const total = await this.chain.count({ where: { deletedAt: null } });
    const lastPage = Math.ceil(total / limit);
    return {
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
  }

  /**
   * Find one chain by ID
   */
  async findOne(id: string) {
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
  async update(updateChainDto: UpdateChainDto) {
    this.logger.debug(`Updating chain with id: ${updateChainDto.id}`);
    const { id, ...data } = updateChainDto;
    await this.findOne(id);
    return this.chain.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a chain
   */
  async delete(deleteChainDto: DeleteChainDto) {
    const { id, deletedBy } = deleteChainDto;
    const data = {
      deletedBy,
      deletedAt: new Date(),
    };
    await this.findOne(id);
    return this.chain.update({
      where: { id },
      data,
    });
  }
}
