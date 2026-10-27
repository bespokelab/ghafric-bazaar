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
