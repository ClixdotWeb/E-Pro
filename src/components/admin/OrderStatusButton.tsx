"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { advanceOrder, cancelOrder } from "@/app/admin/actions";
import { NEXT_STEP, canCancel } from "@/lib/order-status";

/**
 * The one action on an order: move it on.
 *
 * Labelled with the actual next step, so nobody has to know the
 * seven statuses exist. Shipping asks for the tracking number at the
 * moment it becomes true rather than leaving it to be filled in on
 * some other screen that would be forgotten.
 */
export function OrderStatusButton({
  orderNumber,
  status,
}: {
  orderNumber: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [asking, setAsking] = useState(false);
  const [tracking, setTracking] = useState("");
  const [courier, setCourier] = useState("");
  const [error, setError] = useState<string | null>(null);

  const label = NEXT_STEP[status];

  function advance(extra: { trackingNumber?: string; courier?: string } = {}) {
    setError(null);
    start(async () => {
      const r = await advanceOrder(orderNumber, extra);
      if (!r.ok) setError(r.message);
      else {
        setAsking(false);
        router.refresh();
      }
    });
  }

  function cancel() {
    if (!window.confirm(`Cancel order ${orderNumber}?`)) return;
    setError(null);
    start(async () => {
      const r = await cancelOrder(orderNumber);
      if (!r.ok) setError(r.message);
      else router.refresh();
    });
  }

  return (
    <span className="ml-auto flex flex-wrap items-center gap-3">
      {error && (
        <span role="status" className="text-[12px] font-bold text-danger">
          {error}
        </span>
      )}

      {canCancel(status) && (
        <button
          type="button"
          onClick={cancel}
          disabled={pending}
          className="text-[12px] font-bold text-text-low hover:text-danger disabled:opacity-40"
        >
          Cancel order
        </button>
      )}

      {label && !asking && (
        <button
          type="button"
          onClick={() => (status === "PROCESSING" ? setAsking(true) : advance())}
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-[14px] font-bold text-black transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "Saving…" : label}
        </button>
      )}

      {asking && (
        <span className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="courier">
            Courier
          </label>
          <input
            id="courier"
            value={courier}
            onChange={(e) => setCourier(e.target.value)}
            placeholder="Courier"
            className="h-11 w-[130px] rounded-[8px] border border-hairline bg-surface-1 px-3 text-[13px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
          />
          <label className="sr-only" htmlFor="tracking">
            Tracking number
          </label>
          <input
            id="tracking"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Tracking number"
            className="h-11 w-[170px] rounded-[8px] border border-hairline bg-surface-1 px-3 text-[13px] text-text-hi placeholder:text-text-low focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() =>
              advance({
                trackingNumber: tracking.trim() || undefined,
                courier: courier.trim() || undefined,
              })
            }
            disabled={pending}
            className="inline-flex h-11 items-center rounded-full bg-accent px-5 text-[14px] font-bold text-black disabled:opacity-50"
          >
            {pending ? "Saving…" : "Ship it"}
          </button>
          <button
            type="button"
            onClick={() => setAsking(false)}
            className="text-[12px] font-bold text-text-low hover:text-text-hi"
          >
            Cancel
          </button>
        </span>
      )}
    </span>
  );
}
