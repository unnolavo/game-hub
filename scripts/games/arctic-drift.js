(function () {
  function setChildren(element, child) {
    while (element.firstChild) element.removeChild(element.firstChild);
    if (child) element.appendChild(child);
  }

  function mount({ stage, controls, setScores, toast, stats, saveStats }) {
    const canvas = document.createElement("canvas");
    canvas.className = "arcade-canvas";
    canvas.width = 960;
    canvas.height = 600;
    setChildren(stage, canvas);
    const ctx = canvas.getContext("2d");

    controls.innerHTML = `
      <div class="control-row">
        <button class="arcade-control" type="button" data-key="ArrowUp">▲</button>
      </div>
      <div class="control-row">
        <button class="arcade-control" type="button" data-key="ArrowLeft">◀</button>
        <button class="arcade-control" type="button" data-key="Space">BOOST</button>
        <button class="arcade-control" type="button" data-key="ArrowRight">▶</button>
      </div>
    `;

    const keys = new Set();
    let raf = 0;
    let last = performance.now();
    let running = true;
    const car = { x: 140, y: 300, vx: 0, vy: 0, angle: 0, boost: 100 };
    let score = 0;
    let time = 45;
    let checkpoint = 0;
    const stars = Array.from({ length: 9 }, (_, index) => ({
      x: 220 + ((index * 173) % 650),
      y: 90 + ((index * 97) % 420),
      taken: false,
    }));
    const gates = [
      { x: 780, y: 115 },
      { x: 810, y: 482 },
      { x: 188, y: 492 },
      { x: 180, y: 132 },
    ];

    function updateScoreStrip() {
      setScores([
        { label: "Score", value: score },
        { label: "Time", value: Math.max(0, Math.ceil(time)) },
        { label: "Gate", value: `${checkpoint + 1}/4` },
      ]);
    }

    function drawTrack() {
      ctx.fillStyle = "#dff9ff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(18, 98, 122, 0.18)";
      ctx.lineWidth = 2;
      for (let x = 0; x < canvas.width; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - 120, canvas.height);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(19, 71, 91, 0.34)";
      ctx.lineWidth = 26;
      ctx.strokeRect(90, 70, 780, 460);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
      ctx.lineWidth = 18;
      ctx.strokeRect(120, 100, 720, 400);
    }

    function drawStar(x, y) {
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = "#f3b64d";
      ctx.beginPath();
      for (let i = 0; i < 10; i += 1) {
        const radius = i % 2 ? 7 : 15;
        const angle = -Math.PI / 2 + (i * Math.PI) / 5;
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawCar() {
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);
      ctx.fillStyle = "rgba(22, 44, 54, 0.2)";
      ctx.fillRect(-28, 18, 56, 8);
      ctx.fillStyle = "#ff6f61";
      ctx.fillRect(-24, -14, 48, 28);
      ctx.fillStyle = "#f3b64d";
      ctx.fillRect(4, -10, 16, 20);
      ctx.fillStyle = "#10131a";
      ctx.fillRect(-20, -18, 10, 5);
      ctx.fillRect(-20, 13, 10, 5);
      ctx.fillRect(12, -18, 10, 5);
      ctx.fillRect(12, 13, 10, 5);
      ctx.restore();
    }

    function tick(now) {
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      if (!running) return;

      if (time > 0) time -= dt;
      const thrust = keys.has("ArrowUp") ? 520 : 0;
      const boosting = keys.has("Space") && car.boost > 0;
      const force = thrust + (boosting ? 520 : 0);
      if (boosting) car.boost = Math.max(0, car.boost - 38 * dt);
      else car.boost = Math.min(100, car.boost + 18 * dt);
      if (keys.has("ArrowLeft")) car.angle -= 3.2 * dt;
      if (keys.has("ArrowRight")) car.angle += 3.2 * dt;

      car.vx += Math.cos(car.angle) * force * dt;
      car.vy += Math.sin(car.angle) * force * dt;
      car.vx *= 0.982;
      car.vy *= 0.982;
      car.x += car.vx * dt;
      car.y += car.vy * dt;
      if (car.x < 35 || car.x > canvas.width - 35) car.vx *= -0.72;
      if (car.y < 35 || car.y > canvas.height - 35) car.vy *= -0.72;
      car.x = Math.max(35, Math.min(canvas.width - 35, car.x));
      car.y = Math.max(35, Math.min(canvas.height - 35, car.y));

      stars.forEach((star) => {
        if (!star.taken && Math.hypot(car.x - star.x, car.y - star.y) < 34) {
          star.taken = true;
          score += 25;
        }
      });
      const gate = gates[checkpoint];
      if (Math.hypot(car.x - gate.x, car.y - gate.y) < 54) {
        checkpoint = (checkpoint + 1) % gates.length;
        score += 100;
        time += 4;
        toast("Checkpoint cleared");
      }
      if (time <= 0) {
        running = false;
        stats.bestDrift = Math.max(stats.bestDrift || 0, score);
        saveStats();
        toast(`Run complete: ${score} points`);
      }

      drawTrack();
      stars.filter((star) => !star.taken).forEach((star) => drawStar(star.x, star.y));
      gates.forEach((item, index) => {
        ctx.strokeStyle = index === checkpoint ? "#ff6f61" : "rgba(16, 19, 26, 0.28)";
        ctx.lineWidth = index === checkpoint ? 8 : 4;
        ctx.strokeRect(item.x - 34, item.y - 34, 68, 68);
      });
      drawCar();
      ctx.fillStyle = "#10131a";
      ctx.fillRect(28, 28, 210, 14);
      ctx.fillStyle = "#72e39b";
      ctx.fillRect(28, 28, 210 * (car.boost / 100), 14);
      updateScoreStrip();
      raf = requestAnimationFrame(tick);
    }

    function restart() {
      car.x = 140;
      car.y = 300;
      car.vx = 0;
      car.vy = 0;
      car.angle = 0;
      car.boost = 100;
      score = 0;
      time = 45;
      checkpoint = 0;
      stars.forEach((star) => {
        star.taken = false;
      });
      running = true;
      last = performance.now();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    }

    function keyDown(event) {
      if (["ArrowUp", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
        keys.add(event.code);
        event.preventDefault();
      }
    }

    function keyUp(event) {
      keys.delete(event.code);
    }

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    controls.querySelectorAll("[data-key]").forEach((button) => {
      const code = button.dataset.key;
      button.addEventListener("pointerdown", () => keys.add(code));
      button.addEventListener("pointerup", () => keys.delete(code));
      button.addEventListener("pointerleave", () => keys.delete(code));
    });

    restart();
    return {
      restart,
      destroy() {
        running = false;
        cancelAnimationFrame(raf);
        window.removeEventListener("keydown", keyDown);
        window.removeEventListener("keyup", keyUp);
      },
    };
  }

  window.ArcticDrift = { mount };
})();
