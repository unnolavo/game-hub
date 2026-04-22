/*
  Connect 4 (Phase 3)
  - 7 columns x 6 rows
  - local 2-player turns
  - win + draw detection
*/

(function () {
  const ROWS = 6;
  const COLUMNS = 7;

  const boardElement = document.getElementById("c4-board");
  const statusElement = document.getElementById("c4-status");
  const resetButton = document.getElementById("c4-reset");
  const turnDot = document.getElementById("c4-turn-dot");

  if (!boardElement || !statusElement || !resetButton || !turnDot) {
    return;
  }

  const state = {
    board: createEmptyBoard(),
    currentPlayer: 1,
    gameOver: false,
  };

  function createEmptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));
  }

  function createBoardUI() {
    const fragment = document.createDocumentFragment();

    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLUMNS; col += 1) {
        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = "cell";
        cell.dataset.row = String(row);
        cell.dataset.col = String(col);
        cell.setAttribute("role", "gridcell");
        cell.setAttribute("aria-label", `Column ${col + 1}, row ${row + 1}`);

        fragment.appendChild(cell);
      }
    }

    boardElement.replaceChildren(fragment);
  }

  function updateStatus(message) {
    statusElement.textContent = message;
    turnDot.className = `turn-dot ${state.currentPlayer === 1 ? "turn-dot--p1" : "turn-dot--p2"}`;
  }

  function renderBoard() {
    const cells = boardElement.querySelectorAll(".cell");

    cells.forEach((cell) => {
      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);
      const value = state.board[row][col];

      cell.classList.remove("cell--p1", "cell--p2");
      if (value === 1) cell.classList.add("cell--p1");
      if (value === 2) cell.classList.add("cell--p2");
      cell.disabled = state.gameOver;
    });
  }

  function getDropRow(column) {
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      if (state.board[row][column] === 0) {
        return row;
      }
    }

    return -1;
  }

  function inBounds(row, col) {
    return row >= 0 && row < ROWS && col >= 0 && col < COLUMNS;
  }

  function hasConnectFour(startRow, startCol, rowDelta, colDelta, player) {
    for (let step = 1; step < 4; step += 1) {
      const row = startRow + rowDelta * step;
      const col = startCol + colDelta * step;

      if (!inBounds(row, col) || state.board[row][col] !== player) {
        return false;
      }
    }

    return true;
  }

  function checkWin(row, col, player) {
    return (
      hasConnectFour(row, col, 0, 1, player) ||
      hasConnectFour(row, col, 1, 0, player) ||
      hasConnectFour(row, col, 1, 1, player) ||
      hasConnectFour(row, col, 1, -1, player) ||
      hasConnectFour(row, col, 0, -1, player) ||
      hasConnectFour(row, col, -1, 0, player) ||
      hasConnectFour(row, col, -1, -1, player) ||
      hasConnectFour(row, col, -1, 1, player)
    );
  }

  function checkDraw() {
    return state.board.every((row) => row.every((cell) => cell !== 0));
  }

  function handleBoardClick(event) {
    const target = event.target.closest(".cell");
    if (!target || state.gameOver) return;

    const column = Number(target.dataset.col);
    const dropRow = getDropRow(column);

    if (dropRow < 0) return;

    const player = state.currentPlayer;
    state.board[dropRow][column] = player;
    renderBoard();

    if (checkWin(dropRow, column, player)) {
      state.gameOver = true;
      updateStatus(`Player ${player} wins!`);
      renderBoard();
      return;
    }

    if (checkDraw()) {
      state.gameOver = true;
      updateStatus("Draw game. Start a new round.");
      renderBoard();
      return;
    }

    state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
    updateStatus(`Player ${state.currentPlayer}'s turn`);
  }

  function resetGame() {
    state.board = createEmptyBoard();
    state.currentPlayer = 1;
    state.gameOver = false;

    renderBoard();
    updateStatus("Player 1's turn");
  }

  boardElement.addEventListener("click", handleBoardClick);
  resetButton.addEventListener("click", resetGame);

  createBoardUI();
  resetGame();

  window.Connect4 = {
    reset: resetGame,
  };
})();
