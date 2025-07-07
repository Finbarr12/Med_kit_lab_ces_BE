import type { Request, Response } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";
import Customer from "../models/Customer";
import Settings from "../models/Settings";
import CheckoutSession from "../models/checkoutSession";

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { shippingFee = 0, notes } = req.body;

    // Get customer cart
    const cart: any = await Cart.findOne({ customerId }).populate(
      "items.product",
      "productName category"
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Get customer info
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Validate stock availability for all items
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.product);
      if (!product) {
        return res
          .status(400)
          .json({ message: `Product not found: ${cartItem.product}` });
      }

      const brand = product.brands.find((b) => b.name === cartItem.brandName);
      if (!brand) {
        return res
          .status(400)
          .json({ message: `Brand not found: ${cartItem.brandName}` });
      }

      if (brand.stock < cartItem.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.productName} - ${brand.name}. Available: ${brand.stock}`,
        });
      }
    }

    // Create checkout session from cart
    const sessionItems = cart.items.map((item: any) => ({
      product: item.product._id,
      brandName: item.brandName,
      quantity: item.quantity,
      price: item.price,
    }));

    const totalAmount = cart.totalAmount + shippingFee;

    const checkoutSession = new CheckoutSession({
      customerId,
      items: sessionItems,
      totalAmount,
      shippingFee,
      notes,
    });

    await checkoutSession.save();
    await checkoutSession.populate(
      "items.product",
      "productName category productImage"
    );

    // Clear the cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // Get store bank details for payment
    const settings = await Settings.findOne();
    const bankInfo = settings?.bankInfo || null;

    res.status(201).json({
      message: "Checkout session created. Please upload payment proof.",
      session: checkoutSession,
      bankInfo,
      nextStep: "upload_payment_proof",
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCheckoutSummary = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;

    // Get customer cart
    const cart = await Cart.findOne({ customerId }).populate(
      "items.product",
      "productName category productImage"
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Get customer info
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Get store settings
    const settings = await Settings.findOne();

    res.json({
      cart,
      customer,
      storeInfo: settings?.storeInfo || null,
      bankInfo: settings?.bankInfo || null,
      summary: {
        subtotal: cart.totalAmount,
        shippingFee: 0,
        total: cart.totalAmount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await CheckoutSession.findById(sessionId).populate(
      "items.product",
      "productName category productImage"
    );

    if (!session) {
      return res.status(404).json({ message: "Checkout session not found" });
    }

    res.json({ session });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCustomerSessions = async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;

    const sessions = await CheckoutSession.find({ customerId })
      .populate("items.product", "productName category productImage")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CheckoutSession.countDocuments({ customerId });

    res.json({
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
