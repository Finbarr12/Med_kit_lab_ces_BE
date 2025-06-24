import mongoose, { Document } from "mongoose";
interface IStoreInfo {
    name: string;
    address: string;
    phone: string;
    email: string;
    description?: string;
}
interface IBankInfo {
    bankName: string;
    accountNumber: string;
    accountName: string;
}
export interface ISettings extends Document {
    storeInfo: IStoreInfo;
    bankInfo: IBankInfo;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ISettings, {}, {}, {}, mongoose.Document<unknown, {}, ISettings> & ISettings & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Settings.d.ts.map