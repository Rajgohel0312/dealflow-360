import * as quotationService from "./quotations.services.js";

export const createQuotation = async (req, res) => {
  const quotation = await quotationService.createQuotation(
    req.user.id,
    req.user.role_id,
    req.body
  );

  return res.status(201).json({
    success: true,
    message: "Quotation draft created successfully",
    quotation,
  });
};

export const getQuotations = async (req, res) => {
  const filters = {
    customer_id: req.query.customer_id,
    status: req.query.status,
  };

  const quotations = await quotationService.getQuotations(
    req.user.id,
    req.user.role_id,
    filters
  );

  return res.status(200).json({
    success: true,
    quotations,
  });
};

export const getQuotationById = async (req, res) => {
  const { id } = req.params;
  const quotation = await quotationService.getQuotationById(id);

  return res.status(200).json({
    success: true,
    quotation,
  });
};

export const updateQuotation = async (req, res) => {
  const { id } = req.params;
  const updatedQuotation = await quotationService.updateQuotation(
    id,
    req.user.id,
    req.user.role_id,
    req.body
  );

  return res.status(200).json({
    success: true,
    message: "Quotation draft updated successfully",
    quotation: updatedQuotation,
  });
};

export const addQuotationItem = async (req, res) => {
  const { id } = req.params;
  const item = await quotationService.addQuotationItem(
    id,
    req.user.id,
    req.user.role_id,
    req.body
  );

  return res.status(201).json({
    success: true,
    message: "Item added to quotation successfully",
    item,
  });
};

export const updateQuotationItem = async (req, res) => {
  const { id, itemId } = req.params;
  const updatedItem = await quotationService.updateQuotationItem(
    id,
    itemId,
    req.user.id,
    req.user.role_id,
    req.body
  );

  return res.status(200).json({
    success: true,
    message: "Quotation item updated successfully",
    item: updatedItem,
  });
};

export const deleteQuotationItem = async (req, res) => {
  const { id, itemId } = req.params;
  await quotationService.deleteQuotationItem(
    id,
    itemId,
    req.user.id,
    req.user.role_id
  );

  return res.status(200).json({
    success: true,
    message: "Quotation item deleted successfully",
  });
};

export const submitQuotation = async (req, res) => {
  const { id } = req.params;
  const result = await quotationService.submitQuotation(
    id,
    req.user.id,
    req.user.role_id
  );

  return res.status(200).json({
    success: true,
    ...result,
  });
};

export const getPendingApprovals = async (req, res) => {
  const approvals = await quotationService.getPendingApprovals();

  return res.status(200).json({
    success: true,
    approvals,
  });
};

export const approveQuotation = async (req, res) => {
  const { id } = req.params;
  const result = await quotationService.approveQuotation(
    id,
    req.user.id,
    req.body
  );

  return res.status(200).json({
    success: true,
    ...result,
  });
};

export const rejectQuotation = async (req, res) => {
  const { id } = req.params;
  const result = await quotationService.rejectQuotation(
    id,
    req.user.id,
    req.body
  );

  return res.status(200).json({
    success: true,
    ...result,
  });
};
