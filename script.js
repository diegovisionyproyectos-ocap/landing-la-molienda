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

/* ---- Smooth set minimum date on date input ---- */
const fechaInput = document.getElementById('fecha');
if (fechaInput) {
  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth() + 1).padStart(2, '0');
  const dd    = String(today.getDate()).padStart(2, '0');
  fechaInput.min = `${yyyy}-${mm}-${dd}`;
}

/* ---- Form submission → WhatsApp + Meta Pixel Lead ---- */
const form       = document.getElementById('reservarForm');
const submitBtn  = document.getElementById('submitBtn');
const WA_NUMBER  = '50300000000'; // ← Reemplaza con el número real (sin + ni espacios)

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
    const nombre      = document.getElementById('nombre').value.trim();
    const telefono    = document.getElementById('telefono').value.trim();
    const fecha       = document.getElementById('fecha').value;
    const personas    = document.getElementById('personas').value;
    const experiencia = document.getElementById('experiencia').value;
    const mensaje     = document.getElementById('mensaje').value.trim();

    const expLabel = experiencia || 'Todas las experiencias';
    const msgParts = [
      `🌿 *Solicitud de Reserva - La Molienda*`,
      ``,
      `👤 *Nombre:* ${nombre}`,
      `📱 *Teléfono:* ${telefono}`,
      `📅 *Fecha:* ${fecha}`,
      `👥 *Personas:* ${personas}`,
      `🎯 *Experiencia:* ${expLabel}`,
    ];
    if (mensaje) msgParts.push(`💬 *Mensaje:* ${mensaje}`);

    const waText = encodeURIComponent(msgParts.join('\n'));
    const waUrl  = `https://wa.me/${WA_NUMBER}?text=${waText}`;

    // Fire Meta Pixel Lead event
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', {
        content_name: expLabel,
        content_category: 'Reservacion',
        value: 0,
        currency: 'USD',
      });
    }

    // Open WhatsApp
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // Visual feedback
    submitBtn.textContent = '✓ Redirigiendo a WhatsApp…';
    submitBtn.style.background = '#25D366';
    setTimeout(() => {
      submitBtn.textContent = 'Enviar solicitud de reserva';
      submitBtn.style.background = '';
      form.reset();
    }, 3500);
  });
}

/* ---- Meta Pixel: ViewContent on section visibility ---- */
const pixelSectionMap = {
  'experiencias': 'Experiencias',
  'nosotros':     'Nosotros',
  'galeria':      'Galeria',
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
