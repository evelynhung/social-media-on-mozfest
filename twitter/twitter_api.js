'use strict';

/*
   we use application-only authentication to do REST API query.
 */
const twitter_uri = 'https://api.twitter.com';

var TwitterAPI = {
  debug: function(msg) {
    console.log('///// ' + msg);
  },
  bearer_credentials: CONSUMER_TOKEN || undefined,
  bearer_token: undefined,

  init: function() {
    this.get_bearer_token( (token) => {
      this.bearer_token = token;
    });
  },

  get_bearer_token: function(callback) {
    if (!this.bearer_credentials) {
      this.debug('Missing consumer token.');
      return null;
    }
    var authentication = 'Basic ' + window.btoa(this.bearer_credentials);
    this.debug('get credentials: ' + this.bearer_credentials + '  ' + authentication);

    var url = twitter_uri + '/oauth2/token';
    this._post(url, authentication, 'grant_type=client_credentials', callback, null);

  },

  _post: function(url, auth, data, success, error) {
    var request = new XMLHttpRequest({
      mozSystem: true
    });

    this.debug('post data: ' + data);
    request.addEventListener("load", (evt) => {
      debug("Request Status: " + request.status);
      if (request.status === 200 && success) {
        var response = JSON.parse(request.responseText);
        success(response);
      } else if (error) {
        error(request.status);
      }
    }, false);

    request.open("POST", url);
    request.setRequestHeader('Authorization', auth);
    request.send(data || null);
  }
};


window.addEventListener('load', function() {
  TwitterAPI.init();
});
