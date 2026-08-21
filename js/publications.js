/* Renders publication cards from window.PUBLICATIONS (see /publications/data.js).
   Two declarative entry points, scanned automatically on load:
     <div data-pub-list></div>              full list, grouped first-author / other
     <div data-pub-boxes="id1, id2"></div>   specific publications, in the given order
   Re-renders on the 'langchange' event dispatched by /js/i18n.js. */

(function () {
  var STR = {
    en: {
      summaryTab: "Summary",
      abstractTab: "Technical abstract",
      summaryPlaceholder: "Summary coming soon.",
      firstAuthorHeading: "First author",
      otherHeading: "Other publications"
    },
    no: {
      summaryTab: "Sammendrag",
      abstractTab: "Teknisk sammendrag",
      summaryPlaceholder: "Sammendrag kommer.",
      firstAuthorHeading: "Førsteforfatter",
      otherHeading: "Andre publikasjoner"
    },
    sv: {
      summaryTab: "Sammanfattning",
      abstractTab: "Teknisk sammanfattning",
      summaryPlaceholder: "Sammanfattning kommer.",
      firstAuthorHeading: "Förstaförfattare",
      otherHeading: "Övriga publikationer"
    }
  };

  function getLang() {
    var SUPPORTED = ["en", "no", "sv"];
    try {
      var stored = localStorage.getItem("lang");
      if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    } catch (e) {}
    var browserLangs = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < browserLangs.length; i++) {
      var code = (browserLangs[i] || "").toLowerCase();
      if (code.indexOf("sv") === 0) return "sv";
      if (code.indexOf("no") === 0 || code.indexOf("nb") === 0 || code.indexOf("nn") === 0) return "no";
      if (code.indexOf("en") === 0) return "en";
    }
    return "en";
  }

  function byId(id) {
    var all = window.PUBLICATIONS || [];
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) return all[i];
    }
    return null;
  }

  function sortByYearDesc(list) {
    return list.slice().sort(function (a, b) { return (b.year || 0) - (a.year || 0); });
  }

  function createCard(pub, lang) {
    var s = STR[lang] || STR.en;

    var card = document.createElement("article");
    card.className = "pub-card";

    var media = document.createElement("div");
    media.className = "pub-card-media";
    var images = pub.images && pub.images.length ? pub.images : [null];
    images.forEach(function (src) {
      var thumb = document.createElement("div");
      thumb.className = "pub-card-thumb";
      if (src) {
        var img = document.createElement("img");
        img.src = src;
        img.alt = pub.title;
        img.loading = "lazy";
        thumb.appendChild(img);
      } else {
        thumb.classList.add("pub-card-thumb-placeholder");
        thumb.innerHTML = "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M14 3v5a1 1 0 0 0 1 1h5\"/><path d=\"M6 3h8l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z\"/><path d=\"M9 14l1.8 2.2L13 13l3 4H8l1-3Z\"/></svg>";
      }
      media.appendChild(thumb);
    });
    card.appendChild(media);

    var content = document.createElement("div");
    content.className = "pub-card-content";
    card.appendChild(content);

    var title = document.createElement("h3");
    title.className = "pub-card-title";
    title.textContent = pub.title;
    content.appendChild(title);

    var meta = document.createElement("p");
    meta.className = "pub-card-meta";
    meta.innerHTML = pub.authors + " (" + pub.year + "). " + pub.venueHtml + ".";
    content.appendChild(meta);

    var hasSummary = !!(pub.summary && pub.summary[lang]);
    var hasAbstract = !!pub.abstract;

    if (hasSummary || hasAbstract) {
      var toggle = document.createElement("div");
      toggle.className = "pub-toggle";
      toggle.setAttribute("role", "tablist");

      var btnSummary = document.createElement("button");
      btnSummary.type = "button";
      btnSummary.className = "pub-toggle-btn active";
      btnSummary.textContent = s.summaryTab;
      btnSummary.setAttribute("data-view", "summary");
      btnSummary.setAttribute("role", "tab");
      btnSummary.setAttribute("aria-selected", "true");

      var btnAbstract = document.createElement("button");
      btnAbstract.type = "button";
      btnAbstract.className = "pub-toggle-btn";
      btnAbstract.textContent = s.abstractTab;
      btnAbstract.setAttribute("data-view", "abstract");
      btnAbstract.setAttribute("role", "tab");
      btnAbstract.setAttribute("aria-selected", "false");

      toggle.appendChild(btnSummary);
      toggle.appendChild(btnAbstract);
      content.appendChild(toggle);

      var body = document.createElement("div");
      body.className = "pub-card-body";

      var summaryText = document.createElement("p");
      summaryText.className = "pub-card-text";
      summaryText.setAttribute("data-view", "summary");
      if (hasSummary) {
        summaryText.textContent = pub.summary[lang];
      } else {
        summaryText.textContent = s.summaryPlaceholder;
        summaryText.classList.add("pub-card-placeholder");
      }

      var abstractText = document.createElement("p");
      abstractText.className = "pub-card-text";
      abstractText.setAttribute("data-view", "abstract");
      abstractText.hidden = true;
      abstractText.textContent = pub.abstract || "";

      body.appendChild(summaryText);
      body.appendChild(abstractText);
      content.appendChild(body);

      toggle.addEventListener("click", function (event) {
        var btn = event.target.closest(".pub-toggle-btn");
        if (!btn) return;
        var view = btn.getAttribute("data-view");
        var buttons = toggle.querySelectorAll(".pub-toggle-btn");
        for (var i = 0; i < buttons.length; i++) {
          var isActive = buttons[i] === btn;
          buttons[i].classList.toggle("active", isActive);
          buttons[i].setAttribute("aria-selected", isActive ? "true" : "false");
        }
        var texts = body.querySelectorAll(".pub-card-text");
        for (var j = 0; j < texts.length; j++) {
          texts[j].hidden = texts[j].getAttribute("data-view") !== view;
        }
      });
    }

    var links = [];
    if (pub.link) links.push({ href: pub.link, label: pub.linkLabel || pub.link });
    if (pub.extraLinks) links = links.concat(pub.extraLinks);

    if (links.length) {
      var linksRow = document.createElement("div");
      linksRow.className = "content-links pub-card-links";
      links.forEach(function (l) {
        var a = document.createElement("a");
        a.href = l.href;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = l.label;
        linksRow.appendChild(a);
      });
      content.appendChild(linksRow);
    }

    return card;
  }

  function renderGrid(container, list, lang) {
    var grid = document.createElement("div");
    grid.className = "pub-list-grid";
    list.forEach(function (p) { grid.appendChild(createCard(p, lang)); });
    container.appendChild(grid);
  }

  function renderList(container, lang) {
    var s = STR[lang] || STR.en;
    container.innerHTML = "";
    var all = window.PUBLICATIONS || [];
    var first = sortByYearDesc(all.filter(function (p) { return p.firstAuthor; }));
    var other = sortByYearDesc(all.filter(function (p) { return !p.firstAuthor; }));

    var h1 = document.createElement("h2");
    h1.className = "pub-section-heading";
    h1.textContent = s.firstAuthorHeading;
    container.appendChild(h1);
    renderGrid(container, first, lang);

    if (other.length) {
      var h2 = document.createElement("h2");
      h2.className = "pub-section-heading";
      h2.textContent = s.otherHeading;
      container.appendChild(h2);
      renderGrid(container, other, lang);
    }
  }

  function renderBoxes(container, ids, lang) {
    container.innerHTML = "";
    var list = ids.map(byId).filter(Boolean);
    renderGrid(container, list, lang);
  }

  function renderAll() {
    var lang = getLang();

    var listEls = document.querySelectorAll("[data-pub-list]");
    for (var i = 0; i < listEls.length; i++) renderList(listEls[i], lang);

    var boxEls = document.querySelectorAll("[data-pub-boxes]");
    for (var j = 0; j < boxEls.length; j++) {
      var ids = boxEls[j].getAttribute("data-pub-boxes").split(",")
        .map(function (id) { return id.trim(); })
        .filter(Boolean);
      renderBoxes(boxEls[j], ids, lang);
    }
  }

  renderAll();
  document.addEventListener("langchange", renderAll);
})();
