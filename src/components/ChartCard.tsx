// src/components/ChartCard.tsx - SIMPLIFIED VERSION
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface Props {
  data: any[];
  activePeriod: string;
  onChangePeriod: (p: string) => void;
}

export default function ChartCard({ data, activePeriod, onChangePeriod }: Props) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Evolução do Peso</Typography>
        <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, mt: 2 }}>
          <Typography variant="body2">
            Gráfico temporariamente desabilitado
          </Typography>
          <Typography variant="caption">
            {data?.length || 0} pontos de dados
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
