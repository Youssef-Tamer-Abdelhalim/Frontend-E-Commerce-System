import { User } from './user';
import { Product } from './product';

export interface OrderCartItem {
  product: Product | {
    title: string;
    price: number;
    imageCover: string;
  };
  quantity: number;
  color: string;
  price: number;
  _id?: string;
}

export interface ShippingAddress {
  details: string;
  phone: string;
  city: string;
  postalCode: string;
  country?: {
    code: string;
    name: string;
  };
}

export interface Order {
  _id: string;
  user: User | {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  cartItems: OrderCartItem[];
  taxPrice: number;
  shippingPrice: number;
  shippingAddress: ShippingAddress;
  totalOrderPrice: number;
  paymentMethodType: 'cash' | 'online';
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderData {
  shippingAddress: ShippingAddress;
}
