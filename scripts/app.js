(function () {
  const games = [
    {
      id: "arctic-drift",
      title: "Arctic Drift",
      kicker: "Featured",
      description: "Slide across ice, collect stars, and thread checkpoints before the clock melts.",
      tags: ["Drift", "Skill"],
      accent: "#8fe8ff",
      bg: "linear-gradient(135deg, #16475d, #d8fbff)",
      module: window.ArcticDrift,
    },
    {
      id: "connect4",
      title: "Connect 4",
      kicker: "Board Battle",
      description: "A glossy classic with pass-and-play or a sharp arcade AI opponent.",
      tags: ["2P", "AI"],
      accent: "#f3b64d",
      bg: "linear-gradient(135deg, #184f86, #1c72b8)",
      module: window.Connect4Game,
    },
    {
      id: "snake",
      title: "Circuit Snake",
      kicker: "Reflex",
      description: "Dash through a neon circuit, chain cells, and avoid your own trail.",
      tags: ["Arcade", "Score"],
      accent: "#72e39b",
      bg: "linear-gradient(135deg, #153c2d, #72e39b)",
      module: window.CircuitSnake,
    },
    {
      id: "memory",
      title: "Memory Rush",
      kicker: "Puzzle",
      description: "Flip fast, match symbols, and keep your move count clean.",
      tags: ["Puzzle", "Focus"],
      accent: "#ff6f61",
      bg: "linear-gradient(135deg, #4d2630, #ff8a6b)",
      module: window.MemoryRush,
    },
  ];

  const hubView = document.getElementById("hub-view");
  const gameView = document.getElementById("game-view");
  const gameGrid = document.getElementById("game-grid");
  const gameTitle = document.getElementById("game-title");
  const gameKicker = document.getElementById("game-kicker");
  const gameStage = document.getElementById("game-stage");
  const scoreStrip = document.getElementById("score-strip");
  const controlDeck = document.getElementById("control-deck");
  const toast = document.getElementById("app-toast");
  const bestDrift = document.getElementById("best-drift");
  const hubStreak = document.getElementById("hub-streak");

  let activeGame = null;
  let activeApi = null;
  let toastTimer = 0;
  const stats = loadStats();

  function loadStats() {
    try {
      return JSON.parse(localStorage.getItem("frostbyte-arcade-stats")) || {};
    } catch {
      return {};
    }
  }

  function saveStats() {
    localStorage.setItem("frostbyte-arcade-stats", JSON.stringify(stats));
    renderHubStats();
  }

  function renderHubStats() {
    bestDrift.textContent = String(stats.bestDrift || 0);
    hubStreak.textContent = String(stats.memoryBest || 0);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 1800);
  }

  function renderGameTiles() {
    const fragment = document.createDocumentFragment();

    games.forEach((game) => {
      const tile = document.createElement("button");
      tile.className = "game-tile";
      tile.type = "button";
      tile.dataset.game = game.id;
      tile.style.setProperty("--tile-bg", game.bg);
      tile.style.setProperty("--tile-accent", game.accent);
      tile.innerHTML = `
        <span class="tile-art" aria-hidden="true"></span>
        <span>
          <span class="eyebrow">${game.kicker}</span>
          <h2>${game.title}</h2>
          <p>${game.description}</p>
        </span>
        <span class="tag-row">${game.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</span>
      `;
      tile.addEventListener("click", () => openGame(game.id));
      fragment.appendChild(tile);
    });

    gameGrid.replaceChildren(fragment);
  }

  function setScores(items) {
    const cards = items.map(({ label, value }) => {
      const card = document.createElement("div");
      card.className = "score-card";
      card.innerHTML = `<span class="stat-label">${label}</span><strong>${value}</strong>`;
      return card;
    });
    scoreStrip.replaceChildren(...cards);
  }

  function openGame(gameId) {
    const game = games.find((entry) => entry.id === gameId);
    if (!game || !game.module) {
      showToast("That game is not ready yet.");
      return;
    }

    activeApi?.destroy?.();
    activeGame = game;
    gameTitle.textContent = game.title;
    gameKicker.textContent = game.kicker;
    gameStage.replaceChildren();
    controlDeck.replaceChildren();
    setScores([{ label: "Loading", value: "Ready" }, { label: "Mode", value: game.tags[0] }, { label: "Best", value: "-" }]);

    activeApi = game.module.mount({
      stage: gameStage,
      controls: controlDeck,
      setScores,
      toast: showToast,
      stats,
      saveStats,
    });

    hubView.hidden = true;
    hubView.classList.remove("view--active");
    gameView.hidden = false;
    requestAnimationFrame(() => gameView.classList.add("view--active"));
  }

  function backToHub() {
    activeApi?.destroy?.();
    activeApi = null;
    activeGame = null;
    gameView.classList.remove("view--active");
    window.setTimeout(() => {
      gameView.hidden = true;
      hubView.hidden = false;
      requestAnimationFrame(() => hubView.classList.add("view--active"));
    }, 160);
  }

  document.querySelector('[data-action="back-to-hub"]')?.addEventListener("click", backToHub);
  document.querySelector('[data-action="restart-game"]')?.addEventListener("click", () => {
    activeApi?.restart?.();
    if (activeGame) showToast(`${activeGame.title} restarted`);
  });

  renderGameTiles();
  renderHubStats();
})();
