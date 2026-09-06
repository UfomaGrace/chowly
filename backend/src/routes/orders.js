import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// GET all orders
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// GET one order by ID
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_id', req.params.id)
    .single();

  if (error) {
    return res.status(404).json({ error: error.message });
  }

  res.json(data);
});

// CREATE an order
router.post('/', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([req.body])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(data);
});

// UPDATE order
router.put('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('orders')
    .update(req.body)
    .eq('order_id', req.params.id)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json(data);
});

export default router;