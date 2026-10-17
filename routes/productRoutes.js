
const express = require("express");
const Product = require("../models/product");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, gender, search, sort } = req.query;
    const filter = {};

    if (category && category.toLowerCase() !== "all") {
      filter.category = new RegExp(
        "^" + escapeRegex(category) + "$",
        "i"
      );
    }

    if (gender) {
      filter.gender = new RegExp(
        "^" + escapeRegex(gender) + "$",
        "i"
      );
    }

    if (search) {
      const term = new RegExp(escapeRegex(search), "i");

      filter.$or = [
        { name: term },
        { description: term },
        { category: term },
        { gender: term },
        { subcategory: term },
        { brand: term }
      ];
    }

    const sorting = {
      low: { price: 1 },
      high: { price: -1 },
      popular: { popularity: -1 },
      discount: { discount: -1 },
      new: { createdAt: -1 }
    };

    const products = await Product.find(filter)
      .sort(sorting[sort] || { createdAt: -1 })
      .limit(250);

    res.json(products);
  } catch (error) {
    console.error("Product fetch error:", error);
    res.status(500).json({
      message: "Unable to load products."
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found."
      });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({
      message: "Invalid product ID."
    });
  }
});

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = router;
