import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { CacheProvider } from '@emotion/react';
import { Provider } from 'react-redux';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import './styles/global.css';
import { store } from './app/store';
import { createEmotionCache } from './app/emotionCache';
import { App } from './App';

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <CacheProvider value={createEmotionCache()}>
      <Provider store={store}>
        <App />
      </Provider>
    </CacheProvider>
  </StrictMode>
);

// The build pre-renders the page; hydrate that HTML instead of re-rendering from scratch.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);

console.log(
  '%c▶ portfolio.flow executed. Hey, fellow engineer 👋%c\nThis site is open source: https://github.com/kunalkr789/kunalkr789.github.io\nBuilt with React + MUI. If you’re hiring for frontend, I’d love to talk: singh.kunalkr06@gmail.com',
  'font: 600 16px monospace; color: #e8590c',
  'font: 13px system-ui; color: inherit',
);
