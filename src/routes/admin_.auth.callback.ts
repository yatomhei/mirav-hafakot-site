import { createFileRoute } from "@tanstack/react-router";

// Where Google sends the visitor back. Must match the "Authorized redirect URI" of the OAuth
// client in Google Cloud Console, for every address the admin is used on.
export const Route = createFileRoute("/admin_/auth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { finishGoogleSignIn } = await import("@/admin/auth/google.server");
        return finishGoogleSignIn(request);
      },
    },
  },
});
