(function () {
  const ROWS = 6;
  const COLS = 7;
  const HUMAN = 1;
  const CPU = 2;

  function setChildren(element, child) {
    while (element.firstChild) element.removeChild(element.firstChild);
    if (child) element.appendChild(child);
  }

  function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }

  function getDropRow(board, col) {
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      if (!board[row][col]) return row;
    }
    return -1;
  }

  function availableColumns(board) {
    return Array.from({ length: COLS }, (_, col) => col).filter((col) => getDropRow(board, col) >= 0);
  }

  function findWin(board, row, col, player) {
    const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (const [dr, dc] of dirs) {
      const cells = [{ row, col }];
      for (const sign of [-1, 1]) {
        let r = row + dr * sign;
        let c = col + dc * sign;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
          cells.push({ row: r, col: c });
          r += dr * sign;
          c += dc * sign;
        }
      }
      if (cells.length >= 4) return cells.slice(0, 4);
    }
    return null;
  }

  function scoreMove(board, col, player) {
    const row = getDropRow(board, col);
    if (row < 0) return -999;
    const copy = board.map((line) => [...line]);
    copy[row][col] = player;
    if (findWin(copy, row, col, player)) return 500;
    const centerBias = 6 - Math.abs(3 - col);
    let score = centerBias;
    const opponent = player === 1 ? 2 : 1;
    availableColumns(copy).forEach((nextCol) => {
      const nextRow = getDropRow(copy, nextCol);
      copy[nextRow][nextCol] = opponent;
      if (findWin(copy, nextRow, nextCol, opponent)) score -= 90;
      copy[nextRow][nextCol] = 0;
    });
    return score;
  }

  function pickCpuMove(board) {
    const columns = availableColumns(board);
    for (const col of columns) {
      const row = getDropRow(board, col);
      board[row][col] = CPU;
      const wins = findWin(board, row, col, CPU);
      board[row][col] = 0;
      if (wins) return col;
    }
    for (const col of columns) {
      const row = getDropRow(board, col);
      board[row][col] = HUMAN;
      const blocks = findWin(board, row, col, HUMAN);
      board[row][col] = 0;
      if (blocks) return col;
    }
    return columns.sort((a, b) => scoreMove(board, b, CPU) - scoreMove(board, a, CPU))[0];
  }

  function mount({ stage, controls, setScores, toast }) {
    const state = {
      board: createBoard(),
      player: 1,
      mode: "ai",
      winner: 0,
      winningCells: [],
      lastMove: null,
      rounds: 0,
      locked: false,
    };

    const wrap = document.createElement("div");
    wrap.className = "c4-wrap";
    const columns = document.createElement("div");
    columns.className = "c4-columns";
    const boardEl = document.createElement("div");
    boardEl.className = "c4-board";
    boardEl.setAttribute("role", "grid");
    boardEl.setAttribute("aria-label", "Connect 4 board");
    wrap.appendChild(columns);
    wrap.appendChild(boardEl);
    setChildren(stage, wrap);

    const modeSwitch = document.createElement("div");
    modeSwitch.className = "mode-switch";
    modeSwitch.innerHTML = `
      <button class="pill-button" type="button" data-mode="ai" aria-pressed="true">Vs AI</button>
      <button class="pill-button" type="button" data-mode="local" aria-pressed="false">2 Players</button>
    `;
    setChildren(controls, modeSwitch);

    function updateScores() {
      const status = state.winner
        ? `Player ${state.winner}`
        : state.board.every((row) => row.every(Boolean))
          ? "Draw"
          : `Player ${state.player}`;
      setScores([
        { label: "Turn", value: status },
        { label: "Mode", value: state.mode === "ai" ? "Vs AI" : "2P" },
        { label: "Rounds", value: state.rounds },
      ]);
    }

    function render() {
      setChildren(columns);
      setChildren(boardEl);
      const winSet = new Set(state.winningCells.map((cell) => `${cell.row}:${cell.col}`));

      for (let col = 0; col < COLS; col += 1) {
        const button = document.createElement("button");
        button.className = "c4-column-button";
        button.type = "button";
        button.textContent = "↓";
        button.setAttribute("aria-label", `Drop in column ${col + 1}`);
        button.disabled = state.locked || Boolean(state.winner) || getDropRow(state.board, col) < 0;
        button.addEventListener("click", () => playColumn(col));
        columns.appendChild(button);
      }

      for (let row = 0; row < ROWS; row += 1) {
        for (let col = 0; col < COLS; col += 1) {
          const cell = document.createElement("div");
          cell.className = "c4-cell";
          cell.setAttribute("role", "gridcell");
          if (state.board[row][col] === 1) cell.classList.add("c4-cell--p1");
          if (state.board[row][col] === 2) cell.classList.add("c4-cell--p2");
          if (winSet.has(`${row}:${col}`)) cell.classList.add("c4-cell--win");
          if (state.lastMove && state.lastMove.row === row && state.lastMove.col === col) {
            cell.classList.add("c4-cell--drop");
          }
          boardEl.appendChild(cell);
        }
      }
      updateScores();
    }

    function playColumn(col) {
      if (state.winner || state.locked) return;
      const row = getDropRow(state.board, col);
      if (row < 0) return;
      state.board[row][col] = state.player;
      state.lastMove = { row, col };
      const win = findWin(state.board, row, col, state.player);
      if (win) {
        state.winner = state.player;
        state.winningCells = win;
        state.rounds += 1;
        toast(`Player ${state.player} wins Connect 4`);
        render();
        return;
      }
      if (!availableColumns(state.board).length) {
        state.rounds += 1;
        toast("Connect 4 ended in a draw");
        render();
        return;
      }
      state.player = state.player === 1 ? 2 : 1;
      render();
      if (state.mode === "ai" && state.player === CPU) {
        state.locked = true;
        render();
        window.setTimeout(() => {
          state.locked = false;
          playColumn(pickCpuMove(state.board));
        }, 360);
      }
    }

    function restart() {
      state.board = createBoard();
      state.player = 1;
      state.winner = 0;
      state.winningCells = [];
      state.lastMove = null;
      state.locked = false;
      render();
    }

    modeSwitch.addEventListener("click", (event) => {
      const button = event.target.closest("[data-mode]");
      if (!button) return;
      state.mode = button.dataset.mode;
      modeSwitch.querySelectorAll("[data-mode]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      restart();
    });

    render();
    return { restart, destroy() {} };
  }

  window.Connect4Game = { mount };
})();
