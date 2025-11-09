window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.profile')?.classList.add('is-visible');
});

document.addEventListener('click', e => {
  const a = e.target.closest('a');
  if (!a) return;
  const url = a.getAttribute('href');
  if (!url || url.startsWith('#') || a.target === '_blank') return;
  e.preventDefault();
  const profile = document.querySelector('.profile');
  profile.classList.remove('is-visible');
  setTimeout(() => (window.location = url), 400);
});
