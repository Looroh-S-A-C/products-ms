// import { IsString, IsOptional, IsBoolean, IsEnum, IsDateString } from 'class-validator';
// import { MenuType } from 'qeai-sdk';

// /**
//  * DTO for creating a new menu
//  */
// export class CreateMenuDto {
//   /**
//    * Restaurant ID that owns this menu
//    * @example "restaurant-uuid-123"
//    */
//   @IsString()
//   restaurantId: string;

//   /**
//    * Menu name
//    * @example "Breakfast Menu"
//    */
//   @IsString()
//   name: string;

//   /**
//    * Menu type
//    * @example "DELIVERY"
//    */
//   @IsEnum(MenuType)
//   type: MenuType;

//   /**
//    * Menu description
//    * @example "Our delicious breakfast options available for delivery"
//    */
//   @IsOptional()
//   @IsString()
//   description?: string;

//   /**
//    * Menu status
//    * @example true
//    * @default true
//    */
//   @IsOptional()
//   @IsBoolean()
//   active?: boolean = true;

//   /**
//    * Menu start date (for time-limited menus)
//    * @example "2024-01-01T00:00:00Z"
//    */
//   @IsOptional()
//   @IsDateString()
//   startsAt?: string;

//   /**
//    * Menu end date (for time-limited menus)
//    * @example "2024-12-31T23:59:59Z"
//    */
//   @IsOptional()
//   @IsDateString()
//   endsAt?: string;

//   /**
//    * User who created the menu
//    * @example "user123"
//    */
//   @IsOptional()
//   @IsString()
//   createdBy?: string;
// }
