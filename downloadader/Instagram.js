const axios = require('axios');
const express = require('express');
const app = express();

async function downloadInstagramVideo(url) {
  try {
    // Menggunakan API pihak ketiga untuk mendownload video Instagram
    const apiUrl = `https://api.savinsta.app/api/instagram?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

    if (response.data && response.data.status === 'success') {
      return response.data.data.video_url; // URL video yang bisa diunduh
    } else {
      throw new Error('Tidak bisa menemukan video.');
    }
  } catch (error) {
    console.error('Error downloading Instagram video:', error.message);
    return null;
  }
}

app.get('/downloadInstagram', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }
  
  try {
    const videoUrl = await downloadInstagramVideo(url);
    if (videoUrl) {
      res.status(200).json({
        status: 200,
        video_url: videoUrl
      });
    } else {
      res.status(404).json({ error: 'Video not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching Instagram video' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
