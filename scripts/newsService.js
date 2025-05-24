const fetch = require('node-fetch');

const urls = {
    ab: 'http://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml',
    gnews1: 'https://rss.app/feeds/fsGZHkrUNHGzFmsd.xml',
    gnews2: 'https://rss.app/feeds/ZqLpsjBXCfy4oC33.xml'
};

async function getFeed(source) {
    if (!urls[source]) {
        console.log('No URL for source:', source);
        return null;
    }

    let res;
    try {
        res = await fetch(urls[source], {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
    } catch (err) {
        console.log('Fetch failed:', err.message);
        return null;
    }

    if (!res.ok) {
        console.log(`Bad status (${res.status}) for ${source}`);
        return null;
    }

    return res.text();
}

module.exports = { getFeed };