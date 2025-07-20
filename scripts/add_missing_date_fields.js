// MongoDB script to add missing createdAt and updatedAt fields to existing users
// Run this in MongoDB shell or compass

// Function to update a collection with missing date fields
function updateCollectionDates(collectionName) {
    print(`\n=== Updating ${collectionName} collection ===`);
    
    const collection = db.getCollection(collectionName);
    const now = new Date();
    
    // Update documents that don't have createdAt field
    const missingCreatedAt = collection.updateMany(
        { createdAt: { $exists: false } },
        { 
            $set: { 
                createdAt: now,
                updatedAt: now 
            } 
        }
    );
    
    print(`Documents missing createdAt updated: ${missingCreatedAt.modifiedCount}`);
    
    // Update documents that don't have updatedAt field
    const missingUpdatedAt = collection.updateMany(
        { updatedAt: { $exists: false } },
        { 
            $set: { 
                updatedAt: now 
            } 
        }
    );
    
    print(`Documents missing updatedAt updated: ${missingUpdatedAt.modifiedCount}`);
    
    // Show sample of updated documents
    const sampleDocs = collection.find({}, { email: 1, createdAt: 1, updatedAt: 1 }).limit(3).toArray();
    print(`Sample documents after update:`);
    sampleDocs.forEach(doc => {
        print(`  ${doc.email}: created=${doc.createdAt}, updated=${doc.updatedAt}`);
    });
}

print("Starting date field migration for user collections...");

// Update all user collections
updateCollectionDates("farmers");
updateCollectionDates("buyers");
updateCollectionDates("drivers");
updateCollectionDates("admins");

print("\n=== Migration completed ===");

// Verification - count documents with date fields
print("\n=== Verification ===");
["farmers", "buyers", "drivers", "admins"].forEach(collectionName => {
    const collection = db.getCollection(collectionName);
    const total = collection.countDocuments();
    const withCreatedAt = collection.countDocuments({ createdAt: { $exists: true } });
    const withUpdatedAt = collection.countDocuments({ updatedAt: { $exists: true } });
    
    print(`${collectionName}: ${total} total, ${withCreatedAt} with createdAt, ${withUpdatedAt} with updatedAt`);
});
