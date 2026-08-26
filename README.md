# @pipeworx/mitre-attck

MITRE [ATT&CK](https://attack.mitre.org) MCP — adversary tactics, techniques, and procedures (TTPs). Sources the official STIX 2.1 bundles from MITRE's GitHub. Cached 1h in-pack.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/mitre-attck/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Mitre Attck data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
