import { IndexedEntity } from "./core-utils";
import type { Product, Category, User, Order } from "@shared/types";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "../src/lib/mock-data";
export class ProductEntity extends IndexedEntity<Product> {
  static readonly entityName = "product";
  static readonly indexName = "products";
  static readonly initialState: Product = {
    id: "",
    name: "",
    description: "",
    price: 0,
    images: [],
    category: "",
    vendorId: "",
    variants: [],
    tags: [],
    rating: 0,
    reviewCount: 0
  };
  static seedData = MOCK_PRODUCTS;
}
export class CategoryEntity extends IndexedEntity<Category> {
  static readonly entityName = "category";
  static readonly indexName = "categories";
  static readonly initialState: Category = { id: "", name: "", slug: "" };
  static seedData = MOCK_CATEGORIES;
}
export type StoredUser = User & {passwordHash: string;};
export class UserEntity extends IndexedEntity<StoredUser> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: StoredUser = { id: "", name: "", email: "", passwordHash: "" };
  static override keyOf(state: { email: string }): string {
    return state.email.toLowerCase();
  }
}
export class OrderEntity extends IndexedEntity<Order> {
    static readonly entityName = "order";
    static readonly indexName = "orders";
    static readonly initialState: Order = {
        id: "",
        userId: "",
        items: [],
        total: 0,
        status: 'pending',
        shippingAddress: {},
        createdAt: 0,
    };
}