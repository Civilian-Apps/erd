// SCAFFOLD-DISPOSABLE — metadata only; the sole renderer is apps/widget's RSD build.
// MCP Apps is the portable foundation supported by current ChatGPT hosts.
// Actual ChatGPT/Claude publication remains a separate acceptance check.
export const EXAMPLE_WIDGET_URI = 'ui://widget/example-card.v0.html'
export const EXAMPLE_WIDGET_MIME = 'text/html;profile=mcp-app'
export const exampleWidgetResource = {
  uri: EXAMPLE_WIDGET_URI,
  name: 'example-card',
  mimeType: EXAMPLE_WIDGET_MIME,
  meta: {
    ui: { prefersBorder: true, csp: { connectDomains: [] as string[], resourceDomains: [] as string[] } },
    'openai/widgetDescription': 'Read-only examples shared with the Coach application.',
    'openai/widgetPrefersBorder': true,
    'openai/widgetCSP': { connect_domains: [] as string[], resource_domains: [] as string[] },
  },
} as const
