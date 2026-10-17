
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/product");

async function updateAllVariants() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const products = await Product.find({});
    let updated = 0;

    for (const product of products) {
      const colors = product.colors?.length
        ? product.colors
        : ["Standard"];

      const sizes = product.sizes?.length
        ? product.sizes
        : ["Standard"];

      const patterns = product.patterns?.length
        ? product.patterns
        : ["Standard"];

      const clothing = /clothing|apparel/i.test(product.category);

      const combinations = [];

      for (const color of colors) {
        for (const size of sizes) {
          const matching = product.variants?.find(
            v => v.color === color &&
                 v.size === size &&
                 (v.pattern || "Standard") === "Standard"
          );

          combinations.push({
            color,
            size,
            pattern: "Standard",
            image: matching?.image || product.image,
            stock: matching ? matching.stock : product.stock
          });
        }
      }

      if (clothing) {
        for (const color of colors) {
          for (const size of sizes) {
            for (const pattern of patterns.filter(
              p => p !== "Standard"
            )) {
              combinations.push({
                color,
                size,
                pattern,
                image: product.image,
                stock: product.stock
              });
            }
          }
        }
      }

      product.variants = combinations;
      await product.save();
      updated++;
    }

    console.log(`Updated ${updated} products successfully.`);
  } catch (error) {
    console.error("Update failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

updateAllVariants();
