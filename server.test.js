const supertest = require('supertest');
const app = require('./server');
const request = supertest(app);

describe('routes', () => {
  describe('/user', () => {
    let userID = '';

    it('should create a new user', async () => {
      const res = await request.post('/user').send({
        email: 'test',
        password: 'password'
      });
      userID= res.body[0]._id;

      expect(res.status).toBe(200);
      expect(res.body[0].email).toBe('test');
      expect(res.body[0].password).toBe('password');
    });

    it('should get a user by email', async () => {
      const res = await request.get('/user/test');
      expect(res.status).toBe(200);
      console.log('RES', res.body);
      // expect(res.body.email).toBe('test');
    });

    it('should update a user', async () => {
      const res = await request.put(`/user/${userID}`).send({
        email: 'test',
        password: 'password',
        list: ['one', 'two']
      });

      expect(res.body.email).toBe('test');
      expect(res.body).toHaveProperty('list');
    });

    it('should error', async () => {
      const res = await request.get('/user');
      expect(res.status).toBe(404);
    });

    // it('should error by email', async () => {
    //   const res = await request.get('/user/testnotindb');
    //   expect(res.status).toBe(404);
    // });

  });

  describe('/list', () => {
    let listID = '';
    it('should create a new list', async () => {
      const res = await request.post('/list').send({
        name: 'test',
        creator: 'test',
        members: ['testmember'],
      });

      listID = res.body._id;

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('test');
    });

    it('should get list by member', async () => {
      const res = await request.get('/list/testmember');
      
      expect(res.status).toBe(200);
      expect(res.body[0].name).toBe('test');
    });

    it('should delete a list', async () => {
      const res = await request.delete(`/list/${listID}`);
      expect(res.status).toBe(200);
    });

    // it('should error by member', async () => {
    //   const res = await request.get('/list/testnotindb');
    //   expect(res.status).toBe(404);
    // });

  });

  describe('/pantry', () => {
    let pantryID = '';
    it('should create a new pantry', async () => {
      const res = await request.post('/pantry').send({
        name: 'test',
        creator: 'test',
        members: ['testmember'],
      });

      pantryID = res.body._id;

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('test');
    });

    it('should get pantry by member', async () => {
      const res = await request.get('/pantry/testmember');
      
      expect(res.status).toBe(200);
      expect(res.body[0].name).toBe('test');
    });

    it('should delete a pantry', async () => {
      const res = await request.delete(`/pantry/${pantryID}`);
      expect(res.status).toBe(200);
    });

  });

  describe('/products', () => {
    it('should get product by upc', async () => {
      const res = await request.get('/products/811445020290');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('SearchResult');
    });
  });


});
