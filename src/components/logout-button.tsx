"use client";

import { useFormStatus } from "react-dom";
import { Icon } from "@/components/icon";

export function LogoutButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="quiet-button"><Icon name="logout" size={17} />{pending ? "Keluar…" : "Keluar"}</button>;
}
