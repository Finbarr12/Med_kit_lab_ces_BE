import type { Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ICustomer extends Document {
  email: string;
  fullName: string;
  phone: string;
  password: string;
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
  productImage: [string];
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
  sessionId: string;
  items: ICartItem[];
  totalAmount: number;
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
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment extends Document {
  orderId: string;
  amount: number;
  paymentProof: string;
  status: "pending" | "approved" | "rejected";
  customerInfo: ICustomerInfo;
  approvedAt?: Date;
  rejectionReason?: string;
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
