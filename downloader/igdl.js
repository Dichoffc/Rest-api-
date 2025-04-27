const axios = require('axios');

module.exports = function(app) {

  // Fungsi scraper Instagram
  async function instagramDownloader(url) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10)', // Pakai user-agent mobile
        }
      });

      const jsonString = data.match(/<script type="application\/ld\+json">(.+?)<\/script>/);

      if (!jsonString) {
        console.error('Tidak bisa menemukan media.');
        return null;
      }

      const jsonData = JSON.parse(jsonString[1]);
      return {
        title: jsonData.caption || 'No Title',
        thumbnail: jsonData.thumbnailUrl,
        video: jsonData.contentUrl,
        source: 'instagram'
      };
    } catch (error) {
      console.error('Error fetching Instagram:', error);
      return null;
    }
  }

  // Endpoint untuk scraper Instagram
  app.get('/igdl', async (req, res) => {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ message: 'Parameter url tidak ditemukan.' });
    }

    try {
      const data = await instagramDownloader(url);
      if (!data) {
        return res.status(404).json({ message: 'Gagal mengambil data dari Instagram.' });
      }

      res.status(200).json({
        status: 200,
        creator: "Lenwy",
        data: data
      });
    } catch (error) {
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data Instagram.' });
    }
  });

};
