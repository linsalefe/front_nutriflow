import React from 'react';
import { Card, CardContent, Typography, Box, useTheme, ButtonGroup, Button } from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface LogItem {
  date: string;
  weight: number;
}

interface ChartCardProps {
  data: LogItem[];
  activePeriod: string;
  onChangePeriod: (p: string) => void;
}

const periods = [
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: '1y', label: '1 ano' },
];

export default function ChartCard({ data, activePeriod, onChangePeriod }: ChartCardProps) {
  const theme = useTheme();

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Evolução de Peso
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <ButtonGroup size="small" variant="outlined">
            {periods.map((p) => (
              <Button
                key={p.key}
                onClick={() => onChangePeriod(p.key)}
                variant={activePeriod === p.key ? 'contained' : 'outlined'}
              >
                {p.label}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
        <Box sx={{ height: 260 }}>
          {data.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['dataMin', 'dataMax']} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
              }}
            >
              Poucos dados para exibir o gráfico.
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
