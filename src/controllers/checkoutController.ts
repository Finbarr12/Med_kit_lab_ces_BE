import type { Request, Response } from "express";
import Cart from "../models/Cart";
import Product from "../models/Product";
import Customer from "../models/Customer";
import Settings from "../models/Settings";
import CheckoutSession from "../models/checkoutSession";

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { sessionId, customerId } = req.params;

    if (!customerId) {
      return res
        .status(401)
        .json({ message: "User must be logged in to checkout" });
    }

    // Get the cart by sessionId
    const cart = await Cart.findOne({ sessionId }).populate(
      "items.product",
      "productName category"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Validate stock
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

    const sessionItems = cart.items.map((item: any) => ({
      product: item.product._id,
      brandName: item.brandName,
      quantity: item.quantity,
      price: item.price,
    }));

    const totalAmount = cart.totalAmount + (req.body.shippingFee || 0);

    const checkoutSession = new CheckoutSession({
      customerId,
      items: sessionItems,
      totalAmount,
      shippingFee: req.body.shippingFee || 0,
      notes: req.body.notes,
    });

    await checkoutSession.save();
    await checkoutSession.populate(
      "items.product",
      "productName category productImage"
    );

    // Clear cart after checkout
    // cart.items = [];
    // cart.totalAmount = 0;
    // await cart.save();

    // Get store settings for bank info
    const settings = await Settings.findOne();
    const bankInfo = settings?.bankInfo || null;

    return res.status(201).json({
      message: "Checkout session created. Please upload payment proof.",
      session: checkoutSession,
      bankInfo,
      nextStep: "upload_payment_proof",
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const getCheckoutSummary = async (req: Request, res: Response) => {
  try {
    const { sessionId, customerId } = req.params;

    if (!customerId) {
      return res
        .status(401)
        .json({ message: "User must be logged in to view checkout summary" });
    }

    // Try to get the cart
    const cart: any = await Cart.findOne({ sessionId }).populate(
      "items.product",
      "productName category productImage"
    );

    let isCartEmpty = !cart || cart.items.length === 0;

    // Get customer details
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Get store settings
    const settings = await Settings.findOne();

    // If cart has items, return summary from cart
    if (!isCartEmpty) {
      // Attach customerId to cart if not already
      if (!cart.customerId) {
        cart.customerId = customerId;
        await cart.save();
      }

      return res.json({
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
    }

    // If cart is empty, get latest checkout session instead
    const latestSession = await CheckoutSession.findOne({ customerId })
      .sort({ createdAt: -1 })
      .populate("items.product", "productName category productImage");

    if (!latestSession) {
      return res
        .status(400)
        .json({ message: "Cart is empty and no previous checkout found." });
    }

    return res.json({
      cart: null,
      checkoutSession: latestSession,
      customer,
      storeInfo: settings?.storeInfo || null,
      bankInfo: settings?.bankInfo || null,
      summary: {
        subtotal: latestSession.totalAmount - latestSession.shippingFee,
        shippingFee: latestSession.shippingFee,
        total: latestSession.totalAmount,
      },
    });
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
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
