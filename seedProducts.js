
require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./models/product");

const products = [
  {
    name: "Women's Linen Shirt",
    price: 899, originalPrice: 1299,
    category: "Clothing", gender: "Women", subcategory: "Shirts",
    description: "Lightweight linen shirt for everyday styling.",
    image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80",
    sizes: ["S", "M", "L", "XL"], colors: ["White", "Sage"]
  },
  {
    name: "Women's Floral Midi Dress",
    price: 1599, originalPrice: 2299,
    category: "Clothing", gender: "Women", subcategory: "Dresses",
    description: "Floral midi dress for day-to-evening occasions.",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80",
    sizes: ["S", "M", "L", "XL"], colors: ["Floral"]
  },
  {
    name: "Women's Straight Jeans",
    price: 1299, originalPrice: 1799,
    category: "Clothing", gender: "Women", subcategory: "Jeans",
    description: "Versatile straight-fit denim.",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    sizes: ["26", "28", "30", "32"], colors: ["Blue"]
  },
  {
    name: "Women's Kurta Set",
    price: 1899, originalPrice: 2699,
    category: "Clothing", gender: "Women", subcategory: "Ethnic Wear",
    description: "Comfortable ethnic set for celebrations.",
    image: "https://images.unsplash.com/photo-1583391733956-6c78276477e3?auto=format&fit=crop&w=800&q=80",
    sizes: ["S", "M", "L", "XL"], colors: ["Maroon"]
  },
  {
    name: "Women's Saree",
    price: 2199, originalPrice: 3199,
    category: "Clothing", gender: "Women", subcategory: "Sarees",
    description: "Elegant saree for special occasions.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    sizes: ["Free Size"], colors: ["Rose"]
  },
  {
    name: "Women's Blazer",
    price: 2499, originalPrice: 3499,
    category: "Clothing", gender: "Women", subcategory: "Blazers",
    description: "Tailored blazer for smart workwear.",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
    sizes: ["S", "M", "L", "XL"], colors: ["Black"]
  },
  {
    name: "Men's Oxford Shirt",
    price: 1199, originalPrice: 1699,
    category: "Clothing", gender: "Men", subcategory: "Shirts",
    description: "Classic shirt for office and casual wear.",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80",
    sizes: ["S", "M", "L", "XL"], colors: ["White", "Blue"]
  },
  {
    name: "Men's Cotton T-Shirt",
    price: 499, originalPrice: 799,
    category: "Clothing", gender: "Men", subcategory: "T-Shirts",
    description: "Everyday cotton crew-neck T-shirt.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80",
    sizes: ["S", "M", "L", "XL"], colors: ["Black", "White"]
  },
  {
    name: "Men's Slim Jeans",
    price: 1399, originalPrice: 1999,
    category: "Clothing", gender: "Men", subcategory: "Jeans",
    description: "Slim-fit denim for everyday outfits.",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80",
    sizes: ["30", "32", "34", "36"], colors: ["Dark Blue"]
  },
  {
    name: "Men's Formal Trousers",
    price: 1299, originalPrice: 1899,
    category: "Clothing", gender: "Men", subcategory: "Formal Wear",
    description: "Smart formal trousers for work.",
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80",
    sizes: ["30", "32", "34", "36"], colors: ["Charcoal"]
  },
  {
    name: "Men's Hoodie",
    price: 1499, originalPrice: 2199,
    category: "Clothing", gender: "Men", subcategory: "Hoodies",
    description: "Comfortable hoodie for casual days.",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
    sizes: ["S", "M", "L", "XL"], colors: ["Grey"]
  },
  {
    name: "Men's Polo T-Shirt",
    price: 899, originalPrice: 1299,
    category: "Clothing", gender: "Men", subcategory: "Polos",
    description: "Smart-casual polo with a neat collar.",
    image: "https://images.unsplash.com/photo-1625910513413-5fc45e9d8a0b?auto=format&fit=crop&w=800&q=80",
    sizes: ["S", "M", "L", "XL"], colors: ["Navy"]
  },
  {
    name: "Classic Black Watch",
    price: 1799, originalPrice: 2499,
    category: "Accessories", gender: "Men", subcategory: "Watches",
    description: "Minimal black watch for everyday wear.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
    sizes: ["Free Size"], colors: ["Black"]
  },
  {
    name: "Gold-Tone Watch",
    price: 2299, originalPrice: 3299,
    category: "Accessories", gender: "Women", subcategory: "Watches",
    description: "Gold-tone watch with a refined finish.",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80",
    sizes: ["Free Size"], colors: ["Gold"]
  },
  {
    name: "White Sneakers",
    price: 1599, originalPrice: 2299,
    category: "Footwear", gender: "Men", subcategory: "Sneakers",
    description: "Clean everyday sneakers.",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    sizes: ["6", "7", "8", "9", "10"], colors: ["White"]
  },
  {
    name: "Women's Heeled Sandals",
    price: 1399, originalPrice: 1999,
    category: "Footwear", gender: "Women", subcategory: "Sandals",
    description: "Elegant sandals for day-to-evening looks.",
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
    sizes: ["4", "5", "6", "7", "8"], colors: ["Nude"]
  },
  {
    name: "Leather Formal Shoes",
    price: 2199, originalPrice: 2999,
    category: "Footwear", gender: "Men", subcategory: "Formal Shoes",
    description: "Classic formal shoes for professional dressing.",
    image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=800&q=80",
    sizes: ["6", "7", "8", "9", "10"], colors: ["Brown"]
  },
  {
    name: "Kids Graphic T-Shirt",
    price: 399, originalPrice: 599,
    category: "Clothing", gender: "Kids", subcategory: "T-Shirts",
    description: "Playful T-shirt for everyday adventures.",
    image: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=800&q=80",
    sizes: ["2-3Y", "4-5Y", "6-7Y"], colors: ["Yellow"]
  },
  {
    name: "Kids Denim Dungaree",
    price: 999, originalPrice: 1399,
    category: "Clothing", gender: "Kids", subcategory: "Dungarees",
    description: "Easy denim dungaree for outings.",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80",
    sizes: ["2-3Y", "4-5Y", "6-7Y"], colors: ["Blue"]
  },
  {
    name: "Kids Running Shoes",
    price: 799, originalPrice: 1199,
    category: "Footwear", gender: "Kids", subcategory: "Sports Shoes",
    description: "Lightweight shoes for play and school.",
    image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=800&q=80",
    sizes: ["1", "2", "3", "4", "5"], colors: ["Blue"]
  },
  {
    name: "Kids Backpack",
    price: 699, originalPrice: 999,
    category: "Accessories", gender: "Kids", subcategory: "Backpacks",
    description: "Practical backpack for school and trips.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
    sizes: ["Free Size"], colors: ["Multi"]
  },
  {
    name: "Hydrating Face Moisturizer",
    price: 549, originalPrice: 699,
    category: "Beauty", gender: "All", subcategory: "Skincare",
    description: "Daily moisturizer for a hydrated feel.",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80",
    sizes: ["50 ml"], colors: ["Standard"]
  },
  {
    name: "Everyday Lipstick",
    price: 399, originalPrice: 599,
    category: "Beauty", gender: "All", subcategory: "Makeup",
    description: "Rich colour for everyday and evening looks.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80",
    sizes: ["3.5 g"], colors: ["Rose"]
  },
  {
    name: "Sunscreen SPF 50",
    price: 699, originalPrice: 899,
    category: "Beauty", gender: "All", subcategory: "Sun Care",
    description: "Daily sunscreen for your skincare routine.",
    image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=80",
    sizes: ["50 ml"], colors: ["Standard"]
  },
  {
    name: "Minimal Gold Earrings",
    price: 499, originalPrice: 799,
    category: "Accessories", gender: "Women", subcategory: "Jewellery",
    description: "Minimal earrings for everyday outfits.",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    sizes: ["Free Size"], colors: ["Gold"]
  },
  {
    name: "Crossbody Handbag",
    price: 1499, originalPrice: 2199,
    category: "Accessories", gender: "Women", subcategory: "Handbags",
    description: "Compact bag for everyday essentials.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    sizes: ["Free Size"], colors: ["Tan"]
  },
  {
    name: "Wireless Earbuds",
    price: 1999, originalPrice: 2999,
    category: "Appliances", gender: "All", subcategory: "Audio",
    description: "Compact wireless audio accessory.",
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=80",
    sizes: ["Standard"], colors: ["Black"]
  },
  {
    name: "Electric Kettle",
    price: 1299, originalPrice: 1799,
    category: "Appliances", gender: "All", subcategory: "Kitchen",
    description: "Everyday electric kettle for hot drinks.",
    image: "https://images.unsplash.com/photo-1594213114663-d94db9b1713a?auto=format&fit=crop&w=800&q=80",
    sizes: ["1.5 L"], colors: ["Silver"]
  },
  {
    name: "Hair Dryer",
    price: 1499, originalPrice: 2199,
    category: "Appliances", gender: "All", subcategory: "Personal Care",
    description: "Compact hair dryer for at-home styling.",
    image: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=800&q=80",
    sizes: ["Standard"], colors: ["Black"]
  },
  {
    name: "Reusable Travel Mug",
    price: 499, originalPrice: 799,
    category: "Accessories", gender: "All", subcategory: "Lifestyle",
    description: "Reusable mug for work and travel.",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=80",
    sizes: ["350 ml"], colors: ["Cream"]
  }
];

async function seed() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/s_fashion"
    );

    // WARNING: This replaces all products in the s_fashion database.
    await Product.deleteMany({});

    const readyProducts = products.map((p, i) => ({
      ...p,
      discount: Math.round(
        ((p.originalPrice - p.price) / p.originalPrice) * 100
      ),
      rating: Number((4.1 + (i % 9) * 0.1).toFixed(1)),
      popularity: 100 - i,
      stock: 10 + (i % 20),
      featured: i < 8
    }));

    await Product.insertMany(readyProducts);
    console.log(`Successfully added ${readyProducts.length} products.`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
