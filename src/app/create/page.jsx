'use client';
import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { db, storage } from "@/lib/firebase";
import { ref, uploadString } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { redirect } from "next/navigation";

const Create = () => {
  const { user } = useAuth();
  if (!user) redirect('/auth/signin');

  const [formData, setFormData] = useState({
    prompt: "",
    negativePrompt: "",
    width: 1024,
    height: 1024,
    steps: 30,
    seed: -1,
    guidanceScale: 7.5,
    isPublic: true,
    saveToGallery: true
  });
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const savePost = async (imageUrl) => {
    try {
      // Upload image to Firebase Storage
      const storageRef = ref(storage, `images/${user.uid}/${Date.now()}`);
      await uploadString(storageRef, imageUrl, 'data_url');
      const imageStorageUrl = await storageRef.getDownloadURL();

      // Save post data to Firestore
      await addDoc(collection(db, "posts"), {
        userId: user.uid,
        userName: user.displayName,
        userImage: user.photoURL,
        prompt: formData.prompt,
        negativePrompt: formData.negativePrompt,
        imageUrl: imageStorageUrl,
        isPublic: formData.isPublic,
        likes: 0,
        createdAt: serverTimestamp(),
        settings: {
          width: formData.width,
          height: formData.height,
          steps: formData.steps,
          seed: formData.seed,
          guidanceScale: formData.guidanceScale
        }
      });
    } catch (error) {
      console.error("Error saving post:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      setImageUrl(data.imageUrl);

      if (formData.saveToGallery) {
        await savePost(data.imageUrl);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Generate Image</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 space-y-6">
        <div className="mb-4">
          <textarea
            id="prompt"
            name="prompt"
            value={formData.prompt}
            onChange={handleInputChange}
            className="w-full p-3 textarea textarea-bordered border 
            border-gray-30020 rounded-lg"
            rows="4"
            placeholder="Describe image you want to generate..."
            required
          />
        </div>

        <div>
          <label htmlFor="negativePrompt" className="block mb-2 font-medium">
            Negative Prompt (Optional)
          </label>
          <textarea
            id="negativePrompt"
            name="negativePrompt"
            value={formData.negativePrompt}
            onChange={handleInputChange}
            className="w-full p-3 border rounded-lg"
            rows="2"
            placeholder="Describe what you don't want in the image..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="width" className="block mb-2 font-medium">
              Width
            </label>
            <input
              type="number"
              id="width"
              name="width"
              value={formData.width}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
              min="512"
              max="1024"
              step="64"
            />
          </div>

          <div>
            <label htmlFor="height" className="block mb-2 font-medium">
              Height
            </label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
              min="512"
              max="1024"
              step="64"
            />
          </div>

          <div>
            <label htmlFor="steps" className="block mb-2 font-medium">
              Steps
            </label>
            <input
              type="number"
              id="steps"
              name="steps"
              value={formData.steps}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
              min="20"
              max="50"
            />
          </div>

          <div>
            <label htmlFor="guidanceScale" className="block mb-2 font-medium">
              Guidance Scale
            </label>
            <input
              type="number"
              id="guidanceScale"
              name="guidanceScale"
              value={formData.guidanceScale}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
              min="1"
              max="20"
              step="0.1"
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleInputChange}
              className="form-checkbox"
            />
            <span>Make Public</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="saveToGallery"
              checked={formData.saveToGallery}
              onChange={handleInputChange}
              className="form-checkbox"
            />
            <span>Save to Gallery</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </form>

      {error && (
        <div className="text-red-500 mb-4">
          Error: {error}
        </div>
      )}

      {imageUrl && (
        <div className="relative aspect-square w-full max-w-2xl mx-auto">
          <Image
            src={imageUrl}
            alt="Generated image"
            fill
            className="object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

export default Create;
