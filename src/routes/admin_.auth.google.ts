import { createFileRoute } from "@tanstack/react-router";

// "Sign in with Google": sends the visitor to Google's account picker.
export const Route = createFileRoute("/admin_/auth/google")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { startGoogleSignIn } = await import("@/admin/auth/google.server");
        return startGoogleSignIn(request);
      },
    },
  },
});
