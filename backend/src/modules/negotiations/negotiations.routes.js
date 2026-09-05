import {
  createNegotiation, submitNegotiation, approveNegotiation,
  rejectNegotiation, getNegotiationsByQuotation, getNegotiationById,
} from "./negotiations.controllers.js";
import { validate } from "../../middleware/validate.js";
import { createNegotiationSchema } from "./negotiations.validations.js";
import { authenticateEmployee, authenticateAnyUser, authorize } from "../../middleware/auth.middleware.js";

const APPROVAL = ["Admin", "Manager", "Finance"];

export default function negotiationRoutes(app, prefix) {
  app.route("POST", `${prefix}/quotations/:id/negotiations`,    authenticateAnyUser, validate(createNegotiationSchema), createNegotiation);
  app.route("GET",  `${prefix}/quotations/:id/negotiations`,    authenticateAnyUser, getNegotiationsByQuotation);
  app.route("GET",  `${prefix}/negotiations/:id`,               authenticateAnyUser, getNegotiationById);
  app.route("POST", `${prefix}/negotiations/:id/submit`,        authenticateAnyUser, submitNegotiation);
  app.route("POST", `${prefix}/negotiations/:id/approve`,       authenticateEmployee, authorize(...APPROVAL), approveNegotiation);
  app.route("POST", `${prefix}/negotiations/:id/reject`,        authenticateEmployee, authorize(...APPROVAL), rejectNegotiation);
}
