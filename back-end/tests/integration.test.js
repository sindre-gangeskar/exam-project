
const request = require('supertest');
const app = require('../app');

var token;
var categoryId;
var brandId;
var productId;
var time;

const db = require('../models');

afterAll(async () => {
  /*  
  Close the database's connection after all testing is done - it allows jest to properly exit after all testing is finished - 
  and prevents jest from leaving open handles
  */
  await db.sequelize.close();
})

describe('testing-auth-route', () => {
  test('POST /login - admin (success)', async () => {
    const body = { username: 'Admin', password: 'P@ssword2023' };
    const response = await request(app).post('/auth/login').send(body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data.token');
    expect(response.body).toHaveProperty('data.result', 'Login successful!')
    expect(response.body).toHaveProperty('status', 'success')
    token = response.body.data.token;
  })
  test('POST /login - admin (fail)', async () => {
    const body = { username: 'Admin', password: 'incorrectPassword123' };
    const response = await request(app).post('/auth/login').send(body);
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('data.result', 'Invalid credentials, please try again')
    expect(response.body).toHaveProperty('status', 'fail')
  })
})

describe('testing-category-route', () => {
  test('POST /categories - login required', async () => {
    const body = { name: 'TEST_CATEGORY' };
    const response = await request(app).post('/categories').send(body);
    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('data.result', 'Login required');
  })
  test('POST /categories - success - CA Requirement Step 1. ( Add a category with the name TEST_CATEGORY )', async () => {
    const body = { name: 'TEST_CATEGORY' };
    const response = await request(app).post('/categories').send(body).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data.result', 'Successfully created category');
  })
  test('POST /categories - fail', async () => {
    const body = { name: 'TEST_CATEGORY' };
    const response = await request(app).post('/categories').send(body).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(409);
    expect(response.body).toHaveProperty('data.result', 'Cannot create category - A category with provided category name already exists');
  })
  test('GET /categories - success', async () => {
    const response = await request(app).get('/categories').set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data.categories');
    categoryId = response.body.data.categories.find(x => x.name === 'TEST_CATEGORY').id;
  })
})

describe('testing-brand-route', () => {
  test('POST /brands - success - CA Requirement Step 2. ( Add a brand with the name TEST_BRAND )', async () => {
    const body = { name: 'TEST_BRAND' };
    const response = await request(app).post('/brands').send(body).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data.result', 'Successfully created brand');
  })
  test('POST /brands - fail', async () => {
    const body = { name: 'TEST_BRAND' };
    const response = await request(app).post('/brands').send(body).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(409);
    expect(response.body).toHaveProperty('data.result', 'Brand with provided name already exists');
  })
  test('GET /brands - success', async () => {
    const response = await request(app).get('/brands').set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data.result', 'Successfully found brands');
    expect(response.body).toHaveProperty('data.brands');
    brandId = response.body.data.brands.find(x => x.name === 'TEST_BRAND').id;
  })
})

describe('testing-product-route', () => {
  test('POST /products - success - CA Requirement Step 3. ( Add a product with the name TEST_PRODUCT, brand must be TEST_BRAND, and category must be TEST_CATEGORY, quantity 10, price 99.99 )', async () => {
    const body = { name: 'TEST_PRODUCT', description: 'TEST_PRODUCT DESCRIPTION', unitprice: 99.99, quantity: 10, BrandId: brandId, CategoryId: categoryId, imgurl: '' };
    time = new Date().toISOString();
    const response = await request(app).post('/products').send(body).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data.result', 'Successfully created product');
  })
  test('POST /products/search - success - CA Requirement Step 4. ( Get the newly created TEST_PRODUCT with all the information, including category and brand name )', async () => {
    const body = { search: 'TEST_PRODUCT' };
    const response = await request(app).post('/products/search').send(body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data.result', 'Successfully found products');
    productId = response.body.data.products.find(x => x.name === 'TEST_PRODUCT').id;

    expect(response.body.data.products).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "id": productId,
          "name": "TEST_PRODUCT",
          "description": "TEST_PRODUCT DESCRIPTION",
          "quantity": 10,
          "unitprice": 99.99,
          "isdeleted": 0,
          "imgurl": "",
          "date_added": expect.any(String),
          "createdAt": expect.any(String),
          "updatedAt": expect.any(String),
          "BrandId": brandId,
          "CategoryId": categoryId,
          "brand": "TEST_BRAND",
          "category": "TEST_CATEGORY"
        })
      ]
      ))
  })
})

describe('testing-update-routes', () => {
  test('PUT /categories/:id - success - CA Requirement Step 5. ( Change the category name TEST_CATEGORY to TEST_CATEGORY2 )', async () => {
    const body = { name: 'TEST_CATEGORY2' };
    const response = await request(app).put(`/categories/${categoryId}`).send(body).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data.result', 'Successfully updated category');
  })
  test('PUT /categories/:id - fail', async () => {
    const body = { name: 'TEST_CATEGORY2' };
    const response = await request(app).put(`/categories/doesNotExist`).send(body).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('data.result', 'Cannot update category - Category with provided id does not exist');
  })
  test('PUT /brands/:id - success - CA Requirement Step 6 ( Change the brand name TEST_BRAND to TEST_BRAND2 )', async () => {
    const body = { name: 'TEST_BRAND2' };
    const response = await request(app).put(`/brands/${brandId}`).send(body).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data.result', 'Successfully updated brand');
  })
  test('PUT /brands/:id - fail', async () => {
    const body = { name: 'TEST_BRAND2' };
    const response = await request(app).put(`/brands/doesNotExist`).send(body).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('data.result', 'Cannot update brand - Brand with provided id does not exist');
  })

})

describe('testing-product-route-after-updates', () => {
  test('POST /products/search/TEST_PRODUCT - success - CA Requirement Step 7. ( Get the category TEST_PRODUCT with all the information, including the category and brand name. )', async () => {
    const body = { search: 'TEST_PRODUCT' };
    const response = await request(app).post('/products/search').send(body);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data.result', 'Successfully found products');
    productId = response.body.data.products.find(x => x.name === 'TEST_PRODUCT').id;
    expect(response.body.data.products).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "id": productId,
          "name": "TEST_PRODUCT",
          "description": "TEST_PRODUCT DESCRIPTION",
          "quantity": 10,
          "unitprice": 99.99,
          "isdeleted": 0,
          "imgurl": "",
          "date_added": expect.any(String),
          "createdAt": expect.any(String),
          "updatedAt": expect.any(String),
          "BrandId": brandId,
          "CategoryId": categoryId,
          "brand": "TEST_BRAND2",
          "category": "TEST_CATEGORY2"
        })
      ])
    )
    productId = response.body.data.products.find(x => x.name === 'TEST_PRODUCT').id;
  })

  test('DELETE /products/:id - success - CA Requirement Step 8. ( Delete the TEST_PRODUCT )', async () => {
    const response = await request(app).delete(`/products/${productId}`).set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data.result', 'Successfully deleted product');
  })
})

