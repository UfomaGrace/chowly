import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('chefs')
    .select('*')
    .eq('employment_status', 'Active');

  if (error) {
    return res.status(500).json({
      error: error.message,
    });
  }

  res.json(data || []);
});

export default router;