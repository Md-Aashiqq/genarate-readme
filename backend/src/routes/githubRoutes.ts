import { Router } from 'express';
import { getGithubData, getReadme } from '../controllers/githubController';

const router = Router();

router.post('/github-data', getGithubData);
router.post('/generate-readme', getReadme);

export default router;
