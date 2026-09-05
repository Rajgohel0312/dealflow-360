import * as fulfillmentService from "./fulfillment.services.js";

export const createFulfillmentForOrder = async (req, res) => {
  const { orderId } = req.params;
  const { warehouse_id } = req.body;

  const fulfillment = await fulfillmentService.createFulfillmentForOrder(
    orderId,
    warehouse_id
  );

  return res.status(201).json({
    success: true,
    message: "Fulfillment pipeline created and inventory stock reserved successfully",
    fulfillment,
  });
};

export const getFulfillments = async (req, res) => {
  const filters = {
    status: req.query.status,
    warehouse_id: req.query.warehouse_id,
  };

  const fulfillments = await fulfillmentService.getFulfillments(filters);

  return res.status(200).json({
    success: true,
    fulfillments,
  });
};

export const getFulfillmentById = async (req, res) => {
  const { id } = req.params;
  const fulfillment = await fulfillmentService.getFulfillmentById(id);

  return res.status(200).json({
    success: true,
    fulfillment,
  });
};

export const pickFulfillment = async (req, res) => {
  const { id } = req.params;
  const updated = await fulfillmentService.pickFulfillment(id);

  return res.status(200).json({
    success: true,
    message: "Items picked from warehouse",
    fulfillment: updated,
  });
};

export const packFulfillment = async (req, res) => {
  const { id } = req.params;
  const updated = await fulfillmentService.packFulfillment(id);

  return res.status(200).json({
    success: true,
    message: "Parcel packed successfully",
    fulfillment: updated,
  });
};

export const shipFulfillment = async (req, res) => {
  const { id } = req.params;
  const { tracking_number } = req.body;

  const updated = await fulfillmentService.shipFulfillment(id, tracking_number);

  return res.status(200).json({
    success: true,
    message: "Parcel shipped successfully",
    fulfillment: updated,
  });
};

export const deliverFulfillment = async (req, res) => {
  const { id } = req.params;
  const result = await fulfillmentService.deliverFulfillment(id);

  return res.status(200).json({
    success: true,
    ...result,
  });
};
