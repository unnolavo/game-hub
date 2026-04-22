/*
  Phase 1 app shell behavior:
  - Keeps menu + game inside one page (single-page architecture).
  - Provides lightweight view switching for future games.
*/

(function () {
  const menuView = document.getElementById("menu-view");
  const gameView = document.getElementById("game-view");
  const connect4Button = document.querySelector('[data-game="connect4"]');
  const backButton = document.querySelector('[data-action="back-to-menu"]');

  function showMenu() {
    menuView.hidden = false;
    gameView.hidden = true;
    menuView.classList.add("view--active");
    gameView.classList.remove("view--active");
  }

  function showGame() {
    menuView.hidden = true;
    gameView.hidden = false;
    gameView.classList.add("view--active");
    menuView.classList.remove("view--active");
  }

  connect4Button?.addEventListener("click", showGame);
  backButton?.addEventListener("click", showMenu);
})();
