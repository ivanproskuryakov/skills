---
name: semantic-commits
description: >-
  Write git commits as Conventional Commits — `type(scope): subject` — with a
  fixed type list, scopes taken from the repository's packages, and wording,
  splitting and breaking-change rules. Use when creating, amending, rewording,
  squashing or splitting commits, naming a branch or titling a pull request in a
  repository that follows Conventional Commits or when the user asks for
  semantic/conventional commits, and when reviewing whether existing commits
  follow the rule.
---

# Semantic commits

Every commit follows [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/),
narrowed by the rules below, so the log can be scanned, filtered by area and turned into
release notes. History from before the rule stays as it is; everything committed from
now on follows it.

## When it applies, and the project add-on

- Read the project add-on if one exists: `.claude/semantic-commits.md` or
  `.agents/semantic-commits.md`. It sets the scope table, the base branch, the
  repository's breaking-change surface and any type or wording exceptions, and
  overrides the defaults below. Explicit user instructions override both.
- Without an add-on, apply this skill when the user asked for semantic or conventional
  commits, when `CLAUDE.md`/`AGENTS.md`/`CONTRIBUTING` or a commitlint config asks for
  them, or when recent history (`git log --format=%s -30`) already uses them. If the
  repository clearly uses another convention and nothing asks for this one, follow
  the repository and say so.

## Format

```
<type>[(<scope>)][!]: <subject>

[body]

[footers]
```

- The header is at most 72 characters.
- `type` and `scope` are lowercase, from the tables below.
- The subject is imperative ("add", not "added" or "adds"), starts with a lowercase
  letter, and has no trailing period. It says what the commit does to the product or
  the code, not which files it touched.
- The body is optional. Leave a blank line after the header, wrap at 72, and say why
  the change was made when the header cannot.
- Footers go after another blank line: `BREAKING CHANGE: …`, `Refs: …`,
  `Co-authored-by: …`.

## Types

| Type | Use for |
| --- | --- |
| `feat` | A capability or visible improvement for users, including polish of an existing screen |
| `fix` | A defect: wrong behaviour, a broken layout, a crash, an accessibility bug |
| `perf` | Faster or lighter, behaviour unchanged |
| `refactor` | Restructured code, behaviour unchanged |
| `style` | Formatting only (Prettier, import order). Never visual styling: CSS that users see is `feat` or `fix` |
| `test` | Tests only |
| `docs` | Documentation for people: `README.md`, `docs/`, a feature spec, comment-only changes |
| `build` | Build setup, dependencies, Dockerfiles, compose files, bundler and `tsconfig` config |
| `ci` | CI workflows (`.github/workflows/`, `.gitlab-ci.yml`, …) |
| `chore` | Maintenance that ships nothing: agent skills, slash commands, editor and tool config |
| `revert` | Undoing a commit: `revert: <its header>`, body `This reverts commit <sha>.` |

When a commit fits two types, pick the one a release note would use: a feature that
comes with its tests is `feat`, not `test`.

## Scopes

The scope names the workspace package or top-level area the change lives in. Take the
list from the add-on; otherwise derive it from the repository's packages
(`pnpm-workspace.yaml`, `package.json` `workspaces`, `go.work`, Cargo workspace
members, or the top-level app directories) and the scopes recent history already uses.
Use each package's short directory name (`web`, `api`, `api-client`), plus:

| Scope | For |
| --- | --- |
| `skills` | Agent skills and commands (`skills/`, `.agents/`, `.claude/`) |
| `deps` | Dependency bumps only, as `build(deps): …` |

- Leave the scope out when one change spans packages and does not split cleanly, such
  as an API flag together with the web screens that read it.
- When the change does split, and each half builds and makes sense alone, make one
  commit per package instead.
- Changes at the repository root (root `package.json`, compose files, `README.md`)
  take no scope.
- A single-package repository may use scopes for its main areas, or none; follow its
  history.

## One change per commit

- A commit holds one logical change. When the working tree mixes concerns, split it:
  by file first, and by hunk when one file carries both. Shared files such as locale
  dictionaries or route tables often do; split them by key or entry.
- Each commit builds on its own. A key, export or prop that a commit removes must not
  still be used by files the commit leaves at their old version.
- Stage only the hunks that belong to the commit; never commit someone else's
  unrelated edits under your header.

## Breaking changes

Mark a change that breaks a consumer with `!` after the type or scope, and add a
`BREAKING CHANGE:` footer saying what to do. Breaking changes include removing or
renaming an API endpoint or field, an environment variable, a public route, a CLI
flag, or an export of a published package.

```
feat(api)!: rename the billing interval variable

BREAKING CHANGE: APP_BILLING_CHARGE_INTERVAL_MS is now
APP_BILLING_INTERVAL_MS; set it in api/.env before deploying.
```

## Branches and pull requests

- Branches are named `<type>/<kebab-topic>`, optionally with a ticket number:
  `feat/home-features-slider`, `fix/123-checkout-overflow`.
- A pull request title uses the same header format, because a squash merge turns the
  title into the commit header.

## Check before finishing

Print every header on the branch that breaks the format or the length limit; no output
means every commit passes. `<base>` is the branch the work merges into (the add-on's,
or `git symbolic-ref --short refs/remotes/origin/HEAD`); put the project's scopes in
place of the generic `[a-z0-9-]+` to check them too:

```sh
git log --format=%s <base>..HEAD | grep -vE '^(feat|fix|perf|refactor|style|test|docs|build|ci|chore|revert)(\([a-z0-9-]+\))?!?: [a-z](.*[^.])?$'
git log --format=%s <base>..HEAD | awk 'length > 72'
```

When the user dictates a message that breaks the rule, propose the conforming header
before committing.

## Fixing a header

- The last commit, unpushed: `git commit --amend -m '<header>'`.
- Several unpushed commits: rebuild them with the new messages and the same trees
  (`git commit-tree <old>^{tree} -p <new parent> -m '<header>'` for each, then move the
  branch), and confirm `git diff <old tip> <new tip>` prints nothing.
- Never rewrite commits already pushed to a shared branch; the rule applies from the
  next commit.

## Examples

| Instead of | Write |
| --- | --- |
| `Turn home features grid into an auto-advancing slider` | `feat(web): turn the home features grid into an auto-advancing slider` |
| `Polish home page sections and promo banner` | `feat(web): polish home sections and promo banner` |
| `Make Premium free during beta behind a feature flag` | `feat: make premium free during beta behind a feature flag` |
| `Add polish-page and polish-app skills with slash commands` | `chore(skills): add polish-page and polish-app skills and commands` |
| `fix: Fixed the banner.` | `fix(web): keep the promo banner art shorter than its copy on phones` |
| `Update deps` | `build(deps): bump next from 16.1.1 to 16.1.2` |
| `feat(web): polish the home page and add the premium beta flag` | Two commits: `feat(web): polish …` and `feat: make premium free …` |
