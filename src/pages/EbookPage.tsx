// src/pages/EbookPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  useTheme,
  useMediaQuery,
  Fade,
  Paper,
  Grid,
  IconButton,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  List,
  Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import KitchenIcon from '@mui/icons-material/Kitchen';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BookmarkIcon from '@mui/icons-material/Bookmark';

/** =================== Tipos =================== */
type IntroContent = {
  title: string;
  sections: { step: string; title: string; content: string }[];
};

type CardapiosContent = {
  title: string;
  subtitle: string;
  menus: {
    [k: string]: {
      title: string;
      options: {
        name: string;
        protein: string;
        carb: string;
        veggie: string;
        extra: string;
        cost: string;
      }[];
    };
  };
};

type ComprasContent = {
  title: string;
  subtitle: string;
  categories: {
    [k: string]: {
      title: string;
      items: { name: string; qty: string; price: string }[];
    };
  };
  total: string;
};

type ReceitasContent = {
  title: string;
  recipes: {
    id: string;
    title: string;
    image: string;
    ingredients: { protein: string; carb: string; veggie: string; extra: string };
    steps: { protein: string[]; carb: string[]; veggie: string[]; extra: string[] };
  }[];
};

type PreparoContent = {
  title: string;
  subtitle: string;
  techniques: {
    [k: string]: {
      title: string;
      preparation?: string[];
      cooling?: string[];
      storage?: string[];
      freezing?: string[];
      tips?: string[];
    };
  };
};

type ArmazenamentoContent = {
  title: string;
  subtitle: string;
  sections: {
    [k: string]: {
      title: string;
      steps: { title: string; content: string }[];
    };
  };
  final_note: string;
};

type DicasContent = {
  title: string;
  subtitle: string;
  warning_foods: { category: string; description: string }[];
  final_warning: string;
};

type ValoresContent = {
  title: string;
  note?: string;
  items: { label: string; kcal: number; protein: number; carb: number; fat: number }[];
};

type ContentMap = {
  intro: IntroContent;
  cardapios: CardapiosContent;
  compras: ComprasContent;
  receitas: ReceitasContent;
  preparo: PreparoContent;
  armazenamento: ArmazenamentoContent;
  dicas: DicasContent;
  valores: ValoresContent;
};

type ChapterId = keyof ContentMap;
type ChapterMeta = { id: ChapterId; title: string; icon: string };

/** =========== 🎨 Tema baseado na hora =========== */
const getThemeByTime = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    return {
      primary: '#2e7d32',
      secondary: '#66bb6a',
      background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
      name: 'morning',
      icon: '🌱',
    };
  } else if (hour >= 12 && hour < 18) {
    return {
      primary: '#1565c0',
      secondary: '#42a5f5',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #f5f5f5 100%)',
      name: 'afternoon',
      icon: '📚',
    };
  }
  return {
    primary: '#7b1fa2',
    secondary: '#ba68c8',
    background: 'linear-gradient(135deg, #f3e5f5 0%, #fce4ec 100%)',
    name: 'evening',
    icon: '🍽️',
  };
};

/** =================== Dados =================== */
const EBOOK_DATA: {
  title: string;
  subtitle: string;
  author: string;
  chapters: ChapterMeta[];
  content: ContentMap;
} = {
  title: 'Guia Prático de Marmitas Saudáveis',
  subtitle: 'Planejamento nutricional para uma semana inteira',
  author: 'NutriFlow',
  chapters: [
    { id: 'intro', title: 'Como utilizar este guia', icon: '📋' },
    { id: 'cardapios', title: 'Cardápios Balanceados', icon: '🍽️' },
    { id: 'compras', title: 'Lista de Compras Inteligente', icon: '🛒' },
    { id: 'valores', title: 'Informações Nutricionais', icon: '📊' },
    { id: 'receitas', title: 'Receitas Práticas', icon: '👨‍🍳' },
    { id: 'preparo', title: 'Técnicas de Preparo', icon: '🔥' },
    { id: 'armazenamento', title: 'Conservação e Armazenamento', icon: '❄️' },
    { id: 'dicas', title: 'Dicas Extras', icon: '💡' },
  ],
  content: {
    intro: {
      title: 'Como utilizar este guia da melhor forma',
      sections: [
        { step: '01', title: 'Calcule quantas refeições você precisa no mês', content: 'Defina quantas marmitas você vai preparar considerando sua rotina semanal.' },
        { step: '02', title: 'Escolha os cardápios do seu gosto', content: 'Selecione entre os cardápios balanceados que preparamos especialmente para você.' },
        { step: '03', title: 'Faça as compras seguindo nossa lista otimizada', content: 'Use nossa lista inteligente de compras para não esquecer nenhum ingrediente importante.' },
        { step: '04', title: 'Reserve um dia da semana para o preparo', content: 'Separe cerca de 3-4h em um dia da semana para preparar todas as refeições.' },
        { step: '05', title: 'Armazene corretamente seguindo nossas dicas', content: 'Siga nossas técnicas de conservação para manter a qualidade por mais tempo.' },
        { step: '06', title: 'Aproveite sua nova rotina saudável e prática', content: 'Desfrute de refeições nutritivas todos os dias sem preocupação!' },
      ],
    },
    cardapios: {
      title: 'Cardápios Balanceados',
      subtitle: 'Escolha os seus favoritos',
      menus: {
        proteinas: {
          title: 'Opções com Proteína Animal',
          options: [
            { name: 'Macarrão Integral com Molho de Tomate Natural e Peito de Frango', protein: '180g de peito de frango', carb: '160g de macarrão integral', veggie: '60g de brócolis', extra: 'Molho de tomate natural (120g)', cost: 'R$ 7,20' },
            { name: 'Filé de Frango com Purê de Batata Doce', protein: '180g de filé de frango', carb: '160g de purê de batata doce', veggie: '60g de repolho refogado', extra: 'Cebola e temperos naturais', cost: 'R$ 7,20' },
            { name: 'Carne Bovina com Arroz Integral', protein: '180g de carne bovina magra', carb: '160g de arroz integral', veggie: '60g de brócolis', extra: 'Cebola e temperos naturais', cost: 'R$ 7,20' },
          ],
        },
        frango: {
          title: 'Especiais com Frango',
          options: [
            { name: 'Frango Desfiado com Arroz Integral', protein: '180g de frango em cubos', carb: '160g de arroz integral', veggie: '60g de cenoura e repolho refogados', extra: 'Molho especial (creme de leite, cebola, alho, molho de tomate natural, ketchup e mostarda)', cost: 'R$ 7,20' },
            { name: 'Frango Grelhado com Purê de Batata Doce', protein: '180g de frango desfiado', carb: '160g de purê de batata doce', veggie: '60g de cenoura refogada', extra: 'Cebola e temperos naturais', cost: 'R$ 7,20' },
            { name: 'Frango ao Molho com Macarrão Integral', protein: '180g de frango em cubos', carb: '160g de macarrão integral', veggie: '60g de cenoura refogada', extra: 'Molho especial completo', cost: 'R$ 7,20' },
          ],
        },
        peixes: {
          title: 'Opções com Peixe',
          options: [
            { name: 'Tilápia Grelhada com Arroz Integral', protein: '180g de filé de tilápia', carb: '160g de arroz integral', veggie: '60g de brócolis', extra: 'Cebola e temperos naturais', cost: 'R$ 7,20' },
            { name: 'Macarrão Integral com Tilápia Desfiada', protein: '180g de tilápia desfiada', carb: '160g de macarrão integral', veggie: '60g de repolho e cenoura refogados', extra: 'Molho de tomate natural (60g)', cost: 'R$ 8,80' },
          ],
        },
      },
    },
    compras: {
      title: 'Lista de Compras Inteligente',
      subtitle: 'Para 18 refeições balanceadas',
      categories: {
        proteinas: {
          title: 'Proteínas (18 Refeições)',
          items: [
            { name: 'Peito de Frango', qty: '1,5 kg', price: 'R$ 45,00' },
            { name: 'Carne Bovina Magra', qty: '1,5 kg', price: 'R$ 52,00' },
            { name: 'Filé de Frango', qty: '1,5 kg', price: 'R$ 48,00' },
            { name: 'Filé de Tilápia', qty: '2,8 kg', price: 'R$ 78,00' },
          ],
        },
        carboidratos: {
          title: 'Carboidratos (18 Refeições)',
          items: [
            { name: 'Arroz Integral (cru)', qty: '1,8 kg', price: 'R$ 12,00' },
            { name: 'Macarrão Integral (cru)', qty: '1,8 kg', price: 'R$ 15,00' },
            { name: 'Batata Doce (para 1,5 kg de purê)', qty: '1,5 kg', price: 'R$ 9,00' },
          ],
        },
        vegetais: {
          title: 'Vegetais (18 Refeições)',
          items: [
            { name: 'Brócolis', qty: '0,9 kg', price: 'R$ 15,00' },
            { name: 'Cenoura', qty: '0,9 kg', price: 'R$ 5,00' },
            { name: 'Repolho', qty: '0,9 kg', price: 'R$ 4,00' },
          ],
        },
        extras: {
          title: 'Temperos e Extras (18 Refeições)',
          items: [
            { name: 'Molho de Tomate Natural', qty: '1,4 kg', price: 'R$ 14,00' },
            { name: 'Creme de Leite', qty: '0,5 L', price: 'R$ 8,00' },
            { name: 'Cebola', qty: '1,4 kg', price: 'R$ 7,00' },
            { name: 'Alho', qty: '0,4 kg', price: 'R$ 8,00' },
            { name: 'Temperos Diversos', qty: 'A gosto', price: 'R$ 12,00' },
            { name: 'Ketchup', qty: '5-6 colheres', price: 'R$ 12,00' },
            { name: 'Mostarda', qty: '5-6 colheres', price: 'R$ 12,00' },
          ],
        },
      },
      total: 'R$ 356,00',
    },
    receitas: {
      title: 'Receitas Práticas Passo a Passo',
      recipes: [
        {
          id: 'macarrao_frango',
          title: 'Macarrão Integral com Molho Natural e Frango',
          image: '🍝',
          ingredients: { protein: 'Peito de Frango', carb: 'Macarrão Integral', veggie: 'Brócolis', extra: 'Molho de Tomate Natural' },
          steps: {
            protein: [
              'Em uma panela, aqueça um pouco de azeite e refogue cebola e alho picados até dourar.',
              'Adicione o peito de frango, tempere com sal e pimenta e cozinhe até ficar completamente dourado e cozido.',
              'Cozinhe em fogo médio, mexendo ocasionalmente, até que a carne esteja completamente dourada.',
            ],
            carb: ['Ferva água em uma panela grande e adicione sal a gosto.', 'Cozinhe o macarrão integral até ficar al dente.', 'Escorra e reserve.'],
            veggie: ['Separe o brócolis em floretes pequenos.', 'Cozinhe por 3–5 min até macio.', 'Escorra e reserve.'],
            extra: ['Refogue cebola e alho, junte o molho de tomate natural e tempere. Misture com macarrão e frango.'],
          },
        },
        {
          id: 'frango_pure',
          title: 'Frango Grelhado com Purê de Batata Doce',
          image: '🍗',
          ingredients: { protein: 'Filé de Frango', carb: 'Purê de Batata Doce', veggie: 'Repolho Refogado', extra: 'Cebola e Temperos' },
          steps: {
            protein: ['Tempere o frango com sal, pimenta e limão.', 'Grelhe 4–5 min por lado até dourar.'],
            carb: ['Cozinhe batata-doce até macia.', 'Amasse com um pouco de leite, ajuste sal/pimenta.'],
            veggie: ['Fatie o repolho.', 'Refogue com cebola e alho até murchar.'],
            extra: ['Refogue cebola e alho e distribua para incrementar o sabor.'],
          },
        },
      ],
    },
    preparo: {
      title: 'Técnicas Especiais de Preparo',
      subtitle: 'Para manter qualidade e sabor',
      techniques: {
        arroz_macarrao: {
          title: 'Arroz Integral e Macarrão',
          preparation: ['Cozinhe normalmente; evite muito “al dente” para não endurecer após congelar.'],
          cooling: ['Deixe esfriar um pouco após o cozimento.'],
          storage: ['Divida em porções individuais em recipientes herméticos.'],
          freezing: ['Congele rapidamente.'],
        },
        pure_batata: {
          title: 'Purê de Batata Doce',
          preparation: ['Faça o purê normalmente.', 'Evite muito líquido para manter textura após descongelar.'],
          cooling: ['Esfrie em temperatura ambiente.'],
          storage: ['Porcione em potes ou sacos próprios.'],
          freezing: ['Congele rapidamente.'],
        },
        vegetais: {
          title: 'Brócolis, Cenoura e Repolho',
          preparation: ['Brócolis: vapor até al dente.', 'Cenoura: cozinhe até levemente macia.', 'Repolho: refogue até murchar.'],
          storage: ['Embale em sacos para congelamento ou potes.'],
          freezing: ['Congele rapidamente.'],
          tips: [
            'Congele em porções.',
            'Identifique com data.',
            'Descongele na geladeira ou micro-ondas.',
            'Ajuda a preservar sabor e textura.',
          ],
        },
      },
    },
    armazenamento: {
      title: 'Conservação e Armazenamento',
      subtitle: 'Mantenha a qualidade e segurança dos alimentos',
      sections: {
        refrigeracao: {
          title: 'Refrigeração',
          steps: [
            { title: 'Resfriamento Inicial', content: 'Deixe esfriar ~30 min (nunca >2h fora da geladeira).' },
            { title: 'Armazenamento', content: 'Use recipientes herméticos (vidro ou plástico próprio).' },
            { title: 'Temperatura', content: 'Geladeira < 4°C. Dura 3–4 dias.' },
            { title: 'Etiquetas', content: 'Identifique com data para controle.' },
          ],
        },
        congelamento: {
          title: 'Congelamento',
          steps: [
            { title: 'Resfriamento', content: 'Deixe esfriar até 1h.' },
            { title: 'Porções', content: 'Porcione em embalagens próprias retirando o ar.' },
            { title: 'Rápido', content: 'Congele na parte mais fria (-18°C).' },
            { title: 'Etiquetas', content: 'Validade sugerida: até 3 meses.' },
          ],
        },
        descongelamento: {
          title: 'Descongelamento e Aquecimento',
          steps: [
            { title: 'Geladeira', content: 'Descongele de um dia para o outro. Evite temperatura ambiente.' },
            { title: 'Aquecimento', content: 'Aqueça até ≥ 74°C (bem quente) no micro-ondas ou fogão.' },
          ],
        },
      },
      final_note: 'Esses cuidados garantem qualidade e segurança das refeições.',
    },
    dicas: {
      title: 'Alimentos que Não Devem Ser Congelados',
      subtitle: 'Evite estes ingredientes no preparo de marmitas',
      warning_foods: [
        { category: 'Ovos Inteiros Cozidos', description: 'Podem rachar e a clara fica gelatinosa após descongelar.' },
        { category: 'Preparos com Maionese', description: 'Separa e talha ao descongelar.' },
        { category: 'Alimento descongelado e recongelado', description: 'Risco elevado de contaminação; só recongele após cozinhar.' },
        { category: 'Queijos muito macios', description: 'Perdem textura e ficam granulados.' },
        { category: 'Fritos', description: 'Perdem crocância e ficam encharcados.' },
        { category: 'Frutas/verduras muito aquosas', description: 'Perdem totalmente a textura (ex.: pepino, alface, melancia).' },
        { category: 'Molhos à base de ovo', description: 'Ex.: holandês/béchamel — tendem a talhar.' },
      ],
      final_warning:
        'Evite congelar os itens acima ou siga técnicas específicas para reduzir perdas de textura e segurança.',
    },
    valores: {
      title: 'Informações Nutricionais (estimativas por porção)',
      note: 'Valores médios de referência para montagem das marmitas.',
      items: [
        { label: 'Peito de frango (120 g cozido)', kcal: 198, protein: 36, carb: 0, fat: 4 },
        { label: 'Patinho moído (120 g cozido)', kcal: 240, protein: 27, carb: 0, fat: 14 },
        { label: 'Tilápia (140 g grelhada)', kcal: 210, protein: 36, carb: 0, fat: 6 },
        { label: 'Arroz integral (120 g cozido)', kcal: 150, protein: 3, carb: 32, fat: 1 },
        { label: 'Purê batata-doce (180 g)', kcal: 162, protein: 2, carb: 38, fat: 0 },
        { label: 'Brócolis (80 g cozido)', kcal: 28, protein: 2, carb: 5, fat: 0 },
      ],
    },
  },
};

const LINA_AVATAR = '/lina-avatar.png';

/** =================== Componente =================== */
export default function EbookPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [themeColors, setThemeColors] = useState(getThemeByTime());
  const [currentChapter, setCurrentChapter] = useState<ChapterId>('intro');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<ChapterId[]>([]);
  const [showTableOfContents, setShowTableOfContents] = useState(true);

  useEffect(() => {
    const updateTheme = () => setThemeColors(getThemeByTime());
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleChapterChange = (chapterId: ChapterId) => {
    setCurrentChapter(chapterId);
    setShowTableOfContents(false);
  };

  const toggleFavorite = (chapterId: ChapterId) => {
    setFavorites((prev) => (prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]));
  };

  const getCurrentChapterIndex = () => EBOOK_DATA.chapters.findIndex((ch) => ch.id === currentChapter);
  const goToPreviousChapter = () => {
    const idx = getCurrentChapterIndex();
    if (idx > 0) setCurrentChapter(EBOOK_DATA.chapters[idx - 1].id);
  };
  const goToNextChapter = () => {
    const idx = getCurrentChapterIndex();
    if (idx < EBOOK_DATA.chapters.length - 1) setCurrentChapter(EBOOK_DATA.chapters[idx + 1].id);
  };

  const filteredChapters = EBOOK_DATA.chapters.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  /** -------- Render por capítulo (narrowing total) -------- */
  const renderChapterContent = () => {
    switch (currentChapter) {
      case 'intro': {
        const content = EBOOK_DATA.content.intro;
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: themeColors.primary, mb: 4 }}>
              {content.title}
            </Typography>
            <Grid container spacing={3}>
              {content.sections.map((section, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                    <Card
                      elevation={3}
                      sx={{
                        height: '100%',
                        background: `linear-gradient(135deg, ${themeColors.primary}10, ${themeColors.secondary}05)`,
                        border: `2px solid ${themeColors.primary}20`,
                        borderRadius: 3,
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h2" sx={{ fontWeight: 900, color: themeColors.primary, mr: 2, opacity: 0.8 }}>
                            {section.step}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                            {section.title}
                          </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {section.content}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      }
      case 'cardapios': {
        const content = EBOOK_DATA.content.cardapios;
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: themeColors.primary, mb: 2 }}>
              {content.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
              {content.subtitle}
            </Typography>
            {Object.entries(content.menus).map(([key, menu], menuIndex) => (
              <Box key={key} sx={{ mb: 5 }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, mb: 3, color: themeColors.primary, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <RestaurantIcon /> {menu.title}
                </Typography>
                <Grid container spacing={3}>
                  {menu.options.map((option, index) => (
                    <Grid item xs={12} lg={6} key={index}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: menuIndex * 0.3 + index * 0.1 }}
                      >
                        <Card
                          elevation={4}
                          sx={{
                            height: '100%',
                            background: `linear-gradient(135deg, ${themeColors.primary}08, ${themeColors.secondary}05)`,
                            border: `1px solid ${themeColors.primary}20`,
                            borderRadius: 3,
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: `0 8px 25px ${themeColors.primary}20`,
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: themeColors.primary }}>
                              {option.name}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Proteína:</strong> {option.protein}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Carboidrato:</strong> {option.carb}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Vegetais:</strong> {option.veggie}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Extras:</strong> {option.extra}
                              </Typography>
                            </Box>
                            <Chip
                              label={`Custo estimado: ${option.cost}`}
                              size="small"
                              sx={{ bgcolor: `${themeColors.primary}15`, color: themeColors.primary, fontWeight: 600 }}
                            />
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Box>
        );
      }
      case 'compras': {
        const content = EBOOK_DATA.content.compras;
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: themeColors.primary, mb: 2 }}>
              {content.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
              {content.subtitle}
            </Typography>
            <Grid container spacing={4}>
              {Object.entries(content.categories).map(([key, category], index) => (
                <Grid item xs={12} md={6} key={key}>
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.2 }}>
                    <Paper
                      elevation={4}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${themeColors.primary}08, ${themeColors.secondary}05)`,
                        border: `1px solid ${themeColors.primary}20`,
                        height: '100%',
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, mb: 3, color: themeColors.primary, display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <ShoppingCartIcon fontSize="small" /> {category.title}
                      </Typography>
                      <List dense>
                        {category.items.map((item, i) => (
                          <Box key={i}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {item.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Quantidade: {item.qty}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: themeColors.primary }}>
                                {item.price}
                              </Typography>
                            </Box>
                            {i < category.items.length - 1 && <Divider sx={{ my: 0.5 }} />}
                          </Box>
                        ))}
                      </List>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}>
              <Paper
                elevation={6}
                sx={{
                  p: 4,
                  mt: 4,
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                  color: 'white',
                  borderRadius: 4,
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Total Estimado
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900 }}>
                  {content.total}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                  Para 18 refeições completas e balanceadas
                </Typography>
              </Paper>
            </motion.div>
          </Box>
        );
      }
      case 'receitas': {
        const content = EBOOK_DATA.content.receitas;
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: themeColors.primary, mb: 4 }}>
              {content.title}
            </Typography>
            <Grid container spacing={4}>
              {content.recipes.map((recipe, index) => (
                <Grid item xs={12} key={recipe.id}>
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.3 }}>
                    <Paper
                      elevation={4}
                      sx={{
                        p: 4,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${themeColors.primary}05, ${themeColors.secondary}03)`,
                        border: `1px solid ${themeColors.primary}15`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h2" sx={{ mr: 2 }}>
                          {recipe.image}
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, color: themeColors.primary }}>
                          {recipe.title}
                        </Typography>
                      </Box>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: themeColors.primary }}>
                            Ingredientes
                          </Typography>
                          <List dense>
                            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                              🥩 Proteína: {recipe.ingredients.protein}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                              🌾 Carboidrato: {recipe.ingredients.carb}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                              🥬 Vegetais: {recipe.ingredients.veggie}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              🧄 Extras: {recipe.ingredients.extra}
                            </Typography>
                          </List>
                        </Grid>
                        <Grid item xs={12} md={8}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: themeColors.primary }}>
                            Modo de Preparo
                          </Typography>
                          {(['protein', 'carb', 'veggie', 'extra'] as const).map((stepKey) => (
                            <Box key={stepKey} sx={{ mb: 3 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: themeColors.secondary }}>
                                {stepKey === 'protein' && '🥩 Proteína'}
                                {stepKey === 'carb' && '🌾 Carboidrato'}
                                {stepKey === 'veggie' && '🥬 Vegetais'}
                                {stepKey === 'extra' && '🧄 Extras'}
                              </Typography>
                              {recipe.steps[stepKey].map((step, i) => (
                                <Typography
                                  key={i}
                                  variant="body2"
                                  sx={{ mb: 1, pl: 2, borderLeft: `3px solid ${themeColors.primary}30`, color: 'text.secondary' }}
                                >
                                  {i + 1}. {step}
                                </Typography>
                              ))}
                            </Box>
                          ))}
                        </Grid>
                      </Grid>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      }
      case 'preparo': {
        const content = EBOOK_DATA.content.preparo;
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: themeColors.primary, mb: 2 }}>
              {content.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
              {content.subtitle}
            </Typography>
            <Grid container spacing={4}>
              {Object.entries(content.techniques).map(([key, technique], index) => (
                <Grid item xs={12} key={key}>
                  <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.2 }}>
                    <Paper
                      elevation={4}
                      sx={{
                        p: 4,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${themeColors.primary}08, ${themeColors.secondary}05)`,
                        border: `1px solid ${themeColors.primary}20`,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 600, mb: 3, color: themeColors.primary, display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <KitchenIcon /> {technique.title}
                      </Typography>
                      <Grid container spacing={3}>
                        {(['preparation', 'cooling', 'storage', 'freezing', 'tips'] as const).map((stepKey) => {
                          const steps = technique[stepKey];
                          if (!steps) return null;
                          return (
                            <Grid item xs={12} sm={6} md={3} key={stepKey}>
                              <Box sx={{ p: 2, borderRadius: 2, background: `${themeColors.primary}10`, height: '100%' }}>
                                <Typography
                                  variant="h6"
                                  sx={{ fontWeight: 600, mb: 2, color: themeColors.primary, textTransform: 'capitalize' }}
                                >
                                  {stepKey === 'preparation' && '🔥 Preparação'}
                                  {stepKey === 'cooling' && '❄️ Resfriamento'}
                                  {stepKey === 'storage' && '📦 Armazenamento'}
                                  {stepKey === 'freezing' && '🧊 Congelamento'}
                                  {stepKey === 'tips' && '💡 Dicas'}
                                </Typography>
                                {steps.map((s: string, i: number) => (
                                  <Typography key={i} variant="body2" sx={{ mb: 1, color: 'text.secondary', lineHeight: 1.5 }}>
                                    • {s}
                                  </Typography>
                                ))}
                              </Box>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      }
      case 'armazenamento': {
        const content = EBOOK_DATA.content.armazenamento;
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: themeColors.primary, mb: 2 }}>
              {content.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
              {content.subtitle}
            </Typography>
            <Grid container spacing={4}>
              {Object.entries(content.sections).map(([key, section], index) => (
                <Grid item xs={12} key={key}>
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.3 }}>
                    <Paper
                      elevation={4}
                      sx={{
                        p: 4,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${themeColors.primary}06, ${themeColors.secondary}03)`,
                        border: `1px solid ${themeColors.primary}15`,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 600, mb: 3, color: themeColors.primary, display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {key === 'refrigeracao' && '🧊 '}
                        {key === 'congelamento' && '❄️ '}
                        {key === 'descongelamento' && '🔥 '}
                        {section.title}
                      </Typography>
                      <Grid container spacing={2}>
                        {section.steps.map((step, i) => (
                          <Grid item xs={12} sm={6} key={i}>
                            <Box sx={{ p: 3, borderRadius: 2, background: `${themeColors.primary}08`, height: '100%' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: themeColors.primary }}>
                                {i + 1}. {step.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                {step.content}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}>
              <Paper
                elevation={6}
                sx={{
                  p: 3,
                  mt: 4,
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${themeColors.secondary}15, ${themeColors.primary}10)`,
                  border: `2px solid ${themeColors.primary}20`,
                  borderRadius: 3,
                }}
              >
                <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  💡 {content.final_note}
                </Typography>
              </Paper>
            </motion.div>
          </Box>
        );
      }
      case 'dicas': {
        const content = EBOOK_DATA.content.dicas;
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: themeColors.primary, mb: 2 }}>
              {content.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
              {content.subtitle}
            </Typography>
            <Grid container spacing={3}>
              {content.warning_foods.map((food, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, #ffebee, #fff3e0)`,
                        border: `1px solid #ff9800`,
                        height: '100%',
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#d84315' }}>
                        ⚠️ {food.category}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {food.description}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <Paper
                elevation={6}
                sx={{
                  p: 4,
                  mt: 4,
                  background: `linear-gradient(135deg, #ffebee, #fff8e1)`,
                  border: `2px solid #ff9800`,
                  borderRadius: 4,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, color: '#d84315', textAlign: 'center', lineHeight: 1.6 }}
                >
                  ⚠️ <strong>Importante:</strong> {content.final_warning}
                </Typography>
              </Paper>
            </motion.div>
          </Box>
        );
      }
      case 'valores': {
        const content = EBOOK_DATA.content.valores;
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: themeColors.primary, mb: 2 }}>
              {content.title}
            </Typography>
            {content.note && (
              <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                {content.note}
              </Typography>
            )}
            <Grid container spacing={2}>
              {content.items.map((it, i) => (
                <Grid item xs={12} md={6} key={i}>
                  <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                    <CardContent>
                      <Typography fontWeight={700} mb={1}>
                        {it.label}
                      </Typography>
                      <Chip label={`${it.kcal} kcal`} size="small" sx={{ mr: 1 }} />
                      <Chip label={`P ${it.protein} g`} size="small" sx={{ mr: 1 }} />
                      <Chip label={`C ${it.carb} g`} size="small" sx={{ mr: 1 }} />
                      <Chip label={`G ${it.fat} g`} size="small" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      }
      default:
        return null;
    }
  };

  /** ======= Sumário ======= */
  if (showTableOfContents) {
    return (
      <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', width: '100%', background: themeColors.background }}>
        <Box
          sx={{
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 2, sm: 3 },
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* decor */}
          <Box
            sx={{
              position: 'absolute',
              top: '15%',
              right: '10%',
              width: { xs: 80, sm: 120 },
              height: { xs: 80, sm: 120 },
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${themeColors.primary}15, ${themeColors.secondary}15)`,
              filter: 'blur(1px)',
              opacity: 0.7,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '20%',
              left: '8%',
              width: { xs: 60, sm: 100 },
              height: { xs: 60, sm: 100 },
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${themeColors.secondary}20, ${themeColors.primary}20)`,
              filter: 'blur(1px)',
              opacity: 0.6,
            }}
          />
          {/* header */}
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, type: 'spring' }}>
            <Avatar
              src={LINA_AVATAR}
              alt="Lina"
              sx={{
                width: { xs: 80, sm: 100 },
                height: { xs: 80, sm: 100 },
                mx: 'auto',
                mb: 3,
                boxShadow: `0 8px 32px ${themeColors.primary}40`,
                border: '4px solid #fff',
                bgcolor: themeColors.primary,
              }}
            />
          </motion.div>
          <Fade in timeout={800}>
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              sx={{
                fontWeight: 700,
                mb: 2,
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {getThemeByTime().icon} {EBOOK_DATA.title}
            </Typography>
          </Fade>
          <Fade in timeout={1000}>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 4, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
              {EBOOK_DATA.subtitle}
            </Typography>
          </Fade>
          {/* busca */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <TextField
              fullWidth
              placeholder="Buscar no e-book..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                mb: 4,
                maxWidth: 400,
                '& .MuiOutlinedInput-root': { borderRadius: 3, background: 'rgba(255,255,255,0.8)' },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </motion.div>
          {/* sumário */}
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
            <Paper
              elevation={6}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 4,
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${themeColors.primary}20`,
                maxWidth: 900,
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, mb: 3, color: themeColors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
              >
                <MenuBookIcon /> Sumário
              </Typography>
              <Grid container spacing={2}>
                {filteredChapters.map((chapter, index) => (
                  <Grid item xs={12} sm={6} md={4} key={chapter.id}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.05 }}>
                      <Card
                        elevation={2}
                        sx={{
                          cursor: 'pointer',
                          height: '100%',
                          background: `linear-gradient(135deg, ${themeColors.primary}08, ${themeColors.secondary}05)`,
                          border: `1px solid ${themeColors.primary}15`,
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: `0 8px 25px ${themeColors.primary}25`,
                            background: `linear-gradient(135deg, ${themeColors.primary}15, ${themeColors.secondary}10)`,
                          },
                          transition: 'all 0.3s ease',
                        }}
                        onClick={() => handleChapterChange(chapter.id)}
                      >
                        <CardContent sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" sx={{ mb: 1 }}>
                            {chapter.icon}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: themeColors.primary, lineHeight: 1.3 }}>
                            {chapter.title}
                          </Typography>
                          {favorites.includes(chapter.id) && <FavoriteIcon fontSize="small" sx={{ mt: 1, color: '#f44336' }} />}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </motion.div>
        </Box>
      </Box>
    );
  }

  /** ======= Visualização do capítulo ======= */
  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', background: themeColors.background, pb: 4 }}>
      <Paper
        elevation={4}
        sx={{
          p: 2,
          mb: 4,
          background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Button
            startIcon={<MenuBookIcon />}
            onClick={() => setShowTableOfContents(true)}
            sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
          >
            Voltar ao Sumário
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={goToPreviousChapter} disabled={getCurrentChapterIndex() === 0} sx={{ color: 'white' }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="body2" sx={{ mx: 2 }}>
              {getCurrentChapterIndex() + 1} / {EBOOK_DATA.chapters.length}
            </Typography>
            <IconButton
              onClick={goToNextChapter}
              disabled={getCurrentChapterIndex() === EBOOK_DATA.chapters.length - 1}
              sx={{ color: 'white' }}
            >
              <ArrowForwardIcon />
            </IconButton>
            <IconButton
              onClick={() => toggleFavorite(currentChapter)}
              sx={{ color: favorites.includes(currentChapter) ? '#ffeb3b' : 'white', ml: 1 }}
            >
              <BookmarkIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
      <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <AnimatePresence mode="wait">
          <motion.div key={currentChapter} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}>
            {renderChapterContent()}
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
