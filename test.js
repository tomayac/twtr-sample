var source = new EventSource('http://twtr-sample.herokuapp.com/');
source.addEventListener('message', function(e) {
  var tweet = JSON.parse(e.data);
  tweet.entities.urls.forEach(function(urlObj) {
    if (/wikipedia\.org\/wiki\//.test(urlObj.expanded_url)) {
      console.log(urlObj.expanded_url);
    }
  });
}, false);