import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { AccessToken } from 'livekit-server-sdk';

const PORT = 3000;

const lkUrl = process.env.LIVEKIT_URL;
const lkKey = process.env.LIVEKIT_API_KEY;
const lkSecret = process.env.LIVEKIT_API_SECRET;

const html = readFileSync('./index.html', 'utf-8');

const server = createServer(async (req, res) => {
  if (req.url === '/api/token') {
    const at = new AccessToken(lkKey, lkSecret, { identity: 'user' });
    at.addGrant({ roomJoin: true, room: 'jarvis-room' });
    const token = await at.toJwt();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ token }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }
});

server.listen(PORT, () => {
  console.log(`JARVIS client → http://localhost:${PORT}`);
  console.log(`Agent URL → ${lkUrl}`);
});
