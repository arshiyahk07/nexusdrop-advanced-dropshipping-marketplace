import { Hono } from "hono";
import type { Env } from './core-utils';
import { ProductEntity, CategoryEntity, UserEntity, StoredUser, OrderEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { User, Order, CartItem, Product } from "@shared/types";
// A simple, insecure session management for demo purposes.
// In a real app, use signed JWTs.
const sessions = new Map<string, string>(); // token -> user email
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // PRODUCTS
  app.get('/api/products', async (c) => {
    await ProductEntity.ensureSeed(c.env);
    const { items } = await ProductEntity.list(c.env);
    return ok(c, items);
  });
  app.get('/api/products/:id', async (c) => {
    const { id } = c.req.param();
    const product = new ProductEntity(c.env, id);
    if (!await product.exists()) {
      return notFound(c, 'Product not found');
    }
    return ok(c, await product.getState());
  });
  // CATEGORIES
  app.get('/api/categories', async (c) => {
    await CategoryEntity.ensureSeed(c.env);
    const { items } = await CategoryEntity.list(c.env);
    return ok(c, items);
  });
  // AUTHENTICATION
  app.post('/api/auth/register', async (c) => {
    const { name, email, password } = await c.req.json<{ name?: string, email?: string, password?: string }>();
    if (!isStr(name) || !isStr(email) || !isStr(password)) {
      return bad(c, 'Name, email, and password are required.');
    }
    if (password.length < 6) {
      return bad(c, 'Password must be at least 6 characters long.');
    }
    const userKey = email.toLowerCase();
    const user = new UserEntity(c.env, userKey);
    if (await user.exists()) {
      return bad(c, 'A user with this email already exists.');
    }
    let role: User['role'] = 'buyer';
    if (email.includes('vendor')) role = 'vendor';
    if (email.includes('admin')) role = 'admin';
    if (email.includes('support') || email.includes('ops') || email.includes('manager')) role = 'employee';
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: password, // In a real app, HASH the password
      role,
    };
    await UserEntity.create(c.env, newUser);
    const token = crypto.randomUUID();
    sessions.set(token, userKey);
    const userResponse: User = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
    return ok(c, { user: userResponse, token });
  });
  app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json<{ email?: string, password?: string }>();
    if (!isStr(email) || !isStr(password)) {
      return bad(c, 'Email and password are required.');
    }
    const userKey = email.toLowerCase();
    const userEntity = new UserEntity(c.env, userKey);
    if (!await userEntity.exists()) {
      return bad(c, 'Invalid credentials.');
    }
    const storedUser = await userEntity.getState();
    // In a real app, compare hashed passwords
    if (storedUser.passwordHash !== password) {
      return bad(c, 'Invalid credentials.');
    }
    const token = crypto.randomUUID();
    sessions.set(token, userKey);
    const userResponse: User = { id: storedUser.id, name: storedUser.name, email: storedUser.email, role: storedUser.role };
    return ok(c, { user: userResponse, token });
  });
  app.get('/api/auth/me', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const userKey = sessions.get(token);
    if (!userKey) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const userEntity = new UserEntity(c.env, userKey);
    if (!await userEntity.exists()) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }
    const storedUser = await userEntity.getState();
    const userResponse: User = { id: storedUser.id, name: storedUser.name, email: storedUser.email, role: storedUser.role };
    return ok(c, { user: userResponse });
  });
  // USER HELPERS
  const getUserFromToken = async (env: Env, token: string | undefined): Promise<StoredUser | null> => {
    if (!token) return null;
    const userKey = sessions.get(token);
    if (!userKey) return null;
    const userEntity = new UserEntity(env, userKey);
    if (!await userEntity.exists()) return null;
    return await userEntity.getState();
  };
  // ORDERS
  app.post('/api/orders', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    const user = await getUserFromToken(c.env, token);
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const { items, shippingAddress, total } = await c.req.json<{ items: CartItem[], shippingAddress: Record<string, string>, total: number }>();
    if (!items || items.length === 0 || !shippingAddress || !total) {
      return bad(c, 'Missing required order information.');
    }
    const newOrder: Order = {
      id: crypto.randomUUID(),
      userId: user.id,
      items,
      total,
      shippingAddress,
      status: 'pending',
      createdAt: Date.now(),
    };
    const createdOrder = await OrderEntity.create(c.env, newOrder);
    return ok(c, createdOrder);
  });
  app.get('/api/orders/me', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    const user = await getUserFromToken(c.env, token);
    if (!user) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const { items: allOrders } = await OrderEntity.list(c.env);
    const userOrders = allOrders.filter(order => order.userId === user.id).sort((a, b) => b.createdAt - a.createdAt);
    return ok(c, userOrders);
  });
  // VENDOR ROUTES
  app.get('/api/vendor/products', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    const user = await getUserFromToken(c.env, token);
    if (!user || user.role !== 'vendor') {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const { items: allProducts } = await ProductEntity.list(c.env);
    const vendorProducts = allProducts.filter(p => p.vendorId === user.id);
    return ok(c, vendorProducts);
  });
  app.post('/api/vendor/products', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    const user = await getUserFromToken(c.env, token);
    if (!user || user.role !== 'vendor') {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const productData = await c.req.json<Omit<Product, 'id' | 'vendorId'>>();
    const newProduct: Product = {
      ...productData,
      id: crypto.randomUUID(),
      vendorId: user.id,
    };
    const createdProduct = await ProductEntity.create(c.env, newProduct);
    return ok(c, createdProduct);
  });
  app.put('/api/vendor/products/:id', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    const user = await getUserFromToken(c.env, token);
    if (!user || user.role !== 'vendor') {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const { id } = c.req.param();
    const productEntity = new ProductEntity(c.env, id);
    if (!await productEntity.exists()) {
      return notFound(c, 'Product not found');
    }
    const product = await productEntity.getState();
    if (product.vendorId !== user.id) {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const updatedData = await c.req.json<Partial<Product>>();
    await productEntity.patch({ ...updatedData, id, vendorId: user.id });
    return ok(c, await productEntity.getState());
  });
  app.delete('/api/vendor/products/:id', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    const user = await getUserFromToken(c.env, token);
    if (!user || user.role !== 'vendor') {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const { id } = c.req.param();
    const productEntity = new ProductEntity(c.env, id);
    if (!await productEntity.exists()) {
      return notFound(c, 'Product not found');
    }
    const product = await productEntity.getState();
    if (product.vendorId !== user.id) {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    await ProductEntity.delete(c.env, id);
    return ok(c, { success: true });
  });
  app.get('/api/vendor/orders', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    const user = await getUserFromToken(c.env, token);
    if (!user || user.role !== 'vendor') {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const { items: allProducts } = await ProductEntity.list(c.env);
    const vendorProductIds = new Set(allProducts.filter(p => p.vendorId === user.id).map(p => p.id));
    const { items: allOrders } = await OrderEntity.list(c.env);
    const vendorOrders = allOrders.filter(order =>
      order.items.some(item => vendorProductIds.has(item.productId))
    ).sort((a, b) => b.createdAt - a.createdAt);
    return ok(c, vendorOrders);
  });
  // ADMIN ROUTES
  app.get('/api/admin/users', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    const user = await getUserFromToken(c.env, token);
    if (!user || user.role !== 'admin') {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const { items: allUsers } = await UserEntity.list(c.env);
    const usersResponse = allUsers.map(({ id, name, email, role }) => ({ id, name, email, role }));
    return ok(c, usersResponse);
  });
  app.get('/api/admin/orders', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    const user = await getUserFromToken(c.env, token);
    if (!user || user.role !== 'admin') {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const { items: allOrders } = await OrderEntity.list(c.env);
    return ok(c, allOrders.sort((a, b) => b.createdAt - a.createdAt));
  });
  app.put('/api/admin/users/:id', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    const adminUser = await getUserFromToken(c.env, token);
    if (!adminUser || adminUser.role !== 'admin') {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const { id } = c.req.param();
    const { role } = await c.req.json<{ role: User['role'] }>();
    if (!role) return bad(c, 'Role is required');
    const { items: allUsers } = await UserEntity.list(c.env);
    const targetUserMeta = allUsers.find(u => u.id === id);
    if (!targetUserMeta) return notFound(c, 'User not found');
    const userEntity = new UserEntity(c.env, targetUserMeta.email);
    await userEntity.patch({ role });
    return ok(c, await userEntity.getState());
  });
  app.delete('/api/admin/users/:id', async (c) => {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    const adminUser = await getUserFromToken(c.env, token);
    if (!adminUser || adminUser.role !== 'admin') {
      return c.json({ success: false, error: 'Forbidden' }, 403);
    }
    const { id } = c.req.param();
    const { items: allUsers } = await UserEntity.list(c.env);
    const targetUserMeta = allUsers.find(u => u.id === id);
    if (!targetUserMeta) return notFound(c, 'User not found');
    if (targetUserMeta.id === adminUser.id) return bad(c, 'Cannot delete yourself');
    await UserEntity.delete(c.env, targetUserMeta.email);
    return ok(c, { success: true });
  });
}