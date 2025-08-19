// src/components/ChartCard.tsx
import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

type Point = { date: string; weight: number };

interface Props {
  data: Point[];
  activePeriod: string; // '7d' | '30d' | '90d' | '1y' | 'all'
  onChangePeriod: (p: string) => void;
}

function formatTick(d: string, period: string) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  if (period === '1y' || period === 'all') {
    return dt.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
  }
  return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function tooltipLabel(d: string) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ChartCard({ data, activePeriod, onChangePeriod }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const prepared = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    // garante ordenação por data
    return [...arr].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data]);

  return (
    <Card>
      <CardHeader
        title="Evolução do Peso"
        action={
          <ToggleButtonGroup
            size={isMobile ? 'small' : 'medium'}
            value={activePeriod}
            exclusive
            onChange={(_, v) => v && onChangePeriod(v)}
          >
            <ToggleButton value="7d">7d</ToggleButton>
            <ToggleButton value="30d">30d</ToggleButton>
            <ToggleButton value="90d">90d</ToggleButton>
            <ToggleButton value="1y">1 ano</ToggleButton>
            <ToggleButton value="all">Tudo</ToggleButton>
          </ToggleButtonGroup>
        }
        sx={{ pb: 0.5 }}
      />
      <CardContent sx={{ height: isMobile ? 260 : 340 }}>
        {prepared.length === 0 ? (
          <Box
            sx={{
              height: '100%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'grey.50',
              borderRadius: 1,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Sem dados para o período selecionado.
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={prepared} margin={{ top: 10, right: 12, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => formatTick(v as string, activePeriod)}
                minTickGap={isMobile ? 24 : 12}
              />
              <YAxis
                dataKey="weight"
                width={45}
                tickFormatter={(v) => `${v}kg`}
                domain={['dataMin - 2', 'dataMax + 2']}
              />
              <Tooltip
                formatter={(value) => [`${value} kg`, 'Peso']}
                labelFormatter={(label) => tooltipLabel(label as string)}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke={theme.palette.primary.main}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
