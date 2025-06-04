import fs from "fs";
import path from "path";
import { GroupedViolation } from "../types/groupedViolation";
import { groupNodesBySelectorAndHtml } from "./groupNodes";

export default writeHtmlReport;

function writeHtmlReport(
    grouped: Record<string, GroupedViolation>,
    urls: string[],
    outputDir: string
) {
    let html = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <!-- Required meta tags -->
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <style>
            .card-header .btn-link { color: #2557a7; }
            .violationCard { width: 100%; margin-bottom: 1rem; }
            .violationCardLine { display: flex; justify-content: space-between; align-items: start; font-weight: 500; line-height: 1.2; }
            .card-title { font-size: 1.25rem; }
            .violationCardTitleItem { font-size: 1rem; font-weight: 500; }
            .card-text { font-size: 0.95rem; font-weight: 300; }
            .learnMore { margin-bottom: 0.75rem; white-space: nowrap; color: #2557a7; }
            .card-link { color: #2557a7; }
            .violationNode { font-size: 0.85rem; }
            .wrapBreakWord { word-break: break-word; }
            .summary { font-size: 1rem; }
            .summarySection { margin: 0.5rem 0; }
            .hljs { white-space: pre-wrap; width: 100%; background: #f0f0f0; }
            p { margin-top: 0.3rem; }
            li { line-height: 1.618; }
        </style>
        <!-- Bootstrap CSS -->
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
            integrity="sha384-JcKb8q3iqJ61gNV9KGb8thSsNjpSL0n8PARn9HuZOnIxN0hoP+VmmDGMN5t9UJ0Z" crossorigin="anonymous"/>
        <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"
            integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN" crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"
            integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"
            integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.5.0/styles/stackoverflow-light.min.css"/>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.5.0/highlight.min.js"></script>
        <title>Axe-core® Accessibility Results</title>
    </head>
    <main role="main">
        <div style="padding: 2rem">
            <h1>
                Axe-core® Accessibility Results for PRENUMERERA project
            </h1>
            <div class="summarySection">
                <div class="summary"><p>Scanned URLs:</p><ul>${urls.map(url => `<li>${url}</li>`).join('')}</ul></div>
            </div>
            <h2>axe-core found <span class="badge badge-warning">${Object.values(grouped).reduce((sum, v) => sum + v.nodes.length, 0)}</span> violations</h2>
            <table class="table table-striped table-bordered">
                <thead>
                    <tr>
                        <th style="width: 5%">#</th>
                        <th style="width: 45%">Description</th>
                        <th style="width: 15%">Axe rule ID</th>
                        <th style="width: 23%">Impact</th>
                        <th style="width: 7%">Count</th>
                        <th style="width: 5%">Affected URLs</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.values(grouped).map((v, i) => `
                        <tr>
                            <th scope="row"><a href="#${i + 1}" class="card-link">${i + 1}</a></th>
                            <td>${v.description}</td>
                            <td>${v.id}</td>
                            <td>${v.impact}</td>
                            <td>${v.nodes.length}</td>
                            <td>${Array.from(v.urls).map(url => {
        try {
            const u = new URL(url);
            return `<span class="badge badge-info">${u.pathname}${u.search}${u.hash}</span>`;
        } catch {
            return `<span class="badge badge-info">${url}</span>`;
        }
    }).join(' ')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <h3>Failed</h3>
            ${Object.values(grouped).map((v, i) => `
                <div class="card violationCard">
                    <div class="card-body">
                        <div class="violationCardLine">
                            <p class="card-title">
                                <a id="${i + 1}">${i + 1}.</a> ${v.description}
                            </p>
                            <a href="${v.helpUrl}" target="_blank" class="card-link violationCardTitleItem learnMore">Learn more</a>
                        </div>
                        <div class="violationCardLine">
                            <p class="card-subtitle mb-2 text-muted">${v.id}</p>
                            <p class="card-subtitle mb-2 text-muted violationCardTitleItem">${v.impact}</p>
                        </div>
                        <div class="violationCardLine">
                            <p class="card-text">${v.help}</p>
                            <p class="card-subtitle mb-2 text-muted violationCardTitleItem"></p>
                        </div>
                        <div class="violationCardLine">
                            <p class="card-subtitle mb-4 text-muted violationCardTitleItem">
                                Issue Tags: 
                                ${(Array.isArray(v.tags) && v.tags.length > 0
            ? v.tags.map(tag => `<span class="badge bg-light text-dark"> ${tag} </span>`).join('\n')
            : '')}
                            </p>
                        </div>
                        <div class="violationCardLine">
                            <p class="card-subtitle mb-4 text-muted violationCardTitleItem">
                                Affected URLs: 
                                ${Array.from(v.urls).map(url => {
                try {
                    const u = new URL(url);
                    return `<span class="badge badge-info">${u.pathname}${u.search}${u.hash}</span>`;
                } catch {
                    return `<span class="badge badge-info">${url}</span>`;
                }
            }).join(' ')}
                            </p>
                        </div>
                        <div class="violationNode">
                            <table class="table table-sm table-bordered">
                                <thead>
                                    <tr>
                                        <th style="width: 2%">#</th>
                                        <th style="width: 49%">Issue Description</th>
                                        <th style="width: 49%">To solve this violation, you need to...</th>
                                    </tr>
                                </thead>
                                    <tbody>
                                        ${groupNodesBySelectorAndHtml(v.nodes).map(({ node, urls }, idx) => `
                                            <tr>
                                                <td>${idx + 1}</td>
                                                <td>
                                                    <p><strong>Element location</strong></p>
                                                    <pre><code class="css text-wrap">${Array.isArray(node.target) ? node.target.join(', ') : ''}</code></pre>
                                                    <p><strong>Element source</strong></p>
                                                    <pre><code class="html text-wrap">${node.html ? node.html.replace(/</g, '&lt;') : ''}</code></pre>
                                                    <p><strong>URLs</strong></p>
                                                    ${Array.from(urls).map(url => {
                try {
                    const u = new URL(url);
                    return `<span class="badge badge-info">${u.pathname}${u.search}${u.hash}</span>`;
                } catch {
                    return `<span class="badge badge-info">${url}</span>`;
                }
            }).join(' ')}
                                                </td>
                                                <td>
                                                    <div class="wrapBreakWord">
                                                        ${node.failureSummary ? node.failureSummary.replace(/\n/g, '<br>') : ''}
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <script>hljs.initHighlightingOnLoad();</script>
    </main>
</html>
    `;
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, "combined-accessibility-report.html"), html, "utf-8");
}