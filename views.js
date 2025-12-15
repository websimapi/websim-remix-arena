const { useState, useEffect, useRef } = React;

const ProfileView = ({ vault, onRemix, onDelete }) => {
    if (!vault) return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="loader mb-4 border-purple-500 border-b-transparent"></div>
            <p>Loading Profile...</p>
        </div>
    );

    const getProfileItems = () => {
        const username = vault.username;
        const avatar = `https://images.websim.com/avatar/${username}`;
        
        const gens = (vault.col_1?.generations || []).map(g => ({
            ...g,
            id: (g.id || Math.random().toString()) + '_p',
            originalId: g.id,
            type: 'generation',
            imageUrl: g.url,
            authorName: username,
            authorAvatar: avatar
        }));
        
        const remixes = (vault.col_2?.remixes || []).map(r => ({
            ...r,
            id: (r.id || Math.random().toString()) + '_p',
            originalId: r.id,
            type: 'remix',
            imageUrl: r.url,
            sourceUrl: r.source,
            authorName: username,
            authorAvatar: avatar
        }));
        
        return [...gens, ...remixes].sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const items = getProfileItems();

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col items-center py-8 bg-gradient-to-b from-gray-800/40 to-transparent mb-6 border-b border-gray-800/50">
                <div className="relative">
                    <img 
                        src={`https://images.websim.com/avatar/${vault.username}`} 
                        className="w-24 h-24 rounded-full border-4 border-gray-800 shadow-xl"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-gray-800 rounded-full p-1.5 border border-gray-700">
                        <i className="fa-solid fa-certificate text-yellow-500"></i>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white mt-4 tracking-wide">{vault.username}</h2>
                <div className="flex items-center gap-6 mt-4 text-xs font-mono">
                    <div className="flex flex-col items-center">
                        <span className="text-blue-400 font-bold text-lg">{vault.col_1?.generations?.length || 0}</span>
                        <span className="text-gray-500 uppercase tracking-widest">Gens</span>
                    </div>
                    <div className="w-px h-8 bg-gray-700"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-purple-400 font-bold text-lg">{vault.col_2?.remixes?.length || 0}</span>
                        <span className="text-gray-500 uppercase tracking-widest">Remixes</span>
                    </div>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="text-center text-gray-500 mt-12 px-8">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fa-regular fa-folder-open text-3xl opacity-50"></i>
                    </div>
                    <p className="text-lg font-medium text-gray-400">No creations yet</p>
                    <p className="text-sm mt-2 opacity-60">Tap the center + button to start your journey!</p>
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 gap-4">
                    {items.map(item => (
                        <div key={item.id} className="break-inside-avoid">
                            <ImageCard 
                                data={item} 
                                onRemix={onRemix} 
                                onDelete={onDelete}
                                isOwner={true}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

