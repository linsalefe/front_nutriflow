// src/components/ChartCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  ToggleButtonGroup,
  ToggleButton,
  Box,
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
  Tooltip,
  CartesianGrid,
} from 'recharts';

type Point = { date: string; weight: number };

interface Props {
  data: Point[];
  activePeriod: string; // ex.: '7d' | '30d' | '90d' | '1y'
  onChangePeriod: (p: string) => void;
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
}

export default function ChartCard({ data, activePeriod, onChangePeriod }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // ⚠️ IMPORTANTE: nenhum useEffect/useMemo dispara setState aqui.
  // Apenas renderização pura. Mudança de período só por interação do usuário.

  return (
    <Card sx={{ height: isMobile ? 360 : 420, display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title="Evolução do Peso"
        action={
          <ToggleButtonGroup
            size="small"
            color="primary"
            value={activePeriod}
            exclusive
            onChange={(_, v) => v && onChangePeriod(v)}
          >
            <ToggleButton value="7d">7d</ToggleButton>
            <ToggleButton value="30d">30d</ToggleButton>
            <ToggleButton value="90d">90d</ToggleButton>
            <ToggleButton value="1y">1y</ToggleButton>
          </ToggleButtonGroup>
        }
      />

      <CardContent sx={{ flex: 1, minHeight: 240 }}>
        {Array.isArray(data) && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateLabel}
                interval="preserveStartEnd"
                minTickGap={16}
              />
              <YAxis
                dataKey="weight"
                width={isMobile ? 28 : 36}
                tickMargin={8}
                domain={['auto', 'auto']}
              />
              <Tooltip
                labelFormatter={(v) => {
                  const d = new Date(v);
                  return isNaN(d.getTime()) ? '' : d.toLocaleString('pt-BR');
                }}
                formatter={(value) => [`${value} kg`, 'Peso']}
              />
              <Line type="monotone" dataKey="weight" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ height: 240, display: 'grid', placeItems: 'center' }}>
            <Typography color="text.secondary">Sem dados para o período.</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
