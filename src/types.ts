// src/types.ts

export interface CartItemWithProduct {
  product_id: number;
  quantity: number;
  products: {
    name: string;
    price: number;
    weight: string;
    image: string;
  } | null;
}
