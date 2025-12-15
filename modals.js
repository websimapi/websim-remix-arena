const { useState, useEffect, useRef } = React;

const DetailModal = ({ isOpen, onClose, item, isOwner, onRemix, onDelete }) => {
    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="bg-gray-900 border border-gray-600 rounded-2xl w-full max-w-lg overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-800/50">
                    <div className="flex items-center gap-3">
                        <img src={item.authorAvatar} className="w-10 h-10 rounded-full border border-gray-600" />
                        <div>
                            <h3 className="text-base font-bold text-white">{item.authorName}</h3>
                            <p className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()} &bull; {new Date(item.date).toLocaleTimeString()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 p-4 scrollbar-hide">
                    <div className="rounded-xl overflow-hidden border border-gray-700 bg-black mb-4 shadow-lg relative">
                        <img src={item.imageUrl} className="w-full h-auto object-contain max-h-[50vh] mx-auto" />
                        {item.type === 'remix' && (
                            <div className="absolute top-2 right-2 bg-purple-600/90 backdrop-blur text-white text-xs px-2 py-1 rounded shadow-lg font-bold border border-purple-400">
                                REMIX
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Prompt</h4>
                        <p className="text-gray-200 font-medium leading-relaxed">"{item.prompt}"</p>
                    </div>

                    {item.type === 'remix' && (
                         <div className="mt-4 flex items-center gap-2 text-xs text-purple-400 bg-purple-900/10 p-3 rounded border border-purple-500/20">
                            <i className="fa-solid fa-code-branch text-lg"></i>
                            <div>
                                <span className="font-bold block">Remix Tree</span>
                                <span className="opacity-70">This image was remixed from another creation.</span>
                            </div>
                         </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-800 bg-gray-900 flex gap-3">
                    <button 
                        onClick={() => {
                            onRemix(item);
                            onClose();
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                    >
                        <i className="fa-solid fa-wand-magic-sparkles"></i> Remix Layer
                    </button>

                    {isOwner && (
                        <button 
                            onClick={() => {
                                if(confirm("Are you sure you want to delete this creation? This action cannot be undone.")) {
                                    onDelete(item);
                                    onClose();
                                }
                            }}
                            className="px-5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-xl flex items-center justify-center transition-colors"
                            title="Delete Creation"
                        >
                            <i className="fa-solid fa-trash-can"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const GeneratorModal = ({ isOpen, onClose, type, sourceImage, onComplete }) => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const finalPrompt = type === 'remix' 
                ? `Remix of existing image, ${prompt}` 
                : prompt;

            const options = {
                prompt: finalPrompt,
                aspect_ratio: "1:1"
            };

            // If remixing, we need to convert the source URL to base64 first or send it if supported.
            // Using standard imageGen. If remixing, we use image_inputs
            if (type === 'remix' && sourceImage) {
                 // Fetch blob to get base64 
                 const resp = await fetch(sourceImage.imageUrl);
                 const blob = await resp.blob();
                 const reader = new FileReader();
                 
                 await new Promise((resolve) => {
                     reader.onloadend = () => {
                        options.image_inputs = [{ url: reader.result }];
                        resolve();
                     };
                     reader.readAsDataURL(blob);
                 });
            }

            const result = await websim.imageGen(options);

            // Play sound
            const audio = new Audio(type === 'remix' ? 'sfx_earn.mp3' : 'sfx_shutter.mp3');
            audio.volume = 0.5;
            audio.play();

            onComplete(result.url, prompt);
            onClose();
            setPrompt("");
        } catch (err) {
            console.error(err);
            alert("Generation failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-600 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <i className="fa-solid fa-xmark text-xl"></i>
                </button>

                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    {type === 'remix' ? <span className="text-purple-400">Remix Image</span> : <span className="text-blue-400">Generate New</span>}
                </h2>

                {type === 'remix' && sourceImage && (
                    <div className="mb-4 relative rounded-lg overflow-hidden h-32 w-full">
                        <img src={sourceImage.imageUrl} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-black/50 px-2 py-1 rounded text-xs">Source Image</span>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="loader mb-4"></div>
                        <p className="text-blue-400 animate-pulse">AI is dreaming...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <label className="block text-sm text-gray-400 mb-2">
                            {type === 'remix' ? "How should we change this?" : "What do you want to see?"}
                        </label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full bg-black/40 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none resize-none h-24 mb-4"
                            placeholder={type === 'remix' ? "Make it cyberpunk, add rain..." : "A futuristic city in the clouds..."}
                            required
                        ></textarea>
                        
                        <button 
                            type="submit"
                            className={`w-full py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 ${
                                type === 'remix' 
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500' 
                                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500'
                            }`}
                        >
                            {type === 'remix' ? (
                                <><span>Remix for +5</span> <img src="gem.png" className="w-5 h-5"/></>
                            ) : (
                                <><span>Generate for +10</span> <img src="coin.png" className="w-5 h-5"/></>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

