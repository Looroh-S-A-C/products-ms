import { Controller, Logger } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  RESTAURANT_COMMANDS,
  CreateRestaurantDto,
  UpdateRestaurantDto,
  DeleteRestaurantDto,
  PaginationDto,
} from 'qeai-sdk';

/**
 * Controller for managing restaurants.
 *
 * Exposes microservice message patterns for CRUD operations,
 * delegating business logic to RestaurantsService.
 */
@Controller('restaurants')
export class RestaurantsController {
  private readonly logger = new Logger(RestaurantsController.name);

  /**
   * Constructor injecting the restaurants service.
   * @param restaurantsService Service layer for restaurant management.
   */
  constructor(private readonly restaurantsService: RestaurantsService) {}

  /**
   * Handles the creation of a new restaurant.
   * @param createRestaurantDto Data transfer object for restaurant creation.
   * @returns The created restaurant entity.
   */
  @MessagePattern(RESTAURANT_COMMANDS.CREATE)
  async create(@Payload() createRestaurantDto: CreateRestaurantDto) {
    this.logger.debug('Creating a new restaurant');
    try {
      return await this.restaurantsService.create(createRestaurantDto);
    } catch (err) {
      this.logger.error('Error creating restaurant', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Retrieves paginated list of all restaurants.
   * @param paginationDto Pagination parameters.
   * @returns An object containing restaurants data and metadata.
   */
  @MessagePattern(RESTAURANT_COMMANDS.FIND_ALL)
  async findAll(@Payload() paginationDto: PaginationDto) {
    this.logger.debug(
      `Fetching all restaurants. Page: ${paginationDto.page}, Limit: ${paginationDto.limit}`,
    );
    try {
      return await this.restaurantsService.findAll(paginationDto);
    } catch (err) {
      this.logger.error('Error fetching all restaurants', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Retrieves a restaurant by its unique identifier.
   * @param id Restaurant identifier.
   * @returns The restaurant entity if found.
   */
  @MessagePattern(RESTAURANT_COMMANDS.FIND_ONE)
  async findOne(@Payload() id: string) {
    this.logger.debug(`Fetching restaurant with id: ${id}`);
    try {
      return await this.restaurantsService.findOne(id);
    } catch (err) {
      this.logger.error(`Error fetching restaurant with id: ${id}`, err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Updates an existing restaurant.
   * @param updateRestaurantDto Data transfer object containing update details.
   * @returns The updated restaurant entity.
   */
  @MessagePattern(RESTAURANT_COMMANDS.UPDATE)
  async update(@Payload() updateRestaurantDto: UpdateRestaurantDto) {
    this.logger.debug(
      `Updating restaurant with id: ${updateRestaurantDto.restaurantId}`,
    );
    try {
      return await this.restaurantsService.update(updateRestaurantDto);
    } catch (err) {
      this.logger.error(
        `Error updating restaurant with id: ${updateRestaurantDto.restaurantId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Soft deletes a restaurant by marking it with deletedAt and deletedBy.
   * @param deleteRestaurantDto Data transfer object for deletion details.
   * @returns The updated (soft deleted) restaurant entity.
   */
  @MessagePattern(RESTAURANT_COMMANDS.DELETE)
  async delete(@Payload() deleteRestaurantDto: DeleteRestaurantDto) {
    this.logger.debug(
      `Deleting restaurant with id: ${deleteRestaurantDto.restaurantId}`,
    );
    try {
      return await this.restaurantsService.delete(deleteRestaurantDto);
    } catch (err) {
      this.logger.error(
        `Error deleting restaurant with id: ${deleteRestaurantDto.restaurantId}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }
}
