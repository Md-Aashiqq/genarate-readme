import express from 'express';
import axios from 'axios';
import cors from 'cors';
import githubRoutes from './routes/githubRoutes';

import { config } from "dotenv"
config({});

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('Missing CLIENT_ID or CLIENT_SECRET');
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api', githubRoutes);

app.post('/auth/github', async (req, res) => {
  const { code } = req.body;
  try {
    const response = await axios.post<{ access_token: string }>('https://github.com/login/oauth/access_token',
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' } },
    );

    const accessToken = response.data.access_token;
    res.status(200).json({ accessToken });
  } catch (error: any) {
    console.error('Error fetching access token:', error.message);
    res.status(500).json({ error: 'Error fetching access token' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
