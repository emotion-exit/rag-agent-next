import { loadEnvConfig } from '@next/env';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ProxyAgent, setGlobalDispatcher } from 'undici';

const packageDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

const nodeEnv = process.env.NODE_ENV ?? 'development';

loadEnvConfig(packageDir, nodeEnv === 'development');

const provider = process.env.PROVIDER || 'openrouter';
const useProxy = process.env.USE_PROXY === 'true';

let proxyConfigured = false;

function configureProxy(providerLabel: 'Google' | 'OpenRouter') {
  if (!useProxy || proxyConfigured) {
    return;
  }

  const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY;

  if (!proxyUrl) {
    console.warn(
      `USE_PROXY is true but no proxy URL is configured for ${providerLabel} provider.`
    );
    return;
  }

  setGlobalDispatcher(new ProxyAgent(proxyUrl));
  proxyConfigured = true;

  console.log(
    `Proxy dispatcher configured for ${providerLabel} provider using ${proxyUrl}`
  );
}

export { provider, configureProxy };
