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
      event.preventDefault();
      var id = link.getAttribute("href").replace(/^#/, "");
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
      if (event.target.closest("button")) return;
      if (link && link.getAttribute("href") !== "#top") return;
      closeCategories();
    });
  }

  var opening = hashId();
  if (isGroup(opening)) show(opening, true);
})();

(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  if (toggle && nav) {
    var label = toggle.querySelector(".nav-toggle__label");

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (label) label.textContent = open ? "Close" : "Menu";
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
      if (event.target.closest("button")) return;
      if (link && link.getAttribute("href") !== "#top") return;
      if (link) event.preventDefault();
      if (nav) nav.classList.remove("is-open");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        if (label) label.textContent = "Menu";
      }
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      if (location.hash) {
        history.pushState(null, "", location.pathname + location.search);
      }
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
    var word = qty === 1 ? "piece" : "pieces";

    qtyEl.textContent = String(qty);
    if (qtyCopy) qtyCopy.textContent = String(qty);
    if (wordEl) wordEl.textContent = word;
    productEl.textContent = products + " AED";
    grandEl.textContent = grand + " AED";
    dec.disabled = qty <= minQty;
    inc.disabled = qty >= maxQty;

    var text =
      "Hello Ghafric Bazaar UAE! I would like to order " +
      qty +
      " " +
      word +
      " (30 AED each = " +
      products +
      " AED) plus 25 AED delivery. Estimated total: " +
      grand +
      " AED.\n\nItems:\n\nDelivery address:\n";

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
})();

(function () {
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
      nameEl.textContent = item.name;
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
      stepper.setAttribute("aria-label", "Quantity for " + item.name);

      var dec = document.createElement("button");
      dec.type = "button";
      dec.textContent = "−";
      dec.setAttribute("aria-label", "Remove one " + item.name);
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
      inc.setAttribute("aria-label", "Add one " + item.name);
      inc.disabled = item.qty >= maxQty;
      inc.addEventListener("click", function () {
        change(index, 1);
      });

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "cart-line__remove";
      remove.textContent = "Remove";
      remove.setAttribute("aria-label", "Remove " + item.name);
      remove.addEventListener("click", function () {
        cart.splice(index, 1);
        render();
        if (live) live.textContent = item.name + " removed.";
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
      var pieceWord = count === 1 ? "piece" : "pieces";
      cartLink.setAttribute("aria-label", "Checkout, " + count + " " + pieceWord);
    }
    if (sendBtn) sendBtn.disabled = count === 0;
    if (statusEl) {
      if (count === 0) statusEl.textContent = "Add at least one piece to send the order.";
      else if (statusEl.textContent.indexOf("Add at least one") === 0) {
        statusEl.textContent = "Pay the total when the order arrives. Delivery is 25 AED.";
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
      var name = heading ? heading.textContent.replace(/\s+/g, " ").trim() : "";
      if (!name) return;

      var existing = findItem(name);
      if (existing) {
        if (existing.qty >= maxQty) {
          if (live) live.textContent = name + " is already at 20, the most one order can include.";
          return;
        }
        existing.qty += 1;
      } else {
        cart.push({ name: name, qty: 1 });
      }

      render();
      var added = findItem(name);
      button.textContent = "Added";
      window.setTimeout(function () {
        button.textContent = "Add to cart";
      }, 900);
      if (live && added) {
        var totalPieces = pieces();
        var pieceWord = totalPieces === 1 ? "piece" : "pieces";
        live.textContent = name + " added. " + totalPieces + " " + pieceWord + " in checkout.";
      }
    });
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      cart = [];
      render();
      if (live) live.textContent = "Cart cleared.";
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
      return "- " + item.name + " x " + item.qty + " = " + item.qty * piecePrice + " AED";
    }).join("\n");

    var text =
      "Hello Ghafric Bazaar UAE! I would like to place this order.\n\n" +
      "Items:\n" +
      itemLines +
      "\n\nProducts: " + products + " AED\n" +
      "Delivery: 25 AED\n" +
      "Total to pay on delivery: " + total + " AED\n\n" +
      "Name: " + name + "\n" +
      "Phone: " + phone + "\n" +
      "Delivery address:\n" + address;

    if (note) text += "\n\nNote:\n" + note;

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
      statusEl.textContent = "WhatsApp should open with this order. Pay " + total + " AED when it arrives. If it did not open, allow pop-ups and send again.";
    }
  });
  }

  render();
})();
