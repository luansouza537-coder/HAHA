export interface Questao {
  id: string;
  assunto: string;
  total: number;
  acertos: number;
  data: string;
}

export interface Conteudo {
  id: string;
  nome: string;
  data: string;
  grupoId: string;
  anotacoes: string;
}

export interface Materia {
  id: number;
  nome: string;
  emoji: string;
  conteudos: Conteudo[];
}

export interface Revisao {
  id: number;
  conteudo: string;
  nivel: number; // 1 to 4
  ultima: string;
  proxima: string;
  prioridade: boolean;
  ciclo: boolean;
  grupoId?: string;
  etapa?: number;
  totalEtapas?: number;
}

export interface Leitura {
  id: number;
  titulo: string;
  assunto: string;
  tipo: 'Livro' | 'Artigo' | 'Outro' | 'Podcast' | 'Filme' | 'Escrita Artigo' | 'TCC' | 'Resumo' | 'Redação' | 'Reportagem' | 'Mídia Social';
  paginas: number;
  data: string;
  categoriaFilme?: string;
}

export interface SessaoEstudo {
  id: number;
  assunto: string;
  data: string;
  horaInicio: string;
  duracaoMin: number;
}

export type TreePhase = 'seed' | 'sprout' | 'sapling' | 'mature' | 'ancient';

export interface Tree {
  id: number;
  speciesId: string;
  assunto: string;
  materiaNome: string;
  dataPlantio: string;
  duracaoMin: number;
  waterDroplets: number; // current feeding
  fertilizerAmount: number; // current feeding
  growthPercent: number; // 0 to 100
  phase: TreePhase;
  positionX: number; // percentage coordinate on garden 0-100
  positionY: number; // percentage coordinate on garden 0-100
  withered?: boolean; // True if the plant has wilted due to study inactivity
}

export type BiomeType = 'sunny' | 'sakura' | 'desert' | 'mystic' | 'arctic' | 'volcanic' | 'cosmic';

export interface Flashcard {
  id: number;
  pergunta: string;
  resposta: string;
  assunto: string;
  nivelDificuldade: 'Fácil' | 'Médio' | 'Difícil';
  proximaData: string; // YYYY-MM-DD
  intervaloDias: number;
  sequenciaAcertos: number;
}

export interface Achievement {
  id: string;
  titulo: string;
  descricao: string;
  requisitoTxt: string;
  emoji: string;
  corBadge: string;
  desbloqueado: boolean;
  dataDesbloqueio?: string;
  xpBonus: number;
}

export interface GardenEvent {
  id: string | number;
  titulo: string;
  descricao: string;
  efeitoTipo?: 'chuva' | 'praga' | 'vento' | 'tesouro' | 'sol';
  custoOption?: {
    recurso: 'agua' | 'adubo' | 'xp';
    qtd: number;
    btnTxt: string;
  };
  recompensaOption?: {
    recurso: 'agua' | 'adubo' | 'xp';
    qtd: number;
    btnTxt: string;
  };
  resolvido?: boolean;
  mensagemResultado?: string;

  // App.tsx simulator fields
  pernicioso?: boolean;
  duracaoDias?: number;
  impactoTxt?: string;
  tipo?: 'pula_pulga' | 'sol_intenso';
}

export interface CultivoTimelineEvent {
  id: number;
  data: string;
  emoji: string;
  titulo: string;
  mensagem: string;
  tipo: 'colheita' | 'estudo' | 'recompensa' | 'evento';
}

export interface GardenSettings {
  currentBiome: BiomeType;
  unlockedBiomes: BiomeType[];
  waterReserve: number;
  fertilizerReserve: number;
  unlockedLandmarks: string[]; // 'tent' | 'well' | 'fire' | 'bridge'
  focusPoints: number; // point currency
  survivalMode?: boolean; // Toggles plant withering mechanics
  autoBackupEnabled?: boolean; // Toggles automatic backups on key actions
  equippedGlassSkin?: 'default' | 'prism' | 'retro' | 'royal'; // Greenhouse glass overlay style
  unlockedGlassSkins?: string[]; // Purchasable skins list
  equippedGroundSkin?: 'moss' | 'sand' | 'cosmic_dust' | 'classic'; // Ground styling
}

export interface EstufaFoto {
  id: string;
  titulo: string;
  materiaNome: string;
  assunto: string;
  data: string;
  emoji: string;
  raridade: string;
  biome: string;
  comentario: string;
}

export interface StreakData {
  currentStreak: number;
  lastCompletedDate: string;
  lastActiveDate?: string;
  todayCounts: {
    questoes: number;
    revisoes: number;
    leituras: number;
    tempoMin: number;
  };
}

export interface Anotacao {
  id: number;
  titulo: string;
  conteudo: string;
  data: string;
  assunto: string;
  caracteres: number;
  recompensaResgatada: boolean;
  xpRecompensa: number;
  aguaRecompensa: number;
  aduboRecompensa: number;
}

export interface PomodoroState {
  minutos: number;
  segundos: number;
  totalSegundos: number;
  running: boolean;
  ciclosCompletos: number;
  assunto: string;
  registrar: boolean;
}

export interface BotanicalSpecies {
  id: string;
  nome: string;
  emojiSemente: string;
  emojiBroto: string;
  emojiArbusto: string;
  emojiAdulto: string;
  emojiAncia: string;
  categoria: string;
  raridade: 'Comum' | 'Incomum' | 'Rara' | 'Lendária';
  descricao: string;
  comoDesbloquear: string;
  lore: string;
}

export { ESPECIO_DATABASE } from './constants';
