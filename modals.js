const { useState, useEffect, useRef } = React;

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

