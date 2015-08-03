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
  reqResp: reqResp,
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

function ReqResp (method, href) {
  this.href = href;

  this.req = {
    method: method,
    headers: {
      'Content-Type': 'application/json' 
    },
    body: '{}'
  }

  this.resp = {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: null
  }
}

ReqResp.prototype = {
  withRequestHeaders: function (headers) {
    this.req.headers = headers
    return this
  },
  withRequestBody: function (obj) {
    this.req.body = JSON.stringify(obj);
    return this
  },
  withResponseStatus: function (st) {
    this.resp.status = st
    return this
  },
  withRequestToken: function (token) {
    this.req.headers = headers(token);
    return this
  },
  withResponseHeaders: function (obj) {
    this.resp.headers = obj;
    return this
  },
  withResponseBody: function (obj) {
    this.resp.body = obj;
    return this
  },
  run: function (fn) {
    var self = this;

    return function () {
      var fetchStub;

      beforeEach(function () {
        fetchStub = sinon.stub(global, 'fetch')
        var method = self.req.method;

        var resp = new Response(JSON.stringify(self.resp.body), {
          status: self.resp.status,
          headers: self.resp.headers
        })
        var promise = Promise.resolve(resp)
        var reqOpts = {
          method: self.req.method,
          headers: self.req.headers
        };

        if(method == 'post' ||  method == 'put' || method == 'patch') {
          reqOpts.body = self.req.body
        }

        fetchStub.returns(Promise.reject(new Error('Fetch expectation mis-match')));

        fetchStub
          .withArgs(self.href, reqOpts)
          .returns(promise)
      })

      afterEach(function () {
        global.fetch.restore()
      })

      fn.call(this)
    }
  }
}

function reqResp (method, href) {
  return new ReqResp(method, href)
}

function testResponse (
  link,
  reqHeaders,
  respBody,
  respStatus,
  fn,
  reqBody
) {
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

