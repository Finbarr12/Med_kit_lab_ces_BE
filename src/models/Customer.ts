import mongoose, { Schema } from "mongoose"
import type { ICustomer } from "../types"

const AddressSchema: Schema = new Schema(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, default: "Nigeria", trim: true },
  },
  { _id: false },
)

const CustomerSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: AddressSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<ICustomer>("Customer", CustomerSchema)
