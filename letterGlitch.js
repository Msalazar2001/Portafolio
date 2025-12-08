(function () {
  const container = document.getElementById("letter-glitch");

  // OPTIONS — puedes editarlas aquí
  const glitchColors = ['#00ff99', '#00cc7a', '#00aa66'];
  const glitchSpeed = 50;
  const centerVignette = true;
  const outerVignette = false;
  const smooth = true;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789';

  // CANVAS
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  container.appendChild(canvas);

  if (outerVignette) {
    const ov = document.createElement("div");
    ov.classList.add("glitch-vignette-outer");
    container.appendChild(ov);
  }
  if (centerVignette) {
    const cv = document.createElement("div");
    cv.classList.add("glitch-vignette-center");
    container.appendChild(cv);
  }

  let letters = [];
  let grid = { columns: 0, rows: 0 };
  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;

  const hexToRgb = hex => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? {
      r: parseInt(r[1], 16),
      g: parseInt(r[2], 16),
      b: parseInt(r[3], 16)
    } : null;
  };

  const interpolateColor = (start, end, f) => {
    return `rgb(${Math.round(start.r + (end.r - start.r) * f)},
                 ${Math.round(start.g + (end.g - start.g) * f)},
                 ${Math.round(start.b + (end.b - start.b) * f)})`;
  };

  const getRandomChar = () => characters[Math.floor(Math.random() * characters.length)];
  const getRandomColor = () => glitchColors[Math.floor(Math.random() * glitchColors.length)];

  function calculateGrid(w, h) {
    return {
      columns: Math.ceil(w / charWidth),
      rows: Math.ceil(h / charHeight)
    };
  }

  function initializeLetters(columns, rows) {
    grid = { columns, rows };
    letters = Array.from({ length: columns * rows }, () => ({
      char: getRandomChar(),
      color: getRandomColor(),
      targetColor: getRandomColor(),
      colorProgress: 1
    }));
  }

  function resizeCanvas() {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const g = calculateGrid(rect.width, rect.height);
    initializeLetters(g.columns, g.rows);

    drawLetters();
  }

  function drawLetters() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = 'top';

    letters.forEach((letter, i) => {
      const x = (i % grid.columns) * charWidth;
      const y = Math.floor(i / grid.columns) * charHeight;
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, x, y);
    });
  }

  function updateLetters() {
    const count = Math.max(1, Math.floor(letters.length * 0.05));

    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * letters.length);
      const L = letters[idx];

      L.char = getRandomChar();
      L.targetColor = getRandomColor();
      L.colorProgress = smooth ? 0 : 1;

      if (!smooth) L.color = L.targetColor;
    }
  }

  function smoothColors() {
    let redraw = false;

    letters.forEach(L => {
      if (L.colorProgress < 1) {
        L.colorProgress += 0.05;
        if (L.colorProgress > 1) L.colorProgress = 1;

        const start = hexToRgb(L.color);
        const end = hexToRgb(L.targetColor);

        if (start && end) {
          L.color = interpolateColor(start, end, L.colorProgress);
          redraw = true;
        }
      }
    });

    if (redraw) drawLetters();
  }

  // MAIN LOOP
  let lastTime = Date.now();
  function animate() {
    const now = Date.now();

    if (now - lastTime >= glitchSpeed) {
      updateLetters();
      drawLetters();
      lastTime = now;
    }

    if (smooth) smoothColors();
    requestAnimationFrame(animate);
  }

  // INIT
  resizeCanvas();
  animate();
  window.addEventListener("resize", () => {
    clearTimeout(window._glitchResize);
    window._glitchResize = setTimeout(() => {
      resizeCanvas();
    }, 120);
  });

})();