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
    return id === "qty" || id === "qty-copy" || id === "qty-word" || id === "product-total" || id === "grand-total" || id === "door-total" || id === "cart-products" || id === "cart-delivery" || id === "cart-total" || id === "cart-door" || id === "cart-count" || id === "checkout-status" || id === "pay-link-url" || id === "cart-live" || id === "order-code-value";
  }

  function moneyHtml(text) {
    return text.replace(/(\+\s*)?\d[\d,]*\s*AED/g, function (match) {
      return '<bdi dir="ltr">' + match + '</bdi>';
    });
  }

  function apply() {
    document.documentElement.lang = lang;
    document.documentElement.dir = LANGS[lang] || "ltr";
    var rtl = document.documentElement.dir === "rtl";

    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      if (!el.dataset.htmlEn) el.dataset.htmlEn = el.innerHTML;
      var key = "html:" + el.getAttribute("data-i18n-html");
      var html = lang === "en" ? el.dataset.htmlEn : ((dict[lang] && dict[lang][key]) || el.dataset.htmlEn);
      el.innerHTML = rtl ? moneyHtml(html) : html;
    });

    document.querySelectorAll("h1, h2, h3, p, a, button, li, span, label, strong, em, option").forEach(function (el) {
      if (el.dataset.money) {
        el.textContent = el.dataset.en || "";
        delete el.dataset.money;
      }
      if (skip(el) || el.childElementCount > 0) return;
      var current = el.textContent.replace(/\s+/g, " ").trim();
      if (!current && !el.dataset.en) return;
      if (!el.dataset.en) el.dataset.en = current;
      var next = t(el.dataset.en);
      if (rtl && /\d[\d,]*\s*AED/.test(next)) {
        el.innerHTML = moneyHtml(next.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
        el.dataset.money = "1";
      } else if (el.textContent !== next) {
        el.textContent = next;
      }
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

    var orderEn = "Hello Ghafric Bazaar UAE!";
    document.querySelectorAll("[data-wa]").forEach(function (link) {
      var key = link.getAttribute("data-wa");
      var message = lang === "en" && key === "wa.order" ? orderEn : t(key);
      link.href = "https://wa.me/971588028752?text=" + encodeURIComponent(message);
    });

    var title = document.querySelector("title");
    if (title) {
      if (!title.dataset.en) title.dataset.en = title.textContent.trim();
      title.textContent = t(title.dataset.en);
    }
    var ogLocales = { en: "en_AE", ar: "ar_AE", am: "am_ET", hi: "hi_IN", ur: "ur_PK", tl: "fil_PH" };
    var ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute("content", ogLocales[lang] || "en_AE");

    document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"]').forEach(function (meta) {
      if (!meta.dataset.en) meta.dataset.en = meta.getAttribute("content") || "";
      meta.setAttribute("content", t(meta.dataset.en));
    });

    var categoryTitle = document.getElementById("category-title");
    if (categoryTitle && categoryTitle.dataset.en) {
      var categoryName = t(categoryTitle.dataset.en);
      var categoryHeading = categoryName + " | Ghafric Bazaar UAE";
      document.title = categoryHeading;
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", categoryHeading);
      if (categoryTitle.dataset.en !== "Full Collection") {
        var categoryDesc = fill("{name}. Every piece is 30 AED. Delivery is 25 AED and takes 1 to 3 business days. Cash on delivery adds 10 AED.", { name: categoryName });
        document.querySelectorAll('meta[name="description"], meta[property="og:description"]').forEach(function (meta) {
          meta.setAttribute("content", categoryDesc);
        });
      }
    }

    document.querySelectorAll("[placeholder]").forEach(function (el) {
      if (el.closest(".lang") || el.closest(".i18n-skip")) return;
      if (!el.dataset.placeholderEn) el.dataset.placeholderEn = el.getAttribute("placeholder") || "";
      if (el.dataset.placeholderEn) el.placeholder = t(el.dataset.placeholderEn);
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
