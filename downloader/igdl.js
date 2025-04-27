const axios = require('axios');

module.exports = function(app) {

  // Fungsi scraper Instagram
  async function instagramDownloader(url) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10)' // Pakai user-agent mobile
        }
      });

      const jsonString = data.match(/<script type="application\/ld\+json">(.+?)<\/script>/);

      if (!jsonString) return null;

      const jsonData = JSON.parse(jsonString[1]);
      return {
        title: jsonData.caption || 'No Title',
        thumbnail: jsonData.thumbnailUrl,
        video: jsonData.contentUrl,
        source: 'instagram'
      };
    } catch (error) {
      console.error('Error fetching Instagram:', error.message);
      return null;
    }
  }

  // Endpoint scraper Instagram
  app.get('/instagram', async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        status: false,
        creator: 'Kyy',
        code: 400,
        message: 'Masukkan parameter url.'
      });
    }

    try {
      const data = await instagramDownloader(url);

      if (!data) {
        return res.status(404).json({
          status: false,
          creator: 'Kyy',
          code: 404,
          message: 'Gagal mengambil data dari Instagram. Pastikan URL valid.'
        });
      }

      return res.status(200).json({
        status: true,
        creator: 'Kyy',
        code: 200,
        result: data
      });

    } catch (error) {
      return res.status(500).json({
        status: false,
        creator: 'Kyy',
        code: 500,
        message: `Terjadi kesalahan: ${error.message}`
      });
    }
  });

};
