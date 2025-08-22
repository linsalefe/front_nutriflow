// src/pages/CommandCenterPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Avatar,
  useTheme,
  useMediaQuery,
  Fade,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import CalculateIcon from '@mui/icons-material/Calculate';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import FlagIcon from '@mui/icons-material/Flag';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useNavigate } from 'react-router-dom';

const LEFT_SIDEBAR_WIDTH = 240;

// ======= 🎨 FUNÇÃO: Tema baseado na hora =======
const getThemeByTime = () => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) {
    return {
      primary: '#4fc3f7',
      secondary: '#81c784',
      background: 'linear-gradient(135deg, #e1f5fe 0%, #f3e5f5 100%)',
      name: 'morning'
    };
  } else if (hour >= 12 && hour < 18) {
    return {
      primary: '#66bb6a',
      secondary: '#4caf50',
      background: 'linear-gradient(135deg, #f5f7f5 0%, #ffffff 100%)',
      name: 'afternoon'
    };
  } else {
    return {
      primary: '#ff8a65',
      secondary: '#ffb74d',
      background: 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)',
      name: 'evening'
    };
  }
};

const LINA_AVATAR = '/lina-avatar.png';

// ======= 📊 DADOS DAS CALCULADORAS =======
const calculators = [
  {
    id: 'imc',
    title: 'Calculadora de IMC',
    description: 'Índice de Massa Corporal',
    icon: <CalculateIcon />,
    fields: ['peso', 'altura']
  },
  {
    id: 'tmb',
    title: 'Taxa Metabólica Basal',
    description: 'Calorias que seu corpo gasta em repouso',
    icon: <FitnessCenterIcon />,
    fields: ['peso', 'altura', 'idade', 'sexo', 'atividade']
  },
  {
    id: 'hidratacao',
    title: 'Hidratação Ideal',
    description: 'Quantidade de água recomendada',
    icon: <WaterDropIcon />,
    fields: ['peso', 'atividade']
  }
];

// ======= 📚 GUIAS EDUCATIVOS =======
const educationalGuides = [
  {
    title: 'Entendendo Macronutrientes',
    items: [
      '🥩 **Proteínas**: 4 kcal/g - Construção e reparo muscular',
      '🍞 **Carboidratos**: 4 kcal/g - Energia principal do corpo',
      '🥑 **Gorduras**: 9 kcal/g - Hormônios e absorção de vitaminas',
      '💡 **Distribuição ideal**: 25-30% proteína, 40-50% carbo, 20-30% gordura'
    ]
  },
  {
    title: 'Como Ler Rótulos',
    items: [
      '📋 Sempre olhe a **porção** antes dos valores',
      '⚡ **Calorias por porção** - não por 100g',
      '🧂 **Sódio**: máximo 2.300mg por dia',
      '🍬 **Açúcares adicionados**: evite mais de 25g/dia',
      '🥬 **Fibras**: busque pelo menos 3g por porção'
    ]
  },
  {
    title: 'Porções Ideais',
    items: [
      '✋ **Proteína**: palma da mão (120-150g)',
      '👊 **Carboidratos**: punho fechado (150-200g)',
      '👍 **Gorduras**: polegar (15-20g)',
      '🖐️ **Vegetais**: duas mãos abertas (200-300g)',
      '🥤 **Água**: 35ml por kg de peso corporal'
    ]
  }
];

// ======= 💬 TEMPLATES DE PERGUNTAS =======
const questionTemplates = [
  {
    category: 'Análise Nutricional',
    templates: [
      'Quantas calorias tem [alimento] e quais são os macronutrientes?',
      'Como posso substituir [alimento] por uma opção mais saudável?',
      'Qual a diferença nutricional entre [alimento 1] e [alimento 2]?'
    ]
  },
  {
    category: 'Planejamento de Refeições',
    templates: [
      'Monte um cardápio de [objetivo] com [X] calorias para hoje',
      'Sugira 3 opções de café da manhã com [X]g de proteína',
      'Como distribuir [X] calorias em 5 refeições ao longo do dia?'
    ]
  },
  {
    category: 'Objetivos Específicos',
    templates: [
      'Estratégias para ganhar massa muscular consumindo [X] calorias',
      'Como criar um déficit calórico saudável para perder [X]kg?',
      'Plano alimentar para manter o peso atual de [X]kg'
    ]
  }
];

// ======= 🎯 DICAS POR OBJETIVO =======
const goalTips = {
  emagrecimento: [
    '🔥 Crie um déficit de 300-500 kcal/dia',
    '💧 Beba água antes das refeições',
    '🥗 Comece refeições com salada/vegetais',
    '😴 Durma 7-9h - sono afeta hormônios da fome',
    '🚶 Adicione 30min de caminhada diária'
  ],
  ganho_massa: [
    '💪 Superávit de 200-400 kcal/dia',
    '🥩 1,6-2,2g proteína por kg de peso',
    '⏰ Coma a cada 3-4 horas',
    '🏋️ Treino de força 3-4x por semana',
    '🥛 Shake pós-treino em até 2h'
  ],
  manutencao: [
    '⚖️ Mantenha peso estável por 4+ semanas',
    '📊 Monitore composição corporal',
    '🔄 Varie exercícios para não estagnar',
    '🎯 Foque em performance, não só peso',
    '📅 Reavalie metas a cada 3 meses'
  ]
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CommandCenterPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [themeColors, setThemeColors] = useState(getThemeByTime());
  const [tabValue, setTabValue] = useState(0);
  const [calcResults, setCalcResults] = useState<Record<string, any>>({});
  const [calcInputs, setCalcInputs] = useState<Record<string, any>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  useEffect(() => {
    const updateTheme = () => setThemeColors(getThemeByTime());
    updateTheme();
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copiado!' });
    setTimeout(() => setSnackbar({ open: false, message: '' }), 2000);
  };

  const goToChat = (prompt?: string) => {
    if (prompt) {
      // Aqui poderia passar o prompt como query param
      navigate(`/chat?prompt=${encodeURIComponent(prompt)}`);
    } else {
      navigate('/chat');
    }
  };

  // ======= 🧮 FUNÇÕES DE CÁLCULO =======
  const calculateIMC = (peso: number, altura: number) => {
    const imc = peso / ((altura / 100) ** 2);
    let categoria = '';
    if (imc < 18.5) categoria = 'Abaixo do peso';
    else if (imc < 25) categoria = 'Peso normal';
    else if (imc < 30) categoria = 'Sobrepeso';
    else categoria = 'Obesidade';
    
    return { imc: imc.toFixed(1), categoria };
  };

  const calculateTMB = (peso: number, altura: number, idade: number, sexo: string, atividade: string) => {
    let tmb = sexo === 'M' 
      ? 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * idade)
      : 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * idade);
    
    const fatores: Record<string, number> = {
      sedentario: 1.2,
      leve: 1.375,
      moderado: 1.55,
      intenso: 1.725,
      muito_intenso: 1.9
    };
    
    const tdee = tmb * (fatores[atividade] || 1.2);
    return { tmb: Math.round(tmb), tdee: Math.round(tdee) };
  };

  const calculateHidratacao = (peso: number, atividade: string) => {
    let base = peso * 35; // ml por kg
    if (atividade === 'intenso' || atividade === 'muito_intenso') {
      base += 500; // extra para exercícios
    }
    return { litros: (base / 1000).toFixed(1), ml: Math.round(base) };
  };

  const handleCalculate = (calcId: string) => {
    const inputs = calcInputs[calcId] || {};
    let result = null;

    switch (calcId) {
      case 'imc':
        if (inputs.peso && inputs.altura) {
          result = calculateIMC(Number(inputs.peso), Number(inputs.altura));
        }
        break;
      case 'tmb':
        if (inputs.peso && inputs.altura && inputs.idade && inputs.sexo && inputs.atividade) {
          result = calculateTMB(
            Number(inputs.peso), 
            Number(inputs.altura), 
            Number(inputs.idade), 
            inputs.sexo, 
            inputs.atividade
          );
        }
        break;
      case 'hidratacao':
        if (inputs.peso && inputs.atividade) {
          result = calculateHidratacao(Number(inputs.peso), inputs.atividade);
        }
        break;
    }

    if (result) {
      setCalcResults({ ...calcResults, [calcId]: result });
    }
  };

  const updateInput = (calcId: string, field: string, value: any) => {
    setCalcInputs({
      ...calcInputs,
      [calcId]: { ...calcInputs[calcId], [field]: value }
    });
  };

  const renderCalculator = (calc: any) => (
    <Card
      key={calc.id}
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
        border: '1px solid rgba(0,0,0,0.06)',
        '&:hover': {
          boxShadow: `0 8px 32px ${themeColors.primary}15`,
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.3s ease'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${themeColors.primary}20, ${themeColors.secondary}20)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: themeColors.primary
            }}
          >
            {calc.icon}
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600} color={themeColors.primary}>
              {calc.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {calc.description}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
          {calc.fields.includes('peso') && (
            <TextField
              label="Peso (kg)"
              type="number"
              size="small"
              value={calcInputs[calc.id]?.peso || ''}
              onChange={(e) => updateInput(calc.id, 'peso', e.target.value)}
            />
          )}
          {calc.fields.includes('altura') && (
            <TextField
              label="Altura (cm)"
              type="number"
              size="small"
              value={calcInputs[calc.id]?.altura || ''}
              onChange={(e) => updateInput(calc.id, 'altura', e.target.value)}
            />
          )}
          {calc.fields.includes('idade') && (
            <TextField
              label="Idade"
              type="number"
              size="small"
              value={calcInputs[calc.id]?.idade || ''}
              onChange={(e) => updateInput(calc.id, 'idade', e.target.value)}
            />
          )}
          {calc.fields.includes('sexo') && (
            <FormControl size="small">
              <InputLabel>Sexo</InputLabel>
              <Select
                value={calcInputs[calc.id]?.sexo || ''}
                onChange={(e) => updateInput(calc.id, 'sexo', e.target.value)}
                label="Sexo"
              >
                <MenuItem value="M">Masculino</MenuItem>
                <MenuItem value="F">Feminino</MenuItem>
              </Select>
            </FormControl>
          )}
          {calc.fields.includes('atividade') && (
            <FormControl size="small">
              <InputLabel>Nível de Atividade</InputLabel>
              <Select
                value={calcInputs[calc.id]?.atividade || ''}
                onChange={(e) => updateInput(calc.id, 'atividade', e.target.value)}
                label="Nível de Atividade"
              >
                <MenuItem value="sedentario">Sedentário</MenuItem>
                <MenuItem value="leve">Leve (1-3x/semana)</MenuItem>
                <MenuItem value="moderado">Moderado (3-5x/semana)</MenuItem>
                <MenuItem value="intenso">Intenso (6-7x/semana)</MenuItem>
                <MenuItem value="muito_intenso">Muito Intenso (2x/dia)</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={() => handleCalculate(calc.id)}
          sx={{
            background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
            mb: 2
          }}
        >
          Calcular
        </Button>

        {calcResults[calc.id] && (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            {calc.id === 'imc' && (
              <div>
                <strong>IMC: {calcResults[calc.id].imc}</strong><br />
                Categoria: {calcResults[calc.id].categoria}
              </div>
            )}
            {calc.id === 'tmb' && (
              <div>
                <strong>TMB: {calcResults[calc.id].tmb} kcal/dia</strong><br />
                TDEE: {calcResults[calc.id].tdee} kcal/dia
              </div>
            )}
            {calc.id === 'hidratacao' && (
              <div>
                <strong>Hidratação: {calcResults[calc.id].litros}L/dia</strong><br />
                ({calcResults[calc.id].ml}ml/dia)
              </div>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      height: { xs: '100vh', md: 'calc(100vh - 64px)' }, 
      width: '100%', 
      position: 'relative', 
      background: themeColors.background,
      marginLeft: { xs: 0, md: `${LEFT_SIDEBAR_WIDTH}px` } 
    }}>
      <Box sx={{ 
        flex: '1 1 auto', 
        minWidth: 0, 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: 'rgba(255,255,255,0.86)', 
        backdropFilter: 'blur(8px)', 
        boxShadow: { xs: 'none', md: '0 0 32px rgba(0,0,0,0.06)' } 
      }}>
        
        {/* Conteúdo scrollável */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: { xs: 1.5, sm: 3, md: 4 },
            py: { xs: 2, sm: 3, md: 4 },
            maxWidth: '1200px',
            mx: 'auto',
            width: '100%'
          }}
        >
          {/* Cabeçalho */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
              <Avatar
                src={LINA_AVATAR}
                alt="Lina"
                sx={{
                  width: { xs: 50, sm: 60 },
                  height: { xs: 50, sm: 60 },
                  mx: 'auto',
                  mb: 2,
                  boxShadow: `0 8px 32px ${themeColors.primary}40`,
                  border: '3px solid #fff',
                  bgcolor: themeColors.primary
                }}
              />
              
              <Typography
                variant={isMobile ? 'h5' : 'h4'}
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.02em'
                }}
              >
                Central de Comandos
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Ferramentas, guias e recursos para potencializar sua jornada nutricional
              </Typography>
            </Box>
          </motion.div>

          {/* Tabs */}
          <Paper elevation={0} sx={{ borderRadius: 3, mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              variant={isMobile ? 'scrollable' : 'standard'}
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }
                },
                '& .Mui-selected': {
                  color: `${themeColors.primary} !important`
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: themeColors.primary
                }
              }}
            >
              <Tab icon={<CalculateIcon />} label="Calculadoras" />
              <Tab icon={<SchoolIcon />} label="Guias" />
              <Tab icon={<QuizIcon />} label="Templates" />
              <Tab icon={<FlagIcon />} label="Objetivos" />
            </Tabs>
          </Paper>

          {/* Tab 1: Calculadoras */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {calculators.map((calc) => (
                <Grid item xs={12} md={6} lg={4} key={calc.id}>
                  {renderCalculator(calc)}
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Tab 2: Guias Educativos */}
          <TabPanel value={tabValue} index={1}>
            {educationalGuides.map((guide, index) => (
              <Accordion
                key={index}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  '&:before': { display: 'none' },
                  boxShadow: `0 4px 16px ${themeColors.primary}10`
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" fontWeight={600} color={themeColors.primary}>
                    {guide.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'grid', gap: 1.5 }}>
                    {guide.items.map((item, idx) => (
                      <Typography key={idx} variant="body1" sx={{ lineHeight: 1.6 }}>
                        {item.split('**').map((part, i) => 
                          i % 2 === 1 ? (
                            <strong key={i} style={{ color: themeColors.primary }}>{part}</strong>
                          ) : (
                            part
                          )
                        )}
                      </Typography>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </TabPanel>

          {/* Tab 3: Templates de Perguntas */}
          <TabPanel value={tabValue} index={2}>
            {questionTemplates.map((category, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 3,
                  border: `1px solid ${themeColors.primary}20`
                }}
              >
                <Typography variant="h6" fontWeight={600} color={themeColors.primary} mb={2}>
                  {category.category}
                </Typography>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  {category.templates.map((template, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: `${themeColors.secondary}08`,
                        border: `1px solid ${themeColors.secondary}20`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2
                      }}
                    >
                      <Typography variant="body2" sx={{ flex: 1, lineHeight: 1.5 }}>
                        {template}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          onClick={() => copyToClipboard(template)}
                          sx={{ color: themeColors.secondary }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </Button>
                        <Button
                          size="small"
                          onClick={() => goToChat(template)}
                          variant="outlined"
                          sx={{
                            borderColor: themeColors.primary,
                            color: themeColors.primary,
                            textTransform: 'none'
                          }}
                        >
                          Usar
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            ))}
          </TabPanel>

          {/* Tab 4: Dicas por Objetivo */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              {Object.entries(goalTips).map(([goal, tips]) => (
                <Grid item xs={12} md={4} key={goal}>
                  <Card
                    sx={{
                      height: '100%',
                      background: `linear-gradient(135deg, ${themeColors.primary}08, ${themeColors.secondary}08)`,
                      border: `1px solid ${themeColors.primary}20`
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        color={themeColors.primary}
                        mb={2}
                        textAlign="center"
                      >
                        {goal === 'emagrecimento' && '🔥 Emagrecimento'}
                        {goal === 'ganho_massa' && '💪 Ganho de Massa'}
                        {goal === 'manutencao' && '⚖️ Manutenção'}
                      </Typography>
                      <Box sx={{ display: 'grid', gap: 1.5 }}>
                        {tips.map((tip, idx) => (
                          <Typography key={idx} variant="body2" sx={{ lineHeight: 1.5 }}>
                            {tip}
                          </Typography>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        </Box>

        {/* Snackbar para feedback */}
        {snackbar.open && (
          <Alert
            severity="success"
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1000,
              borderRadius: 2
            }}
          >
            {snackbar.message}
          </Alert>
        )}
      </Box>
    </Box>
  );
}