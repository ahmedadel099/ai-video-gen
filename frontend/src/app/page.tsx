"use client";

import { useState } from "react";

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoSource, setVideoSource] = useState("pexels");

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsGenerating(true);
    setProgress(0);
    setStatus("Starting video generation...");
    setVideoId(null);
    setError(null);

    const formData = new FormData(event.currentTarget);
    
    // Handle video source selection
    const videoSource = formData.get("video_source");
    if (videoSource === "upload") {
      // Remove video_query if upload is selected
      formData.delete("video_query");
      // Validate that a file was uploaded
      const videoFile = formData.get("video_file") as File;
      if (!videoFile || videoFile.size === 0) {
        setError("Please select a video file to upload.");
        setIsGenerating(false);
        return;
      }
    } else {
      // Remove video_file if pexels is selected
      formData.delete("video_file");
      // Validate that a query was provided
      const videoQuery = formData.get("video_query") as string;
      if (!videoQuery || videoQuery.trim() === "") {
        setError("Please provide a video search query.");
        setIsGenerating(false);
        return;
      }
    }

    try {
      console.log("Making request to backend...");
      const response = await fetch("http://127.0.0.1:8000/api/v1/generate", {
        method: "POST",
        body: formData,
      });

      console.log("Response received:", response.status, response.ok);

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({ error: "Server error" }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      console.log("Starting to read stream...");

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("Stream reading complete");
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const messages = buffer.split("\n\n");
        buffer = messages.pop() || "";

        for (const message of messages) {
          if (message.startsWith("data: ")) {
            const jsonStr = message.substring(6);
            if (!jsonStr) continue;
            
            console.log("Received SSE message:", jsonStr);
            
            try {
              const data = JSON.parse(jsonStr);
              if (data.status) setStatus(data.status);
              if (data.progress !== undefined) setProgress(data.progress);
              if (data.videoId) {
                setVideoId(data.videoId);
                setIsGenerating(false);
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              console.error("Failed to parse SSE message:", e, "Raw message:", jsonStr);
            }
          }
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setIsGenerating(false);
    }
  };
  
  const handleReset = () => {
    setIsGenerating(false);
    setProgress(0);
    setStatus("");
    setVideoId(null);
    setError(null);
    setVideoSource("pexels");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AI Video Generator
          </h1>
          <p className="text-xl text-gray-400">
            Create compelling short-form videos in seconds
          </p>
        </header>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg text-center">
            <p><strong>Error:</strong> {error}</p>
            <button 
              onClick={() => setError(null)} 
              className="mt-2 text-sm underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Form */}
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Create Your Video</h2>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label htmlFor="script" className="block text-sm font-medium text-gray-300 mb-2">
                  Video Script
                </label>
                <textarea
                  id="script"
                  name="script"
                  rows={6}
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-white placeholder-gray-400"
                  placeholder="Enter your video script here..."
                  defaultValue="A realistic short video about the importance of drinking water."
                  disabled={isGenerating}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="voice" className="block text-sm font-medium text-gray-300 mb-2">
                  Voice Selection
                </label>
                <select
                  id="voice"
                  name="voice"
                  className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-white"
                  defaultValue="en-US-JennyNeural"
                  disabled={isGenerating}
                >
                  <option value="en-US-JennyNeural">Jenny (USA)</option>
                  <option value="en-GB-SoniaNeural">Sonia (UK)</option>
                  <option value="en-AU-NatashaNeural">Natasha (Australia)</option>
                  <option value="en-CA-ClaraNeural">Clara (Canada)</option>
                  <option value="en-IN-NeerjaNeural">Neerja (India)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Background Video
                </label>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="video_source"
                        value="pexels"
                        checked={videoSource === "pexels"}
                        onChange={(e) => setVideoSource(e.target.value)}
                        className="text-blue-500 focus:ring-blue-500"
                        disabled={isGenerating}
                      />
                      <span className="text-gray-300">Use Pexels stock video</span>
                    </label>
                    {videoSource === "pexels" && (
                      <div className="ml-6 mt-2">
                        <input
                          type="text"
                          name="video_query"
                          placeholder="e.g., nature, technology, business..."
                          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-white placeholder-gray-400"
                          defaultValue="water"
                          disabled={isGenerating}
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Describe the type of background video you want
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="video_source"
                        value="upload"
                        checked={videoSource === "upload"}
                        onChange={(e) => setVideoSource(e.target.value)}
                        className="text-blue-500 focus:ring-blue-500"
                        disabled={isGenerating}
                      />
                      <span className="text-gray-300">Upload your own video</span>
                    </label>
                    {videoSource === "upload" && (
                      <div className="ml-6 mt-2">
                        <input
                          type="file"
                          name="video_file"
                          accept="video/*"
                          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                          disabled={isGenerating}
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          MP4, MOV, AVI files supported
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isGenerating ? "Generating..." : "Generate Video"}
              </button>
            </form>
          </div>

          {/* Right Column: Progress/Result */}
          <div className="bg-gray-800 rounded-xl p-8 shadow-2xl">
            {isGenerating ? (
              /* Progress View */
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-bold mb-4">Generating Your Video</h2>
                <p className="text-gray-400 mb-6">Please wait while we create your video...</p>
                
                <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-400">{status}</p>
                <p className="text-xs text-gray-500 mt-2">{progress}% complete</p>
              </div>
            ) : videoId ? (
              /* Result View */
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-6">Your Video is Ready!</h2>
                
                <div className="aspect-video bg-gray-900 rounded-lg mb-6 overflow-hidden">
                  <video 
                    src={`http://127.0.0.1:8000/api/v1/videos/${videoId}`} 
                    controls 
                    className="w-full h-full"
                  />
                </div>
                
                <div className="flex gap-4">
                  <a
                    href={`http://127.0.0.1:8000/api/v1/videos/${videoId}`}
                    download
                    className="flex-1 py-3 font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-500/50 transition-all"
                  >
                    Download Video
                  </a>
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 font-bold text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-500/50 transition-all"
                  >
                    Create Another
                  </button>
                </div>
              </div>
            ) : (
              /* Initial State */
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">Ready to Create</h2>
                <p className="text-gray-400">Fill out the form and generate your first AI video!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
