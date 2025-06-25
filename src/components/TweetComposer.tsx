import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tweetsApi } from '../utils/api';
import { Image, X, Smile, Calendar, MapPin } from 'lucide-react';

interface TweetComposerProps {
  onTweetPosted: (tweet: any) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function TweetComposer({ onTweetPosted, placeholder = "What's happening?", autoFocus = false }: TweetComposerProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (images.length + validFiles.length > 4) {
      alert('You can only upload up to 4 images per tweet.');
      return;
    }

    const newImages = [...images, ...validFiles];
    setImages(newImages);

    // Create previews
    const newPreviews = [...imagePreviews];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && images.length === 0) return;

    setPosting(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      images.forEach(image => {
        formData.append('images', image);
      });

      const newTweet = await tweetsApi.createWithImages(formData);
      onTweetPosted(newTweet);
      setContent('');
      setImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error('Error posting tweet:', error);
      alert('Failed to post tweet. Please try again.');
    }
    setPosting(false);
  };

  const remainingChars = 280 - content.length;
  const isOverLimit = remainingChars < 0;
  const canPost = (content.trim() || images.length > 0) && !isOverLimit && !posting;

  if (!user) return null;

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <img
            src={user.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
            alt={user.displayName || user.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xl placeholder-gray-500 border-none resize-none focus:outline-none"
              placeholder={placeholder}
              rows={3}
              maxLength={300}
              autoFocus={autoFocus}
            />

            {/* Image previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-3">
                <div className={`grid gap-2 rounded-2xl overflow-hidden ${
                  imagePreviews.length === 1 ? 'grid-cols-1' :
                  imagePreviews.length === 2 ? 'grid-cols-2' :
                  imagePreviews.length === 3 ? 'grid-cols-2' :
                  'grid-cols-2'
                }`}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className={`w-full object-cover ${
                          imagePreviews.length === 1 ? 'h-64' :
                          imagePreviews.length === 3 && index === 0 ? 'h-32 row-span-2' :
                          'h-32'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tweet actions */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                  disabled={images.length >= 4}
                >
                  <Image className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <Smile className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <Calendar className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <MapPin className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                {content.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full border-2 relative ${
                      isOverLimit ? 'border-red-500' : remainingChars <= 20 ? 'border-yellow-500' : 'border-gray-300'
                    }`}>
                      <div
                        className={`absolute inset-0 rounded-full ${
                          isOverLimit ? 'bg-red-500' : remainingChars <= 20 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{
                          clipPath: `polygon(50% 50%, 50% 0%, ${
                            50 + (content.length / 280) * 50
                          }% 0%, ${
                            50 + (content.length / 280) * 50
                          }% 100%, 50% 100%)`
                        }}
                      />
                    </div>
                    {remainingChars <= 20 && (
                      <span className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-yellow-600'}`}>
                        {remainingChars}
                      </span>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!canPost}
                  className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {posting ? 'Posting...' : 'Tweet'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
      </form>
    </div>
  );
}