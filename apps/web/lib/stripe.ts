import Stripe from "stripe";

const API_VERSION = "2024-06-20" as const;

/**
 * Returns a Stripe instance using the given secret key.
 * In OrgHub each org provides their own Stripe keys stored in the organizations table.
 */
export function getStripe(secretKey: string): Stripe {
  return new Stripe(secretKey, { apiVersion: API_VERSION });
}
