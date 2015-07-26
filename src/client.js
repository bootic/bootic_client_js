require('es6-promise').polyfill();
require('isomorphic-fetch');

var Entity = require('./entity');

module.exports = (function (Entity) {

  var ROOT_URL = 'https://api.bootic.net/v1';

  var AccessTokenHandler = function (headers, opts) {
    headers['Authorization'] = 'Bearer ' + opts.accessToken
    return headers
  }

  var Client = function(opts) {
    opts = opts || {}
    this._opts = opts
    this._authHandler = AccessTokenHandler
    this._rootUrl = opts['rootUrl'] || ROOT_URL;
  };

  Client.prototype = {

    root: function () {
      return this.run({
        href: this._rootUrl
      })
    },

    run: function (link, params) {
      var self = this
      var href = link.href
      var method = link['method'] || 'get'
      var headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }

      return fetch(href, {
        method: method,
        headers: this._authHandler(headers, this._opts)
      }).then(function (response) {
        return response.json()
      }).then(function (data) {
        return new Entity(data, self)
      })
    }
  }

  return Client
})(Entity);

