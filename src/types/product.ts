import { Category, SubCategory } from './category';
import { Brand } from './brand';
import { Review } from './review';

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  quantity: number;
  sold: number;
  price: number;
  priceAfterDiscount?: number;
  colors: string[];
  imageCover: string;
  images: string[];
  category: Category | { name: string };
  subCategory?: SubCategory[] | { name: string }[];
  brand?: Brand | { name: string };
  ratingsAverage: number;
  ratingsQuantity: number;
  reviews?: Review[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductData {
  title: string;
  description: string;
  quantity: number;
  price: number;
  priceAfterDiscount?: number;
  colors?: string[];
  imageCover: File | string;
  images?: (File | string)[];
  category: string;
  subCategory?: string[];
  brand?: string;
}

export type UpdateProductData = Partial<CreateProductData>;

export interface ProductFilters {
  keyword?: string;
  category?: string;
  brand?: string;
  'price[gte]'?: number;
  'price[lte]'?: number;
  'ratingsAverage[gte]'?: number;
  sort?: string;
  page?: number;
  limit?: number;
  fields?: string;
}
