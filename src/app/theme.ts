import { createTheme } from '@mui/material/styles';

/**
 * MUI theme built from the canvas design tokens, in CSS-variables mode: both colour
 * schemes are emitted as CSS variables keyed by the same [data-theme] attribute the
 * site uses, so markup is identical in light and dark (which makes pre-rendering safe)
 * and switching themes is a pure CSS change. Component overrides read the site's own
 * custom properties, so one token edit restyles MUI and non-MUI surfaces together.
 */
const tokens = {
  light: { canvas: '#f3f1ec', node: '#ffffff', ink: '#1d1c1a', muted: '#5f5b53', line: '#e4e0d6', sel: '#3b5bdb', ok: '#2b8a3e', warn: '#d9480f', err: '#e03131' },
  dark: { canvas: '#151513', node: '#1f1f1d', ink: '#eceae4', muted: '#b0ab9f', line: '#2f2e2a', sel: '#7b93f0', ok: '#51cf66', warn: '#ff922b', err: '#ff6b6b' },
} as const;

const palette = (mode: keyof typeof tokens) => {
  const t = tokens[mode];
  return {
    primary: { main: t.ink, contrastText: t.canvas },
    secondary: { main: t.sel },
    // dark mode's bright green needs dark text to pass contrast
    success: { main: t.ok, contrastText: mode === 'dark' ? '#0b1f10' : '#fff' },
    warning: { main: t.warn },
    error: { main: t.err },
    background: { default: t.canvas, paper: t.node },
    text: { primary: t.ink, secondary: t.muted },
    divider: t.line,
  };
};

export function buildTheme() {
  return createTheme({
    cssVariables: { colorSchemeSelector: 'data-theme' },
    colorSchemes: { light: { palette: palette('light') }, dark: { palette: palette('dark') } },
    shape: { borderRadius: 7 },
    typography: {
      fontFamily: 'var(--sans)',
      button: { textTransform: 'none', fontWeight: 500, letterSpacing: 0 },
    },
    components: {
      MuiButtonBase: { defaultProps: { disableRipple: true } },
      MuiButton: {
        defaultProps: { disableElevation: true, variant: 'outlined', color: 'inherit' },
        styleOverrides: {
          root: { gap: 2, whiteSpace: 'nowrap', minWidth: 0, transition: 'background .15s, border-color .15s, transform .08s', '&:active': { transform: 'translateY(1px)' } },
          sizeSmall: { height: 28, padding: '0 10px', fontSize: 12.5, borderRadius: 6 },
          sizeMedium: { height: 34, padding: '0 13px', fontSize: 13.5 },
          sizeLarge: { height: 42, padding: '0 18px', fontSize: 14.5 },
          outlined: {
            borderColor: 'var(--line-2)',
            background: 'var(--node)',
            color: 'var(--ink)',
            '&:hover': { background: 'var(--node-2)', borderColor: 'var(--faint)' },
          },
          startIcon: { marginRight: 2, marginLeft: -2 },
          endIcon: { marginLeft: 2 },
        },
        variants: [{ props: { variant: 'contained', color: 'primary' }, style: { '&:hover': { background: 'var(--ink-2)' } } }],
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            width: 30,
            height: 30,
            borderRadius: 7,
            border: '1px solid var(--line-2)',
            background: 'var(--node)',
            color: 'var(--ink-2)',
            '&:hover': { background: 'var(--node)', borderColor: 'var(--faint)', color: 'var(--ink)' },
          },
        },
      },
      MuiToggleButtonGroup: {
        defaultProps: { size: 'small', exclusive: true },
        styleOverrides: {
          root: { padding: 2, gap: 2, borderRadius: 7, background: 'var(--node-2)', border: '1px solid var(--line)', flexWrap: 'wrap' },
          grouped: { border: 0, borderRadius: '5px !important', margin: 0 },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            height: 26,
            padding: '0 10px',
            fontSize: 12.5,
            textTransform: 'none',
            color: 'var(--muted)',
            '&.Mui-selected, &.Mui-selected:hover': { background: 'var(--node)', color: 'var(--ink)', boxShadow: '0 1px 2px rgba(0,0,0,.12)' },
          },
        },
      },
      MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
      MuiSelect: { defaultProps: { size: 'small' } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            background: 'var(--node)',
            fontSize: 13.5,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--line-2)' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--faint)' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--sel)', borderWidth: 1, boxShadow: '0 0 0 3px var(--sel-soft)' },
          },
        },
        variants: [{ props: { size: 'small' }, style: { '& .MuiOutlinedInput-input': { padding: '7px 10px' } } }],
      },
      MuiInputLabel: { styleOverrides: { root: { fontSize: 13.5 } } },
      MuiFormHelperText: { styleOverrides: { root: { marginLeft: 2, fontSize: 12 } } },
      MuiMenuItem: { styleOverrides: { root: { fontSize: 13.5, minHeight: 34 } } },
      MuiChip: {
        defaultProps: { size: 'small' },
        styleOverrides: {
          root: { height: 22, borderRadius: 5, background: 'var(--node-2)', border: '1px solid var(--line)', font: '500 11.5px/1 var(--mono)', color: 'var(--ink-2)' },
          label: { padding: '0 8px' },
          clickable: { '&:hover': { background: 'var(--node)', borderColor: 'var(--line-2)' } },
        },
      },
      MuiSlider: { defaultProps: { size: 'small', color: 'secondary' } },
      MuiTooltip: {
        defaultProps: { arrow: true },
        styleOverrides: { tooltip: { background: 'var(--ink)', color: 'var(--canvas)', fontSize: 12, fontWeight: 500 }, arrow: { color: 'var(--ink)' } },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 14, border: '1px solid var(--line-2)', boxShadow: 'var(--shadow-lg)' },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: 'var(--line)', fontSize: 12.5, padding: '8px 10px' },
          head: { font: '500 10.5px/1.25 var(--mono)', color: 'var(--muted)', background: 'var(--node-2)' },
        },
      },
    },
  });
}
