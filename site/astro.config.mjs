import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLlmsTxt from "starlight-llms-txt";

// Sidebar mirrors SUMMARY.md exactly: Sailor group first, then Protocol, then Legal.
// Section-index pages (with children) appear as the first item of their group.
const sailor = {
  label: "Sailor",
  items: [
    { label: "Overview", slug: "sailor/sailor" },
    {
      label: "Getting started",
      items: [
        { label: "Getting started", slug: "sailor/getting-started" },
        { label: "Quickstart", slug: "sailor/getting-started/quickstart" },
        { label: "Operate Sailor with a coding agent", slug: "sailor/getting-started/coding-agent" },
      ],
    },
    { label: "npm package", slug: "sailor/packages" },
    { label: "Docker", slug: "sailor/docker" },
    { label: "Skills", slug: "sailor/skills" },
    {
      label: "Concepts",
      items: [
        { label: "Concepts", slug: "sailor/concepts" },
        { label: "Sailor & the Protocol", slug: "sailor/concepts/protocol-mapping" },
        { label: "On-chain vs off-chain", slug: "sailor/concepts/on-chain-off-chain" },
        { label: "Keys & custody", slug: "sailor/concepts/keys-and-custody" },
      ],
    },
    {
      label: "Guides",
      items: [
        { label: "Guides", slug: "sailor/guides" },
        { label: "Deploy & predict an SMA", slug: "sailor/guides/deploy-sma" },
        { label: "Build & register a mandate", slug: "sailor/guides/build-a-mandate" },
        { label: "Configure a shared template", slug: "sailor/guides/configure-a-template" },
        { label: "Run a strategy & dispatch", slug: "sailor/guides/run-a-strategy" },
        { label: "Simulate before going live", slug: "sailor/guides/simulate" },
        { label: "Multi-chain operation", slug: "sailor/guides/multi-chain" },
        { label: "Automate & run unattended", slug: "sailor/guides/ci" },
      ],
    },
    { label: "CLI reference", slug: "sailor/cli" },
    {
      label: "SDK reference",
      items: [
        { label: "SDK reference", slug: "sailor/sdk" },
        { label: "SailorClient", slug: "sailor/sdk/client" },
        { label: "The Agent interface", slug: "sailor/sdk/agent" },
        { label: "Exports & helpers", slug: "sailor/sdk/reference" },
      ],
    },
    { label: "Dashboard (local UI)", slug: "sailor/dashboard" },
    { label: "Shipyard (simulation sandbox)", slug: "sailor/shipyard" },
    { label: "Security", slug: "sailor/security" },
    { label: "Troubleshooting & FAQ", slug: "sailor/troubleshooting" },
  ],
};

const protocol = {
  label: "Protocol",
  items: [
    { label: "Overview", slug: "protocol/protocol" },
    {
      label: "Concepts",
      items: [
        { label: "Concepts", slug: "protocol/concepts" },
        { label: "Separately Managed Accounts", slug: "protocol/concepts/smas" },
        { label: "The three roles", slug: "protocol/concepts/roles" },
        { label: "The mandate & selective dispatch", slug: "protocol/concepts/mandate" },
        { label: "The four evaluation guarantees", slug: "protocol/concepts/evaluation-guarantees" },
        { label: "Deterministic deployment", slug: "protocol/concepts/deterministic-deployment" },
        { label: "Glossary", slug: "protocol/concepts/glossary" },
      ],
    },
    {
      label: "Architecture",
      items: [
        { label: "Architecture", slug: "protocol/architecture" },
        { label: "SailKernel", slug: "protocol/architecture/kernel" },
        { label: "SailGovernance & Timelock", slug: "protocol/architecture/governance" },
        { label: "MandateFactory", slug: "protocol/architecture/mandate-factory" },
        { label: "SafeModuleEnabler", slug: "protocol/architecture/safe-module-enabler" },
        { label: "Single & batch dispatch", slug: "protocol/architecture/dispatch" },
      ],
    },
    {
      label: "Permission system",
      items: [
        { label: "Permission system", slug: "protocol/permissions" },
        { label: "IPermission & Context", slug: "protocol/permissions/ipermission" },
        { label: "Full expressiveness", slug: "protocol/permissions/expressiveness" },
        { label: "Shared multi-tenant templates", slug: "protocol/permissions/shared-templates" },
        { label: "Permission lifecycle", slug: "protocol/permissions/lifecycle" },
        { label: "Extension interfaces", slug: "protocol/permissions/extensions" },
      ],
    },
    {
      label: "Guides",
      items: [
        { label: "Guides", slug: "protocol/guides" },
        { label: "Write your first permission", slug: "protocol/guides/write-a-permission" },
        { label: "Deploy an SMA", slug: "protocol/guides/deploy-an-sma" },
        { label: "Register a mandate & appoint a manager", slug: "protocol/guides/register-a-mandate" },
        { label: "Dispatch a transaction within bounds", slug: "protocol/guides/dispatch" },
        { label: "Use a shared template", slug: "protocol/guides/use-a-template" },
      ],
    },
    {
      label: "Fees & governance",
      items: [
        { label: "Fees & governance", slug: "protocol/fees-and-governance" },
        { label: "Fee model", slug: "protocol/fees-and-governance/fees" },
        { label: "Governance", slug: "protocol/fees-and-governance/governance" },
      ],
    },
    {
      label: "Security",
      items: [
        { label: "Security", slug: "protocol/security" },
        { label: "Guarantees", slug: "protocol/security/guarantees" },
        { label: "Limitations", slug: "protocol/security/limitations" },
        { label: "Octane security review", slug: "protocol/security/audits" },
      ],
    },
    {
      label: "Reference",
      items: [
        { label: "Reference", slug: "protocol/reference" },
        { label: "Deployment addresses", slug: "protocol/reference/addresses" },
        { label: "Deterministic addresses", slug: "protocol/reference/deterministic-addresses" },
        { label: "EIP-712 typed data", slug: "protocol/reference/eip712" },
        { label: "Contract reference", slug: "protocol/reference/contracts" },
      ],
    },
  ],
};

const legal = {
  label: "Legal",
  items: [
    { label: "Overview", slug: "legal/legal" },
    { label: "Terms of Use", slug: "legal/terms-of-use" },
    { label: "Privacy Policy", slug: "legal/privacy-policy" },
    { label: "Disclaimer & Risks", slug: "legal/disclaimer" },
    { label: "Open-Source Licenses", slug: "legal/open-source-licenses" },
  ],
};

export default defineConfig({
  site: "https://docs.sail.money",
  trailingSlash: "never",
  build: { format: "file" },
  redirects: {
    "/sailor": "/sailor/sailor",
    "/protocol": "/protocol/protocol",
    "/legal": "/legal/legal",
  },
  integrations: [
    starlight({
      title: "Sail",
      description: "Onchain Separately Managed Accounts Run By Agents.",
      logo: { src: "./src/assets/sail-logo.png", alt: "Sail" },
      favicon: "/favicon.png",
      components: {
        // Dark-only: remove the light/auto theme switcher entirely.
        ThemeSelect: "./src/components/ThemeSelect.astro",
      },
      customCss: ["./src/styles/fonts.css", "./src/styles/sail.css"],
      pagefind: true,
      social: [
        { icon: "discord", label: "Discord", href: "https://discord.gg/9GsxPsHzRv" },
        { icon: "x.com", label: "X", href: "https://x.com/SaildotMoney" },
        { icon: "github", label: "GitHub", href: "https://github.com/sail-money" },
      ],
      head: [
        {
          // Dark-only: force dark and pin the stored preference so nothing switches.
          tag: "script",
          content:
            "try{localStorage.setItem('starlight-theme','dark')}catch(e){}document.documentElement.dataset.theme='dark';",
        },
        { tag: "link", attrs: { rel: "preload", as: "font", type: "font/ttf", href: "/fonts/DM_Sans/DMSans-VariableFont_opsz,wght.ttf", crossorigin: true } },
        { tag: "link", attrs: { rel: "preload", as: "font", type: "font/otf", href: "/fonts/FK_Display/FKDisplayTrial-Regular.otf", crossorigin: true } },
        {
          // Open the header social links in a new tab.
          tag: "script",
          content:
            "addEventListener('DOMContentLoaded',function(){document.querySelectorAll('.social-icons a').forEach(function(a){a.target='_blank';a.rel='noopener noreferrer';});});",
        },
      ],
      sidebar: [
        { label: "For AI agents", slug: "for-ai-agents" },
        sailor,
        protocol,
        legal,
      ],
      plugins: [starlightLlmsTxt()],
    }),
  ],
});
