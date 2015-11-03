'use strict';

/*
   we use application-only authentication to do REST API query.
 */
const twitter_host = 'https://api.twitter.com';

var TwitterAPI = {
  bearer_credentials: CONSUMER_TOKEN || undefined,
  bearer_token: undefined,
  search_api: twitter_host + '/1.1/search/tweets.json?q=',
  query: window.encodeURIComponent('@fxos_tv'),
  parameters: '&result_type=recent',

  debug: function(msg) {
    console.log('///// ' + msg);
  },

  init: function() {
    var self = this;
    this.get_bearer_token(function() {
      self.get_tweets( (response) => { 
        self.render_tweets(response); 
      });
    });
  },

  get_tweets: function(callback) {
    if (!this.bearer_token) {
      this.debug('Missing API access token');
      return;
    }
    var authentication = 'Bearer ' + this.bearer_token;
    var url = this.search_api + this.query + this.parameters;
    this._ajax('GET', url, authentication, null, callback, null);
  },

  render_tweets(response) {
    var tweets = response.statuses;
    var refresh_url = response.search_metadata.refresh_url;
    this.debug('next fetch: ' + refresh_url);
    tweets.forEach((tweet) => {
      var user_name = tweet.user.name;
      var user_id = tweet.user.screen_name;
      var text = tweet.text;
      var photo_url = tweet.entities.media[0].media_url;
      this.debug('tweet: ' + user_name + ' ' + text + ' ' + photo_url);
    });
  },

  get_bearer_token: function(callback) {
    // if we've got token before, try to reuse it unless it's expired.
    if (this.bearer_token) {
      callback();
      return;
    }

    if (!this.bearer_credentials) {
      this.debug('Missing consumer token.');
      return;
    }
    var authentication = 'Basic ' + window.btoa(this.bearer_credentials);
    this.debug('get credentials: ' + this.bearer_credentials + '  ' + authentication);

    var url = twitter_host + '/oauth2/token';
    var body = 'grant_type=client_credentials';
    this._ajax('POST', url, authentication, body, function(response) {
      if (response.token_type != 'bearer') {
        this.debug('Not expected authentication type');
        return;
      }
      this.bearer_token = response.access_token; 
      callback();
    }.bind(this), null);
  },

  _ajax: function(method, url, auth, data, success, error) {
    var request = new XMLHttpRequest({
      mozSystem: true
    });

    this.debug(method + ' ' + url + ' with payload: ' + data);
    request.addEventListener("load", (evt) => {
      this.debug("Request Status: " + request.status);
      if (request.status === 200 && success) {
        var response = JSON.parse(request.responseText);
        success(response);
      } else if (error) {
        error(request.status);
      }
    }, false);

    request.open(method, url);
    request.setRequestHeader('Authorization', auth);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    request.send(data || null);
  }
};


window.addEventListener('load', function() {
  TwitterAPI.init();
});
