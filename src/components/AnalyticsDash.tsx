import React, { useState, useEffect, useRef } from 'react';
import { Questao, Tree, SessaoEstudo, StreakData, GardenSettings, Materia, GardenEvent, CultivoTimelineEvent } from '../types';
import { Flame, Clock, Award, Sparkles, AlertCircle, RefreshCw, BarChart2, PieChart as PieChartIcon, Target, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { audioSynth } from '../utils/audio';

interface AnalyticsDashProps {
  questoes: Questao[];
  plantedTrees: Tree[];
  sessoesEstudo: SessaoEstudo[];
  streak: StreakData;
  settings: GardenSettings;
  metas: {
    questoes: number;
    revisoes: number;
    leituras: number;
    tempoMin: number;
    intervalosCiclo?: number[];
  };
  materias: Materia[];
  onUpdateMetas: (newMetas: any) => void;
  gardenEvent?: GardenEvent | null;
  timelineEvents?: CultivoTimelineEvent[];
  onUpdateGardenEvent?: (ev: GardenEvent | null) => void;
  onAddTimelineEvent?: (titulo: string, mensagem: string, tipo: 'colheita' | 'estudo' | 'recompensa', emoji: string) => void;
  onUpdateSettings?: (updater: (prev: GardenSettings) => GardenSettings) => void;
}

const COLORS = ['#10b981', '#8b5cf6', '#3b82f6', '#f43f5e', '#f59e0b', '#0eadf9', '#d946ef', '#64748b'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-2.5 border border-gray-150 dark:border-gray-700 rounded-xl shadow-lg text-xs leading-normal">
        <p className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
          <span>{data.emoji}</span>
          <span>{data.name}</span>
        </p>
        <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
          {data.value} min <span className="text-[10px] text-gray-400 dark:text-gray-500 font-normal">({data.percent}%)</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsDash({
  questoes,
  plantedTrees,
  sessoesEstudo,
  streak,
  settings,
  metas,
  materias,
  onUpdateMetas,
  gardenEvent = null,
  timelineEvents = [],
  onUpdateGardenEvent,
  onAddTimelineEvent,
  onUpdateSettings
}: AnalyticsDashProps) {
  const [dashboardToast, setDashboardToast] = useState<{ message: string; type: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTempo, setModalTempo] = useState(metas.tempoMin);
  const [modalQuestoes, setModalQuestoes] = useState(metas.questoes);
  const [modalRevisoes, setModalRevisoes] = useState(metas.revisoes);
  const [modalLeituras, setModalLeituras] = useState(metas.leituras);

  // Gamificação e Comemorações de 100% de Metas Diárias
  const [congratsMessage, setCongratsMessage] = useState<string | null>(null);
  const [celebrationParticles, setCelebrationParticles] = useState<{ id: number; x: string; y: string; char: string; rX: number; rY: number; rot: number; rotDirection: number }[]>([]);
  const [cardBursts, setCardBursts] = useState<{ id: number; x: number; y: number; char: string; destX: number; destY: number }[]>([]);

  // Victory Sound Fanfare
  const playVictoryFanfare = () => {
    audioSynth.playAncientEvolution();
  };

  // Full Screen Confetti Trigger
  const triggerScreenConfetti = () => {
    const chars = ['✨', '🎉', '⭐', '🏆', '🔥', '🌱', '💪', '🌸', '👑', '🌈', '🤩', '🎓'];
    const newParticles = Array.from({ length: 45 }).map((_, i) => {
      const randAngle = Math.random() * Math.PI * 2;
      return {
        id: Math.random() + Date.now() + i,
        x: `${Math.random() * 60 + 20}%`,
        y: `${Math.random() * 40 + 30}%`,
        char: chars[Math.floor(Math.random() * chars.length)],
        rX: Math.cos(randAngle) * (Math.random() * 140 + 60),
        rY: Math.sin(randAngle) * (Math.random() * 140 + 60) - 80, // pull up
        rot: Math.random() * 360,
        rotDirection: Math.random() > 0.5 ? 1 : -1
      };
    });
    setCelebrationParticles(prev => [...prev, ...newParticles]);
    playVictoryFanfare();
  };

  // Click Trigger Card Particles Burst
  const triggerCardConfetti = (e: React.MouseEvent<HTMLDivElement>, mainChar: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const chars = [mainChar, '✨', '⭐', '🎉', '🔥', '🏆'];

    const newParticles = Array.from({ length: 14 }).map((_, i) => {
      const angle = (i / 14) * 2 * Math.PI + (Math.random() * 0.3 - 0.15);
      const distance = Math.random() * 70 + 40;
      return {
        id: Math.random() + Date.now() + i,
        x: clickX,
        y: clickY,
        char: chars[Math.floor(Math.random() * chars.length)],
        destX: clickX + Math.cos(angle) * distance,
        destY: clickY + Math.sin(angle) * distance - 25
      };
    });

    setCardBursts(prev => [...prev, ...newParticles]);
    // Gently play single beep for feedback
    audioSynth.playClick();
  };

  const prevCompletions = useRef<{
    tempo: boolean;
    questoes: boolean;
    revisoes: boolean;
    leituras: boolean;
    all: boolean;
    initialized: boolean;
  }>({
    tempo: false,
    questoes: false,
    revisoes: false,
    leituras: false,
    all: false,
    initialized: false
  });

  const handleOpenModal = () => {
    setModalTempo(metas.tempoMin);
    setModalQuestoes(metas.questoes);
    setModalRevisoes(metas.revisoes);
    setModalLeituras(metas.leituras);
    setIsModalOpen(true);
  };

  const applyPreset = (tempo: number, quest: number, rev: number, leit: number) => {
    setModalTempo(tempo);
    setModalQuestoes(quest);
    setModalRevisoes(rev);
    setModalLeituras(leit);
  };

  const handleSaveModal = () => {
    onUpdateMetas({
      ...metas,
      tempoMin: modalTempo,
      questoes: modalQuestoes,
      revisoes: modalRevisoes,
      leituras: modalLeituras
    });
    setIsModalOpen(false);
  };

  
  const totalQuestions = questoes.reduce((s, q) => s + q.total, 0);
  const correctQuestions = questoes.reduce((s, q) => s + q.acertos, 0);
  const correctPercentage = totalQuestions > 0 ? ((correctQuestions / totalQuestions) * 100).toFixed(1) : '0';

  const totalStudyMinutes = sessoesEstudo.reduce((s, se) => s + se.duracaoMin, 0);

  // Math for the weekly study tracker (Seg - Dom)
  const getWeeklySessonsData = () => {
    const today = new Date();
    const dayOfWeek = (today.getDay() + 6) % 7; // Seg = 0, Dom = 6
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);

    const values = Array(7).fill(0);
    sessoesEstudo.forEach(s => {
      try {
        const d = new Date(s.data + 'T00:00:00');
        if (d >= monday && d <= today) {
          const diffDays = Math.floor((d.getTime() - monday.getTime()) / (1000 * 3600 * 24));
          if (diffDays >= 0 && diffDays < 7) {
            values[diffDays] += s.duracaoMin;
          }
        }
      } catch (e) {}
    });
    return values;
  };

  const weeklyData = getWeeklySessonsData();
  const maxWeeklyValue = Math.max(...weeklyData, 30); // scale bar height relative to maximum, or at least 30 mins
  const weekdaysLabel = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  // Subject hours breakdown
  const getSubjectBreakdown = () => {
    const map: Record<string, number> = {};
    sessoesEstudo.forEach(s => {
      map[s.assunto] = (map[s.assunto] || 0) + s.duracaoMin;
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const topSubjects = getSubjectBreakdown();

  // Pie chart calculation for Materia distribution
  const getMateriaTimeDistribution = () => {
    const distribution: Record<number, { name: string; emoji: string; value: number }> = {};
    let outrosValue = 0;

    sessoesEstudo.forEach(session => {
      const duration = session.duracaoMin;
      const lowerAssunto = session.assunto.toLowerCase().trim();

      const matchedMateria = (materias || []).find(m => {
        // Direct match with Materia name
        if (m.nome.toLowerCase().trim() === lowerAssunto) return true;
        // Direct match with any Content name
        const hasContent = m.conteudos?.some(c => c.nome.toLowerCase().trim() === lowerAssunto);
        if (hasContent) return true;
        // Partial matches
        const lowerM = m.nome.toLowerCase().trim();
        if (lowerAssunto.includes(lowerM) || lowerM.includes(lowerAssunto)) return true;

        const partialContent = m.conteudos?.some(c => {
          const lowerC = c.nome.toLowerCase().trim();
          return lowerAssunto.includes(lowerC) || lowerC.includes(lowerAssunto);
        });
        return partialContent;
      });

      if (matchedMateria) {
        if (!distribution[matchedMateria.id]) {
          distribution[matchedMateria.id] = {
            name: matchedMateria.nome,
            emoji: matchedMateria.emoji,
            value: 0
          };
        }
        distribution[matchedMateria.id].value += duration;
      } else {
        outrosValue += duration;
      }
    });

    const data = Object.values(distribution).map(item => ({
      ...item,
      percent: 0
    }));

    if (outrosValue > 0) {
      data.push({
        name: 'Geral / Outros',
        emoji: '🌿',
        value: outrosValue,
        percent: 0
      });
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return data.map(item => ({
      ...item,
      percent: total > 0 ? parseFloat(((item.value / total) * 100).toFixed(1)) : 0
    })).sort((a, b) => b.value - a.value);
  };

  const materiaData = getMateriaTimeDistribution();

  // Progresso Diário e Metas
  const todayTime = streak.todayCounts?.tempoMin || 0;
  const targetTime = metas.tempoMin || 0;
  const timeProgress = targetTime > 0 ? Math.min((todayTime / targetTime) * 105, 100) : 100; // soft cap
  const timeRemaining = targetTime > 0 ? Math.max(targetTime - todayTime, 0) : 0;

  const todayQuestions = streak.todayCounts?.questoes || 0;
  const targetQuestions = metas.questoes || 0;
  const questionsProgress = targetQuestions > 0 ? Math.min((todayQuestions / targetQuestions) * 100, 100) : 100;
  const questionsRemaining = targetQuestions > 0 ? Math.max(targetQuestions - todayQuestions, 0) : 0;

  const todayReviews = streak.todayCounts?.revisoes || 0;
  const targetReviews = metas.revisoes || 0;
  const reviewsProgress = targetReviews > 0 ? Math.min((todayReviews / targetReviews) * 100, 100) : 100;
  const reviewsRemaining = targetReviews > 0 ? Math.max(targetReviews - todayReviews, 0) : 0;

  const todayReadings = streak.todayCounts?.leituras || 0;
  const targetReadings = metas.leituras || 0;
  const readingsProgress = targetReadings > 0 ? Math.min((todayReadings / targetReadings) * 100, 100) : 100;
  const readingsRemaining = targetReadings > 0 ? Math.max(targetReadings - todayReadings, 0) : 0;

  // Global weighted percentage across active target metrics
  const activeMetasCount = [targetTime > 0, targetQuestions > 0, targetReviews > 0, targetReadings > 0].filter(Boolean).length;
  const totalProgressSum = (targetTime > 0 ? (todayTime / targetTime) * 100 : 0) +
                           (targetQuestions > 0 ? (todayQuestions / targetQuestions) * 100 : 0) +
                           (targetReviews > 0 ? (todayReviews / targetReviews) * 100 : 0) +
                           (targetReadings > 0 ? (todayReadings / targetReadings) * 100 : 0);
  
  const rawGlobalProgress = activeMetasCount > 0 ? totalProgressSum / activeMetasCount : 100;
  const globalProgress = Math.min(Math.round(rawGlobalProgress), 100);

  const isAllMetasDone = activeMetasCount > 0 &&
    (targetTime === 0 || todayTime >= targetTime) &&
    (targetQuestions === 0 || todayQuestions >= targetQuestions) &&
    (targetReviews === 0 || todayReviews >= targetReviews) &&
    (targetReadings === 0 || todayReadings >= targetReadings);

  useEffect(() => {
    const isTempoCompleted = targetTime > 0 && todayTime >= targetTime;
    const isQuestoesCompleted = targetQuestions > 0 && todayQuestions >= targetQuestions;
    const isRevisoesCompleted = targetReviews > 0 && todayReviews >= targetReviews;
    const isLeiturasCompleted = targetReadings > 0 && todayReadings >= targetReadings;
    const isAllComp = isAllMetasDone;

    const curCompletions = {
      tempo: isTempoCompleted,
      questoes: isQuestoesCompleted,
      revisoes: isRevisoesCompleted,
      leituras: isLeiturasCompleted,
      all: isAllComp
    };

    if (!prevCompletions.current.initialized) {
      prevCompletions.current = {
        ...curCompletions,
        initialized: true
      };
      return;
    }

    let message = '';
    if (curCompletions.all && !prevCompletions.current.all) {
      message = '🏆 ESPETACULAR! Todas as suas metas diárias foram batidas! Seu jardim e seu conhecimento estão florescendo hoje! ✨🌿';
    } else if (curCompletions.tempo && !prevCompletions.current.tempo) {
      message = '⏱️ Fantástico! Você completou sua meta diária de Tempo de Estudos! (+XP e Orgulho!) 🌿';
    } else if (curCompletions.questoes && !prevCompletions.current.questoes) {
      message = '🏆 Magnífico! Meta diária de Questões Batida! Continue assim! ⭐';
    } else if (curCompletions.revisoes && !prevCompletions.current.revisoes) {
      message = '✨ Perfeito! Você completou todas as Revisões diárias planejadas!';
    } else if (curCompletions.leituras && !prevCompletions.current.leituras) {
      message = '📚 Incrível! Meta diária de Leitura de Conteúdos Finalizada!';
    }

    if (message) {
      setCongratsMessage(message);
      triggerScreenConfetti();
    }

    prevCompletions.current = {
      ...curCompletions,
      initialized: true
    };
  }, [todayTime, targetTime, todayQuestions, targetQuestions, todayReviews, targetReviews, todayReadings, targetReadings, isAllMetasDone]);

  return (
    <div className="space-y-6 relative">
      {/* Gamified Congrats Overlay Toast */}
      <AnimatePresence>
        {dashboardToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md p-4 rounded-2xl shadow-xl border flex items-start gap-3 font-sans ${
              dashboardToast.type === 'error' 
                ? 'bg-red-650 text-white border-red-500' 
                : dashboardToast.type === 'warning'
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-emerald-600 text-white border-emerald-500'
            }`}
          >
            <div className="text-xl shrink-0">🍀</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black leading-relaxed">{dashboardToast.message}</p>
            </div>
            <button 
              type="button"
              onClick={() => setDashboardToast(null)}
              className="text-white/75 hover:text-white shrink-0 text-xs font-mono font-bold cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}

        {congratsMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm bg-gradient-to-r from-emerald-600 to-teal-650 dark:from-emerald-750 dark:to-teal-750 text-white rounded-2xl p-4 shadow-2xl shadow-emerald-500/20 border border-emerald-400/30 flex items-start gap-3"
          >
            <div className="text-2xl bg-white/20 p-2 rounded-xl shrink-0 leading-none">
              🏆
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <h4 className="font-extrabold text-sm tracking-tight text-white">Objetivo Concluído!</h4>
              <p className="text-xs text-emerald-50/90 leading-relaxed font-semibold">{congratsMessage}</p>
            </div>
            <button 
              onClick={() => setCongratsMessage(null)}
              className="text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-lg shrink-0 transition-colors text-xs font-bold font-mono cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen-Wide Floating Celebration Particles */}
      {celebrationParticles.map(p => (
        <motion.div
          key={p.id}
          className="fixed pointer-events-none select-none text-3xl z-50 font-sans"
          style={{ left: p.x, top: p.y }}
          initial={{ opacity: 1, scale: 0.3, x: 0, y: 0, rotate: 0 }}
          animate={{
            x: p.rX,
            y: p.rY,
            opacity: [1, 1, 0.8, 0],
            scale: [0.3, 1.3, 1.1, 0.4],
            rotate: p.rot + 360 * p.rotDirection
          }}
          transition={{ duration: 1.8, ease: "easeOut" }}
          onAnimationComplete={() => {
            setCelebrationParticles(prev => prev.filter(x => x.id !== p.id));
          }}
        >
          {p.char}
        </motion.div>
      ))}

      {/* Global Meta Progress Topbar */}
      <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-gray-950 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              Metas de Estudos do Dia
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sessões de foco completadas e progresso diário em tempo real
            </p>
          </div>
          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <button
              onClick={handleOpenModal}
              className="text-xs font-bold text-emerald-650 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 hover:text-white dark:hover:text-white hover:bg-emerald-600 dark:hover:bg-emerald-500 border border-emerald-150 dark:border-emerald-900/40 hover:border-emerald-600 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Target className="w-3.5 h-3.5 shrink-0" />
              Ajustar Objetivos
            </button>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-750 px-2.5 py-1 rounded-lg">
              Progresso
            </span>
            <span className={`text-base font-mono font-extrabold px-3 py-1 rounded-xl shadow-xs transition-colors ${
              isAllMetasDone 
                ? 'bg-emerald-500 text-white' 
                : 'bg-emerald-50 dark:bg-emerald-950/25 text-emerald-650 dark:text-emerald-400'
            }`}>
              {activeMetasCount > 0 ? `${globalProgress}%` : 'S/ Meta'}
            </span>
          </div>
        </div>

        {/* Thick progress track */}
        <div className="w-full bg-gray-100 dark:bg-gray-750 h-3.5 rounded-full overflow-hidden relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: activeMetasCount > 0 ? `${globalProgress}%` : '0%' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Checklist of "What is left to reach the daily meta" */}
        {activeMetasCount === 0 ? (
          <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-900/10 p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Nenhuma meta de estudos ativa no momento. Você pode criar novas metas diárias no menu de configurações (ícone de engrenagem ⚙️ no cabeçalho).</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Meta 1: Tempo */}
            {targetTime > 0 && (
              <div 
                onClick={(e) => todayTime >= targetTime && triggerCardConfetti(e, '⏱️')}
                className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden select-none ${
                todayTime >= targetTime 
                  ? 'bg-gradient-to-br from-emerald-55/40 to-teal-55/30 dark:from-emerald-950/25 dark:to-teal-950/15 border-emerald-300 dark:border-emerald-800 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-400/20 cursor-pointer hover:scale-[1.02] active:scale-95' 
                  : 'bg-gray-50/50 dark:bg-gray-850 border-gray-150 dark:border-gray-700/60'
              }`}>
                {/* Local particles */}
                {cardBursts.map(p => (
                  <motion.div
                    key={p.id}
                    className="absolute pointer-events-none select-none text-base z-20 font-sans"
                    initial={{ left: p.x, top: p.y, opacity: 1, scale: 0.5 }}
                    animate={{
                      left: p.destX,
                      top: p.destY,
                      opacity: [1, 1, 0],
                      scale: [0.5, 1.3, 0.7]
                    }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    onAnimationComplete={() => {
                      setCardBursts(prev => prev.filter(x => x.id !== p.id));
                    }}
                  >
                    {p.char}
                  </motion.div>
                ))}

                <div className="flex items-center justify-between text-xs font-bold mb-1 relative z-10">
                  <span className="text-gray-500 dark:text-gray-450 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-450 animate-pulse" />
                    Tempo Diário
                  </span>
                  {todayTime >= targetTime ? (
                    <motion.span 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
                      className="text-emerald-650 dark:text-emerald-400 font-extrabold shrink-0 text-xs shadow-xs bg-emerald-100/60 dark:bg-emerald-950 px-2 py-0.5 rounded-md"
                    >
                      Completo 🎉 CLIQUE!
                    </motion.span>
                  ) : (
                    <span className="font-mono text-gray-400">{todayTime}/{targetTime}m</span>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 relative z-10">
                  {todayTime >= targetTime ? (
                    'Sensacional! Meta atingida com sucesso!'
                  ) : (
                    <>Faltam <b className="text-emerald-600 font-mono">{timeRemaining}</b> minutos</>
                  )}
                </p>
              </div>
            )}

            {/* Meta 2: Questoes */}
            {targetQuestions > 0 && (
              <div 
                onClick={(e) => todayQuestions >= targetQuestions && triggerCardConfetti(e, '🏆')}
                className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden select-none ${
                todayQuestions >= targetQuestions 
                  ? 'bg-gradient-to-br from-blue-55/40 to-cyan-55/30 dark:from-blue-950/25 dark:to-cyan-950/15 border-blue-300 dark:border-blue-800 shadow-md shadow-blue-500/5 ring-1 ring-blue-400/20 cursor-pointer hover:scale-[1.02] active:scale-95' 
                  : 'bg-gray-50/50 dark:bg-gray-850 border-gray-150 dark:border-gray-700/60'
              }`}>
                {/* Local particles */}
                {cardBursts.map(p => (
                  <motion.div
                    key={p.id}
                    className="absolute pointer-events-none select-none text-base z-20 font-sans"
                    initial={{ left: p.x, top: p.y, opacity: 1, scale: 0.5 }}
                    animate={{
                      left: p.destX,
                      top: p.destY,
                      opacity: [1, 1, 0],
                      scale: [0.5, 1.3, 0.7]
                    }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    onAnimationComplete={() => {
                      setCardBursts(prev => prev.filter(x => x.id !== p.id));
                    }}
                  >
                    {p.char}
                  </motion.div>
                ))}

                <div className="flex items-center justify-between text-xs font-bold mb-1 relative z-10">
                  <span className="text-gray-500 dark:text-gray-450 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <Award className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                    Questões
                  </span>
                  {todayQuestions >= targetQuestions ? (
                    <motion.span 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
                      className="text-blue-650 dark:text-blue-400 font-extrabold shrink-0 text-xs shadow-xs bg-blue-100/60 dark:bg-blue-950 px-2 py-0.5 rounded-md"
                    >
                      Batida! 🏆 CLIQUE!
                    </motion.span>
                  ) : (
                    <span className="font-mono text-gray-400">{todayQuestions}/{targetQuestions}</span>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 relative z-10">
                  {todayQuestions >= targetQuestions ? (
                    'Magnífico trabalho em questões!'
                  ) : (
                    <>Faltam <b className="text-blue-500 font-mono">{questionsRemaining}</b> questões</>
                  )}
                </p>
              </div>
            )}

            {/* Meta 3: Revisoes */}
            {targetReviews > 0 && (
              <div 
                onClick={(e) => todayReviews >= targetReviews && triggerCardConfetti(e, '✨')}
                className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden select-none ${
                todayReviews >= targetReviews 
                  ? 'bg-gradient-to-br from-teal-55/40 to-emerald-55/30 dark:from-teal-950/25 dark:to-emerald-950/15 border-teal-300 dark:border-teal-800 shadow-md shadow-teal-500/5 ring-1 ring-teal-400/20 cursor-pointer hover:scale-[1.02] active:scale-95' 
                  : 'bg-gray-50/50 dark:bg-gray-850 border-gray-150 dark:border-gray-700/60'
              }`}>
                {/* Local particles */}
                {cardBursts.map(p => (
                  <motion.div
                    key={p.id}
                    className="absolute pointer-events-none select-none text-base z-20 font-sans"
                    initial={{ left: p.x, top: p.y, opacity: 1, scale: 0.5 }}
                    animate={{
                      left: p.destX,
                      top: p.destY,
                      opacity: [1, 1, 0],
                      scale: [0.5, 1.3, 0.7]
                    }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    onAnimationComplete={() => {
                      setCardBursts(prev => prev.filter(x => x.id !== p.id));
                    }}
                  >
                    {p.char}
                  </motion.div>
                ))}

                <div className="flex items-center justify-between text-xs font-bold mb-1 relative z-10">
                  <span className="text-gray-500 dark:text-gray-450 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
                    Revisões
                  </span>
                  {todayReviews >= targetReviews ? (
                    <motion.span 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
                      className="text-teal-650 dark:text-teal-400 font-extrabold shrink-0 text-xs shadow-xs bg-teal-100/60 dark:bg-teal-950 px-2 py-0.5 rounded-md"
                    >
                      Completo! ✨ CLIQUE!
                    </motion.span>
                  ) : (
                    <span className="font-mono text-gray-400">{todayReviews}/{targetReviews}</span>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 relative z-10">
                  {todayReviews >= targetReviews ? (
                    'Revisões do dia concluídas!'
                  ) : (
                    <>Faltam <b className="text-teal-600 font-mono">{reviewsRemaining}</b> revisões</>
                  )}
                </p>
              </div>
            )}

            {/* Meta 4: Leituras */}
            {targetReadings > 0 && (
              <div 
                onClick={(e) => todayReadings >= targetReadings && triggerCardConfetti(e, '📚')}
                className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden select-none ${
                todayReadings >= targetReadings 
                  ? 'bg-gradient-to-br from-indigo-55/40 to-violet-55/30 dark:from-indigo-950/25 dark:to-violet-950/15 border-indigo-300 dark:border-indigo-800 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-400/20 cursor-pointer hover:scale-[1.02] active:scale-95' 
                  : 'bg-gray-50/50 dark:bg-gray-850 border-gray-150 dark:border-gray-700/60'
              }`}>
                {/* Local particles */}
                {cardBursts.map(p => (
                  <motion.div
                    key={p.id}
                    className="absolute pointer-events-none select-none text-base z-20 font-sans"
                    initial={{ left: p.x, top: p.y, opacity: 1, scale: 0.5 }}
                    animate={{
                      left: p.destX,
                      top: p.destY,
                      opacity: [1, 1, 0],
                      scale: [0.5, 1.3, 0.7]
                    }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    onAnimationComplete={() => {
                      setCardBursts(prev => prev.filter(x => x.id !== p.id));
                    }}
                  >
                    {p.char}
                  </motion.div>
                ))}

                <div className="flex items-center justify-between text-xs font-bold mb-1 relative z-10">
                  <span className="text-gray-500 dark:text-gray-450 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                    Leituras
                  </span>
                  {todayReadings >= targetReadings ? (
                    <motion.span 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
                      className="text-indigo-650 dark:text-indigo-400 font-extrabold shrink-0 text-xs shadow-xs bg-indigo-100/60 dark:bg-indigo-950 px-2 py-0.5 rounded-md"
                    >
                      Completo! 📚 CLIQUE!
                    </motion.span>
                  ) : (
                    <span className="font-mono text-gray-400">{todayReadings}/{targetReadings}</span>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 relative z-10">
                  {todayReadings >= targetReadings ? (
                    'Leituras e resumos em dia!'
                  ) : (
                    <>Faltam <b className="text-indigo-600 font-mono">{readingsRemaining}</b> leituras</>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prime Bento-Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Streak Bento */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-36">
          <div className="absolute -right-2 -bottom-2 text-7xl select-none opacity-10 filter blur-xs">🔥</div>
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Disciplina Diária</p>
          <div>
            <span className="text-4xl font-mono font-bold text-amber-600 dark:text-amber-400">
              {streak.currentStreak}
            </span>
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-500 pl-1.5">dias seguidos</span>
          </div>
          <p className="text-[10px] text-amber-500">Mantenha batendo suas metas para aumentar o multiplicador.</p>
        </div>

        {/* Study Hours Bento */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/20 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-36">
          <div className="absolute -right-2 -bottom-2 text-7xl select-none opacity-10 filter blur-xs">⏱️</div>
          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Tempo de Cultivo</p>
          <div>
            <span className="text-4xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {(totalStudyMinutes / 60).toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-500 pl-1.5">horas totais</span>
          </div>
          <p className="text-[10px] text-emerald-500">Cada minuto alimenta o solo para o surgimento de árvores raras.</p>
        </div>

        {/* Questions Bento */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/20 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-36">
          <div className="absolute -right-2 -bottom-2 text-7xl select-none opacity-10 filter blur-xs">📝</div>
          <p className="text-xs font-semibold text-blue-800 dark:text-blue-400 uppercase tracking-widest">Aproveitamento Técnico</p>
          <div>
            <span className="text-4xl font-mono font-bold text-blue-600 dark:text-blue-400">
              {correctPercentage}%
            </span>
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-500 pl-1.5">de acertos</span>
          </div>
          <p className="text-[10px] text-blue-500">{correctQuestions} acertos em {totalQuestions} questões resolvidas.</p>
        </div>

        {/* Total Garden forest */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-100 dark:border-purple-900/20 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between h-36">
          <div className="absolute -right-2 -bottom-2 text-7xl select-none opacity-10 filter blur-xs">🌲</div>
          <p className="text-xs font-semibold text-purple-800 dark:text-purple-400 uppercase tracking-widest">Floresta Virtual</p>
          <div>
            <span className="text-4xl font-mono font-bold text-purple-600 dark:text-purple-400">
              {plantedTrees.length}
            </span>
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-500 pl-1.5">unidades</span>
          </div>
          <p className="text-[10px] text-purple-500">Unidades distribuídas em biomas e plots ecológicos.</p>
        </div>

      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Weekly study minutes column chart */}
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-emerald-500" />
              Cronograma Semanal de Foco (minutos)
            </h3>

            <div className="flex items-end justify-between h-48 pt-4">
              {weeklyData.map((mins, idx) => {
                const barHeight = Math.max((mins / maxWeeklyValue) * 100, 3); // min height
                return (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    
                    {/* Minutes indicator on hover/solid */}
                    {mins > 0 && (
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/30 mb-2">
                        {mins}m
                      </span>
                    )}

                    {/* Vertical bar */}
                    <div className="w-7 sm:w-10 bg-gray-100 dark:bg-gray-750 rounded-lg overflow-hidden h-32 flex items-end">
                      <motion.div 
                        className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg origin-bottom"
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: barHeight / 100 }}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.05 }}
                        style={{ height: '100%' }}
                      />
                    </div>

                    <span className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-2">{weekdaysLabel[idx]}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-4 italic text-center">
            Métricas sincronizadas com o horário local
          </div>
        </div>

        {/* Piechart Materia distribution */}
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-1.5">
              <PieChartIcon className="w-4 h-4 text-emerald-500" />
              Distribuição por Matéria (%)
            </h3>

            {materiaData.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400 h-48">
                <AlertCircle className="w-8 h-8 opacity-40 mb-2" />
                <p className="text-xs">Nenhum estudo computado para calcular a distribuição ainda.</p>
              </div>
            ) : (
              <div>
                <div className="w-full h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={materiaData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {materiaData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] max-h-24 overflow-y-auto custom-scrollbar">
                  {materiaData.map((item, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                      <span 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="truncate max-w-[80px]" title={item.name}>
                        {item.emoji} {item.name}
                      </span>
                      <span className="font-mono font-bold text-gray-450 dark:text-gray-500 ml-auto shrink-0">
                        {item.percent}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-4 italic text-center">
            Calculado sobre as sessões de foco salvas
          </div>
        </div>

        {/* Subject Rank Lists */}
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-500" />
              Especialidades (Assuntos mais estudados)
            </h3>

            {topSubjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-gray-400 h-48">
                <AlertCircle className="w-8 h-8 opacity-40 mb-2" />
                <p className="text-xs">Nenhum estudo computado para ranquear matérias ainda.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topSubjects.map(([sub, mins], idx) => {
                  const maxMins = topSubjects[0][1];
                  const percentVal = maxMins > 0 ? (mins / maxMins) * 100 : 0;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-gray-700 dark:text-gray-300">
                        <span className="truncate max-w-[145px]" title={sub}>{idx + 1}. {sub}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 shrink-0">{mins}m</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-750 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                          style={{ width: `${percentVal}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-emerald-50/50 dark:bg-emerald-950/15 p-2.5 rounded-xl border border-emerald-100/30 dark:border-emerald-900/10 text-[10px] text-gray-500 dark:text-gray-400 mt-4 leading-normal">
            📚 <b>Dica:</b> Intercale matérias de Exatas e Humanas para aumentar a biodiversidade!
          </div>
        </div>

      </div>

      {/* SEÇÃO MULTIMÍDIA E GAMIFICAÇÃO GERAL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-left">
        
        {/* EVENTOS E PRAGAS DA ESTUFA */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-6 rounded-3xl shadow-sm space-y-4 text-left">
          <div className="space-y-1 text-left">
            <h3 className="text-sm font-extrabold text-gray-950 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
              <span>👾</span> Simulador de Eventos e Pragas
            </h3>
            <p className="text-[11px] text-gray-400">
              Pragas ambientais reduzem a saúde da terra. Dedetize e limpe o estande para ganhar recompensas de FP e bônus ecológicos!
            </p>
          </div>

          {gardenEvent ? (
            <div className={`p-4 rounded-2xl border text-left ${
              gardenEvent.efeitoTipo === 'praga'
                ? 'bg-rose-500/10 border-rose-200 text-rose-900 dark:text-red-300'
                : 'bg-emerald-500/10 border-emerald-250 text-emerald-900 dark:text-emerald-300'
            } space-y-3`}>
              <div className="flex items-start gap-2">
                <span className="text-2xl mt-0.5 inline-block shrink-0">{gardenEvent.efeitoTipo === 'praga' ? '🕷️' : '☀️'}</span>
                <div>
                  <h4 className="text-xs font-black tracking-tight">{gardenEvent.titulo}</h4>
                  <p className="text-[10px] font-semibold opacity-90 leading-snug mt-0.5">{gardenEvent.descricao}</p>
                </div>
              </div>

              <div className="text-[10px] font-bold bg-white/45 dark:bg-black/20 p-2 rounded-lg space-y-1 text-gray-700 dark:text-gray-300">
                <p>⚠️ Consumo / Efeito: {gardenEvent.custoOption ? `Consome ${gardenEvent.custoOption.qtd} 💧` : `Paga +${gardenEvent.recompensaOption?.qtd} FP`}</p>
                <p>⏳ Estado: Ativo na Estufa</p>
              </div>

              {gardenEvent.efeitoTipo === 'praga' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (settings.waterReserve < 1) {
                      setDashboardToast({ message: 'Você precisa de pelo menos 1 drop de Regador 💧 para tratar as pragas!', type: 'warning' });
                      return;
                    }
                    if (onUpdateSettings) {
                      onUpdateSettings(prev => ({
                        ...prev,
                        waterReserve: prev.waterReserve - 1,
                        focusPoints: prev.focusPoints + 35
                      }));
                    }
                    if (onAddTimelineEvent) {
                      onAddTimelineEvent('Solo Dedetizado 🧹', `Esterilizou e tratou o solo contra a ameaça de "${gardenEvent.titulo}"!`, 'colheita', '🧹');
                    }
                    if (onUpdateGardenEvent) {
                      onUpdateGardenEvent(null);
                    }
                    setDashboardToast({ message: 'Praga tratada! Solo esterilizado com sucesso. Recompensa: +35 FP!', type: 'success' });
                    audioSynth.playAncientEvolution();
                  }}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-550 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98 transition-all animate-fade-in"
                >
                  Sanear Solo Com Regador (Consome 1 💧)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (onUpdateSettings) {
                      onUpdateSettings(prev => ({
                        ...prev,
                        focusPoints: prev.focusPoints + 20
                      }));
                    }
                    if (onAddTimelineEvent) {
                      onAddTimelineEvent('Luz Integrada ✨', `Fidelizou e cultivou a radiação abençoada de "${gardenEvent.titulo}"!`, 'colheita', '☀️');
                    }
                    if (onUpdateGardenEvent) {
                      onUpdateGardenEvent(null);
                    }
                    setDashboardToast({ message: 'Evento concluído! Seus conhecimentos absorveram energia renovada, +20 FP!', type: 'success' });
                    audioSynth.playAncientEvolution();
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-555 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer active:scale-98 transition-all animate-fade-in"
                >
                  Absorver Nutrientes do Clima ✨
                </button>
              )}
            </div>
          ) : (
            <div className="p-5 border border-dashed border-gray-150 rounded-2xl text-center text-gray-400">
              <p className="text-xl">☀️</p>
              <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mt-1 font-sans">Atmosfera Estável</p>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">Sem pragas ou tempestades ativas na estufa.</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              const scenarios: GardenEvent[] = [
                {
                  id: "pest-attack-301",
                  titulo: "Praga de Ácaros Vermelhos nos Cactos 🕷️",
                  descricao: "O calor gerou proliferação expressiva de ácaros selvagens. Trate para manter integridade das raízes sagradas.",
                  efeitoTipo: 'praga',
                  custoOption: {
                    recurso: 'agua',
                    qtd: 1,
                    btnTxt: "Saneador de solo"
                  },
                  resolvido: false
                },
                {
                  id: "sol-intenso-302",
                  titulo: "Radiação Climática Estelar 🌠",
                  descricao: "Inflexão cósmica no teto solar da estufa energiza os nutrientes da terra de cultivo.",
                  efeitoTipo: 'sol',
                  recompensaOption: {
                    recurso: 'xp',
                    qtd: 20,
                    btnTxt: "Absorver radiação"
                  },
                  resolvido: false
                }
              ];
              const randomChoice = scenarios[Math.floor(Math.random() * scenarios.length)];
              if (onUpdateGardenEvent) {
                onUpdateGardenEvent(randomChoice);
              }
              if (onAddTimelineEvent) {
                onAddTimelineEvent('Instabilidade Climática 🎲', `A estufa registrou: "${randomChoice.titulo}"!`, 'colheita', '🎲');
              }
              setDashboardToast({ message: `Simulador Ativado: ${randomChoice.titulo}`, type: 'info' });
              audioSynth.playClick();
            }}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-650 dark:text-white font-black text-xs rounded-xl border border-gray-150 dark:border-gray-650 cursor-pointer flex items-center justify-center gap-1.5 text-center mt-2"
          >
            Lançar Evento Simulator 🎲
          </button>
        </div>

        {/* LINHA DO TEMPO ESTÉTICA DE COLETAS E FRUTOS */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-6 rounded-3xl shadow-sm space-y-4 text-left font-sans">
          <div className="space-y-1 text-left">
            <h3 className="text-sm font-extrabold text-gray-950 dark:text-white flex items-center gap-1.5 uppercase tracking-wide">
              <span>🌱</span> Linha do Tempo e Histórico do Cultivo
            </h3>
            <p className="text-[11px] text-gray-400">
              Acompanhe seu progresso de coletas, sementes e hábitos de foco em fluxo cronológico.
            </p>
          </div>

          <div className="relative border-l border-gray-200 dark:border-gray-800 pl-4 ml-2.5 space-y-4 max-h-[220px] overflow-y-auto pr-1 text-left custom-scrollbar">
            {timelineEvents.length === 0 ? (
              <div className="text-center p-4 text-xs text-gray-400">
                Sua linha do tempo está silenciosa. Complete sessões de foco ou regue plantas para escrever seu caminho de dedicação!
              </div>
            ) : (
              timelineEvents.map((ev) => (
                <div key={ev.id} className="relative group text-left text-xs leading-relaxed font-sans">
                  <div className="absolute -left-[24.5px] top-1 w-4 h-4 rounded-full bg-white dark:bg-gray-900 border border-emerald-500 flex items-center justify-center text-[10px] shadow-sm shrink-0">
                    {ev.emoji}
                  </div>
                  <div className="bg-gray-50/50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-100 dark:border-gray-750 text-left font-sans">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-extrabold text-gray-800 dark:text-gray-100">{ev.titulo}</span>
                      <span className="text-[9px] font-mono text-gray-450">{ev.data}</span>
                    </div>
                    <p className="text-gray-550 dark:text-gray-450 text-[11px] leading-snug">{ev.mensagem}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* MODAL: CONFIGURAÇÃO INTERATIVA DE OBJETIVOS DIÁRIOS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden p-6 max-w-lg w-full border border-gray-150 dark:border-gray-800 shadow-2xl space-y-5"
          >
            {/* Header */}
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3 flex justify-between items-start">
              <div>
                <h3 className="text-base font-extrabold text-gray-950 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-500" />
                  Definir Objetivos Diários de Estudo
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Configure metas equilibradas de forma interativa e acompanhe seu progresso!
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets Section */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-400 tracking-wider block">
                ⚡ Perfis de Metas Pré-definidos:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { name: 'Leve 🌿', tempo: 15, quest: 5, rev: 1, leit: 0, desc: 'Ideal para manter o streak ativo rápido', bg: 'hover:bg-emerald-50/20' },
                  { name: 'Focado ⚡', tempo: 60, quest: 15, rev: 3, leit: 1, desc: 'Recomendado para rotina equilibrada', bg: 'hover:bg-blue-50/20' },
                  { name: 'Intenso 🔥', tempo: 120, quest: 30, rev: 6, leit: 2, desc: 'Para alto rendimento e provas', bg: 'hover:bg-rose-50/20' }
                ].map((preset, idx) => {
                  const isMatch = modalTempo === preset.tempo && modalQuestoes === preset.quest && modalRevisoes === preset.rev && modalLeituras === preset.leit;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset.tempo, preset.quest, preset.rev, preset.leit)}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isMatch
                          ? 'border-emerald-500 bg-emerald-50/45 dark:bg-emerald-950/20 shadow-xs'
                          : 'border-gray-150 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-850/10 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">{preset.name}</span>
                        <p className="text-[9px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">{preset.desc}</p>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-extrabold mt-3.5 block shrink-0">
                        {preset.tempo}m • {preset.quest}q • {preset.rev}r
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Metric Sliders */}
            <div className="space-y-3.5 pt-1">
              {/* Tempo de Foco Slider */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-gray-50/30 dark:bg-gray-850/40 border border-gray-150/70 dark:border-gray-800/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-555" />
                    Tempo de Foco
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button"
                      onClick={() => setModalTempo(prev => Math.max(0, prev - 10))}
                      className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-extrabold text-emerald-600 dark:text-emerald-450 min-w-[55px] text-center bg-emerald-50 dark:bg-emerald-950/40 py-0.5 px-1.5 rounded-md border border-emerald-100/30">
                      {modalTempo}m
                    </span>
                    <button 
                      type="button"
                      onClick={() => setModalTempo(prev => prev + 10)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="240"
                  step="5"
                  value={modalTempo}
                  onChange={(e) => setModalTempo(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1 bg-gray-200 dark:bg-gray-750 rounded-lg appearance-none"
                />
              </div>

              {/* Questoes Slider */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-gray-50/30 dark:bg-gray-850/40 border border-gray-150/70 dark:border-gray-800/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-blue-500" />
                    Questões Resolvidas
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button"
                      onClick={() => setModalQuestoes(prev => Math.max(0, prev - 5))}
                      className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-extrabold text-blue-500 min-w-[55px] text-center bg-blue-50 dark:bg-blue-950/40 py-0.5 px-1.5 rounded-md border border-blue-100/30">
                      {modalQuestoes}
                    </span>
                    <button 
                      type="button"
                      onClick={() => setModalQuestoes(prev => prev + 5)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={modalQuestoes}
                  onChange={(e) => setModalQuestoes(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-1 bg-gray-200 dark:bg-gray-750 rounded-lg appearance-none"
                />
              </div>

              {/* Revisoes Slider */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-gray-50/30 dark:bg-gray-850/40 border border-gray-150/70 dark:border-gray-800/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-500" />
                    Revisões Concluídas
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button"
                      onClick={() => setModalRevisoes(prev => Math.max(0, prev - 1))}
                      className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-extrabold text-teal-600 min-w-[55px] text-center bg-teal-50 dark:bg-teal-950/40 py-0.5 px-1.5 rounded-md border border-teal-100/30">
                      {modalRevisoes}
                    </span>
                    <button 
                      type="button"
                      onClick={() => setModalRevisoes(prev => prev + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={modalRevisoes}
                  onChange={(e) => setModalRevisoes(Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer h-1 bg-gray-200 dark:bg-gray-750 rounded-lg appearance-none"
                />
              </div>

              {/* Leituras Slider */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-gray-50/30 dark:bg-gray-850/40 border border-gray-150/70 dark:border-gray-800/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Páginas / Leituras Finalizadas
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button"
                      onClick={() => setModalLeituras(prev => Math.max(0, prev - 1))}
                      className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-extrabold text-indigo-500 min-w-[55px] text-center bg-indigo-50 dark:bg-indigo-950/40 py-0.5 px-1.5 rounded-md border border-indigo-100/30">
                      {modalLeituras}
                    </span>
                    <button 
                      type="button"
                      onClick={() => setModalLeituras(prev => prev + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={modalLeituras}
                  onChange={(e) => setModalLeituras(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1 bg-gray-200 dark:bg-gray-750 rounded-lg appearance-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-205 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1 cursor-pointer"
              >
                Salvar Metas
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
