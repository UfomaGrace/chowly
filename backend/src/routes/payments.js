import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// GET all payments
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// GET payment for a specific order
router.get('/order/:orderId', async (req, res) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', req.params.orderId)
    .single();

  if (error) {
    return res.status(404).json({ error: error.message });
  }

  res.json(data);
});

// Create a payment
router.post('/', async (req, res) => {
  const { data, error } = await supabase
    .from('payments')
    .insert([req.body])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(data);
});

export default router;