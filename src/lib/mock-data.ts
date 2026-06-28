import type { Category, MenuItem, RestaurantSettings } from "./types";

/**
 * Local seed data. The data-access layer (lib/data.ts) reads from here for now;
 * later it can read the same shapes from Supabase without touching the UI.
 */

export const settings: RestaurantSettings = {
  name: "Sangwari",
  tagline: "Where every guest eats like family",
  welcome: "Jay Johar!", // traditional Chhattisgarhi greeting
  upiId: "sangwari@upi", // TODO: replace with the owner's real UPI ID
  upiName: "Sangwari Restaurant",
  whatsappNumber: "919999999999", // TODO: replace with the owner's WhatsApp number
  phoneDisplay: "+91 99999 99999",
  address: "Main Road, Raipur, Chhattisgarh 492001",
  mapUrl: "https://maps.google.com/?q=Raipur+Chhattisgarh",
  hours: "11:00 AM – 11:00 PM",
  isOpen: true,
  deliveryFee: 30,
  minOrder: 99,
  taxPercent: 5,
  instagram: "sangwari",
};

export const categories: Category[] = [
  { id: "cg-specials", name: "Chhattisgarhi Specials", emoji: "🪔", sortOrder: 1, isActive: true },
  { id: "starters", name: "Starters", emoji: "🧆", sortOrder: 2, isActive: true },
  { id: "mains", name: "Main Course", emoji: "🍛", sortOrder: 3, isActive: true },
  { id: "breads", name: "Breads", emoji: "🫓", sortOrder: 4, isActive: true },
  { id: "rice", name: "Rice & Biryani", emoji: "🍚", sortOrder: 5, isActive: true },
  { id: "chinese", name: "Chinese", emoji: "🍜", sortOrder: 6, isActive: true },
  { id: "beverages", name: "Beverages", emoji: "🍵", sortOrder: 7, isActive: true },
  { id: "desserts", name: "Desserts", emoji: "🍮", sortOrder: 8, isActive: true },
];

export const menuItems: MenuItem[] = [
  // Chhattisgarhi Specials
  { id: "chila", categoryId: "cg-specials", name: "Chila", description: "Soft rice-and-lentil pancake, a Chhattisgarhi breakfast classic, served with green chutney.", price: 70, emoji: "🥞", isVeg: true, isAvailable: true, spiceLevel: 1, tags: ["local"] },
  { id: "fara", categoryId: "cg-specials", name: "Fara", description: "Steamed rice dumplings tempered with mustard and curry leaves.", price: 80, emoji: "🥟", isVeg: true, isAvailable: true, spiceLevel: 1, tags: ["local"] },
  { id: "muthia", categoryId: "cg-specials", name: "Muthia", description: "Steamed, pan-tossed rice-flour rolls — light and savoury.", price: 90, emoji: "🧆", isVeg: true, isAvailable: true, spiceLevel: 1, tags: ["local"] },
  { id: "aamat", categoryId: "cg-specials", name: "Aamat", description: "Traditional tangy mixed-vegetable curry with local spices.", price: 120, emoji: "🍲", isVeg: true, isAvailable: true, spiceLevel: 2, tags: ["local", "chef-special"] },

  // Starters
  { id: "paneer-tikka", categoryId: "starters", name: "Paneer Tikka", description: "Char-grilled cottage cheese marinated in yogurt and spices.", price: 180, emoji: "🧀", isVeg: true, isAvailable: true, spiceLevel: 2, tags: ["bestseller"] },
  { id: "veg-manchurian", categoryId: "starters", name: "Veg Manchurian", description: "Crispy vegetable balls tossed in a tangy Indo-Chinese sauce.", price: 150, emoji: "🥬", isVeg: true, isAvailable: true, spiceLevel: 2 },
  { id: "chicken-65", categoryId: "starters", name: "Chicken 65", description: "Fiery South-Indian style fried chicken with curry leaves.", price: 220, emoji: "🍗", isVeg: false, isAvailable: true, spiceLevel: 3, tags: ["bestseller"] },
  { id: "tandoori-chicken", categoryId: "starters", name: "Tandoori Chicken (Half)", description: "Clay-oven roasted chicken in a smoky tandoori marinade.", price: 260, emoji: "🍗", isVeg: false, isAvailable: true, spiceLevel: 2 },

  // Main Course
  { id: "paneer-butter-masala", categoryId: "mains", name: "Paneer Butter Masala", description: "Cottage cheese in a rich, creamy tomato-cashew gravy.", price: 220, emoji: "🍛", isVeg: true, isAvailable: true, spiceLevel: 1, tags: ["bestseller"] },
  { id: "dal-tadka", categoryId: "mains", name: "Dal Tadka", description: "Yellow lentils finished with a sizzling ghee tempering.", price: 150, emoji: "🥘", isVeg: true, isAvailable: true, spiceLevel: 1 },
  { id: "kadhai-chicken", categoryId: "mains", name: "Kadhai Chicken", description: "Chicken cooked with bell peppers and freshly ground spices.", price: 280, emoji: "🍛", isVeg: false, isAvailable: true, spiceLevel: 2 },
  { id: "butter-chicken", categoryId: "mains", name: "Butter Chicken", description: "Tandoori chicken simmered in a velvety buttery tomato gravy.", price: 300, emoji: "🍛", isVeg: false, isAvailable: true, spiceLevel: 1, tags: ["chef-special"] },

  // Breads
  { id: "tandoori-roti", categoryId: "breads", name: "Tandoori Roti", description: "Whole-wheat flatbread fresh from the clay oven.", price: 20, emoji: "🫓", isVeg: true, isAvailable: true },
  { id: "butter-naan", categoryId: "breads", name: "Butter Naan", description: "Soft, fluffy naan brushed with butter.", price: 45, emoji: "🫓", isVeg: true, isAvailable: true, tags: ["bestseller"] },
  { id: "garlic-naan", categoryId: "breads", name: "Garlic Naan", description: "Naan topped with garlic and coriander.", price: 60, emoji: "🫓", isVeg: true, isAvailable: true },

  // Rice & Biryani
  { id: "jeera-rice", categoryId: "rice", name: "Jeera Rice", description: "Basmati rice tempered with cumin.", price: 120, emoji: "🍚", isVeg: true, isAvailable: true },
  { id: "veg-biryani", categoryId: "rice", name: "Veg Biryani", description: "Fragrant dum-cooked rice with seasonal vegetables.", price: 180, emoji: "🍚", isVeg: true, isAvailable: true, spiceLevel: 2 },
  { id: "chicken-biryani", categoryId: "rice", name: "Chicken Biryani", description: "Layered basmati and chicken slow-cooked on dum.", price: 240, emoji: "🍛", isVeg: false, isAvailable: true, spiceLevel: 2, tags: ["bestseller"] },

  // Chinese
  { id: "veg-noodles", categoryId: "chinese", name: "Veg Hakka Noodles", description: "Wok-tossed noodles with crunchy vegetables.", price: 140, emoji: "🍜", isVeg: true, isAvailable: true, spiceLevel: 1 },
  { id: "chicken-fried-rice", categoryId: "chinese", name: "Chicken Fried Rice", description: "Stir-fried rice with chicken and spring onions.", price: 170, emoji: "🍚", isVeg: false, isAvailable: true, spiceLevel: 1 },

  // Beverages
  { id: "masala-chai", categoryId: "beverages", name: "Masala Chai", description: "Spiced milk tea brewed fresh.", price: 25, emoji: "🍵", isVeg: true, isAvailable: true },
  { id: "sweet-lassi", categoryId: "beverages", name: "Sweet Lassi", description: "Thick, chilled yogurt drink.", price: 60, emoji: "🥛", isVeg: true, isAvailable: true },
  { id: "lime-soda", categoryId: "beverages", name: "Fresh Lime Soda", description: "Sweet-and-salty fresh lime soda.", price: 50, emoji: "🥤", isVeg: true, isAvailable: true },

  // Desserts
  { id: "dehrori", categoryId: "desserts", name: "Dehrori", description: "Chhattisgarhi fried rice-batter sweet soaked in sugar syrup.", price: 90, emoji: "🍮", isVeg: true, isAvailable: true, tags: ["local"] },
  { id: "gulab-jamun", categoryId: "desserts", name: "Gulab Jamun (2 pc)", description: "Warm milk-solid dumplings in rose-cardamom syrup.", price: 60, emoji: "🍩", isVeg: true, isAvailable: true },
];
