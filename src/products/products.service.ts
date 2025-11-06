import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  CreateProductDto,
  DeleteProductDto,
  ProductStatus,
  UpdateProductDto,
} from './dto';
import { PrismaClient, QuestionProductType } from '@prisma/client';
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

  /**
   * Retrieve a product by ID with all nested questions and answers.
   * @param id - The product ID.
   * @returns The complete product structure.
   */
  async findOne(id: string) {
    const product = await this.product.findUnique({
      where: { id, deletedAt: null },
    });

    if (!product) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Product with id ${id} not found`,
      });
    }
    console.log({ product });
    return await this.expandQuestionsRecursively(product);
  }

  /**
   * Recursively expand questions and answers for a given product or question.
   * @param entity - The product or question entity to expand.
   * @returns The entity with all nested questions and answers.
   */
  private async expandQuestionsRecursively(entity: any): Promise<any> {
    const questionProducts = await this.questionProduct.findMany({
      where: { productId: entity.id, itemType: QuestionProductType.QUESTION },
      include: {
        question: {
          include: {
            questionProducts: {
              where: { itemType: QuestionProductType.ANSWER },
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    const questions = await Promise.all(
      questionProducts.map(async (qp) => {
        const question = qp.question;
        const answers = question.questionProducts.map((ansQP) => ansQP.product);

        const expandedAnswers = await Promise.all(
          answers.map((answer) => this.expandQuestionsRecursively(answer)),
        );
        const { questionProducts, ...cleanQuestion } = question;
        return {
          ...cleanQuestion,
          answers: expandedAnswers,
        };
      }),
    );

    return {
      ...entity,
      questions,
    };
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
      where: { id: { in: ids } },
      include: {
        sizes: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });

    // 🚨 Validar existencia
    if (products.length !== ids.length) {
      const foundIds = products.map((p) => p.id);
      const missing = ids.filter((id) => !foundIds.includes(id));
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: `Some products were not found: ${missing.join(', ')}`,
      });
    }

    return products;
  }
}
