export interface UserProfile {
  name: string;
  avatar_url: string;
  login: string;
  public_repos: number;
}

export interface Repository {
  language: string | null;
  name: string;
  stargazers_count: number;
}

export interface Language {
  language: string;
  count: number;
}

export interface GithubData {
  userProfile: UserProfile;
  repositories: Repository[];
  topLanguages: Language[];
}
