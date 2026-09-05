import * as paymentRepo from "./payments.repository.js";
import { findInvoiceById, updateInvoice } from "../invoices/invoices.repository.js";
import AppError from "../../shared/errors/AppError.js";

export const recordPayment = async (invoiceId, data) => {
  const invoice = await findInvoiceById(invoiceId);
  if (!invoice) {
    throw new AppError("Invoice not found", 404);
  }

  if (invoice.status === "DRAFT") {
    throw new AppError("Cannot record payment for a DRAFT invoice. Please issue invoice first.", 400);
  }

  if (invoice.status === "PAID") {
    throw new AppError("Invoice has already been fully paid.", 400);
  }

  const paymentAmount = Number(data.amount);
  if (paymentAmount <= 0) {
    throw new AppError("Payment amount must be greater than 0.", 400);
  }

  const currentDue = Number(invoice.amount_due);
  if (paymentAmount > currentDue) {
    throw new AppError(
      `Payment amount (₹${paymentAmount}) exceeds outstanding invoice balance (₹${currentDue}).`,
      400
    );
  }

  const newPaid = Number(invoice.amount_paid) + paymentAmount;
  const newDue = currentDue - paymentAmount;
  const newStatus = newDue <= 0.01 ? "PAID" : "PARTIALLY_PAID";

  const payment = await paymentRepo.createPayment({
    invoice_id: invoiceId,
    customer_id: invoice.customer_id,
    amount: paymentAmount,
    payment_method: data.payment_method || "BANK_TRANSFER",
    transaction_reference: data.transaction_reference || `TXN-${Date.now()}`,
    status: "SUCCESS",
    paid_at: new Date(),
  });

  await updateInvoice(invoiceId, {
    amount_paid: newPaid,
    amount_due: newDue <= 0.01 ? 0 : newDue,
    status: newStatus,
    paid_at: newStatus === "PAID" ? new Date() : invoice.paid_at,
  });

  return {
    payment,
    updated_invoice: await findInvoiceById(invoiceId),
  };
};

export const getPaymentsByInvoice = async (invoiceId) => {
  return paymentRepo.findPaymentsByInvoiceId(invoiceId);
};

export const getPaymentById = async (id) => {
  const payment = await paymentRepo.findPaymentById(id);
  if (!payment) {
    throw new AppError("Payment transaction not found", 404);
  }
  return payment;
};
