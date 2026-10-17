
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "s-fashion-dev-secret";

// Verify logged-in user
async function authenticateUser(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : "";

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please log in first."
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired login session."
    });
  }
}

// Place an order
router.post("/", authenticateUser, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      couponCode
    } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !shippingAddress ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message: "Cart, delivery address and payment method are required."
      });
    }

    if (!["COD", "UPI", "CARD"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method."
      });
    }

    const requiredAddressFields = [
      "fullName",
      "phone",
      "addressLine",
      "city",
      "state",
      "pincode"
    ];

    for (const field of requiredAddressFields) {
      if (!String(shippingAddress[field] || "").trim()) {
        return res.status(400).json({
          success: false,
          message: `Please provide ${field} in the delivery address.`
        });
      }
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      if (
        !mongoose.isValidObjectId(item.productId) ||
        !Number.isInteger(Number(item.quantity)) ||
        Number(item.quantity) < 1 ||
        Number(item.quantity) > 20
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or quantity."
        });
      }

      const product = await Product.findById(item.productId);

      if (!product || product.stock < Number(item.quantity)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product?.name || "a product"}.`
        });
      }

      const price = Number(product.price);
      const quantity = Number(item.quantity);

      subtotal += price * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.image,
        price,
        quantity,
        size: item.size || "",
        color: item.color || ""
      });
    }

    let discount = 0;
    const normalizedCoupon = String(couponCode || "")
      .trim()
      .toUpperCase();

    // Demo coupons
    if (normalizedCoupon === "WELCOME10" && subtotal >= 500) {
      discount = Math.round(subtotal * 0.10);
    } else if (
      normalizedCoupon === "SAVE200" &&
      subtotal >= 1500
    ) {
      discount = 200;
    } else if (normalizedCoupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon or minimum order amount not reached."
      });
    }

    const total = Math.max(0, subtotal - discount);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      discount,
      total,
      couponCode: normalizedCoupon,
      paymentMethod,
      paymentStatus:
        paymentMethod === "COD" ? "Pending" : "Pending",
      orderStatus: "Placed"
    });

    // Reduce stock after creating the order
    for (const item of orderItems) {
      await Product.updateOne(
        {
          _id: item.product,
          stock: { $gte: item.quantity }
        },
        {
          $inc: { stock: -item.quantity }
        }
      );
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order
    });
  } catch (error) {
    console.error("Order creation error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to place order. Please try again."
    });
  }
});

// View logged-in user's orders
router.get("/my-orders", authenticateUser, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve orders."
    });
  }
});

module.exports = router;
