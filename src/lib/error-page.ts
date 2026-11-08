export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>הדף לא נטען</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 16px/1.5 system-ui, -apple-system, sans-serif; background: #FAF0EB; color: #2E3128; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #2E3128; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.6rem 1.2rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid #656C51; border-radius: 999px; }
      .primary { background: #656C51; color: #FAF0EB; }
      .secondary { background: transparent; color: #2E3128; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>הדף לא נטען</h1>
      <p>משהו השתבש אצלנו. אפשר לנסות לרענן או לחזור לדף הבית.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">נסו שוב</button>
        <a class="secondary" href="/">חזרה לדף הבית</a>
      </div>
    </div>
  </body>
</html>`;
}
