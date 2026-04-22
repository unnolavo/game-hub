/*
  Connect 4 (Phase 4 polish)
  - 7 columns x 6 rows
  - local 2-player turns
  - win + draw detection
  - subtle move / win feedback
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
    hoverColumn: null,
    lastMove: null,
    winningCells: [],
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

  function getDropRow(column) {
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      if (state.board[row][column] === 0) {
        return row;
      }
    }

    return -1;
  }

  function renderBoard() {
    const cells = boardElement.querySelectorAll(".cell");
    const winningSet = new Set(state.winningCells.map(({ row, col }) => `${row}:${col}`));
    const previewRow =
      state.hoverColumn === null || state.gameOver ? -1 : getDropRow(state.hoverColumn);

    cells.forEach((cell) => {
      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);
      const value = state.board[row][col];

      cell.className = "cell";

      if (value === 1) cell.classList.add("cell--p1");
      if (value === 2) cell.classList.add("cell--p2");

      if (
        state.lastMove &&
        state.lastMove.row === row &&
        state.lastMove.col === col &&
        !state.gameOver
      ) {
        cell.classList.add("cell--drop");
      }

      if (winningSet.has(`${row}:${col}`)) {
        cell.classList.add("cell--winner");
      }

      if (row === previewRow && col === state.hoverColumn && value === 0 && !state.gameOver) {
        cell.classList.add(state.currentPlayer === 1 ? "cell--preview-p1" : "cell--preview-p2");
      }

      cell.disabled = state.gameOver;
    });
  }

  function inBounds(row, col) {
    return row >= 0 && row < ROWS && col >= 0 && col < COLUMNS;
  }

  function findConnectedCells(startRow, startCol, rowDelta, colDelta, player) {
    const result = [{ row: startRow, col: startCol }];

    let row = startRow + rowDelta;
    let col = startCol + colDelta;
    while (inBounds(row, col) && state.board[row][col] === player) {
      result.push({ row, col });
      row += rowDelta;
      col += colDelta;
    }

    row = startRow - rowDelta;
    col = startCol - colDelta;
    while (inBounds(row, col) && state.board[row][col] === player) {
      result.unshift({ row, col });
      row -= rowDelta;
      col -= colDelta;
    }

    return result;
  }

  function findWinningLine(row, col, player) {
    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (const [rowDelta, colDelta] of directions) {
      const connected = findConnectedCells(row, col, rowDelta, colDelta, player);
      if (connected.length >= 4) {
        return connected.slice(0, 4);
      }
    }

    return null;
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
    state.lastMove = { row: dropRow, col: column };

    const winningLine = findWinningLine(dropRow, column, player);
    if (winningLine) {
      state.gameOver = true;
      state.winningCells = winningLine;
      updateStatus(`Player ${player} wins!`);
      renderBoard();
      return;
    }

    if (checkDraw()) {
      state.gameOver = true;
      state.winningCells = [];
      updateStatus("Draw game. Start a new round.");
      renderBoard();
      return;
    }

    state.currentPlayer = state.currentPlayer === 1 ? 2 : 1;
    updateStatus(`Player ${state.currentPlayer}'s turn`);
    renderBoard();
  }

  function handleBoardHover(event) {
    const target = event.target.closest(".cell");
    if (!target || state.gameOver) return;

    state.hoverColumn = Number(target.dataset.col);
    renderBoard();
  }

  function clearBoardHover() {
    if (state.hoverColumn === null) return;

    state.hoverColumn = null;
    renderBoard();
  }

  function resetGame() {
    state.board = createEmptyBoard();
    state.currentPlayer = 1;
    state.gameOver = false;
    state.hoverColumn = null;
    state.lastMove = null;
    state.winningCells = [];

    renderBoard();
    updateStatus("Player 1's turn");
  }

  boardElement.addEventListener("click", handleBoardClick);
  boardElement.addEventListener("pointermove", handleBoardHover);
  boardElement.addEventListener("pointerleave", clearBoardHover);
  resetButton.addEventListener("click", resetGame);

  createBoardUI();
  resetGame();

  window.Connect4 = {
    reset: resetGame,
  };
})();
