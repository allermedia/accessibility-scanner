import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export default fetchSitemapUrls;

async function fetchSitemapUrls(siteUrl: string): Promise<string[]> {
    if (!siteUrl) {
        throw new Error('Site URL is required');
    }
    if (!siteUrl.endsWith('/sitemap.xml')) {
        siteUrl = siteUrl.endsWith('/') ? `${siteUrl}sitemap.xml` : `${siteUrl}/sitemap.xml`;
    }
    const response = await axios.get(siteUrl, { responseType: 'text' });
    const xml = response.data;
    const result = await parseStringPromise(xml);
    const base = new URL(siteUrl).origin;
    let urls: string[] = [];

    // Handles both urlset and sitemapindex types
    if (result.urlset && result.urlset.url) {
        for (const urlEntry of result.urlset.url) {
            if (urlEntry.loc && urlEntry.loc[0]) {
                try {
                    const path = new URL(urlEntry.loc[0]).pathname + (new URL(urlEntry.loc[0]).search || '');
                    urls.push(base + path);
                } catch {
                    urls.push(urlEntry.loc[0]);
                }
            }
        }
    } else if (result.sitemapindex && result.sitemapindex.sitemap) {
        for (const sitemapEntry of result.sitemapindex.sitemap) {
            if (sitemapEntry.loc && sitemapEntry.loc[0]) {
                try {
                    const path = new URL(sitemapEntry.loc[0]).pathname + (new URL(sitemapEntry.loc[0]).search || '');
                    urls.push(base + path);
                } catch {
                    urls.push(sitemapEntry.loc[0]);
                }
            }
        }
    }

    return urls;
}