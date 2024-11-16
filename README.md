## Environment

- Node.js: > v18.18.0
- NPM: >= 9.8.1

# Running the project

1. Install dependencies: `npm install`
2. cp .env.example .env
3. Update DB_USERNAME, DB_PASSWORD in .env
4. Run the project: `npm run start:dev`

## Swagger Endpoints

- /api

## API Endpoints

1. Create a new product

- [POST] /product

2. Get all products by code/location. Get all products with query

- [GET] /product?code=

3. Get a product by id

- [GET] /product/:id

4. Update all the products by code

- [PUT] /product?code=

5. Update a product by id

- [PUT] /product/:id

6. Delete all the products by code

- [DELETE] /product?code=

7. Delete a product by id

- [DELETE] /product/:id

## Running the tests

1. `npm run test`

## Cache

1. Get all the products from cache

- [GET] /products
- [GET] /products/:id
