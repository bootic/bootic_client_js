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
          assert.equal(args[0].name, 'root')
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
          assert.equal(args[0].name, 'root2')
        }, done)
      })

    }))

    describe('with response error', helpers.testResponse({
      href: 'https://api.bootic.net/v1',
      method: 'get'
    }, helpers.headers('xxx'), '{"name":"error"}', 403, function () {

      it('makes request to default root and returns a promise that yields an Entity', function (done) {
        helpers.expectPromise(subject.root(), function (args) {
          assert.equal(args[0].name, 'error')
        }, done)
      })

    }))
  })


  describe('#run()', function () {

    describe('no parameters',
      helpers.reqResp('post', 'https://api.apis.com')
        .withRequestToken('xxx')
        .withResponseStatus(201)
        .withResponseBody({name: 'Foobar'})
        .run(function () {
          it('makes request and returns a promise that yields an Entity', function (done) {

            helpers.expectPromise(subject.run({href: 'https://api.apis.com', method: 'post'}), function (args) {
              assert.equal(args[0].name, 'Foobar')
            }, done)
          })
        })
    )

    describe('templated URL',
      helpers.reqResp('get', 'https://api.apis.com/users/111?q=foo')
        .withRequestToken('xxx')
        .withResponseBody({name: 'Foobar'})
        .withResponseStatus(201)
        .run(function () {
          it('expands templated URIs and makes request with aditional params', function (done) {
            var link = {href: 'https://api.apis.com/users/{id}{?q}', method: 'get', templated: true}

            helpers.expectPromise(subject.run(link, {id: 111, q: 'foo', foo: {name: 'lala'}}), function (args) {
              assert.equal(args[0].name, 'Foobar')
            }, done)
          })
        })
    );

    describe('templated URL with POST body',
      helpers.reqResp('post', 'https://api.apis.com/users/111')
        .withRequestToken('xxx')
        .withRequestBody({foo: {name: 'lala'}})
        .withResponseStatus(200)
        .withResponseBody({name: 'lala', id: 111})
        .run(function () {
          it('expands templated URIs and makes request with aditional params', function (done) {
            var link = {href: 'https://api.apis.com/users/{id}', method: 'post', templated: true}

            helpers.expectPromise(subject.run(link, {id: 111, foo: {name: 'lala'}}), function (args) {
              assert.equal(args[0].name, 'lala')
              assert.equal(args[0].id, 111)
            }, done)
          })
        })
    );

    describe('401 Unauthorized',
      helpers.reqResp('post', 'https://api.apis.com')
        .withRequestToken('xxx')
        .withResponseStatus(401)
        .withResponseBody({error: 'Unauthorized'})
        .run(function () {
          it('fffff', function (done) {

            helpers.expectPromise(subject.run({href: 'https://api.apis.com', method: 'post'}), function (args) {
              assert.equal(args[0].error, 'Unauthorized')
            }, done)
          })
        })
    )
  })

})
