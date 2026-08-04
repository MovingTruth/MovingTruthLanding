---
title: "Building Moving Truth: A Markdown-First, AI-Assisted Publishing Platform"
type: craft
date: 2026-08-04T09:00:00
description: "How Markdown, Git, Hugo, and AI-assisted workflows publish a 14-language knowledge platform — the architecture, the editorial pipeline, and what stayed a human decision."
noindex: false
---

## Executive Summary

Moving Truth is an experiment in building a knowledge platform where ideas move from conversation and research to published, multilingual content through a structured and repeatable workflow. Rather than relying on a traditional content management system, the platform uses Markdown as its source of truth, Git for version history, GitHub for collaboration and deployment, Hugo for static-site generation, and AI tools for drafting, organization, localization support, and technical documentation.

The goal is not to automate judgment. It is to remove repetitive work so that more time can be spent on research, accuracy, editorial refinement, and the experience of the reader.

This article explains the architecture behind [movingtruth.com](https://movingtruth.com), the decisions that shaped it, and the lessons learned while building a publishing system designed for both people and machines.

| Metric | Current scale |
|---|---|
| Published pieces | 22, across four series |
| Languages configured | 14 |
| Tracked Markdown files | 760+ |
| External CMS | None — Markdown and Git are the system of record |

## Why I Built It

Most publishing platforms are content-first: open an editor, create a page, and publish it through the interface provided by the platform.

Moving Truth is knowledge-first.

Every article, lesson, reflection, and application begins as structured text that can be read, reviewed, versioned, translated, searched, and republished without being locked inside a proprietary database or visual editor. The website is one presentation of that material, not the only place where it can exist.

Instead of asking, "How do I publish this article?" the more useful question becomes:

> How do I create knowledge once and make it useful everywhere?

That question led to a simple set of architectural principles:

- content should remain readable outside the publishing system;
- every meaningful change should have a history;
- localization should reuse a canonical source instead of creating disconnected copies;
- automation should handle repeatable transformations;
- people should remain responsible for meaning, accuracy, and publication.

## Core Architecture

At a high level, Moving Truth turns research and ideas into version-controlled Markdown, then uses Hugo and GitHub Pages to produce the public website.

```text
Ideas and Research
        │
        ▼
Conversations and Notes
        │
        ▼
Structured Markdown ───────────────┐
        │                           │
        ├──────────────┐            │
        ▼              ▼            │
AI-Assisted Review  Human Review    │
        │              │            │
        └──────┬───────┘            │
               ▼                    │
         Git Repository             │
               │                    │
               ▼                    │
             GitHub                 │
               │                    │
               ▼                    │
        Hugo Static Build           │
               │                    │
               ▼                    │
         movingtruth.com            │
               │                    │
               ▼                    │
      Localized Site Builds ◀───────┘
```

The architecture deliberately separates four concerns:

1. **Authoring** — ideas are shaped into structured Markdown.
2. **Review** — AI tools assist with structure and consistency; human review decides what is correct and worth publishing.
3. **Transformation** — Hugo converts source files into optimized static pages.
4. **Delivery** — GitHub Actions builds the site and GitHub Pages serves it at movingtruth.com.

Because each layer has a clear job, the system remains understandable and replaceable. Hugo could be exchanged for another renderer without rewriting the content. GitHub Pages could be replaced without changing the editorial model. The Markdown source would remain usable either way.

## Technology Stack

| Component | Role in the platform |
|---|---|
| **Markdown** | Portable, human-readable source of truth for articles and site content |
| **Git** | Version history, diffs, branching, and rollback |
| **GitHub** | Repository hosting, collaboration, and deployment triggers |
| **GitHub Actions** | Repeatable production builds and GitHub Pages deployment |
| **Hugo** | Fast static-site generation and multilingual routing |
| **HTML, CSS, and JavaScript** | Presentation, interaction, accessibility, and browser behavior |
| **ChatGPT and Claude** | Assistance with planning, drafting, documentation, implementation, and review |
| **Localization files** | Language-specific content and interface strings for 14 configured languages |

The production build is intentionally small. A push to the deployment branch triggers a GitHub Actions workflow, which installs a pinned Hugo version, creates a minified build, uploads the generated site, and deploys it to GitHub Pages.

```text
Markdown + Templates + Assets
             │
             ▼
         Git Commit
             │
             ▼
      Push to GitHub main
             │
             ▼
       GitHub Actions
             │
             ▼
        Hugo --minify
             │
             ▼
   GitHub Pages deployment
             │
             ▼
      https://movingtruth.com
```

## Why Markdown Is the Foundation

Markdown works well at the boundary between human writing and software systems. It is simple enough to edit directly, structured enough for automated processing, and stable enough to remain useful long after a particular tool has been replaced.

For Moving Truth, Markdown provides several practical advantages:

- **Human-readable:** a source file can be understood without opening a special application.
- **Git-friendly:** changes appear as meaningful line-by-line diffs.
- **AI-friendly:** models can reliably interpret headings, lists, links, metadata, and code blocks.
- **Portable:** content is not trapped in a database or vendor-specific format.
- **Composable:** the same source can feed a website, documentation set, translation workflow, or future application.
- **Maintainable:** text files are easy to search, reorganize, validate, and archive.

Each published page combines Markdown with structured front matter. The prose remains clean, while metadata such as title, series, order, date, and description gives Hugo enough information to build navigation and page structure.

```yaml
---
title: "Example Title"
series: "Moving Truth"
part: 1
date: 2026-06-15T09:00:00
description: "A concise description for readers and search systems."
---
```

This division is important: the content says what the page means; the metadata says how the publishing system should handle it.

## AI as an Engineering Tool

Large language models are used throughout the development process, but they do not act as an unreviewed publishing authority. Each model is most useful when given a defined responsibility, sufficient context, and a clear boundary.

The working pattern looks like this:

| Participant | Typical responsibilities |
|---|---|
| **ChatGPT** | Architecture exploration, planning, documentation, outlining, editorial alternatives, and technical explanation |
| **Claude** | Implementation support, code analysis, debugging, repository work, and engineering review |
| **Human** | Intent, source selection, factual verification, ethics, final editorial decisions, approval, and publication |

These are working roles rather than rigid limits. The important principle is separation of concerns: a model that produces a draft should not be treated as proof that the draft is correct.

AI assistance is useful for:

- turning rough notes into an initial structure;
- identifying missing context or ambiguous claims;
- reorganizing long material into readable sections;
- generating documentation from implemented behavior;
- proposing metadata and localization scaffolding;
- comparing source and translated documents for omissions;
- reviewing code and content for consistency;
- reducing repetitive preparation work.

Every generated artifact still passes through human review. This keeps speed from becoming a substitute for accuracy.

## The Editorial and Publishing Workflow

The complete workflow begins before a Markdown file exists. Source material may be a conversation, a research note, an implementation decision, or an observation worth developing. It moves through progressively more structured forms until it is ready to publish.

```text
Idea or Source Material
          │
          ▼
Conversation / Working Notes
          │
          ▼
Outline and Source Check
          │
          ▼
Canonical Markdown Draft
          │
          ├──────────────┐
          ▼              ▼
  AI-Assisted Review  Human Edit
          │              │
          └──────┬───────┘
                 ▼
       Technical / Editorial Review
                 │
                 ▼
       Localization Preparation
                 │
                 ▼
      Localized Markdown + UI Text
                 │
                 ▼
          Hugo Build and Test
                 │
                 ▼
          Git Commit and Push
                 │
                 ▼
              Deployment
```

### 1. Capture the source

The process begins by preserving the original idea and its context. This matters because a polished draft can hide uncertainty that was obvious in the source material.

### 2. Create a canonical draft

The English Markdown document becomes the primary editorial source. Headings, links, metadata, and repeated terminology are normalized before localization begins.

### 3. Review in layers

Structural review asks whether the article is complete and organized. Technical review checks claims against the implementation. Editorial review asks whether the piece is clear, necessary, and consistent with the voice of Moving Truth.

### 4. Localize

Once the source is stable, language-specific Markdown and interface strings are prepared. Localized files stay close to the source structure so omissions and drift are easier to detect.

### 5. Build and inspect

Hugo generates the site locally before deployment. The build verifies that content, templates, internal links, navigation, and language routing work together.

### 6. Deploy through version control

Publishing is a traceable repository change. Git preserves what changed and why; the deployment workflow turns the approved source into the live site.

## Multilingual Publishing

Moving Truth is configured for 14 languages: English, Spanish, French, Portuguese, German, Japanese, Russian, Chinese, Arabic, Korean, Thai, Italian, Dutch, and Hindi. English is the canonical source language, while localized Markdown files and interface resources provide the translated experience.

```text
                   Canonical English Markdown
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
        Translation Assistance     Terminology / Context
                 │                         │
                 └────────────┬────────────┘
                              ▼
                       Human Review
                              │
                              ▼
              Localized Markdown and UI Strings
                              │
                              ▼
                    Hugo Multilingual Build
                              │
                              ▼
                  Language-Specific Site Routes
```

The source-first approach reduces duplicated editing. A change begins in the canonical document, then becomes a visible localization task. Shared structure makes it possible to compare versions, find missing sections, and keep navigation consistent across languages.

Localization is more than replacing words. Tone, cultural context, text direction, punctuation, and layout all matter. Arabic, for example, requires right-to-left presentation. Machine assistance can accelerate a first pass or highlight inconsistencies, but it cannot decide whether a translation carries the intended meaning. That remains a review responsibility.

## Repository Organization

The repository treats content and documentation as first-class parts of the product rather than as material added after the software is finished.

```text
MovingTruth/
├── content/                 # Canonical and localized Markdown
│   ├── moving-truth/        # Main series
│   ├── what-if/             # Companion series
│   ├── blessings/           # Blessing pieces
│   └── ...
├── i18n/                    # Localized interface strings
├── themes/temple/
│   ├── layouts/             # Hugo templates
│   └── assets/
│       ├── css/             # Visual system
│       └── js/              # Browser behavior
├── static/                  # Images and other static assets
├── .github/workflows/       # Automated build and deployment
├── hugo.toml                # Site and language configuration
└── CHANGELOG.md             # Technical change history
```

This layout makes responsibility visible. Content lives with content, language resources live with language resources, presentation lives in the theme, and deployment logic lives in the workflow configuration.

The result is a repository that documents the platform by its shape. A new contributor — or an AI tool working with appropriate context — can understand where a change belongs before making it.

## What Is Automated, and What Is Not

A useful automation policy is to automate repetition without automating responsibility.

Good candidates for automation include:

- building the static site;
- minifying generated output;
- preparing repeatable metadata structures;
- checking file and translation coverage;
- finding inconsistent terminology;
- generating first-pass documentation;
- organizing Markdown files;
- preparing deployment artifacts.

Tasks that should remain explicitly reviewed include:

- deciding whether a claim is true;
- deciding whether source material is safe to publish;
- approving translations;
- making ethical and editorial judgments;
- choosing what deserves amplification;
- authorizing production deployment.

The distinction prevents an efficient pipeline from becoming an unaccountable one.

## Lessons Learned

### Documentation should evolve with the software

Documentation written at the end of a project is usually incomplete because the reasoning behind earlier decisions has already faded. Keeping Markdown, architecture notes, and change history beside the implementation makes documentation part of development rather than a cleanup task.

### Markdown scales better than rich-text editing for technical work

Visual editors are convenient for isolated pages. They become harder to manage when content must be reviewed, translated, compared, transformed, and maintained over time. Plain text gives both people and tools a stable interface.

### Defined AI roles produce better results

"Do everything" is a poor instruction for both people and models. Separating planning, drafting, implementation, verification, and approval makes failures easier to detect and work easier to review.

### Human review remains the final authority

Language models are effective pattern generators, but fluency can make an unsupported statement sound finished. The more polished the output, the more important source checking becomes.

### Localization needs architecture, not just translation

Multilingual publishing affects filenames, routes, templates, interface strings, directionality, navigation, and editorial workflow. Treating it as a system from the beginning is simpler than adding it after the site is established.

### Static publishing is a strategic constraint

A static site reduces operational complexity, narrows the attack surface, and makes deployment reproducible. The tradeoff is that dynamic features must be designed deliberately. For a publication centered on durable writing, that is a useful constraint.

### Automate the second occurrence, not the imagined hundredth

Automation is most valuable when it responds to observed repetition. Building a complex pipeline before understanding the work can preserve the wrong process. Repeating a task once reveals its real shape; automating it then is usually more effective.

## What Comes Next

The current architecture creates a strong base for further work. Potential extensions include:

- structured metadata and schema markup;
- retrieval-aware content organization;
- automated coverage checks across languages;
- content classification and related-reading suggestions;
- AI-assisted editorial review with explicit evidence requirements;
- continuous localization support;
- accessibility and link validation in the build pipeline;
- analytics for search, retrieval coverage, and knowledge gaps.

The long-term goal is not simply to publish more. It is to make the knowledge easier to find, verify, translate, reuse, and maintain without losing the human judgment that gives it value.

## Conclusion

Moving Truth began as a place for ideas, but building it required a publishing architecture: one that could preserve source material, support multilingual output, expose its history, and use AI without surrendering editorial control.

Markdown provides the durable source. Git and GitHub provide traceability. Hugo provides a fast, reproducible publishing layer. AI tools reduce repetitive work and help transform rough material into structured artifacts. Human review connects every layer and remains responsible for what reaches the reader.

That combination is the central lesson of the project: a useful AI-assisted system is not defined by how much it can generate. It is defined by how clearly it separates assistance from authority, and how reliably it turns human intent into work that can be inspected, improved, and trusted.
