var assert = require('assert'),
    helpers = require('./test_helpers'),
    Client = require('../src/client');

describe('Client', function () {
  var subject;

  beforeEach(function () {
    subject = new Client({accessToken: 'xxx'})
  })

  describe('#root()', function () {

    describe('with default href', helpers.testResponse({
      href: 'https://api.bootic.net/v1',
      method: 'get'
    }, helpers.headers('xxx'), '{"name":"root"}', 200, function () {

      it('makes request to default root and returns a promise that yields an Entity', function (done) {
        helpers.expectPromise(subject.root(), function (args) {
          assert.equal(args[0].prop('name'), 'root')
        }, done)
      })

    }))

    describe('with custom href', helpers.testResponse({
      href: 'https://api-staging.bootic.net/v1',
      method: 'get'
    }, helpers.headers('xxx'), '{"name":"root2"}', 200, function () {

      beforeEach(function () {
        subject = new Client({
          accessToken: 'xxx',
          rootUrl: 'https://api-staging.bootic.net/v1'
        })
      })

      it('makes request to custom root and returns a promise that yields an Entity', function (done) {
        helpers.expectPromise(subject.root(), function (args) {
          assert.equal(args[0].prop('name'), 'root2')
        }, done)
      })

    }))

    describe('with response error', helpers.testResponse({
      href: 'https://api.bootic.net/v1',
      method: 'get'
    }, helpers.headers('xxx'), '{"name":"error"}', 403, function () {

      it('makes request to default root and returns a promise that yields an Entity', function (done) {
        helpers.expectPromise(subject.root(), function (args) {
          assert.equal(args[0].prop('name'), 'error')
        }, done)
      })

    }))
  })


  describe('#run()', function () {

    describe('no parameters', helpers.testResponse({
      href: 'https://api.apis.com',
      method: 'post'
    }, helpers.headers('xxx'), '{"name":"Foobar"}', 201, function () {

      it('makes request and returns a promise that yields an Entity', function (done) {
        helpers.expectPromise(subject.run({href: 'https://api.apis.com', method: 'post'}), function (args) {
          assert.equal(args[0].prop('name'), 'Foobar')
        }, done)
      })

    }))

    describe('templated URL', helpers.testResponse({
      href: 'https://api.apis.com/users/111?q=foo',
      method: 'get'
    }, helpers.headers('xxx'), '{"name":"Foobar"}', 201, function () {

      it('expands templated URIs and makes request', function (done) {
        var link = {href: 'https://api.apis.com/users/{id}{?q}', method: 'get', templated: true}

        helpers.expectPromise(subject.run(link, {id: 111, q: 'foo'}), function (args) {
          assert.equal(args[0].prop('name'), 'Foobar')
        }, done)
      })

    }))
  })

})
