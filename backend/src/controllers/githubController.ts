import { Request, Response } from 'express';
import { fetchGithubData } from '../services/githubServices';

export async function getGithubData(req: Request, res: Response) {
  const { accessToken } = req.body;

  try {
    const data = await fetchGithubData(accessToken);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    res.status(500).json({ error: 'Error fetching GitHub data' });
  }
}
