// Data Management Layer
// Handles the strict "One Row Per User" requirement

const room = new WebsimSocket();

const DB_CONSTANTS = {
    COLLECTION: 'user_vault_v1',
    FEED_COLLECTION: 'public_feed_v1' // Needed to share images publicly, though ownership remains in vault
};

// Initialize empty structure for columns 3-19
const getEmptyColumns = () => {
    let cols = {};
    for (let i = 3; i <= 19; i++) {
        cols[`col_${i}`] = {};
    }
    return cols;
};

const DataStore = {
    // Get the current user's single row. Create if doesn't exist.
    async getMyVault() {
        const user = await window.websim.getCurrentUser();
        // Filter purely by username/created_by to ensure 1:1 mapping
        const existing = await room.collection(DB_CONSTANTS.COLLECTION)
            .filter({ username: user.username })
            .getList();

        if (existing.length > 0) {
            return existing[0];
        } else {
            // Create the single allowed row
            return await room.collection(DB_CONSTANTS.COLLECTION).create({
                col_1: { generations: [], currency: 0 }, // Generations
                col_2: { remixes: [], gems: 0 },         // Remixes
                ...getEmptyColumns()                     // 3-19 Empty
            });
        }
    },

    // Add a new generation
    async addGeneration(imageUrl, prompt) {
        const vault = await this.getMyVault();
        const user = await window.websim.getCurrentUser();

        const newGen = {
            id: Date.now().toString(),
            url: imageUrl,
            prompt: prompt,
            date: new Date().toISOString()
        };

        // Update User Vault (Col 1)
        const updatedCol1 = {
            ...vault.col_1,
            generations: [newGen, ...vault.col_1.generations],
            currency: (vault.col_1.currency || 0) + 10 // Earn 10 coins
        };

        await room.collection(DB_CONSTANTS.COLLECTION).update(vault.id, {
            col_1: updatedCol1
        });

        // Add to public feed for others to see (referencing the creator)
        await room.collection(DB_CONSTANTS.FEED_COLLECTION).create({
            type: 'generation',
            imageUrl: imageUrl,
            prompt: prompt,
            authorAvatar: user.avatar_url,
            authorName: user.username,
            originalId: newGen.id
        });

        return updatedCol1;
    },

    // Add a remix
    async addRemix(remixUrl, prompt, originalSourceUrl) {
        const vault = await this.getMyVault();
        const user = await window.websim.getCurrentUser();

        const newRemix = {
            id: Date.now().toString(),
            url: remixUrl,
            prompt: prompt,
            source: originalSourceUrl,
            date: new Date().toISOString()
        };

        // Update User Vault (Col 2)
        const updatedCol2 = {
            ...vault.col_2,
            remixes: [newRemix, ...vault.col_2.remixes],
            gems: (vault.col_2.gems || 0) + 5 // Earn 5 gems
        };

        await room.collection(DB_CONSTANTS.COLLECTION).update(vault.id, {
            col_2: updatedCol2
        });

        // Add to public feed
        await room.collection(DB_CONSTANTS.FEED_COLLECTION).create({
            type: 'remix',
            imageUrl: remixUrl,
            prompt: prompt,
            sourceUrl: originalSourceUrl,
            authorAvatar: user.avatar_url,
            authorName: user.username
        });

        return updatedCol2;
    },

    subscribeToFeed(callback) {
        return room.collection(DB_CONSTANTS.FEED_COLLECTION).subscribe(callback);
    },

    subscribeToMyVault(callback) {
        // We can't subscribe to a single record easily by ID if we don't know it yet,
        // so we subscribe to the filtered list.
        window.websim.getCurrentUser().then(user => {
            room.collection(DB_CONSTANTS.COLLECTION)
                .filter({ username: user.username })
                .subscribe(records => {
                    if (records.length > 0) callback(records[0]);
                });
        });
    }
};