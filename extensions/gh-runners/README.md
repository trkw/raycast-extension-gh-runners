# GitHub Runners for Raycast

Look at self-hosted GitHub Actions runners and manage the ones on this Mac from Raycast.
The extension is a front end for the [`gh runners`](https://github.com/trkw/gh-runners) GitHub CLI extension: every command runs `gh runners ... --json` and shows the result.

## Prerequisites

- [GitHub CLI](https://cli.github.com/), logged in with `gh auth login`
- The extension: `gh extension install trkw/gh-runners` (or the Nix flake / Home Manager package, see its README), a version with `--json`
- Aliases in `~/.config/gh-runners/repos` for **Runners** and **Workflow Runs** (`gh runners aliases` shows them)

Raycast starts commands with a minimal `PATH`, so `gh` is looked up in `/opt/homebrew/bin`, `/usr/local/bin`, `~/.nix-profile/bin`, `/etc/profiles/per-user/$USER/bin`, `/run/current-system/sw/bin` and `/nix/var/nix/profiles/default/bin` before `PATH`.
Set **gh Path** in the extension preferences when it lives somewhere else.
Those directories are also put first in `PATH` for `gh runners` itself, so it runs with the same `bash`, `curl` and `tar` as in a terminal.

## Commands

| Command | What it shows | Actions |
| --- | --- | --- |
| **Local Runners** | `gh runners local`: the runners on this Mac with their launchd service state, GitHub status (online / offline / busy) and version | Start, Stop, Restart, Upgrade, Show Workflow Runs, Open Runner Settings, Show in Finder |
| **Runners** | `gh runners list`: runners on GitHub for all aliases or one alias (dropdown), grouped by repository | Open Runner Settings, Show Workflow Runs, Copy Runner Name |
| **Workflow Runs** | `gh runners runs`: recent workflow runs for all aliases or one alias | Open in Browser, Copy URL, Open Runner Settings |

Start, Stop, Restart and Upgrade select the runner by its directory and run `gh runners start|stop|restart|upgrade DIR`; the result is shown as a toast.
Stopping a busy runner asks first, since the running job fails.
When one repository cannot be read (listing runners needs admin access), the others are still shown and a toast names the failure.

## Preferences

| Preference | Default |
| --- | --- |
| gh Path | empty: search the locations above, then `PATH` |
| Workflow Runs per Repository | 10 (1-100) |

## Development

```sh
npm install
npm run dev        # ray develop: load it into Raycast
npm run lint       # ray lint (needs network for the manifest checks)
npm run typecheck
```
