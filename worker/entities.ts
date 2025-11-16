import { IndexedEntity } from "./core-utils";
import type { Product, Category, User, Order, AuditLog } from "@shared/types";
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
  static readonly initialState: StoredUser = { id: "", name: "", email: "", passwordHash: "", role: 'buyer' };
  // The key for a user is their email, which is unique.
  // This override is compatible with the base class by handling the generic type.
  static override keyOf<U extends { id: string; email?: string }>(state: U): string {
    if (state.email) {
      return state.email.toLowerCase();
    }
    // Fallback for operations that might only have the id, though our logic ensures email is used.
    return state.id;
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
export class AuditLogEntity extends IndexedEntity<AuditLog> {
    static readonly entityName = "auditlog";
    static readonly indexName = "auditlogs";
    static readonly initialState: AuditLog = {
        id: "",
        actorId: "",
        actorName: "",
        action: "",
        targetId: "",
        targetType: "order",
        createdAt: 0,
    };
}