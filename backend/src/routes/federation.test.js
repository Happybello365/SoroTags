const request = require('supertest');
const express = require('express');
const federationRouter = require('./federation');

describe('federation routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/federation', federationRouter);
  });

  describe('GET /federation', () => {
    it('returns a username-to-address mapping', async () => {
      const res = await request(app).get('/federation').query({ username: 'alice' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('address');
    });

    it('sets a short-lived public Cache-Control header', async () => {
      const res = await request(app).get('/federation').query({ username: 'alice' });

      expect(res.headers['cache-control']).toBe(
        'public, max-age=60, stale-while-revalidate=30'
      );
    });
  });

  describe('POST /register', () => {
    it('registers a username', async () => {
      const res = await request(app)
        .post('/federation/register')
        .send({ username: 'bob', address: 'GBADDRESS' });

      expect(res.status).toBe(200);
    });

    it('sets a no-store Cache-Control header', async () => {
      const res = await request(app)
        .post('/federation/register')
        .send({ username: 'bob', address: 'GBADDRESS' });

      expect(res.headers['cache-control']).toBe('no-store');
    });
  });
});
