import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'web', req.url === '/' ? 'index.html' : req.url);
  
  const ext = path.extname(filePath);
  let contentType = 'text/html';
  
  switch (ext) {
    case '.css':
      contentType = 'text/css';
      break;
    case '.js':
      contentType = 'text/javascript';
      break;
  }
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`PupPlay web interface running at http://localhost:${port}`);
});