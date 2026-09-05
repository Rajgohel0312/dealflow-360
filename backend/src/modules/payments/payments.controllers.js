import * as paymentService from "./payments.services.js";

export const recordPayment = async (req, res) => {
  const { invoiceId } = req.params;
  const result = await paymentService.recordPayment(invoiceId, req.body);

  return res.status(201).json({
    success: true,
    message: "Payment transaction recorded successfully",
    ...result,
  });
};

export const getPaymentsByInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  const payments = await paymentService.getPaymentsByInvoice(invoiceId);

  return res.status(200).json({
    success: true,
    payments,
  });
};

export const getPaymentById = async (req, res) => {
  const { id } = req.params;
  const payment = await paymentService.getPaymentById(id);

  return res.status(200).json({
    success: true,
    payment,
  });
};
