import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

/** A wrap of small MUI chips for tech stacks and labels. */
export function Tags({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: '5px' }} className={className}>
      {items.map((t) => (
        <Chip key={t} label={t} />
      ))}
    </Stack>
  );
}
