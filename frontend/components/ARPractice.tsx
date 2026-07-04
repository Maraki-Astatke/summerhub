"use client";
import { useState, useEffect, useRef } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Undo2, Eraser, Download, Sparkles } from "lucide-react";

// ✅ Unique ID to prevent duplicate loading
const AR_COMPONENT_ID = 'ar-practice-component';

// ✅ Global flag to track if scripts are already loaded
let scriptsLoaded = false;

// ✅ Helper function to check if A-Frame is already available
function isAFrameLoaded() {
    return typeof window !== 'undefined' && (window as any).AFRAME !== undefined;
}

function ARPractice() {
    const [isARReady, setIsARReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedColor, setSelectedColor] = useState("#FF7A45");
    const [brushSize, setBrushSize] = useState(5);
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);
    const containerId = `ar-container-${Date.now()}`;

    useEffect(() => {
        // ✅ If already loaded, just show
        if (isAFrameLoaded() || scriptsLoaded) {
            setIsARReady(true);
            setIsLoading(false);
            return;
        }

        // ✅ Check if we already have a scene
        const existingScene = document.querySelector('a-scene');
        if (existingScene) {
            scriptsLoaded = true;
            setIsARReady(true);
            setIsLoading(false);
            return;
        }

        const loadARScripts = () => {
            try {
                // Load A-Frame
                const aframeScript = document.createElement('script');
                aframeScript.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
                aframeScript.async = true;
                aframeScript.id = 'aframe-script';

                aframeScript.onload = () => {
                    if (!mountedRef.current) return;
                    // Load AR.js
                    const arScript = document.createElement('script');
                    arScript.src = 'https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js';
                    arScript.async = true;
                    arScript.id = 'arjs-script';

                    arScript.onload = () => {
                        if (!mountedRef.current) return;
                        scriptsLoaded = true;
                        setTimeout(() => {
                            if (mountedRef.current) {
                                setIsARReady(true);
                                setIsLoading(false);
                            }
                        }, 200);
                    };

                    arScript.onerror = () => {
                        if (!mountedRef.current) return;
                        setError('Failed to load AR.js library.');
                        setIsLoading(false);
                    };

                    // Check if script already exists before adding
                    if (!document.querySelector('#arjs-script')) {
                        document.head.appendChild(arScript);
                    } else {
                        scriptsLoaded = true;
                        setIsARReady(true);
                        setIsLoading(false);
                    }
                };

                aframeScript.onerror = () => {
                    if (!mountedRef.current) return;
                    setError('Failed to load A-Frame library.');
                    setIsLoading(false);
                };

                // Check if script already exists before adding
                if (!document.querySelector('#aframe-script')) {
                    document.head.appendChild(aframeScript);
                } else {
                    // If A-Frame script exists but not loaded yet, wait
                    if (!isAFrameLoaded()) {
                        const checkAFrame = setInterval(() => {
                            if (isAFrameLoaded() && mountedRef.current) {
                                clearInterval(checkAFrame);
                                // Load AR.js
                                if (!document.querySelector('#arjs-script')) {
                                    const arScript = document.createElement('script');
                                    arScript.src = 'https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js';
                                    arScript.async = true;
                                    arScript.id = 'arjs-script';
                                    arScript.onload = () => {
                                        if (mountedRef.current) {
                                            scriptsLoaded = true;
                                            setIsARReady(true);
                                            setIsLoading(false);
                                        }
                                    };
                                    document.head.appendChild(arScript);
                                } else {
                                    scriptsLoaded = true;
                                    setIsARReady(true);
                                    setIsLoading(false);
                                }
                            }
                        }, 100);
                    } else {
                        scriptsLoaded = true;
                        setIsARReady(true);
                        setIsLoading(false);
                    }
                }
            } catch (error) {
                if (!mountedRef.current) return;
                setError('Something went wrong loading AR libraries.');
                setIsLoading(false);
            }
        };

        loadARScripts();

        // ✅ Cleanup on unmount
        return () => {
            mountedRef.current = false;
            // Don't remove scripts to prevent re-loading issues
        };
    }, []);

    const colors = ['#FF7A45', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000'];

    return (
        <div className="space-y-6" id={containerId}>
            <Card className="border-0 shadow-sm dark:bg-gray-800 bg-gradient-to-br from-[#FFF2EB] to-white dark:from-gray-800 dark:to-gray-800">
                <CardHeader>
                    <CardTitle className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[#FF7A45]" />
                        AR Practice Studio
                    </CardTitle>
                    <CardDescription className="text-base dark:text-gray-400">
                        Practice your hobby in augmented reality! Point your camera at the marker.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Error State */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                                onClick={() => {
                                    setError(null);
                                    scriptsLoaded = false;
                                    setIsARReady(false);
                                    setIsLoading(true);
                                    // Reload page to reset everything
                                    window.location.reload();
                                }}
                            >
                                Retry
                            </Button>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && !isARReady && !error && (
                        <div className="flex items-center justify-center h-[450px]">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-[#FF7A45] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-500 dark:text-gray-400">Loading AR Studio...</p>
                                <p className="text-sm text-gray-400 mt-2">Please allow camera access</p>
                            </div>
                        </div>
                    )}

                    {/* AR Scene */}
                    {isARReady && !isLoading && (
                        <>
                            <div className="relative w-full bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden" style={{ height: '450px' }}>
                                <a-scene
                                    embedded
                                    arjs="trackingMethod: best; debugUIEnabled: false;"
                                    renderer="logarithmicDepthBuffer: true;"
                                >
                                    <a-marker preset="hiro">
                                        <a-plane position="0 0 -0.5" width="2" height="2" color="#FFF" opacity="0.8" material="side: double" />
                                        <a-box
                                            position="0 0.5 0"
                                            width="0.5"
                                            height="0.05"
                                            depth="0.5"
                                            color={selectedColor}
                                            animation="property: rotation; to: 0 360 0; dur: 5000; loop: true;"
                                        />
                                        <a-text
                                            value="🎨 Practice Here!"
                                            position="0 1.2 0"
                                            color={selectedColor}
                                            align="center"
                                            scale="1.5 1.5 1.5"
                                        />
                                    </a-marker>
                                    <a-entity camera></a-entity>
                                </a-scene>
                            </div>

                            {/* Controls */}
                            <div className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Color</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {colors.map((color) => (
                                            <button
                                                key={color}
                                                className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-[#FF7A45]' : 'border-gray-300'} hover:scale-110 transition-transform`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setSelectedColor(color)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Brush Size: {brushSize}px
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="20"
                                        value={brushSize}
                                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                        className="w-full"
                                    />
                                </div>

                                <div className="flex gap-2 flex-wrap">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsRecording(!isRecording)}
                                        className={isRecording ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
                                    >
                                        <Video className="h-4 w-4 mr-2" />
                                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <Undo2 className="h-4 w-4 mr-2" />
                                        Undo
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <Eraser className="h-4 w-4 mr-2" />
                                        Clear
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download
                                    </Button>
                                </div>

                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default ARPractice;