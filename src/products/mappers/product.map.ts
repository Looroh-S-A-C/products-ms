import { Product as PrismaProduct, Tag } from '@prisma/client';
import { Product } from 'qeai-sdk';

type PrismaProductWithTags = PrismaProduct & {
  tags?: {
    tag: Tag;
  }[];
};

export const productMap = (product: PrismaProductWithTags): Product => {
  return {
    ...product,
    basePrice: product.basePrice.toNumber(),
    tags: product.tags
      ? product.tags?.map((t) => ({
          ...t.tag,
        }))
      : [],
  };
};
