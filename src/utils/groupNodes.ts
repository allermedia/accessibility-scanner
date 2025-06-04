export function groupNodesBySelectorAndHtml(nodes: Array<any>) {
    const map = new Map<string, { node: any, urls: Set<string> }>();
    for (const node of nodes) {
        const key = `${JSON.stringify(node.target)}|${node.html}`;
        if (!map.has(key)) {
            map.set(key, { node, urls: new Set() });
        }
        if (node.url) {
            map.get(key)!.urls.add(node.url);
        }
    }
    return Array.from(map.values());
}