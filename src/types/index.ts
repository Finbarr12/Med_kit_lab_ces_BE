import type { Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ICustomer extends Document {
  email: string;
  fullName: string;
  password: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IBrand {
  name: string;
  price: number;
  stock: number;
}



export interface IProduct extends Document {
  productName: string;
  category: string;
  description: string;
  brands: IBrand[];
  productImage: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartItem {
  product: string;
  brandName: string;
  quantity: number;
  price: number;
}

export interface ICart extends Document {
  customerId: string;
  items: ICartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICheckoutItem {
  product: string;
  brandName: string;
  quantity: number;
  price: number;
}

export interface IDeliveryDetails {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  landmark?: string;
  deliveryInstructions?: string;
}

export interface ICheckoutSession extends Document {
  sessionNumber: string;
  customerId: string;
  items: ICheckoutItem[];
  totalAmount: number;
  shippingFee: number;
  paymentProof?: string;
  paymentStatus: "pending" | "submitted" | "approved" | "rejected";
  deliveryDetails?: IDeliveryDetails;
  rejectionReason?: string;
  adminNotes?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface IOrderItem {
  product: string;
  brandName: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerId?: string;
  customerInfo: ICustomerInfo;
  items: IOrderItem[];
  totalAmount: number;
  shippingFee: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "confirmed";
  deliveryDetails: IDeliveryDetails;
  notes?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStoreInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  description?: string;
}

export interface IBankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface ISettings extends Document {
  storeInfo: IStoreInfo;
  bankInfo: IBankInfo;
  updatedAt: Date;
}
