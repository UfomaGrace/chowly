import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// GET all order items
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('order_items')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// GET items for a specific order
router.get('/order/:orderId', async (req, res) => {
  const { data, error } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', req.params.orderId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Add an item to an order
router.post('/', async (req, res) => {
  const { data, error } = await supabase
    .from('order_items')
    .insert([req.body])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(data);
});

export default router;