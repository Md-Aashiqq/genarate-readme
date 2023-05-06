import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

interface UserProfile {
  name: string;
  avatar_url: string;
  login: string;
  public_repos: number;
}

interface Repository {
  name: string;
  stargazers_count: number;
  language: string;
}

interface Language {
  language: string;
  count: number;
}


const Dashboard: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [languages, setLanguages] = useState<{ [key: string]: number }>({});

  const [topLanguages, setTopLanguages] = useState<Language[]>([]);


  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const code = searchParams.get('code') || '';

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await axios.post<{ accessToken: string }>('http://localhost:5000/auth/github', {
          code,
        });

        setAccessToken(response.data.accessToken);
      } catch (error) {
        console.error('Error fetching access token:', error);
        navigate('/');
      }
    };

    if (code) {
      fetchAccessToken();
    } else {
      navigate('/');
    }
  }, [code, navigate]);

//   useEffect(() => {
//   const fetchData = async () => {
//     if (!accessToken) {
//       return;
//     }

//     const instance = axios.create({
//       baseURL: 'https://api.github.com',
//       headers: { Authorization: `token ${accessToken}` }, // Change "Bearer" to "token"
//     });

//     try {
//       const userResponse = await instance.get<UserProfile>('/user');
//       setUserProfile(userResponse.data);

//       const reposResponse = await instance.get<Repository[]>('/user/repos', {
//         params: { per_page: 100 },
//       });
//       setRepositories(reposResponse.data);

//       // Count the languages used in the repositories
//       const languageCount: { [key: string]: number } = {};
//       reposResponse.data.forEach((repo) => {
//         if (repo.language) {
//           languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
//         }
//       });
//       setLanguages(languageCount);
      
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       navigate('/');
//     }
//   };

//   fetchData();
// }, [accessToken, navigate]);
  
  useEffect(() => {
  const fetchData = async () => {
    if (!accessToken) {
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/github-data', { accessToken });
      const data = response.data;
      setUserProfile(data.userProfile);
      setRepositories(data.repositories);

      // Update the topLanguages state variable
      setTopLanguages(data.topLanguages);
    } catch (error) {
      console.error('Error fetching data:', error);
      navigate('/');
    }
  };

  fetchData();
  }, [accessToken, navigate]);
  

  const fetchReadme = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/generate-readme', {
      accessToken,
      username: userProfile?.login,
      topLanguages,
    });
    const readme = response.data.readme;
    console.log('Generated readme:', readme);
  } catch (error) {
    console.error('Error generating readme:', error);
  }
};

  return (

    
    <div>

      <button onClick={fetchReadme}>Generate README</button>

      <h1>Dashboard</h1>
      {userProfile && (
        <div>
          <h2>{userProfile.name}</h2>
          <img src={userProfile.avatar_url} alt="Profile" width="100" height="100" />
          <p>Username: {userProfile.login}</p>
          <p>Public Repositories: {userProfile.public_repos}</p>
        </div>
      )}
      <h2>Top 5 Languages</h2>
      <ul>
        {topLanguages.map(({ language, count }) => (
          <li key={language}>
            {language}: {count}
          </li>
        ))}
      </ul>
      <h2>Repositories</h2>
      <ul>
        {repositories.map((repo,index) => (
          <li key={index}>
            {repo.name} - ⭐ {repo.stargazers_count}
          </li>
        ))}
      </ul>
    </div>

  );
};

export default Dashboard;
