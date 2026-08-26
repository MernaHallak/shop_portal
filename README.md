# Store Admin Panel

A bilingual store administration interface built with Next.js 15 App Router.

## Stack

- Next.js 15 and React 19
- TypeScript
- Tailwind CSS
- `next-intl` (`ar` and `en`)
- Axios
- TanStack React Query
- Route Handlers as a BFF
- HttpOnly cookies for authentication tokens

## Routes

- `/ar/login` and `/en/login`
- `/ar/products` and `/en/products`
- `/` negotiates the default locale (`ar`) and redirects to the localized route.

The browser only calls same-origin `/api/*` Route Handlers. Backend access tokens
remain in HttpOnly cookies and are attached to upstream requests on the server.

## Commands

```bash
npm install
npm run dev
npx tsc --noEmit
npm run build
```

Set `BACKEND_API_URL` in `.env.local`. Do not expose it with a
`NEXT_PUBLIC_` prefix.
