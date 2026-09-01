<div align="center">
  <h1>📓 notebook</h1>
  <p><b>My Obsidian vault, published. Notes stay notes — the site is assembled at build time.</b></p>

  ![Website](https://img.shields.io/website?url=https%3A%2F%2Fnotebook.petri.zip)
  ![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Petri-Hub/notebook/deploy.yml)
  ![GitHub commit activity](https://img.shields.io/github/commit-activity/t/Petri-Hub/notebook)
</div>

<br>
<h2>Table of Contents</h2>

- [About](#About)
- [Structure](#Structure)
- [How the Build Works](#HowTheBuildWorks)
- [Running Locally](#RunningLocally)
- [Upgrading Quartz](#UpgradingQuartz)
- [DNS](#DNS)

<br>
<h2 id="About">About</h2>

**TL;DR:** this repository holds Markdown and two config files. [Quartz 5](https://quartz.jzhao.xyz/) turns it into a static site on every push to `main`, and GitHub Pages serves it at [notebook.petri.zip](https://notebook.petri.zip).

The vault is the product. Quartz is a build dependency, so **none of its source lives here** — the workflow checks it out at a pinned commit, drops `quartz.config.yaml` into it, and points it at `content/`. Nothing to vendor, nothing to keep in sync, and `git log` stays a log of notes.

<br>
<h2 id="Structure">Structure</h2>

```
content                   the Obsidian vault root — open this folder in Obsidian
├── index.md              landing page
└── Software              one folder per subject, nested however it wants
.github/workflows
└── deploy.yml            checkout, build, publish
infra                     Cloudflare DNS for notebook.petri.zip
quartz.config.yaml        the entire site configuration
```

Everything publishable lives under `content/`. Everything else is machinery and never reaches the site.

<br>
<h2 id="HowTheBuildWorks">How the Build Works</h2>

`deploy.yml` runs on every push to `main`:

1. Checks out this repository into `notes/` with full history — Quartz reads git for the created and modified dates shown on each page.
2. Checks out `jackyzha0/quartz` into `quartz/` at the commit pinned in `QUARTZ_REF`.
3. Copies `quartz.config.yaml` over the one Quartz ships with.
4. Installs dependencies, then `@quartz-themes/default` — Quartz declares `@quartz-themes/core` but not the theme package it loads, and fetching it mid-build fails on a clean runner.
5. Builds with `--directory ../notes/content`.
6. Uploads `public/` and deploys it to Pages.

The config is based on Quartz's `obsidian` template, so wikilinks, callouts, Mermaid, block references and `shortest` link resolution all work the way they do in Obsidian. `analytics` is off and the Excalidraw plugin is disabled — enable it if drawings ever land in the vault.

<br>
<h2 id="RunningLocally">Running Locally</h2>

There is nothing to install in this repository. Clone Quartz somewhere else, point it here, and serve:

```sh
git clone https://github.com/jackyzha0/quartz.git ~/quartz
cd ~/quartz && npm ci
cp ~/Desktop/Personal/Projects/notebook/quartz.config.yaml .
npx quartz build --serve --directory ~/Desktop/Personal/Projects/notebook/content
```

The site is on `localhost:8080` and rebuilds as notes change.

<br>
<h2 id="UpgradingQuartz">Upgrading Quartz</h2>

`QUARTZ_REF` in `deploy.yml` pins the exact commit that builds the site, so upstream cannot break a deploy on its own. To move forward, bump it to a newer commit on Quartz's `v5` branch and push. If the plugin list changed upstream, reconcile `quartz.config.yaml` against `quartz/cli/templates/obsidian.yaml` at that commit.

The pin is deliberately a commit and not the `v5` branch: the branch installs plugins as npm packages, while the `v5.0.0` **tag** still resolves them as `github:` sources, which makes every CI run clone and build forty plugins.

<br>
<h2 id="DNS">DNS</h2>

`petri.zip` is registered elsewhere and delegated to Cloudflare, so the `notebook` record that points at GitHub Pages is declared in `infra/` with the Cloudflare provider.

**This state owns one DNS record and nothing else.** The zone is shared with the portfolio and the homelab, each holding its own records in its own state. Zone level settings belong to none of them.

The record is not proxied, on purpose. GitHub Pages issues and renews its own certificate for the custom domain, and the Cloudflare proxy in front of it blocks that issuance.

Applying it needs a Cloudflare API token with `Zone:Read` and `DNS:Edit`, scoped to that single zone:

```sh
cd infra
cp terraform.auto.tfvars.example terraform.auto.tfvars   # then fill in the token and the zone id
terraform init
terraform plan
```

Both the variables file and the state are local, and git ignores them.
