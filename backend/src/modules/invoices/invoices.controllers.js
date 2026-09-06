import * as invoiceService from "./invoices.services.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

export const createInvoiceFromOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const invoice = await invoiceService.createInvoiceFromOrder(orderId);

  return res.status(201).json({
    success: true,
    message: "Invoice created successfully from Sales Order",
    invoice,
  });
});

export const getInvoices = asyncHandler(async (req, res) => {
  const filters = {
    customer_id: req.query.customer_id,
    status: req.query.status,
  };

  const invoices = await invoiceService.getInvoices(filters);

  return res.status(200).json({
    success: true,
    invoices,
  });
});

export const getInvoiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const invoice = await invoiceService.getInvoiceById(id);

  return res.status(200).json({
    success: true,
    invoice,
  });
});

export const issueInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const invoice = await invoiceService.issueInvoice(id);

  return res.status(200).json({
    success: true,
    message: "Invoice issued successfully",
    invoice,
  });
});

export const sendInvoiceEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { recipientEmail } = req.body || {};
  const result = await invoiceService.sendInvoiceEmailToCustomer(id, recipientEmail);

  return res.status(200).json({
    success: true,
    message: result.message,
    data: result,
  });
});
