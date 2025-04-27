const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
  // Fungsi scraping dari SnapInsta
  async function scrapeSnapInsta(urlInstagram) {
    try {
      const response = await axios.get(`https://snapinsta.to/en/instagram-video-downloader?url=${encodeURIComponent(urlInstagram)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);

      const results = [];
      $('.download-items__btn').each((index, element) => {
        const downloadLink = $(element).attr('href');
        const type = $(element).text().includes('MP4') ? 'video' : 'image';

        if (downloadLink) {
          results.push({
            type,
            url: downloadLink
          });
        }
      });

      return results;
    } catch (error) {
      console.error('Error scraping SnapInsta:', error.message);
      return [];
    }
  }

  // Endpoint
  app.get('/igdl', async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send('Masukkan parameter url.');
    }

    try {
      const data = await scrapeSnapInsta(url);
      if (data.length === 0) {
        return res.status(404).send('Gagal mengambil link download.');
      }

      // Kalau berhasil, langsung tampilkan link download pertama
      res.redirect(data[0].url);

    } catch (error) {
      console.error(error);
      res.status(500).send('Terjadi kesalahan saat mengambil data.');
    }
  });
};
