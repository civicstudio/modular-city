(function () {
  "use strict";

  var directory = document.querySelector("[data-meeting-directory]");
  if (!directory) return;

  var filter = directory.querySelector("#meeting-body-filter");
  var search = directory.querySelector("#meeting-search");
  var dateFrom = directory.querySelector("#meeting-date-from");
  var dateTo = directory.querySelector("#meeting-date-to");
  var reset = directory.querySelector("#meeting-filter-reset");
  var count = directory.querySelector("#meeting-result-count");
  var emptyState = directory.querySelector("#meeting-empty-state");
  var cards = Array.prototype.slice.call(directory.querySelectorAll("[data-meeting-card]"));

  function applyFilter() {
    var bodyId = filter.value;
    var searchValue = search.value.trim().toLowerCase();
    var fromValue = dateFrom.value;
    var toValue = dateTo.value;
    var visible = 0;

    cards.forEach(function (card) {
      var matchesBody = !bodyId || card.dataset.body === bodyId;
      var matchesSearch = !searchValue || (card.dataset.search || "").toLowerCase().indexOf(searchValue) !== -1;
      var matchesFrom = !fromValue || card.dataset.date >= fromValue;
      var matchesTo = !toValue || card.dataset.date <= toValue;
      var matches = matchesBody && matchesSearch && matchesFrom && matchesTo;
      card.hidden = !matches;
      if (matches) visible += 1;
    });

    count.textContent = visible + (visible === 1 ? " meeting" : " meetings");
    emptyState.hidden = visible !== 0;
  }

  var requestedBody = new URLSearchParams(window.location.search).get("body");
  if (requestedBody && Array.prototype.some.call(filter.options, function (option) { return option.value === requestedBody; })) {
    filter.value = requestedBody;
  }

  var requestedSearch = new URLSearchParams(window.location.search).get("q");
  if (requestedSearch) search.value = requestedSearch;

  filter.addEventListener("change", applyFilter);
  search.addEventListener("input", applyFilter);
  dateFrom.addEventListener("change", applyFilter);
  dateTo.addEventListener("change", applyFilter);
  reset.addEventListener("click", function () {
    filter.value = "";
    search.value = "";
    dateFrom.value = "";
    dateTo.value = "";
    applyFilter();
    search.focus();
  });
  applyFilter();
})();

(function () {
  "use strict";

  var page = document.querySelector("[data-meeting-detail-page]");
  if (!page) return;

  var select = page.querySelector("#meeting-detail-select");
  var details = Array.prototype.slice.call(page.querySelectorAll("[data-meeting-detail]"));

  function showMeeting(id) {
    var hasMatch = false;
    details.forEach(function (detail) {
      var matches = detail.dataset.meetingDetail === id;
      detail.hidden = !matches;
      hasMatch = hasMatch || matches;
    });

    if (!hasMatch && details.length > 0) {
      details[0].hidden = false;
      select.value = details[0].dataset.meetingDetail;
      return;
    }

    select.value = id;
  }

  var requestedMeeting = new URLSearchParams(window.location.search).get("meeting");
  showMeeting(requestedMeeting || details[0].dataset.meetingDetail);

  select.addEventListener("change", function () {
    showMeeting(select.value);
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", "?meeting=" + encodeURIComponent(select.value));
    }
  });
})();
