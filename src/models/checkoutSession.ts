import mongoose, { Document, Schema } from "mongoose";

export interface ICheckoutItem {
  product: string;
  brandName: string;
  quantity: number;
  price: number;
}

export interface ICheckoutSession extends Document {
  sessionNumber: string;
  customerId: string;
  items: ICheckoutItem[];
  totalAmount: number;
  shippingFee: number;
  paymentProof?: string;
  paymentStatus: "pending" | "submitted" | "approved" | "rejected";
  deliveryDetails?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    landmark?: string;
    deliveryInstructions?: string;
  };
  rejectionReason?: string;
  adminNotes?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CheckoutItemSchema: Schema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const DeliveryDetailsSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    deliveryInstructions: { type: String, trim: true },
  },
  { _id: false }
);

const CheckoutSessionSchema: Schema = new Schema(
  {
    sessionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: {
      type: [CheckoutItemSchema],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentProof: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "submitted", "approved", "rejected"],
      default: "pending",
    },
    deliveryDetails: {
      type: DeliveryDetailsSchema,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate session number before saving
CheckoutSessionSchema.pre<ICheckoutSession>("save", async function (next) {
  if (!this.sessionNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.sessionNumber = `CHK-${timestamp}-${random}`;
  }
  next();
});

export default mongoose.model<ICheckoutSession>(
  "CheckoutSession",
  CheckoutSessionSchema
);
