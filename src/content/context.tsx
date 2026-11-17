import { createContext, useContext, type ReactNode } from "react";
import { defaultContent, type SiteContent } from "./docs";

const ContentContext = createContext<SiteContent>(defaultContent);

/** Provided once in __root.tsx from the root loader, so every page shares one copy. */
export function ContentProvider({ value, children }: { value: SiteContent; children: ReactNode }) {
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

/** The site's content: the launch content with the admin's saved edits applied. */
export const useContent = () => useContext(ContentContext);

export const useHome = () => useContent().home;
export const useSite = () => useContent().site;
