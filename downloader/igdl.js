const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {

  // Fungsi scraper Instagram baru
  async function instagramDownloaderV2(url) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10)' // User-Agent mobile
        }
      });

      const $ = cheerio.load(data);
      const script = $('script[type="application/ld+json"]').html();

      if (!script) return null;

      const jsonData = JSON.parse(script);

      let media = [];

      if (jsonData.hasOwnProperty('image') && jsonData.hasOwnProperty('video')) {
        // Kalau ada image & video (contoh reels)
        media.push({
          type: 'video',
          url: jsonData.video.contentUrl
        });
      } else if (jsonData.hasOwnProperty('image')) {
        // Kalau hanya gambar (post biasa)
        if (Array.isArray(jsonData.image)) {
          jsonData.image.forEach(img => {
            media.push({
              type: 'image',
              url: img
            });
          });
        } else {
          media.push({
            type: 'image',
            url: jsonData.image
          });
        }
      }

      return {
        title: jsonData.caption || 'No Title',
        thumbnail: jsonData.thumbnailUrl || (media[0] ? media[0].url : null),
        medias: media,
        source: 'instagram'
      };

    } catch (error) {
      console.error('Error fetching Instagram:', error.message);
      return null;
    }
  }

  // Endpoint baru untuk Instagram Downloader PRO
  app.get('/igdl', async (req, res) => {
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
      const data = await instagramDownloaderV2(url);

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
