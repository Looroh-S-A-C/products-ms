import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/common';

export class SearchByNameDto extends PaginationDto {
  @IsString()
  @IsOptional()
  name?: string = '';
}
