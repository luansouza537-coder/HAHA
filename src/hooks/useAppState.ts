import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Questao, Revisao, Leitura, Materia, SessaoEstudo, Tree,
  GardenSettings, StreakData, ESPECIO_DATABASE, Anotacao,
  Flashcard, Achievement, GardenEvent, CultivoTimelineEvent, EstufaFoto
} from '../types';
import { audioSynth } from '../utils/audio';
import { getTodayDate, addDays, generateUniqueNumericId, generateUniqueStringId } from '../utils/helpers';

const API_BASE = import.meta.env.VITE_API_URL || '';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export function useAppState() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(!audioSynth.getMuteState());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    isIrreversible?: boolean;
  } | null>(null);

  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [revisoes, setRevisoes] = useState<Revisao[]>([]);
  const [leituras, setLeituras] = useState<Leitura[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [sessoesEstudo, setSessoesEstudo] = useState<SessaoEstudo[]>([]);
  const [plantedTrees, setPlantedTrees] = useState<Tree[]>([]);

  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    lastCompletedDate: '',
    todayCounts: { questoes: 0, revisoes: 0, leituras: 0, tempoMin: 0 }
  });

  const [gardenSettings, setGardenSettings] = useState<GardenSettings>({
    currentBiome: 'sunny',
    unlockedBiomes: ['sunny'],
    waterReserve: 4,
    fertilizerReserve: 2,
    unlockedLandmarks: [],
    focusPoints: 30,
    survivalMode: false,
    autoBackupEnabled: true,
    equippedGlassSkin: 'default',
    unlockedGlassSkins: ['default'],
    equippedGroundSkin: 'classic'
  });

  const [fotos, setFotos] = useState<EstufaFoto[]>([]);

  const [metas, setMetas] = useState({
    questoes: 20,
    revisoes: 3,
    leituras: 1,
    tempoMin: 120,
    backupIntervalo: 60,
    notificacaoHora: 8,
    intervalosCiclo: [1, 7, 30, 60]
  });

  const [selectedTreeForNurture, setSelectedTreeForNurture] = useState<Tree | null>(null);

  const [newMateriaNome, setNewMateriaNome] = useState('');
  const [newMateriaEmoji, setNewMateriaEmoji] = useState('🌳');
  const [selectedMateriaId, setSelectedMateriaId] = useState<number | ''>('');
  const [conteudoNome, setConteudoNome] = useState('');
  const [conteudoData, setConteudoData] = useState(() => getTodayDate());

  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [nTitulo, setNTitulo] = useState('');
  const [nConteudo, setNConteudo] = useState('');
  const [nAssunto, setNAssunto] = useState('');
  const [nNotaAtivaId, setNNotaAtivaId] = useState<number | null>(null);
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [fcActiveId, setFcActiveId] = useState<number | null>(null);
  const [fcFlipped, setFcFlipped] = useState<boolean>(false);
  const [fcPergunta, setFcPergunta] = useState<string>('');
  const [fcResposta, setFcResposta] = useState<string>('');
  const [fcAssunto, setFcAssunto] = useState<string>('');
  const [fcDificuldade, setFcDificuldade] = useState<'Fácil' | 'Médio' | 'Difícil'>('Médio');
  const [fcGenerating, setFcGenerating] = useState<boolean>(false);
  const [activeExplanation, setActiveExplanation] = useState<string | null>(null);
  const [explainingCardId, setExplainingCardId] = useState<number | null>(null);
  const [autoGenerateSubject, setAutoGenerateSubject] = useState<string>('');
  const [reviewedThisSession, setReviewedThisSession] = useState<number[]>([]);

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [gardenEvent, setGardenEvent] = useState<GardenEvent | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<CultivoTimelineEvent[]>([]);

  const [isMetasOpen, setIsMetasOpen] = useState(false);
  const [historyStack, setHistoryStack] = useState<{ desc: string; undoFn: () => void }[]>([]);

  const [conSearchQuery, setConSearchQuery] = useState('');
  const [conFilterMateriaId, setConFilterMateriaId] = useState<number | 'all'>('all');
  const [conFilterDateStart, setConFilterDateStart] = useState('');
  const [conFilterDateEnd, setConFilterDateEnd] = useState('');

  // Refs for avoiding stale closures in callbacks
  const metasRef = useRef(metas);
  const revisoesRef = useRef(revisoes);
  const streakRef = useRef(streak);
  const gardenSettingsRef = useRef(gardenSettings);
  const plantedTreesRef = useRef(plantedTrees);
  const achievementsRef = useRef(achievements);
  const materiasRef = useRef(materias);
  const questoesRef = useRef(questoes);
  const sessoesEstudoRef = useRef(sessoesEstudo);
  const leiturasRef = useRef(leituras);
  const anotacoesRef = useRef(anotacoes);
  const flashcardsRef = useRef(flashcards);
  const timelineEventsRef = useRef(timelineEvents);
  const unlockedAchievementsRef = useRef<Set<string>>(new Set());
  const isLoadedRef = useRef(false);

  // Sync refs on every render
  metasRef.current = metas;
  revisoesRef.current = revisoes;
  streakRef.current = streak;
  gardenSettingsRef.current = gardenSettings;
  plantedTreesRef.current = plantedTrees;
  achievementsRef.current = achievements;
  materiasRef.current = materias;
  questoesRef.current = questoes;
  sessoesEstudoRef.current = sessoesEstudo;
  leiturasRef.current = leituras;
  anotacoesRef.current = anotacoes;
  flashcardsRef.current = flashcards;
  timelineEventsRef.current = timelineEvents;

  // ── Toast & sound ───────────────────────────────────────────────────────────

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    if (type === 'success') audioSynth.playSuccessToast();
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    audioSynth.setMuteState(!nextVal);
    setSoundEnabled(nextVal);
    if (nextVal) audioSynth.playClick();
  };

  // ── LocalStorage initial load ───────────────────────────────────────────────

  useEffect(() => {
    try {
      const q = localStorage.getItem('questoes');
      if (q) setQuestoes(JSON.parse(q));

      const r = localStorage.getItem('revisoes');
      if (r) setRevisoes(JSON.parse(r));

      const l = localStorage.getItem('leituras');
      if (l) setLeituras(JSON.parse(l));

      const m = localStorage.getItem('materias');
      if (m) setMaterias(JSON.parse(m));

      const s = localStorage.getItem('sessoesEstudo');
      if (s) setSessoesEstudo(JSON.parse(s));

      const t = localStorage.getItem('plantedTrees');
      const parsedTrees: Tree[] = t ? JSON.parse(t) : [];
      if (t) setPlantedTrees(parsedTrees);

      const st = localStorage.getItem('streakData');
      let parsedStreak: StreakData | null = st ? JSON.parse(st) : null;
      if (parsedStreak) {
        const hoje = getTodayDate();
        let currStreak = parsedStreak.currentStreak;

        if (parsedStreak.lastCompletedDate) {
          const lastDate = new Date(parsedStreak.lastCompletedDate + 'T00:00:00');
          const today = new Date(hoje + 'T00:00:00');
          if (!isNaN(lastDate.getTime()) && !isNaN(today.getTime())) {
            const diffTime = today.getTime() - lastDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 2) currStreak = 0;
          }
        }

        const safeCounts = parsedStreak.todayCounts || { questoes: 0, revisoes: 0, leituras: 0, tempoMin: 0 };

        if (parsedStreak.lastActiveDate !== hoje || parsedStreak.currentStreak !== currStreak || !parsedStreak.todayCounts) {
          parsedStreak = {
            ...parsedStreak,
            currentStreak: currStreak,
            lastActiveDate: hoje,
            todayCounts: parsedStreak.lastActiveDate !== hoje
              ? { questoes: 0, revisoes: 0, leituras: 0, tempoMin: 0 }
              : safeCounts
          };
          localStorage.setItem('streakData', JSON.stringify(parsedStreak));
        }
        setStreak(parsedStreak);
      }

      const gs = localStorage.getItem('gardenSettings');
      const parsedSettings: GardenSettings | null = gs ? JSON.parse(gs) : null;
      if (gs && parsedSettings) {
        if (parsedSettings.autoBackupEnabled === undefined) parsedSettings.autoBackupEnabled = true;
        setGardenSettings(parsedSettings);
      }

      if (parsedSettings && parsedSettings.survivalMode && parsedStreak && parsedStreak.lastCompletedDate) {
        const lastDate = new Date(parsedStreak.lastCompletedDate + 'T00:00:00');
        const today = new Date(getTodayDate() + 'T00:00:00');
        if (!isNaN(lastDate.getTime()) && !isNaN(today.getTime())) {
          const diffTime = today.getTime() - lastDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays >= 2 && parsedTrees.length > 0) {
            let witheringOccurred = false;
            const updated = parsedTrees.map(tree => {
              if (tree.phase !== 'ancient' && !tree.withered) {
                witheringOccurred = true;
                return { ...tree, withered: true };
              }
              return tree;
            });
            if (witheringOccurred) {
              setPlantedTrees(updated);
              localStorage.setItem('plantedTrees', JSON.stringify(updated));
              setTimelineEvents(prev => {
                const newEv: CultivoTimelineEvent = {
                  id: generateUniqueNumericId(),
                  data: getTodayDate(),
                  emoji: '🥀',
                  titulo: 'Aviso do Modo Sobrevivência!',
                  mensagem: `Ficamos ${diffDays} dias sem regar com novos estudos. Algumas plantas murcharam!`,
                  tipo: 'evento'
                };
                const u = [newEv, ...prev].slice(0, 200);
                localStorage.setItem('timelineEvents', JSON.stringify(u));
                return u;
              });
            }
          }
        }
      }

      const fts = localStorage.getItem('estufaFotos');
      if (fts) setFotos(JSON.parse(fts));

      const mt = localStorage.getItem('metas');
      if (mt) setMetas(JSON.parse(mt));

      const an = localStorage.getItem('anotacoes');
      if (an) setAnotacoes(JSON.parse(an));

      const fcs = localStorage.getItem('flashcards');
      if (fcs) {
        setFlashcards(JSON.parse(fcs));
      } else {
        const DEFAULT_FLASHCARDS: Flashcard[] = [
          {
            id: 1001,
            pergunta: "Qual a diferença entre Memória de Curto Prazo e Memória de Longo Prazo?",
            resposta: "A memória de curto prazo (ou de trabalho) retém informações temporariamente (segundos/minutos) sob limite de capacidade (7±2 itens). A de longo prazo consolida dados de forma permanente pela plasticidade sináptica após repetição espaçada e recall ativo.",
            assunto: "Neurociência",
            nivelDificuldade: "Médio",
            proximaData: getTodayDate(),
            intervaloDias: 1,
            sequenciaAcertos: 0
          },
          {
            id: 1002,
            pergunta: "O que diz a Curva do Esquecimento de Hermann Ebbinghaus?",
            resposta: "Diz que perdemos cerca de 50% do conhecimento novo nas primeiras horas se nenhuma revisão for feita. A taxa de esquecimento diminui exponencialmente a cada nova revisão espaçada e ativa efetuada.",
            assunto: "Metodologia de Estudo",
            nivelDificuldade: "Fácil",
            proximaData: getTodayDate(),
            intervaloDias: 1,
            sequenciaAcertos: 0
          },
          {
            id: 1003,
            pergunta: "O que é Mitocôndria e qual a sua principal função celular?",
            resposta: "É uma organela celular com DNA próprio, responsável pela respiração celular aeróbia e pela síntese de ATP (Trifosfato de Adenosina), gerando energia metabólica para a célula.",
            assunto: "Biologia Celular",
            nivelDificuldade: "Difícil",
            proximaData: getTodayDate(),
            intervaloDias: 1,
            sequenciaAcertos: 0
          }
        ];
        setFlashcards(DEFAULT_FLASHCARDS);
        localStorage.setItem('flashcards', JSON.stringify(DEFAULT_FLASHCARDS));
      }

      const achs = localStorage.getItem('achievements');
      if (achs) {
        const parsed: Achievement[] = JSON.parse(achs);
        setAchievements(parsed);
        const unlockedIds = parsed.filter(a => a.desbloqueado).map(a => a.id);
        unlockedAchievementsRef.current = new Set(unlockedIds);
      } else {
        const INITIAL_ACHIEVEMENTS: Achievement[] = [
          { id: '1', titulo: 'Primeiro Foco', descricao: 'Complete sua primeira sessão de Pomodoro com êxito.', requisitoTxt: '1 ciclo Pomodoro completo', emoji: '⏱️', corBadge: 'from-amber-400 to-orange-500', desbloqueado: false, xpBonus: 50 },
          { id: '2', titulo: 'Escritor Ativo', descricao: 'Registre uma anotação acadêmica com mais de 200 caracteres.', requisitoTxt: 'Anotação >= 200 caracteres', emoji: '✍️', corBadge: 'from-blue-400 to-indigo-600', desbloqueado: false, xpBonus: 80 },
          { id: '3', titulo: 'Mestre Examinador', descricao: 'Resolva questões com aproveitamento alto.', requisitoTxt: '1 conjunto de questões resolvidas', emoji: '🎓', corBadge: 'from-purple-400 to-pink-600', desbloqueado: false, xpBonus: 100 },
          { id: '4', titulo: 'Estufa de Elite', descricao: 'Desbloqueie qualquer Bioma Avançado na Loja.', requisitoTxt: 'Desbloquear 1 bioma extra', emoji: '✨', corBadge: 'from-teal-400 to-cyan-600', desbloqueado: false, xpBonus: 150 },
          { id: '5', titulo: 'Sábio Memorizador', descricao: 'Estude e acerte pelo menos um Flashcard.', requisitoTxt: 'Flashcard acertado', emoji: '🧠', corBadge: 'from-rose-400 to-red-600', desbloqueado: false, xpBonus: 120 },
          { id: '6', titulo: 'Leitor Voraz', descricao: 'Registre a leitura de um livro ou mídia na estação.', requisitoTxt: '1 leitura registrada', emoji: '📚', corBadge: 'from-emerald-400 to-teal-600', desbloqueado: false, xpBonus: 70 }
        ];
        setAchievements(INITIAL_ACHIEVEMENTS);
        localStorage.setItem('achievements', JSON.stringify(INITIAL_ACHIEVEMENTS));
        unlockedAchievementsRef.current = new Set();
      }

      const tmls = localStorage.getItem('timelineEvents');
      if (tmls) {
        setTimelineEvents(JSON.parse(tmls));
      } else {
        const DEFAULT_TIMELINE: CultivoTimelineEvent[] = [
          {
            id: 2001,
            data: getTodayDate(),
            emoji: "🌱",
            titulo: "Portal do Cultivo Ativado",
            mensagem: "Seu aplicativo CultivaMente foi inaugurado. Prepare seus temas, colha frutos estudando e combata as pragas do solo!",
            tipo: "colheita"
          }
        ];
        setTimelineEvents(DEFAULT_TIMELINE);
        localStorage.setItem('timelineEvents', JSON.stringify(DEFAULT_TIMELINE));
      }

      const gev = localStorage.getItem('gardenEvent');
      if (gev) setGardenEvent(JSON.parse(gev));

      const dm = localStorage.getItem('darkMode');
      if (dm) {
        const isDark = JSON.parse(dm);
        setDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
      }
    } catch (e) {
      console.error("Error reading LocalStorage data", e);
    } finally {
      isLoadedRef.current = true;
    }
  }, []);

  // ── LocalStorage sync effects ───────────────────────────────────────────────

  useEffect(() => { if (!isLoadedRef.current) return; localStorage.setItem('questoes', JSON.stringify(questoes)); }, [questoes]);
  useEffect(() => { if (!isLoadedRef.current) return; localStorage.setItem('revisoes', JSON.stringify(revisoes)); }, [revisoes]);
  useEffect(() => { if (!isLoadedRef.current) return; localStorage.setItem('leituras', JSON.stringify(leituras)); }, [leituras]);
  useEffect(() => { if (!isLoadedRef.current) return; localStorage.setItem('materias', JSON.stringify(materias)); }, [materias]);
  useEffect(() => { if (!isLoadedRef.current) return; localStorage.setItem('sessoesEstudo', JSON.stringify(sessoesEstudo)); }, [sessoesEstudo]);
  useEffect(() => { if (!isLoadedRef.current) return; localStorage.setItem('plantedTrees', JSON.stringify(plantedTrees)); }, [plantedTrees]);
  useEffect(() => { if (!isLoadedRef.current) return; localStorage.setItem('streakData', JSON.stringify(streak)); }, [streak]);
  useEffect(() => { if (!isLoadedRef.current) return; localStorage.setItem('gardenSettings', JSON.stringify(gardenSettings)); }, [gardenSettings]);
  useEffect(() => { if (!isLoadedRef.current) return; localStorage.setItem('metas', JSON.stringify(metas)); }, [metas]);
  useEffect(() => { if (!isLoadedRef.current) return; localStorage.setItem('anotacoes', JSON.stringify(anotacoes)); }, [anotacoes]);
  useEffect(() => { if (!isLoadedRef.current) return; localStorage.setItem('flashcards', JSON.stringify(flashcards)); }, [flashcards]);
  useEffect(() => { if (!isLoadedRef.current) return; localStorage.setItem('achievements', JSON.stringify(achievements)); }, [achievements]);
  useEffect(() => { if (!isLoadedRef.current) return; localStorage.setItem('timelineEvents', JSON.stringify(timelineEvents)); }, [timelineEvents]);
  useEffect(() => { if (!isLoadedRef.current) return; localStorage.setItem('estufaFotos', JSON.stringify(fotos)); }, [fotos]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (gardenEvent) localStorage.setItem('gardenEvent', JSON.stringify(gardenEvent));
    else localStorage.removeItem('gardenEvent');
  }, [gardenEvent]);

  // Auto-backup with debounce — uses ref to avoid stale closure
  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (!gardenSettingsRef.current.autoBackupEnabled) return;
    const timer = setTimeout(() => {
      if (!gardenSettingsRef.current.autoBackupEnabled) return;
      try {
        const payload = {
          questoes: localStorage.getItem('questoes'),
          revisoes: localStorage.getItem('revisoes'),
          leituras: localStorage.getItem('leituras'),
          materias: localStorage.getItem('materias'),
          sessoesEstudo: localStorage.getItem('sessoesEstudo'),
          plantedTrees: localStorage.getItem('plantedTrees'),
          streakData: localStorage.getItem('streakData'),
          gardenSettings: localStorage.getItem('gardenSettings'),
          estufaFotos: localStorage.getItem('estufaFotos'),
          metas: localStorage.getItem('metas'),
          anotacoes: localStorage.getItem('anotacoes'),
          flashcards: localStorage.getItem('flashcards'),
          achievements: localStorage.getItem('achievements'),
          timelineEvents: localStorage.getItem('timelineEvents'),
          gardenEvent: localStorage.getItem('gardenEvent'),
        };
        localStorage.setItem('cultivamente_auto_backup', JSON.stringify({ app: "CultivaMente", version: "1.2.0", timestamp: new Date().toISOString(), payload }));
      } catch (e) {
        console.error('Falha ao realizar backup automático', e);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [questoes, revisoes, anotacoes, flashcards, sessoesEstudo, materias, leituras, plantedTrees, streak, fotos]);

  // Trigger biome achievement when extra biomes are unlocked
  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (gardenSettings.unlockedBiomes && gardenSettings.unlockedBiomes.length > 1) {
      const id = '4';
      if (unlockedAchievementsRef.current.has(id)) return;
      const ach = achievementsRef.current.find(a => a.id === id);
      if (ach && !ach.desbloqueado) {
        unlockedAchievementsRef.current.add(id);
        setAchievements(prev => prev.map(a => a.id === id ? { ...a, desbloqueado: true, dataDesbloqueio: getTodayDate() } : a));
        setGardenSettings(prev => ({ ...prev, focusPoints: prev.focusPoints + ach.xpBonus }));
      }
    }
  }, [gardenSettings.unlockedBiomes?.length]);

  // Reset reviewed session on new day — uses a ref to detect actual day changes
  const todayRef = useRef(getTodayDate());
  useEffect(() => {
    const interval = setInterval(() => {
      const newDay = getTodayDate();
      if (newDay !== todayRef.current) {
        todayRef.current = newDay;
        setReviewedThisSession([]);
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Keep selectedTreeForNurture in sync with plantedTrees
  useEffect(() => {
    if (selectedTreeForNurture) {
      const currentTree = plantedTrees.find(t => t.id === selectedTreeForNurture.id);
      if (currentTree) {
        if (currentTree !== selectedTreeForNurture) setSelectedTreeForNurture(currentTree);
      } else {
        setSelectedTreeForNurture(null);
      }
    }
  }, [plantedTrees, selectedTreeForNurture]);

  // Escape key closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMetasOpen(false);
        setConfirmModal(null);
        setSelectedTreeForNurture(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const addTimelineEvent = (titulo: string, mensagem: string, tipo: CultivoTimelineEvent['tipo'], emoji = '🌿') => {
    const newEv: CultivoTimelineEvent = {
      id: generateUniqueNumericId(),
      data: getTodayDate(),
      emoji,
      titulo,
      mensagem,
      tipo
    };
    setTimelineEvents(prev => [newEv, ...prev].slice(0, 200));
  };

  const triggerUnlockAchievement = (id: string) => {
    if (unlockedAchievementsRef.current.has(id)) return;
    const ach = achievementsRef.current.find(a => a.id === id);
    if (ach && !ach.desbloqueado) {
      unlockedAchievementsRef.current.add(id);
      setAchievements(prev => prev.map(a => a.id === id ? { ...a, desbloqueado: true, dataDesbloqueio: getTodayDate() } : a));
      showToast(`🏆 Insígnia Desbloqueada: ${ach.titulo}! +${ach.xpBonus} FP adquiridos!`, 'success');
      setGardenSettings(prevSettings => ({ ...prevSettings, focusPoints: prevSettings.focusPoints + ach.xpBonus }));
      addTimelineEvent(`🏆 Conquista: ${ach.titulo}`, `Desbloqueou a insígnia de cultivo "${ach.titulo}"!`, 'recompensa', ach.emoji);
    }
  };

  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    localStorage.setItem('darkMode', JSON.stringify(isDark));
    document.documentElement.classList.toggle('dark', isDark);
  };

  const addUndoAction = (desc: string, undoFn: () => void) => {
    setHistoryStack(prev => {
      const updated = [...prev, { desc, undoFn }];
      if (updated.length > 15) updated.shift();
      return updated;
    });
  };

  const executeUndo = () => {
    if (historyStack.length === 0) return;
    const action = historyStack[historyStack.length - 1];
    action.undoFn();
    setHistoryStack(prev => prev.slice(0, prev.length - 1));
    showToast(`↩️ Desfeito com sucesso: "${action.desc}"`, 'info');
  };

  const registerProgress = (tipo: 'questoes' | 'revisoes' | 'leituras' | 'tempoMin', value = 1) => {
    const hoje = getTodayDate();
    setStreak(prev => {
      const isNewDay = prev.lastActiveDate !== hoje;
      const counts = isNewDay
        ? { questoes: 0, revisoes: 0, leituras: 0, tempoMin: 0 }
        : { ...prev.todayCounts };
      counts[tipo] += value;

      let lastComp = prev.lastCompletedDate;
      let currStreak = prev.currentStreak;

      if (lastComp) {
        const lastCompObj = new Date(lastComp + 'T00:00:00');
        const yesterday = new Date(hoje + 'T00:00:00');
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastCompObj < yesterday) currStreak = 0;
      }

      const currentMetas = metasRef.current;
      const fullyAchieved = counts.questoes >= currentMetas.questoes &&
                            counts.revisoes >= currentMetas.revisoes &&
                            counts.leituras >= currentMetas.leituras &&
                            counts.tempoMin >= currentMetas.tempoMin;

      if (fullyAchieved && lastComp !== hoje) {
        lastComp = hoje;
        currStreak += 1;
      }

      return { ...prev, currentStreak: currStreak, lastCompletedDate: lastComp, lastActiveDate: hoje, todayCounts: counts };
    });
  };

  // ── Conteúdos & Matérias ────────────────────────────────────────────────────

  const handleAddConteudo = () => {
    if (!conteudoNome.trim()) return showToast('Insira o nome do assunto!', 'warning');

    const grupoId = 'ciclo_' + generateUniqueStringId();
    const scheduledReviews: Revisao[] = metas.intervalosCiclo.map((dias, index) => ({
      id: generateUniqueNumericId(),
      conteudo: conteudoNome,
      nivel: 1,
      ultima: conteudoData,
      proxima: addDays(conteudoData, dias),
      prioridade: false,
      ciclo: true,
      grupoId,
      etapa: index + 1,
      totalEtapas: metas.intervalosCiclo.length
    }));

    setRevisoes(prev => [...prev, ...scheduledReviews]);

    const newCont = {
      id: generateUniqueStringId(),
      nome: conteudoNome,
      data: conteudoData,
      grupoId,
      anotacoes: ''
    };

    setMaterias(prev => {
      const updatedMaterias = [...prev];
      let targetMateriaId: string | number = selectedMateriaId;

      if (selectedMateriaId === '') {
        if (newMateriaNome.trim()) {
          const newMateria: Materia = { id: generateUniqueNumericId(), nome: newMateriaNome, emoji: newMateriaEmoji, conteudos: [] };
          updatedMaterias.push(newMateria);
          targetMateriaId = newMateria.id;
        } else {
          let geralMateria = updatedMaterias.find(m => m.nome === 'Geral');
          if (!geralMateria) {
            geralMateria = { id: generateUniqueNumericId(), nome: 'Geral', emoji: '🌱', conteudos: [] };
            updatedMaterias.push(geralMateria);
          }
          targetMateriaId = geralMateria.id;
        }
      } else {
        targetMateriaId = Number(selectedMateriaId);
      }

      return updatedMaterias.map(m => m.id === targetMateriaId ? { ...m, conteudos: [...m.conteudos, newCont] } : m);
    });

    setConteudoNome('');
    setNewMateriaNome('');
    setSelectedMateriaId('');
    setNewMateriaEmoji('🌳');
    setConteudoData(getTodayDate());
    setConSearchQuery('');
    setConFilterMateriaId('all');
    setConFilterDateStart('');
    setConFilterDateEnd('');
    showToast('✨ Matéria e Revisões agendadas automáticas!', 'success');
  };

  const handleRemoveConteudo = (materiaId: number, conteudoId: string, grupoId: string) => {
    const oldMaterias = [...materiasRef.current];
    const oldRevs = [...revisoesRef.current];
    setConfirmModal({
      title: "Excluir Conteúdo",
      message: "Tem certeza de que deseja excluir este conteúdo e suas revisões associadas?",
      onConfirm: () => {
        setMaterias(prev => prev.map(m => {
          if (m.id === materiaId) return { ...m, conteudos: m.conteudos.filter(c => c.id !== conteudoId) };
          return m;
        }).filter(m => m.nome === 'Geral' || m.conteudos.length > 0));
        setRevisoes(prev => prev.filter(r => r.grupoId !== grupoId));
        addUndoAction(`Remover assunto`, () => { setMaterias(oldMaterias); setRevisoes(oldRevs); });
      }
    });
  };

  const handleSaveNotes = (materiaId: number, conteudoId: string, notes: string) => {
    setMaterias(prev => prev.map(m => {
      if (m.id === materiaId) return { ...m, conteudos: m.conteudos.map(c => c.id === conteudoId ? { ...c, anotacoes: notes } : c) };
      return m;
    }));
  };

  // ── Revisões ────────────────────────────────────────────────────────────────

  const handleMarkRevisaoCompleted = (id: number, options = { addUndo: true }) => {
    const revIndex = revisoesRef.current.findIndex(r => r.id === id);
    if (revIndex === -1) return;

    const oldRevs = [...revisoesRef.current];
    const oldGardenSettings = { ...gardenSettingsRef.current };
    const oldStreak = { ...streakRef.current };
    const rev = revisoesRef.current[revIndex];

    if (rev.ciclo) {
      setRevisoes(prev => prev.filter(r => r.id !== id));
      registerProgress('revisoes', 1);
      setGardenSettings(prev => ({ ...prev, waterReserve: prev.waterReserve + 1, focusPoints: prev.focusPoints + 15 }));
    } else {
      const newNivel = Math.min(rev.nivel + 1, 4);
      const nextDate = addDays(getTodayDate(), newNivel === 2 ? 3 : newNivel === 3 ? 7 : 30);
      setRevisoes(prev => prev.map(r => r.id === id ? { ...r, nivel: newNivel, ultima: getTodayDate(), proxima: nextDate, prioridade: false } : r));
      registerProgress('revisoes', 1);
      setGardenSettings(prev => ({ ...prev, waterReserve: prev.waterReserve + 1, focusPoints: prev.focusPoints + 15 }));
    }

    if (options.addUndo) {
      addUndoAction(`Concluir revisão`, () => {
        setRevisoes(oldRevs);
        setGardenSettings(oldGardenSettings);
        setStreak(oldStreak);
      });
    }
  };

  const handleAddManualRevisao = (
    conteudo: string,
    nivel: number,
    ultima: string,
    intervaloPersonalizado: boolean,
    diasPersonalizados: number
  ) => {
    const intervalDays = intervaloPersonalizado ? diasPersonalizados : (nivel === 1 ? 1 : nivel === 2 ? 3 : nivel === 3 ? 7 : 30);
    const nextDate = addDays(ultima, intervalDays);
    const newRev: Revisao = {
      id: generateUniqueNumericId(),
      conteudo,
      nivel: intervaloPersonalizado ? 1 : nivel,
      ultima,
      proxima: nextDate,
      prioridade: false,
      ciclo: false
    };
    setRevisoes(prev => [...prev, newRev]);
    showToast(`Revisão agendada com sucesso com espaçamento de ${intervalDays} dias!`, 'success');
  };

  const handleRemoveRevisao = (id: number) => {
    const old = [...revisoesRef.current];
    setRevisoes(prev => prev.filter(r => r.id !== id));
    addUndoAction(`Remover revisão`, () => setRevisoes(old));
  };

  // ── Anotações ───────────────────────────────────────────────────────────────

  const handleSaveNota = () => {
    if (!nTitulo.trim()) return showToast('Por favor, dê um título para a sua anotação!', 'warning');
    if (!nConteudo.trim()) return showToast('A anotação precisa ter algum conteúdo!', 'warning');

    const charCount = nConteudo.trim().length;
    let earnedXP = 10, earnedWater = 0, earnedFertilizer = 0;

    if (charCount >= 50 && charCount < 200) { earnedXP = 20; earnedWater = 1; }
    else if (charCount >= 200 && charCount < 800) { earnedXP = 50; earnedWater = 2; earnedFertilizer = 1; }
    else if (charCount >= 800) { earnedXP = 110; earnedWater = 4; earnedFertilizer = 2; }

    if (nNotaAtivaId) {
      setAnotacoes(prev => prev.map(n => n.id === nNotaAtivaId ? {
        ...n,
        titulo: nTitulo,
        conteudo: nConteudo,
        assunto: nAssunto || 'Geral',
        caracteres: charCount,
        xpRecompensa: n.recompensaResgatada ? n.xpRecompensa : earnedXP,
        aguaRecompensa: n.recompensaResgatada ? n.aguaRecompensa : earnedWater,
        aduboRecompensa: n.recompensaResgatada ? n.aduboRecompensa : earnedFertilizer,
      } : n));
      if (charCount >= 200) triggerUnlockAchievement('2');
      showToast('Anotação atualizada!', 'success');
    } else {
      const newNota: Anotacao = {
        id: generateUniqueNumericId(),
        titulo: nTitulo,
        conteudo: nConteudo,
        data: getTodayDate(),
        assunto: nAssunto || 'Geral',
        caracteres: charCount,
        recompensaResgatada: false,
        xpRecompensa: earnedXP,
        aguaRecompensa: earnedWater,
        aduboRecompensa: earnedFertilizer,
      };
      setAnotacoes(prev => [newNota, ...prev]);
      setNNotaAtivaId(newNota.id);
      if (charCount >= 200) triggerUnlockAchievement('2');
      addTimelineEvent('Insight Registrado ✍️', `Nova anotação salva: "${nTitulo}" com ${charCount} caracteres sobre "${nAssunto || 'Geral'}"!`, 'recompensa', '✍️');
      showToast('Sua anotação foi salva com sucesso!', 'success');
    }
  };

  const handleDeleteNota = (id: number) => {
    const oldNotes = [...anotacoesRef.current];
    setConfirmModal({
      title: "Excluir Anotação",
      message: "Tem certeza de que deseja excluir esta anotação?",
      onConfirm: () => {
        setAnotacoes(prev => prev.filter(n => n.id !== id));
        if (nNotaAtivaId === id) { setNNotaAtivaId(null); setNTitulo(''); setNConteudo(''); setNAssunto(''); }
        showToast('Anotação removida.', 'info');
        addUndoAction('Restaurar anotação', () => setAnotacoes(oldNotes));
      }
    });
  };

  const handleGenerateAIFlashcards = async () => {
    if (aiGenerating) return;
    if (!nConteudo.trim()) return showToast('Por favor, escreva alguma anotação antes de gerar Flashcards com IA!', 'warning');
    setAiGenerating(true);
    showToast('Iniciando o poder da Inteligência Artificial... Carregando Estufa IA! 🧠✨', 'info');
    try {
      const response = await fetch(`${API_BASE}/api/gemini/generate-flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo: nTitulo || 'Sem Título', assunto: nAssunto || 'Geral', conteudo: nConteudo })
      });
      if (!response.ok) throw new Error('Falha de resposta do servidor de IA.');
      const data = await response.json();
      if (data.flashcards && Array.isArray(data.flashcards) && data.flashcards.length > 0) {
        const generatedFc: Flashcard[] = data.flashcards.map((fc: any) => ({
          id: generateUniqueNumericId(),
          pergunta: fc.pergunta,
          resposta: fc.resposta,
          assunto: nAssunto || 'Geral',
          nivelDificuldade: fc.nivelDificuldade || 'Médio',
          proximaData: getTodayDate(),
          intervaloDias: 1,
          sequenciaAcertos: 0
        }));
        const existing = new Set(flashcardsRef.current.map(f => f.pergunta.toLowerCase().trim()));
        const dedupedGenerated = generatedFc.filter(f => !existing.has(f.pergunta.toLowerCase().trim()));
        if (dedupedGenerated.length > 0) {
          setFlashcards(prev => [...dedupedGenerated, ...prev]);
          addTimelineEvent('Cultivo de Cérebro ✨', `Gerou com IA ${dedupedGenerated.length} flashcards de fixação para o assunto "${nAssunto || 'Geral'}" baseado nas suas notas!`, 'estudo', '🔮');
          addUndoAction(`Desfazer geração de ${dedupedGenerated.length} flashcards`, () => { setFlashcards(prev => prev.filter(f => !dedupedGenerated.some(g => g.id === f.id))); });
          showToast(`🎉 IA gerou ${dedupedGenerated.length} cartões de flashcard com sucesso! Encontre-os na aba de Flashcards.`, 'success');
        } else {
          showToast('Os flashcards gerados pela IA já existem no seu deck.', 'info');
        }
      } else {
        showToast('A IA não conseguiu estruturar cartões úteis para esta nota. Adicione mais detalhes ao texto!', 'warning');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Oops! A conexão do Gemini IA falhou. Certifique-se de configurar GEMINI_API_KEY corretamente.', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleClaimNotaRecompensas = (id: number) => {
    const nota = anotacoes.find(n => n.id === id);
    if (!nota) return;
    if (nota.recompensaResgatada) return showToast('Você já resgatou as recompensas por esta anotação!', 'warning');
    if (nota.caracteres < 50) return showToast('Insira mais profundidade na sua anotação (mais de 50 caracteres) para desbloquear seu bônus intelectual!', 'warning');

    const oldGardenSettings = { ...gardenSettingsRef.current };
    const oldAnotacoes = [...anotacoesRef.current];

    setGardenSettings(prev => ({
      ...prev,
      focusPoints: prev.focusPoints + nota.xpRecompensa,
      waterReserve: prev.waterReserve + nota.aguaRecompensa,
      fertilizerReserve: prev.fertilizerReserve + nota.aduboRecompensa
    }));
    setAnotacoes(prev => prev.map(n => n.id === id ? { ...n, recompensaResgatada: true } : n));
    addUndoAction('Desfazer resgate de recompensa', () => { setGardenSettings(oldGardenSettings); setAnotacoes(oldAnotacoes); });
    audioSynth.playSuccessToast();
    showToast(`Parabéns! Recompensas adicionadas ao seu jardim: +${nota.xpRecompensa} XP, +${nota.aguaRecompensa} 💧, +${nota.aduboRecompensa} 🍂`, 'success');
  };

  const handleCreateNovaNota = () => {
    setNNotaAtivaId(null);
    setNTitulo('');
    setNConteudo('');
    setNAssunto('');
    audioSynth.playClick();
  };

  // ── Questões ────────────────────────────────────────────────────────────────

  const handleAddQuestoes = (assunto: string, total: number, acertos: number) => {
    const oldQuestoes = [...questoesRef.current];
    const oldGardenSettings = { ...gardenSettingsRef.current };
    const oldStreak = { ...streakRef.current };

    const newQuest: Questao = { id: generateUniqueStringId(), assunto, total, acertos, data: getTodayDate() };
    setQuestoes(prev => [...prev, newQuest]);
    registerProgress('questoes', total);

    const earnedPoints = total > 0 ? Math.round((acertos / total) * 30) : 0;
    setGardenSettings(prev => ({
      ...prev,
      focusPoints: prev.focusPoints + earnedPoints,
      waterReserve: prev.waterReserve + (total >= 10 ? 1 : 0)
    }));

    triggerUnlockAchievement('3');
    addTimelineEvent('Questões Simuladas 🎓', `Fechou bloco de ${total} questões de "${assunto}" com ${acertos} acertos!`, 'recompensa', '🎓');
    addUndoAction(`Adicionar ${total} questões de ${assunto}`, () => {
      setQuestoes(oldQuestoes);
      setGardenSettings(oldGardenSettings);
      setStreak(oldStreak);
    });
    showToast(`Salvo com sucesso! Pontos adquiridos: +${earnedPoints} XP`, 'success');
  };

  const handleRemoveQuestoesByAssunto = (assunto: string) => {
    setConfirmModal({
      title: "Remover Questões",
      message: `Tem certeza de que deseja remover os questionários resolvidos de "${assunto}"?`,
      onConfirm: () => {
        const old = [...questoesRef.current];
        setQuestoes(prev => prev.filter(q => q.assunto !== assunto));
        addUndoAction(`Excluir histórico de questões de ${assunto}`, () => setQuestoes(old));
      }
    });
  };

  // ── Sessão de Estudo (Timer) ─────────────────────────────────────────────────

  const handleActiveSessionComplete = (assuntoName: string, durationMin: number, chosenSpeciesId?: string) => {
    const oldSessions = [...sessoesEstudoRef.current];
    const oldStreak = { ...streakRef.current };
    const oldRevs = [...revisoesRef.current];
    const oldPlantedTrees = [...plantedTreesRef.current];
    const oldGardenSettings = { ...gardenSettingsRef.current };
    const oldTimelineEvents = [...timelineEventsRef.current];

    const hoje = getTodayDate();
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newSessao: SessaoEstudo = { id: generateUniqueNumericId(), assunto: assuntoName, data: hoje, horaInicio: hora, duracaoMin: durationMin };
    setSessoesEstudo(prev => [...prev, newSessao]);
    registerProgress('tempoMin', durationMin);

    const matchedPendingRev = revisoesRef.current.find(r => r.conteudo.toLowerCase().trim() === assuntoName.toLowerCase().trim() && r.proxima <= hoje);
    if (matchedPendingRev) handleMarkRevisaoCompleted(matchedPendingRev.id, { addUndo: false });

    let speId = 'bonsai_sabedoria';
    let descReward = 'Semente Comum de Bonsai adquirida!';

    if (chosenSpeciesId) {
      speId = chosenSpeciesId;
      const foundSpecies = ESPECIO_DATABASE.find(s => s.id === chosenSpeciesId);
      descReward = `🌱 Cultivado: Semente de ${foundSpecies?.nome || 'Árvore de Estudos'} plantada com sucesso!`;
    } else {
      if (durationMin >= 90) {
        speId = 'lotus_fogo';
        descReward = '🔥 ESPETACULAR! Você obteve uma semente RARA de Lótus de Fogo por estudar mais de 90m!';
      } else if (durationMin >= 45) {
        speId = 'sakura_calma';
        descReward = '🌸 INCRÍVEL! Semente de Cerejeira da Calma desbloqueada!';
      } else {
        const term = assuntoName.toLowerCase();
        if (term.includes('algoritmo') || term.includes('código') || term.includes('program') || term.includes('web') || term.includes('calculo') || term.includes('math') || term.includes('físic') || term.includes('quimic') || term.includes('tecnolog')) {
          speId = 'espinha_silicio';
          descReward = '🌵 Semente de Cacto do Silício desbloqueada para matérias exatas!';
        } else {
          const horaAtual = new Date().getHours();
          if (horaAtual >= 20 || horaAtual < 5) {
            speId = 'orquidea_lunar';
            descReward = '🌌 Semente de Orquídea da Penumbra germinada no silêncio da noite!';
          } else if (horaAtual < 12) {
            speId = 'girassol_solar';
            descReward = '🌻 Semente de Girassol da Alvorada germinada para estudos matinais!';
          }
        }
      }

      const currentStreakVal = (() => {
        const currentStreakBase = streakRef.current.currentStreak;
        const todayCounts = { ...streakRef.current.todayCounts };
        todayCounts.tempoMin += durationMin;
        const currentMetas = metasRef.current;
        const fullyAchieved = todayCounts.questoes >= currentMetas.questoes &&
                              todayCounts.revisoes >= currentMetas.revisoes &&
                              todayCounts.leituras >= currentMetas.leituras &&
                              todayCounts.tempoMin >= currentMetas.tempoMin;
        if (fullyAchieved && streakRef.current.lastCompletedDate !== hoje) return currentStreakBase + 1;
        return currentStreakBase;
      })();

      if (currentStreakVal >= 5) {
        speId = 'carvalho_ancestral';
        descReward = '🌳 Incrível consistência! Semente de Carvalho Ancestral obtida com mais de 5 dias seguidos!';
      }
    }

    const xpBonus = Math.round(durationMin * 1.5);
    const earnedWater = durationMin >= 50 ? 3 : (durationMin >= 30 ? 2 : (durationMin >= 15 ? 1 : 0));
    const earnedFertilizer = durationMin >= 50 ? 1 : 0;
    const hasPlanted = durationMin >= 15;

    if (hasPlanted) {
      const randX = Math.floor(Math.random() * 70) + 15;
      const randY = Math.floor(Math.random() * 70) + 15;
      const newTree: Tree = {
        id: generateUniqueNumericId(),
        speciesId: speId,
        assunto: assuntoName,
        materiaNome: 'Estudos',
        dataPlantio: hoje,
        duracaoMin: durationMin,
        waterDroplets: 0,
        fertilizerAmount: 0,
        growthPercent: durationMin >= 50 ? 15 : (durationMin >= 30 ? 10 : 0),
        phase: 'seed',
        positionX: randX,
        positionY: randY
      };
      setPlantedTrees(prev => [...prev, newTree]);
      setGardenSettings(prev => ({ ...prev, focusPoints: prev.focusPoints + xpBonus, waterReserve: prev.waterReserve + earnedWater, fertilizerReserve: prev.fertilizerReserve + earnedFertilizer }));
      addTimelineEvent('Cultivo ⏱️', `Semente de ${ESPECIO_DATABASE.find(s => s.id === speId)?.nome || 'Árvore'} plantada com sucesso para o assunto "${assuntoName}"!`, 'estudo', '🌱');
      triggerUnlockAchievement('1');
      showToast(`🌳 ÁRVORE PLANTADA! ${descReward} (+${xpBonus} XP, +${earnedWater} 💧)`, 'success');
      setActiveTab('plantacao');
    } else {
      setGardenSettings(prev => ({ ...prev, focusPoints: prev.focusPoints + xpBonus, waterReserve: prev.waterReserve + earnedWater, fertilizerReserve: prev.fertilizerReserve + earnedFertilizer }));
      addTimelineEvent('Estudo Curto ⏱️', `Registrou ${durationMin} minutos de estudos focados sobre "${assuntoName}".`, 'estudo', '⏱️');
      showToast(`⏱️ Foco de ${durationMin}m registrado! (+${xpBonus} XP). Sessões com menos de 15 minutos não germinam sementes no jardim. Mantenha o foco mais tempo para plantar!`, 'info');
    }

    addUndoAction(`Registrar sessão de foco de ${durationMin}m`, () => {
      setSessoesEstudo(oldSessions);
      setStreak(oldStreak);
      if (matchedPendingRev) setRevisoes(oldRevs);
      setPlantedTrees(oldPlantedTrees);
      setGardenSettings(oldGardenSettings);
      setTimelineEvents(oldTimelineEvents);
    });
  };

  // ── Flashcards ───────────────────────────────────────────────────────────────

  const handleCreateFlashcard = () => {
    if (!fcPergunta.trim()) return showToast('A pergunta do flashcard não pode ser vazia!', 'warning');
    if (!fcResposta.trim()) return showToast('A resposta do flashcard não pode ser vazia!', 'warning');
    const oldCards = [...flashcardsRef.current];
    const newCard: Flashcard = {
      id: generateUniqueNumericId(),
      pergunta: fcPergunta,
      resposta: fcResposta,
      assunto: fcAssunto.trim() || 'Geral',
      nivelDificuldade: fcDificuldade,
      proximaData: getTodayDate(),
      intervaloDias: 1,
      sequenciaAcertos: 0
    };
    setFlashcards(prev => [newCard, ...prev]);
    setFcPergunta('');
    setFcResposta('');
    setFcAssunto('');
    addUndoAction('Criar flashcard', () => setFlashcards(oldCards));
    showToast('Novo Flashcard de Fixação ativado!', 'success');
  };

  const handleTriggerAutomatedGeneration = async (subjectName: string) => {
    if (fcGenerating) return;
    setFcGenerating(true);
    showToast(`🧠 Utilizando Inteligência Artificial do Gemini para sintetizar flashcards sobre "${subjectName}"...`, 'info');
    try {
      const matchingNotes = anotacoesRef.current.filter(note => note.assunto?.toLowerCase().trim() === subjectName.toLowerCase().trim());
      const notesContext = matchingNotes.map(note => `[Anotação: ${note.titulo}]\n${note.conteudo}`).join("\n\n");
      const response = await fetch(`${API_BASE}/api/gemini/generate-flashcards-by-subject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assunto: subjectName, notasRelacionadas: notesContext || undefined })
      });
      if (!response.ok) throw new Error('Falha de resposta ao conectar com a Estufo do Gemini.');
      const data = await response.json();
      if (data.flashcards && Array.isArray(data.flashcards) && data.flashcards.length > 0) {
        const generated: Flashcard[] = data.flashcards.map((fc: any) => ({
          id: generateUniqueNumericId(),
          pergunta: fc.pergunta,
          resposta: fc.resposta,
          assunto: subjectName,
          nivelDificuldade: fc.nivelDificuldade || 'Médio',
          proximaData: getTodayDate(),
          intervaloDias: 1,
          sequenciaAcertos: 0
        }));
        const existing = new Set(flashcardsRef.current.map(f => f.pergunta.toLowerCase().trim()));
        const deduped = generated.filter(f => !existing.has(f.pergunta.toLowerCase().trim()));
        if (deduped.length > 0) {
          setFlashcards(prev => [...deduped, ...prev]);
          addTimelineEvent('Geração Inteligente 🧠', `Sintetizou com Gemini IA ${deduped.length} flashcards personalizados de memorização ativa sobre "${subjectName}"!`, 'estudo', '🔮');
          addUndoAction(`Desfazer geração de ${deduped.length} flashcards`, () => setFlashcards(prev => prev.filter(f => !deduped.some(g => g.id === f.id))));
          showToast(`🎉 Concluído! Sintetizados ${deduped.length} flashcards com o Gemini!`, 'success');
        } else {
          showToast('Os flashcards gerados pela IA para este assunto já estão no seu deck.', 'info');
        }
      } else {
        showToast('O Gemini não conseguiu estruturar cartões úteis para este assunto no momento.', 'warning');
      }
    } catch (err: any) {
      console.error(err);
      showToast('A conexão do Gemini IA falhou. Certifique-se de configurar GEMINI_API_KEY corretamente.', 'error');
    } finally {
      setFcGenerating(false);
    }
  };

  const handleExplainFlashcard = async (fc: Flashcard) => {
    if (explainingCardId !== null) return;
    setExplainingCardId(fc.id);
    showToast('🧠 Consultando o Gemini para explicar este conceito em detalhes...', 'info');
    try {
      const response = await fetch(`${API_BASE}/api/gemini/explain-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: fc.pergunta, resposta: fc.resposta, assunto: fc.assunto })
      });
      if (!response.ok) throw new Error('Sem resposta da IA.');
      const data = await response.json();
      if (data.explanation) setActiveExplanation(data.explanation);
      else showToast('Não foi possível obter uma explicação detalhada no momento.', 'warning');
    } catch (err: any) {
      console.error(err);
      showToast('Falha na comunicação com o Gemini. Tente novamente.', 'error');
    } finally {
      setExplainingCardId(null);
    }
  };

  const handleFlashcardRecall = (id: number, correct: boolean) => {
    audioSynth.playClick();
    setReviewedThisSession(prev => [...prev, id]);
    setFlashcards(prev => prev.map(fc => {
      if (fc.id === id) {
        let newInterval = fc.intervaloDias;
        let newSeq = fc.sequenciaAcertos;
        if (correct) {
          newSeq += 1;
          newInterval = Math.round(fc.intervaloDias * 2);
          if (newInterval > 90) newInterval = 90;
        } else {
          newSeq = 0;
          newInterval = 1;
        }
        return { ...fc, sequenciaAcertos: newSeq, intervaloDias: newInterval, proximaData: addDays(getTodayDate(), newInterval) };
      }
      return fc;
    }));

    if (correct) {
      setGardenSettings(prev => ({ ...prev, focusPoints: prev.focusPoints + 15, waterReserve: prev.waterReserve + (Math.random() > 0.6 ? 1 : 0) }));
      triggerUnlockAchievement('5');
      showToast('Resposta correta! Seu recall ativo fortaleceu sua retenção! (+15 XP, +1 sequência de acertos)', 'success');
    } else {
      showToast('Recall falhou! Cartão reagendado para revisão amanhã. Continue firme!', 'info');
    }
    setFcActiveId(null);
    setFcFlipped(false);
  };

  // ── Exporters ───────────────────────────────────────────────────────────────

  const handleExportMarkdown = (nota: Anotacao) => {
    const mdContent = `# ${nota.titulo}\n\n**Assunto:** ${nota.assunto}\n**Data:** ${nota.data}\n**Caracteres:** ${nota.caracteres}\n\n---\n\n${nota.conteudo}\n\n---\n*Gerado pelo CultivaMente - Seu Bloco de Notas Gamificado*\n`;
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${nota.titulo.toLowerCase().replace(/[^a-z0-9]/g, '_')}_insight.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Anotação exportada com sucesso como Markdown! 📝', 'success');
  };

  const handlePrintPDF = (nota: Anotacao) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { showToast('Por favor, permita que pop-ups apareçam para exportar PDF.', 'warning'); return; }
    const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const htmlContent = `
      <html>
        <head>
          <title>${escapeHtml(nota.titulo)}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h1 { font-size: 28px; border-bottom: 2px solid #0e9f6e; padding-bottom: 10px; margin-bottom: 5px; color: #027a48; text-transform: capitalize; }
            .meta { font-size: 13px; color: #666; margin-bottom: 30px; font-style: italic; }
            .content { font-size: 15px; text-align: justify; white-space: pre-wrap; }
            .footer { margin-top: 50px; border-top: 1px dashed #ccc; padding-top: 15px; font-size: 11px; color: #999; text-align: center; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(nota.titulo)}</h1>
          <div class="meta">Tópico: ${escapeHtml(nota.assunto)} | Registrado em: ${nota.data} | Comprimento: ${nota.caracteres} caracteres</div>
          <div class="content">${escapeHtml(nota.conteudo)}</div>
          <p class="footer">Documento Oficial sintetizado ativamente no CultivaMente.</p>
          <script>setTimeout(() => window.print(), 500);</script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showToast('Layout de impressão do PDF aberto! Pressione Ctrl+P ou execute a impressão na janela. 🖨️', 'info');
  };

  // ── Garden / Trees ───────────────────────────────────────────────────────────

  const handleModifyTree = (modifiedTree: Tree) => {
    setPlantedTrees(prev => prev.map(t => t.id === modifiedTree.id ? modifiedTree : t));
    setSelectedTreeForNurture(modifiedTree);
  };

  const handleModifySettings = (modifiedSettings: GardenSettings) => {
    setGardenSettings(modifiedSettings);
  };

  const handleDitchTree = (treeId: number) => {
    setPlantedTrees(prev => prev.filter(t => t.id !== treeId));
  };

  // ── Backup ───────────────────────────────────────────────────────────────────

  const getBackupPayload = () => ({
    questoes: localStorage.getItem('questoes'),
    revisoes: localStorage.getItem('revisoes'),
    leituras: localStorage.getItem('leituras'),
    materias: localStorage.getItem('materias'),
    sessoesEstudo: localStorage.getItem('sessoesEstudo'),
    plantedTrees: localStorage.getItem('plantedTrees'),
    streakData: localStorage.getItem('streakData'),
    gardenSettings: localStorage.getItem('gardenSettings'),
    estufaFotos: localStorage.getItem('estufaFotos'),
    metas: localStorage.getItem('metas'),
    anotacoes: localStorage.getItem('anotacoes'),
    flashcards: localStorage.getItem('flashcards'),
    achievements: localStorage.getItem('achievements'),
    timelineEvents: localStorage.getItem('timelineEvents'),
    gardenEvent: localStorage.getItem('gardenEvent'),
    darkMode: JSON.stringify(darkMode),
  });

  const handleExportBackup = () => {
    try {
      const fileData = JSON.stringify({ app: "CultivaMente", version: "1.2.0", timestamp: new Date().toISOString(), payload: getBackupPayload() }, null, 2);
      const blob = new Blob([fileData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cultivamente-backup-${getTodayDate()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("📥 Backup baixado com sucesso! Guarde este arquivo.", "success");
    } catch (err: any) {
      showToast("Ocorreu um erro ao exportar o backup: " + err.message, "error");
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.app !== "CultivaMente" || !data.payload) throw new Error("Formato de backup inválido. Certifique-se de que é um arquivo gerado pelo CultivaMente.");
        setConfirmModal({
          title: "Importar Backup",
          message: "Esta importação substituirá PERMANENTEMENTE todos os seus dados atuais (bioma, árvores, flashcards, revisões, registros). Deseja continuar?",
          isIrreversible: true,
          onConfirm: () => {
            Object.keys(data.payload).forEach((key) => { if (data.payload[key] !== null) localStorage.setItem(key, data.payload[key]); });
            showToast("📤 Backup carregado com sucesso! Atualizando aplicativo...", "success");
            setTimeout(() => window.location.reload(), 1500);
          }
        });
      } catch (err: any) {
        showToast("Falha na importação: " + err.message, "error");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAutoBackup = () => {
    if (!gardenSettingsRef.current.autoBackupEnabled) return;
    try {
      localStorage.setItem('cultivamente_auto_backup', JSON.stringify({ app: "CultivaMente", version: "1.2.0", timestamp: new Date().toISOString(), payload: getBackupPayload() }));
    } catch (e) {
      console.error('Falha ao realizar backup automático', e);
    }
  };

  const handleRestoreAutoBackup = () => {
    try {
      const raw = localStorage.getItem('cultivamente_auto_backup');
      if (!raw) { showToast("Nenhum backup automático encontrado no LocalStorage.", "warning"); return; }
      const data = JSON.parse(raw);
      if (data.app !== "CultivaMente" || !data.payload) throw new Error("Formato de backup inválido.");
      setConfirmModal({
        title: "Restaurar Backup Automático",
        message: `Deseja restaurar a cópia de segurança automática salva em ${new Date(data.timestamp).toLocaleString()}? Isso substituirá todos os seus dados atuais locais.`,
        isIrreversible: true,
        onConfirm: () => {
          Object.keys(data.payload).forEach((key) => { if (data.payload[key] !== null) localStorage.setItem(key, data.payload[key]); });
          showToast("🔄 Backup automático restaurado com sucesso! Atualizando...", "success");
          setTimeout(() => window.location.reload(), 1500);
        }
      });
    } catch (err: any) {
      showToast("Falha ao restaurar auto-backup: " + err.message, "error");
    }
  };

  // ── Leituras ─────────────────────────────────────────────────────────────────

  const handleAddLeitura = (titulo: string, tipo: Leitura['tipo'], paginas: number, assunto: string, data: string, categoriaFilme: string) => {
    const oldLeituras = [...leiturasRef.current];
    const oldGardenSettings = { ...gardenSettingsRef.current };
    let dynamicPages = paginas;
    let earnedXP = 30, earnedWater = 1, earnedFertilizer = 0;

    if (tipo === 'Artigo') {
      if (!dynamicPages) dynamicPages = 20;
      earnedXP = Math.floor(30 + dynamicPages * 1.5);
      earnedWater = Math.max(1, Math.floor(dynamicPages / 7));
      earnedFertilizer = Math.max(0, Math.floor(dynamicPages / 20));
    } else if (tipo === 'Livro') {
      if (!dynamicPages) dynamicPages = 280;
      earnedXP = Math.floor(100 + dynamicPages * 0.5);
      earnedWater = Math.max(2, Math.floor(dynamicPages / 35));
      earnedFertilizer = Math.max(1, Math.floor(dynamicPages / 90));
    } else if (tipo === 'Filme') {
      if (!dynamicPages) dynamicPages = 120;
      let categoryBonus = 0;
      if (categoriaFilme === 'Filme mudo (pré-década de 1930)') categoryBonus = 40;
      else if (categoriaFilme === 'Filme de autor (cinema de arte) - ex: Bergman, Tarkovsky') categoryBonus = 35;
      else if (categoriaFilme === 'Filme experimental / vanguardista') categoryBonus = 30;
      else if (categoriaFilme === 'Cinema direto / documentário observacional') categoryBonus = 25;
      else if (categoriaFilme === 'Documentário científico, cinebiografia ou histórico') categoryBonus = 20;
      earnedXP = Math.floor(25 + dynamicPages * 0.2 + categoryBonus);
      earnedWater = Math.max(1, Math.floor(dynamicPages / 60) + (categoryBonus > 0 ? 1 : 0));
      earnedFertilizer = categoryBonus >= 25 ? 1 : 0;
    } else if (tipo === 'Podcast') {
      if (!dynamicPages) dynamicPages = 30;
      earnedXP = Math.max(15, Math.floor(15 + dynamicPages * 0.6));
      earnedWater = Math.max(1, Math.floor(dynamicPages / 35));
      earnedFertilizer = Math.max(0, Math.floor(dynamicPages / 70));
    } else if (tipo === 'Escrita Artigo') {
      if (!dynamicPages) dynamicPages = 15;
      earnedXP = Math.floor(180 + dynamicPages * 5);
      earnedWater = Math.max(4, Math.floor(dynamicPages / 3));
      earnedFertilizer = Math.max(2, Math.floor(dynamicPages / 6));
    } else if (tipo === 'TCC') {
      if (!dynamicPages) dynamicPages = 40;
      earnedXP = Math.floor(300 + dynamicPages * 6);
      earnedWater = Math.max(6, Math.floor(dynamicPages / 4));
      earnedFertilizer = Math.max(3, Math.floor(dynamicPages / 10));
    } else if (tipo === 'Resumo') {
      if (!dynamicPages) dynamicPages = 3;
      earnedXP = Math.floor(40 + dynamicPages * 4);
      earnedWater = Math.max(1, Math.floor(dynamicPages / 2));
      earnedFertilizer = Math.max(0, Math.floor(dynamicPages / 5));
    } else if (tipo === 'Redação') {
      if (!dynamicPages) dynamicPages = 2;
      earnedXP = Math.floor(90 + dynamicPages * 6);
      earnedWater = Math.max(2, Math.floor(dynamicPages * 1.5));
      earnedFertilizer = Math.max(1, Math.floor(dynamicPages / 2));
    } else if (tipo === 'Reportagem') {
      if (!dynamicPages) dynamicPages = 5;
      earnedXP = Math.floor(120 + dynamicPages * 4);
      earnedWater = Math.max(3, Math.floor(dynamicPages / 2));
      earnedFertilizer = Math.max(1, Math.floor(dynamicPages / 4));
    } else if (tipo === 'Mídia Social') {
      if (!dynamicPages) dynamicPages = 1;
      earnedXP = Math.floor(30 + dynamicPages * 6);
      earnedWater = Math.max(1, Math.floor(dynamicPages));
      earnedFertilizer = 0;
    } else {
      if (!dynamicPages) dynamicPages = 8;
      earnedXP = 30; earnedWater = 1; earnedFertilizer = 0;
    }

    const newRead: Leitura = {
      id: generateUniqueNumericId(),
      titulo,
      assunto: assunto || 'Estudos Gerais',
      tipo,
      paginas: dynamicPages,
      data,
      categoriaFilme: tipo === 'Filme' ? categoriaFilme : undefined
    };
    setLeituras(prev => [newRead, ...prev]);
    registerProgress('leituras', 1);

    if (tipo === 'Livro') audioSynth.playReadBook();
    else if (tipo === 'Artigo') audioSynth.playReadArticle();
    else if (tipo === 'Filme') audioSynth.playFocusRain();
    else if (tipo === 'Podcast') audioSynth.playReadArticle();
    else audioSynth.playReadShort();

    setGardenSettings(prev => ({ ...prev, focusPoints: prev.focusPoints + earnedXP, waterReserve: prev.waterReserve + earnedWater, fertilizerReserve: prev.fertilizerReserve + earnedFertilizer }));
    triggerUnlockAchievement('6');
    addTimelineEvent('Consumo de Conhecimento 📚', `Registrou leitura (${tipo}): "${titulo}" sobre "${assunto || 'Geral'}"!`, 'estudo', '📚');
    addUndoAction(`Adicionar leitura de ${tipo}`, () => { setLeituras(oldLeituras); setGardenSettings(oldGardenSettings); });
    showToast(`Parabéns! Registro de ${tipo} concluído. Recompensa conquistada: +${earnedXP} XP, +${earnedWater} 💧 e +${earnedFertilizer} 🍂`, 'success');
  };

  const handleRemoveLeitura = (id: number) => {
    const old = [...leiturasRef.current];
    setConfirmModal({
      title: "Excluir Registro de Leitura",
      message: "Tem certeza de que deseja excluir permanentemente este registro de leitura de suas estatísticas?",
      onConfirm: () => {
        setLeituras(prev => prev.filter(l => l.id !== id));
        addUndoAction(`Remover leitura`, () => setLeituras(old));
      }
    });
  };

  // ── Computed ─────────────────────────────────────────────────────────────────

  const getSubjectSuggestions = () => {
    const list = new Set<string>();
    questoes.forEach(q => list.add(q.assunto));
    revisoes.forEach(r => list.add(r.conteudo));
    leituras.forEach(l => list.add(l.assunto));
    materias.forEach(m => { list.add(m.nome); m.conteudos.forEach(c => list.add(c.nome)); });
    return Array.from(list).filter(Boolean);
  };

  const conIsFilteringActive = conSearchQuery.trim() !== '' || conFilterMateriaId !== 'all' || conFilterDateStart !== '' || conFilterDateEnd !== '';
  const conIsDateRangeInvalid = !!(conFilterDateStart && conFilterDateEnd && conFilterDateEnd < conFilterDateStart);

  const filteredMaterias = useMemo(() => {
    return materias.map(m => {
      if (conFilterMateriaId !== 'all' && m.id !== conFilterMateriaId) return null;
      const filteredContents = m.conteudos.filter(c => {
        const query = conSearchQuery.toLowerCase().trim();
        const matchesSearch = !query || c.nome.toLowerCase().includes(query) || m.nome.toLowerCase().includes(query);
        const matchesStart = !conFilterDateStart || c.data >= conFilterDateStart;
        const matchesEnd = !conFilterDateEnd || c.data <= conFilterDateEnd;
        return matchesSearch && matchesStart && matchesEnd;
      });
      const shouldKeep = filteredContents.length > 0 || (!conIsFilteringActive && m.conteudos.length === 0);
      if (!shouldKeep) return null;
      return { ...m, conteudos: filteredContents };
    }).filter((m): m is Materia => m !== null);
  }, [materias, conSearchQuery, conFilterMateriaId, conFilterDateStart, conFilterDateEnd, conIsFilteringActive]);

  const totalConteudosFiltrados = useMemo(() => filteredMaterias.reduce((acc, m) => acc + m.conteudos.length, 0), [filteredMaterias]);

  return {
    // State
    toasts, setToasts,
    soundEnabled,
    activeTab, setActiveTab,
    darkMode,
    confirmModal, setConfirmModal,
    questoes,
    revisoes,
    leituras,
    materias,
    sessoesEstudo,
    plantedTrees, setPlantedTrees,
    streak,
    gardenSettings, setGardenSettings,
    fotos, setFotos,
    metas, setMetas,
    selectedTreeForNurture, setSelectedTreeForNurture,
    newMateriaNome, setNewMateriaNome,
    newMateriaEmoji, setNewMateriaEmoji,
    selectedMateriaId, setSelectedMateriaId,
    conteudoNome, setConteudoNome,
    conteudoData, setConteudoData,
    anotacoes,
    nTitulo, setNTitulo,
    nConteudo, setNConteudo,
    nAssunto, setNAssunto,
    nNotaAtivaId, setNNotaAtivaId,
    aiGenerating,
    flashcards,
    fcActiveId, setFcActiveId,
    fcFlipped, setFcFlipped,
    fcPergunta, setFcPergunta,
    fcResposta, setFcResposta,
    fcAssunto, setFcAssunto,
    fcDificuldade, setFcDificuldade,
    fcGenerating,
    activeExplanation, setActiveExplanation,
    explainingCardId,
    autoGenerateSubject, setAutoGenerateSubject,
    reviewedThisSession, setReviewedThisSession,
    achievements,
    gardenEvent, setGardenEvent,
    timelineEvents,
    isMetasOpen, setIsMetasOpen,
    historyStack,
    conSearchQuery, setConSearchQuery,
    conFilterMateriaId, setConFilterMateriaId,
    conFilterDateStart, setConFilterDateStart,
    conFilterDateEnd, setConFilterDateEnd,
    // Computed
    conIsFilteringActive,
    conIsDateRangeInvalid,
    filteredMaterias,
    totalConteudosFiltrados,
    // Handlers
    showToast,
    toggleSound,
    toggleDarkMode,
    addUndoAction,
    executeUndo,
    addTimelineEvent,
    triggerUnlockAchievement,
    handleAddConteudo,
    handleRemoveConteudo,
    handleSaveNotes,
    handleMarkRevisaoCompleted,
    handleAddManualRevisao,
    handleRemoveRevisao,
    handleSaveNota,
    handleDeleteNota,
    handleGenerateAIFlashcards,
    handleClaimNotaRecompensas,
    handleCreateNovaNota,
    handleAddQuestoes,
    handleRemoveQuestoesByAssunto,
    handleActiveSessionComplete,
    handleCreateFlashcard,
    handleTriggerAutomatedGeneration,
    handleExplainFlashcard,
    handleFlashcardRecall,
    handleExportMarkdown,
    handlePrintPDF,
    handleModifyTree,
    handleModifySettings,
    handleExportBackup,
    handleImportBackup,
    handleAutoBackup,
    handleRestoreAutoBackup,
    handleDitchTree,
    handleAddLeitura,
    handleRemoveLeitura,
    getSubjectSuggestions,
  };
}
