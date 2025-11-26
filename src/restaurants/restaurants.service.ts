import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  DeleteRestaurantDto,
  PaginationDto,
  Restaurant,
  PaginationResponse,
} from 'qeai-sdk';
import { RpcException } from '@nestjs/microservices';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class RestaurantsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(RestaurantsService.name);

  async onModuleInit() {
    await this.$connect();
    this.logger.log('RestaurantsService connected to the database');
  }

  /**
   * Create a new restaurant
   */
  async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    return await this.restaurant.create({
      data: createRestaurantDto,
    });
  }

  /**
   * Find all restaurants with pagination
   */
  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponse<Restaurant>> {
    const { limit, page } = paginationDto;
    const where = {
      status: true,
      deletedAt: null,
    };
    const total = await this.restaurant.count({ where });
    const lastPage = Math.ceil(total / limit);
    const restaurants = await this.restaurant.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });
    
    return {
      list: restaurants,
      meta: {
        total,
        page,
        lastPage,
      },
    };
  }

  /**
   * Find one restaurant by ID
   */
  async findOne(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurant.findUnique({
      where: { id, deletedAt: null },
    });
    if (!restaurant) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Restaurant with id ${id} not found`,
      });
    }
    return restaurant;
  }

  /**
   * Update a restaurant
   */
  async update(updateRestaurantDto: UpdateRestaurantDto): Promise<Restaurant> {
    const { restaurantId, ...data } = updateRestaurantDto;
    await this.findOne(restaurantId!);
    return this.restaurant.update({
      where: { id: restaurantId },
      data,
    });
  }

  /**
   * Soft delete a restaurant
   */
  async delete(deleteRestaurantDto: DeleteRestaurantDto): Promise<Restaurant> {
    const { restaurantId, deletedBy } = deleteRestaurantDto;
    await this.findOne(restaurantId);
    return this.restaurant.update({
      where: { id: restaurantId },
      data: {
        status: false,
        deletedBy,
        deletedAt: new Date(),
      },
    });
  }
}
