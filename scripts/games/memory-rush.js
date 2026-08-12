(function () {
  const symbols = ["A", "B", "C", "D", "E", "F", "G", "H"];

  function setChildren(element, child) {
    while (element.firstChild) element.removeChild(element.firstChild);
    if (child) element.appendChild(child);
  }

  function mount({ stage, controls, setScores, toast, stats, saveStats }) {
    const grid = document.createElement("div");
    grid.className = "memory-grid";
    setChildren(stage, grid);
    controls.innerHTML = `<div class="control-row"><button class="pill-button" type="button" data-action="shuffle">Shuffle</button></div>`;

    let deck = [];
    let open = [];
    let matched = 0;
    let moves = 0;
    let locked = false;
    let started = Date.now();

    function shuffle(items) {
      const copy = [...items];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }

    function updateScores() {
      setScores([
        { label: "Moves", value: moves },
        { label: "Matched", value: `${matched}/8` },
        { label: "Best", value: stats.memoryBest || "-" },
      ]);
    }

    function render() {
      setChildren(grid);
      deck.forEach((card, index) => {
        const button = document.createElement("button");
        button.className = "memory-card";
        button.type = "button";
        button.textContent = card.open || card.matched ? card.symbol : "?";
        button.setAttribute("aria-label", card.open || card.matched ? `Card ${card.symbol}` : "Hidden card");
        if (card.open) button.classList.add("is-open");
        if (card.matched) button.classList.add("is-matched");
        button.disabled = locked || card.open || card.matched;
        button.addEventListener("click", () => flip(index));
        grid.appendChild(button);
      });
      updateScores();
    }

    function flip(index) {
      if (locked || deck[index].open || deck[index].matched) return;
      deck[index].open = true;
      open.push(index);
      if (open.length === 2) {
        moves += 1;
        const [a, b] = open;
        if (deck[a].symbol === deck[b].symbol) {
          deck[a].matched = true;
          deck[b].matched = true;
          matched += 1;
          open = [];
          if (matched === symbols.length) {
            const seconds = Math.round((Date.now() - started) / 1000);
            const score = Math.max(1, 100 - moves + Math.max(0, 50 - seconds));
            stats.memoryBest = Math.max(stats.memoryBest || 0, score);
            saveStats();
            toast(`Memory cleared: ${score} points`);
          }
        } else {
          locked = true;
          window.setTimeout(() => {
            deck[a].open = false;
            deck[b].open = false;
            open = [];
            locked = false;
            render();
          }, 620);
        }
      }
      render();
    }

    function restart() {
      deck = shuffle([...symbols, ...symbols]).map((symbol) => ({ symbol, open: false, matched: false }));
      open = [];
      matched = 0;
      moves = 0;
      locked = false;
      started = Date.now();
      render();
    }

    controls.querySelector("[data-action='shuffle']").addEventListener("click", restart);
    restart();
    return { restart, destroy() {} };
  }

  window.MemoryRush = { mount };
})();
