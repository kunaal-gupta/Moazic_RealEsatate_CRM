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
    res.json({ status: "ok", message: "Sollace API is running" });
  });

  // Mock Database (In-memory for prototype)
  const db = {
    users: [
      { id: 'u1', fullName: 'Kunaal Gupta', email: 'kunaal@sollace.com', role: 'admin', status: 'active' },
      { id: 'u2', fullName: 'Jane Doe', email: 'jane@sollace.com', role: 'agent', status: 'active' }
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
      },
      { 
        id: 'p3', 
        address: '789 Birch Dr', 
        community: 'Oak Ridge', 
        beds: 5, 
        baths: 4, 
        size: 3200, 
        price: 1100000, 
        isOurInventory: false,
        builder: 'Luxury Homes Inc',
        yearBuilt: 2023,
        propertyClass: 'Residential',
        buildingType: 'Detached',
        style: 'Contemporary',
        model: 'The Estates',
        blockLot: 'B12-L5',
        legalPlan: 'PL-9988',
        occupancy: 'Vacant',
        condoFees: 0,
        flooring: 'Engineered Hardwood',
        appliancesIncluded: true,
        garageType: 'Triple Attached',
        floors: 2,
        basement: 'Full',
        basementDev: 'Finished',
        separateEntrance: true,
        notes: 'Stunning property with smart home features.',
        addedDate: new Date().toISOString()
      },
      { 
        id: 'p4', 
        address: '101 Cedar Ln', 
        community: 'Cedar Creek', 
        beds: 2, 
        baths: 2, 
        size: 950, 
        price: 350000, 
        isOurInventory: true,
        builder: 'City Condos',
        yearBuilt: 2020,
        propertyClass: 'Residential',
        buildingType: 'Apartment',
        style: 'Modern',
        model: 'Suite 4B',
        blockLot: 'C1-L10',
        legalPlan: 'PL-5544',
        occupancy: 'Tenant',
        condoFees: 350,
        flooring: 'Vinyl Cover',
        appliancesIncluded: true,
        garageType: 'Underground',
        floors: 1,
        basement: 'None',
        basementDev: 'None',
        separateEntrance: false,
        notes: 'Great investment property.',
        addedDate: new Date().toISOString()
      },
      { 
        id: 'p5', 
        address: '202 Elm St', 
        community: 'Elmwood', 
        beds: 3, 
        baths: 2.5, 
        size: 1600, 
        price: 450000, 
        isOurInventory: false,
        builder: 'Value Builders',
        yearBuilt: 2015,
        propertyClass: 'Residential',
        buildingType: 'Townhouse',
        style: 'Traditional',
        model: 'Townhome A',
        blockLot: 'E2-L8',
        legalPlan: 'PL-2211',
        occupancy: 'Owner Occupied',
        condoFees: 200,
        flooring: 'Carpet/Tile',
        appliancesIncluded: true,
        garageType: 'Single Attached',
        floors: 2,
        basement: 'Full',
        basementDev: 'Unfinished',
        separateEntrance: false,
        notes: 'End unit townhome with lots of natural light.',
        addedDate: new Date().toISOString()
      }
    ],
    contacts: [
      { id: 'c1', fullName: 'John Smith', email: 'john@example.com', type: 'buyer', phoneNumber: '555-0101', company: 'Smith Co', assignedTo: 'u2', createdBy: 'u1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'c2', fullName: 'Sarah Johnson', email: 'sarah@example.com', type: 'seller', phoneNumber: '555-0102', company: 'Johnson Realty', assignedTo: 'u2', createdBy: 'u1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'c3', fullName: 'Michael Brown', email: 'michael@example.com', type: 'buyer', phoneNumber: '555-0103', company: 'Brown Tech', assignedTo: 'u1', createdBy: 'u2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'c4', fullName: 'Emily Davis', email: 'emily@example.com', type: 'investor', phoneNumber: '555-0104', company: 'Davis Investments', assignedTo: 'u1', createdBy: 'u1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ],
    deals: [
      { id: 'd1', propertyIds: ['p1', 'p3'], stageId: '1', value: 1950000, contactIds: ['c1'], assignedAgentId: 'u2', notes: 'Interested in early possession.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'd2', propertyIds: ['p2'], stageId: '2', value: 620000, contactIds: ['c2'], assignedAgentId: 'u1', notes: 'Needs to confirm financing.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 'd3', propertyIds: ['p4', 'p5'], stageId: '3', value: 800000, contactIds: ['c4'], assignedAgentId: 'u1', notes: 'Looking for investment portfolio bundle.', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date().toISOString() },
      { id: 'd4', propertyIds: ['p1'], stageId: '4', value: 850000, contactIds: ['c3'], assignedAgentId: 'u2', notes: 'Closed successfully last month.', createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), updatedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: 'd5', propertyIds: ['p2', 'p3', 'p4'], stageId: '1', value: 2070000, contactIds: ['c1', 'c2'], assignedAgentId: 'u2', notes: 'Client comparing multiple completely different properties.', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), updatedAt: new Date().toISOString() }
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
      { id: 't1', name: 'Initial Lead Follow-up', subject: 'Welcome to Sollace - Next Steps', body: 'Dear {{contact_name}},\n\nWelcome to Sollace! We are excited to help you with your real estate needs.\n\nBest regards,\n{{agent_name}}' },
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
      { id: 'ls5', name: 'Lost', order: 4 },
    ],
    leads: [
      { 
        id: 'l1', 
        contactId: 'c1', 
        stageId: 'ls1', 
        assignedAgentId: 'u2',
        propertyIds: ['p1', 'p2'],
        preferredCommunity: ['keswick', 'glenridding_heights'],
        minBudget: 450000,
        maxBudget: 600000,
        minBeds: 3,
        minBaths: 2,
        minSize: 1500,
        preferredPropertyClass: 'Residential',
        preferredBuildingType: 'Detached',
        preferredPropertyStyle: 'Bungalow',
        preferredGarageType: ['double_attached'],
        wantsBasement: true,
        wantsSeparateEntrance: false,
        maxCondoFees: 0,
        possessionTimeline: '3 months',
        notes: 'Looking for a quiet neighborhood with mature trees.',
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      },
      { 
        id: 'l2', 
        contactId: 'c3', 
        stageId: 'ls2', 
        assignedAgentId: 'u1',
        propertyIds: ['p3', 'p4', 'p5'],
        preferredCommunity: ['rosenthal', 'secord'],
        minBudget: 700000,
        maxBudget: 850000,
        minBeds: 2,
        minBaths: 2,
        minSize: 1100,
        preferredPropertyClass: 'Residential',
        preferredBuildingType: 'Apartment',
        preferredPropertyStyle: 'High-rise',
        preferredGarageType: ['underground'],
        wantsBasement: false,
        wantsSeparateEntrance: false,
        maxCondoFees: 600,
        possessionTimeline: 'Immediate',
        notes: 'Wants a view of the mountains and proximity to downtown.',
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      },
    ],
    dealStages: [
      { id: '1', name: 'Active Leads', order: 1 },
      { id: '2', name: 'Showing', order: 2 },
      { id: '3', name: 'Offer', order: 3 },
      { id: '4', name: 'Closed', order: 4 },
    ],
    leadNotes: [
      { id: 'ln1', leadId: 'l1', note: 'Interested in modern styles.', createdBy: 'u2', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: 'ln2', leadId: 'l1', note: 'Prefers quiet streets.', createdBy: 'u2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    ],
    leadHistory: [
      { id: 'lh1', leadId: 'l1', stageId: 'ls1', changedAt: new Date(Date.now() - 172800000).toISOString() },
    ],
  };

  // Generic CRUD helper (simplified)
  app.get("/api/:collection", (req, res) => {
    const { collection } = req.params;
    const query = req.query;
    
    if (db[collection]) {
      let results = db[collection];
      
      // Basic filtering
      if (Object.keys(query).length > 0) {
        results = results.filter(item => {
          return Object.entries(query).every(([key, value]) => item[key] == value);
        });
      }
      
      res.json(results);
    } else {
      res.status(404).json({ error: "Collection not found" });
    }
  });

  app.get("/api/:collection/:id", (req, res) => {
    const { collection, id } = req.params;
    if (db[collection]) {
      const item = db[collection].find(i => i.id === id);
      if (item) {
        res.json(item);
      } else {
        res.status(404).json({ error: "Item not found" });
      }
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
    console.log(`Sollace Server running on http://localhost:${PORT}`);
  });
}

startServer();
