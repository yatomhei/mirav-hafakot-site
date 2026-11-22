import { createContext, useContext, type Context, type ReactNode } from "react";
import { defaultContent, type SiteContent } from "./docs";

// One context for the whole app, kept on globalThis. When the dev server swaps in edited code,
// this file runs again; a second context would leave readers (the admin) cut off from the
// provider, quietly showing the launch content, and a save from there overwrote saved edits.
const shared = globalThis as typeof globalThis & { __miravContent?: Context<SiteContent> };
const ContentContext = (shared.__miravContent ??= createContext<SiteContent>(defaultContent));

/** Provided once in __root.tsx from the root loader, so every page shares one copy. */
export function ContentProvider({ value, children }: { value: SiteContent; children: ReactNode }) {
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

/** The site's content: the launch content with the admin's saved edits applied. */
export const useContent = () => useContext(ContentContext);

export const useHome = () => useContent().home;
export const useSite = () => useContent().site;
