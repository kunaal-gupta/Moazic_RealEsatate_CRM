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
      { id: 'p1', address: '123 Maple St', community: 'Oak Ridge', beds: 4, baths: 3, size: 2400, price: 850000, isOurInventory: true },
      { id: 'p2', address: '456 Pine Ave', community: 'Pine Valley', beds: 3, baths: 2, size: 1800, price: 620000, isOurInventory: true }
    ],
    contacts: [
      { id: 'c1', fullName: 'John Smith', email: 'john@example.com', type: 'buyer', phoneNumber: '555-0101' },
      { id: 'c2', fullName: 'Sarah Johnson', email: 'sarah@example.com', type: 'seller', phoneNumber: '555-0102' }
    ],
    deals: [
      { id: 'd1', propertyId: 'p1', stageId: '1', value: 850000, contactIds: ['c1'], createdAt: new Date().toISOString() },
      { id: 'd2', propertyId: 'p2', stageId: '2', value: 620000, contactIds: ['c2'], createdAt: new Date().toISOString() }
    ],
    activities: [
      { id: 'a1', description: 'Initial call with John Smith', type: 'call', createdAt: new Date().toISOString() },
      { id: 'a2', description: 'Property viewing scheduled for Pine Ave', type: 'meeting', createdAt: new Date().toISOString() }
    ],
    tasks: [],
    showings: [],
    dealStages: [
      { id: '1', name: 'Lead', order: 1 },
      { id: '2', name: 'Showing', order: 2 },
      { id: '3', name: 'Offer', order: 3 },
      { id: '4', name: 'Closed', order: 4 },
      { id: '5', name: 'Lost', order: 5 },
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
      const newItem = { ...req.body, id: Math.random().toString(36).substr(2, 9), createdAt: new Date() };
      db[collection].push(newItem);
      res.status(201).json(newItem);
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
