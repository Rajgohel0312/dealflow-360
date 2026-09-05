import cpeak, { cors, parseJSON } from "cpeak";

import appConfig from "./config/app.js";

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

app.beforeEach(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.beforeEach((req, res, next) => {
  console.log("Request URL:", req.url);
  console.log("Request Method:", req.method);
  next();
});

app.route("GET", "/health", (req, res) => {
  return res.json({
    message: "ok",
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