import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';

interface ProgressCardProps {
  initialWeight: number | null;
  currentWeight: number | null;
  weightLost: number | null;
  bmi: number | null;
}

export default function ProgressCard({
  initialWeight,
  currentWeight,
  weightLost,
  bmi,
}: ProgressCardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const init = initialWeight ?? 0;
  const curr = currentWeight ?? init;
  const progressPercent = init > 0 ? Number((((init - curr) / init) * 100).toFixed(1)) : 0;

  const size = isMobile ? 80 : 120;
  const thickness = isMobile ? 5 : 6;
  const titleVariant = isMobile ? 'subtitle1' : 'h6';
  const percentVariant = isMobile ? 'h6' : 'h5';
  const infoFontSize = isMobile ? '0.75rem' : '0.875rem';

  return (
    <Card
      sx={{
        textAlign: 'center',
        p: isMobile ? 1 : 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Typography variant={titleVariant} gutterBottom>
          Progresso
        </Typography>

        <Box sx={{ position: 'relative', display: 'inline-flex', mb: isMobile ? 1 : 2 }}>
          <CircularProgress
            variant="determinate"
            value={Math.max(0, Math.min(progressPercent, 100))}
            size={size}
            thickness={thickness}
            sx={{ color: theme.palette.success.main }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant={percentVariant} color="success.main">
              {`${progressPercent}%`}
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
          sx={{ fontSize: infoFontSize }}
        >
          {init > 0 && currentWeight != null
            ? `Você perdeu ${weightLost?.toFixed(1) ?? '0.0'} kg`
            : 'Sem dados suficientes'}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: infoFontSize }}
        >
          IMC: {bmi != null ? bmi.toFixed(1) : '-'}
        </Typography>
      </CardContent>
    </Card>
  );
}
