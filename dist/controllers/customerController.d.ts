import type { Request, Response } from "express";
export declare const createCustomer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const login_customer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCustomerById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCustomerByEmail: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateCustomer: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllCustomers: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=customerController.d.ts.map