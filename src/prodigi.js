/**
 * Prodigi API Integration for Alchemy Deck
 * https://www.prodigi.com/print-api/docs/reference/
 */

const fs = require('fs');
const path = require('path');

const PRODIGI_API_KEY = process.env.PRODIGI_API_KEY;
const SANDBOX_URL = 'https://api.sandbox.prodigi.com/v4.0';
const LIVE_URL = 'https://api.prodigi.com/v4.0';

// Use sandbox by default
const API_URL = process.env.PRODIGI_LIVE === 'true' ? LIVE_URL : SANDBOX_URL;

// Playing cards SKU (standard 54-card deck)
const PLAYING_CARDS_SKU = 'GLOBAL-GAM-PC';

async function createOrder(options) {
  const {
    recipientName,
    addressLine1,
    addressLine2 = '',
    city,
    postalCode,
    country = 'NL', // Netherlands
    email,
    cardImages, // Array of 54 image URLs (52 cards + 2 jokers)
    quantity = 1
  } = options;

  const orderData = {
    merchantReference: `alchemy-deck-${Date.now()}`,
    shippingMethod: 'Standard',
    recipient: {
      name: recipientName,
      address: {
        line1: addressLine1,
        line2: addressLine2,
        postalOrZipCode: postalCode,
        townOrCity: city,
        countryCode: country
      },
      email: email
    },
    items: [{
      merchantReference: 'alchemy-oracle-deck',
      sku: PLAYING_CARDS_SKU,
      copies: quantity,
      sizing: 'fillPrintArea',
      assets: cardImages.map((url, index) => ({
        printArea: `card_${String(index + 1).padStart(2, '0')}`,
        url: url
      }))
    }]
  };

  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'X-API-Key': PRODIGI_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Prodigi API error: ${JSON.stringify(result)}`);
  }

  return result;
}

async function getOrder(orderId) {
  const response = await fetch(`${API_URL}/orders/${orderId}`, {
    headers: {
      'X-API-Key': PRODIGI_API_KEY
    }
  });

  return response.json();
}

async function getProducts() {
  const response = await fetch(`${API_URL}/products`, {
    headers: {
      'X-API-Key': PRODIGI_API_KEY
    }
  });

  return response.json();
}

async function getQuote(options) {
  const {
    country = 'NL',
    sku = PLAYING_CARDS_SKU,
    quantity = 1
  } = options;

  const response = await fetch(`${API_URL}/quotes`, {
    method: 'POST',
    headers: {
      'X-API-Key': PRODIGI_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      shippingMethod: 'Standard',
      destinationCountryCode: country,
      items: [{
        sku: sku,
        copies: quantity
      }]
    })
  });

  return response.json();
}

// CLI interface
async function main() {
  const command = process.argv[2];

  if (!PRODIGI_API_KEY) {
    console.error('Error: PRODIGI_API_KEY environment variable not set');
    console.log('Get your API key at: https://dashboard.prodigi.com/');
    process.exit(1);
  }

  switch (command) {
    case 'quote':
      console.log('Getting quote for Netherlands delivery...');
      const quote = await getQuote({ country: 'NL', quantity: 1 });
      console.log(JSON.stringify(quote, null, 2));
      break;

    case 'products':
      console.log('Fetching available products...');
      const products = await getProducts();
      console.log(JSON.stringify(products, null, 2));
      break;

    case 'order':
      console.log('Creating test order...');
      // This would need actual image URLs and recipient details
      console.log('Use createOrder() programmatically with proper data');
      break;

    case 'status':
      const orderId = process.argv[3];
      if (!orderId) {
        console.error('Usage: node prodigi.js status <order-id>');
        process.exit(1);
      }
      const order = await getOrder(orderId);
      console.log(JSON.stringify(order, null, 2));
      break;

    default:
      console.log(`
Prodigi CLI for Alchemy Deck

Usage:
  node prodigi.js quote           Get price quote for Netherlands
  node prodigi.js products        List available products
  node prodigi.js status <id>     Check order status

Environment:
  PRODIGI_API_KEY      Your Prodigi API key (required)
  PRODIGI_LIVE=true    Use live API (default: sandbox)

Current mode: ${API_URL.includes('sandbox') ? 'SANDBOX' : 'LIVE'}
      `);
  }
}

module.exports = { createOrder, getOrder, getProducts, getQuote };

if (require.main === module) {
  main().catch(console.error);
}
