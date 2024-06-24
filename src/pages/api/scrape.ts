import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

const scrapeProduct = async (url: string) => {
  // Launch Puppeteer with specific options
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  
  try {
    // Set a high timeout value
    await page.goto(url, {
      waitUntil: 'networkidle2', // Wait until the network is idle
      timeout: 120000, // 120 seconds timeout
    });

    const product = await page.evaluate(() => {
      const jsonLd = document.querySelector('script[type="application/ld+json"]');
      if (!jsonLd) {
        console.error('No JSON-LD data found on the page');
        return null;
      }

      const productData = JSON.parse(jsonLd.innerHTML)[0];
      const discount = Math.round(((productData.offers.highPrice - productData.offers.price) / productData.offers.highPrice) * 100);
      return {
        name: productData.name,
        originalPrice: productData.offers.highPrice,
        price: productData.offers.price,
        discount: discount + '%',
        image: productData.image,
      };
    });

    return product;
  } catch (error) {
    console.error('Scraping error:', error);
    return null;
  } finally {
    await browser.close();
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Invalid URL parameter' });
    return;
  }

  try {
    const product = await scrapeProduct(url);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(500).json({ error: 'Failed to scrape the product data' });
    }
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;
