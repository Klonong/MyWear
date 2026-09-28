# MyWear storefront

Next.js 16 storefront. Products, bag, checkout, accounts, wishlist, search, reviews, stock alerts and the newsletter all come from the NestJS API in `../mywear-api`.

## Run it

```bash
# 1. the API (see ../mywear-api/README.md): database, seed, server on :4000
cd ../mywear-api && npm run db:up && npm run start:dev

# 2. the storefront on :3000
npm run dev
```

The browser calls `/api/*` on this origin and `next.config.ts` proxies it to the API, so the API's httpOnly cookies (guest bag, refresh token) are first-party. Server components call the API directly. Point both at another API with `API_URL` (default `http://localhost:4000`).

- `lib/api.ts`: fetch helper, access token and silent refresh, catalogue reads (cached 60s)
- `lib/store.tsx`: session, bag, wishlist and popups for client components

In development, checkout completes the API's mock payment automatically; swap in the real gateway's redirect there when one is contracted.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
