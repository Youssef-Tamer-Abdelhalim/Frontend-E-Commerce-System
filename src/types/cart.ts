export interface CartItem {
  _id: string;
  product: string;
  quantity: number;
  color: string;
  price: number;
  productImage?: string;
  nameOfProduct?: string;
  description?: string;
}

export interface Cart {
  _id: string;
  cartItems: CartItem[];
  totalCartPrice: number;
  totalCartPriceAfterDiscount?: number;
  user: string;
}

export interface AddToCartData {
  productId: string;
  color: string;
}

export interface UpdateCartItemData {
  quantity: number;
}

export interface UpdateCartItemColorData {
  color: string;
}

export interface ApplyCouponData {
  coupon: string;
}
