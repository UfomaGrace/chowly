import express from 'express';
import cors from 'cors';
import { supabase } from './supabase.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Chowly backend is running!' });
});

app.get('/api/restaurants', async (req, res) => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Chowly backend running on http://localhost:${PORT}`);
});