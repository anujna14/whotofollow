const { from, fromEvent, mergeMap, map, startWith, combineLatestWith, mergeWith, combineLatest, merge } = rxjs;

var refreshButton = document.querySelector(".refresh");
var closeButton1 = document.querySelector(".close1");
var closeButton2 = document.querySelector(".close2");
var closeButton3 = document.querySelector(".close3");

var refreshClickStream = fromEvent(refreshButton, "click");
var close1ClickStream = fromEvent(closeButton1, "click");
var close2ClickStream = fromEvent(closeButton2, "click");
var close3ClickStream = fromEvent(closeButton3, "click");

var requestStream = refreshClickStream.pipe(
  startWith("startup click"),
  map(function () {
    var randomOffset = Math.floor(Math.random() * 500);
    return "https://api.github.com/users?since=" + randomOffset;
  })
);
var responseStream = requestStream.pipe(
  mergeMap(function (requestUrl) {
    return from($.ajax({ url: requestUrl }));
  })
);

const createSuggestionStream = (closeClickStream) => {
  return closeClickStream.pipe(
    startWith("startup click"),
    combineLatestWith(responseStream, (click, listUsers) => listUsers[Math.floor(Math.random() * listUsers.length)]),
    mergeWith(refreshClickStream.pipe(map(() => null))),
    startWith(null)
  );
};
// console.log(createSuggestionStream);
const suggestion1Stream = createSuggestionStream(close1ClickStream);
const suggestion2Stream = createSuggestionStream(close2ClickStream);
const suggestion3Stream = createSuggestionStream(close3ClickStream);


const renderSuggestion = (suggestedUser, selector) => {
  const suggestionEl = document.querySelector(selector);
  if (suggestedUser === null) {
    suggestionEl.style.visibility = "hidden";
  } else {
    suggestionEl.style.visibility = "visible";
    const usernameEl = suggestionEl.querySelector(".username");
    usernameEl.href = suggestedUser.html_url;
    usernameEl.textContent = suggestedUser.login;
    const imgEl = suggestionEl.querySelector("img");
    imgEl.src = "";
    imgEl.src = suggestedUser.avatar_url;
  }
};

suggestion1Stream.subscribe((suggestedUser) => {
  renderSuggestion(suggestedUser, ".suggestion1");
});
suggestion2Stream.subscribe((suggestedUser) => {
  renderSuggestion(suggestedUser, ".suggestion2");
});
suggestion3Stream.subscribe((suggestedUser) => {
  renderSuggestion(suggestedUser, ".suggestion3");
});
