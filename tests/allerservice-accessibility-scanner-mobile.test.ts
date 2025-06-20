import { test } from '@playwright/test';
import { Result } from 'axe-core';
import { injectAxe, getViolations } from 'axe-playwright';
import { GroupedViolation } from '../src/types/groupedViolation';
import { devices } from '@playwright/test';
import writeHtmlReport from '../src/utils/createHtmlReport';
import dotenv from 'dotenv';
import fetchCsvUrls from '../src/utils/getUrlsFromCsv';
dotenv.config();
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'test'}` });

// Store all violations per page
let urls: string[] = [];
const allViolationsPerPage: Record<string, Result[]> = {};
// Parse tags from .env or use default
const axeTags = (process.env.AXE_TAGS!).split(',');

// List of URLs to scan
test.beforeAll(async () => {
    urls = await fetchCsvUrls(process.env.ALLERSERVICE_URL!)
        .then(urls => {
            console.log(`Fetched ${urls.length} URLs from CSV.`);
            return urls;
        })
        .catch(err => {
            console.error('Error fetching CSV URLs:', err);
            return [];
        });
});

// Single test that loops over all URLs
test('Accessibility scan for all URLs', async ({ browser }) => {

    test.setTimeout(120000000);

    const context = await browser.newContext({
        ...devices['iPhone 12'],
    });
    const page = await context.newPage();

    const startUrl = process.env.ALLERSERVICE_URL!;

    console.log(`Navigating to: ${startUrl}`);
    await page.goto(startUrl);

    await page.waitForLoadState('domcontentloaded');
    console.log('Page loaded.');

    const consentButton = await page.$('button#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll');
    if (consentButton) {
        console.log('Clicking consent button...');
        await consentButton.click();
        await page.waitForTimeout(500);
        console.log('Consent accepted.');
    } else {
        console.log('Consent button not found.');
    }

    await page.waitForTimeout(2000);

    const loginLink = await page.$('a[aria-label="Log ind"]');
    if (loginLink) {
        console.log('Clicking Login link...');
        await Promise.all([
            page.waitForLoadState('domcontentloaded'),
            loginLink.click(),
        ]);
        console.log('Login page loaded.');
    } else {
        console.log('Login link not found.');
    }

    console.log('Filling in login form...');
    await page.fill('input#email', process.env.ALLERSERVICE_LOGIN_EMAIL!);
    await page.fill('input#password', process.env.ALLERSERVICE_LOGIN_PASSWORD!);

    console.log('Clicking login button...');
    await page.click('button[type="submit"]');

    console.log('Waiting for login greeting...');
    await page.waitForSelector('h1.typo-3xl.lg\\:typo-7xl.font-bold.text-white:text("Mine sider")', { timeout: 500000 });
    console.log('Login successful.');

    await page.waitForTimeout(2000);

    for (const url of urls) {

        console.log(`Navigating to: ${url}`);
        await page.goto(url);

        await page.waitForLoadState('domcontentloaded');
        console.log('Page loaded.');
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

    writeHtmlReport(grouped, urls, 'artifacts', `allerservice-accessibility-report-${process.env.NODE_ENV!}-mobile.html`);
});


