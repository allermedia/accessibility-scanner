import { NodeResult } from "axe-core";

export interface GroupedViolation {
    id: string;
    description: string;
    help: string;
    helpUrl: string;
    impact: string;
    tags: string[];
    nodes: Array<NodeResult & { url: string }>;
    urls: Set<string>;
}