const fs = require('fs');
const path = require('path');

const FIXTURES_DIR = path.join(__dirname, '../fixtures/stripe');

function loadStripeFixture(name) {
  const filePath = path.join(FIXTURES_DIR, `${name}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

module.exports = { loadStripeFixture, FIXTURES_DIR };
