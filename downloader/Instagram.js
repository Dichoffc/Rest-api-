const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {

  // Fungsi scraper download Instagram dari fastdl.app
  async function instagramDownloaderFastdl(urlInstagram) {
    try {
      const response = await axios.post('https://fastdl.app/instagram-downloader', new URLSearchParams({
        url: urlInstagram
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const $ = cheerio.load(response.data);

      const results = [];

      $('.download-items a').each(function () {
        try {
          const linkDownload = $(this).attr('href');
          const type = $(this).find('.download-title').text().trim(); // contoh: "Video", "Image"

          results.push({ type, linkDownload });
        } catch (e) {
          console.error('Error scraping download link:', e);
        }
      });

      return results;
    } catch (error) {
      console.error('Error fetching download page:', error);
      return [];
    }
  }

  // Endpoint untuk download Instagram dari fastdl.app
  app.get('/Instagram', async (req, res) => {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'Parameter URL Instagram wajib diisi.' });
    }

    try {
      const data = await instagramDownloaderFastdl(url);
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
