"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon } from "@/components/icon";

export function Modal({ title, pending, onClose, children }: {
  title: string; pending: boolean; onClose: () => void; children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog?.showModal();
    dialog?.querySelector<HTMLInputElement>("input")?.focus();
    return () => { dialog?.close(); if (trigger?.isConnected) trigger.focus(); else document.querySelector<HTMLButtonElement>(".main-create")?.focus(); };
  }, []);
  return (
    <dialog ref={ref} className="app-dialog" aria-labelledby={titleId}
      onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }}>
      <div className="dialog-heading"><h2 id={titleId}>{title}</h2><button type="button" className="icon-button" aria-label="Tutup dialog" onClick={onClose} disabled={pending}><Icon name="close" /></button></div>
      {children}
    </dialog>
  );
}
