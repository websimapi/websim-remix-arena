const { useState, useEffect, useRef } = React;

// --- Components ---

// removed Header

// removed ImageCard

// removed GeneratorModal

// --- New Components ---

// removed BottomNav

// removed ProfileView

// --- Main App ---

const App = () => {
    const [vault, setVault] = useState(null);
    const [feed, setFeed] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentView, setCurrentView] = useState('feed');
    const [isGenModalOpen, setIsGenModalOpen] = useState(false);
    const [remixTarget, setRemixTarget] = useState(null); // null or image object

    useEffect(() => {
        // Initialize User Data
        const init = async () => {
            const user = await window.websim.getCurrentUser();
            setCurrentUser(user);

            await DataStore.getMyVault(); // Ensure vault exists
            
            // Subscribe to vault changes (currency/gems)
            DataStore.subscribeToMyVault((data) => {
                setVault(data);
            });

            // Subscribe to Public Feed
            DataStore.subscribeToFeed((records) => {
                setFeed(records);
            });
        };
        init();
    }, []);

    const handleGenerate = async (url, prompt) => {
        await DataStore.addGeneration(url, prompt);
        // Play earn sound
        new Audio('sfx_earn.mp3').play();
    };

    const handleRemixComplete = async (url, prompt) => {
        if (remixTarget) {
            await DataStore.addRemix(url, prompt, remixTarget.imageUrl);
             // Play earn sound
            new Audio('sfx_earn.mp3').play();
        }
    };

    const handleDelete = async (item) => {
        await DataStore.deleteItem(item.originalId, item.type);
    };

    const openRemix = (imageRecord) => {
        setRemixTarget(imageRecord);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-900">
            <Header vault={vault} />

            <main className="flex-1 overflow-y-auto feed-scroll pt-20 pb-24 px-4 max-w-2xl mx-auto w-full">
                {currentView === 'feed' ? (
                    feed.length === 0 ? (
                        <div className="text-center text-gray-500 mt-20 animate-fade-in">
                            <i className="fa-solid fa-image text-4xl mb-4"></i>
                            <p>No images yet. Be the first to generate!</p>
                        </div>
                    ) : (
                        <div className="columns-1 sm:columns-2 gap-4 animate-fade-in">
                            {feed.map(item => (
                                <div key={item.id} className="break-inside-avoid">
                                    <ImageCard 
                                        data={item} 
                                        onRemix={openRemix} 
                                        isOwner={currentUser && item.authorName === currentUser.username}
                                        onDelete={handleDelete}
                                    />
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <ProfileView vault={vault} onRemix={openRemix} onDelete={handleDelete} />
                )}
            </main>

            <BottomNav 
                activeTab={currentView} 
                onTabChange={setCurrentView} 
                onCreate={() => setIsGenModalOpen(true)} 
            />

            {/* Modals */}
            <GeneratorModal 
                isOpen={isGenModalOpen} 
                onClose={() => setIsGenModalOpen(false)}
                type="generate"
                onComplete={handleGenerate}
            />

            <GeneratorModal 
                isOpen={!!remixTarget} 
                onClose={() => setRemixTarget(null)}
                type="remix"
                sourceImage={remixTarget}
                onComplete={handleRemixComplete}
            />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);