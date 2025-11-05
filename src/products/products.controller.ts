import { Controller, Logger } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DeleteProductDto } from './dto/delete-product.dto';
import { PaginationDto } from 'src/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

/**
 * Controller for managing products.
 * Handles NATS message patterns for product operations and logs events with error handling.
 */
@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  /**
   * Constructor injecting the products service.
   * @param productsService Service layer for product management.
   */
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Handles the creation of a new product.
   * @param createProductDto Product creation data
   * @returns Created product
   */
  @MessagePattern('product.create')
  async create(@Payload() createProductDto: CreateProductDto) {
    this.logger.debug('Creating a new product');
    try {
      console.log({createProductDto});
      return await this.productsService.create(createProductDto);
    } catch (err) {
      this.logger.error('Error creating product', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Retrieves all products with pagination support.
   * @param paginationDto Pagination parameters
   * @returns Paginated list of products
   */
  @MessagePattern('product.find-all')
  async findAll(@Payload() paginationDto: PaginationDto) {
    this.logger.debug(
      `Fetching all products. Page: ${paginationDto.page}, Limit: ${paginationDto.limit}`,
    );
    try {
      return await this.productsService.findAll(paginationDto);
    } catch (err) {
      this.logger.error('Error fetching all products', err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Retrieves a specific product by its ID.
   * @param id Product ID to retrieve
   * @returns Product details
   */
  @MessagePattern('product.find-one')
  async findOne(@Payload() id: string) {
    this.logger.debug(`Fetching product with id: ${id}`);
    try {
      return await this.productsService.findOne(id);
    } catch (err) {
      this.logger.error(`Error fetching product with id: ${id}`, err.stack);
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Updates a product by ID.
   * @param updateProductDto Data containing ID and update information
   * @returns Updated product
   */
  @MessagePattern('product.update')
  async update(@Payload() updateProductDto: UpdateProductDto) {
    this.logger.debug(`Updating product with id: ${updateProductDto.id}`);
    try {
      return await this.productsService.update(updateProductDto.id, updateProductDto);
    } catch (err) {
      this.logger.error(
        `Error updating product with id: ${updateProductDto.id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Soft deletes a product by ID.
   * @param deleteProductDto Data containing ID and deletedBy info
   * @returns Deleted (soft deleted) product
   */
  @MessagePattern('product.delete')
  async remove(@Payload() deleteProductDto: DeleteProductDto) {
    this.logger.debug(`Deleting product with id: ${deleteProductDto.id}`);
    try {
      return await this.productsService.remove(deleteProductDto);
    } catch (err) {
      this.logger.error(
        `Error deleting product with id: ${deleteProductDto.id}`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }

  /**
   * Validates a list of product IDs.
   * @param ids Array of product IDs to validate
   * @returns Validation result
   */
  @MessagePattern('product.validate_products')
  async validateProduct(@Payload() ids: string[]) {
    this.logger.debug(`Validating products with ids: ${ids.join(', ')}`);
    try {
      return await this.productsService.validateProducts(ids);
    } catch (err) {
      this.logger.error(
        `Error validating products [${ids.join(', ')}]`,
        err.stack,
      );
      if (err instanceof RpcException) throw err;
      throw new RpcException({ status: 500, message: err.message });
    }
  }
}
