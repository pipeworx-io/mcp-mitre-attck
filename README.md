# @pipeworx/mitre-attck

MITRE [ATT&CK](https://attack.mitre.org) MCP — adversary tactics, techniques, and procedures (TTPs). Sources the official STIX 2.1 bundles from MITRE's GitHub. Cached 1h in-pack.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `technique(id)` — technique by ATT&CK id (e.g. `T1190`, `T1059.001`)
- `tactic(id_or_short_name)` — tactic record
- `group(id)` — threat group (e.g. `G0007` APT28)
- `software(id)` — software/malware (e.g. `S0002` Mimikatz)
- `mitigation(id)` — mitigation
- `search(query, type?)` — substring search across the bundle
- `domains()` — list loaded STIX bundles (enterprise, mobile, ics)

## Data source

`https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json` (and mobile + ics).

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "mitre-attck": {
      "url": "https://gateway.pipeworx.io/mitre-attck/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Mitre Attck data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
