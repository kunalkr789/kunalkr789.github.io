import { useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import LinearProgress from '@mui/material/LinearProgress';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { setToken, useAppDispatch, useAppSelector, type Tokens } from '../../app/store';

/** The tokens → MUI theme mapping, the same pattern as a component library's theme package. */
function productTheme(t: Tokens) {
  const accent = `hsl(${t.hue}, 70%, 42%)`;
  return createTheme({
    palette: { mode: 'light', primary: { main: accent }, info: { main: accent } },
    shape: { borderRadius: t.radius },
    spacing: t.density === 'compact' ? 6 : 8,
    typography: { fontFamily: 'var(--sans)', button: { textTransform: 'none', fontWeight: 600 } },
    components: { MuiButton: { defaultProps: { disableElevation: true } } },
  });
}

export default function TokensDemo() {
  const dispatch = useAppDispatch();
  const t = useAppSelector((s) => s.tokens);
  const [checked, setChecked] = useState(true);
  const theme = useMemo(() => productTheme(t), [t]);

  const sliders: { key: 'hue' | 'radius' | 'elevation'; label: string; min: number; max: number; step?: number; unit: string }[] = [
    { key: 'hue', label: 'palette.primary', min: 0, max: 360, step: 5, unit: '°' },
    { key: 'radius', label: 'shape.borderRadius', min: 0, max: 22, unit: 'px' },
    { key: 'elevation', label: 'Card elevation', min: 0, max: 4, unit: '' },
  ];

  return (
    <div className="tokens">
      <div className="token-controls">
        {sliders.map((s) => (
          <label key={s.key}>
            <span className="mono">{s.label}</span>
            <Slider value={t[s.key]} min={s.min} max={s.max} step={s.step ?? 1} onChange={(_, v) => dispatch(setToken({ [s.key]: v as number }))} aria-label={s.label} />
            <output className="mono">
              {t[s.key]}
              {s.unit}
            </output>
          </label>
        ))}
        <div className="token-density">
          <span className="mono">spacing</span>
          <ToggleButtonGroup value={t.density} onChange={(_, d: Tokens['density'] | null) => d && dispatch(setToken({ density: d }))} aria-label="Density">
            <ToggleButton value="compact">compact · 6</ToggleButton>
            <ToggleButton value="comfortable">comfortable · 8</ToggleButton>
          </ToggleButtonGroup>
        </div>
      </div>

      <div className="ds">
        <ThemeProvider theme={theme}>
          <Stack spacing={1.5}>
            <Card elevation={t.elevation} variant={t.elevation === 0 ? 'outlined' : 'elevation'}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                    <div>
                      <Typography sx={{ fontWeight: 600 }}>Infection Control · Module 4</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Due in 3 days · 25 min
                      </Typography>
                    </div>
                    <Chip label="Required" color="primary" variant="outlined" size="small" />
                  </Stack>
                  <LinearProgress variant="determinate" value={68} aria-label="Course progress" sx={{ height: 8, borderRadius: t.radius }} />
                  <FormControlLabel control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />} label="Send me a reminder" />
                  <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                    <Button variant="contained">Resume course</Button>
                    <Button variant="outlined">View certificate</Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
            <Alert severity="info" variant="outlined">
              3 compliance tasks are due this week.
            </Alert>
          </Stack>
        </ThemeProvider>
      </div>

      <pre className="console token-json" aria-label="Generated theme">
        {`createTheme({
  palette: { primary: { main: 'hsl(${t.hue}, 70%, 42%)' } },
  shape: { borderRadius: ${t.radius} },
  spacing: ${t.density === 'compact' ? 6 : 8},
})`}
      </pre>
    </div>
  );
}
