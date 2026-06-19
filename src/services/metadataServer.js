const http = require('http');

class MetadataServer {
  constructor(trackProvider, port = 8889) {
    this.trackProvider = trackProvider;
    this.port = port;
    this.server = null;
  }

  start() {
    if (this.server) {
      return;
    }

    this.server = http.createServer(async (req, res) => {
      if (req.method === 'POST' && req.url === '/track') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });

        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            console.log('MetadataServer received:', data);
            const changed = this.trackProvider.updateCurrentTrack(data);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, changed }));
          } catch (error) {
            console.error('MetadataServer JSON error:', error.message);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
          }
        });
      } else if (req.method === 'GET' && req.url === '/track') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ track: this.trackProvider.getCurrentTrack() }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Not found' }));
      }
    });

    this.server.listen(this.port, '127.0.0.1', () => {
      console.log(`🔌 Metadata server listening on http://127.0.0.1:${this.port}`);
    });
  }
}

module.exports = MetadataServer;
