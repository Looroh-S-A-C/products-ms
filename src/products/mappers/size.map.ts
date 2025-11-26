import { ProductSize as PrismaProductSize } from '@prisma/client';
import { ProductSize } from 'qeai-sdk';


export const productSizeMap = (size: PrismaProductSize): ProductSize => {
  return {
    ...size,
    price: size.price.toNumber(),
  };
};
