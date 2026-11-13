import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { createEmotionCache } from './app/emotionCache';
import { store } from './app/store';
import { App } from './App';

/** Renders the page to static HTML at build time, with MUI's critical CSS inlined. */
export function render() {
  const cache = createEmotionCache();
  const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache);
  const html = renderToString(
    <CacheProvider value={cache}>
      <Provider store={store}>
        <App />
      </Provider>
    </CacheProvider>,
  );
  return { html, styles: constructStyleTagsFromChunks(extractCriticalToChunks(html)) };
}
