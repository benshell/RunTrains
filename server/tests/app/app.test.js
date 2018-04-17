import proxyquire from 'proxyquire'
import test from 'tape'
import request from 'supertest'
import app from '../../src/app'

test('GET /', assert => {
  request(app)
    .get('/')
    .expect('Content-Type', /text/)
    .expect(200)
    .end(function(err, res) {
      assert.error(err, 'No error')
      assert.equal(res.status, 200, 'Status code is correct')
      assert.equal(res.text.indexOf('/graphiql') > -1, true, 'Contains mention of /graphiql')
      assert.end()
    })
})
