import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import {
  CreateProductDto,
  DeleteProductDto,
  ProductStatus,
  UpdateProductDto,
} from './dto';
import { PrismaClient, QuestionProductType } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { EVENTS, NATS_SERVICE } from 'src/common/constants';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  async create(createProductDto: CreateProductDto) {
    const newProduct = await this.product.create({
      data: createProductDto,
    });

    this.logger.log('Emitting event to data-indexer-ms');

    this.client.emit(EVENTS.PRODUCT_CREATED, { productId: newProduct.id });

    return newProduct;
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
      include: {
        recipe: {
          select: {
            id: true,
            quantity: true,
            unit: true,
            ingredient: {
              select: {
                name: true,
              },
            },
          },
          where: {
            ingredient: {
              status: true,
              deletedAt: null,
            },
          },
        },
        tags: {
          select: {
            tag: true,
          },
          where: {
            tag: {
              deletedAt: null,
            },
          },
        },
        sizes: {
          select: {
            id: true,
            name: true,
            price: true,
            status: true,
          },
          where: {
            status: true,
          },
        },
        schedules: {
          omit: {
            productId: true,
          },
        },
        translations: {
          select: {
            description: true,
            languageCode: true,
            name: true,
          },
        },
        images: {
          select: {
            isPrimary: true,
            url: true,
            id: true,
          },
        },
      },
    }); 

    if (!product) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Product with id ${id} not found`,
      });
    }

    const { tags, ...rest } = product;

    console.log({ product });
    return await this.expandQuestionsRecursively({
      ...rest,
      tags: tags.map((tag) => ({ ...tag.tag })),
    });
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
    const product = await this.product.update({
      where: { id },
      data: toUpdate,
    });
    this.client.emit(EVENTS.PRODUCT_UPDATED, { productId: product.id });
    return product;
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
        recipe: {
          select: {
            id: true,
            quantity: true,
            unit: true,
            ingredient: {
              select: {
                name: true,
              },
            },
          },
          where: {
            ingredient: {
              status: true,
              deletedAt: null,
            },
          },
        },
        tags: {
          select: {
            tag: true,
          },
          where: {
            tag: {
              deletedAt: null,
            },
          },
        },
        sizes: {
          select: {
            id: true,
            name: true,
            price: true,
            status: true,
          },
          where: {
            status: true,
          },
        },
        schedules: {
          omit: {
            productId: true,
          },
        },
        translations: {
          select: {
            description: true,
            languageCode: true,
            name: true,
          },
        },
        images: {
          select: {
            isPrimary: true,
            url: true,
            id: true,
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

    return products.map((product) => {
      const { tags, ...rest } = product;
      return {
        ...rest,
        tags: tags.map((tag) => ({ ...tag.tag })),
      };
    });
  }
}
