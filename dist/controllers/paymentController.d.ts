import type { Request, Response } from "express";
export declare const createPaymentRequest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllPaymentRequests: (req: Request, res: Response) => Promise<void>;
export declare const getPaymentById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const approvePayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const rejectPayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=paymentController.d.ts.map