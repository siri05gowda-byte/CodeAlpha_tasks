
const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    color: { type: String, default: "" },
    pattern: { type: String, default: "" },
    size: { type: String, default: "" },
    image: { type: String, default: "" },
    stock: { type: Number, default: 0, min: 0 }
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    description: { type: String, required: true },
    image: { type: String, required: true },

    // Keep existing image URLs working.
    images: { type: [mongoose.Schema.Types.Mixed], default: [] },

    category: { type: String, required: true, index: true },
    gender: { type: String, default: "" },
    subcategory: { type: String, default: "" },
    brand: { type: String, default: "S EDIT" },

    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    patterns: { type: [String], default: [] },

    variants: { type: [variantSchema], default: [] },

    rating: { type: Number, default: 4.3, min: 0, max: 5 },
    popularity: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 10, min: 0 },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);
