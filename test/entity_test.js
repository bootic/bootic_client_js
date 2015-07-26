var assert = require('assert'),
    sinon = require('sinon'),
    helpers = require('./test_helpers'),
    Entity = require('../src/entity');

describe('Entity', function () {
  var subject, client;

  var friend1 = {
    name: 'Friend1',
    _links: {
      self: {
        href: 'http://api.com/people/2'
      }
    }
  }

  var friend2 = {
    name: 'Friend2',
    _links: {
      self: {
        href: 'http://api.com/people/3'
      }
    },
    _embedded: {
      friends: [friend1]
    }
  }

  var account = {
    id: 123
  }

  var data = {
    name: 'Joe',
    last_name: 'Bloggs',
    _links: {
      update: {
        method: 'put',
        href: 'http://api.com/people/1'
      },
      search: {
        href: 'http://api.com/people{?q}'
      }
    },
    _embedded: {
      friends: [friend1, friend2],
      account: account
    }
  }

  beforeEach(function () {
    client = {run: function () {}}
    subject = new Entity(data, client)
  })

  describe('#props', function () {
    it('includes all top level properties', function () {
      assert.equal(subject.props.name, 'Joe')
      assert.equal(subject.props.last_name, 'Bloggs')
    })
  })

  describe('#prop()', function () {
    it('returns properties', function () {
      assert.equal(subject.prop('name'), 'Joe')
    })

    it('returns single embedded entity', function () {
      var a = subject.prop('account')
      assert.equal(a.prop('id'), 123)
    })

    it('resturns arrays of embedded entities', function () {
      var friends = subject.prop('friends')
      assert.equal(friends.length, 2)
      assert.equal(friends[0].prop('name'), 'Friend1')
      assert.equal(friends[1].prop('name'), 'Friend2')
    })

    it('returns null for unknown props', function () {
      assert.equal(subject.prop('foobar'), null)
    })
  })

  describe('#rel()', function () {
    it('returns link object', function () {
      var link = subject.rel('update')
      assert.equal(link.href, 'http://api.com/people/1')
      assert.equal(link.method, 'put')
    })

    it('returns null if link not found', function () {
      assert.equal(subject.rel('dede'), null)
    })
  })

  describe('#fetch()', function () {
    var runStub, promise;

    describe('successful', function () {
      beforeEach(function () {
        runStub = sinon.stub(client, 'run')
        var newResource = new Entity({id: 333}, client)
        promise = Promise.resolve(newResource)
      })

      it('calls client#fetch() and returns promise', function (done) {
        runStub.withArgs(subject.rel('update'), {}).returns(promise)

        helpers.expectPromise(subject.fetch('update'), function (args) {
          assert.equal(args[0].prop('id'), 333)
        }, done)
      })

      it('calls client#fetch() with extra params and returns promise', function (done) {
        var args = {id: 333}
        runStub.withArgs(subject.rel('update'), args).returns(promise)

        helpers.expectPromise(subject.fetch('update', args), function (args) {
          assert.equal(args[0].prop('id'), 333)
        }, done)
      })
    })

    describe('no rel found', function () {
      it('returns rejected promise with error message', function (done) {
        subject.fetch('fooobar').catch(function (err) {
          assert.equal(err, "No link with relation name 'fooobar'")
        }).then(done)
      })
    })
  })
})
