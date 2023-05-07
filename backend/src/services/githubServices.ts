import axios from 'axios';
import { Configuration, OpenAIApi } from "openai";

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


  // const prompt = `Create an awesome and more creative GitHub readme for a user named ${username}, who primarily uses the following programming languages: ${languages}. and uses emoji also . It also Short Description and Tech stack and some stats like pull requests and contributions and pullrequest count is ${pullRequestsCount} and contributions count is ${contributionsCount} .`;
  //   const prompt = `Create a creative and fun GitHub readme for a user named ${username} using emojis, graphs, and the following stats:
  // - Top 5 programming languages: ${topLanguages.map((lang) => `${lang.language} (${lang.count})`).join(', ')}
  // - Pull request count: ${pullRequestsCount}
  // - Total contributions: ${contributionsCount}

  //   Make sure the readme is engaging and visually appealing!`;

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
