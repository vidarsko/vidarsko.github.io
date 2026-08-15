(function () {
  var toggle = document.querySelector('.nav-toggle');
  var inner = document.querySelector('.nav-inner');
  if (!toggle || !inner) return;

  toggle.addEventListener('click', function () {
    var isOpen = inner.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  inner.addEventListener('click', function (event) {
    if (inner.classList.contains('menu-open') && event.target.closest('.primary-nav a')) {
      inner.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();
