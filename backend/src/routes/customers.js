import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*');

  if (error) {
    return res.status(500).json({
      error: error.message,
    });
  }

  res.json(data);
});

export default router;