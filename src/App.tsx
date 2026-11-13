import { useEffect } from 'react';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { buildTheme } from './app/theme';
import { Toolbar } from './components/Toolbar';
import { Palette, Inspector } from './components/Panels';
import { CommandPalette } from './components/CommandPalette';
import { Hero } from './features/hero/Hero';
import { Work, ConditionNode } from './features/work/Work';
import { Dwar } from './features/dwar/Dwar';
import { Backend } from './features/backend/Backend';
import { Engineering } from './features/engineering/Engineering';
import { Projects } from './features/more/Projects';
import { Experience } from './features/more/Experience';
import { GithubHistory } from './features/more/GithubHistory';
import { Skills } from './features/more/Skills';
import { Contact } from './features/more/Contact';
import { useAppSelector } from './app/store';
import { useTrackActiveNode } from './lib/useTrackActiveNode';
import { flow } from './data/flow';
import { profile } from './data/profile';

const muiTheme = buildTheme();

/** Keeps MUI's colour scheme in step with the canvas theme held in Redux. */
function SyncMuiScheme() {
  const theme = useAppSelector((s) => s.ui.theme);
  const { setMode } = useColorScheme();
  useEffect(() => setMode(theme), [theme, setMode]);
  return null;
}

export function App() {
  const theme = useAppSelector((s) => s.ui.theme);
  useTrackActiveNode();

  // Marks the prerendered page as interactive (tests and tooling wait on it).
  useEffect(() => {
    document.documentElement.dataset.hydrated = 'true';
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#151513' : '#f3f1ec');
  }, [theme]);

  return (
    <ThemeProvider theme={muiTheme}>
      <SyncMuiScheme />
      <a href="#main" className="skip">
        Skip to content
      </a>
      <Toolbar />
      <div className="studio">
        <Palette />
        <main id="main" className="canvas">
          <div className="canvas-inner">
            <Hero />
            <Work />
            <Dwar />
            <ConditionNode />
            <Backend />
            <Engineering />
            <Projects />
            <Experience />
            <GithubHistory />
            <Skills />
            <Contact />
          </div>
        </main>
        <Inspector />
      </div>
      <footer className="statusbar">
        <div className="statusbar-in">
          <span>
            <i className="dot ok" /> {flow.length} nodes · {flow.length - 1} edges · 0 errors
          </span>
          <span>
            © <span suppressHydrationWarning>{new Date().getFullYear()}</span> {profile.name} · React 19 · TypeScript · MUI · Redux Toolkit · Framer Motion
          </span>
          <span>
            <a href={`${profile.githubUrl}/${profile.github}.github.io`} target="_blank" rel="noopener noreferrer">
              view source
            </a>
            · press <span className="kbd">/</span> for commands
          </span>
        </div>
      </footer>
      <CommandPalette />
    </ThemeProvider>
  );
}
