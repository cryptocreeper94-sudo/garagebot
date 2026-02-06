import * as cheerio from 'cheerio';

export interface ProductResult {
  id: string;
  name: string;
  price: number | null;
  originalPrice?: number | null;
  imageUrl?: string;
  productUrl: string;
  retailer: string;
  retailerSlug: string;
  retailerColor: string;
  inStock?: boolean;
  shipping?: string;
  rating?: number;
  reviewCount?: number;
  partNumber?: string;
  isAffiliate: boolean;
  affiliateUrl: string;
}

export interface PriceComparisonResult {
  query: string;
  vehicle?: { year?: string; make?: string; model?: string };
  products: ProductResult[];
  retailerLinks: { name: string; slug: string; searchUrl: string; color: string; isAffiliate: boolean }[];
  timestamp: number;
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        ...options.headers,
      },
    });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

function buildSearchQuery(query: string, vehicle?: { year?: string; make?: string; model?: string }): string {
  let fullQuery = query;
  if (vehicle?.year && vehicle?.make && vehicle?.model) {
    fullQuery = `${vehicle.year} ${vehicle.make} ${vehicle.model} ${query}`;
  } else if (vehicle?.make && vehicle?.model) {
    fullQuery = `${vehicle.make} ${vehicle.model} ${query}`;
  }
  return fullQuery;
}

async function fetchEbayProducts(query: string, vehicle?: { year?: string; make?: string; model?: string }): Promise<ProductResult[]> {
  const fullQuery = buildSearchQuery(query, vehicle);
  const campaignId = process.env.EBAY_CAMPAIGN_ID || '5339140935';
  const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(fullQuery)}&_sacat=6000&LH_BIN=1&_sop=15&rt=nc`;

  try {
    const res = await fetchWithTimeout(searchUrl);
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const products: ProductResult[] = [];

    const items = $('.srp-results > li.s-card, li.s-item');
    let count = 0;
    items.each((i, el) => {
      if (count >= 8) return false;
      const $el = $(el);
      const itemText = $el.text();

      const name = $el.find('h2 span, span[role="heading"], div.s-item__title span').first().text().trim()
                   || $el.find('h2, .s-item__title').first().text().trim();
      if (!name || name.length < 5 || name === 'Shop on eBay' || name.includes('Results matching')) return;

      const priceMatches = itemText.match(/\$(\d+[\.,]\d{2})/);
      const price = priceMatches ? parseFloat(priceMatches[1].replace(',', '')) : null;

      const origPriceMatches = itemText.match(/\$(\d+[\.,]\d{2}).*?\$(\d+[\.,]\d{2})/);
      let originalPrice: number | null = null;
      if (origPriceMatches) {
        const first = parseFloat(origPriceMatches[1].replace(',', ''));
        const second = parseFloat(origPriceMatches[2].replace(',', ''));
        if (second > first) originalPrice = second;
      }

      const imageUrl = $el.find('img').first().attr('src') || undefined;
      const itemUrl = $el.find('a').first().attr('href') || '';
      const hasFreeDel = itemText.toLowerCase().includes('free delivery') || itemText.toLowerCase().includes('free shipping');
      const shipping = hasFreeDel ? 'Free delivery' : 'Check shipping';

      if (price && price > 0) {
        count++;
        const affiliateUrl = itemUrl.includes('ebay.com')
          ? `${itemUrl}${itemUrl.includes('?') ? '&' : '?'}mkcid=1&mkrid=711-53200-19255-0&campid=${campaignId}&toolid=10001`
          : `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(fullQuery)}&_sacat=6000&mkcid=1&mkrid=711-53200-19255-0&campid=${campaignId}&toolid=10001`;
        products.push({
          id: `ebay-${count}`,
          name: name.substring(0, 120),
          price,
          originalPrice,
          imageUrl: imageUrl?.includes('ebayimg.com') ? imageUrl : undefined,
          productUrl: itemUrl,
          retailer: 'eBay Motors',
          retailerSlug: 'ebay',
          retailerColor: '#E53238',
          inStock: true,
          shipping,
          isAffiliate: true,
          affiliateUrl,
        });
      }
    });

    return products;
  } catch (e) {
    console.error('[PriceCompare] eBay fetch failed:', e);
    return [];
  }
}

async function fetchAmazonProducts(query: string, vehicle?: { year?: string; make?: string; model?: string }): Promise<ProductResult[]> {
  const fullQuery = buildSearchQuery(query, vehicle);
  const associateTag = process.env.AMAZON_ASSOCIATE_ID || 'garagebot0e-20';
  const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(fullQuery)}&i=automotive&tag=${associateTag}`;

  try {
    const res = await fetchWithTimeout(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const products: ProductResult[] = [];

    $('div[data-component-type="s-search-result"]').each((i, el) => {
      if (products.length >= 8) return false;
      const $el = $(el);
      const name = $el.find('h2 span').first().text().trim() || $el.find('h2').text().trim();
      if (!name || name.length < 5) return;

      const wholePart = $el.find('.a-price-whole').first().text().replace(/[^0-9]/g, '');
      const fracPart = $el.find('.a-price-fraction').first().text().replace(/[^0-9]/g, '');
      const price = wholePart ? parseFloat(`${wholePart}.${fracPart || '00'}`) : null;

      const originalPriceText = $el.find('.a-price.a-text-price .a-offscreen').first().text().replace(/[^0-9.]/g, '');
      const originalPrice = parseFloat(originalPriceText) || null;

      const imageUrl = $el.find('img.s-image').attr('src') || undefined;
      const asin = $el.attr('data-asin') || '';
      const productUrl = asin ? `https://www.amazon.com/dp/${asin}?tag=${associateTag}` : searchUrl;

      const ratingText = $el.find('.a-icon-alt').first().text();
      const ratingMatch = ratingText.match(/([\d.]+) out of/);
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;
      const reviewText = $el.find('.a-size-base.s-underline-text').first().text().replace(/[^0-9]/g, '');
      const reviewCount = parseInt(reviewText) || undefined;

      if (price && price > 0) {
        products.push({
          id: `amazon-${asin || i}`,
          name: name.substring(0, 120),
          price,
          originalPrice,
          imageUrl,
          productUrl,
          retailer: 'Amazon',
          retailerSlug: 'amazon',
          retailerColor: '#FF9900',
          inStock: true,
          shipping: 'Prime eligible',
          rating,
          reviewCount,
          isAffiliate: true,
          affiliateUrl: productUrl,
        });
      }
    });

    return products;
  } catch (e) {
    console.error('[PriceCompare] Amazon fetch failed:', e);
    return [];
  }
}

async function fetchAutoZoneProducts(query: string, vehicle?: { year?: string; make?: string; model?: string }): Promise<ProductResult[]> {
  const fullQuery = buildSearchQuery(query, vehicle);
  const searchUrl = `https://www.autozone.com/searchresult?searchText=${encodeURIComponent(fullQuery)}`;

  try {
    const apiUrl = `https://www.autozone.com/rest/search/v3/results?searchText=${encodeURIComponent(fullQuery)}&pageSize=8`;
    const res = await fetchWithTimeout(apiUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
        'Referer': 'https://www.autozone.com/',
      },
    });

    if (!res.ok) {
      return [{
        id: 'autozone-search',
        name: `Search AutoZone for "${query}"`,
        price: null,
        productUrl: searchUrl,
        retailer: 'AutoZone',
        retailerSlug: 'autozone',
        retailerColor: '#FF6600',
        inStock: true,
        shipping: 'Free Same-Day Pickup',
        isAffiliate: true,
        affiliateUrl: searchUrl,
      }];
    }

    const data = await res.json();
    const products: ProductResult[] = [];

    if (data?.results) {
      data.results.slice(0, 8).forEach((item: any, i: number) => {
        const price = item.price?.retailPrice || item.price?.salePrice || null;
        const originalPrice = item.price?.retailPrice && item.price?.salePrice ? item.price.retailPrice : null;
        products.push({
          id: `autozone-${i}`,
          name: (item.name || item.description || '').substring(0, 120),
          price: price ? parseFloat(price) : null,
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          imageUrl: item.imageUrl || undefined,
          productUrl: item.pdpUrl ? `https://www.autozone.com${item.pdpUrl}` : searchUrl,
          retailer: 'AutoZone',
          retailerSlug: 'autozone',
          retailerColor: '#FF6600',
          inStock: item.availability !== 'OUT_OF_STOCK',
          shipping: 'Free Same-Day Pickup',
          partNumber: item.partNumber,
          isAffiliate: true,
          affiliateUrl: item.pdpUrl ? `https://www.autozone.com${item.pdpUrl}` : searchUrl,
        });
      });
    }

    return products.length > 0 ? products : [{
      id: 'autozone-search',
      name: `Search AutoZone for "${query}"`,
      price: null,
      productUrl: searchUrl,
      retailer: 'AutoZone',
      retailerSlug: 'autozone',
      retailerColor: '#FF6600',
      inStock: true,
      shipping: 'Free Same-Day Pickup',
      isAffiliate: true,
      affiliateUrl: searchUrl,
    }];
  } catch (e) {
    console.error('[PriceCompare] AutoZone fetch failed:', e);
    return [{
      id: 'autozone-search',
      name: `Search AutoZone for "${query}"`,
      price: null,
      productUrl: searchUrl,
      retailer: 'AutoZone',
      retailerSlug: 'autozone',
      retailerColor: '#FF6600',
      inStock: true,
      shipping: 'Free Same-Day Pickup',
      isAffiliate: true,
      affiliateUrl: searchUrl,
    }];
  }
}

async function fetchOReillyProducts(query: string, vehicle?: { year?: string; make?: string; model?: string }): Promise<ProductResult[]> {
  const fullQuery = buildSearchQuery(query, vehicle);
  const searchUrl = `https://www.oreillyauto.com/shop/b/${encodeURIComponent(fullQuery)}`;

  return [{
    id: 'oreilly-search',
    name: `Search O'Reilly for "${query}"`,
    price: null,
    productUrl: searchUrl,
    retailer: "O'Reilly Auto Parts",
    retailerSlug: 'oreilly',
    retailerColor: '#00843D',
    inStock: true,
    shipping: 'Free Same-Day Pickup',
    isAffiliate: false,
    affiliateUrl: searchUrl,
  }];
}

async function fetchAdvanceAutoProducts(query: string, vehicle?: { year?: string; make?: string; model?: string }): Promise<ProductResult[]> {
  const fullQuery = buildSearchQuery(query, vehicle);
  const searchUrl = `https://shop.advanceautoparts.com/web/SearchResults?searchTerm=${encodeURIComponent(fullQuery)}`;

  return [{
    id: 'advance-search',
    name: `Search Advance Auto for "${query}"`,
    price: null,
    productUrl: searchUrl,
    retailer: 'Advance Auto Parts',
    retailerSlug: 'advance',
    retailerColor: '#CC0000',
    inStock: true,
    shipping: 'Free Same-Day Pickup',
    isAffiliate: true,
    affiliateUrl: searchUrl,
  }];
}

async function fetchNAPAProducts(query: string, vehicle?: { year?: string; make?: string; model?: string }): Promise<ProductResult[]> {
  const fullQuery = buildSearchQuery(query, vehicle);
  const searchUrl = `https://www.napaonline.com/en/search?q=${encodeURIComponent(fullQuery)}`;

  return [{
    id: 'napa-search',
    name: `Search NAPA for "${query}"`,
    price: null,
    productUrl: searchUrl,
    retailer: 'NAPA Auto Parts',
    retailerSlug: 'napa',
    retailerColor: '#003DA5',
    inStock: true,
    shipping: 'Free Same-Day Pickup',
    isAffiliate: false,
    affiliateUrl: searchUrl,
  }];
}

async function fetchRockAutoProducts(query: string, vehicle?: { year?: string; make?: string; model?: string }): Promise<ProductResult[]> {
  const fullQuery = buildSearchQuery(query, vehicle);
  const searchUrl = `https://www.rockauto.com/en/catalog/?a=${encodeURIComponent(fullQuery)}`;

  return [{
    id: 'rockauto-search',
    name: `Search RockAuto for "${query}"`,
    price: null,
    productUrl: searchUrl,
    retailer: 'RockAuto',
    retailerSlug: 'rockauto',
    retailerColor: '#336699',
    inStock: true,
    shipping: 'Ships nationwide',
    isAffiliate: false,
    affiliateUrl: searchUrl,
  }];
}

async function fetchWalmartProducts(query: string, vehicle?: { year?: string; make?: string; model?: string }): Promise<ProductResult[]> {
  const fullQuery = buildSearchQuery(query, vehicle);
  const searchUrl = `https://www.walmart.com/search?q=${encodeURIComponent(fullQuery)}&cat_id=91083`;

  try {
    const res = await fetchWithTimeout(searchUrl);
    if (!res.ok) return [];
    const html = await res.text();
    const $ = cheerio.load(html);
    const products: ProductResult[] = [];

    $('[data-item-id]').each((i, el) => {
      if (i >= 6) return false;
      const $el = $(el);
      const name = $el.find('[data-automation-id="product-title"]').text().trim();
      if (!name) return;

      const priceText = $el.find('[data-automation-id="product-price"] .f2').text().replace(/[^0-9.]/g, '');
      const price = parseFloat(priceText) || null;
      const imageUrl = $el.find('img[data-testid="productTileImage"]').attr('src') || undefined;
      const linkEl = $el.find('a[link-identifier]');
      const href = linkEl.attr('href') || '';
      const productUrl = href.startsWith('http') ? href : `https://www.walmart.com${href}`;

      if (price && price > 0) {
        products.push({
          id: `walmart-${i}`,
          name: name.substring(0, 120),
          price,
          imageUrl,
          productUrl,
          retailer: 'Walmart',
          retailerSlug: 'walmart',
          retailerColor: '#0071CE',
          inStock: true,
          shipping: 'Free Pickup',
          isAffiliate: false,
          affiliateUrl: productUrl,
        });
      }
    });

    return products.length > 0 ? products : [{
      id: 'walmart-search',
      name: `Search Walmart for "${query}"`,
      price: null,
      productUrl: searchUrl,
      retailer: 'Walmart',
      retailerSlug: 'walmart',
      retailerColor: '#0071CE',
      inStock: true,
      shipping: 'Free Pickup',
      isAffiliate: false,
      affiliateUrl: searchUrl,
    }];
  } catch (e) {
    console.error('[PriceCompare] Walmart fetch failed:', e);
    return [{
      id: 'walmart-search',
      name: `Search Walmart for "${query}"`,
      price: null,
      productUrl: searchUrl,
      retailer: 'Walmart',
      retailerSlug: 'walmart',
      retailerColor: '#0071CE',
      inStock: true,
      shipping: 'Free Pickup',
      isAffiliate: false,
      affiliateUrl: searchUrl,
    }];
  }
}

export async function comparePrice(
  query: string,
  vehicle?: { year?: string; make?: string; model?: string },
  vehicleType?: string
): Promise<PriceComparisonResult> {
  console.log(`[PriceCompare] Searching: "${query}" vehicle: ${JSON.stringify(vehicle)} type: ${vehicleType}`);

  const fetchers = [
    fetchEbayProducts(query, vehicle),
    fetchAmazonProducts(query, vehicle),
    fetchAutoZoneProducts(query, vehicle),
    fetchOReillyProducts(query, vehicle),
    fetchAdvanceAutoProducts(query, vehicle),
    fetchNAPAProducts(query, vehicle),
    fetchRockAutoProducts(query, vehicle),
    fetchWalmartProducts(query, vehicle),
  ];

  const results = await Promise.allSettled(fetchers);

  const allProducts: ProductResult[] = [];
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allProducts.push(...result.value);
    }
  });

  const productsWithPrices = allProducts.filter(p => p.price !== null && p.price > 0);
  const productsWithoutPrices = allProducts.filter(p => p.price === null || p.price === 0);

  productsWithPrices.sort((a, b) => (a.price || 0) - (b.price || 0));

  const sortedProducts = [...productsWithPrices, ...productsWithoutPrices];

  const fullQuery = buildSearchQuery(query, vehicle);
  const retailerLinks = [
    { name: 'AutoZone', slug: 'autozone', searchUrl: `https://www.autozone.com/searchresult?searchText=${encodeURIComponent(fullQuery)}`, color: '#FF6600', isAffiliate: true },
    { name: "O'Reilly", slug: 'oreilly', searchUrl: `https://www.oreillyauto.com/shop/b/${encodeURIComponent(fullQuery)}`, color: '#00843D', isAffiliate: false },
    { name: 'Advance Auto', slug: 'advance', searchUrl: `https://shop.advanceautoparts.com/web/SearchResults?searchTerm=${encodeURIComponent(fullQuery)}`, color: '#CC0000', isAffiliate: true },
    { name: 'NAPA', slug: 'napa', searchUrl: `https://www.napaonline.com/en/search?q=${encodeURIComponent(fullQuery)}`, color: '#003DA5', isAffiliate: false },
    { name: 'RockAuto', slug: 'rockauto', searchUrl: `https://www.rockauto.com/en/catalog/?a=${encodeURIComponent(fullQuery)}`, color: '#336699', isAffiliate: false },
    { name: 'Amazon', slug: 'amazon', searchUrl: `https://www.amazon.com/s?k=${encodeURIComponent(fullQuery)}&i=automotive&tag=${process.env.AMAZON_ASSOCIATE_ID || 'garagebot0e-20'}`, color: '#FF9900', isAffiliate: true },
    { name: 'eBay Motors', slug: 'ebay', searchUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(fullQuery)}&_sacat=6000&mkcid=1&mkrid=711-53200-19255-0&campid=${process.env.EBAY_CAMPAIGN_ID || '5339140935'}&toolid=10001`, color: '#E53238', isAffiliate: true },
    { name: 'Walmart', slug: 'walmart', searchUrl: `https://www.walmart.com/search?q=${encodeURIComponent(fullQuery)}&cat_id=91083`, color: '#0071CE', isAffiliate: false },
    { name: 'Rexing', slug: 'rexing', searchUrl: `https://rexing.com/?s=${encodeURIComponent(fullQuery)}&post_type=product&ref=5357356`, color: '#1A1A2E', isAffiliate: true },
    { name: 'SILAZANE50', slug: 'silazane50', searchUrl: `https://www.anrdoezrs.net/click-101643977-7675405?url=${encodeURIComponent(`https://silazane50usa.com/collections/all?q=${fullQuery}`)}`, color: '#C4A35A', isAffiliate: true },
  ];

  console.log(`[PriceCompare] Found ${productsWithPrices.length} products with prices, ${productsWithoutPrices.length} retailer links`);

  return {
    query,
    vehicle,
    products: sortedProducts,
    retailerLinks,
    timestamp: Date.now(),
  };
}
