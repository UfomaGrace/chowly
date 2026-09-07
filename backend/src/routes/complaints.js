
import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// GET all complaints
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .order('complaint_date', { ascending: false });

  if (error) {
    console.error('GET complaints error:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// GET one complaint
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('complaint_id', req.params.id)
    .single();

  if (error) {
    console.error('GET complaint error:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// CREATE complaint
router.post('/', async (req, res) => {
  console.log('COMPLAINT REQUEST RECEIVED:', req.body);

  const {
    complaint_id,
    order_id,
    customer_id,
    complaint_description,
  } = req.body;

  console.log('Complaint values:', {
    complaint_id,
    order_id,
    customer_id,
    complaint_description,
  });

  if (
    !complaint_id ||
    !order_id ||
    !customer_id ||
    !complaint_description
  ) {
    return res.status(400).json({
      error:
        'complaint_id, order_id, customer_id and complaint_description are required',
    });
  }

  const now = new Date();

  const complaintData = {
    complaint_id,
    order_id,
    customer_id,
    complaint_description,
    complaint_date: now.toISOString().split('T')[0],
    complaint_time: now.toISOString().split('T')[1].split('.')[0],
    complaint_status: 'Pending',
  };

  console.log('SENDING TO SUPABASE:', complaintData);

  const { data, error } = await supabase
    .from('complaints')
    .insert([complaintData])
    .select()
    .single();

  if (error) {
    console.error('SUPABASE COMPLAINT ERROR:', error);
    return res.status(500).json({ error: error.message });
  }

  console.log('COMPLAINT CREATED:', data);

  res.status(201).json(data);
});

// UPDATE complaint status
router.put('/:id', async (req, res) => {
  const { complaint_status } = req.body;

  if (!complaint_status) {
    return res.status(400).json({
      error: 'complaint_status is required',
    });
  }

  const { data, error } = await supabase
    .from('complaints')
    .update({ complaint_status })
    .eq('complaint_id', req.params.id)
    .select()
    .single();

  if (error) {
    console.error('UPDATE complaint error:', error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

export default router;
