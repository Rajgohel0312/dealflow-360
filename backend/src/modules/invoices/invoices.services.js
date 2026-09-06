import * as invoiceRepo from "./invoices.repository.js";
import { findOrderById } from "../orders/orders.repository.js";
import AppError from "../../shared/errors/AppError.js";

export const createInvoiceFromOrder = async (orderId) => {
  const order = await findOrderById(orderId);
  if (!order) {
    throw new AppError("Sales Order not found", 404);
  }

  // Check duplicate invoice
  const existingInv = await invoiceRepo.findInvoiceByOrderId(orderId);
  if (existingInv) {
    return invoiceRepo.findInvoiceById(existingInv.id);
  }

  const invoiceNumber = await invoiceRepo.generateNextInvoiceNumber();

  // Due date: 30 days from creation
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const newInvoice = await invoiceRepo.createInvoice({
    invoice_number: invoiceNumber,
    order_id: order.id,
    customer_id: order.customer_id,
    status: "DRAFT",
    currency: order.currency || "INR",
    subtotal: Number(order.subtotal),
    discount_amount: Number(order.discount_amount),
    tax_amount: Number(order.tax_amount),
    total_amount: Number(order.total_amount),
    amount_paid: 0,
    amount_due: Number(order.total_amount),
    due_date: dueDate.toISOString().split("T")[0],
  });

  // Copy line items
  if (order.items && order.items.length > 0) {
    for (const item of order.items) {
      await invoiceRepo.createInvoiceItem({
        invoice_id: newInvoice.id,
        product_id: item.product_id,
        description: item.product_name,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        discount_percent: Number(item.discount_percent || 0),
        discount_amount: Number(item.discount_amount || 0),
        tax_rate: Number(item.tax_rate || 18),
        tax_amount: Number(item.tax_amount || 0),
        line_total: Number(item.line_total),
      });
    }
  }

  return invoiceRepo.findInvoiceById(newInvoice.id);
};

export const getInvoices = async (filters = {}) => {
  return invoiceRepo.findAllInvoices(filters);
};

export const getInvoiceById = async (id) => {
  const invoice = await invoiceRepo.findInvoiceById(id);
  if (!invoice) {
    throw new AppError("Invoice not found", 404);
  }
  return invoice;
};

export const issueInvoice = async (id) => {
  const invoice = await invoiceRepo.findInvoiceById(id);
  if (!invoice) {
    throw new AppError("Invoice not found", 404);
  }

  if (invoice.status !== "DRAFT") {
    throw new AppError(`Only DRAFT invoices can be issued. Current status: ${invoice.status}`, 400);
  }

  await invoiceRepo.updateInvoice(id, {
    status: "ISSUED",
    issued_at: new Date(),
  });

  return invoiceRepo.findInvoiceById(id);
};

export const sendInvoiceEmailToCustomer = async (id, recipientEmail = null) => {
  const invoice = await invoiceRepo.findInvoiceById(id);
  if (!invoice) {
    throw new AppError("Invoice not found", 404);
  }

  let recipientList = [];

  if (recipientEmail && recipientEmail !== "ALL") {
    recipientList = [recipientEmail.trim()];
  } else {
    // Collect recipient emails: Customer Company email + All Customer Users under this customer
    const recipientsSet = new Set();
    if (invoice.customer_email) {
      recipientsSet.add(invoice.customer_email.trim());
    }

    if (invoice.customer_id) {
      const { getCustomerUsers } = await import("../customers/customers.repository.js");
      const customerUsers = await getCustomerUsers(invoice.customer_id);
      if (customerUsers && customerUsers.length > 0) {
        for (const u of customerUsers) {
          if (u.email && u.is_active !== false) {
            recipientsSet.add(u.email.trim());
          }
        }
      }
    }

    recipientList = Array.from(recipientsSet);
  }

  if (recipientList.length === 0) {
    throw new AppError("No valid email addresses found to send this invoice", 400);
  }

  const portalUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/customer/login`;

  // Asynchronous background email dispatch for instant API response
  import("../../infrastructure/email/email.service.js").then(({ sendInvoiceEmail }) => {
    sendInvoiceEmail({
      customerName: invoice.customer_name || "Valued Customer",
      customerEmail: recipientList,
      invoiceNumber: invoice.invoice_number,
      orderNumber: invoice.order_number || "",
      issuedDate: invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString("en-IN") : new Date(invoice.created_at).toLocaleDateString("en-IN"),
      dueDate: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString("en-IN") : "Net 30 Days",
      items: invoice.items || [],
      subtotal: invoice.subtotal || 0,
      discountAmount: invoice.discount_amount || 0,
      taxAmount: invoice.tax_amount || 0,
      totalAmount: invoice.total_amount || 0,
      portalUrl,
    }).catch(err => console.error("❌ Background invoice email dispatch failed:", err.message));
  });

  return {
    message: `Commercial Invoice #${invoice.invoice_number} dispatch initiated to ${recipientList.join(", ")}`,
    recipients: recipientList,
    invoiceNumber: invoice.invoice_number,
  };
};
