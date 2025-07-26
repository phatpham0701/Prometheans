const fs = require("fs");
const path = require("path");

// Property mapping from CSV to JSON format
const PROPERTY_MAPPING = {
  Background: "background",
  Color: "color",
  Costume: "costume",
  Earrings: "earrings",
  "Effect Back": "effectBack",
  "Effect Front": "effectFront",
  "Face wear": "facewear",
  "Facial Expression": "facialExpression",
};

// Normalize text for comparison (lowercase, replace underscores/dashes with spaces, trim)
function normalizeText(text) {
  if (!text) return "";
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

// Parse CSV file
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.trim().split("\n");
  const csvNFT = {};

  for (const line of lines) {
    const [key, value] = line.split(",").map((s) => s.trim());
    if (PROPERTY_MAPPING[key]) {
      csvNFT[PROPERTY_MAPPING[key]] = value;
    }
  }

  return csvNFT;
}

// Load all NFTs from JSON files
function loadAllNFTs() {
  const files = [
    path.join(__dirname, "nfts/with_rarity2.json"),
    path.join(__dirname, "nfts/with_rarity3.json"),
    path.join(__dirname, "nfts/with_rarity4.json"),
  ];

  const allNFTs = [];
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    allNFTs.push(...data);
  }

  return allNFTs;
}

// Check if CSV NFT is unique
function checkUniqueness() {
  // Parse CSV
  const csvPath = path.join(__dirname, "nfts/Prometheans.csv");
  const csvNFT = parseCSV(csvPath);

  console.log("CSV NFT properties:");
  console.log(JSON.stringify(csvNFT, null, 2));

  // Load all existing NFTs
  const existingNFTs = loadAllNFTs();
  console.log(`\nLoaded ${existingNFTs.length} existing NFTs`);

  // Normalize CSV NFT properties
  const normalizedCSV = {};
  for (const [key, value] of Object.entries(csvNFT)) {
    normalizedCSV[key] = normalizeText(value);
  }

  console.log("\nNormalized CSV properties:");
  console.log(JSON.stringify(normalizedCSV, null, 2));

  // Check against each existing NFT
  let isUnique = true;
  let matchCount = 0;

  for (let i = 0; i < existingNFTs.length; i++) {
    const existingNFT = existingNFTs[i];
    let matches = 0;
    let totalProps = 0;

    for (const [key, csvValue] of Object.entries(normalizedCSV)) {
      if (csvValue) {
        totalProps++;
        const existingValue = normalizeText(existingNFT[key]);
        if (csvValue === existingValue) {
          matches++;
        }
      }
    }

    // If all properties match, it's not unique
    if (totalProps > 0 && matches === totalProps) {
      isUnique = false;
      matchCount++;
      console.log(`\n❌ MATCH FOUND in NFT #${i}:`);
      console.log(JSON.stringify(existingNFT, null, 2));
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`RESULT: ${isUnique ? "TRUE (Unique)" : "FALSE (Not Unique)"}`);
  console.log(`Matches found: ${matchCount}`);
  console.log(`${"=".repeat(50)}`);

  return isUnique;
}

// Run the check
checkUniqueness();
