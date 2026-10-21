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
      return iso || "";
    }
  };

  const extractDescriptionFromReadme = (text) => {
    if (!text) return "";

    const cleaned = text
      .replace(/\r/g, "")
      .replace(/^#.*$/gm, "")                 // remove headings
      .replace(/!\[.*?\]\(.*?\)/g, "")       // remove images
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")    // unwrap links
      .trim();

    const blocks = cleaned.split("\n\n").map(b => b.trim()).filter(Boolean);
    if (!blocks.length) return "";

    // if first block is bullets, use first 2 bullets
    if (/^[-*]\s+/m.test(blocks[0])) {
      const bullets = blocks[0]
        .split("\n")
        .map(l => l.trim())
        .filter(l => /^[-*]\s+/.test(l))
        .slice(0, 2)
        .map(l => l.replace(/^[-*]\s+/, ""));
      return bullets.join(" • ");
    }

    const first = blocks[0].replace(/\s+/g, " ");
    return first.length > 180 ? first.slice(0, 177) + "..." : first;
  };

  async function getSmartDescription(repo) {
    // prefer GitHub "About" description
    if (repo.description && repo.description.trim()) return repo.description.trim();

    // fallback to README
    const candidates = ["README.md", "readme.md"];
    for (const file of candidates) {
      const url = `https://raw.githubusercontent.com/${username}/${repo.name}/${repo.default_branch}/${file}`;
      try {
        const r = await fetch(url);
        if (!r.ok) continue;
        const text = await r.text();
        const extracted = extractDescriptionFromReadme(text);
        if (extracted) return extracted;
      } catch {
        // ignore
      }
    }
    return "";
  }

  const buildTechChips = (repo) => {
    const chips = [];
    if (repo.language) chips.push(repo.language);

    const name = (repo.name || "").toLowerCase();
    if (name.includes("docker")) chips.push("Docker");
    if (name.includes("k8") || name.includes("kube")) chips.push("Kubernetes");
    if (name.includes("microservice")) chips.push("Microservices");
    if (name.includes("cloud")) chips.push("Cloud");
    if (name.includes("devops")) chips.push("DevOps");
    if (name.includes("terraform")) chips.push("Terraform");
    if (name.includes("cicd") || name.includes("pipeline")) chips.push("CI/CD");

    return [...new Set(chips)].slice(0, 6);
  };

  const repoCard = (repo, desc) => {
    const stars = typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0;
    const forks = typeof repo.forks_count === "number" ? repo.forks_count : 0;

    const tech = buildTechChips(repo);
    const techLine = tech.length ? tech.join(" • ") : "";

    return `
      <div class="project card soft">
        <h3 class="h3">${escapeHtml(repo.name)}</h3>
        <p class="muted">${escapeHtml(desc)}</p>

        ${techLine ? `<div class="terminal"><strong>Key Tech:</strong> ${escapeHtml(techLine)}</div>` : ""}

        <div class="kv" style="margin-top:10px">
          <div class="chip">⭐ ${stars}</div>
          <div class="chip">🍴 ${forks}</div>
          <div class="chip">Updated: ${escapeHtml(fmtDate(repo.updated_at))}</div>
        </div>

        <div class="cta-row" style="margin-top:10px">
          <a class="neon-btn" href="${repo.html_url}" target="_blank" rel="noopener">View Repo</a>
          ${repo.homepage ? `<a class="neon-btn" href="${repo.homepage}" target="_blank" rel="noopener">Live</a>` : ""}
        </div>
      </div>
    `;
  };

  async function loadRepos() {
    status.textContent = "Loading GitHub repos…";

    // GitHub API doesn't work reliably on file://
    if (location.protocol === "file:") {
      status.textContent = "Tip: Run a local server (http://localhost) to load GitHub repos.";
      return;
    }

    try {
      const res = await fetch(
        `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
        { headers: { "Accept": "application/vnd.github+json" } }
      );

      if (res.status === 403) {
        status.textContent = "GitHub API rate limit hit. Try again later.";
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

        // ✅ Your requirement: only show repos with description
        if (!desc) continue;

        cards.push(repoCard(repo, desc));
        if (cards.length >= maxToShow) break;
      }

      grid.innerHTML = cards.join("");
      status.textContent = cards.length
        ? `Auto-synced from GitHub: showing ${cards.length} repos (@${username})`
        : "No repos with descriptions found. Add a GitHub 'About' description or README overview.";

    } catch (err) {
      console.error(err);
      status.textContent = "Couldn’t load GitHub repos (network/CORS).";
    }
  }

  loadRepos();
});