// Болотные огоньки и пыльца таволги
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  let W, H, raf, last = 0;
  const mouse = { x: -9999, y: -9999 };

  // свечение рисуется один раз и переиспользуется — так анимация легче для телефона
  function glow(rgb) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, `rgba(${rgb},1)`);
    grad.addColorStop(0.12, `rgba(${rgb},.55)`);
    grad.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return c;
  }
  const wisp = glow('168,230,196');
  const bloom = glow('236,230,211');

  const rnd = (a, b) => a + Math.random() * (b - a);
  let lights = [];

  function seed() {
    const small = W < 700;
    const make = (n, f) => Array.from({ length: n }, f);
    lights = [
      ...make(small ? 12 : 24, () => ({ img: wisp, x: rnd(0, W), y: rnd(H * .25, H), s: rnd(14, 44),
        vx: rnd(-.12, .12), vy: rnd(-.14, .04), a: rnd(.35, .85), p: rnd(0, 6.3), f: rnd(.008, .022), lure: true })),
      ...make(small ? 45 : 90, () => ({ img: bloom, x: rnd(0, W), y: rnd(0, H), s: rnd(3, 9),
        vx: rnd(-.08, .14), vy: rnd(.03, .2), a: rnd(.2, .7), p: rnd(0, 6.3), f: rnd(.004, .016) }))
    ];
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const widthChanged = window.innerWidth !== W;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // на телефоне высота прыгает при прокрутке — огоньки не пересоздаём
    if (widthChanged) seed();
    if (still.matches) frame(0);
  }

  function frame(now) {
    const k = last ? Math.min((now - last) / 16.7, 3) : 1;
    last = now;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    lights.forEach(l => {
      // огоньки тянутся к курсору, как к фонарю
      if (l.lure) {
        const dx = mouse.x - l.x, dy = mouse.y - l.y, d = Math.hypot(dx, dy);
        if (d < 260 && d > 40) { l.x += dx / d * .35 * k; l.y += dy / d * .35 * k; }
      }
      l.p += l.f * k;
      l.x += (l.vx + Math.sin(l.p * .7) * .12) * k;
      l.y += l.vy * k;
      if (l.x < -40) l.x = W + 40; else if (l.x > W + 40) l.x = -40;
      if (l.y < -40) l.y = H + 40; else if (l.y > H + 40) l.y = -40;
      ctx.globalAlpha = l.a * (.55 + .45 * Math.sin(l.p));
      ctx.drawImage(l.img, l.x - l.s / 2, l.y - l.s / 2, l.s, l.s);
    });
    if (!still.matches) raf = requestAnimationFrame(frame);
  }

  function start() { cancelAnimationFrame(raf); last = 0; raf = requestAnimationFrame(frame); }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('pointerup', e => { if (e.pointerType === 'touch') mouse.x = mouse.y = -9999; });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf); else start();
  });
  still.addEventListener('change', start);
  resize();
  start();
})();

  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revealObs.observe(el));

  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  function closeMenu() {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

// ============================================
// КАРУСЕЛЬ (горизонтальный слайдер)
// ============================================
function initCarousel() {
  const carousels = document.querySelectorAll('.carousel');
  carousels.forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const slides = track.querySelectorAll('.slide');
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    const dots = carousel.querySelectorAll('.dot');
    let currentIndex = 0;
    let interval;
    const slideCount = slides.length;

    function goTo(index) {
      if (index < 0) index = slideCount - 1;
      if (index >= slideCount) index = 0;
      currentIndex = index;
      const offset = -index * 100;
      track.style.transform = `translateX(${offset}%)`;
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    function next() {
      goTo(currentIndex + 1);
    }

    function prev() {
      goTo(currentIndex - 1);
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { clearInterval(interval); next(); startAuto(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { clearInterval(interval); prev(); startAuto(); });

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        clearInterval(interval);
        goTo(idx);
        startAuto();
      });
    });

    function startAuto() {
      clearInterval(interval);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      interval = setInterval(next, 5000);
    }

    carousel.addEventListener('mouseenter', () => clearInterval(interval));
    carousel.addEventListener('mouseleave', startAuto);

    goTo(0);
    startAuto();
  });
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', initCarousel);
