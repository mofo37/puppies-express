const chai = require('chai');
const assert = chai.assert;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const app = require('../lib/app');
const connection = require('../lib/connect');


const request = chai.request(app);

describe('GET /', () => {
  it('says hello world', () => {
    return request
      .get('/')
      .then(res => (res.text))
      .then(text => assert.equal(text, 'hello world'));
  });
});

it('serves images out of public', () => {
  return request
    .get('/images/puppy.jpg')
    .then(res => {
      return assert.equal(res.statusCode, 200);
    });
});

describe('puppies REST api', () => {
  const DB_URI = 'mongodb://localhost:27017/puppies-test';
  before(() => connection.connect(DB_URI));
  before(() => connection.db.dropDatabase());
  after(() => connection.close());
  const fido = {
    name: 'fido',
    type: 'puppy'
  };

  function savePuppy(puppy) {
    return request
      .post('/puppies')
      .send(puppy);

  }

  it('saves a puppy', () => {
    return savePuppy(fido)
      .then(res => res.body)
      .then(savedPuppy => {
        assert.isOk(savedPuppy._id);
        fido._id = savedPuppy._id;
        assert.deepEqual(savedPuppy, fido);
      });
  });

  it('GETs puppy if it exists', () => {
    return request
      .get(`/puppies/${fido._id}`)
      .then(res => res.body)
      .then(puppy => assert.deepEqual(puppy, fido));
  });

  it('returns 404 if puppy does not exist', () => {
    return request
      .get('/puppies/doesnotexist')
      .then(
      () => {
        throw new Error('successful status code not expected');
      },

      res => {
        assert.equal(res.status, 404);
        assert.isOk(res.response.error);
      });
  });
});