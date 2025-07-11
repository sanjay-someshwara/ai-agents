import express from 'express';
import type { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

// Enable CORS for Vite dev server
app.use(cors({
  origin: '*', 
}));

app.get('/api/distance', async (req: Request, res: Response) => {
  const { origin, destination } = req.query;

  const apiKey = process.env.GOOGLE_MAPS_API_KEY; 

  if (!origin || !destination) {
    return res.status(400).json({ error: 'Missing origin or destination' });
  }

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    origin as string
  )}&destinations=${encodeURIComponent(destination as string)}&key=${apiKey}`;

  try {
    const result = await axios.get(url);
    res.json(result.data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
