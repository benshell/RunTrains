const proxyquire = require('proxyquire')
const test = require('tape')
const request = require('supertest')
const app = require('../../src/app')

test('GET /', assert => {
  request(app)
    .get('/')
    .expect('Content-Type', /text/)
    .expect(200)
    .end(function(err, res) {
      assert.error(err, 'No error')
      assert.equal(res.status, 200, 'Status code is correct')
      assert.equal(
        res.text.indexOf('/graphiql') > -1,
        true,
        'Contains mention of /graphiql',
      )
      assert.end()
    })
})
