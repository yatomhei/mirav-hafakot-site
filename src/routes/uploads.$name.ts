import { createFileRoute } from "@tanstack/react-router";

// Photos and videos uploaded in the admin, served from R2 on the live site (in development
// they're files under public/local-uploads instead).
export const Route = createFileRoute("/uploads/$name")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { serveUpload } = await import("@/content/uploads.server");
        return serveUpload(request, params.name);
      },
    },
  },
});
