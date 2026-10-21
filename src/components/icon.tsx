import type { CSSProperties } from "react";

export type IconName = "plus" | "search" | "list" | "calendar" | "clock" | "check" | "arrow" | "close" | "edit" | "trash" | "filter" | "logout" | "chevron" | "eye" | "eye-off";
const paths: Record<IconName, string> = {
  plus: "M12 5v14M5 12h14",
  search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  list: "M9 6h12M9 12h12M9 18h12M3 6h.01M3 12h.01M3 18h.01",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2",
  clock: "M12 8v4l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  check: "m5 12 4 4L19 6",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  close: "m6 6 12 12M6 18 18 6",
  edit: "m16 3 5 5M4 20l4-1L21 6a2 2 0 0 0-3-3L5 16l-1 4",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
  filter: "M4 7h16M7 12h10M10 17h4",
  logout: "M9 3H4v18h5M10 12h11m-4-4 4 4-4 4",
  chevron: "m9 5 7 7-7 7",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  "eye-off": "m3 3 18 18M10 5c1-.2 1.3 0 2 0 6 0 10 7 10 7a20 20 0 0 1-3 4M6 6a20 20 0 0 0-4 6s4 7 10 7c2 0 3.5-.6 5-1.5M9 9a4 4 0 0 0 6 6",
};

export function Icon({ name, size = 20, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={style}><path d={paths[name]} /></svg>;
}
