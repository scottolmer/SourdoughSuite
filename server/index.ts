import express, { type Request, Response, NextFunction } from "express";
import multer from "multer";
import { registerRoutes } from "./routes";
import { registerAdminRoutes } from "./admin-routes";
import { registerResearchAPI } from "./research-api";
import { registerMobileAPI } from "./mobile-api";
import { seedResearchTopics } from "./seed-research-topics";
import { setupVite, serveStatic, log } from "./vite";
import "./types"; // Import subdomain type definitions

const app = express();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Increase body parser limits for large requests
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: false, limit: '100mb' }));

// Add multer middleware for file uploads
app.use('/api/admin', upload.single('file'));

// Subdomain detection middleware
app.use((req, res, next) => {
  const host = req.get('host') || '';
  const subdomain = host.split('.')[0];
  
  // Set subdomain info on request for routing decisions
  req.subdomain = subdomain;
  req.isStore = subdomain === 'store';
  req.isBlog = subdomain === 'blog';
  req.isApp = subdomain === 'app' || !subdomain.includes('.');
  
  next();
});

// Serve static files from the public directory with explicit MIME types and caching
app.use('/images', express.static('public/images', {
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
    // Log when static files are accessed
    console.log(`Serving static file: ${path}`);
  }
}));


app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  registerAdminRoutes(app);
  registerResearchAPI(app);
  registerMobileAPI(app);
  
  // Seed research topics on startup
  seedResearchTopics();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
