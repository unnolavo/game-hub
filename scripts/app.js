/*
  App shell behavior
  - Single-page view switching
  - In-game drawer actions
*/

(function () {
  const menuView = document.getElementById("menu-view");
  const gameView = document.getElementById("game-view");

  const connect4Buttons = document.querySelectorAll('[data-game="connect4"]');
  const backButton = document.querySelector('[data-action="back-to-menu"]');

  const drawer = document.getElementById("game-drawer");
  const drawerToggleButton = document.querySelector('[data-action="toggle-drawer"]');
  const instructionsButton = document.querySelector('[data-action="show-instructions"]');
  const toggleSoundButton = document.querySelector('[data-action="toggle-sound"]');
  const quitGameButton = document.querySelector('[data-action="quit-game"]');
  const toast = document.getElementById("app-toast");

  let soundOn = false;
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.hidden = false;

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 1700);
  }

  function closeDrawer() {
    if (!drawer || !drawerToggleButton) return;

    drawer.hidden = true;
    drawerToggleButton.setAttribute("aria-expanded", "false");
  }

  function toggleDrawer() {
    if (!drawer || !drawerToggleButton) return;

    const willOpen = drawer.hidden;
    drawer.hidden = !willOpen;
    drawerToggleButton.setAttribute("aria-expanded", String(willOpen));
  }

  function showMenu() {
    menuView.hidden = false;
    menuView.classList.add("view--active");

    gameView.classList.remove("view--active");
    window.setTimeout(() => {
      gameView.hidden = true;
    }, 170);

    closeDrawer();
  }

  function showGame() {
    gameView.hidden = false;
    gameView.classList.add("view--active");

    menuView.classList.remove("view--active");
    window.setTimeout(() => {
      menuView.hidden = true;
    }, 170);

    closeDrawer();
  }

  function showInstructions() {
    closeDrawer();
    showToast("Drop into a column. Connect 4 to win. Board full = draw.");
  }

  function toggleSound() {
    soundOn = !soundOn;
    toggleSoundButton.textContent = `Sound: ${soundOn ? "On" : "Off"}`;
    showToast(`Sound ${soundOn ? "enabled" : "disabled"} (placeholder)`);
  }

  function quitGame() {
    window.Connect4?.reset?.();
    showMenu();
  }

  connect4Buttons.forEach((button) => button.addEventListener("click", showGame));
  backButton?.addEventListener("click", showMenu);
  drawerToggleButton?.addEventListener("click", toggleDrawer);
  instructionsButton?.addEventListener("click", showInstructions);
  toggleSoundButton?.addEventListener("click", toggleSound);
  quitGameButton?.addEventListener("click", quitGame);
})();
