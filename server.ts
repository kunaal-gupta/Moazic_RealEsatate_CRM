import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "LuxeCRM API is running" });
  });

  // Mock Database (In-memory for prototype)
  const db = {
    users: [
      { id: 'u1', fullName: 'Kunaal Gupta', email: 'kunaal@luxecrm.com', role: 'admin', status: 'active' },
      { id: 'u2', fullName: 'Jane Doe', email: 'jane@luxecrm.com', role: 'agent', status: 'active' }
    ],
    properties: [
      { 
        id: 'p1', 
        address: '123 Maple St', 
        community: 'Oak Ridge', 
        beds: 4, 
        baths: 3, 
        size: 2400, 
        price: 850000, 
        isOurInventory: true,
        builder: 'Luxury Homes Inc',
        yearBuilt: 2022,
        propertyClass: 'Residential',
        buildingType: 'Detached',
        style: 'Modern',
        model: 'The Grand',
        blockLot: 'B12-L4',
        legalPlan: 'PL-9988',
        occupancy: 'Vacant',
        condoFees: 0,
        flooring: 'Hardwood',
        appliancesIncluded: true,
        garageType: 'Double Attached',
        floors: 2,
        basement: 'Full',
        basementDev: 'Finished',
        separateEntrance: true,
        notes: 'Beautiful backyard with a large deck. Recently painted interior.',
        addedDate: new Date().toISOString()
      },
      { 
        id: 'p2', 
        address: '456 Pine Ave', 
        community: 'Pine Valley', 
        beds: 3, 
        baths: 2, 
        size: 1800, 
        price: 620000, 
        isOurInventory: true,
        builder: 'Classic Builds',
        yearBuilt: 2018,
        propertyClass: 'Residential',
        buildingType: 'Semi-Detached',
        style: 'Craftsman',
        model: 'The Cozy',
        blockLot: 'A5-L2',
        legalPlan: 'PL-7766',
        occupancy: 'Owner Occupied',
        condoFees: 150,
        flooring: 'Laminate',
        appliancesIncluded: true,
        garageType: 'Single Detached',
        floors: 1,
        basement: 'Partial',
        basementDev: 'Unfinished',
        separateEntrance: false,
        notes: 'Great location near schools. Needs some minor kitchen updates.',
        addedDate: new Date().toISOString()
      }
    ],
    contacts: [
      { id: 'c1', fullName: 'John Smith', email: 'john@example.com', type: 'buyer', phoneNumber: '555-0101', company: 'Smith Co', assignedTo: 'u2', createdBy: 'u1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'c2', fullName: 'Sarah Johnson', email: 'sarah@example.com', type: 'seller', phoneNumber: '555-0102', company: 'Johnson Realty', assignedTo: 'u2', createdBy: 'u1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    deals: [
      { id: 'd1', propertyIds: ['p1'], stageId: '1', value: 850000, contactIds: ['c1'], notes: 'Interested in early possession.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'd2', propertyIds: ['p2'], stageId: '2', value: 620000, contactIds: ['c2'], notes: 'Needs to confirm financing.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    activities: [
      { id: 'a1', description: 'Initial call with John Smith', type: 'call', createdAt: new Date().toISOString() },
      { id: 'a2', description: 'Property viewing scheduled for Pine Ave', type: 'meeting', createdAt: new Date().toISOString() }
    ],
    tasks: [
      { id: 't1', title: 'Follow up with John Smith', status: 'pending', dueDate: new Date(Date.now() + 86400000).toISOString(), description: 'Discuss the Maple St offer', dealId: 'd1', contactId: 'c1', assignedTo: 'u2' },
      { id: 't2', title: 'Send contract to Sarah', status: 'completed', dueDate: new Date().toISOString(), description: 'Finalize the listing agreement', dealId: 'd2', contactId: 'c2', assignedTo: 'u1' },
      { id: 't3', title: 'Schedule inspection for Oak Ridge', status: 'pending', dueDate: new Date(Date.now() + 172800000).toISOString(), description: 'Contact local inspector', dealId: 'd1', assignedTo: 'u2' }
    ],
    showings: [],
    emailTemplates: [
      { id: 't1', name: 'Initial Lead Follow-up', subject: 'Welcome to LuxeCRM - Next Steps', body: 'Dear {{contact_name}},\n\nWelcome to LuxeCRM! We are excited to help you with your real estate needs.\n\nBest regards,\n{{agent_name}}' },
      { id: 't2', name: 'Property Showing Confirmation', subject: 'Confirmed: Showing for {{property_address}}', body: 'Hi {{contact_name}},\n\nThis is to confirm your showing for {{property_address}} on {{showing_date}} at {{showing_time}}.\n\nSee you there!' },
      { id: 't3', name: 'Offer Submission', subject: 'New Offer Received for {{property_address}}', body: 'Hello,\n\nWe have received a new offer for the property at {{property_address}}.\n\nDetails: {{offer_details}}' },
      { id: 't4', name: 'Closing Documents', subject: 'Action Required: Closing Documents for {{deal_id}}', body: 'Dear {{contact_name}},\n\nPlease review and sign the attached closing documents for your deal.' },
    ],
    emails: [
      { id: 'e1', contactId: 'c1', subject: 'Question about Maple St', body: 'Hi, I was wondering if the basement is fully finished...', status: 'sent', createdAt: new Date().toISOString() },
      { id: 'e2', contactId: 'c2', subject: 'Offer documents', body: 'Attached are the signed documents for the Pine Ave listing...', status: 'sent', createdAt: new Date().toISOString() },
    ],
    leadStages: [
      { id: 'ls1', name: 'Cold', order: 1 },
      { id: 'ls2', name: 'Warm', order: 2 },
      { id: 'ls3', name: 'Hot', order: 3 },
      { id: 'ls4', name: 'Not Responding', order: 4 },
      { id: 'ls5', name: 'Lost', order: 5 },
    ],
    leads: [
      { id: 'l1', contactId: 'c1', stageId: 'ls1', value: 500000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'l2', contactId: 'c2', stageId: 'ls2', value: 750000, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
    dealStages: [
      { id: '1', name: 'Lead', order: 1 },
      { id: '2', name: 'Showing', order: 2 },
      { id: '3', name: 'Offer', order: 3 },
      { id: '4', name: 'Closed', order: 4 },
    ]
  };

  // Generic CRUD helper (simplified)
  app.get("/api/:collection", (req, res) => {
    const { collection } = req.params;
    if (db[collection]) {
      res.json(db[collection]);
    } else {
      res.status(404).json({ error: "Collection not found" });
    }
  });

  app.post("/api/:collection", (req, res) => {
    const { collection } = req.params;
    if (db[collection]) {
      const newItem = { ...req.body, id: Math.random().toString(36).substr(2, 9), createdAt: new Date(), updatedAt: new Date() };
      db[collection].push(newItem);
      res.status(201).json(newItem);
    } else {
      res.status(404).json({ error: "Collection not found" });
    }
  });

  app.put("/api/:collection/:id", (req, res) => {
    const { collection, id } = req.params;
    if (db[collection]) {
      const index = db[collection].findIndex(item => item.id === id);
      if (index !== -1) {
        db[collection][index] = { ...db[collection][index], ...req.body, updatedAt: new Date() };
        res.json(db[collection][index]);
      } else {
        res.status(404).json({ error: "Item not found" });
      }
    } else {
      res.status(404).json({ error: "Collection not found" });
    }
  });

  app.delete("/api/:collection/:id", (req, res) => {
    const { collection, id } = req.params;
    if (db[collection]) {
      const index = db[collection].findIndex(item => item.id === id);
      if (index !== -1) {
        db[collection].splice(index, 1);
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Item not found" });
      }
    } else {
      res.status(404).json({ error: "Collection not found" });
    }
  });

  // --- Vite Integration ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LuxeCRM Server running on http://localhost:${PORT}`);
  });
}

startServer();
