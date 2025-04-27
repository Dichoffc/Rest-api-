const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
  // Fungsi scraping dari Downloadgram
  async function scrapeDownloadgram(urlInstagram) {
    try {
      const response = await axios.get(`https://downloadgram.org/?url=${encodeURIComponent(urlInstagram)}`);
      const $ = cheerio.load(response.data);

      const results = [];

      // Cari link download
      $('a.btn-download').each((index, element) => {
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
      console.error('Error scraping Downloadgram:', error.message);
      return [];
    }
  }

  // Validasi URL Instagram
  function isValidInstagramUrl(url) {
    const regex = /^(https?:\/\/(?:www\.)?instagram\.com\/(?:p|tv|reel)\/[A-Za-z0-9-_]+)/;
    return regex.test(url);
  }

  // Endpoint untuk download
  app.get('/igdl', async (req, res) => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).send('Masukkan parameter URL.');
    }

    if (!isValidInstagramUrl(url)) {
      return res.status(400).send('URL Instagram tidak valid.');
    }

    try {
      const data = await scrapeDownloadgram(url);
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
