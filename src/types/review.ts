import { User } from './user';

export interface Review {
  _id: string;
  title?: string;
  content: string;
  rating: number;
  user: User | string | {
    _id: string;
    name: string;
    profileImg?: string;
    avatar?: string;
  };
  product: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReviewData {
  title?: string;
  content: string;
  rating: number;
}

export type UpdateReviewData = Partial<CreateReviewData>;
