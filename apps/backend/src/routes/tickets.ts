import { Router } from "express";
import { TicketController } from "../controllers/ticketController";

const router = Router();

// Ticket routes
router.get("/", TicketController.getTickets);
router.get("/stats", TicketController.getWorkflowStats);

// Ticket submission (must come before /:id routes)
router.post("/", TicketController.submitTicket);

// Ticket actions
router.get("/:id", TicketController.getTicket);
router.get("/:id/enhanced", TicketController.getEnhancedTicket);
router.post("/:id/classify", TicketController.classifyTicket);
router.post("/:id/generateDraft", TicketController.generateDraft);
router.put("/:id/approve", TicketController.approveTicket);
router.put("/:id/escalate", TicketController.escalateTicket);
router.put("/:id/edit", TicketController.updateDraft);

export default router;
