import express from 'express';
import { supabase } from '../supabase.js';

const router = express.Router();

// Get all ratings
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .order('rating_date', { ascending: false })
      .order('rating_time', { ascending: false });

    if (error) {
      console.error('Get ratings error:', error);

      return res.status(500).json({
        error: error.message,
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Get ratings server error:', error);

    res.status(500).json({
      error: 'Failed to retrieve ratings.',
    });
  }
});

// Get one rating
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('rating_id', req.params.id)
      .single();

    if (error) {
      console.error('Get rating error:', error);

      return res.status(404).json({
        error: error.message,
      });
    }

    res.json(data);
  } catch (error) {
    console.error('Get rating server error:', error);

    res.status(500).json({
      error: 'Failed to retrieve rating.',
    });
  }
});

// Create a rating
router.post('/', async (req, res) => {
  try {
    const {
      rating_id,
      order_id,
      customer_id,
      rating_value,
      rating_comment,
    } = req.body;

    if (
      !rating_id ||
      !order_id ||
      !customer_id ||
      rating_value === undefined ||
      rating_value === null
    ) {
      return res.status(400).json({
        error:
          'rating_id, order_id, customer_id and rating_value are required.',
      });
    }

    const numericRating = Number(rating_value);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        error: 'rating_value must be an integer between 1 and 5.',
      });
    }

    const now = new Date();

    const ratingDate = now
      .toISOString()
      .split('T')[0];

    const ratingTime = now
      .toTimeString()
      .split(' ')[0];

    const ratingData = {
      rating_id,
      order_id,
      customer_id,
      rating_value: numericRating,
      rating_date: ratingDate,
      rating_time: ratingTime,
      rating_comment: rating_comment || null,
    };

    const { data, error } = await supabase
      .from('ratings')
      .insert([ratingData])
      .select()
      .single();

    if (error) {
      console.error('Create rating error:', error);

      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Create rating server error:', error);

    res.status(500).json({
      error: 'Failed to create rating.',
    });
  }
});

export default router;