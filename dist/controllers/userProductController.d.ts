import type { Request, Response } from "express";
export declare const getAllProducts: (req: Request, res: Response) => Promise<void>;
export declare const getProductById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProductsByCategory: (req: Request, res: Response) => Promise<void>;
export declare const getFeaturedProducts: (req: Request, res: Response) => Promise<void>;
export declare const searchProducts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const leaveReview: (req: any, res: any) => Promise<any>;
export declare const getProductReviews: (req: any, res: any) => Promise<void>;
//# sourceMappingURL=userProductController.d.ts.map