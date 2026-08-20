  
  (function() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let W, H, raf;
    let mouse = { x: -9999, y: -9999 };

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    const STAR_COUNT = 200;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.7 + 0.1,
      twinkle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.008 + 0.002
    }));

    const FIREFLY_COUNT = 55;
    const fireflies = Array.from({ length: FIREFLY_COUNT }, () => ({
      x: Math.random() * 1,
      y: Math.random() * 1,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.00015,
      vy: (Math.random() - 0.5) * 0.00015 - 0.00005,
      a: Math.random() * 0.6 + 0.1,
      phase: Math.random() * Math.PI * 2,
      freq: Math.random() * 0.012 + 0.004,
      // Цвет: золотой или чуть фиолетовый
      hue: Math.random() > 0.85 ? 270 : (Math.random() > 0.5 ? 38 : 30),
      sat: Math.random() > 0.85 ? 40 : 65,
    }));

    const orbs = [
      { x: 0.15, y: 0.25, r: 320, hue: 30,  sat: 60, baseA: 0.035, phase: 0 },
      { x: 0.85, y: 0.70, r: 280, hue: 260, sat: 40, baseA: 0.025, phase: 1.5 },
      { x: 0.50, y: 0.10, r: 400, hue: 20,  sat: 50, baseA: 0.04,  phase: 3.1 },
      { x: 0.30, y: 0.85, r: 240, hue: 280, sat: 35, baseA: 0.02,  phase: 4.7 },
    ];

    let t = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);

      orbs.forEach(o => {
        const pulse = Math.sin(t * 0.003 + o.phase) * 0.4 + 0.6;
        const grad = ctx.createRadialGradient(o.x*W, o.y*H, 0, o.x*W, o.y*H, o.r * pulse);
        grad.addColorStop(0,   `hsla(${o.hue}, ${o.sat}%, 40%, ${o.baseA * pulse})`);
        grad.addColorStop(0.5, `hsla(${o.hue}, ${o.sat}%, 30%, ${o.baseA * pulse * 0.4})`);
        grad.addColorStop(1,   `hsla(${o.hue}, ${o.sat}%, 20%, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(o.x*W, o.y*H, o.r * pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      stars.forEach(s => {
        s.twinkle += s.speed;
        const alpha = s.a * (0.5 + 0.5 * Math.sin(s.twinkle));
        ctx.fillStyle = `rgba(245, 235, 210, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      fireflies.forEach(f => {
        const dx = mouse.x / W - f.x;
        const dy = mouse.y / H - f.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 0.3) {
          f.vx += dx * 0.0000008;
          f.vy += dy * 0.0000008;
        }

        f.x += f.vx;
        f.y += f.vy;

        if (f.x < 0 || f.x > 1) f.vx *= -1;
        if (f.y < 0 || f.y > 1) f.vy *= -1;
        f.x = Math.max(0, Math.min(1, f.x));
        f.y = Math.max(0, Math.min(1, f.y));

        f.phase += f.freq;
        const breathe = 0.5 + 0.5 * Math.sin(f.phase);
        const alpha = f.a * breathe;
        const radius = f.r * (0.7 + 0.3 * breathe);

        const glowGrad = ctx.createRadialGradient(f.x*W, f.y*H, 0, f.x*W, f.y*H, radius * 12);
        glowGrad.addColorStop(0,   `hsla(${f.hue}, ${f.sat}%, 65%, ${alpha * 0.5})`);
        glowGrad.addColorStop(1,   `hsla(${f.hue}, ${f.sat}%, 55%, 0)`);
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(f.x*W, f.y*H, radius * 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${f.hue}, ${f.sat}%, 80%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(f.x*W, f.y*H, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else draw();
    });
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
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });

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
