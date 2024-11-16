# Running the project

1. Install dependencies: `npm install`
2. Create a `.env` file
3. cp .env.example .env
4. Update DB_USERNAME, DB_PASSWORD in .env
5. Run the project: `npm run start:dev`

## Endpoints

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

## Cache

1. Get all the products from cache

- [GET] /products
- [GET] /products/:id
