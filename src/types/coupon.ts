export interface Coupon {
  _id: string;
  name: string;
  discountDegree: number;
  discountMAX: number;
  expiryDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCouponData {
  name: string;
  discountDegree: number;
  discountMAX: number;
  expiryDate: string;
}

export type UpdateCouponData = Partial<CreateCouponData>;
