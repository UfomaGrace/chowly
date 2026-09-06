import express from 'express';
import cors from 'cors';
import restaurantRoutes from './routes/restaurants.js';
import menuRoutes from './routes/menus.js';
import menuItemRoutes from './routes/menu_items.js';
import orderRoutes from './routes/orders.js';
import orderItemRoutes from './routes/order_items.js';
import paymentRoutes from './routes/payments.js';
import orderEventRoutes from './routes/order_events.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Chowly backend is running!' });
});

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/order-items', orderItemRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/order-events', orderEventRoutes);

app.listen(PORT, () => {
  console.log(`Chowly backend running on http://localhost:${PORT}`);
});