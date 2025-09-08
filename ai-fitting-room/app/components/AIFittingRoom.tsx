// components/AIFittingRoom.tsx
"use client"; // <- THIS LINE MUST BE FIRST

import React, { useState, ChangeEvent } from "react";
import Button from 'react-bootstrap/Button';

import { Upload, Shirt, Sparkles, Key } from "lucide-react";
import { motion } from "framer-motion";
import { GoogleGenAI } from "@google/genai";

// ...rest of your component code


const AIFittingRoom: React.FC = () => {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [clothPhoto, setClothPhoto] = useState<string | null>(null);
  const [userFile, setUserFile] = useState<File | null>(null);
  const [clothFile, setClothFile] = useState<File | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");

const handleUpload = (e: ChangeEvent<HTMLInputElement>, type: "user" | "cloth") => {
  const file = e.target.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);

  // Clear previous AI-generated output
  setOutput(null);

  if (type === "user") {
    setUserPhoto(url);
    setUserFile(file);
  }
  if (type === "cloth") {
    setClothPhoto(url);
    setClothFile(file);
  }
};

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

  const handleGenerate = async () => {
    if (!apiKey || !userFile || !clothFile) {
      return alert("API key and files required");
    }

    setLoading(true);
    setOutput(null);

    try {
      const userBase64 = await fileToBase64(userFile);
      const clothBase64 = await fileToBase64(clothFile);

      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image-preview",
        contents: [
          { text: "Generate an image of the person in the first image wearing the costume from the second image. Preserve the person’s features, pose, and proportions, and blend the costume naturally and realistically onto them." },
          { text: "Person image"},
          { inlineData: { mimeType: userFile.type, data: userBase64 } },
          { text: "Cloth image"},
          { inlineData: { mimeType: clothFile.type, data: clothBase64 } },
        ],
      });

      const part = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
      if (part) setOutput(`data:image/png;base64,${part.inlineData.data}`);
    } catch (err: any) {
      alert("Request failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-6 text-gray-800"
      >
        🪞 Your stylist
      </motion.h1>

      {/* API Key Input */}
      <div className="flex items-center gap-2 mb-6 w-full max-w-md">
        <Key className="w-5 h-5 text-gray-600" />
        <input
          type="password"
          placeholder="Enter your Google API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="relative w-full max-w-5xl h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        {/* Left side: mirror fitting room */}
        <div className="flex-1 bg-gray-200 flex items-center justify-center relative">
          {loading ? (
            <div className="text-gray-600 text-lg">Generating outfit...</div>
          ) : output ? (
            <img src={output} alt="AI Result" className="h-full object-contain" />
          ) : userPhoto ? (
            <img src={userPhoto} alt="User" className="h-full object-contain opacity-90" />
          ) : (
            <div className="text-gray-500 text-lg">Upload your photo to see here</div>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-1 rounded-full">
            Mirror View
          </div>
        </div>

        {/* Right side: clothing rack */}
        <div className="w-72 bg-gray-50 border-l flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Shirt className="w-5 h-5 text-pink-500" /> Clothes Rack
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {clothPhoto ? (
              <img src={clothPhoto} alt="Cloth" className="w-full rounded-xl shadow-md" />
            ) : (
              <div className="text-gray-500 text-center mt-12">Upload clothing to display here</div>
            )}
          </div>
          <div className="p-4 border-t flex flex-col gap-2">
            <label className="cursor-pointer flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 px-3 rounded-lg text-sm font-medium">
              <Upload className="w-4 h-4" /> Upload Outfit
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "cloth")} />
            </label>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-6">
        <label className="cursor-pointer flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium">
          <Upload className="w-4 h-4" /> Upload Your Photo
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "user")} />
        </label>
        <Button
  onClick={handleGenerate}
  disabled={loading}
  variant="primary"
  className="d-flex align-items-center gap-2"
>
  <Sparkles className="w-5 h-5" /> {loading ? "Processing..." : "Try On Outfit"}
</Button>

      </div>
    </div>
  );
};

export default AIFittingRoom;
