import mongoose, { Document } from "mongoose";
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
declare const _default: mongoose.Model<ICheckoutSession, {}, {}, {}, mongoose.Document<unknown, {}, ICheckoutSession> & ICheckoutSession & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=checkoutSession.d.ts.map