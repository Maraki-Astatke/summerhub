"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brush, Eraser, Undo2, Download, Camera, Sparkles } from 'lucide-react';

export default function ARPractice() {
    const [isARReady, setIsARReady] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#FF7A45');
    const [brushSize, setBrushSize] = useState(5);
    const [isRecording, setIsRecording] = useState(false);

    // ✅ Load AR scripts on client side only
    useEffect(() => {
        const loadARScripts = async () => {
            try {
                // Load A-Frame
                const aframeScript = document.createElement('script');
                aframeScript.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
                document.head.appendChild(aframeScript);

                // Load AR.js after A-Frame
                aframeScript.onload = () => {
                    const arScript = document.createElement('script');
                    arScript.src = 'https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js';
                    arScript.onload = () => setIsARReady(true);
                    document.head.appendChild(arScript);
                };
            } catch (error) {
                console.error('Error loading AR scripts:', error);
            }
        };

        loadARScripts();
    }, []);

    const colors = ['#FF7A45', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#000000'];

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-sm dark:bg-gray-800">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[#FF7A45]" />
                        AR Practice Studio
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* AR Scene Container */}
                    <div className="relative w-full bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden" style={{ height: '500px' }}>
                        {isARReady ? (
                            <a-scene embedded arjs="trackingMethod: best; debugUIEnabled: false;">
                                <a-marker preset="hiro">
                                    <a-plane position="0 0 -0.5" width="2" height="2" color="#FFF" opacity="0.8" material="side: double" />
                                    <a-box
                                        position="0 0.5 0"
                                        width="0.5"
                                        height="0.05"
                                        depth="0.5"
                                        color="#FF7A45"
                                        animation="property: rotation; to: 0 360 0; dur: 5000; loop: true;"
                                    />
                                    <a-text value="🎨 Draw Here!" position="0 1.2 0" color="#FF7A45" align="center" scale="1.5 1.5 1.5" />
                                </a-marker>
                                <a-entity camera></a-entity>
                            </a-scene>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-[#FF7A45] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-500 dark:text-gray-400">Loading AR Studio...</p>
                                    <p className="text-sm text-gray-400 mt-2">Please allow camera access</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="mt-6 space-y-4">
                        {/* Color Picker */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Color</label>
                            <div className="flex gap-2 flex-wrap">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-[#FF7A45]' : 'border-gray-300'
                                            } hover:scale-110 transition-transform`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setSelectedColor(color)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Brush Size */}
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

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            <Button size="sm" variant="outline" onClick={() => setIsRecording(!isRecording)} className={isRecording ? 'bg-red-500 hover:bg-red-600 text-white' : ''}>
                                <Camera className="h-4 w-4 mr-2" />
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

                        {/* Instructions */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                📸 Print or display the Hiro marker on your screen. Point your camera at it to see the AR scene!
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}