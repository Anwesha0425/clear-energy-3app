/**
 * Constants for the Customer App.
 *
 * CUSTOMER_ID is a deliberate stand-in for a real auth session user ID.
 * In production this would come from the auth token/context, not a constant file.
 * Resolved ambiguity per README §5.4 — placed here, not inline in the screen.
 */
export const CUSTOMER_ID = 'c-001';

/**
 * API base URL — points to the json-server mock backend.
 * In production: read from an environment variable via EXPO_PUBLIC_API_URL.
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:4000';
