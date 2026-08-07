import { defineConfig } from "vitepress";

// GitHub Pages serves project sites under /<repo-name>/, so the base must
// match the repository the docs are deployed from. Locally (and for a
// custom domain or user/org page) this falls back to "/".
const base = process.env.GITHUB_ACTIONS
  ? `/${process.env.GITHUB_REPOSITORY?.split("/")[1] ?? ""}/`
  : "/";

export default defineConfig({
  title: "zynlepay-node",
  description: "Unofficial TypeScript SDK for the ZynlePay payments API",
  base,
  cleanUrls: true,
  srcExclude: ["**/_shared/**"],
  head: [["link", { rel: "icon", href: `${base}favicon.ico` }]],
  sitemap: {
    hostname: "https://engineervix.github.io/zynlepay-node/",
  },
  themeConfig: {
    search: {
      provider: "local",
    },
    externalLinkIcon: true,
    editLink: {
      pattern: "https://github.com/engineervix/zynlepay-node/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },
    lastUpdated: {
      text: "Last updated",
    },
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Reference", link: "/reference/card-deposit" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting started", link: "/guide/getting-started" },
          { text: "Handling callbacks", link: "/guide/callbacks" },
          { text: "Error handling", link: "/guide/errors" },
          { text: "Framework recipes", link: "/guide/frameworks" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "Card deposit", link: "/reference/card-deposit" },
          { text: "Momo deposit", link: "/reference/momo-deposit" },
          { text: "Momo withdraw", link: "/reference/momo-withdraw" },
          { text: "Wallet to bank", link: "/reference/wallet-to-bank" },
          { text: "Payment status", link: "/reference/payment-status" },
          { text: "Balance check", link: "/reference/balance-check" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/engineervix/zynlepay-node" }],
    footer: {
      message:
        'Favicon by <a href="https://www.svgrepo.com/svg/419248/pay-sale-shop">SVG Repo</a>. Built with <a href="https://vitepress.dev/">VitePress</a>.',
    },
  },
});
