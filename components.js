const { useState, useEffect, useRef } = React;

// --- Presentation Components ---

const Header = ({ vault }) => {
    const currency = vault?.col_1?.currency || 0;
    const gems = vault?.col_2?.gems || 0;

    return (
        <header className="fixed top-0 left-0 right-0 h-16 glass-panel z-50 flex items-center justify-between px-4 shadow-lg">
            <div className="flex items-center gap-2">
                <i className="fa-solid fa-layer-group text-blue-500 text-xl"></i>
                <h1 className="font-bold text-lg tracking-wider">REMIX<span className="text-blue-500">ARENA</span></h1>
            </div>
            
            <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-yellow-500/30">
                    <img src="coin.png" className="w-5 h-5 object-contain" />
                    <span className="font-mono text-yellow-400 font-bold">{currency}</span>
                </div>
                <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-purple-500/30">
                    <img src="gem.png" className="w-5 h-5 object-contain" />
                    <span className="font-mono text-purple-400 font-bold">{gems}</span>
                </div>
            </div>
        </header>
    );
};

const ImageCard = ({ data, onRemix, onDelete, isOwner }) => {
    const isRemix = data.type === 'remix';
    
    return (
        <div className="image-card relative group rounded-xl overflow-hidden bg-gray-800 mb-4 border border-gray-700">
            <div className="relative aspect-square">
                <img src={data.imageUrl} alt={data.prompt} className="w-full h-full object-cover" />
                
                {isRemix && (
                    <div className="absolute top-2 right-2 bg-purple-600 text-xs px-2 py-1 rounded shadow-lg font-bold">
                        REMIXED
                    </div>
                )}
                
                {isOwner && onDelete && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            if(confirm("Delete this creation? This cannot be undone.")) {
                                onDelete(data);
                            }
                        }}
                        className="absolute top-2 left-2 bg-red-600/80 hover:bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-colors z-10"
                    >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                    </button>
                )}
            </div>
            
            <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <img src={data.authorAvatar} className="w-6 h-6 rounded-full border border-gray-500" />
                        <span className="text-xs text-gray-300 font-semibold truncate max-w-[100px]">{data.authorName}</span>
                    </div>
                    <button 
                        onClick={() => onRemix(data)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"
                    >
                        <i className="fa-solid fa-wand-magic-sparkles"></i> Remix
                    </button>
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 italic">"{data.prompt}"</p>
            </div>
        </div>
    );
};

const BottomNav = ({ activeTab, onTabChange, onCreate }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 glass-panel z-50 flex items-center justify-around px-6 pb-safe border-t border-gray-700/50">
            <button 
                onClick={() => onTabChange('feed')}
                className={`flex flex-col items-center gap-1 transition-colors w-16 ${activeTab === 'feed' ? 'text-blue-400' : 'text-gray-500'}`}
            >
                <i className={`fa-solid fa-layer-group text-xl ${activeTab === 'feed' ? 'scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : ''}`}></i>
                <span className="text-[10px] font-bold tracking-widest">FEED</span>
            </button>

            <button 
                onClick={onCreate}
                className="group relative flex items-center justify-center w-12 h-12 -mt-8 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-full shadow-lg shadow-blue-900/50 border border-blue-400/50 text-white transform transition-all active:scale-95 hover:scale-110 hover:-translate-y-1"
            >
                <div className="absolute inset-0 rounded-full bg-blue-400 blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <i className="fa-solid fa-plus text-xl relative z-10"></i>
            </button>

            <button 
                onClick={() => onTabChange('profile')}
                className={`flex flex-col items-center gap-1 transition-colors w-16 ${activeTab === 'profile' ? 'text-purple-400' : 'text-gray-500'}`}
            >
                <i className={`fa-solid fa-user-astronaut text-xl ${activeTab === 'profile' ? 'scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : ''}`}></i>
                <span className="text-[10px] font-bold tracking-widest">ME</span>
            </button>
        </nav>
    );
};

