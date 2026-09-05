import * as negService from "./negotiations.services.js";

export const createNegotiation = async (req, res) => {
  const { id } = req.params; // quotationId
  const negotiation = await negService.createNegotiation(id, req.user, req.body);

  return res.status(201).json({
    success: true,
    message: "Negotiation request created successfully",
    negotiation,
  });
};

export const submitNegotiation = async (req, res) => {
  const { id } = req.params;
  const result = await negService.submitNegotiation(id);

  return res.status(200).json({
    success: true,
    message: "Negotiation submitted to Risk & Approval Engine",
    ...result,
  });
};

export const approveNegotiation = async (req, res) => {
  const { id } = req.params;
  const negotiation = await negService.approveNegotiation(id, req.body?.comments);

  return res.status(200).json({
    success: true,
    message: "Negotiation terms approved",
    negotiation,
  });
};

export const rejectNegotiation = async (req, res) => {
  const { id } = req.params;
  const negotiation = await negService.rejectNegotiation(id, req.body?.comments);

  return res.status(200).json({
    success: true,
    message: "Negotiation terms rejected",
    negotiation,
  });
};

export const getNegotiationsByQuotation = async (req, res) => {
  const { id } = req.params;
  const negotiations = await negService.getNegotiationsByQuotation(id);

  return res.status(200).json({
    success: true,
    negotiations,
  });
};

export const getNegotiationById = async (req, res) => {
  const { id } = req.params;
  const negotiation = await negService.getNegotiationById(id);

  return res.status(200).json({
    success: true,
    negotiation,
  });
};
