// Data Management Layer
// Handles the strict "One Row Per User" requirement

const room = new WebsimSocket();

const DB_CONSTANTS = {
    COLLECTION: 'user_vault_v1'
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

        const newGen = {
            id: Date.now().toString(),
            url: imageUrl,
            prompt: prompt,
            date: new Date().toISOString()
        };

        // Update User Vault (Col 1)
        const updatedCol1 = {
            ...vault.col_1,
            generations: [newGen, ...(vault.col_1.generations || [])],
            currency: (vault.col_1.currency || 0) + 10 // Earn 10 coins
        };

        await room.collection(DB_CONSTANTS.COLLECTION).update(vault.id, {
            col_1: updatedCol1
        });

        return updatedCol1;
    },

    // Add a remix
    async addRemix(remixUrl, prompt, originalSourceUrl) {
        const vault = await this.getMyVault();

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
            remixes: [newRemix, ...(vault.col_2.remixes || [])],
            gems: (vault.col_2.gems || 0) + 5 // Earn 5 gems
        };

        await room.collection(DB_CONSTANTS.COLLECTION).update(vault.id, {
            col_2: updatedCol2
        });

        return updatedCol2;
    },

    subscribeToFeed(callback) {
        // Construct feed by aggregating from all user vaults
        return room.collection(DB_CONSTANTS.COLLECTION).subscribe(records => {
            let allItems = [];
            
            records.forEach(vault => {
                const authorName = vault.username;
                const authorAvatar = `https://images.websim.com/avatar/${vault.username}`;

                // Col 1: Generations
                if (vault.col_1 && Array.isArray(vault.col_1.generations)) {
                    vault.col_1.generations.forEach(gen => {
                        allItems.push({
                            id: gen.id + "_" + vault.id, // Unique ID combination
                            type: 'generation',
                            imageUrl: gen.url,
                            prompt: gen.prompt,
                            date: gen.date,
                            authorName,
                            authorAvatar,
                            ownerVaultId: vault.id
                        });
                    });
                }

                // Col 2: Remixes
                if (vault.col_2 && Array.isArray(vault.col_2.remixes)) {
                    vault.col_2.remixes.forEach(remix => {
                        allItems.push({
                            id: remix.id + "_" + vault.id,
                            type: 'remix',
                            imageUrl: remix.url,
                            prompt: remix.prompt,
                            sourceUrl: remix.source,
                            date: remix.date,
                            authorName,
                            authorAvatar,
                            ownerVaultId: vault.id
                        });
                    });
                }
            });

            // Sort by Date Descending
            allItems.sort((a, b) => new Date(b.date) - new Date(a.date));

            callback(allItems);
        });
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