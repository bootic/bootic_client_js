module.exports = (function () {
  var Entity = function (data, client) {
    this.props = data;
    this._client = client;
    this._links = data['_links'] || {}
    this._embedded = data['_embedded'] || {}
  }

  Entity.prototype = {
    rel: function (name) {
      return this._links[name] || null
    },
    prop: function (key) {
      var data, self = this;
      if(data = this.props[key]) {
        return data
      } else if(data = this._embedded[key]) {
        if('map' in data) {
          return data.map(function (d) {
            return new Entity(d, self._client)
          })
        } else {
          return new Entity(data, this._client)
        }
      } else {
        return null
      }
    },
    fetch: function (relName, params) {
      params = params || {}
      var link = this.rel(relName)
      if(!link) return Promise.reject("No link with relation name '"+ relName +"'") // empty promise?
      return this._client.run(link, params)
    }
  }

  return Entity
})();



