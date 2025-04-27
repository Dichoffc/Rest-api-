const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
  // Fungsi scraping dari InstaDownloader
  async function scrapeInstaDownloader(urlInstagram) {
    try {
      const response = await axios.get(`https://www.instadownloader.co/?url=${encodeURIComponent(urlInstagram)}`);
      const $ = cheerio.load(response.data);

      const results = [];

      // Cari link download
      $('.download-btn').each((index, element) => {
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
      console.error('Error scraping InstaDownloader:', error.message);
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
      const data = await scrapeInstaDownloader(url);
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
