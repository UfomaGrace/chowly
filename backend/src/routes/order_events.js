import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// Get all order events
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('order_events')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Get events for a specific order
router.get('/order/:orderId', async (req, res) => {
  const { data, error } = await supabase
    .from('order_events')
    .select('*')
    .eq('order_id', req.params.orderId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Create an order event
router.post('/', async (req, res) => {
  const { data, error } = await supabase
    .from('order_events')
    .insert([req.body])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(data);
});

export default router;