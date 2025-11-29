export interface Address {
  addressId?: string;
  _id?: string;
  alias: string;
  details: string;
  phone: string;
  city: string;
  postalCode: string;
}

export interface CreateAddressData {
  alias: string;
  details: string;
  phone: string;
  city: string;
  postalCode: string;
}
