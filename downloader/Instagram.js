const axios = require('axios');

module.exports = function(app) {

  // Fungsi download dari igram.world
  async function instagramDownloaderIgram(linkInstagram) {
    try {
      const response = await axios.post('https://igram.world/api/ig', {
        url: linkInstagram,
        lang: 'en'
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;

      if (!data.data || !data.data.medias) {
        return [];
      }

      const results = data.data.medias.map(media => ({
        type: media.type,        // "image" atau "video"
        url: media.url,
        preview: media.preview_url || null
      }));

      return results;
    } catch (error) {
      console.error('Error fetching download page:', error.message);
      return [];
    }
  }

  // Endpoint untuk download IG
  app.get('/igdl', async (req, res) => {
    const { url } = req.query;  // Pakai url sekarang

    if (!url) {
      return res.status(400).json({ error: 'Parameter url wajib diisi.' });
    }

    try {
      const data = await instagramDownloaderIgram(url);
      if (data.length === 0) {
        return res.status(404).json({ message: 'Gagal mengambil link download.' });
      }

      res.status(200).json({
        status: 200,
        creator: "Dibikinin sama ChatGPT Bre",
        data: data
      });
    } catch (error) {
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data.' });
    }
  });

};
