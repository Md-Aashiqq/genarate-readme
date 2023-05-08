import { Router } from 'express';
import { getGithubData, getReadme } from '../controllers/githubController';
import { publishReadme } from '../services/githubServices';

const router = Router();

router.post('/github-data', getGithubData);
router.post('/generate-readme', getReadme);

router.post('/publish-readme', async (req, res) => {
  const { accessToken, username, readmeContent } = req.body;
  try {
    await publishReadme(accessToken, username, readmeContent);
    res.status(200).send({ message: 'Successfully published README.md' });
  } catch (error) {
    res.status(500).send({ message: 'Failed to publish README.md' });
  }
});

export default router;
