import axios from 'axios';
import { Configuration, OpenAIApi } from "openai";
import base64 from 'base-64';


import { UserProfile, Repository, Language, GithubData } from '../utils/types';

export async function fetchGithubData(accessToken: string): Promise<GithubData> {
  const instance = axios.create({
    baseURL: 'https://api.github.com',
    headers: { Authorization: `token ${accessToken}` },
  });

  const userResponse = await instance.get<UserProfile>('/user');
  const userProfile = userResponse.data;

  const reposResponse = await instance.get<Repository[]>('/user/repos', {
    params: { per_page: 100 },
  });
  const repositories = reposResponse.data;

  const languageCount: { [key: string]: number } = {};
  repositories.forEach((repo) => {
    if (repo.language) {
      languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
    }
  });

  const topLanguages: Language[] = Object.entries(languageCount)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5)
    .map(([language, count]) => ({ language, count }));

  // Fetch pull requests
  const pullRequestsResponse = await instance.get('/search/issues', {
    params: {
      q: `is:pr author:${userProfile.login}`,
      per_page: 1,
    },
  });
  const pullRequestsCount = pullRequestsResponse.data.total_count;

  // Fetch contributions
  const contributionsResponse = await instance.get(`/users/${userProfile.login}`);
  const contributionsCount = contributionsResponse.data.public_repos + contributionsResponse.data.total_private_repos;

  return { userProfile, repositories, topLanguages, pullRequestsCount, contributionsCount };
}

export async function generateReadme(username: string, topLanguages: Language[], pullRequestsCount: number, contributionsCount: number): Promise<string> {

  const languages = topLanguages.map(({ language, count }) => `${language} (${count})`).join(', ');

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const prompt = `Create an exceptionally creative, stylish, and engaging GitHub readme for a user named ${username} with the following format and stats:
  
- Greetings,
- A funny GIF
- A short introduction
- A list of skills and technologies
- GitHub stats and top languages
- Pull request count: ${pullRequestsCount}
- Total contributions: ${contributionsCount}
- GitHub Streak and Trophies
- Fun facts about the user
- Contact information with social media handles

Include emojis, graphs, and visually appealing elements to make the readme engaging and entertaining.`;


  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });
    console.log(response.data.choices);
    return response.data.choices[0].text || "Error";

  } catch (error: any) {
    console.error('Error generating readme:', error);
    console.error('Error details:', error?.response?.data);
    throw new Error('Error generating readme');
  }
}


export async function publishReadme(accessToken: string, username: string, readmeContent: string): Promise<void> {
  const instance = axios.create({
    baseURL: 'https://api.github.com',
    headers: { Authorization: `token ${accessToken}` },
  });

  try {
    // Step 1: Check if the repository exists
    let repoExists = false;
    try {
      await instance.get(`/repos/${username}/${username}`);
      repoExists = true;
    } catch (error: any) {
      if (error.response?.status !== 404) {
        throw error;
      }
    }

    // Step 2: Create a new repository if it doesn't exist
    if (!repoExists) {
      await instance.post('/user/repos', {
        name: username,
        description: 'My awesome GitHub profile README.md!',
        auto_init: true,
      });
    }

    // Step 2: Get the latest commit SHA
    const commitResponse = await instance.get(`/repos/${username}/${username}/git/refs/heads/main`);
    const commitSha = commitResponse.data.object.sha;

    // Step 3: Get the latest tree SHA
    const treeResponse = await instance.get(`/repos/${username}/${username}/git/commits/${commitSha}`);
    const treeSha = treeResponse.data.tree.sha;

    // Step 4: Create a new blob with the README.md content
    const newFileContent = Buffer.from(readmeContent, 'utf-8').toString('base64');
    const blobResponse = await instance.post(`/repos/${username}/${username}/git/blobs`, {
      content: newFileContent,
      encoding: 'base64',
    });
    const blobSha = blobResponse.data.sha;

    // Step 5: Create a new tree with the README.md file
    const newTreeResponse = await instance.post(`/repos/${username}/${username}/git/trees`, {
      base_tree: treeSha,
      tree: [
        {
          path: 'README.md',
          mode: '100644',
          type: 'blob',
          sha: blobSha,
        },
      ],
    });
    const newTreeSha = newTreeResponse.data.sha;


    // Step 6: Create a new commit
    const newCommitResponse = await instance.post(`/repos/${username}/${username}/git/commits`, {
      message: 'Create README.md for GitHub profile',
      tree: newTreeSha,
      parents: [commitSha],
    });
    const newCommitSha = newCommitResponse.data.sha;

    // Step 7: Update the reference to point to the new commit
    await instance.patch(`/repos/${username}/${username}/git/refs/heads/main`, {
      sha: newCommitSha,
    });

    console.log('Successfully published README.md');
  } catch (error: any) {
    console.error('Error publishing README.md:', error);
    console.error('Error details:', error.response?.data);
    throw new Error('Error publishing README.md');
  }
}

