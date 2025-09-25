import { ticketRepository } from "../repositories/ticketRepository";
import { openai } from "../utils/openai";
import logger from "../utils/logger";

const mockTickets = [
  {
    customerName: "John Smith",
    email: "john.smith@example.com",
    subject: "Refund Request for Order #12345",
    body: "Hi, I would like to request a refund for my recent order #12345. The product arrived damaged and I would like to return it. Please let me know the process for getting my money back.",
    category: "Refund",
  },
  // {
  //   customerName: "Sarah Johnson",
  //   email: "sarah.j@example.com",
  //   subject: "Payment Failed - Need Help",
  //   body: "I tried to make a payment but it keeps failing. My card is working fine elsewhere. Can you help me troubleshoot this payment issue?",
  //   category: "Payment Failure",
  // },
  // {
  //   customerName: "Mike Davis",
  //   email: "mike.davis@company.com",
  //   subject: "Invoice Request for Q1 2024",
  //   body: "Could you please send me an invoice for our Q1 2024 services? I need it for our accounting records. Thanks!",
  //   category: "Invoice",
  // },
  // {
  //   customerName: "Lisa Chen",
  //   email: "lisa.chen@startup.io",
  //   subject: "Can't Login to My Account",
  //   body: "I'm having trouble logging into my account. I keep getting an error message. Can you help me reset my password or troubleshoot this issue?",
  //   category: "Technical Issue",
  // },
  // {
  //   customerName: "Robert Wilson",
  //   email: "rob.wilson@email.com",
  //   subject: "Update My Billing Address",
  //   body: "I recently moved and need to update my billing address. How can I do this in my account settings?",
  //   category: "Account",
  // },
  // {
  //   customerName: "Emily Brown",
  //   email: "emily.brown@corp.com",
  //   subject: "Feature Request - Dark Mode",
  //   body: "I love your platform but would really appreciate a dark mode option. It would be much easier on the eyes during late night work sessions.",
  //   category: "Technical Issue",
  // },
  // {
  //   customerName: "David Lee",
  //   email: "david.lee@business.net",
  //   subject: "Refund for Duplicate Charge",
  //   body: "I noticed I was charged twice for the same service. Can you please refund the duplicate charge? Transaction ID: TXN789456",
  //   category: "Refund",
  // },
  // {
  //   customerName: "Jennifer Garcia",
  //   email: "jen.garcia@freelance.com",
  //   subject: "Payment Method Update",
  //   body: "I need to update my payment method. My old card expired and I have a new one. How do I update this in my account?",
  //   category: "Account",
  // },
  // {
  //   customerName: "Thomas Anderson",
  //   email: "thomas.a@tech.com",
  //   subject: "API Integration Issue",
  //   body: "I'm having trouble with the API integration. Getting 500 errors when trying to authenticate. Can you help me debug this?",
  //   category: "Technical Issue",
  // },
  // {
  //   customerName: "Amanda White",
  //   email: "amanda.white@agency.com",
  //   subject: "Bulk Invoice Download",
  //   body: "Is there a way to download all invoices for the past year in bulk? I need them for our annual audit.",
  //   category: "Invoice",
  // },
  // {
  //   customerName: "Kevin Martinez",
  //   email: "kevin.m@consulting.com",
  //   subject: "Subscription Cancellation",
  //   body: "I need to cancel my subscription. Can you help me with the cancellation process and confirm when it will take effect?",
  //   category: "Account",
  // },
  // {
  //   customerName: "Rachel Green",
  //   email: "rachel.green@design.com",
  //   subject: "Payment Declined - Need Alternative",
  //   body: "My payment was declined. I have other payment methods available. How can I update my payment information?",
  //   category: "Payment Failure",
  // },
  // {
  //   customerName: "Christopher Taylor",
  //   email: "chris.taylor@startup.com",
  //   subject: "Data Export Request",
  //   body: "I need to export all my data from the platform. Is there a way to do this? I need it in CSV format if possible.",
  //   category: "General",
  // },
  // {
  //   customerName: "Michelle Rodriguez",
  //   email: "michelle.r@enterprise.com",
  //   subject: "Team Member Access Issue",
  //   body: "One of my team members can't access the shared workspace. I've added them but they're still getting permission denied errors.",
  //   category: "Technical Issue",
  // },
  // {
  //   customerName: "James Thompson",
  //   email: "james.t@retail.com",
  //   subject: "Partial Refund for Defective Item",
  //   body: "I received a defective item and would like a partial refund. The item works but has cosmetic damage. Can we work something out?",
  //   category: "Refund",
  // },
  // {
  //   customerName: "Nicole Clark",
  //   email: "nicole.clark@marketing.com",
  //   subject: "Billing Cycle Change",
  //   body: "I want to change my billing cycle from monthly to annual. How do I do this and will I get a discount?",
  //   category: "Account",
  // },
  // {
  //   customerName: "Daniel Lewis",
  //   email: "daniel.lewis@finance.com",
  //   subject: "Tax Document Request",
  //   body: "I need tax documents for the past year. Can you provide me with the necessary forms for tax purposes?",
  //   category: "Invoice",
  // },
  // {
  //   customerName: "Stephanie Hall",
  //   email: "steph.hall@creative.com",
  //   subject: "Mobile App Not Working",
  //   body: "The mobile app keeps crashing when I try to upload files. I've tried reinstalling but the issue persists. Help!",
  //   category: "Technical Issue",
  // },
  // {
  //   customerName: "Andrew Young",
  //   email: "andrew.young@consulting.com",
  //   subject: "General Feedback and Suggestions",
  //   body: "I've been using your platform for 6 months now and love it! Just wanted to share some feedback and suggestions for future improvements.",
  //   category: "General",
  // },
  // {
  //   customerName: "Jessica King",
  //   email: "jessica.king@agency.com",
  //   subject: "Payment Plan Request",
  //   body: "I'm interested in setting up a payment plan for the annual subscription. Do you offer installment options?",
  //   category: "Payment Failure",
  // },
];

async function seedEmails() {
  try {
    logger.info("Starting email seeding process...");

    for (const ticketData of mockTickets) {
      try {
        // Generate embedding for the ticket content
        const ticketContent = `${ticketData.subject}\n\n${ticketData.body}`;
        const embedding = await openai.generateEmbedding(ticketContent);

        const createdTicket = await ticketRepository.create({
          ...ticketData,
          embedding,
        });
        console.log(`Ticket created successfully:`, createdTicket);

        logger.info(`Created ticket for ${ticketData.customerName}`, {
          subject: ticketData.subject,
          category: ticketData.category,
        });

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(
          `Failed to create ticket for ${ticketData.customerName}:`,
          error
        );
        logger.error(`Failed to create ticket for ${ticketData.customerName}`, {
          error,
          subject: ticketData.subject,
        });
      }
    }

    logger.info("Email seeding completed successfully!");
  } catch (error) {
    logger.error("Failed to seed emails", { error });
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedEmails()
    .then(() => {
      console.log("Seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export default seedEmails;
