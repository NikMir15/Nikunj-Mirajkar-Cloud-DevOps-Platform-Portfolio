
"use strict";

document.addEventListener("DOMContentLoaded", async () => {

  const username = "NikMir15";

  const container = document.getElementById("github-repos");
  const status = document.getElementById("github-status");

  if (!container || !status) return;

  const featuredRepos = new Set([
    "cloud-based-geospatial-infrastructure-monitoring-system",
    "warehouse-operations-analytics",
    "devops-docker-aws-deployment",
    "terraform-aws-vpc-ec2-nginx-lab-with-ip-restricted-ssh",
    "python-radio-astronomy-data-analysis",
    "log-monitoring-dashboard"
  ]);

  function createProjectCard(repo) {
    const article = document.createElement("article");
    article.className = "card soft project";

    const title = document.createElement("h3");
    title.className = "h3";
    title.textContent = repo.name.replace(/[-_]/g, " ");

    const description = document.createElement("p");
    description.className = "muted";
    description.textContent =
      repo.description || "GitHub project repository.";

    const tags = document.createElement("div");
    tags.className = "kv";

    if (repo.language) {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = repo.language;
      tags.appendChild(chip);
    }

    const link = document.createElement("a");
    link.className = "link";
    link.href = repo.html_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "View GitHub Repository →";

    article.append(title, description, tags, link);

    return article;
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      {
        headers: {
          "Accept": "application/vnd.github+json"
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }

    const repositories = await response.json();

    const filtered = repositories
      .filter(repo => !repo.fork)
      .filter(repo => !repo.private)
      .filter(repo => repo.name.toLowerCase() !== username.toLowerCase())
      .filter(repo => !featuredRepos.has(repo.name.toLowerCase()))
      .sort((a, b) =>
        new Date(b.updated_at) - new Date(a.updated_at)
      )
      .slice(0, 12);

    if (filtered.length === 0) {
      status.textContent =
        "Explore more projects directly on GitHub.";
      return;
    }

    const fragment = document.createDocumentFragment();

    filtered.forEach(repo => {
      fragment.appendChild(createProjectCard(repo));
    });

    container.appendChild(fragment);
    status.textContent = "";

  } catch (error) {
    console.error("GitHub repository loading error:", error);

    status.textContent =
      "GitHub projects could not be loaded right now. " +
      "Please use the View All GitHub Repositories link.";
  }
});
