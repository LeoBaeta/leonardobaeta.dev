// --- Subtle code-rain background ---
(function () {
  const canvas = document.getElementById('code-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Snippets that slowly drift down - C keywords, symbols, hex values
  const fragments = [
    '#include', 'void', 'int', 'return', 'if', 'else', 'for', 'while',
    'struct', 'const', 'static', '*ptr', '0x1A', '0xFF', '&&', '||',
    '!=', '>>', '<<', '++;', 'NULL', 'char', 'sizeof', '#define',
    'uint8_t', 'volatile', 'extern', 'break', '{ }', '/**/', '->'
  ];

  let columns = [];
  let w, h, colCount;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = document.documentElement.scrollHeight;
    const gap = 80;
    colCount = Math.floor(w / gap);
    columns = Array.from({ length: colCount }, (_, i) => ({
      x: i * gap + gap / 2 + (Math.random() - 0.5) * 20,
      y: Math.random() * h,
      speed: 0.15 + Math.random() * 0.25,
      text: fragments[Math.floor(Math.random() * fragments.length)],
      alpha: 0.15 + Math.random() * 0.007,
      size: 28 + Math.floor(Math.random() * 3),
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    columns.forEach((col) => {
      ctx.font = `${col.size}px monospace`;
      ctx.fillStyle = `rgba(34, 197, 94, ${col.alpha})`;
      ctx.fillText(col.text, col.x, col.y);
      col.y += col.speed;
      if (col.y > h + 20) {
        col.y = -20;
        col.text = fragments[Math.floor(Math.random() * fragments.length)];
      }
    });
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
})();

// --- Fade-in sections on scroll ---
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll('.section').forEach((section) => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(30px)';
  section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(section);
});

const style = document.createElement('style');
style.textContent = `.section.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(style);
