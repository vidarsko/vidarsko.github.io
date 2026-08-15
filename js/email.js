(function () {
  var links = document.querySelectorAll('[data-email-user]');
  for (var i = 0; i < links.length; i++) {
    var el = links[i];
    var address = el.getAttribute('data-email-user') + '@' + el.getAttribute('data-email-domain');
    el.href = 'mailto:' + address;
    el.textContent = address;
  }
})();
