import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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
      available: true,
      deletedAt: null,
    };
    const total = await this.product.count({
      where,
    });
    const lastPage = Math.ceil(total / limit);
    return {
      data: await this.product.findMany({
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

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
    if (!product) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Product with id ${id} not found`,
      });
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...toUpdate } = updateProductDto;
    await this.findOne(id);
    return this.product.update({
      where: { id },
      data: toUpdate,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.product.update({
      where: { id },
      data: {
        available: false,
        deletedAt: new Date(),
      },
    });
  }

  async validateProducts(ids: number[]) {
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
