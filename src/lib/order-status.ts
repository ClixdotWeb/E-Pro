/**
 * What the one button on an order says.
 *
 * Kept out of the actions module because a "use server" file may only
 * export async functions, and out of the component because the server
 * renders the label too.
 */
export const NEXT_STEP: Record<string, string> = {
  PENDING: "Confirm order",
  CONFIRMED: "Start cutting",
  PROCESSING: "Mark as shipped",
  SHIPPED: "Mark as delivered",
};

export function canCancel(status: string): boolean {
  return !["DELIVERED", "CANCELLED", "RETURNED"].includes(status);
}
