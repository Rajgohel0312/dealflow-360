import * as orderService from "./orders.services.js";

export const convertQuotationToOrder = async (req, res) => {
  const { quotationId } = req.params;
  const order = await orderService.convertQuotationToOrder(
    quotationId,
    req.user.id,
    req.user.role_id
  );

  return res.status(201).json({
    success: true,
    message: "Quotation converted to Sales Order successfully",
    order,
  });
};

export const getOrders = async (req, res) => {
  const filters = {
    customer_id: req.query.customer_id,
    status: req.query.status,
  };

  const orders = await orderService.getAllOrders(
    req.user.id,
    req.user.role_id,
    filters
  );

  return res.status(200).json({
    success: true,
    orders,
  });
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  const order = await orderService.getOrderById(id);

  return res.status(200).json({
    success: true,
    order,
  });
};
