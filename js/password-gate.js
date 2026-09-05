// Lightweight friction for unlisted draft pages. Not real security — the
// password lives in this file — just enough to stop casual/accidental visits.
(function () {
  var PASSWORD = 'knut';
  var STORAGE_KEY = 'password-gate-unlocked';

  if (document.documentElement.classList.contains('gate-unlocked')) return;

  var style = document.createElement('style');
  style.textContent =
    '.password-gate-overlay{visibility:visible;position:fixed;inset:0;z-index:1000;' +
    'display:flex;align-items:center;justify-content:center;padding:1.5rem;' +
    'background:var(--bg,#FAF7F2);}' +
    '.password-gate-box{max-width:360px;width:100%;background:var(--surface,#fff);' +
    'border:1px solid var(--border,rgba(0,0,0,.1));border-radius:var(--radius,18px);' +
    'padding:2rem;text-align:center;font-family:"Inter",-apple-system,BlinkMacSystemFont,sans-serif;' +
    'color:var(--text,#1A1714);}' +
    '.password-gate-box h1{font-size:1.2rem;margin-bottom:.5rem;}' +
    '.password-gate-box p{color:var(--text-muted,#6B6355);font-size:.9rem;margin-bottom:1.25rem;}' +
    '.password-gate-box input{width:100%;padding:.6rem .8rem;border:1px solid var(--border-strong,rgba(0,0,0,.18));' +
    'border-radius:var(--radius-sm,10px);font-size:1rem;margin-bottom:.75rem;background:var(--bg,#FAF7F2);color:var(--text,#1A1714);}' +
    '.password-gate-box button{width:100%;padding:.6rem .8rem;border:none;border-radius:var(--radius-sm,10px);' +
    'background:var(--accent,#C1710B);color:#14100A;font-weight:600;font-size:1rem;cursor:pointer;}' +
    '.password-gate-error{color:var(--danger,#DC2626);font-size:.85rem;margin-top:.75rem;margin-bottom:0;}';
  document.head.appendChild(style);

  var overlay = document.createElement('div');
  overlay.className = 'password-gate-overlay';
  overlay.innerHTML =
    '<form class="password-gate-box">' +
    '<h1>Passordbeskyttet side</h1>' +
    '<p>Dette er et internt arbeidsnotat. Skriv inn passord for å fortsette.</p>' +
    '<input type="password" name="pw" autocomplete="off" autofocus>' +
    '<button type="submit">Fortsett</button>' +
    '<p class="password-gate-error" hidden>Feil passord.</p>' +
    '</form>';
  document.body.appendChild(overlay);

  var input = overlay.querySelector('input');
  var error = overlay.querySelector('.password-gate-error');

  overlay.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (input.value === PASSWORD) {
      try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
      document.documentElement.classList.add('gate-unlocked');
      overlay.remove();
    } else {
      error.hidden = false;
      input.value = '';
      input.focus();
    }
  });
})();
