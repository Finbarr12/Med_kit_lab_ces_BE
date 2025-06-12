import mongoose, { Schema } from "mongoose";
import type { IProduct, IBrand } from "../types";

const BrandSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const ProductSchema: Schema = new Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    brands: {
      type: [BrandSchema],
      required: true,
      validate: {
        validator: (brands: IBrand[]) => brands.length > 0,
        message: "At least one brand is required",
      },
    },
    productImage: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
