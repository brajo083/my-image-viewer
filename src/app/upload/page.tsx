"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'creating' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const handleSubmit = async () => {
    if (!file || !title || !category) {
      setMessage('Please select a file and enter a title and category.');
      return;
    }

    setStatus('uploading');
    setMessage('Generating secure upload link...');

    try {
      // Step 1: Get a presigned URL
      const presignedResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!presignedResponse.ok) throw new Error('Failed to get presigned URL.');
      const { presignedUrl, key } = await presignedResponse.json();

      // Step 2: Upload the file directly to S3
      setMessage('Uploading file...');
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!uploadResponse.ok) throw new Error('File upload to S3 failed.');

      // Step 3: Create the image record in our database
      setStatus('creating');
      setMessage('Creating database record...');
      const imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_S3_REGION}.amazonaws.com/${key}`;
      
      const createResponse = await fetch('/api/images/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, category, imageUrl }),
      });
      if (!createResponse.ok) throw new Error('Failed to create database record.');

      setStatus('success');
      setMessage(`Image "${title}" added successfully!`);
      setFile(null);
      setTitle('');
      setCategory('');

    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('An error occurred. Please check the console for details.');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 border-b pb-4 text-4xl font-bold text-gray-800">
          Upload New Image
        </h1>
        <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"/>
          </div>
          <div>
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">Image File (up to 50MB)</label>
            <input id="file-upload" type="file" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
          </div>
          <button onClick={handleSubmit} disabled={status === 'uploading' || status === 'creating'} className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-blue-700 disabled:bg-gray-400">
            {status === 'uploading' ? 'Uploading...' : status === 'creating' ? 'Saving...' : 'Upload and Save'}
          </button>
          {message && (
            <div className={`mt-2 text-sm ${status === 'error' ? 'text-red-600' : status === 'success' ? 'text-green-600' : 'text-gray-600'}`}>
              {message}
            </div>
          )}
        </div>
        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:underline">&larr; Back to Gallery</Link>
        </div>
      </div>
    </main>
  );
}

