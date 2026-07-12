const { MongoClient } = require("mongodb");

// Actual Atlas connection strings
const OLD_URI = "mongodb+srv://admin:sanchiwellness12345678@cluster0.4bpzr3j.mongodb.net/?appName=Cluster0";
const NEW_URI = "mongodb+srv://aspirewellboost_db_user:6yVzVxyXmHxmSopg@cluster0.nawkwvq.mongodb.net/?appName=Cluster0";

// Database names
const OLD_DB = "sanchi_wellness"; 
const NEW_DB = "aspire_Wellboost"; // You can keep the name same or change to 'aspire_wellness' etc.

// Collection to migrate
const COLLECTION = "products";

async function migrateProducts() {
  const oldClient = new MongoClient(OLD_URI);
  const newClient = new MongoClient(NEW_URI);

  try {
    await oldClient.connect();
    await newClient.connect(); 

    console.log("✅ Connected to both databases successfully.");

    const oldCollection = oldClient.db(OLD_DB).collection(COLLECTION);
    const newCollection = newClient.db(NEW_DB).collection(COLLECTION);

    // Fetch all products from old database
    const products = await oldCollection.find({}).toArray();

    console.log(`📦 Found ${products.length} products in the source collection.`);

    if (products.length === 0) {
      console.log("No products found to migrate.");
      return;
    }

    // Clear existing products in the new database for an absolute exact copy
    console.log("🧹 Clearing target collection...");
    await newCollection.deleteMany({});

    // Insert products preserving original IDs and properties
    console.log("🚀 Inserting products into the new cluster...");
    const result = await newCollection.insertMany(products);

    console.log(`🎉 Successfully migrated ${result.insertedCount} products!`);
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await oldClient.close();
    await newClient.close();
    console.log("🔒 Database connections closed cleanly.");
  }
}

migrateProducts();