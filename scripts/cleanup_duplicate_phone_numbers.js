// MongoDB script to clean up duplicate phone numbers
// Run this in MongoDB shell or compass

// Function to find and remove duplicates for a collection
function cleanupDuplicates(collectionName) {
    print(`\n=== Cleaning up duplicates in ${collectionName} ===`);
    
    const collection = db.getCollection(collectionName);
    
    // Find documents with duplicate phone numbers
    const duplicates = collection.aggregate([
        {
            $match: {
                phoneNumber: { $exists: true, $ne: null, $ne: "" }
            }
        },
        {
            $group: {
                _id: "$phoneNumber",
                docs: { $push: { _id: "$_id", email: "$email", username: "$username" } },
                count: { $sum: 1 }
            }
        },
        {
            $match: {
                count: { $gt: 1 }
            }
        }
    ]).toArray();
    
    print(`Found ${duplicates.length} phone numbers with duplicates`);
    
    // For each duplicate phone number, keep the first one and remove others
    duplicates.forEach(duplicate => {
        print(`\nPhone number: ${duplicate._id} has ${duplicate.count} duplicates`);
        
        // Sort docs by _id to get a consistent order (oldest first)
        duplicate.docs.sort((a, b) => a._id.toString().localeCompare(b._id.toString()));
        
        // Keep the first document, remove the rest
        const toKeep = duplicate.docs[0];
        const toRemove = duplicate.docs.slice(1);
        
        print(`  Keeping: ${toKeep._id} (${toKeep.email || toKeep.username})`);
        
        toRemove.forEach(doc => {
            print(`  Removing: ${doc._id} (${doc.email || doc.username})`);
            collection.deleteOne({ _id: doc._id });
        });
    });
}

// Clean up all user collections
print("Starting cleanup of duplicate phone numbers...");

cleanupDuplicates("farmers");
cleanupDuplicates("buyers");
cleanupDuplicates("drivers");

print("\n=== Cleanup completed ===");

// Verify no duplicates remain
print("\n=== Verification ===");
["farmers", "buyers", "drivers"].forEach(collectionName => {
    const collection = db.getCollection(collectionName);
    const duplicates = collection.aggregate([
        {
            $match: {
                phoneNumber: { $exists: true, $ne: null, $ne: "" }
            }
        },
        {
            $group: {
                _id: "$phoneNumber",
                count: { $sum: 1 }
            }
        },
        {
            $match: {
                count: { $gt: 1 }
            }
        }
    ]).toArray();
    
    print(`${collectionName}: ${duplicates.length} duplicate phone numbers remaining`);
});
