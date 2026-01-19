import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const PORT = process.env.PORT || 5173;
const DIST_DIR = path.join(__dirname, 'dist');

// Serve static files with proper MIME types
app.use(express.static(DIST_DIR, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    }
  }
}));

// SPA route handler - serve index.html for all non-file routes
app.use((req, res) => {
  // Don't rewrite requests for actual files
  if (req.path.includes('.')) {
    res.status(404).send('Not found');
    return;
  }
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Serving files from: ${DIST_DIR}`);
});
