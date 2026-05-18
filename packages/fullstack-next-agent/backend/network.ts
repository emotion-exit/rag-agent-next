import { ProxyAgent, setGlobalDispatcher } from 'undici';

const USE_PROXY = process.env.USE_PROXY === 'true';

let proxyConfigured = false;

function isLoopbackHost(hostname: string) {
  return (
    hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1'
  );
}

function resolveProxyUrl() {
  const httpProxy = process.env.HTTP_PROXY?.trim();
  if (httpProxy) {
    return httpProxy;
  }

  const httpsProxy = process.env.HTTPS_PROXY?.trim();
  if (!httpsProxy) {
    return undefined;
  }

  try {
    const proxyUrl = new URL(httpsProxy);
    if (proxyUrl.protocol === 'https:' && isLoopbackHost(proxyUrl.hostname)) {
      proxyUrl.protocol = 'http:';
      return proxyUrl.toString();
    }
  } catch {
    return httpsProxy;
  }

  return httpsProxy;
}

function ensureGlobalProxyDispatcher() {
  if (proxyConfigured || !USE_PROXY) {
    return;
  }

  const proxyUrl = resolveProxyUrl();
  if (!proxyUrl) {
    console.warn('USE_PROXY is true but no proxy URL is configured.');
    proxyConfigured = true;
    return;
  }

  setGlobalDispatcher(new ProxyAgent(proxyUrl));
  proxyConfigured = true;

  try {
    const parsed = new URL(proxyUrl);
    console.log(
      `Proxy dispatcher configured via ${parsed.protocol}//${parsed.host}`
    );
  } catch {
    console.log('Proxy dispatcher configured for outbound requests');
  }
}

ensureGlobalProxyDispatcher();

export { ensureGlobalProxyDispatcher, resolveProxyUrl };
