/**
 * OrderRow — the canonical "row" shape every screen renders.
 *
 * Design principles:
 * - ONE type for all 3 endpoints. View-specific fields are optional.
 * - amountPaise is always integer paise when present (NEVER rupee floats).
 * - sku is a display string — the raw DTO's sku.name (customer) or sku string (driver).
 * - status uses a string union that covers all 3 endpoint enums, plus string fallback
 *   so an unknown API value never crashes a switch statement.
 *
 * Ambiguity log:
 * - TripStop has no amountPaise → optional
 * - PendingAction has no customerName/address → optional, uses `summary` instead
 * - Priority in mock data uses "med" (not "medium") — matched exactly here
 */

/** Covers Order.status (openapi: placed|assigned|out_for_delivery|delivered|cancelled|returned),
 *  TripStop.status (pending|active|done|skipped), and any future unknown values. */
export type OrderStatus =
  | 'placed'
  | 'assigned'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'pending'
  | 'active'
  | 'done'
  | 'skipped'
  | 'confirmed'
  | 'preparing'
  | 'failed';

/** Priority from pending-actions endpoint. "med" matches mock-api.json exactly. */
export type AdminPriority = 'low' | 'med' | 'high' | 'breached';

/** The one row shape every screen renders, regardless of source endpoint. */
export interface OrderRow {
  id: string;
  /** Customer name — optional because PendingAction uses summary instead. */
  customerName?: string;
  /** Delivery address — optional (not present in TripStop directly, or PendingAction). */
  address?: string;
  /** Amount in integer paise. Absent for driver/admin rows. ₹0.00 is valid (comped orders). */
  amountPaise?: number;
  /** Display SKU string — e.g. "14.2 kg Domestic LPG (HPCL)" or "14.2 kg × 1" */
  sku?: string;
  /** Union of all status enums across all 3 endpoints. Unknown values degrade gracefully. */
  status: OrderStatus | string;
  /** ISO 8601 timestamp — when the order was placed (customer only). */
  placedAt?: string;

  // ─── Customer-specific ───────────────────────────────────────────────────
  /** ISO 8601 ETA timestamp (customer endpoint). Null = delivered/no ETA. */
  eta?: string | null;

  // ─── Driver-specific ─────────────────────────────────────────────────────
  /** ETA in minutes to this stop (driver endpoint). Null = done/no ETA. */
  etaMinutes?: number | null;
  /** Stop sequence in the driver's route. */
  seq?: number;
  /** Distance to this stop in km. */
  distanceKm?: number;

  // ─── Admin-specific ──────────────────────────────────────────────────────
  /** Admin priority: "breached" means SLA already exceeded. */
  priority?: AdminPriority;
  /** How long this item has been pending, in minutes. */
  ageMinutes?: number;
  /** SLA window in minutes for this category. */
  slaMinutes?: number;
  /** Action verb: "approve" | "route" | "decide" | "assign" | "remind" | "review" */
  action?: string;
  /** Category: "cash" | "mi_empty" | "mi_full" | "prior_delivery" | "unassigned" | "kyc" | etc. */
  category?: string;
  /** One-line summary for admin cards (replaces customerName + address). */
  summary?: string;
  /** Human-readable prompt for the action button, e.g. "Confirm pickup". */
  actionRequired?: string;
}

// ── Raw DTOs ─────────────────────────────────────────────────────────────────
// These are private to api/endpoints.ts. They match mock-api.json exactly.
// Do NOT export or use these outside of api/.

/** Raw DTO from GET /orders */
export interface CustomerOrderDTO {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  amountPaise: number;
  sku: { code: string; name: string; qty: number };
  status: string;
  placedAt: string;
  eta: string | null;
}

/** Raw DTO from GET /trips (flat row — NOT nested stops[]) */
export interface TripStopDTO {
  seq: number;
  orderId: string;
  driverId: string;
  customerName: string;
  sku: string;
  address: string;
  distanceKm: number;
  status: string;
  etaMin: number | null;
}

/** Raw DTO from GET /pending-actions */
export interface PendingActionDTO {
  id: string;
  adminId: string;
  category: string;
  summary: string;
  priority: string;
  ageMinutes: number;
  slaMinutes: number;
  action: string;
}

// ── Mapper functions ─────────────────────────────────────────────────────────
// The ONLY place raw DTO → OrderRow conversion happens.
// Every field name difference between endpoints lives here and nowhere else.

export function mapCustomerOrderToRow(dto: CustomerOrderDTO): OrderRow {
  return {
    id: dto.id,
    customerName: dto.customerName,
    address: dto.address,
    // Defensive: round in case upstream sends a float (should be integer paise per spec)
    amountPaise: Math.round(dto.amountPaise),
    sku: dto.sku.name,
    status: dto.status as OrderStatus,
    placedAt: dto.placedAt,
    eta: dto.eta,
  };
}

export function mapTripStopToRow(dto: TripStopDTO): OrderRow {
  return {
    id: dto.orderId,
    customerName: dto.customerName,
    address: dto.address,
    // No amountPaise — driver doesn't see prices
    sku: dto.sku,
    status: dto.status as OrderStatus,
    seq: dto.seq,
    distanceKm: dto.distanceKm,
    // etaMin in mock maps to etaMinutes in OrderRow
    etaMinutes: dto.etaMin,
  };
}

export function mapPendingActionToRow(dto: PendingActionDTO): OrderRow {
  return {
    id: dto.id,
    // No customerName/address — admin cards use summary instead
    summary: dto.summary,
    category: dto.category,
    priority: dto.priority as AdminPriority,
    ageMinutes: dto.ageMinutes,
    slaMinutes: dto.slaMinutes,
    action: dto.action,
    status: 'pending', // semantic placeholder — admin rows don't have a delivery status
    actionRequired: labelForAction(dto.action),
  };
}

/** Human-readable label for each action verb. */
function labelForAction(action: string): string {
  const labels: Record<string, string> = {
    approve: 'Approve',
    route: 'Route',
    decide: 'Decide',
    assign: 'Assign',
    remind: 'Remind',
    review: 'Review',
  };
  return labels[action] ?? action.charAt(0).toUpperCase() + action.slice(1);
}
