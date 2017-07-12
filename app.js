var express = require('express');
var app = express();
var logfmt = require('logfmt');
var cuid = require('cuid');
var twitter = require('node-twitter');
var env = require('node-env-file');
if (require('fs').existsSync(__dirname + '/.env')) {
  env(__dirname + '/.env');
}

var responseObjects = {};

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  var requestId = cuid.slug();
  responseObjects[requestId] = res;
  console.log('SSE clients: ' + Object.keys(responseObjects).length);
  if (!twitterStreamClient.isRunning()) {
    console.log('Starting Twitter stream client.')
    twitterStreamClient.start();
  }
  req.on('close', function() {
    delete responseObjects[requestId];
    console.log('SSE clients: ' + Object.keys(responseObjects).length);
    if (!Object.keys(responseObjects).length) {
      console.log('Stopping Twitter stream client.')
      twitterStreamClient.stop();
    }
  });
  res.header({
    Connection: 'Keep-Alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  });
});

var twitterStreamClient = new twitter.StreamClient(
  process.env.TWITTER_CONSUMER_KEY,
  process.env.TWITTER_CONSUMER_SECRET,
  process.env.TWITTER_ACCESS_TOKEN_KEY,
  process.env.TWITTER_ACCESS_TOKEN_SECRET
);
twitterStreamClient.on('error', function(error) {
  console.log('Error: ' + (error.code ?
      error.code + ' ' + error.message : error.message));
});
twitterStreamClient.on('tweet', function(tweet) {
  var messageString = JSON.stringify(tweet);
  for (var requestId in responseObjects) {
    var res = responseObjects[requestId];
    res.write('data: ' + messageString + '\n\n');
  }
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log('twtr-sample listening on ' + port);
});