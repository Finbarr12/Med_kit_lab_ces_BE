import mongoose, { Schema } from "mongoose"

interface IStoreInfo {
  name: string
  address: string
  phone: string
  email: string
  logo?: string
  description?: string
}

interface IBankInfo {
  bankName: string
  accountNumber: string
  accountName: string
}

export interface ISettings extends Document {
  storeInfo: IStoreInfo
  bankInfo: IBankInfo
  updatedAt: Date
}

const StoreInfoSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    logo: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false },
)

const BankInfoSchema = new Schema(
  {
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    accountName: { type: String, required: true, trim: true },
  },
  { _id: false },
)

const SettingsSchema = new Schema(
  {
    storeInfo: { type: StoreInfoSchema, required: true },
    bankInfo: { type: BankInfoSchema, required: true },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<ISettings>("Settings", SettingsSchema)
