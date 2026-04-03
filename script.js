/* ============================================================
   LA MOLIENDA — RESTAURANTE & TOURS
   Main Script: UI interactions + Meta Pixel events
   ============================================================ */

/* ---- Navbar scroll behavior ---- */
const navbar = document.getElementById('navbar');
const SCROLL_THRESHOLD = 60;

function handleNavScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
}
window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();

/* ---- Mobile nav toggle ---- */
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

// Close menu when a link is clicked
navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  });
});

// Close menu on outside click
document.addEventListener('click', e => {
  if (!navbar.contains(e.target)) {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  }
});

/* ---- Hero Ken Burns & loaded class ---- */
const hero = document.querySelector('.hero');
if (hero) {
  // Trigger subtle zoom-out on load
  window.addEventListener('load', () => hero.classList.add('loaded'));
}

/* ---- Reveal on scroll (Intersection Observer) ---- */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = parseInt(entry.target.dataset.delay || 0);
    setTimeout(() => {
      entry.target.classList.add('visible');
    }, delay);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ---- Active nav link on scroll ---- */
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks  = document.querySelectorAll('.nav-link[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ---- No date min needed — using select for tour dates ---- */

/* ---- Form submission → WhatsApp + Meta Pixel Lead ---- */
const form       = document.getElementById('reservarForm');
const submitBtn  = document.getElementById('submitBtn');
const WA_NUMBER  = '50378865638'; // ← Reemplaza con el número real (sin + ni espacios)

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;

    required.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#e53e3e';
        valid = false;
        field.addEventListener('input', () => {
          field.style.borderColor = '';
        }, { once: true });
      }
    });

    if (!valid) {
      submitBtn.textContent = 'Completa los campos requeridos';
      setTimeout(() => { submitBtn.textContent = 'Enviar solicitud de reserva'; }, 2500);
      return;
    }

    // Gather form data
    const nombre   = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const fecha    = document.getElementById('fecha').value;
    const personas = document.getElementById('personas').value;
    const ciudad   = document.getElementById('ciudad').value;
    const mensaje  = document.getElementById('mensaje') ? document.getElementById('mensaje').value.trim() : '';

    const fechaLabels = { '11-abril': '11 de Abril', '18-abril': '18 de Abril', '25-abril': '25 de Abril' };
    const ciudadLabels = { 'la-libertad': 'La Libertad', 'san-salvador': 'San Salvador', 'santa-ana': 'Santa Ana', 'san-miguel': 'San Miguel' };

    const msgParts = [
      `🌿 *Reserva Tour La Molienda — Abril 2026*`,
      ``,
      `👤 *Nombre:* ${nombre}`,
      `📱 *WhatsApp:* ${telefono}`,
      `📅 *Fecha elegida:* ${fechaLabels[fecha] || fecha}`,
      `👥 *Personas:* ${personas}`,
      `🚌 *Ciudad de salida:* ${ciudadLabels[ciudad] || ciudad}`,
      `💰 *Total:* $24.99 por persona`,
    ];
    if (mensaje) msgParts.push(`💬 *Nota:* ${mensaje}`);

    const waText = encodeURIComponent(msgParts.join('\n'));
    const waUrl  = `https://wa.me/${WA_NUMBER}?text=${waText}`;

    // Fire Meta Pixel Lead event
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', {
        content_name: `Tour La Molienda — ${fechaLabels[fecha] || fecha}`,
        content_category: 'Tour',
        value: 24.99,
        currency: 'USD',
      });
    }

    // Open WhatsApp
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Visual feedback
    submitBtn.textContent = '✓ Redirigiendo a WhatsApp…';
    submitBtn.style.background = '#25D366';
    setTimeout(() => {
      submitBtn.textContent = 'Reservar mi lugar — $24.99 →';
      submitBtn.style.background = '';
      form.reset();
    }, 3500);
  });
}

/* ---- Meta Pixel: ViewContent on section visibility ---- */
const pixelSectionMap = {
  'incluye':      'Que Incluye',
  'fechas':       'Fechas',
  'galeria':      'Galeria',
  'testimonios':  'Testimonios',
  'reservar':     'Reservar',
};

const pixelObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const sectionName = pixelSectionMap[entry.target.id];
    if (sectionName && typeof fbq === 'function') {
      fbq('track', 'ViewContent', { content_name: sectionName });
    }
    pixelObserver.unobserve(entry.target);
  });
}, { threshold: 0.4 });

Object.keys(pixelSectionMap).forEach(id => {
  const el = document.getElementById(id);
  if (el) pixelObserver.observe(el);
});

/* ---- Meta Pixel: CTAs click events ---- */
const heroReservarBtn = document.getElementById('heroReservar');
if (heroReservarBtn) {
  heroReservarBtn.addEventListener('click', () => {
    if (typeof fbq === 'function') {
      fbq('track', 'InitiateCheckout', { content_name: 'Hero CTA - Reservar' });
    }
  });
}

const whatsappBtn = document.getElementById('whatsappBtn');
if (whatsappBtn) {
  whatsappBtn.addEventListener('click', () => {
    if (typeof fbq === 'function') {
      fbq('track', 'Contact', { content_name: 'WhatsApp Button - Info Card' });
    }
  });
}

const waFloat = document.getElementById('waFloat');
if (waFloat) {
  waFloat.addEventListener('click', () => {
    if (typeof fbq === 'function') {
      fbq('track', 'Contact', { content_name: 'WhatsApp Float Button' });
    }
  });
}

/* ---- Smooth scroll for anchor links ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'));
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
