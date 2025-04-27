const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {

  // Fungsi scraping saveig.app
  async function scrapeSaveIg(instagramUrl) {
    try {
      // Kirim POST ke saveig.app
      const response = await axios.post('https://saveig.app/api/ajaxSearch', new URLSearchParams({
        q: instagramUrl,
        lang: 'en'
      }), {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'x-requested-with': 'XMLHttpRequest'
        }
      });

      const $ = cheerio.load(response.data.data); // mereka balikin HTML di field 'data'

      const results = [];
      $('.download-items__btn').each((i, elem) => {
        const link = $(elem).attr('href');
        const type = $(elem).text().includes('Download Video') ? 'video' : 'image';

        if (link) {
          results.push({
            type,
            url: link
          });
        }
      });

      return results;

    } catch (error) {
      console.error('Error scraping SaveIG:', error.message);
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
      const data = await scrapeSaveIg(url);
      if (data.length === 0) {
        return res.status(404).send('Gagal mengambil link download.');
      }

      // Kalau mau langsung redirect file pertama:
      return res.redirect(data[0].url);

      // Atau kalau mau tampilkan linknya:
      /*
      return res.send(`<a href="${data[0].url}" target="_blank">Klik untuk download ${data[0].type}</a>`);
      */
      
    } catch (error) {
      console.error(error);
      res.status(500).send('Terjadi kesalahan saat mengambil data.');
    }
  });

};
