var sinon = require('sinon');

require('es6-promise').polyfill();
var fetch = require('node-fetch');

// var Response = fetch.Response;

function Response (body, info) {
  this.body = body
  this.json = function () {
    return Promise.resolve(JSON.parse(this.body))
  }
  this.status = info.status
  this.headers = info.headers
}

module.exports = {
  testResponse: testResponse,
  headers: headers,
  expectPromise: expectPromise
}

function expectPromise (promise, assertion, done) {
  promise.then(function () {
    assertion(Array.prototype.slice.call(arguments))
    done()
  }).catch(done)
}

function headers (token) {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  }
}

function testResponse (link, reqHeaders, respBody, respStatus, fn) {
  return function () {
    var fetchStub;

    beforeEach(function () {
      fetchStub = sinon.stub(global, 'fetch')
      var resp = new Response(respBody, {
        status: respStatus,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      var promise = Promise.resolve(resp)
      fetchStub.withArgs(link.href, {method: link.method, headers: reqHeaders}).returns(promise)
    })

    afterEach(function () {
      global.fetch.restore()
    })

    fn.call(this)
  }
}

