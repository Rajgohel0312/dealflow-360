import cpeak, { cors, parseJSON } from "cpeak";

import appConfig from "./config/app.js";
import { isConnected } from "./infrastructure/database/database.js";
import { isRedisReady } from "./infrastructure/redis/redis.client.js";
import { rateLimiter } from "./middleware/rateLimiter.middleware.js";

import authRoutes from "./modules/auth/auth.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import customerRoutes from "./modules/customers/customers.routes.js";
import categoryRoutes from "./modules/categories/categories.routes.js";
import productRoutes from "./modules/products/products.routes.js";
import priceListRoutes from "./modules/price_lists/price_lists.routes.js";
import discountRoutes from "./modules/discounts/discounts.routes.js";
import quotationRoutes from "./modules/quotations/quotations.routes.js";
import orderRoutes from "./modules/orders/orders.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js";
import fulfillmentRoutes from "./modules/fulfillment/fulfillment.routes.js";
import invoiceRoutes from "./modules/invoices/invoices.routes.js";
import paymentRoutes from "./modules/payments/payments.routes.js";
import negotiationRoutes from "./modules/negotiations/negotiations.routes.js";
import upsellRoutes from "./modules/upsell/upsell.routes.js";
import dealHealthRoutes from "./modules/dealHealth/dealHealth.routes.js";
import reportRoutes from "./modules/reports/reports.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = cpeak();

// 1. CORS Configuration
app.beforeEach(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// 2. Security Headers Middleware
app.beforeEach((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// 3. Logger Middleware
app.beforeEach((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// 4. Global Rate Limiter
app.beforeEach(rateLimiter({ windowSec: 60, max: 120, keyPrefix: 'global' }));

// 5. System Health Check Endpoint
app.route("GET", "/health", async (req, res) => {
  const dbStatus = await isConnected();
  const redisStatus = isRedisReady();

  return res.json({
    status: dbStatus ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus ? "connected" : "disconnected",
      redis: redisStatus ? "ready" : "offline_fallback",
    },
    system: {
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  });
});

app.beforeEach(parseJSON());

authRoutes(app, appConfig.api.prefix);
adminRoutes(app, appConfig.api.prefix);
customerRoutes(app, appConfig.api.prefix);
categoryRoutes(app, appConfig.api.prefix);
productRoutes(app, appConfig.api.prefix);
priceListRoutes(app, appConfig.api.prefix);
discountRoutes(app, appConfig.api.prefix);
quotationRoutes(app, appConfig.api.prefix);
orderRoutes(app, appConfig.api.prefix);
inventoryRoutes(app, appConfig.api.prefix);
fulfillmentRoutes(app, appConfig.api.prefix);
invoiceRoutes(app, appConfig.api.prefix);
paymentRoutes(app, appConfig.api.prefix);
negotiationRoutes(app, appConfig.api.prefix);
upsellRoutes(app, appConfig.api.prefix);
dealHealthRoutes(app, appConfig.api.prefix);
reportRoutes(app, appConfig.api.prefix);
dashboardRoutes(app, appConfig.api.prefix);

errorMiddleware(app);

export default app;