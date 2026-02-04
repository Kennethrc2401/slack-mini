/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activity from "../activity.js";
import type * as auth from "../auth.js";
import type * as authActions from "../authActions.js";
import type * as automations from "../automations.js";
import type * as channels from "../channels.js";
import type * as conversations from "../conversations.js";
import type * as dms from "../dms.js";
import type * as drafts from "../drafts.js";
import type * as events from "../events.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as members from "../members.js";
import type * as mentions from "../mentions.js";
import type * as messages from "../messages.js";
import type * as reactions from "../reactions.js";
import type * as todos from "../todos.js";
import type * as upload from "../upload.js";
import type * as userPreferences from "../userPreferences.js";
import type * as users from "../users.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activity: typeof activity;
  auth: typeof auth;
  authActions: typeof authActions;
  automations: typeof automations;
  channels: typeof channels;
  conversations: typeof conversations;
  dms: typeof dms;
  drafts: typeof drafts;
  events: typeof events;
  files: typeof files;
  http: typeof http;
  members: typeof members;
  mentions: typeof mentions;
  messages: typeof messages;
  reactions: typeof reactions;
  todos: typeof todos;
  upload: typeof upload;
  userPreferences: typeof userPreferences;
  users: typeof users;
  workspaces: typeof workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
