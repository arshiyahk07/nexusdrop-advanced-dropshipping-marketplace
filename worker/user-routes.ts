import { Hono } from "hono";
import type { Env } from './core-utils';
import { ProductEntity, CategoryEntity, UserEntity, StoredUser, OrderEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import type { User, Order, CartItem } from "@shared/types";
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
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: password, // In a real app, HASH the password
    };
    await UserEntity.create(c.env, newUser);
    const token = crypto.randomUUID();
    sessions.set(token, userKey);
    const userResponse: User = { id: newUser.id, name: newUser.name, email: newUser.email };
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
    const userResponse: User = { id: storedUser.id, name: storedUser.name, email: storedUser.email };
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
    const userResponse: User = { id: storedUser.id, name: storedUser.name, email: storedUser.email };
    return ok(c, { user: userResponse });
  });
  // ORDERS
  const getUserFromToken = async (env: Env, token: string | undefined): Promise<User | null> => {
    if (!token) return null;
    const userKey = sessions.get(token);
    if (!userKey) return null;
    const userEntity = new UserEntity(env, userKey);
    if (!await userEntity.exists()) return null;
    const { id, name, email } = await userEntity.getState();
    return { id, name, email };
  };
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
}