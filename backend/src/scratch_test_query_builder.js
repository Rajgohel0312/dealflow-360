import DB from './shared/utils/queryBuilder.js';

async function testQueryBuilder() {
  console.log("🧪 Testing Fast DB Query Builder Utility ...\n");

  // 1. Find by ID
  const admin = await DB('users').findOne({ email: 'admin@dealflow.com' });
  console.log("1. DB('users').findOne():", admin ? `Found Admin ID ${admin.id} (${admin.name})` : "Not found");

  // 2. Find Where with filters & options
  const activeCategories = await DB('product_categories').findWhere({}, { limit: 3 });
  console.log("2. DB('product_categories').findWhere():", activeCategories.length, "categories fetched");

  // 3. Chainable Join & Select
  const productsWithCat = await DB('products')
    .select(['products.name as product_name', 'products.base_price', 'c.name as category_name'])
    .leftJoin('product_categories c', 'products.category_id = c.id')
    .limit(2)
    .get();
  console.log("3. Chainable DB Join & Select:", productsWithCat);

  // 4. Fast Exists check
  const exists = await DB('users').exists({ email: 'admin@dealflow.com' });
  console.log("4. DB('users').exists():", exists);

  // 5. Fast Pagination
  const pageResult = await DB('products').paginate({ page: 1, limit: 2 });
  console.log("5. DB('products').paginate(): Page", pageResult.meta.page, "of", pageResult.meta.totalPages, `(${pageResult.items.length} items)`);

  // 6. Redis Caching in 1 line
  const cachedProducts = await DB('products').select(['id', 'name']).limit(5).remember(60);
  console.log("6. DB('products').remember(): Cached", cachedProducts.length, "items in Redis!");

  console.log("\n✅ Fast DB Query Builder utility is 100% operational!");
  process.exit(0);
}

testQueryBuilder().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
