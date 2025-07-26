const fs = require("fs");
const path = require("path");

// List of property keys to use
const PROPERTIES = [
  "background",
  "effectFront",
  "effectBack",
  "costume",
  "facewear",
  "earrings",
  "facialExpression",
];

// Load all NFTs from the three files
function loadNFTs(files) {
  const nfts = [];
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    nfts.push(...data);
  }
  return nfts;
}

// Create a unique key for an NFT based on the selected properties
function nftKey(nft) {
  return PROPERTIES.map((prop) => nft[prop] || "").join("|");
}

// Get all possible values for each property from the existing NFTs
function getPropertyValues(nfts) {
  const values = {};
  for (const prop of PROPERTIES) values[prop] = new Set();
  for (const nft of nfts) {
    for (const prop of PROPERTIES) {
      if (nft[prop]) values[prop].add(nft[prop]);
    }
  }
  // Convert sets to arrays
  for (const prop in values) values[prop] = Array.from(values[prop]);
  return values;
}

// Generate a random NFT
function randomNFT(propertyValues) {
  const nft = {};
  for (const prop of PROPERTIES) {
    const vals = propertyValues[prop];
    nft[prop] = vals[Math.floor(Math.random() * vals.length)];
  }
  return nft;
}

// Main function
function generateUniqueNFTs(existingFiles, count) {
  const existingNFTs = loadNFTs(existingFiles);
  const existingKeys = new Set(existingNFTs.map(nftKey));
  const propertyValues = getPropertyValues(existingNFTs);

  const newNFTs = [];
  const newKeys = new Set();

  let attempts = 0;
  const maxAttempts = count * 1000; // Prevent infinite loop

  while (newNFTs.length < count && attempts < maxAttempts) {
    const nft = randomNFT(propertyValues);
    const key = nftKey(nft);
    if (!existingKeys.has(key) && !newKeys.has(key)) {
      newNFTs.push(nft);
      newKeys.add(key);
    }
    attempts++;
  }

  if (newNFTs.length < count) {
    throw new Error(
      `Could only generate ${newNFTs.length} unique NFTs after ${attempts} attempts.`
    );
  }

  return newNFTs;
}

// Usage
const files = [
  path.join(__dirname, "nfts/with_rarity2.json"),
  path.join(__dirname, "nfts/with_rarity3.json"),
  path.join(__dirname, "nfts/with_rarity4.json"),
];

const newNFTs = generateUniqueNFTs(files, 25);

const outputPath = path.join(__dirname, "nfts/new_nfts.json");
fs.writeFileSync(outputPath, JSON.stringify(newNFTs, null, 2));
console.log(`Wrote ${newNFTs.length} new NFTs to ${outputPath}`);
