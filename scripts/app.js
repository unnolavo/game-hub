/*
  App shell behavior
  - Single-page view switching
  - In-game drawer actions
  - hub polish for smoother transitions
*/

(function () {
  const TRANSITION_MS = 200;

  const appRoot = document.getElementById("app");
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
  let isTransitioning = false;

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

  function switchView({ fromView, toView, enteringGame }) {
    if (isTransitioning) return;

    isTransitioning = true;

    toView.hidden = false;
    requestAnimationFrame(() => {
      toView.classList.add("view--active");
      fromView.classList.remove("view--active");

      window.setTimeout(() => {
        fromView.hidden = true;
        isTransitioning = false;
      }, TRANSITION_MS);
    });

    appRoot?.classList.toggle("app-shell--in-game", enteringGame);
  }

  function showMenu() {
    closeDrawer();
    switchView({ fromView: gameView, toView: menuView, enteringGame: false });
  }

  function showGame() {
    closeDrawer();
    switchView({ fromView: menuView, toView: gameView, enteringGame: true });
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
