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

  // Extract a neat summary from README text
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

    if (/^[-*]\s+/m.test(blocks[0])) {
      const bullets = blocks[0]
        .split("\n")
        .map(l => l.trim())
        .filter(l => /^[-*]\s+/.test(l));
      const firstTwo = bullets.slice(0, 2).map(l => l.replace(/^[-*]\s+/, ""));
      return firstTwo.join(" • ");
    }

    const first = blocks[0].replace(/\s+/g, " ");
    return first.length > 180 ? first.slice(0, 177) + "..." : first;
  };

  async function getSmartDescription(repo) {
    // 1) Prefer GitHub "About" description
    if (repo.description && repo.description.trim()) return repo.description.trim();

    // 2) If missing, try to get from README
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

    // 3) No description -> hide this repo from the portfolio list
    return "";
  }

  // Build "Key Tech" chips automatically
  const buildTechChips = (repo) => {
    const chips = [];
    if (repo.language) chips.push(repo.language);

    const name = (repo.name || "").toLowerCase();
    if (name.includes("docker")) chips.push("Docker");
    if (name.includes("k8") || name.includes("kube")) chips.push("Kubernetes");
    if (name.includes("microservice")) chips.push("Microservices");
    if (name.includes("cloud")) chips.push("Cloud");
    if (name.includes("devops")) chips.push("DevOps");
    if (name.includes("finance")) chips.push("OCR/NLP");

    return [...new Set(chips)].slice(0, 6);
  };

  const repoCard = (repo, desc) => {
    // ✅ If no description, don't render card
    if (!desc || !desc.trim()) return "";

    const stars = typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0;
    const forks = typeof repo.forks_count === "number" ? repo.forks_count : 0;

    const tech = buildTechChips(repo);
    const techHtml = tech.length
      ? `<div class="kv" style="margin-top:8px">
          ${tech.map(t => `<div class="chip">${escapeHtml(t)}</div>`).join("")}
        </div>`
      : "";

    const terminalHtml = tech.length
      ? `<div class="terminal" style="margin:10px 0; font-size:13px;">
          <strong>Key Tech:</strong> ${escapeHtml(tech.join(", "))}
        </div>`
      : "";

    return `
      <div class="project card reveal" style="opacity:0">
        <h4>${escapeHtml(repo.name)}</h4>
        <p style="color:var(--text)">${escapeHtml(desc)}</p>

        ${terminalHtml}

        <div class="kv" style="margin-top:8px">
          <div class="chip">⭐ ${stars}</div>
          <div class="chip">🍴 ${forks}</div>
          <div class="chip">Updated: ${escapeHtml(fmtDate(repo.updated_at))}</div>
        </div>

        ${techHtml}

        <div style="margin-top:12px">
          <a class="neon-btn" href="${repo.html_url}" target="_blank" rel="noopener" style="font-size:14px; margin-right:8px">View Repo</a>
          ${repo.homepage ? `<a class="neon-btn" href="${repo.homepage}" target="_blank" rel="noopener" style="font-size:14px">Live</a>` : ""}
        </div>
      </div>
    `;
  };

  async function loadRepos() {
    status.textContent = "Loading GitHub repos…";

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
        const card = repoCard(repo, desc);
        if (card) cards.push(card); // ✅ Only push repos with descriptions
        if (cards.length >= maxToShow) break; // ✅ stop once we have enough visible cards
      }

      if (!cards.length) {
        status.textContent = "No repos with descriptions found. Add descriptions in GitHub repo About section.";
        grid.innerHTML = "";
        return;
      }

      grid.innerHTML = cards.join("");
      status.textContent = `Auto-synced from GitHub: showing ${cards.length} repos (@${username})`;

      const reveals = grid.querySelectorAll(".reveal");
      reveals.forEach((el, i) => setTimeout(() => (el.style.opacity = 1), i * 120));

    } catch (err) {
      console.error(err);
      status.textContent = "Couldn’t load GitHub repos (network/CORS).";
    }
  }

  loadRepos();
});
