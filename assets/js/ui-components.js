(function () {
  "use strict";

  function setupConsent() {
    var banner = document.querySelector("[data-cookie-consent]");
    if (!banner) return;

    var storageKey = "modular-city-cookie-consent";
    var panel = banner.querySelector("[data-consent-panel]");
    var manage = banner.querySelector("[data-consent-manage]");
    var accept = banner.querySelector("[data-consent-accept]");
    var essential = banner.querySelector("[data-consent-essential]");
    var save = banner.querySelector("[data-consent-save]");
    var closePanel = banner.querySelector("[data-consent-close-panel]");
    var categories = Array.prototype.slice.call(banner.querySelectorAll("[data-consent-category]"));

    function getStoredConsent() {
      try {
        return window.localStorage.getItem(storageKey);
      } catch (_error) {
        return null;
      }
    }

    function storeConsent(value) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(value));
      } catch (_error) {
        // The UI still closes even when storage is unavailable.
      }
    }

    function closeBanner() {
      banner.hidden = true;
    }

    function setPanel(open) {
      panel.hidden = !open;
      manage.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        panel.querySelector("input, button").focus();
      }
    }

    if (getStoredConsent()) {
      closeBanner();
      return;
    }

    manage.addEventListener("click", function () {
      setPanel(panel.hidden);
    });

    closePanel.addEventListener("click", function () {
      setPanel(false);
      manage.focus();
    });

    essential.addEventListener("click", function () {
      storeConsent({essential: true, analytics: false, improvement: false, saved_at: new Date().toISOString()});
      closeBanner();
    });

    accept.addEventListener("click", function () {
      storeConsent({essential: true, analytics: true, improvement: true, saved_at: new Date().toISOString()});
      closeBanner();
    });

    save.addEventListener("click", function () {
      var value = {essential: true, saved_at: new Date().toISOString()};
      categories.forEach(function (input) {
        value[input.dataset.consentCategory] = input.checked;
      });
      storeConsent(value);
      closeBanner();
    });
  }

  function setupLoginDemo() {
    var form = document.querySelector("[data-login-demo]");
    if (!form) return;

    var status = form.querySelector("#login-demo-status");
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      status.hidden = false;
      status.textContent = "Demo only: no sign-in request was sent. This component is ready to connect to a future identity service.";
      status.focus();
    });
  }

  setupConsent();
  setupLoginDemo();
})();
