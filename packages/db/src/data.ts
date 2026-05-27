export type Product = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  active: boolean;
};

export const products: Product[] = [
  {
    name: "Wireless Noise Cancelling Headphones",
    description:
      "Comfortable over-ear headphones with Bluetooth, active noise cancelling, and long battery life.",
    price: 149.99,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    category: "Electronics",
    stock: 25,
    active: true,
  },
  {
    name: "Smart Fitness Watch",
    description:
      "A lightweight smart watch for daily activity tracking, notifications, and heart-rate monitoring.",
    price: 119.0,
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    category: "Electronics",
    stock: 18,
    active: true,
  },
  {
    name: "USB-C Charging Hub",
    description:
      "Compact multi-port USB-C hub with HDMI, USB-A, card reader, and fast charging support.",
    price: 64.5,
    imageUrl:
      "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80",
    category: "Electronics",
    stock: 40,
    active: true,
  },
  {
    name: "Cotton Everyday T-Shirt",
    description:
      "Soft regular-fit cotton T-shirt designed for everyday wear and easy layering.",
    price: 24.99,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    category: "Clothing",
    stock: 60,
    active: true,
  },
  {
    name: "Lightweight Denim Jacket",
    description:
      "Classic denim jacket with a relaxed fit, button front, and practical chest pockets.",
    price: 89.99,
    imageUrl:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80",
    category: "Clothing",
    stock: 14,
    active: true,
  },
  {
    name: "Canvas Tote Bag",
    description:
      "Durable reusable canvas tote bag with reinforced handles and a simple everyday design.",
    price: 19.5,
    imageUrl:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
    category: "Accessories",
    stock: 35,
    active: true,
  },
  {
    name: "Minimal Leather Wallet",
    description:
      "Slim leather wallet with card slots, note storage, and a clean compact profile.",
    price: 39.99,
    imageUrl:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",
    category: "Accessories",
    stock: 22,
    active: true,
  },
  {
    name: "Ceramic Coffee Mug Set",
    description:
      "Set of four ceramic mugs with a smooth glaze finish for coffee, tea, or hot chocolate.",
    price: 32.0,
    imageUrl:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80",
    category: "Home",
    stock: 30,
    active: true,
  },
  {
    name: "Desk Organiser Tray",
    description:
      "Multi-section desk tray for stationery, cables, notes, and small workspace essentials.",
    price: 27.95,
    imageUrl:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    category: "Home",
    stock: 16,
    active: true,
  },
  {
    name: "Scented Soy Candle",
    description:
      "Hand-poured soy candle with a calm vanilla scent and reusable glass jar.",
    price: 21.99,
    imageUrl:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80",
    category: "Home",
    stock: 0,
    active: false,
  },
];
