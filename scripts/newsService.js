const fetch = require('node-fetch');

const RSS_URLS = {
    agenciaBrasil: 'http://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml',
    googleNews1: 'https://rss.app/feeds/fsGZHkrUNHGzFmsd.xml',
    googleNews2: 'https://rss.app/feeds/ZqLpsjBXCfy4oC33.xml'
};

class NewsService {
    static async fetchRSS(source) {
        try {
            const url = RSS_URLS[source];
            if (!url) throw new Error('Invalid source');

            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124'
                }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.text();
        } catch (error) {
            console.error('RSS fetch error:', error);
            throw error;
        }
    }
}

module.exports = NewsService;
