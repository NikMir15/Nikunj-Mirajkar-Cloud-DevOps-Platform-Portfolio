document.addEventListener("DOMContentLoaded", () => {
  const username = "NikMir15";
  const maxToShow = 9;

  const grid = document.getElementById("github-repos");
  const status = document.getElementById("github-status");
  if (!grid || !status) return;

  const escapeHtml = (str = "") =>
    String(str).replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m]));

  const fmtDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
    } catch {
      return iso;
    }
  };

  const extractDescriptionFromReadme = (text) => {
    if (!text) return "";
    const cleaned = text
      .replace(/\r/g, "")
      .replace(/^#.*$/gm, "")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .trim();

    const blocks = cleaned.split("\n\n").map(b => b.trim()).filter(Boolean);
    if (!blocks.length) return "";

    const first = blocks[0].replace(/\s+/g, " ");
    return first.length > 180 ? first.slice(0, 177) + "..." : first;
  };

  async function getSmartDescription(repo) {
    if (repo.description && repo.description.trim()) return repo.description.trim();

    const candidates = ["README.md", "readme.md"];
    for (const file of candidates) {
      const url = `https://raw.githubusercontent.com/${username}/${repo.name}/${repo.default_branch}/${file}`;
      try {
        const r = await fetch(url);
        if (!r.ok) continue;
        const text = await r.text();
        const extracted = extractDescriptionFromReadme(text);
        if (extracted) return extracted;
      } catch {}
    }
    return ""; // hide if no description
  }

  const buildTechChips = (repo) => {
    const chips = [];
    if (repo.language) chips.push(repo.language);
    const name = (repo.name || "").toLowerCase();
    if (name.includes("docker")) chips.push("Docker");
    if (name.includes("terraform")) chips.push("Terraform");
    if (name.includes("k8") || name.includes("kube")) chips.push("Kubernetes");
    if (name.includes("microservice")) chips.push("Microservices");
    if (name.includes("cloud")) chips.push("Cloud");
    if (name.includes("devops")) chips.push("DevOps");
    return [...new Set(chips)].slice(0, 6);
  };

  const repoCard = (repo, desc) => {
    if (!desc || !desc.trim()) return "";

    const stars = typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0;
    const forks = typeof repo.forks_count === "number" ? repo.forks_count : 0;

    const tech = buildTechChips(repo);
    const techHtml = tech.length
      ? `<div class="kv" style="margin-top:8px">${tech.map(t => `<div class="chip">${escapeHtml(t)}</div>`).join("")}</div>`
      : "";

    return `
      <div class="project card soft">
        <h3 class="h3">${escapeHtml(repo.name)}</h3>
        <p class="muted">${escapeHtml(desc)}</p>

        ${tech.length ? `<div class="terminal"><strong>Key Tech:</strong> ${escapeHtml(tech.join(", "))}</div>` : ""}

        <div class="kv" style="margin-top:8px">
          <div class="chip">⭐ ${stars}</div>
          <div class="chip">🍴 ${forks}</div>
          <div class="chip">Updated: ${escapeHtml(fmtDate(repo.updated_at))}</div>
        </div>

        ${techHtml}

        <div class="cta-row">
          <a class="neon-btn" href="${repo.html_url}" target="_blank" rel="noopener">View Repo</a>
          ${repo.homepage ? `<a class="neon-btn" href="${repo.homepage}" target="_blank" rel="noopener">Live</a>` : ""}
        </div>
      </div>
    `;
  };

  async function loadRepos() {
    status.textContent = "Loading GitHub repos…";

    if (location.protocol === "file:") {
      status.innerHTML = `Tip: Run a local server (http://localhost) to load GitHub repos.`;
      return;
    }

    try {
      const res = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
        { headers: { "Accept": "application/vnd.github+json" } }
      );

      if (res.status === 403) {
        status.innerHTML = `GitHub API rate limit hit. <a class="link" href="https://github.com/${username}" target="_blank" rel="noopener">View on GitHub</a>`;
        return;
      }
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

      let repos = await res.json();
      repos = repos
        .filter(r => !r.fork && !r.archived)
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

      const cards = [];
      for (const repo of repos) {
        const desc = await getSmartDescription(repo);
        const card = repoCard(repo, desc);
        if (card) cards.push(card);
        if (cards.length >= maxToShow) break;
      }

      if (!cards.length) {
        status.innerHTML = `No repos with descriptions found. Add GitHub “About” descriptions. <a class="link" href="https://github.com/${username}" target="_blank" rel="noopener">View on GitHub</a>`;
        grid.innerHTML = "";
        return;
      }

      grid.innerHTML = cards.join("");
      status.textContent = `Auto-synced from GitHub: showing ${cards.length} repos (@${username})`;
    } catch (err) {
      console.error(err);
      status.innerHTML = `Couldn’t load GitHub repos. <a class="link" href="https://github.com/${username}" target="_blank" rel="noopener">View on GitHub</a>`;
    }
  }

  loadRepos();
});
