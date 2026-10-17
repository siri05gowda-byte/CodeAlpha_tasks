
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        name: {
          type: String,
          required: true
        },
        image: String,
        price: {
          type: Number,
          required: true,
          min: 0
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        size: String,
        color: String
      }
    ],

    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true }
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    },

    discount: {
      type: Number,
      default: 0,
      min: 0
    },

    total: {
      type: Number,
      required: true,
      min: 0
    },

    couponCode: {
      type: String,
      default: ""
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "CARD"],
      required: true
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },

    orderStatus: {
      type: String,
      enum: [
        "Placed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
      ],
      default: "Placed"
    }
  },
  {
    timestamps: true
  }
);

module.exports =
  mongoose.models.Order || mongoose.model("Order", orderSchema);
