"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Spinner } from "@/components/Spinner";

export type ConfirmOptions = {
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** "danger" renders a red confirm button (default); "default" uses the primary accent. */
  tone?: "danger" | "default";
  /**
   * Optional async action run when the user confirms. While it runs the dialog
   * stays open and the confirm button shows a spinner. If it resolves, the
   * dialog closes; if it throws, the dialog stays open (let the action surface
   * its own error, e.g. a toast) so the user can retry or cancel.
   */
  onConfirm?: () => void | Promise<void>;
};

type ConfirmState = ConfirmOptions & {
  open: boolean;
  resolve: ((value: boolean) => void) | null;
};

const ConfirmContext = React.createContext<
  ((options: ConfirmOptions) => Promise<boolean>) | null
>(null);

/**
 * Returns an async `confirm()` that opens a styled dialog and resolves to
 * `true` (confirmed) or `false` (cancelled / dismissed). Drop-in replacement
 * for the native `window.confirm`, e.g.
 *   if (!(await confirm({ title: "Delete this?" }))) return;
 *
 * Pass `onConfirm` to run the work inside the dialog with a loading spinner:
 *   confirm({ title: "Delete?", onConfirm: async () => { await fetch(...) } });
 */
export function useConfirm() {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within a <ConfirmProvider>");
  }
  return ctx;
}

const INITIAL: ConfirmState = {
  open: false,
  resolve: null,
  title: "",
};

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ConfirmState>(INITIAL);
  const [busy, setBusy] = React.useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const confirm = React.useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, open: true, resolve });
    });
  }, []);

  const close = React.useCallback((result: boolean) => {
    setBusy(false);
    setState((s) => {
      s.resolve?.(result);
      return { ...s, open: false, resolve: null };
    });
  }, []);

  async function handleConfirm() {
    if (!state.onConfirm) {
      close(true);
      return;
    }
    setBusy(true);
    try {
      await state.onConfirm();
      close(true);
    } catch {
      // Keep the dialog open; the action is responsible for reporting its error.
      setBusy(false);
    }
  }

  const tone = state.tone ?? "danger";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <DialogPrimitive.Root
        open={state.open}
        onOpenChange={(open) => {
          // Esc, overlay click, or close button resolve as "cancelled" —
          // but never let the dialog be dismissed mid-request.
          if (!open && !busy) close(false);
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="confirm-overlay" />
          <DialogPrimitive.Content
            className="confirm-card"
            onOpenAutoFocus={(e) => {
              // Focus the cancel button rather than the destructive action.
              e.preventDefault();
              cancelRef.current?.focus();
            }}
            onEscapeKeyDown={(e) => {
              if (busy) e.preventDefault();
            }}
            onInteractOutside={(e) => {
              if (busy) e.preventDefault();
            }}
          >
            <DialogPrimitive.Title
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              {state.title}
            </DialogPrimitive.Title>
            {state.description ? (
              <DialogPrimitive.Description
                style={{
                  color: "var(--text-muted)",
                  fontSize: 14,
                  lineHeight: 1.55,
                  marginTop: 10,
                  marginBottom: 0,
                }}
              >
                {state.description}
              </DialogPrimitive.Description>
            ) : (
              // Radix warns if no Description is present; keep it accessible-hidden.
              <DialogPrimitive.Description className="sr-only">
                {state.title}
              </DialogPrimitive.Description>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 26,
              }}
            >
              <button
                ref={cancelRef}
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={busy}
                onClick={() => close(false)}
              >
                {state.cancelText ?? "Cancel"}
              </button>
              <button
                type="button"
                className={`btn btn--sm ${tone === "danger" ? "btn--danger" : "btn--primary"}`}
                disabled={busy}
                onClick={handleConfirm}
              >
                {busy && <Spinner size={14} />}
                {state.confirmText ?? "Confirm"}
              </button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </ConfirmContext.Provider>
  );
}
