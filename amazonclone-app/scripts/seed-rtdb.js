// ============================================================================
// Seed Firebase RTDB with catalog data
// ============================================================================
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, update } = require('firebase/database');

const firebaseConfig = {
  apiKey: 'AIzaSyAoBqHmKPsI0re0PbkFQhdhTXQvhltBAIk',
  authDomain: 'clone-ca65e.firebaseapp.com',
  projectId: 'clone-ca65e',
  databaseURL: 'https://clone-ca65e-default-rtdb.firebaseio.com',
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Use compiled or raw seed data
const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const seedSource = fs.readFileSync(
  path.join(__dirname, '../src/lib/firebase/seedData.ts'),
  'utf8',
);
const compiled = ts.transpileModule(seedSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
});

// Evaluate the compiled module
const mod = { exports: {} };
const fn = new Function('module', 'exports', 'require', compiled.outputText);
fn(mod, mod.exports, require);

const { SEED_CATEGORIES, SEED_PRODUCTS } = mod.exports;

async function runSeed() {
  console.log(`Seeding ${SEED_CATEGORIES.length} categories and ${SEED_PRODUCTS.length} products to RTDB...`);

  const updates = {};
  for (const cat of SEED_CATEGORIES) {
    updates[`categories/${cat.id}`] = cat;
  }
  for (const prod of SEED_PRODUCTS) {
    updates[`products/${prod.id}`] = prod;
  }

  await update(ref(db), updates);
  console.log('✅ Successfully seeded Firebase Realtime Database!');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Failed to seed RTDB:', err);
  process.exit(1);
});
