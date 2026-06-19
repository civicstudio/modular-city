(function () {
  "use strict";

  var catalog = document.querySelector("[data-service-catalog]");
  if (!catalog) return;

  var search = catalog.querySelector("#service-search");
  var category = catalog.querySelector("#service-category");
  var channel = catalog.querySelector("#service-channel");
  var reset = catalog.querySelector("#service-filter-reset");
  var resultCount = catalog.querySelector("#service-result-count");
  var emptyState = catalog.querySelector("#service-empty-state");
  var cards = Array.prototype.slice.call(catalog.querySelectorAll("[data-service-card]"));

  function normalize(value) {
    return (value || "").toLowerCase().trim();
  }

  function applyFilters() {
    var query = normalize(search.value);
    var selectedCategory = category.value;
    var selectedChannel = channel.value;
    var visible = 0;

    cards.forEach(function (card) {
      var matchesQuery = !query || normalize(card.dataset.search).indexOf(query) !== -1;
      var matchesCategory = !selectedCategory || card.dataset.category === selectedCategory;
      var matchesChannel = !selectedChannel || card.dataset.channels.split(" ").indexOf(selectedChannel) !== -1;
      var matches = matchesQuery && matchesCategory && matchesChannel;

      card.hidden = !matches;
      if (matches) visible += 1;
    });

    resultCount.textContent = visible + (visible === 1 ? " service" : " services");
    emptyState.hidden = visible !== 0;
  }

  search.addEventListener("input", applyFilters);
  category.addEventListener("change", applyFilters);
  channel.addEventListener("change", applyFilters);
  reset.addEventListener("click", function () {
    search.value = "";
    category.value = "";
    channel.value = "";
    applyFilters();
    search.focus();
  });
})();
