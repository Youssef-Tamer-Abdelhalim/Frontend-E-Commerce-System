export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  category: string | Category;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryData {
  name: string;
  image?: File | string;
}

export type UpdateCategoryData = Partial<CreateCategoryData>;

export interface CreateSubCategoryData {
  name: string;
  category: string;
}

export type UpdateSubCategoryData = Partial<CreateSubCategoryData>;
