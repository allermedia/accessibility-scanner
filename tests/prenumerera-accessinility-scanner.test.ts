import { test } from '@playwright/test';
import { Result } from 'axe-core';
import { injectAxe, getViolations } from 'axe-playwright';
import { GroupedViolation } from '../src/types/groupedViolation';
import writeHtmlReport from '../src/reporter';
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'test'}` });


// List of URLs to scan
const env = process.env.NODE_ENV;
const urls = require(`../src/config/prenumerera.${env}.urls`).default;

// Store all violations per page
const allViolationsPerPage: Record<string, Result[]> = {};

// Test each URL
for (const url of urls) {
    test(`Accessibility scan: ${url}`, async ({ page }) => {
        await page.goto(url);

        // Accept cookie consent if present
        const consentButton = await page.$('button#onetrust-accept-btn-handler');
        if (consentButton) {
            await consentButton.click();
            await page.waitForTimeout(500);
        }

        await page.waitForTimeout(2000);
        await injectAxe(page);

        const violations = await getViolations(page, undefined, {
            runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag21aa'],
            },
        });

        allViolationsPerPage[url] = violations;
    });
}

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

    writeHtmlReport(grouped, urls, "artifacts");
});
