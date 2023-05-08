import React, { CSSProperties, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Dropdown from "./Dropdown";
import Card from "./Card";

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
  const [pullRequestsCount, setPullReqCount] = useState<number>(0);
  const [contributionsCount, setContributionCount] = useState<number>(0);

  const [topLanguages, setTopLanguages] = useState<Language[]>([]);
  const [generatedReadme, setGeneratedReadme] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const code = searchParams.get("code") || "";

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await axios.post<{ accessToken: string }>(
          "http://localhost:5000/auth/github",
          {
            code,
          }
        );

        setAccessToken(response.data.accessToken);
        localStorage.setItem("accessToken", response.data.accessToken);
      } catch (error) {
        console.error("Error fetching access token:", error);
        navigate("/");
      }
    };

    if (code) {
      fetchAccessToken();
    } else {
      navigate("/");
    }
  }, [code, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!accessToken) {
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:5000/api/github-data",
          { accessToken }
        );
        const data = response.data;
        setUserProfile(data.userProfile);
        setRepositories(data.repositories);
        // Update the topLanguages state variable
        setTopLanguages(data.topLanguages);
        setPullReqCount(data.pullRequestsCount);
        setContributionCount(data.contributionsCount);
        console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/");
      }
    };

    fetchData();
  }, [accessToken, navigate]);

  const fetchReadme = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/generate-readme",
        {
          accessToken,
          username: userProfile?.login,
          topLanguages,
          pullRequestsCount,
          contributionsCount,
        }
      );
      const readme = response.data.readme;
      setGeneratedReadme(readme);
      console.log("Generated readme:", readme);
    } catch (error) {
      console.error("Error generating readme:", error);
    }
  };

  const publishReadme = async () => {
    try {
      await axios.post("http://localhost:5000/api/publish-readme", {
        accessToken: accessToken,
        username: userProfile?.login,
        readmeContent: generatedReadme,
      });

      alert("Successfully published README.md");
    } catch (error) {
      console.error("Error publishing README.md:", error);
      alert("Failed to publish README.md");
    }
  };

  return (
    <div className="dashboard_page">
      <nav className="heeader">
        <div className="logo">
          <img src="/logo.jpg" alt="GitHub Logo" />
        </div>

        <div className="nav-items">
          <Dropdown
            avatarUrl={userProfile?.avatar_url}
            username={userProfile?.name}
          />
        </div>
      </nav>

      <div className="main_section">
        <div className="left_section card"></div>

        <div className="right_section">
          <Card />
        </div>
      </div>

      {/* <button onClick={fetchReadme}>Generate README</button>

      <button onClick={publishReadme}>Publish README</button>

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
      </ul> */}
    </div>
  );
};

export default Dashboard;
