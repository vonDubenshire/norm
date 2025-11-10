import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

const VideosSection = () => {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch("/consolidated_youtube_data.json")
      .then(response => response.json())
      .then(data => {
        setVideos(data);
      })
      .catch(error => {
        console.error("Error loading video data:", error);
        setVideos([]);
      });
  }, []);

  const filteredVideos = videos.filter(video =>
    video.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video["Channel name"]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getYouTubeEmbedUrl = (url) => {
    const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/))([^&?]+)/);
    return videoIdMatch ? `https://www.youtube.com/embed/${videoIdMatch[1]}` : null;
  };

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-4xl font-bold text-center mb-8 text-white">Norm Macdonald Video Archive</h2>
      <p className="text-center text-lg text-slate-300 mb-12">A comprehensive collection of Norm Macdonald's best moments, interviews, and stand-up performances from YouTube.</p>

      <div className="mb-8 flex justify-center">
        <Input
          type="text"
          placeholder="Search videos by title, description, or channel..."
          className="max-w-md w-full bg-slate-800 text-white border-slate-600 placeholder-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.length > 0 ? (
          filteredVideos.map((video, index) => {
            const embedUrl = getYouTubeEmbedUrl(video['Video url']);
            return (
              <Card key={index} className="bg-slate-800/50 border-slate-700 text-white flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2 text-white">{video.Title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  {embedUrl ? (
                    <div className="aspect-video w-full mb-4">
                      <iframe
                        className="w-full h-full rounded-md"
                        src={embedUrl}
                        title={video.Title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : video['Thumbnail url'] ? (
                    <img src={video['Thumbnail url']} alt={video.Title} className="w-full h-auto rounded-md mb-4" />
                  ) : (
                    <div className="w-full aspect-video bg-gray-800 rounded-md flex items-center justify-center text-gray-400 mb-4">No Thumbnail</div>
                  )}
                  <p className="text-sm text-slate-300 line-clamp-3 mb-2">{video.Description || 'No description available.'}</p>
                  <p className="text-xs text-slate-400">Channel: {video['Channel name'] || 'N/A'}</p>
                  <p className="text-xs text-slate-400">Duration: {video.Duration || 'N/A'}</p>
                  <p className="text-xs text-slate-400">Views: {video.Views ? parseInt(video.Views).toLocaleString() : 'N/A'}</p>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button asChild className="w-full">
                    <a href={video['Video url']} target="_blank" rel="noopener noreferrer">Watch on YouTube</a>
                  </Button>
                </div>
              </Card>
            );
          })
        ) : (
          <p className="col-span-full text-center text-slate-400">No videos found matching your search criteria.</p>
        )}
      </div>
    </div>
  );
};

export default VideosSection;
