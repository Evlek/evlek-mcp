# Contributing to Evlek MCP

Thanks for your interest. This repository is **documentation, manifest, and reference clients** for the Evlek MCP server hosted at `evlek.app/api/mcp`. The hosted server's source code is proprietary and not in this repository.

## What contributions are welcome

✅ **Documentation improvements** — typos, clarifications, missing information, formatting fixes in `README.md`, `TOOLS.md`, `CONTRIBUTING.md`.

✅ **Translations** — README and TOOLS in TR, RU, DE, AR, ES, FR. We'd especially love a Turkish translation since Evlek is built for KKTC.

✅ **New client examples** — Configuration recipes for additional MCP clients (Zed, Windsurf, Cline, Continue, etc.) in `examples/`.

✅ **Reference client improvements** — Bug fixes and improvements to the Python and TypeScript thin clients in `examples/clients/`.

✅ **Bug reports against the hosted server** — Open an issue with the `server-bug` label.

## What is NOT in scope

❌ **Hosted server source code** — The implementation at `evlek.app/api/mcp` is proprietary. PRs proposing tool implementations cannot be merged here.

❌ **Database schemas, AI prompts, business logic** — These live in the proprietary repo.

❌ **New tools** — Tool roadmap is defined by Evlek. If you have a tool suggestion, open a discussion (not a PR).

❌ **Brand assets, logos** — Trademark protected. See LICENSE for details.

## How to file an issue

Use one of the following labels:

- `server-bug` — Bug in the hosted MCP server (wrong response, error, unexpected behavior). Include the tool called, your prompt, and the response (redact any PII).
- `docs` — Documentation issue (typo, unclear, missing).
- `client-example` — Issue or request related to client configuration in `examples/`.
- `tool-suggestion` — Idea for a new tool. Discuss before opening — most ideas should go to GitHub Discussions instead.
- `translation` — Request or offer to translate documentation.

Please include:

1. What you were trying to do.
2. What client you used (Claude Desktop, Cursor, Gemini CLI, etc.).
3. The exact prompt or config that triggered the issue.
4. The response you got (with PII redacted).
5. The response you expected.

## How to file a PR

1. Fork the repo.
2. Create a branch: `docs/typo-fix`, `examples/zed-config`, `clients/python-improvement`, etc.
3. Make your changes.
4. Open a PR with a clear title and description.
5. Sign off your commits (we use [DCO](https://developercertificate.org/)).

For larger changes (translations, new client examples), open an issue first to discuss.

## Code of conduct

Be kind. Don't be a spammer. Do not submit PRs that include LLM-generated content without disclosure (we will ask).

## Privacy

If you find a security issue, **do not open a public issue.** Email hello@evlek.app with details. We aim to acknowledge within 24 hours.

## License

By contributing, you agree that your contributions will be licensed under the MIT License (see [LICENSE](./LICENSE)). The "Evlek" trademark is excluded from this license.

---

For everything else, contact: hello@evlek.app
