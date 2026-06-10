import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { PomodoroState, ESPECIO_DATABASE } from '../types';
import { audioSynth } from '../utils/audio';

interface ActiveTimerProps {
  onSessionComplete: (assunto: string, durationMin: number, speciesId?: string) => void;
  suggestedSubjects: string[];
  showToast?: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function ActiveTimer({ onSessionComplete, suggestedSubjects, showToast }: ActiveTimerProps) {
  const onSessionCompleteRef = useRef(onSessionComplete);
  
  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete;
  }, [onSessionComplete]);

  // Timer Mode Toggle: 'pomodoro' | 'cronometro'
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'cronometro'>('pomodoro');
  const [subject, setSubject] = useState('');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string>('');

  const notify = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    if (showToast) {
      showToast(msg, type);
    } else {
      alert(msg);
    }
  };

  // 1. Pomodoro States
  const [pomo, setPomo] = useState<PomodoroState>({
    minutos: 25,
    segundos: 0,
    totalSegundos: 25 * 60,
    running: false,
    ciclosCompletos: 0,
    assunto: '',
    registrar: true,
  });
  const [activePreset, setActivePreset] = useState<number>(25); // 25, 5, 15
  const pomoInterval = useRef<NodeJS.Timeout | null>(null);
  const pomoStartedAt = useRef<number>(0);
  const pomoStartRemaining = useRef<number>(0);

  // 2. Cronômetro States
  const [cronoRunning, setCronoRunning] = useState(false);
  const [cronoSeconds, setCronoSeconds] = useState(0);
  const cronoInterval = useRef<NodeJS.Timeout | null>(null);
  const cronoStartedAt = useRef<number>(0);
  const cronoStartSeconds = useRef<number>(0);

  // Sound and ambient state
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'forest' | 'cafe' | 'white'>('none');
  const audioContext = useRef<AudioContext | null>(null);
  const ambientBufferSource = useRef<AudioBufferSourceNode | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (pomoInterval.current) clearInterval(pomoInterval.current);
      if (cronoInterval.current) clearInterval(cronoInterval.current);
      stopAmbientSound();
    };
  }, []);

  // Sync ambient sound selection
  useEffect(() => {
    if (pomo.running || cronoRunning) {
      playAmbientSound();
    } else {
      stopAmbientSound();
    }
  }, [ambientSound, pomo.running, cronoRunning]);

  // Audio synthethizer loop generator for White / Rain Noise
  const playAmbientSound = async () => {
    stopAmbientSound();
    if (ambientSound === 'none') return;

    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContext.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const bufferSize = ctx.sampleRate * 2; // 2 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      if (ambientSound === 'white') {
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      } else if (ambientSound === 'rain') {
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Pink-ish filter for softer rain sound
          data[i] = (lastOut * 0.95 + white * 0.05);
          lastOut = data[i];
          data[i] *= 4.5; // Gain
        }
      } else if (ambientSound === 'forest') {
        // Low rustling brown noise with occasional chirps
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut * 0.99 + white * 0.01);
          lastOut = data[i];
          data[i] *= 8; // Gain
        }
      } else if (ambientSound === 'cafe') {
        // Low dynamic rumbles mimicking a coffee shop
        for (let i = 0; i < bufferSize; i++) {
          const t = i / ctx.sampleRate;
          data[i] = (Math.sin(2 * Math.PI * 120 * t) * 0.05 + Math.random() * 0.02) * Math.sin(2 * Math.PI * 0.5 * t);
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      // Lowpass Filter for soft relaxation
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = ambientSound === 'cafe' ? 600 : 1200;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.15; // silent ambient sound

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.start();
      ambientBufferSource.current = source;
    } catch (e) {
      // Ignorar erros se AudioContext for bloqueado
    }
  };

  const stopAmbientSound = () => {
    if (ambientBufferSource.current) {
      try {
        ambientBufferSource.current.stop();
      } catch (e) {}
      ambientBufferSource.current = null;
    }
  };

  const triggerBeep = (freq = 800, duration = 300) => {
    if (freq === 520) {
      audioSynth.playPomodoroStart();
    } else if (freq === 980) {
      audioSynth.playPomodoroEnd();
    } else {
      audioSynth.playClick();
    }
  };

  // --- POMODORO IMPLEMENTATION ---
  const handlePresetSelect = (minutes: number) => {
    if (pomo.running) handlePausePomo();
    setActivePreset(minutes);
    setPomo(prev => ({
      ...prev,
      minutos: minutes,
      segundos: 0,
      totalSegundos: minutes * 60,
    }));
  };

  const handleStartPomo = () => {
    if (pomo.running) return;

    triggerBeep(520, 150);
    const currentRemaining = pomo.minutos * 60 + pomo.segundos;
    pomoStartedAt.current = Date.now();
    pomoStartRemaining.current = currentRemaining;

    setPomo(prev => ({ ...prev, running: true }));

    if (pomoInterval.current) clearInterval(pomoInterval.current);

    pomoInterval.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - pomoStartedAt.current) / 1000);
      const remaining = Math.max(0, pomoStartRemaining.current - elapsed);

      if (remaining === 0) {
        clearInterval(pomoInterval.current!);
        triggerBeep(980, 500);

        if (activePreset === 25 || activePreset === 50) {
          const titleSession = subject.trim() || 'Foco Pomodoro';
          onSessionCompleteRef.current(titleSession, activePreset, selectedSpeciesId || undefined);
        } else {
          showToast('🏖️ Seu merecido intervalo terminou! Hora de voltar ao foco!', 'info');
        }

        setPomo(prev => ({
          ...prev,
          minutos: activePreset,
          segundos: 0,
          running: false,
          ciclosCompletos: prev.ciclosCompletos + (activePreset === 25 || activePreset === 50 ? 1 : 0),
        }));
      } else {
        setPomo(prev => {
          if (!prev.running) return prev;
          const mins = Math.floor(remaining / 60);
          const secs = remaining % 60;
          return {
            ...prev,
            minutos: mins,
            segundos: secs,
          };
        });
      }
    }, 250);
  };

  const handlePausePomo = () => {
    if (pomoInterval.current) {
      clearInterval(pomoInterval.current);
      pomoInterval.current = null;
    }
    const elapsed = Math.floor((Date.now() - pomoStartedAt.current) / 1000);
    const remaining = Math.max(0, pomoStartRemaining.current - elapsed);

    setPomo(prev => ({
      ...prev,
      running: false,
      minutos: Math.floor(remaining / 60),
      segundos: remaining % 60,
    }));
    stopAmbientSound();
    triggerBeep(400, 150);
  };

  const handleResetPomo = () => {
    handlePausePomo();
    setPomo(prev => ({
      ...prev,
      minutos: activePreset,
      segundos: 0,
      running: false,
    }));
  };

  // --- CRONÔMETRO IMPLEMENTATION ---
  const handleStartCrono = () => {
    if (cronoRunning) return;

    triggerBeep(520, 150);
    setCronoRunning(true);
    
    cronoStartedAt.current = Date.now();
    cronoStartSeconds.current = cronoSeconds;

    if (cronoInterval.current) clearInterval(cronoInterval.current);

    cronoInterval.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - cronoStartedAt.current) / 1000);
      setCronoSeconds(cronoStartSeconds.current + elapsed);
    }, 250);
  };

  const handlePauseCrono = () => {
    if (cronoInterval.current) {
      clearInterval(cronoInterval.current);
      cronoInterval.current = null;
    }
    setCronoRunning(false);
    stopAmbientSound();
    triggerBeep(400, 150);
  };

  const handleFinishCrono = () => {
    handlePauseCrono();
    if (cronoSeconds < 300) {
      notify('Estude de forma focada por pelo menos 5 minutos para poder salvar esta sessão de estudos!', 'warning');
      setCronoSeconds(0);
      return;
    }

    const durationMin = Math.round((cronoSeconds / 60) * 10) / 10;
    const finalSubject = subject.trim() || 'Estudo Ativo';
    onSessionCompleteRef.current(finalSubject, durationMin, selectedSpeciesId || undefined);

    setCronoSeconds(0);
    setSubject('');
    triggerBeep(980, 500);
  };

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return hrs > 0 
      ? `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // SVG Progress Ring calculations for Pomodoro
  const percentLeft = () => {
    const total = activePreset * 60;
    const current = pomo.minutos * 60 + pomo.segundos;
    return total > 0 ? (current / total) * 100 : 0;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Visual Timer Display Card */}
      <div className="lg:col-span-8 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Ambient Sound Top Selector */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-gray-50 dark:bg-gray-850 p-1 rounded-xl border border-gray-100 dark:border-gray-700/80">
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1.5 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5" />
            Sons:
          </span>
          {([
            { id: 'none', label: 'Silêncio' },
            { id: 'rain', label: 'Chuva 🌧️' },
            { id: 'forest', label: 'Matas 🌳' },
            { id: 'white', label: 'Branco ⚪' },
          ] as const).map(option => (
            <button
              key={option.id}
              onClick={() => setAmbientSound(option.id)}
              className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${
                ambientSound === option.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-700 p-1.5 rounded-2xl select-none">
          <button
            onClick={() => {
              if (cronoRunning || pomo.running) return notify('Pausa o cronômetro ou pomodoro antes de trocar o modo.', 'warning');
              setTimerMode('pomodoro');
            }}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
              timerMode === 'pomodoro'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-150'
            }`}
          >
            ⏱️ Pomodoro
          </button>
          <button
            onClick={() => {
              if (cronoRunning || pomo.running) return notify('Pausa o cronômetro ou pomodoro antes de trocar o modo.', 'warning');
              setTimerMode('cronometro');
            }}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all ${
              timerMode === 'cronometro'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-150'
            }`}
          >
            ⏳ Cronômetro
          </button>
        </div>

        {/* Central Counter Display */}
        <div className="relative w-72 h-72 flex items-center justify-center mb-6">
          <svg className="absolute w-full h-full transform -rotate-90">
            {/* Background track circle */}
            <circle
              cx="144" cy="144" r="120"
              className="stroke-gray-100 dark:stroke-gray-750"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated filling circle with custom dashes */}
            <motion.circle
              cx="144" cy="144" r="120"
              className="stroke-emerald-600 dark:stroke-emerald-500"
              strokeWidth="10"
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={754}
              animate={{
                strokeDashoffset: timerMode === 'pomodoro' 
                  ? 754 - (754 * percentLeft()) / 100 
                  : (cronoRunning ? 0 : 754)
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </svg>

          {/* Central timer text */}
          <div className="z-10 flex flex-col items-center select-none text-center">
            {/* Active Seed species emoji floating above text */}
            {(() => {
              const activeSp = ESPECIO_DATABASE.find(s => s.id === selectedSpeciesId);
              if (activeSp && (pomo.running || cronoRunning)) {
                return (
                  <motion.span 
                    animate={{ scale: [1, 1.25, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="text-4xl mb-3 drop-shadow-md select-none block cursor-help"
                    title={`Cultivando: ${activeSp.nome}`}
                  >
                    {activeSp.emojiSemente}
                  </motion.span>
                );
              }
              return null;
            })()}

            {timerMode === 'pomodoro' ? (
              <>
                <span className="text-5xl font-mono font-bold tracking-tight text-gray-900 dark:text-white mt-1">
                  {String(pomo.minutos).padStart(2, '0')}:{String(pomo.segundos).padStart(2, '0')}
                </span>
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-2 flex items-center gap-1.5 justify-center">
                  {pomo.running ? (
                    <>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                      <span className="text-emerald-600 dark:text-emerald-450">Foco Ativo &bull; {activePreset === 25 ? 'Foco 🔥' : 'Descanso 🌸'}</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span>Pausado / Configurado ({activePreset}m)</span>
                    </>
                  )}
                </span>
              </>
            ) : (
              <>
                <span className="text-5xl font-mono font-bold tracking-tight text-gray-900 dark:text-white mt-1">
                  {formatTime(cronoSeconds)}
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest mt-2 flex items-center gap-1.5 justify-center">
                  {cronoRunning ? (
                    <>
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                      <span className="text-emerald-600 dark:text-emerald-400">Estudando...</span>
                    </>
                  ) : cronoSeconds > 0 ? (
                    <>
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                      <span className="text-amber-500">Pausado</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full"></span>
                      <span className="text-gray-400 dark:text-gray-500">Pronto para Iniciar</span>
                    </>
                  )}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Control Button Actions */}
        <div className="flex items-center gap-4">
          {timerMode === 'pomodoro' ? (
            <>
              {pomo.running ? (
                <button
                  onClick={handlePausePomo}
                  className="w-14 h-14 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95 focus:outline-none"
                >
                  <Pause className="w-6 h-6 fill-current" />
                </button>
              ) : (
                <button
                  onClick={handleStartPomo}
                  className="w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 focus:outline-none"
                >
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                </button>
              )}
              <button
                onClick={handleResetPomo}
                className="w-11 h-11 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center transition-transform active:scale-95 border border-gray-100 dark:border-gray-700 focus:outline-none"
                title="Resetar tempo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {cronoRunning ? (
                <button
                  onClick={handlePauseCrono}
                  className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-2xl flex items-center gap-2 font-bold shadow-sm transition-transform active:scale-95"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  Pausar
                </button>
              ) : (
                <button
                  onClick={handleStartCrono}
                  className="px-6 py-3 bg-emerald-650 hover:bg-emerald-600 text-white rounded-2xl flex items-center gap-2 font-bold shadow-lg transition-transform active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  Reg. Estudo
                </button>
              )}

              {cronoSeconds > 0 && (
                <button
                  onClick={handleFinishCrono}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-md transition-transform active:scale-95"
                >
                  Finalizar & Plantar 🌿
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Side Custom Setting Input Form Panel */}
      <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
        
        {/* Preset configuration */}
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Predefinições de Intervalo</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handlePresetSelect(25)}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                activePreset === 25 && timerMode === 'pomodoro'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-gray-850 hover:bg-gray-50 text-gray-800 dark:text-gray-200 border-gray-100 dark:border-gray-700'
              }`}
            >
              Foco (25m) 🍅
            </button>
            <button
              onClick={() => handlePresetSelect(50)}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                activePreset === 50 && timerMode === 'pomodoro'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-gray-850 hover:bg-gray-50 text-gray-800 dark:text-gray-200 border-gray-100 dark:border-gray-700'
              }`}
            >
              Foco Longo (50m) 🪵
            </button>
            <button
              onClick={() => handlePresetSelect(5)}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                activePreset === 5 && timerMode === 'pomodoro'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-gray-850 hover:bg-gray-50 text-gray-800 dark:text-gray-200 border-gray-100 dark:border-gray-700'
              }`}
            >
              Pausa Curta (5m) 🍃
            </button>
            <button
              onClick={() => handlePresetSelect(15)}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                activePreset === 15 && timerMode === 'pomodoro'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-gray-850 hover:bg-gray-50 text-gray-800 dark:text-gray-200 border-gray-100 dark:border-gray-700'
              }`}
            >
              Pausa Longa (15m) 🏖️
            </button>
          </div>
        </div>

        {/* Subject association */}
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-5 shadow-sm space-y-3">
          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Assunto / Matéria em foco</label>
          
          <input
            type="text"
            placeholder="Ex: Direito Penal, Algoritmos..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            list="subject-presets-list"
          />
          <datalist id="subject-presets-list">
            {suggestedSubjects.map((s, idx) => (
              <option key={idx} value={s} />
            ))}
          </datalist>

          <span className="text-[10px] text-gray-400 dark:text-gray-500 block">
            Vincule um assunto para podermos germinar espécies de árvores correspondentes na floresta de estudos.
          </span>
        </div>

        {/* Seed selection session chamber */}
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl p-5 shadow-sm space-y-3">
          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block flex items-center justify-between">
            <span>Câmara de Germinação 🌰</span>
            {selectedSpeciesId === '' ? (
              <span className="text-[10px] text-emerald-600 bg-emerald-100/65 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">Detecção Inteligente</span>
            ) : (
              <span className="text-[10px] text-purple-650 bg-purple-100/65 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">Espécie Fixada</span>
            )}
          </label>
          
          <div className="grid grid-cols-3 gap-1.5">
            {/* Auto selection bubble option */}
            <button
              onClick={() => setSelectedSpeciesId('')}
              className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                selectedSpeciesId === ''
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'bg-gray-55/60 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-200 border-gray-100 dark:border-gray-700'
              }`}
              title="Inteligência de Metas: seleciona automaticamente baseado no assunto ou tempo de foco"
            >
              <div className="text-sm leading-none mb-1">🤖</div>
              <div className="text-[9px] font-bold overflow-hidden text-ellipsis whitespace-nowrap">Automático</div>
            </button>
            
            {ESPECIO_DATABASE.map(sp => (
              <button
                key={sp.id}
                onClick={() => setSelectedSpeciesId(sp.id)}
                className={`p-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                  selectedSpeciesId === sp.id
                    ? 'bg-emerald-650 border-emerald-600 text-white shadow-xs'
                    : 'bg-gray-55/60 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-200 border-gray-100 dark:border-gray-700'
                }`}
                title={`${sp.nome} (${sp.raridade})\nLore: ${sp.lore}`}
              >
                <div className="text-sm leading-none mb-1">{sp.emojiSemente}</div>
                <div className="text-[9px] font-bold w-full overflow-hidden text-ellipsis whitespace-nowrap">{sp.nome.split(' ')[0]}</div>
              </button>
            ))}
          </div>

          {selectedSpeciesId !== '' && (() => {
            const sp = ESPECIO_DATABASE.find(s => s.id === selectedSpeciesId);
            if (!sp) return null;
            return (
              <div className="text-[10px] bg-emerald-50/20 dark:bg-emerald-950/20 p-2 border border-emerald-100/20 dark:border-emerald-900/10 rounded-xl">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 capitalize">{sp.nome}</span> &bull; 
                <span className="italic ml-1 text-gray-400">Raridade {sp.raridade}</span>
                <p className="mt-1 leading-relaxed text-gray-500 dark:text-gray-400">{sp.descricao}</p>
              </div>
            );
          })()}
        </div>

        {/* Small tips message box */}
        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/40 dark:border-emerald-900/10 rounded-2xl flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-emerald-650 shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-normal">
            <strong>Bônus Ambiental:</strong> Sessões acima de 30 minutos geram sementes incomuns, e sessões acima de 90 minutos germinam uma rara <b className="text-emerald-700 dark:text-emerald-400">Lótus de Fogo</b>!
          </p>
        </div>

      </div>

    </div>
  );
}
