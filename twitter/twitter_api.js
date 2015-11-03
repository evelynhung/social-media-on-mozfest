'use strict';

/*
   we use application-only authentication to do REST API query.
 */
const twitter_host = 'https://api.twitter.com';

var TwitterAPI = {
  bearer_credentials: CONSUMER_TOKEN || undefined,
  bearer_token: undefined,
  search_api: twitter_host + '/1.1/search/tweets.json?q=',
  query: window.encodeURIComponent('@fxos_tv OR #mozfest'),
  parameters: '&result_type=recent&include_entities=1',
  root: document.getElementById('tweets_container'),
  since_id: null,
  update_time: 30,

  debug: function(msg) {
    console.log('///// ' + msg);
  },

  init: function() {
    this.update();
    window.setInterval(this.update.bind(this), this.update_time * 1000);
    window.addEventListener('keydown', (evt) => {
      if (evt.keyCode == KeyEvent.DOM_VK_RETURN) {
        this.update();
      } else if (evt.keyCode == KeyEvent.DOM_VK_DOWN
                || evt.keyCode == KeyEvent.DOM_VK_RIGHT) {
        evt.preventDefault();
      }
    });
  },

  update: function() {
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
    if (this.since_id) {
      url += '&since_id=' + this.since_id;
    }
    var onerror = function(error_status) {
      this.bearer_token = null;
      this.update();
    }
    this._ajax('GET', url, authentication, null, callback, onerror);
  },

  render_tweets(response) {
    var tweets = response.statuses;
    if (tweets.length == 0) {
      this.debug('no update!!!');
      return;
    }

    this.since_id= response.search_metadata.max_id_str;
    this.debug('next fetch: ' + this.since_id);

    var container = document.createDocumentFragment();
    tweets.forEach((tweet) => {
      var user_name = tweet.user.name;
      var user_id = tweet.user.screen_name;
      var text = tweet.text;
      var gravatar = tweet.user.profile_image_url;
      var photo_url = null;
      var photo_height = null;
      if (tweet.entities.media) {
        photo_url = tweet.entities.media[0].media_url;
        var w = tweet.entities.media[0].sizes.medium.w;
        var h = tweet.entities.media[0].sizes.medium.h;
        photo_height = Math.floor((420 / w) * h);
      }
      this.debug('tweet: ' + tweet.created_at + ' id: ' + tweet.id_str);
      var html = '';
      if (photo_url) {
        html += '<img src=' + photo_url + ' height=' + photo_height + '></img>';
      }
      html += '<div class="title">' 
               + '<img class="gravatar" src=' + gravatar + '></img>'
               + '<div class="user_info">'
               + '<div class="user_name">' + user_name + '</div>'
               + '<div class="user_id">@' + user_id + '</div>'
               + '</div></div>';
      html += '<div class="tweet_text">' + text + '</div>';
      var $item = $('<div class="tweet" id='+ tweet.id_str +'>' + html + '</div>');
      container.appendChild($item.get(0));
    });
    if (this.root.firstChild) {
      this.root.insertBefore(container, this.root.firstChild);
    } else {
      this.root.appendChild(container);
    }
    $(this.root).waterfall({ 
        colMinWidth: 420,
        defaultContainerWidth: window.innerWidth - 85*2,
        autoresize: true
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
    //this.debug('get credentials: ' + this.bearer_credentials + '  ' + authentication);

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
