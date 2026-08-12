(function () {
  function mount({ stage, controls, setScores, toast }) {
    const canvas = document.createElement("canvas");
    canvas.className = "arcade-canvas";
    canvas.width = 720;
    canvas.height = 720;
    stage.replaceChildren(canvas);
    const ctx = canvas.getContext("2d");
    controls.innerHTML = `
      <div class="control-row"><button class="arcade-control" type="button" data-dir="up">▲</button></div>
      <div class="control-row">
        <button class="arcade-control" type="button" data-dir="left">◀</button>
        <button class="arcade-control" type="button" data-dir="down">▼</button>
        <button class="arcade-control" type="button" data-dir="right">▶</button>
      </div>
    `;

    const size = 18;
    let snake;
    let food;
    let dir;
    let nextDir;
    let score;
    let best = Number(localStorage.getItem("frostbyte-snake-best") || 0);
    let timer = 0;

    function placeFood() {
      do {
        food = {
          x: Math.floor(Math.random() * size),
          y: Math.floor(Math.random() * size),
        };
      } while (snake.some((part) => part.x === food.x && part.y === food.y));
    }

    function setDirection(value) {
      const opposites = { up: "down", down: "up", left: "right", right: "left" };
      if (opposites[value] !== dir) nextDir = value;
    }

    function draw() {
      const tile = canvas.width / size;
      ctx.fillStyle = "#10131a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(114, 227, 155, 0.14)";
      for (let i = 0; i <= size; i += 1) {
        ctx.beginPath();
        ctx.moveTo(i * tile, 0);
        ctx.lineTo(i * tile, canvas.height);
        ctx.moveTo(0, i * tile);
        ctx.lineTo(canvas.width, i * tile);
        ctx.stroke();
      }
      ctx.fillStyle = "#f3b64d";
      ctx.fillRect(food.x * tile + 7, food.y * tile + 7, tile - 14, tile - 14);
      snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#72e39b" : "#2fbf71";
        ctx.fillRect(part.x * tile + 4, part.y * tile + 4, tile - 8, tile - 8);
      });
      setScores([
        { label: "Score", value: score },
        { label: "Best", value: best },
        { label: "Length", value: snake.length },
      ]);
    }

    function step() {
      dir = nextDir;
      const head = { ...snake[0] };
      if (dir === "up") head.y -= 1;
      if (dir === "down") head.y += 1;
      if (dir === "left") head.x -= 1;
      if (dir === "right") head.x += 1;
      const crashed =
        head.x < 0 ||
        head.y < 0 ||
        head.x >= size ||
        head.y >= size ||
        snake.some((part) => part.x === head.x && part.y === head.y);
      if (crashed) {
        best = Math.max(best, score);
        localStorage.setItem("frostbyte-snake-best", String(best));
        toast(`Circuit ended: ${score}`);
        restart();
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        score += 10;
        placeFood();
      } else {
        snake.pop();
      }
      draw();
    }

    function restart() {
      snake = [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }];
      dir = "right";
      nextDir = "right";
      score = 0;
      placeFood();
      draw();
      clearInterval(timer);
      timer = window.setInterval(step, 135);
    }

    function keyDown(event) {
      const map = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
      if (map[event.code]) {
        event.preventDefault();
        setDirection(map[event.code]);
      }
    }

    controls.querySelectorAll("[data-dir]").forEach((button) => {
      button.addEventListener("click", () => setDirection(button.dataset.dir));
    });
    window.addEventListener("keydown", keyDown);
    restart();
    return {
      restart,
      destroy() {
        clearInterval(timer);
        window.removeEventListener("keydown", keyDown);
      },
    };
  }

  window.CircuitSnake = { mount };
})();
