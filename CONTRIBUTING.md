# Contributing to the YON toolchain

Thank you for your interest in contributing to the YON toolchain, a YounndAI™
product by MARLINK TRADING SRL.

The YON toolchain is the bundle of packages — parser, generator, runner,
converter, examples, benchmarks, domains, and AI relay — that implement and
exercise the [YON specification](https://github.com/YounndAI/yon-spec).

## Contributor License Agreement (REQUIRED)

Before we can accept your contribution, we need you to sign a Contributor
License Agreement (CLA). The CLA is a one-time legal document that confirms:

- You have the right to grant us the license terms specified in the CLA
- You grant us a broad, perpetual license to use, modify, and re-license your contribution
- You receive no special contributor rights: no royalties, governance, trademark rights, private license-back, approval rights, or claims against future relicensing or posture changes
- Your contribution is provided "as is" without warranty

### Which CLA do I sign?

- **[Individual CLA](CLA.md)** — if you are contributing on your own behalf, on
  your own time, and your employer has no claim to your intellectual-property
  output.
- **Entity CLA** — if you are contributing as an employee or contractor on
  behalf of an employer or organization. The Entity CLA covers all contributors
  your organization authorizes (listed in its Schedule A). Request it at
  office@younndai.com.

If you are unsure, sign the Individual CLA — and request the Entity CLA as well
if an employer may have a claim to your work.

### How to sign

When you open your first pull request, our [CLA bot](https://cla-assistant.io)
will comment with a link to sign. You can sign electronically via GitHub OAuth
— no paperwork required. Once signed, your future contributions are
automatically covered. **Pull requests cannot be merged until the CLA bot
confirms a signed CLA is on file for all contributors.**

## Development

This repository is an npm workspaces monorepo (npm only — never pnpm/yarn/bun;
Node >= 20.9).

```bash
npm install        # install all workspace dependencies
npm run build      # build every package in dependency order
npm test           # run the workspace test suites
npm run typecheck  # type-check every package
```

Work on a single package with `-w`, e.g. `npm test -w @younndai/yon-parser`.

## Code contribution checklist

- [ ] Signed the appropriate CLA (see above)
- [ ] Apache-2.0 copyright/license header included in any new source files (see [License headers](#license-headers))
- [ ] Code follows existing project conventions
- [ ] Tests added for new functionality
- [ ] Documentation updated for user-facing changes
- [ ] Trademark indicators (™ or ®) on first prominent use of any YounndAI mark in new documentation
- [ ] CHANGELOG.md `[Unreleased]` section updated where the change is user-facing

## License headers

Every new source file must begin with the Apache-2.0 copyright/license header.
Copy the block below verbatim, adjusting only the comment syntax for the file's
language:

```text
Copyright 2026 MARLINK TRADING SRL (YounndAI)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

## Code of conduct

We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/).
By contributing, you agree to abide by its terms.

## Questions?

- General questions: [GitHub Discussions](https://github.com/YounndAI/yon/discussions)
- Legal questions: office@younndai.com
- Security questions: see [SECURITY.md](SECURITY.md)

Thank you for contributing!
