(function () {
  var links = document.querySelectorAll(".categories a");
  var groups = document.querySelectorAll(".cat-group");
  if (!links.length || !groups.length) return;

  function hashId() {
    return (location.hash || "").replace(/^#/, "");
  }

  function isGroup(id) {
    var group = document.getElementById(id);
    return !!(group && group.classList.contains("cat-group"));
  }

  function show(id, scroll) {
    var selected = isGroup(id);
    groups.forEach(function (group) {
      group.hidden = selected ? group.id !== id : false;
    });

    links.forEach(function (link) {
      var href = link.getAttribute("href");
      var current = selected ? href === "#" + id : href === "#favorites";
      link.classList.toggle("is-current", current);
      if (current) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });

    if (!scroll) return;
    var target = document.getElementById(selected ? "category-list" : "favorites");
    if (!target) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function openFromHash(scroll) {
    var id = hashId();
    if (isGroup(id) || id === "favorites") show(id, scroll);
  }

  links.forEach(function (link) {
    link.addEventListener("click", function (event) {
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;
      event.preventDefault();
      var id = href.replace(/^#/, "");
      if (hashId() !== id) history.pushState(null, "", "#" + id);
      show(id, true);
    });
  });

  window.addEventListener("hashchange", function () {
    openFromHash(true);
  });
  window.addEventListener("popstate", function () {
    openFromHash(true);
  });

  function closeCategories() {
    groups.forEach(function (group) {
      group.hidden = true;
    });
    links.forEach(function (link) {
      link.classList.remove("is-current");
      link.removeAttribute("aria-current");
    });
  }

  var header = document.querySelector(".site-header");
  if (header) {
    header.addEventListener("click", function (event) {
      var link = event.target.closest("a");
      if (event.target.closest("button") || event.target.closest(".lang")) return;
      if (link && link.getAttribute("href") !== "#top") return;
      closeCategories();
    });
  }

  var opening = hashId();
  if (isGroup(opening)) show(opening, true);
  else closeCategories();
})();

(function () {
  function tr(en) {
    return window.GhafricI18n ? window.GhafricI18n.t(en) : en;
  }

  function fill(en, vars) {
    return window.GhafricI18n ? window.GhafricI18n.fill(en, vars) : en;
  }

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  if (toggle && nav) {
    var label = toggle.querySelector(".nav-toggle__label");

    function setMenuLabel(en) {
      if (!label) return;
      label.dataset.en = en;
      label.textContent = tr(en);
    }

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      setMenuLabel(open ? "Close" : "Menu");
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });
  }

  var header = document.querySelector(".site-header");
  if (header) {
    header.addEventListener("click", function (event) {
      var link = event.target.closest("a");
      if (event.target.closest("button") || event.target.closest(".lang")) return;
      if (link && link.getAttribute("href") !== "#top") return;
      if (link) event.preventDefault();
      if (nav) nav.classList.remove("is-open");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        if (label) {
          label.dataset.en = "Menu";
          label.textContent = tr("Menu");
        }
      }
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      if (location.hash) {
        history.pushState(null, "", location.pathname + location.search);
      }
    });
  }

  var toTop = document.querySelector(".to-top");
  if (toTop) {
    function syncToTop() {
      toTop.hidden = window.scrollY < 480;
    }

    syncToTop();
    window.addEventListener("scroll", syncToTop, { passive: true });
    toTop.addEventListener("click", function () {
      if (nav) nav.classList.remove("is-open");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        var menuLabel = toggle.querySelector(".nav-toggle__label");
        if (menuLabel) {
          menuLabel.dataset.en = "Menu";
          menuLabel.textContent = tr("Menu");
        }
      }
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      if (location.hash) {
        history.pushState(null, "", location.pathname + location.search);
      }
      var logo = document.querySelector(".logo");
      if (logo) logo.focus();
    });
  }

  var dec = document.getElementById("qty-dec");
  var inc = document.getElementById("qty-inc");
  var qtyEl = document.getElementById("qty");
  var qtyCopy = document.getElementById("qty-copy");
  var wordEl = document.getElementById("qty-word");
  var productEl = document.getElementById("product-total");
  var grandEl = document.getElementById("grand-total");
  var orderLink = document.getElementById("estimator-order");

  if (!dec || !inc || !qtyEl || !productEl || !grandEl || !orderLink) return;

  var piecePrice = 30;
  var deliveryFee = 25;
  var minQty = 1;
  var maxQty = 20;
  var qty = 2;

  function render() {
    var products = qty * piecePrice;
    var grand = products + deliveryFee;
    var wordEn = qty === 1 ? "piece" : "pieces";
    var word = tr(wordEn);

    qtyEl.textContent = String(qty);
    if (qtyCopy) qtyCopy.textContent = String(qty);
    if (wordEl) wordEl.textContent = word;
    productEl.textContent = products + " AED";
    grandEl.textContent = grand + " AED";
    dec.disabled = qty <= minQty;
    inc.disabled = qty >= maxQty;

    var text = fill(
      "Hello Ghafric Bazzar UAE! I would like to order {qty} {word} (30 AED each = {products} AED) plus 25 AED delivery. Estimated total: {grand} AED.\n\nItems:\n\nDelivery address:\n",
      { qty: qty, word: word, products: products, grand: grand }
    );

    orderLink.href = "https://wa.me/971521083274?text=" + encodeURIComponent(text);
  }

  dec.addEventListener("click", function () {
    if (qty > minQty) {
      qty -= 1;
      render();
    }
  });

  inc.addEventListener("click", function () {
    if (qty < maxQty) {
      qty += 1;
      render();
    }
  });

  render();
  document.addEventListener("ghafric:lang", render);
})();

(function () {
  function tr(en) {
    return window.GhafricI18n ? window.GhafricI18n.t(en) : en;
  }

  function fill(en, vars) {
    return window.GhafricI18n ? window.GhafricI18n.fill(en, vars) : en;
  }

  function orderName(en) {
    return window.GhafricI18n ? window.GhafricI18n.orderName(en) : en;
  }

  var piecePrice = 30;
  var deliveryFee = 25;
  var maxQty = 20;
  var cartKey = "ghafric-bazaar-cart";
  var detailsKey = "ghafric-bazaar-details";
  var linesEl = document.getElementById("cart-lines");
  var emptyEl = document.getElementById("cart-empty");
  var productsEl = document.getElementById("cart-products");
  var deliveryEl = document.getElementById("cart-delivery");
  var totalEl = document.getElementById("cart-total");
  var countEl = document.getElementById("cart-count");
  var cartLink = document.querySelector(".cart-link");
  var clearBtn = document.getElementById("cart-clear");
  var form = document.getElementById("checkout-form");
  var sendBtn = document.getElementById("checkout-send");
  var payLink = document.querySelector(".pay-link");
  var payUrl = document.getElementById("pay-link-url");
  var statusEl = document.getElementById("checkout-status");
  var live = document.getElementById("cart-live");

  var cart = [];

  try {
    var saved = JSON.parse(localStorage.getItem(cartKey) || "[]");
    if (Array.isArray(saved)) {
      saved.forEach(function (item) {
        if (!item || typeof item.name !== "string") return;
        var name = item.name.replace(/\s+/g, " ").trim();
        var qty = Math.floor(Number(item.qty));
        if (!name || qty < 1) return;
        cart.push({ name: name, qty: Math.min(maxQty, qty) });
      });
    }
  } catch (error) {
    cart = [];
  }

  function pieces() {
    return cart.reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
  }

  function saveCart() {
    try {
      localStorage.setItem(cartKey, JSON.stringify(cart));
    } catch (error) {}
  }

  function findItem(name) {
    for (var i = 0; i < cart.length; i += 1) {
      if (cart[i].name === name) return cart[i];
    }
    return null;
  }

  function render() {
    var count = pieces();
    var products = count * piecePrice;
    var total = count ? products + deliveryFee : 0;

    if (linesEl) linesEl.innerHTML = "";
    if (linesEl) cart.forEach(function (item, index) {
      var li = document.createElement("li");
      li.className = "cart-line";

      var copy = document.createElement("div");
      var nameEl = document.createElement("p");
      nameEl.className = "cart-line__name";
      nameEl.dataset.en = item.name;
      nameEl.textContent = tr(item.name);
      var meta = document.createElement("p");
      meta.className = "cart-line__meta";
      meta.textContent = item.qty + " × 30 AED = " + item.qty * piecePrice + " AED";
      copy.appendChild(nameEl);
      copy.appendChild(meta);

      var actions = document.createElement("div");
      actions.className = "cart-line__actions";
      var stepper = document.createElement("div");
      stepper.className = "stepper";
      stepper.setAttribute("role", "group");
      stepper.setAttribute("data-aria-lock", "");
      stepper.setAttribute("aria-label", fill("Quantity for {name}", { name: tr(item.name) }));

      var dec = document.createElement("button");
      dec.type = "button";
      dec.textContent = "−";
      dec.setAttribute("data-aria-lock", "");
      dec.setAttribute("aria-label", fill("Remove one {name}", { name: tr(item.name) }));
      dec.disabled = item.qty <= 1;
      dec.addEventListener("click", function () {
        change(index, -1);
      });

      var value = document.createElement("span");
      value.className = "stepper__value";
      value.textContent = String(item.qty);

      var inc = document.createElement("button");
      inc.type = "button";
      inc.textContent = "+";
      inc.setAttribute("data-aria-lock", "");
      inc.setAttribute("aria-label", fill("Add one {name}", { name: tr(item.name) }));
      inc.disabled = item.qty >= maxQty;
      inc.addEventListener("click", function () {
        change(index, 1);
      });

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "cart-line__remove";
      remove.dataset.en = "Remove";
      remove.textContent = tr("Remove");
      remove.setAttribute("data-aria-lock", "");
      remove.setAttribute("aria-label", fill("Remove {name}", { name: tr(item.name) }));
      remove.addEventListener("click", function () {
        cart.splice(index, 1);
        render();
        if (live) live.textContent = fill("{name} removed.", { name: tr(item.name) });
      });

      stepper.appendChild(dec);
      stepper.appendChild(value);
      stepper.appendChild(inc);
      actions.appendChild(stepper);
      actions.appendChild(remove);
      li.appendChild(copy);
      li.appendChild(actions);
      linesEl.appendChild(li);
    });

    if (emptyEl) emptyEl.hidden = count > 0;
    if (linesEl) linesEl.hidden = count === 0;
    if (clearBtn) clearBtn.hidden = count === 0;
    if (productsEl) productsEl.textContent = products + " AED";
    if (deliveryEl) deliveryEl.textContent = count ? deliveryFee + " AED" : "—";
    if (totalEl) totalEl.textContent = total + " AED";
    if (countEl) countEl.textContent = String(count);
    if (cartLink) {
      var pieceWord = tr(count === 1 ? "piece" : "pieces");
      cartLink.setAttribute("aria-label", fill("Checkout, {count} {word}", { count: count, word: pieceWord }));
    }
    if (sendBtn) sendBtn.disabled = count === 0;
    if (payLink) {
      var ziina = "https://pay.ziina.com/TheGhanaShop?source=app";
      if (count) ziina += "&amount=" + total;
      payLink.href = ziina;
      if (count) {
        payLink.textContent = fill("Pay {total} AED with Ziina", { total: total });
        payLink.classList.remove("is-disabled");
        payLink.removeAttribute("aria-disabled");
      } else {
        payLink.textContent = tr("Pay with Ziina");
        payLink.classList.add("is-disabled");
        payLink.setAttribute("aria-disabled", "true");
      }
      if (payUrl) {
        payUrl.hidden = count === 0;
        payUrl.textContent = count ? ziina : "";
      }
    }
    if (statusEl) {
      var state = statusEl.dataset.state || "empty";
      if (count === 0) state = "empty";
      else if (state !== "sent") state = "ready";
      statusEl.dataset.state = state;
      if (state === "sent") {
        statusEl.textContent = fill("WhatsApp should open with this order. Pay on Ziina, or pay {total} AED when it arrives. If it did not open, allow pop-ups and send again.", { total: total });
      } else if (state === "ready") {
        statusEl.textContent = tr("Pay the total when the order arrives. Delivery is 25 AED.");
      } else {
        statusEl.textContent = tr("Add at least one piece to send the order.");
      }
    }
    saveCart();
  }

  function change(index, delta) {
    var item = cart[index];
    if (!item) return;
    var next = item.qty + delta;
    if (next < 1 || next > maxQty) return;
    item.qty = next;
    render();
  }

  document.querySelectorAll(".add-to-cart").forEach(function (button) {
    button.addEventListener("click", function () {
      var card = button.closest("article");
      var heading = card ? card.querySelector("h3") : null;
      var name = heading ? (heading.dataset.en || heading.textContent.replace(/\s+/g, " ").trim()) : "";
      if (!name) return;

      var existing = findItem(name);
      if (existing) {
        if (existing.qty >= maxQty) {
          if (live) live.textContent = fill("{name} is already at 20, the most one order can include.", { name: tr(name) });
          return;
        }
        existing.qty += 1;
      } else {
        cart.push({ name: name, qty: 1 });
      }

      render();
      var added = findItem(name);
      button.textContent = tr("Added");
      window.setTimeout(function () {
        button.textContent = tr("Add to cart");
      }, 900);
      if (live && added) {
        var totalPieces = pieces();
        var pieceWord = tr(totalPieces === 1 ? "piece" : "pieces");
        live.textContent = fill("{name} added. {count} {word} in checkout.", { name: tr(name), count: totalPieces, word: pieceWord });
      }
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      cart = [];
      render();
      if (live) live.textContent = tr("Cart cleared.");
    });
  }

  if (form) {
  try {
    var details = JSON.parse(localStorage.getItem(detailsKey) || "{}");
    ["name", "phone", "address"].forEach(function (field) {
      if (details && typeof details[field] === "string" && form.elements[field]) {
        form.elements[field].value = details[field];
      }
    });
  } catch (error) {}

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var count = pieces();
    if (!count) return;

    var name = String(form.elements.name.value || "").trim();
    var phone = String(form.elements.phone.value || "").trim();
    var address = String(form.elements.address.value || "").trim();
    var note = String(form.elements.note.value || "").trim();
    if (!name || !phone || !address) return;

    var products = count * piecePrice;
    var total = products + deliveryFee;
    var itemLines = cart.map(function (item) {
      return "- " + orderName(item.name) + " x " + item.qty + " = " + item.qty * piecePrice + " AED";
    }).join("\n");

    var text =
      tr("Hello Ghafric Bazzar UAE! I would like to place this order.") + "\n\n" +
      tr("Items:") + "\n" +
      itemLines +
      "\n\n" + tr("Products:") + " " + products + " AED\n" +
      tr("Delivery:") + " 25 AED\n" +
      tr("Total to pay:") + " " + total + " AED\n" +
      tr("Pay on Ziina:") + " https://pay.ziina.com/TheGhanaShop?source=app&amount=" + total + "\n" +
      tr("Or pay this total when the order arrives.") + "\n\n" +
      tr("Name:") + " " + name + "\n" +
      tr("Phone:") + " " + phone + "\n" +
      tr("Delivery address:") + "\n" + address;

    if (note) text += "\n\n" + tr("Note:") + "\n" + note;

    try {
      localStorage.setItem(detailsKey, JSON.stringify({
        name: name,
        phone: phone,
        address: address
      }));
    } catch (error) {}

    var url = "https://wa.me/971521083274?text=" + encodeURIComponent(text);
    window.open(url, "_blank", "noopener,noreferrer");
    if (statusEl) {
      statusEl.dataset.state = "sent";
      statusEl.textContent = fill("WhatsApp should open with this order. Pay on Ziina, or pay {total} AED when it arrives. If it did not open, allow pop-ups and send again.", { total: total });
    }
  });
  }

  render();
  document.addEventListener("ghafric:lang", render);
})();
