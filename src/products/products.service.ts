import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto, DeleteProductDto, ProductStatus, UpdateProductDto } from './dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const where = {
      status: ProductStatus.ACTIVE,
      deletedAt: null,
    };
    const total = await this.product.count({
      where,
    });
    const lastPage = Math.ceil(total / limit);
    return {
      list: await this.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  async findOne(id: string) {
    const product = await this.product.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!product) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Product with id ${id} not found`,
      });
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { id: __, ...toUpdate } = updateProductDto;
    await this.findOne(id);
    return this.product.update({
      where: { id },
      data: toUpdate,
    });
  }

  async remove(deleteProductDto: DeleteProductDto) {
    const { id, deletedBy } = deleteProductDto;
    await this.findOne(id);
    return this.product.update({
      where: { id },
      data: {
        status: ProductStatus.INACTIVE,
        deletedBy,
        deletedAt: new Date(),
      },
    });
  }

  async validateProducts(ids: string[]) {
    ids = Array.from(new Set(ids));
    const products = await this.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (products.length !== ids.length) {
      throw new RpcException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Some products were not found',
      });
    }

    return products;
  }
}
