import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

export default function StatsCard({ icon, label, value, highlight }: StatsCardProps) {
  const theme = useTheme();
  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'visible',
        borderRadius: 3,
        boxShadow: highlight
          ? `0 4px 20px ${theme.palette.primary.dark}33`
          : '0 2px 8px rgba(0,0,0,0.08)',
        bgcolor: highlight ? theme.palette.primary.light : theme.palette.background.paper,
      }}
    >
      {highlight && (
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            left: 16,
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      )}
      <CardContent sx={{ textAlign: 'center', pt: highlight ? 3 : 2, pb: 3 }}>
        {!highlight && (
          <Box sx={{ mb: 1, color: theme.palette.primary.main }}>{icon}</Box>
        )}
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={600} mt={0.5}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
