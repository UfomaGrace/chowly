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

// CREATE payment
router.post('/', async (req, res) => {
  const {
    payment_id,
    order_id,
    payment_amount,
    payment_method,
  } = req.body;

  // Validate required fields
  if (
    !payment_id ||
    !order_id ||
    payment_amount === undefined ||
    !payment_method
  ) {
    return res.status(400).json({
      error:
        'payment_id, order_id, payment_amount and payment_method are required.',
    });
  }

  const amount = Number(payment_amount);

  if (Number.isNaN(amount) || amount < 0) {
    return res.status(400).json({
      error: 'payment_amount must be a valid number greater than or equal to 0.',
    });
  }

  // Generate date and time automatically
  const now = new Date();

  const paymentDate = now.toISOString().split('T')[0];
  const paymentTime = now.toTimeString().split(' ')[0];

  const paymentData = {
    payment_id,
    order_id,
    payment_amount: amount,
    payment_date: paymentDate,
    payment_time: paymentTime,
    payment_method,
    payment_status: 'Successful',
  };

  const { data, error } = await supabase
    .from('payments')
    .insert([paymentData])
    .select()
    .single();

  if (error) {
    console.error('SUPABASE PAYMENT ERROR:', error);

    return res.status(400).json({
      error: error.message,
    });
  }

  res.status(201).json(data);
});

export default router;