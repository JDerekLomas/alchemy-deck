#!/usr/bin/env node
/**
 * Upload Alchemy Deck to The Game Crafter
 *
 * Usage: node upload-to-gamecrafter.js
 *
 * Requires TGC account credentials in environment or prompted
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

// API Configuration
const API_BASE = 'https://www.thegamecrafter.com/api';
const API_KEY = process.env.TGC_API_KEY || 'E4963FEA-E76C-11F0-B4B8-3F982389BF0E';

// Card definitions with selected versions
const selectedVersions = {
  "stage-01": "cards",
  "stage-02": "cards-v3",
  "stage-03": "cards-v1",
  "stage-04": "cards",
  "op-01": "cards-v1",
  "op-02": "cards-v1",
  "op-03": "cards",
  "op-04": "cards-v3",
  "op-05": "cards",
  "op-06": "cards",
  "op-07": "cards",
  "elem-01": "cards-v1",
  "elem-02": "cards-v1",
  "elem-03": "cards",
  "elem-04": "cards-v1",
  "elem-05": "cards",
  "prin-01": "cards",
  "prin-02": "cards",
  "prin-03": "cards",
  "vessel-01": "cards",
  "vessel-02": "cards",
  "vessel-03": "cards",
  "vessel-04": "cards",
  "sage-01": "cards",
  "sage-02": "cards",
  "sage-03": "cards",
  "sage-04": "cards",
  "sage-05": "cards-v1",
  "sage-06": "cards",
  "arc-01": "cards",
  "arc-02": "cards",
  "arc-03": "cards",
  "arc-04": "cards",
  "arc-05": "cards"
};

const cardNames = {
  "stage-01": "Nigredo",
  "stage-02": "Albedo",
  "stage-03": "Citrinitas",
  "stage-04": "Rubedo",
  "op-01": "Calcination",
  "op-02": "Dissolution",
  "op-03": "Separation",
  "op-04": "Conjunction",
  "op-05": "Fermentation",
  "op-06": "Distillation",
  "op-07": "Coagulation",
  "elem-01": "Fire",
  "elem-02": "Water",
  "elem-03": "Air",
  "elem-04": "Earth",
  "elem-05": "Quintessence",
  "prin-01": "Sulphur",
  "prin-02": "Mercury",
  "prin-03": "Salt",
  "vessel-01": "Athanor",
  "vessel-02": "Alembic",
  "vessel-03": "Crucible",
  "vessel-04": "Retort",
  "sage-01": "Hermes",
  "sage-02": "Paracelsus",
  "sage-03": "Boehme",
  "sage-04": "Ficino",
  "sage-05": "Sendivogius",
  "sage-06": "Agrippa",
  "arc-01": "Prima Materia",
  "arc-02": "Lapis",
  "arc-03": "Ouroboros",
  "arc-04": "Rebis",
  "arc-05": "Elixir"
};

const DOCS_DIR = path.join(__dirname, '..', 'docs');

// Helper: Make API request
function apiRequest(method, endpoint, data = null, isFormData = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE);

    let postData;
    let headers = {};

    if (data) {
      if (isFormData) {
        // For file uploads, we need multipart/form-data
        const boundary = '----FormBoundary' + Math.random().toString(36).substr(2);
        headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;

        let body = '';
        for (const [key, value] of Object.entries(data)) {
          if (key === 'file' && value.path) {
            // File field
            const fileContent = fs.readFileSync(value.path);
            const fileName = path.basename(value.path);
            body += `--${boundary}\r\n`;
            body += `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`;
            body += `Content-Type: image/png\r\n\r\n`;
            // We'll handle binary separately
          } else {
            body += `--${boundary}\r\n`;
            body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
            body += `${value}\r\n`;
          }
        }
        body += `--${boundary}--\r\n`;
        postData = body;
      } else {
        headers['Content-Type'] = 'application/json';
        postData = JSON.stringify(data);
      }
    }

    const options = {
      method,
      headers
    };

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.error) {
            reject(new Error(`API Error: ${json.error.message || JSON.stringify(json.error)}`));
          } else {
            resolve(json.result || json);
          }
        } catch (e) {
          reject(new Error(`Parse error: ${body.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

// Simpler approach: Use form-urlencoded for non-file requests
function apiPost(endpoint, params) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${endpoint}`;
    const postData = new URLSearchParams(params).toString();

    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.error) {
            reject(new Error(`API Error: ${json.error.message || JSON.stringify(json.error)}`));
          } else {
            resolve(json.result || json);
          }
        } catch (e) {
          reject(new Error(`Parse error: ${body.substring(0, 500)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function apiGet(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${endpoint}`;

    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.error) {
            reject(new Error(`API Error: ${json.error.message || JSON.stringify(json.error)}`));
          } else {
            resolve(json.result || json);
          }
        } catch (e) {
          reject(new Error(`Parse error: ${body.substring(0, 500)}`));
        }
      });
    }).on('error', reject);
  });
}

// Upload file using fetch (Node 18+)
async function uploadFile(sessionId, folderId, filePath, fileName) {
  const FormData = (await import('form-data')).default;
  const fetch = (await import('node-fetch')).default;

  const form = new FormData();
  form.append('session_id', sessionId);
  form.append('folder_id', folderId);
  form.append('name', fileName);
  form.append('file', fs.createReadStream(filePath));

  const response = await fetch(`${API_BASE}/file`, {
    method: 'POST',
    body: form,
    headers: form.getHeaders()
  });

  const json = await response.json();
  if (json.error) {
    throw new Error(`Upload error: ${json.error.message || JSON.stringify(json.error)}`);
  }
  return json.result;
}

// Prompt for input
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log('='.repeat(50));
  console.log('ALCHEMY DECK - Upload to The Game Crafter');
  console.log('='.repeat(50));

  // Get credentials
  const username = await prompt('TGC Username: ');
  const password = await prompt('TGC Password: ');

  console.log('\n1. Creating session...');
  const session = await apiPost('/session', {
    username,
    password,
    api_key_id: API_KEY
  });
  const sessionId = session.id;
  console.log(`   Session: ${sessionId}`);

  console.log('\n2. Getting user info...');
  const user = await apiGet(`/user/${session.user_id}?session_id=${sessionId}&_include_related_objects=designers`);
  console.log(`   User: ${user.username}`);

  // Get or create designer
  let designerId;
  if (user.designers && user.designers.length > 0) {
    designerId = user.designers[0].id;
    console.log(`   Designer: ${designerId}`);
  } else {
    console.log('   Creating designer...');
    const designer = await apiPost('/designer', {
      session_id: sessionId,
      name: user.username,
      user_id: user.id
    });
    designerId = designer.id;
    console.log(`   Designer created: ${designerId}`);
  }

  console.log('\n3. Creating game...');
  const game = await apiPost('/game', {
    session_id: sessionId,
    name: 'Alchemy Deck',
    designer_id: designerId,
    description: 'A 34-card oracle deck based on authentic alchemical texts and symbols.'
  });
  console.log(`   Game: ${game.id} - ${game.name}`);

  console.log('\n4. Creating folder for images...');
  const folder = await apiPost('/folder', {
    session_id: sessionId,
    name: 'Alchemy Deck Images',
    user_id: user.id
  });
  console.log(`   Folder: ${folder.id}`);

  console.log('\n5. Creating tarot deck...');
  const deck = await apiPost('/tarotdeck', {
    session_id: sessionId,
    name: 'Alchemy Oracle',
    game_id: game.id
  });
  console.log(`   Deck: ${deck.id}`);

  console.log('\n6. Uploading card images...');
  const cardIds = Object.keys(selectedVersions);
  const uploadedFiles = {};

  for (let i = 0; i < cardIds.length; i++) {
    const cardId = cardIds[i];
    const folder_name = selectedVersions[cardId];
    const filePath = path.join(DOCS_DIR, folder_name, `${cardId}.png`);
    const cardName = cardNames[cardId];

    if (!fs.existsSync(filePath)) {
      console.log(`   [${i + 1}/${cardIds.length}] SKIP ${cardId} - file not found`);
      continue;
    }

    console.log(`   [${i + 1}/${cardIds.length}] Uploading ${cardName}...`);
    try {
      const file = await uploadFile(sessionId, folder.id, filePath, `${cardId}.png`);
      uploadedFiles[cardId] = file.id;
      console.log(`   [${i + 1}/${cardIds.length}] ✓ ${cardName} (${file.id})`);
    } catch (err) {
      console.log(`   [${i + 1}/${cardIds.length}] ✗ ${cardName}: ${err.message}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n7. Adding cards to deck...');
  const cardsToCreate = Object.entries(uploadedFiles).map(([cardId, fileId]) => ({
    name: cardNames[cardId],
    face_id: fileId
  }));

  // Bulk create cards (up to 100 at a time)
  const bulkResult = await apiPost(`/tarotdeck/${deck.id}/cards`, {
    session_id: sessionId,
    cards: JSON.stringify(cardsToCreate)
  });
  console.log(`   Created ${cardsToCreate.length} cards`);

  console.log('\n' + '='.repeat(50));
  console.log('UPLOAD COMPLETE!');
  console.log('='.repeat(50));
  console.log(`\nGame: ${game.name}`);
  console.log(`Deck: ${deck.id}`);
  console.log(`Cards: ${Object.keys(uploadedFiles).length}`);
  console.log(`\nView your deck at:`);
  console.log(`https://www.thegamecrafter.com/make/games/${game.id}`);
}

main().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
