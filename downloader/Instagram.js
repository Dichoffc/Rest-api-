const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {

  // Fungsi scraper download Instagram dari igram.world
  async function instagramDownloaderIgram(urlInstagram) {
    try {
      const response = await axios.post('https://igram.world/api/ig', {
        url: urlInstagram,
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

  // Endpoint untuk download Instagram dari igram.world
  app.get('/igdl', async (req, res) => {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'Parameter URL Instagram wajib diisi.' });
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
