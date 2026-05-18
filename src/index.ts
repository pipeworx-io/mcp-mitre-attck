interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * MITRE ATT&CK MCP — STIX bundles from github.com/mitre/cti.
 */


const DOMAINS = ['enterprise-attack', 'mobile-attack', 'ics-attack'] as const;
type Domain = (typeof DOMAINS)[number];

const UA = 'pipeworx-mcp-mitre-attck/1.0 (+https://pipeworx.io)';
const TTL_MS = 60 * 60 * 1000;
const CACHE: Partial<Record<Domain, { at: number; objects: any[] }>> = {};

const tools: McpToolExport['tools'] = [
  { name: 'technique', description: 'Technique by ATT&CK id.', inputSchema: { type: 'object', properties: { id: { type: 'string' }, domain: { type: 'string' } }, required: ['id'] } },
  { name: 'tactic', description: 'Tactic by id or short name.', inputSchema: { type: 'object', properties: { id_or_short_name: { type: 'string' }, domain: { type: 'string' } }, required: ['id_or_short_name'] } },
  { name: 'group', description: 'Threat group (e.g. G0007).', inputSchema: { type: 'object', properties: { id: { type: 'string' }, domain: { type: 'string' } }, required: ['id'] } },
  { name: 'software', description: 'Software/malware (e.g. S0002).', inputSchema: { type: 'object', properties: { id: { type: 'string' }, domain: { type: 'string' } }, required: ['id'] } },
  { name: 'mitigation', description: 'Mitigation.', inputSchema: { type: 'object', properties: { id: { type: 'string' }, domain: { type: 'string' } }, required: ['id'] } },
  { name: 'search', description: 'Substring search across the bundle.', inputSchema: { type: 'object', properties: { query: { type: 'string' }, type: { type: 'string', description: 'attack-pattern | intrusion-set | tool | malware | x-mitre-tactic | course-of-action' }, domain: { type: 'string' } }, required: ['query'] } },
  { name: 'domains', description: 'List loaded STIX bundles.', inputSchema: { type: 'object', properties: {} } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const domain = pickDomain(args);
  switch (name) {
    case 'domains':
      return { domains: DOMAINS };
    case 'technique':
      return findByExternalId(await load(domain), reqStr(args, 'id', '"T1190"'), 'attack-pattern');
    case 'tactic': {
      const q = reqStr(args, 'id_or_short_name', '"initial-access"');
      const objs = await load(domain);
      const byId = findByExternalId(objs, q, 'x-mitre-tactic');
      if (byId) return byId;
      return objs.find((o: any) => o.type === 'x-mitre-tactic' && (o.x_mitre_shortname === q || (o.name as string).toLowerCase() === q.toLowerCase())) ?? null;
    }
    case 'group':
      return findByExternalId(await load(domain), reqStr(args, 'id', '"G0007"'), 'intrusion-set');
    case 'software': {
      const objs = await load(domain);
      const id = reqStr(args, 'id', '"S0002"');
      return findByExternalId(objs, id, 'tool') ?? findByExternalId(objs, id, 'malware');
    }
    case 'mitigation':
      return findByExternalId(await load(domain), reqStr(args, 'id', '"M1041"'), 'course-of-action');
    case 'search': {
      const q = reqStr(args, 'query', '"phishing"').toLowerCase();
      const t = args.type as string | undefined;
      const matches = (await load(domain)).filter((o: any) => {
        if (t && o.type !== t) return false;
        const blob = `${o.name ?? ''}|${o.description ?? ''}|${(o.aliases ?? []).join(',')}`.toLowerCase();
        return blob.includes(q);
      });
      return { domain, query: q, count: matches.length, results: matches.slice(0, 200) };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function pickDomain(args: Record<string, unknown>): Domain {
  const d = (args.domain as string | undefined) ?? 'enterprise-attack';
  if (!(DOMAINS as readonly string[]).includes(d)) throw new Error(`domain must be one of: ${DOMAINS.join(', ')}`);
  return d as Domain;
}

function findByExternalId(objs: any[], id: string, type: string): any | null {
  return objs.find((o) => o.type === type && (o.external_references ?? []).some((r: any) => r.source_name?.startsWith('mitre-attack') && r.external_id === id)) ?? null;
}

async function load(domain: Domain): Promise<any[]> {
  const now = Date.now();
  const c = CACHE[domain];
  if (c && now - c.at < TTL_MS) return c.objects;
  const url = `https://raw.githubusercontent.com/mitre/cti/master/${domain}/${domain}.json`;
  const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`MITRE ATT&CK: ${res.status}`);
  const bundle = (await res.json()) as { objects: any[] };
  CACHE[domain] = { at: now, objects: bundle.objects ?? [] };
  return CACHE[domain]!.objects;
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
