"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { confirmPayment, startPayment } from "@/app/payment-actions";
import { openGateway } from "./openGateway";

/**
 * Pay for an order that is already placed.
 *
 * A dismissed modal, a dead battery or a lost signal leaves a real
 * order sitting unpaid, and without this the only way to finish it
 * was to order again. The order page is where someone goes looking,
 * so the button lives there.
 *
 * It starts a fresh intent each time rather than reusing the last
 * one: a gateway order can expire, and the amount is re-read from
 * our row on the way through.
 */
export function PayNowButton({
  orderNumber,
  amountLabel,
  customer,
}: {
  orderNumber: string;
  amountLabel: string;
  customer: { name?: string; email?: string; phone?: string };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [stage, setStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function pay() {
    setError(null);
    start(async () => {
      setStage("Opening the payment gateway…");
      const intent = await startPayment(orderNumber);

      if (!intent.ok) {
        setStage(null);
        setError(intent.message);
        return;
      }

      const outcome = await openGateway(intent.intent, customer);

      if (outcome.status === "paid") {
        setStage("Confirming the payment…");
        const done = await confirmPayment(orderNumber, outcome.result);
        if (!done.ok) {
          setStage(null);
          setError(done.message);
          return;
        }
      } else if (outcome.status === "failed") {
        setStage(null);
        setError(outcome.message);
        return;
      }

      setStage(null);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={pay}
        disabled={pending}
        className="rounded-[var(--r-md)] bg-accent px-5 py-3 text-[13px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? (stage ?? "One moment…") : `Pay ${amountLabel}`}
      </button>

      {error && (
        <p
          role="alert"
          className="w-full text-center text-[12px] font-semibold text-danger"
        >
          {error}
        </p>
      )}
    </>
  );
}
