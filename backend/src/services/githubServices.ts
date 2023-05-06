import axios from 'axios';
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
