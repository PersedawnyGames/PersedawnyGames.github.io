async function openPost(slug) {
  const overlay = document.getElementById('modal-overlay');
  const content = document.getElementById('modal-content');
  const modal = document.getElementById('modal');

  content.innerHTML = '<div style="opacity:0.4;padding:2rem 0;">Loading...</div>';
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  modal.scrollTop = 0;

  try {
    const res = await fetch(`essays/${slug}.html`);
    if (!res.ok) throw new Error('Essay not found');
    content.innerHTML = await res.text();
  } catch {
    content.innerHTML = '<p style="opacity:0.4;">Could not load essay.</p>';
  }
}

function closePost() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function closePostOutside(e) {
  if (e.target === document.getElementById('modal-overlay')) closePost();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closePost(); });

const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
