/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** gh Path - Path to the gh binary. Leave empty to look in Homebrew and Nix locations, then PATH. */
  "ghPath": string,
  /** Workflow Runs per Repository - How many recent workflow runs to show for each repository (1-100). */
  "runsLimit": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `local-runners` command */
  export type LocalRunners = ExtensionPreferences & {}
  /** Preferences accessible in the `runners` command */
  export type Runners = ExtensionPreferences & {}
  /** Preferences accessible in the `workflow-runs` command */
  export type WorkflowRuns = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `local-runners` command */
  export type LocalRunners = {}
  /** Arguments passed to the `runners` command */
  export type Runners = {}
  /** Arguments passed to the `workflow-runs` command */
  export type WorkflowRuns = {}
}

