var uriTemplate = require('uri-templates');
var util = require('./util');

module.exports = (function () {

  var ROOT_URL = 'https://api.bootic.net/v1';

  var AccessTokenHandler = function (headers, opts) {
    if(opts.accessToken) {
      headers['Authorization'] = 'Bearer ' + opts.accessToken
    }
    return headers
  }

  var noop = function (client, next, reject) { reject("Unauthorized") }
  var noopErr = function (err) {}

  var Client = function(opts) {
    opts = opts || {}
    this._opts = opts
    this.logger = opts['logger'] || console;
    this._authHandler = AccessTokenHandler
    this._rootUrl = opts['rootUrl'] || ROOT_URL;
    this._retryCount = 0;
    this.onUnauthorized(noop)
    this.onForbidden(noop)
    this.onNetworkError(noopErr)
  };

  Client.prototype = {
    authorize: function(token) {
      this._opts.accessToken = token
      return this
    },

    onUnauthorized: function (fn) {
      var self = this;
      this._onUnauthorized = function () {
        return new Promise(function(resolve, reject) {
          fn(self, resolve, reject)
        })
      }
      return this
    },

    onForbidden: function (fn) {
      var self = this;
      this._onForbidden = function () {
        return new Promise(function(resolve, reject) {
          fn(self, resolve, reject)
        })
      }
      return this
    },

    onNetworkError: function (fn) {
      this._onNetworkError = fn
      return this
    },

    root: function () {
      return this.run({
        href: this._rootUrl
      })
    },

    run: function (link, params) {
      var self = this;
      var href = link.href;
      var template;
      var params = params ? util.clone(params) : {};
      var templated = !!link['templated'];
      var method = link['method'] || 'get';
      var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      };

      if(templated) {
        template = uriTemplate(href);
        href = template.fill(params);
      }

      var options = {
        method: method,
        headers: this._authHandler(headers, this._opts)
      };

      if(method == 'post' || method == 'put' || method == 'patch') {
        if(template) {
          template.varNames.forEach(function (v) {
            delete params[v]
          })
        }
        options.body = JSON.stringify(params)
      }

      var onUnauthorized = this._onUnauthorized,
          onForbidden = this._onForbidden,
          onNetworkError = this._onNetworkError,
          self = this;

      self.logger.log("request", options.method, href)

      return fetch(href, options).then(function (response) {
        if(response.status == 401) {
          if(self._retryCount == 0) {
            self._retryCount++
            self.logger.log("401. Retrying...")
            return onUnauthorized(self).then(function() {
              return self.run(link, params)
            })
          } else {
            return response.json()
          }
        } else if(response.status == 403) {
          return onForbidden(self).then(function() {
            return response.json()
          })
        } else if(response.status == 204) {
          self._retryCount = 0
          return {}
        } else {
          self._retryCount = 0
          return response.json()
        }
      }).catch(function (err) {
        var errLink = util.clone(link)
        errLink.href = href;
        errLink.method = method;
        self.logger.log("[network error] "+ err + " "+errLink.method+": " + errLink.href)
        onNetworkError(err, errLink, params)
        return err
      })
    }
  }

  return Client
})();

