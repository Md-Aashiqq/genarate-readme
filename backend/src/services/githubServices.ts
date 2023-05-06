import axios from 'axios';
import { Configuration, OpenAIApi } from "openai";

import { UserProfile, Repository, Language, GithubData } from '../utils/types';

export async function fetchGithubData(accessToken: string): Promise<GithubData> {

  console.log("Access Token", accessToken)

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

  return { userProfile, repositories, topLanguages };
}

export async function generateReadme(username: string, topLanguages: Language[]): Promise<string> {

  const languages = topLanguages.map(({ language, count }) => `${language} (${count})`).join(', ');

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);


  const prompt = `Create an awesome and more creative GitHub readme for a user named ${username}, who primarily uses the following programming languages: ${languages}. and uses emoji also`;

  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.7,
      max_tokens: 300,
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
