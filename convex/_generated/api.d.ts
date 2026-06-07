/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as lib_audit from "../lib/audit.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_numbering from "../lib/numbering.js";
import type * as lib_presales from "../lib/presales.js";
import type * as modules_audit from "../modules/audit.js";
import type * as modules_customers from "../modules/customers.js";
import type * as modules_dashboard from "../modules/dashboard.js";
import type * as modules_finance from "../modules/finance.js";
import type * as modules_inventory from "../modules/inventory.js";
import type * as modules_lead from "../modules/lead.js";
import type * as modules_notifications from "../modules/notifications.js";
import type * as modules_orders from "../modules/orders.js";
import type * as modules_products from "../modules/products.js";
import type * as modules_quotations from "../modules/quotations.js";
import type * as modules_reports from "../modules/reports.js";
import type * as modules_seed from "../modules/seed.js";
import type * as modules_service from "../modules/service.js";
import type * as modules_settings from "../modules/settings.js";
import type * as modules_subsidy from "../modules/subsidy.js";
import type * as modules_surveys from "../modules/surveys.js";
import type * as modules_users from "../modules/users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "lib/audit": typeof lib_audit;
  "lib/auth": typeof lib_auth;
  "lib/numbering": typeof lib_numbering;
  "lib/presales": typeof lib_presales;
  "modules/audit": typeof modules_audit;
  "modules/customers": typeof modules_customers;
  "modules/dashboard": typeof modules_dashboard;
  "modules/finance": typeof modules_finance;
  "modules/inventory": typeof modules_inventory;
  "modules/lead": typeof modules_lead;
  "modules/notifications": typeof modules_notifications;
  "modules/orders": typeof modules_orders;
  "modules/products": typeof modules_products;
  "modules/quotations": typeof modules_quotations;
  "modules/reports": typeof modules_reports;
  "modules/seed": typeof modules_seed;
  "modules/service": typeof modules_service;
  "modules/settings": typeof modules_settings;
  "modules/subsidy": typeof modules_subsidy;
  "modules/surveys": typeof modules_surveys;
  "modules/users": typeof modules_users;
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
