import googleAdapter from './google';

export default function adapterFactory(provider: string) {
  switch (provider) {
    case 'google':
      return googleAdapter;
    // case 'openrouter':
    //   return openRouterAdapter;
    // case 'ollama':
    //   return ollamaAdapter;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
