const fs = require("fs");
const path = require("path");

function read(filePath) {
  return fs.readFileSync(path.join(__dirname, "..", filePath), "utf8");
}

function assertIncludes(content, needle, label) {
  if (!content.includes(needle)) {
    throw new Error(`Missing ${label}: ${needle}`);
  }
}

function run() {
  const bazarAdapter = read("extension/content/marketplaces/bazarBg.js");
  const bazarSchema = read("mobile-app/src/data/bazarBgSchema.ts");
  const listingTypes = read("mobile-app/src/types/listing.ts");

  const adapterChecks = [
    ["CREATE_PATH_PREFIX", "create path guard"],
    ["#category_id", "category id selector"],
    ["#province_city_location", "location chain selector"],
    ["#populated_location", "dependent location selector"],
    ["#pics", "uploaded images hidden field selector"],
    ["#imgUpload", "image upload root selector"],
    ["#confirmPhone", "phone verification selector"],
    ["#confirmCode", "phone code selector"],
    ["attachImagesAndConfirm", "image confirmation flow"],
    ["imagesOnly", "images-only context support"]
  ];

  adapterChecks.forEach(([needle, label]) => assertIncludes(bazarAdapter, needle, label));

  const schemaChecks = [
    ["name: \"price_type\"", "price type field"],
    ["name: \"currency\"", "currency field"],
    ["name: \"province_city_location\"", "province selector field"],
    ["name: \"populated_location\"", "populated selector field"],
    ["name: \"hide_phone\"", "hide phone field"],
    ["name: \"exact_coordinates\"", "exact coordinates field"],
    ["name: \"lat\"", "latitude field"],
    ["name: \"long\"", "longitude field"]
  ];

  schemaChecks.forEach(([needle, label]) => assertIncludes(bazarSchema, needle, label));
  assertIncludes(listingTypes, "\"bazar-bg\"", "bazar posting target type");

  console.log("bazar smoke check: OK");
}

try {
  run();
} catch (error) {
  console.error(`bazar smoke check: FAIL\n${error.message}`);
  process.exit(1);
}
