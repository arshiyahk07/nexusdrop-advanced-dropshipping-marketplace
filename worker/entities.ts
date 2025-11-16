import { IndexedEntity } from "./core-utils";
import type { Product, Category, User } from "@shared/types";
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from "@/lib/mock-data";
// PRODUCT ENTITY
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
    reviewCount: 0,
  };
  static seedData = MOCK_PRODUCTS;
}
// CATEGORY ENTITY
export class CategoryEntity extends IndexedEntity<Category> {
  static readonly entityName = "category";
  static readonly indexName = "categories";
  static readonly initialState: Category = { id: "", name: "", slug: "" };
  static seedData = MOCK_CATEGORIES;
}
// USER ENTITY for Authentication
// NOTE: In a real app, password should be hashed. Storing plaintext for simplicity.
export type StoredUser = User & { passwordHash: string };
export class UserEntity extends IndexedEntity<StoredUser> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: StoredUser = { id: "", name: "", email: "", passwordHash: "" };
  // We use email as the key for user entities for easy lookup during login
  static override keyOf(state: StoredUser): string {
    return state.email.toLowerCase();
  }
}