import { parse } from 'csv-parse/sync';
import { promises as fs } from 'fs';
import { URL } from 'url';
import * as path from 'path';
/**
 * Given a site URL, loads the corresponding CSV file and extracts all URLs.
 * Expects the CSV file to be named like 'allerservice-dk-urls.csv' in the 'data' folder.
 */
export default async function fetchCsvUrls(siteUrl: string): Promise<string[]> {
    if (!siteUrl) {
        throw new Error('Site URL is required');
    }

    // Extract domain and transform
    const { hostname } = new URL(siteUrl);
    const domainPart = hostname.replace(/^www\./, '').replace(/\./g, '-');
    const csvFileName = `${domainPart}-urls.csv`;
    const csvFilePath = path.join(__dirname, '../../data', csvFileName);

    // Read CSV file
    const csvString = await fs.readFile(csvFilePath, 'utf-8');

    // Parse CSV (semicolon-delimited, with header)
    const records: Record<string, string>[] = parse(csvString, {
        delimiter: ';',
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });

    // Extract and filter non-empty URLs
    const urls: string[] = records
        .map(row => row['URL']?.trim())
        .filter(url => !!url);

    return urls;
}