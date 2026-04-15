export const defaultProducts = [
  {
    id: 1,
    name: "CLASSIC CLEAN SHAMPOO",
    brand: "CALIFORNIA NATURALS",
    desc: "Зөөлөн цэвэрлэж, тэжээл өгнө",
    price: 47960,
    oldPrice: 59950,
    discount: 20,
    category: "shampoo",
    badge: "hot",
    image: "/products/classic-shampoo-front.png",
    rating: 4.6,
    reviews: 76
  },
  {
    id: 2,
    name: "SUPER MOISTURE SHAMPOO",
    brand: "CALIFORNIA NATURALS",
    desc: "Хуурай үсийг гүн чийгшүүлнэ",
    price: 47960,
    oldPrice: null,
    discount: 0,
    category: "shampoo",
    badge: "new",
    image: "/products/super-moisture-shampoo.png",
    rating: 4.5,
    reviews: 114
  },
  {
    id: 3,
    name: "RE:GRO ANTI-THINNING SHAMPOO",
    brand: "CALIFORNIA NATURALS",
    desc: "Үсний ургалтыг дэмжинэ",
    price: 47960,
    oldPrice: 59950,
    discount: 20,
    category: "shampoo",
    badge: "sale",
    image: "/products/regro-shampoo.png",
    rating: 4.5,
    reviews: 55
  },
  {
    id: 4,
    name: "SUPER MOISTURE CONDITIONER",
    brand: "CALIFORNIA NATURALS",
    desc: "Хуурай үсийг зөөлрүүлнэ",
    price: 47960,
    oldPrice: null,
    discount: 0,
    category: "conditioner",
    badge: "hot",
    image: "/products/super-moisture-conditioner.png",
    rating: 4.5,
    reviews: 114
  },
  {
    id: 5,
    name: "CLASSIC CLEAN CONDITIONER",
    brand: "CALIFORNIA NATURALS",
    desc: "Бүх төрлийн үсэнд тохирно",
    price: 47960,
    oldPrice: 59950,
    discount: 20,
    category: "conditioner",
    badge: "sale",
    image: "/products/classic-clean-shampoo-mini.png",
    rating: 4.8,
    reviews: 68
  },
  {
    id: 6,
    name: "LEAVE-IN CONDITIONER & DETANGLER",
    brand: "CALIFORNIA NATURALS",
    desc: "Гялалзуулж, зангилаа задлана",
    price: 47960,
    oldPrice: null,
    discount: 0,
    category: "conditioner",
    badge: "new",
    image: "/products/leave-in-conditioner.png",
    rating: 4.8,
    reviews: 41
  },
  {
    id: 7,
    name: "DEEP REPAIR HAIR MASK",
    brand: "CALIFORNIA NATURALS",
    desc: "Хуурай үсний эмчилгээ",
    price: 47960,
    oldPrice: 59950,
    discount: 20,
    category: "mask",
    badge: "sale",
    image: "/products/super-moisture-texture.png",
    rating: 4.7,
    reviews: 58
  },
  {
    id: 8,
    name: "GLOW OIL BODY WASH",
    brand: "CALIFORNIA NATURALS",
    desc: "Арьсыг зөөлрүүлж гялалзуулна",
    price: 47960,
    oldPrice: null,
    discount: 0,
    category: "oil",
    badge: "hot",
    image: "/products/glow-oil-bodywash.png",
    rating: 4.8,
    reviews: 23
  },
  {
    id: 9,
    name: "GLOW OIL ТЭЖЭЭЛИЙН ТОС",
    brand: "CALIFORNIA NATURALS",
    desc: "Арьс ба үсний гүн тэжээл",
    price: 67960,
    oldPrice: 84950,
    discount: 20,
    category: "oil",
    badge: "sale",
    image: "/products/glow-oil-front.png",
    rating: 4.6,
    reviews: 34
  },
  {
    id: 10,
    name: "CLASSIC CLEAN ШАМПУНЬ + КОНДИЦИОНЕР",
    brand: "CALIFORNIA NATURALS",
    desc: "Өдөр тутмын арчилгааны багц",
    price: 89900,
    oldPrice: 119900,
    discount: 25,
    category: "set",
    badge: "hot",
    image: "/products/classic-clean-shampoo.png",
    rating: 4.8,
    reviews: 117
  },
  {
    id: 11,
    name: "SUPER MOISTURE ШАМПУНЬ + КОНДИЦИОНЕР",
    brand: "CALIFORNIA NATURALS",
    desc: "Гүн чийгшүүлэх багц",
    price: 89900,
    oldPrice: 119900,
    discount: 25,
    category: "set",
    badge: "sale",
    image: "/products/super-moisture-shampoo.png",
    rating: 4.5,
    reviews: 114
  }
];

export const categoryNames = {
  shampoo: 'Шампунь',
  conditioner: 'Кондиционер',
  mask: 'Маск',
  oil: 'Тос',
  set: 'Багц'
};

export function formatPrice(price) {
  return price.toLocaleString('mn-MN') + '₮';
}
