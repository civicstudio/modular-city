(function () {
  "use strict";

  var form = document.querySelector("[data-311-form]");
  if (!form) return;

  var details = form.querySelector("#request-details");
  var requestType = form.querySelector("#request-type");
  var location = form.querySelector("#request-location");
  var email = form.querySelector("#request-email");
  var count = form.querySelector("#request-character-count");
  var confirmation = document.querySelector("#request-confirmation");
  var reference = document.querySelector("#request-reference");
  var list = document.querySelector("#request-list");
  var emptyState = document.querySelector("#request-list-empty");
  var listStatus = document.querySelector("#request-list-status");
  var clearButton = document.querySelector("#clear-demo-requests");
  var storageKey = "modular-city-311-demo-requests";
  var memoryRequests = [];

  function loadRequests() {
    try {
      return JSON.parse(window.localStorage.getItem(storageKey) || "[]");
    } catch (_error) {
      return memoryRequests;
    }
  }

  function saveRequests(requests) {
    memoryRequests = requests;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(requests));
    } catch (_error) {
      // Memory fallback keeps the tracker usable when storage is unavailable.
    }
  }

  function append(parent, tagName, className, text) {
    var node = document.createElement(tagName);
    if (className) node.className = className;
    if (text) node.textContent = text;
    parent.appendChild(node);
    return node;
  }

  function addDefinition(parent, term, description) {
    var row = append(parent, "div", "grid gap-1 sm:grid-cols-[9rem_1fr]");
    append(row, "dt", "font-bold text-slate-900", term);
    append(row, "dd", "text-slate-700", description);
  }

  function formatDate(value) {
    return new Date(value).toLocaleString("en-US", {dateStyle: "medium", timeStyle: "short"});
  }

  function renderRequests() {
    var requests = loadRequests();
    list.textContent = "";
    emptyState.hidden = requests.length !== 0;
    clearButton.hidden = requests.length === 0;
    listStatus.textContent = requests.length + (requests.length === 1 ? " demo request" : " demo requests");

    requests.forEach(function (request) {
      var item = append(list, "li");
      var article = append(item, "article", "rounded-xl border border-slate-200 bg-white p-5 shadow-sm");
      var header = append(article, "div", "flex flex-wrap items-start justify-between gap-3");
      var headingGroup = append(header, "div");
      append(headingGroup, "h3", "font-bold text-slate-950", request.service_name);
      append(headingGroup, "p", "mt-1 text-sm text-slate-600", request.id);
      append(header, "span", "rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-800", request.status);

      var detailsList = append(article, "dl", "mt-4 space-y-2 text-sm");
      addDefinition(detailsList, "Created", formatDate(request.created_at));
      addDefinition(detailsList, "Location", request.location);
      addDefinition(detailsList, "Owner", request.department);
      addDefinition(detailsList, "Expected response", request.expected_response);
      addDefinition(detailsList, "Contact", request.contact_requested ? "Email provided, not stored" : "No email provided");
      append(article, "p", "mt-4 text-sm text-slate-700", request.description);
    });
  }

  details.addEventListener("input", function () {
    count.textContent = details.value.length + " of 1,000 characters";
  });

  document.querySelectorAll("[data-request-code]").forEach(function (link) {
    link.addEventListener("click", function () {
      requestType.value = link.dataset.requestCode;
      window.setTimeout(function () { requestType.focus(); }, 0);
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;

    var selectedOption = requestType.options[requestType.selectedIndex];
    var request = {
      id: "MC311-DEMO-" + String(Date.now()).slice(-6),
      service_code: requestType.value,
      service_name: selectedOption.textContent,
      department: selectedOption.dataset.department || "City staff",
      expected_response: selectedOption.dataset.response || "Review pending",
      location: location.value,
      description: details.value,
      contact_requested: email.value.trim() !== "",
      status: "Received",
      created_at: new Date().toISOString()
    };
    var requests = loadRequests();
    requests.unshift(request);
    saveRequests(requests.slice(0, 20));

    reference.textContent = request.id;
    confirmation.hidden = false;
    confirmation.focus();
    renderRequests();
    form.reset();
    count.textContent = "0 of 1,000 characters";
  });

  clearButton.addEventListener("click", function () {
    saveRequests([]);
    renderRequests();
    form.querySelector("button[type='submit']").focus();
  });

  renderRequests();
})();
