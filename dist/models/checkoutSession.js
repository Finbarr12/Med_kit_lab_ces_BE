"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const CheckoutItemSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, { _id: false });
const DeliveryDetailsSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    deliveryInstructions: { type: String, trim: true },
}, { _id: false });
const CheckoutSessionSchema = new mongoose_1.Schema({
    sessionNumber: {
        type: String,
        // required: true,
        unique: true,
    },
    customerId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
// Generate session number before saving
CheckoutSessionSchema.pre("save", async function (next) {
    if (!this.sessionNumber) {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0");
        this.sessionNumber = `CHK-${timestamp}-${random}`;
    }
    next();
});
exports.default = mongoose_1.default.model("CheckoutSession", CheckoutSessionSchema);
//# sourceMappingURL=checkoutSession.js.map