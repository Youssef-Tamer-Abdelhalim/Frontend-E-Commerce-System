export interface Brand {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBrandData {
  name: string;
  image?: File | string;
}

export type UpdateBrandData = Partial<CreateBrandData>;
