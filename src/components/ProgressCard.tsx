// src/components/ProgressCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  useTheme,
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
  const init = initialWeight ?? 0;
  const curr = currentWeight ?? 0;
  const progressPercent =
    init > 0 ? Number((((init - curr) / init) * 100).toFixed(1)) : 0;

  return (
    <Card
      sx={{
        textAlign: 'center',
        p: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Progresso
        </Typography>
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
          <CircularProgress
            variant="determinate"
            value={Math.max(0, Math.min(progressPercent, 100))}
            size={120}
            thickness={6}
            sx={{ color: theme.palette.success.main }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h5" color="success.main">
              {`${progressPercent}%`}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {init > 0 && currentWeight != null
            ? `Você perdeu ${weightLost?.toFixed(1) ?? '0.0'} kg`
            : 'Sem dados suficientes'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          IMC: {bmi != null ? bmi.toFixed(1) : '-'}
        </Typography>
      </CardContent>
    </Card>
  );
}
