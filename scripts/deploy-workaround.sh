#!/bin/bash

# Build OpenNext (will fail on ast-grep)
bun x opennextjs-cloudflare build 2>/dev/null || true

# Remove ast-grep from server functions
rm -rf .open-next/server-functions/default/node_modules/@ast-grep

# Create stub for ast-grep
mkdir -p .open-next/server-functions/default/node_modules/@ast-grep/napi
cat > .open-next/server-functions/default/node_modules/@ast-grep/napi/index.js << 'STUB'
export const Lang = {};
export const parse = () => ({ root: () => ({ child: () => null, children: () => [] }) });
export default { Lang, parse };
STUB

# Now bundle manually
cd .open-next/server-functions/default
bun build handler.mjs --outdir=../../.open-next/assets --target=browser 2>/dev/null || true

# Deploy
cd ../..
bun x opennextjs-cloudflare deploy
