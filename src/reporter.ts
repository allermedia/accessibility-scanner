import fs from "fs";
import path from "path";
import { GroupedViolation } from "./types/groupedViolation";

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
    <meta charset="utf-8" />
    <title>Combined Axe Accessibility Report</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" />
    <style>
        body { padding: 2rem; }
        .violation { margin-bottom: 2rem; }
        .badge { font-size: 1rem; }
        pre { background: #f5f5f5; padding: 0.5rem; }
    </style>
</head>
<body>
    <h1>Axe Accessibility Report: Combined Violations</h1>
    <p>Scanned URLs:</p>
    <ul>${urls.map(url => `<li>${url}</li>`).join('')}</ul>
    <hr>
    <h2>Summary</h2>
    <table class="table table-bordered">
        <thead>
            <tr>
                <th>Rule</th>
                <th>Description</th>
                <th>Impact</th>
                <th>Total Occurrences</th>
                <th>Affected URLs</th>
            </tr>
        </thead>
        <tbody>
            ${Object.values(grouped).map(v => `
                <tr>
                    <td>${v.id}</td>
                    <td>${v.description}</td>
                    <td>${v.impact}</td>
                    <td>${v.nodes.length}</td>
                    <td>${Array.from(v.urls).map(url => `<span class="badge badge-info">${url}</span>`).join(' ')}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    <hr>
    <h2>Details</h2>
    ${Object.values(grouped).map((v, i) => `
        <div class="violation card">
            <div class="card-header">
                <strong>${i + 1}. ${v.description}</strong> <span class="badge badge-warning">${v.id}</span>
                <span class="badge badge-${v.impact === 'critical' ? 'danger' : v.impact === 'serious' ? 'warning' : 'secondary'}">${v.impact}</span>
                <a href="${v.helpUrl}" target="_blank" class="badge badge-info">Learn more</a>
            </div>
            <div class="card-body">
                <p>${v.help}</p>
                <p><strong>Affected URLs:</strong> ${Array.from(v.urls).join(', ')}</p>
                <table class="table table-sm table-bordered">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>URL</th>
                            <th>Selector</th>
                            <th>Snippet</th>
                            <th>Fix</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${v.nodes.map((node, idx) => `
                            <tr>
                                <td>${idx + 1}</td>
                                <td style="font-size: 0.85em">${node.url}</td>
                                <td><pre>${Array.isArray(node.target) ? node.target.join(', ') : ''}</pre></td>
                                <td><pre>${node.html ? node.html.replace(/</g, '&lt;') : ''}</pre></td>
                                <td>${node.failureSummary ? node.failureSummary.replace(/\n/g, '<br>') : ''}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `).join('')}
</body>
</html>
    `;
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, "combined-accessibility-report.html"), html, "utf-8");
}
