// The shareable preview has no server: stand-ins for TanStack's server helpers, which only
// the admin sign-in and the robots/sitemap routes import (none of them run in the preview).
export const getCookie = () => undefined;
export const setCookie = () => {};
export const deleteCookie = () => {};
export const getRequestHeader = () => undefined;
export const getRequest = () => {
  throw new Error("No server in the preview");
};
