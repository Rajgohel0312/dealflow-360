import * as orderService from "./orders.services.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";

export const convertQuotationToOrder = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;
  const order = await orderService.convertQuotationToOrder(
    quotationId,
    req.user.id,
    req.user.role_name
  );

  return sendSuccess(res, { order }, "Quotation converted to Sales Order successfully", 201);
});

export const getOrders = asyncHandler(async (req, res) => {
  const filters = {
    customer_id: req.query.customer_id,
    status: req.query.status,
  };

  const orders = await orderService.getAllOrders(
    req.user.id,
    req.user.role_name,
    filters
  );

  return sendSuccess(res, { orders }, "Orders fetched successfully");
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await orderService.getOrderById(id);
  return sendSuccess(res, { order }, "Order fetched successfully");
});
