import mongoose from "mongoose";
export interface IReview extends mongoose.Document {
    productId: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
}
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    customerId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    rating: number;
    comment?: string | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    customerId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    rating: number;
    comment?: string | undefined;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    customerId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    rating: number;
    comment?: string | undefined;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    customerId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    rating: number;
    comment?: string | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    customerId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    rating: number;
    comment?: string | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    customerId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    rating: number;
    comment?: string | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
export default _default;
//# sourceMappingURL=Reviews.d.ts.map