const imageCache = {};

export async function getDestinationImage(query) {
  if (imageCache[query]) return imageCache[query];
  
  const apiKey = import.meta.env.VITE_PEXELS_KEY;
  if (!apiKey) return null;
  
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: apiKey } }
    );
    if (!res.ok) throw new Error('Pexels API error');
    const data = await res.json();
    
    if (data.photos && data.photos.length > 0) {
      const url = data.photos[0].src.large2x;
      imageCache[query] = url;
      return url;
    }
    
    // Retry with simpler query (just first word + 'travel')
    const simpleQuery = query.split(' ')[0] + ' travel';
    if (simpleQuery !== query) {
      const res2 = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(simpleQuery)}&per_page=1&orientation=landscape`,
        { headers: { Authorization: apiKey } }
      );
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2.photos && data2.photos.length > 0) {
          const url = data2.photos[0].src.large2x;
          imageCache[query] = url;
          return url;
        }
      }
    }
    
    return null;
  } catch (err) {
    console.error('Image fetch failed:', err);
    return null;
  }
}

export async function getHeroVideo() {
  const apiKey = import.meta.env.VITE_PEXELS_KEY;
  if (!apiKey) return null;
  
  try {
    const queries = [
      'tropical beach aerial drone',
      'beautiful sunset travel cinematic',
      'europe city aerial golden hour',
      'mountain valley aerial cinematic'
    ];
    const query = queries[Math.floor(Math.random() * queries.length)];
    const res = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape&size=large`,
      { headers: { Authorization: apiKey } }
    );
    if (!res.ok) throw new Error('Pexels Video API error');
    const data = await res.json();
    
    if (data.videos && data.videos.length > 0) {
      // Pick a random video from results for variety
      const video = data.videos[Math.floor(Math.random() * data.videos.length)];
      // Prefer HD quality, largest resolution available
      const hdFile = video.video_files
        .filter(f => f.quality === 'hd')
        .sort((a, b) => (b.width || 0) - (a.width || 0))[0] || video.video_files[0];
      return {
        videoUrl: hdFile.link,
        imageUrl: video.image
      };
    }
    return null;
  } catch (err) {
    console.error('Hero video fetch failed:', err);
    return null;
  }
}
