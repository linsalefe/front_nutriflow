import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

export default function StatsCard({
  icon,
  label,
  value,
  highlight = false,
}: StatsCardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // tamanhos e espaçamentos responsivos
  const wrapperSize = isMobile ? 32 : 40;
  const wrapperTop = isMobile ? -16 : -20;
  const wrapperLeft = isMobile ? 12 : 16;
  const iconFontSize = isMobile ? '1.5rem' : '2rem';
  const labelVariant = isMobile ? 'caption' : 'subtitle2';
  const valueVariant = isMobile ? 'h6' : 'h6';
  const padding = isMobile ? 1 : 2;
  const paddingTop = highlight
    ? isMobile
      ? 2
      : 3
    : isMobile
    ? 1
    : 2;
  const paddingBottom = isMobile ? 2 : 3;
  const boxShadow = highlight
    ? `0 4px 20px ${theme.palette.primary.dark}33`
    : '0 2px 8px rgba(0,0,0,0.08)';
  const background = highlight
    ? theme.palette.primary.light
    : theme.palette.background.paper;

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'visible',
        borderRadius: 3,
        boxShadow,
        bgcolor: background,
        p: padding,
      }}
    >
      {highlight && (
        <Box
          sx={{
            position: 'absolute',
            top: wrapperTop,
            left: wrapperLeft,
            width: wrapperSize,
            height: wrapperSize,
            borderRadius: '50%',
            bgcolor: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: iconFontSize,
            color: theme.palette.primary.contrastText,
          }}
        >
          {icon}
        </Box>
      )}

      <CardContent sx={{ textAlign: 'center', pt: paddingTop, pb: paddingBottom }}>
        {!highlight && (
          <Box sx={{ mb: 1, color: theme.palette.primary.main, fontSize: iconFontSize }}>
            {icon}
          </Box>
        )}

        <Typography variant={labelVariant} color="text.secondary">
          {label}
        </Typography>
        <Typography variant={valueVariant} fontWeight={600} mt={0.5}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
