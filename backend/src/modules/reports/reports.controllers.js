import * as reportService from "./reports.services.js";

export const getExecutiveDashboard = async (req, res) => {
  const [sales, revenue, discounts, inventory, fulfillment] = await Promise.all([
    reportService.getSalesReport(),
    reportService.getRevenueReport(),
    reportService.getDiscountReport(),
    reportService.getInventoryReport(),
    reportService.getFulfillmentReport(),
  ]);

  return res.status(200).json({
    success: true,
    reports: {
      sales,
      revenue,
      discounts,
      inventory,
      fulfillment,
    },
  });
};
