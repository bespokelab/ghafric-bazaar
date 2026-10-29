(function () {
  var LANGS = { en: "ltr", ar: "rtl", am: "ltr", hi: "ltr", ur: "rtl", tl: "ltr" };
  var dict = window.GHAFRIC_DICT || { ar: {}, am: {}, hi: {}, ur: {}, tl: {} };
  var params = new URLSearchParams(location.search);
  var fromUrl = params.get("lang");
  var stored = "";
  try { stored = localStorage.getItem("ghafric-lang") || ""; } catch (error) {}
  var lang = LANGS[fromUrl] ? fromUrl : (LANGS[stored] ? stored : "en");

  function t(en) {
    if (!en || lang === "en") return en;
    var table = dict[lang];
    return (table && table[en]) || en;
  }

  function fill(en, vars) {
    var text = t(en);
    if (!vars) return text;
    Object.keys(vars).forEach(function (key) {
      text = text.split("{" + key + "}").join(String(vars[key]));
    });
    return text;
  }

  function orderName(en) {
    var local = t(en);
    if (!local || local === en) return en;
    return local + " (" + en + ")";
  }

  function skip(el) {
    if (el.closest("[data-i18n-html], .lang, .i18n-skip")) return true;
    if (el.classList.contains("stepper__value") || el.classList.contains("cart-line__meta") || el.classList.contains("pay-link") || el.classList.contains("cart-link__count")) return true;
    var id = el.id;
    return id === "qty" || id === "qty-copy" || id === "qty-word" || id === "product-total" || id === "grand-total" || id === "cart-products" || id === "cart-delivery" || id === "cart-total" || id === "cart-count" || id === "checkout-status" || id === "pay-link-url" || id === "cart-live";
  }

  function apply() {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGS[lang] || "ltr";

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      if (!el.dataset.htmlEn) el.dataset.htmlEn = el.innerHTML;
      var key = "html:" + el.getAttribute("data-i18n-html");
      el.innerHTML = lang === "en" ? el.dataset.htmlEn : ((dict[lang] && dict[lang][key]) || el.dataset.htmlEn);
    });

    document.querySelectorAll("h1, h2, h3, p, a, button, li, span, label, strong, em").forEach(function (el) {
      if (skip(el) || el.childElementCount > 0) return;
      var current = el.textContent.replace(/\s+/g, " ").trim();
      if (!current) return;
      if (!el.dataset.en) el.dataset.en = current;
      var next = t(el.dataset.en);
      if (el.textContent !== next) el.textContent = next;
    });

    document.querySelectorAll("img[alt]").forEach(function (img) {
      if (!img.getAttribute("alt")) return;
      if (!img.dataset.altEn) img.dataset.altEn = img.alt;
      img.alt = t(img.dataset.altEn);
    });

    document.querySelectorAll("[aria-label]").forEach(function (el) {
      if (el.closest(".lang") || el.hasAttribute("data-aria-lock")) return;
      if (!el.dataset.ariaEn) el.dataset.ariaEn = el.getAttribute("aria-label");
      el.setAttribute("aria-label", t(el.dataset.ariaEn));
    });

    var orderEn = "Hello Ghafric Bazzar UAE! I would like to place an order.\n\nItems:\n\nDelivery address:\n";
    document.querySelectorAll("[data-wa]").forEach(function (link) {
      var key = link.getAttribute("data-wa");
      var message = lang === "en" && key === "wa.order" ? orderEn : t(key);
      link.href = "https://wa.me/971521083274?text=" + encodeURIComponent(message);
    });

    var title = document.querySelector("title");
    if (title) {
      if (!title.dataset.en) title.dataset.en = title.textContent.trim();
      title.textContent = t(title.dataset.en);
    }
    var categoryTitle = document.getElementById("category-title");
    if (categoryTitle && categoryTitle.dataset.en) {
      document.title = t(categoryTitle.dataset.en) + " | Ghafric Bazzar UAE";
    }

    document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"]').forEach(function (meta) {
      if (!meta.dataset.en) meta.dataset.en = meta.getAttribute("content") || "";
      meta.setAttribute("content", t(meta.dataset.en));
    });

    var select = document.getElementById("lang-select");
    if (select) {
      select.value = lang;
      select.setAttribute("aria-label", t("Language"));
    }

    try { localStorage.setItem("ghafric-lang", lang); } catch (error) {}
    var nextParams = new URLSearchParams(location.search);
    if (lang === "en") nextParams.delete("lang");
    else nextParams.set("lang", lang);
    var query = nextParams.toString();
    history.replaceState(null, "", location.pathname + (query ? "?" + query : "") + location.hash);

    document.dispatchEvent(new CustomEvent("ghafric:lang", { detail: lang }));
  }

  document.addEventListener("change", function (event) {
    if (!event.target || event.target.id !== "lang-select") return;
    var next = event.target.value;
    if (!LANGS[next]) return;
    lang = next;
    apply();
  });

  window.GhafricI18n = { t: t, fill: fill, orderName: orderName, apply: apply };
  apply();
})();
