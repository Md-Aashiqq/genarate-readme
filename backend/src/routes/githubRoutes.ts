import { Router } from 'express';
import { getGithubData } from '../controllers/githubController';

const router = Router();

router.post('/github-data', getGithubData);

export default router;
