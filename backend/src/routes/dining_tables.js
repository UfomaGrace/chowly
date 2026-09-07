import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// Get all dining tables
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('dining_tables')
    .select('*');

  if (error) {
    return res.status(500).json({
      error: error.message,
    });
  }

  res.json(data);
});

export default router;