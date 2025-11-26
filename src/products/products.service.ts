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
  UpdateProductDto,
  PaginationDto,
  SERVICES,
  PRODUCT_EVENTS,
  Product,
  PaginationResponse,
  SimpleProductResponse,
  Question,
} from 'qeai-sdk';
import {
  PrismaClient,
  ProductStatus,
  QuestionProductType,
} from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { productMap } from './mappers/product.map';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @Inject(SERVICES.NATS_SERVICE) private readonly client: ClientProxy,
  ) {
    super();
  }
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  async create(
    createProductDto: CreateProductDto,
  ): Promise<SimpleProductResponse> {
    const newProduct = await this.product.create({
      data: createProductDto,
    });

    this.logger.log('Emitting event to data-indexer-ms');

    this.client.emit(PRODUCT_EVENTS.CREATED, { productId: newProduct.id });

    return productMap(newProduct);
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<SimpleProductResponse>> {
    const { limit, page } = paginationDto;
    const where = {
      status: ProductStatus.ACTIVE,
      deletedAt: null,
    };
    const total = await this.product.count({
      where,
    });
    const lastPage = Math.ceil(total / limit);
    const products = await this.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      list: products.map(productMap),
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
  async findOne(id: string): Promise<Product> {
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
    const fullProduct = await this.expandQuestionsRecursively(
      productMap({ ...rest }),
    );
    return fullProduct;
  }

  /**
   * Recursively expand questions and answers for a given product or question.
   * @param product - The product or question product to expand.
   * @returns The product with all nested questions and answers.
   */
  private async expandQuestionsRecursively(product: Product): Promise<Product> {
    const questionProducts = await this.questionProduct.findMany({
      where: { productId: product.id, itemType: QuestionProductType.QUESTION },
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

    const questions: Question[] = await Promise.all(
      questionProducts.map(async (qp) => {
        const question = qp.question;
        const answers = question.questionProducts.map((ansQP) =>
          productMap(ansQP.product),
        );

        const expandedAnswers: Product[] = await Promise.all(
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
      ...product,
      questions,
    };
  }

  async update(
    updateProductDto: UpdateProductDto,
  ): Promise<SimpleProductResponse> {
    const { productId, ...toUpdate } = updateProductDto;
    await this.findOne(productId);
    const product = await this.product.update({
      where: { id: productId },
      data: toUpdate,
    });
    this.client.emit(PRODUCT_EVENTS.UPDATED, { productId: product.id });
    return productMap(product);
  }

  async remove(
    deleteProductDto: DeleteProductDto,
  ): Promise<SimpleProductResponse> {
    const { productId, deletedBy } = deleteProductDto;
    await this.findOne(productId);
    const product = await this.product.update({
      where: { id: productId },
      data: {
        status: ProductStatus.INACTIVE,
        deletedBy,
        deletedAt: new Date(),
      },
    });
    return productMap(product);
  }

  async validateProducts(ids: string[]): Promise<Product[]> {
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

    const productsMap = products.map(productMap);

    return productsMap;
  }
}
