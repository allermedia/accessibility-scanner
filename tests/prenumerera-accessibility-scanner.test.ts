import { test } from '@playwright/test';
import { Result } from 'axe-core';
import { injectAxe, getViolations } from 'axe-playwright';
import { GroupedViolation } from '../src/types/groupedViolation';
import writeHtmlReport from '../src/utils/createHtmlReport';
import dotenv from 'dotenv';
import fetchSitemapUrls from '../src/utils/getUrlsFromSitemap';
import { waitForAnimations } from '../src/utils/waitForAnimations';
dotenv.config();
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'test'}` });

// Store all violations per page
let urls: string[] = [];
const allViolationsPerPage: Record<string, Result[]> = {};
// Parse tags from .env or use default
const axeTags = (process.env.AXE_TAGS!).split(',');

// List of URLs to scan
test.beforeAll(async () => {
    urls = await fetchSitemapUrls(process.env.PRENUMERERA_URL!)
        .then(urls => {
            console.log(`Fetched ${urls.length} URLs from sitemap.`);
            return urls;
        })
        .catch(err => {
            console.error('Error fetching sitemap URLs:', err);
            return [];
        });
});

// Single test that loops over all URLs
test('Accessibility scan for all URLs', async ({ page }) => {

    test.setTimeout(120000000);

    const startUrl = process.env.PRENUMERERA_URL!;

    console.log(`Navigating to: ${startUrl}`);
    await page.goto(startUrl);

    await page.waitForLoadState('domcontentloaded');
    console.log('Page loaded.');
    await waitForAnimations(page);
    console.log('Animations completed.');

    const consentButtonSelector = 'button#onetrust-accept-btn-handler';
    try {
        await page.waitForSelector(consentButtonSelector, { timeout: 7000 });
        const consentButton = await page.$(consentButtonSelector);
        if (consentButton) {
            console.log('Clicking consent button...');
            await consentButton.click();
            await page.waitForTimeout(500);
            console.log('Consent accepted.');
        }
    } catch {
        console.log('Consent button not found.');
        await page.screenshot({ path: 'artifacts/consent-button-not-found.png', fullPage: true });
    }

    const minaSidorLink = await page.$('a[aria-label="Mina sidor"]');
    if (minaSidorLink) {
        console.log('Clicking "Mina sidor" link...');
        await Promise.all([
            page.waitForLoadState('domcontentloaded'),
            minaSidorLink.click(),
        ]);
        console.log('"Mina sidor" page loaded.');
    } else {
        console.log('"Mina sidor" link not found.');
    }

    console.log('Filling in login form...');
    await page.fill('input#email', process.env.PRENUMERERA_LOGIN_EMAIL!);
    await page.fill('input#password', process.env.PRENUMERERA_LOGIN_PASSWORD!);

    console.log('Clicking login button...');
    await page.click('button.btn--login[type="submit"]');

    console.log('Waiting for login greeting...');
    await page.waitForSelector('h3.ms-nav__customer-info__greeting', { timeout: 500000 });
    console.log('Login successful.');

    await page.waitForTimeout(2000);

    for (const url of urls) {

        console.log(`Navigating to: ${url}`);
        await page.goto(url);

        await page.waitForLoadState('domcontentloaded');
        console.log('Page loaded.');
        await waitForAnimations(page);
        console.log('Animations completed.');
        try {
            await page.waitForSelector('main', { timeout: 5000 });
        } catch {
            console.warn(`Skipping a11y check: <main> not found on ${url}, possible error page`);
            continue;
        }

        await injectAxe(page);

        console.log('Running accessibility scan...');
        const violations = await getViolations(page, undefined, {
            runOnly: {
                type: 'tag',
                values: axeTags,
            },
        });
        console.log(`Found ${violations.length} accessibility violations.`);

        allViolationsPerPage[url] = violations;
    }

    const totalViolations = Object.values(allViolationsPerPage).flat();
    if (totalViolations.length > 0) {
        throw new Error(`Accessibility violations found: ${totalViolations.length}`);
    }
});

// Combine and write report after all tests
test.afterAll(async () => {
    const grouped: Record<string, GroupedViolation> = {};

    // Group violations by rule id, aggregate nodes and affected URLs
    for (const [url, violations] of Object.entries(allViolationsPerPage)) {
        for (const v of violations) {
            if (!grouped[v.id]) {
                grouped[v.id] = {
                    id: v.id,
                    description: v.description,
                    help: v.help,
                    helpUrl: v.helpUrl,
                    impact: v.impact ?? '',
                    tags: v.tags,
                    nodes: [],
                    urls: new Set(),
                };
            }
            grouped[v.id].urls.add(url);
            for (const node of v.nodes) {
                grouped[v.id].nodes.push({ ...node, url });
            }
        }
    }

    writeHtmlReport(grouped, urls, 'artifacts', `prenumerera-accessibility-report-${process.env.NODE_ENV!}.html`);
});


