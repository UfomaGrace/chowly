import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// GET all menu items
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

export default router;