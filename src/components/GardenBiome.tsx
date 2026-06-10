import React, { useState, useEffect, useRef } from 'react';
import { Tree, GardenSettings, ESPECIO_DATABASE, BiomeType, EstufaFoto, CultivoTimelineEvent } from '../types';
import { Sparkles, ShoppingBag, Landmark, Wind, Droplets, Leaf, Camera, ShieldAlert, Sparkle, Heart, Volume2, Trash2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioSynth } from '../utils/audio';

interface GardenBiomeProps {
  plantedTrees: Tree[];
  settings: GardenSettings;
  onModifySettings: (modifiedSettings: GardenSettings) => void;
  onSelectTree: (tree: Tree) => void;
  onDitchTree: (treeId: number) => void;
  onModifyTrees: React.Dispatch<React.SetStateAction<Tree[]>>;
  showToast?: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  fotos?: EstufaFoto[];
  onSaveFoto?: (foto: EstufaFoto) => void;
  onDeleteFoto?: (id: string) => void;
  onAddTimelineEvent?: (titulo: string, mensagem: string, tipo: CultivoTimelineEvent['tipo'], emoji?: string) => void;
}

export default function GardenBiome({
  plantedTrees,
  settings,
  onModifySettings,
  onSelectTree,
  onDitchTree,
  onModifyTrees,
  showToast,
  fotos = [],
  onSaveFoto,
  onDeleteFoto,
  onAddTimelineEvent
}: GardenBiomeProps) {
  const [activeTab, setActiveTab] = useState<'garden' | 'shop' | 'atlas' | 'polaroids'>('garden');
  const [isFocusRaining, setIsFocusRaining] = useState(false);
  const [atlasSpeciesIdx, setAtlasSpeciesIdx] = useState(0);
  const [atlasStage, setAtlasStage] = useState<'seed' | 'sprout' | 'sapling' | 'mature' | 'ancient'>('mature');
  const [activeAudioAmbient, setActiveAudioAmbient] = useState<string | null>(null);

  // Polaroid taking forms
  const [cameraOpen, setCameraOpen] = useState(false);
  const [selectedTreeForCap, setSelectedTreeForCap] = useState<string>('');
  const [captionText, setCaptionText] = useState('');
  const [capTitle, setCapTitle] = useState('');

  // Local synthesis of study piano loop
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioOscillatorsRef = useRef<any[]>([]);
  const audioIntervalRef = useRef<any>(null);

  // Manage ambient sound synthesizer hooks
  useEffect(() => {
    stopAmbientAudio();

    if (activeAudioAmbient === 'study_piano') {
      startStudyPianoLoop();
    } else if (activeAudioAmbient === 'study_rain') {
      startStudyRainLoop();
    } else if (activeAudioAmbient === 'study_fire') {
      startStudyFireLoop();
    }

    return () => {
      stopAmbientAudio();
    };
  }, [activeAudioAmbient]);

  const stopAmbientAudio = () => {
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }
    try {
      audioOscillatorsRef.current.forEach(osc => {
        try { osc.stop(); } catch(e){}
      });
    } catch(e){}
    audioOscillatorsRef.current = [];
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch(e){}
      audioContextRef.current = null;
    }
  };

  const startStudyPianoLoop = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const chords = [
        [261.63, 311.13, 392.00, 466.16], // Cm7
        [196.00, 246.94, 293.66, 349.23], // G7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63]  // Fmaj7
      ];
      let chordIndex = 0;

      const playChord = () => {
        if (!audioContextRef.current) return;
        const now = ctx.currentTime;
        const freqs = chords[chordIndex];
        
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f + (Math.random() * 1.5 - 0.75), now);
          
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.04 - (idx * 0.005), now + 0.6 + Math.random() * 0.3);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 4.0);
          
          osc.start(now);
          osc.stop(now + 4.2);
          audioOscillatorsRef.current.push(osc);
        });

        chordIndex = (chordIndex + 1) % chords.length;
      };

      playChord();
      audioIntervalRef.current = setInterval(playChord, 3800);
    } catch(e) {}
  };

  const startStudyRainLoop = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2.0;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const pSource = ctx.createBufferSource();
      pSource.buffer = buffer;
      pSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(850, ctx.currentTime);
      filter.Q.setValueAtTime(0.8, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.03, ctx.currentTime);

      pSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      pSource.start();
      audioOscillatorsRef.current.push(pSource);
    } catch(e) {}
  };

  const startStudyFireLoop = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gainHum = ctx.createGain();
      osc.connect(gainHum);
      gainHum.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(65, ctx.currentTime);
      gainHum.gain.setValueAtTime(0.05, ctx.currentTime);
      osc.start();
      audioOscillatorsRef.current.push(osc);

      const playCrack = () => {
        if (!audioContextRef.current) return;
        const now = ctx.currentTime;
        const oscS = ctx.createOscillator();
        const gainS = ctx.createGain();
        oscS.connect(gainS);
        gainS.connect(ctx.destination);

        oscS.type = 'triangle';
        oscS.frequency.setValueAtTime(900 + Math.random() * 800, now);
        gainS.gain.setValueAtTime(0.02, now);
        gainS.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        oscS.start(now);
        oscS.stop(now + 0.05);
        audioOscillatorsRef.current.push(oscS);
      };

      audioIntervalRef.current = setInterval(playCrack, 400);
    } catch(e){}
  };

  const simulaInatividadeEstudos = () => {
    onModifyTrees(prev => prev.map(tree => {
      if (tree.phase !== 'ancient' && !tree.withered) {
        return { ...tree, withered: true };
      }
      return tree;
    }));
    notify("⏳ Simulação: Avançamos 48 horas de inatividade de estudos! Pelos termos do Modo Sobrevivência, o solo secou e as plantas murcharam temporariamente (🥀).", "warning");
    
    if (onAddTimelineEvent) {
      onAddTimelineEvent(
        'Inatividade Simulada!',
        'Suas plantações entraram em colapso de secura temporária devido à inércia intelectual fictícia.',
        'evento',
        '🥀'
      );
    }
  };

  const changeSurvivalMode = () => {
    const newVal = !settings.survivalMode;
    onModifySettings({
      ...settings,
      survivalMode: newVal
    });
    notify(`Modo Sobrevivência ${newVal ? '🌻 ATIVADO' : '❌ DESATIVADO'}! ${newVal ? 'Cuidado: 48 horas de inatividade acadêmica murchará sementes e brotos!' : 'As penalidades do solo seco foram temporariamente desligadas.'}`, newVal ? 'success' : 'info');
  };

  const notify = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    if (showToast) {
      showToast(msg, type);
    } else {
      alert(msg);
    }
  };

  const triggerFocusRain = () => {
    if (settings.waterReserve < 15) {
      notify("Você precisa de pelo menos 15 gotas de água (💧) no seu reservatório para conjurar uma Chuva de Foco!", "warning");
      return;
    }

    const growingTrees = plantedTrees.filter(t => t.growthPercent < 100);
    if (growingTrees.length === 0) {
      notify("Todas as árvores do seu ecossistema já estão maduras ou lendárias! Não há sementes ou brotos precisando de água.", "info");
      return;
    }

    // Play ascending relaxing chime sequence
    audioSynth.playFocusRain();

    // Update trees: +5% growth to all currently growing trees
    onModifyTrees(prev => prev.map(tree => {
      if (tree.growthPercent >= 100) return tree;

      const newGrowth = Math.min(tree.growthPercent + 5, 100);
      let newPhase = tree.phase;

      if (newGrowth >= 100) {
        newPhase = 'mature';
      } else if (newGrowth >= 60) {
        newPhase = 'sapling';
      } else if (newGrowth >= 25) {
        newPhase = 'sprout';
      }

      return {
        ...tree,
        growthPercent: newGrowth,
        phase: newPhase,
        waterDroplets: tree.waterDroplets + 1,
      };
    }));

    // Charge 15 water, award 15 FOCUS points as reward!
    onModifySettings({
      ...settings,
      waterReserve: settings.waterReserve - 15,
      focusPoints: settings.focusPoints + 15,
    });

    setIsFocusRaining(true);
    setTimeout(() => {
      setIsFocusRaining(false);
    }, 4500);

    notify("🌧️ Conjurado! Gotas d'água de foco lavam todo o seu jardim, acelerando o crescimento de todos os brotos e sementes em +5% de forma simultânea!", "success");
  };

  const handleBuyBiome = (biome: BiomeType, cost: number) => {
    if (settings.focusPoints < cost) {
      notify('Pontos de Foco insuficientes! Estude mais sessões e faça revisões ou questões para coletar mais pontos de Foco.', 'warning');
      return;
    }
    if (settings.unlockedBiomes.includes(biome)) {
      notify('Você já possui este Bioma comprado.', 'info');
      return;
    }

    const updatedSettings: GardenSettings = {
      ...settings,
      focusPoints: settings.focusPoints - cost,
      unlockedBiomes: [...settings.unlockedBiomes, biome],
      currentBiome: biome, // auto select
    };
    onModifySettings(updatedSettings);
    notify(`🎉 Bioma desbloqueado com sucesso! Divirta-se em seu novo ecossistema!`, "success");
  };

  const handleBuyLandmark = (landmark: string, cost: number, displayName: string) => {
    if (settings.focusPoints < cost) {
      notify('Pontos de Foco insuficientes!', 'warning');
      return;
    }
    if (settings.unlockedLandmarks.includes(landmark)) {
      notify('Você já comprou esse Monumento do Jardim.', 'info');
      return;
    }

    const updatedSettings: GardenSettings = {
      ...settings,
      focusPoints: settings.focusPoints - cost,
      unlockedLandmarks: [...settings.unlockedLandmarks, landmark],
    };
    onModifySettings(updatedSettings);
    notify(`🎉 ${displayName} instalado no seu jardim de estudos! Veja as decorações especiais surgirem.`, "success");
  };

  const handleBuySupplies = (type: 'water' | 'fertilizer', amount: number, cost: number) => {
    if (settings.focusPoints < cost) {
      notify('Pontos de Foco insuficientes!', 'warning');
      return;
    }

    const updatedSettings: GardenSettings = {
      ...settings,
      focusPoints: settings.focusPoints - cost,
      waterReserve: type === 'water' ? settings.waterReserve + amount : settings.waterReserve,
      fertilizerReserve: type === 'fertilizer' ? settings.fertilizerReserve + amount : settings.fertilizerReserve,
    };
    onModifySettings(updatedSettings);
    notify(`🛒 Suprimentos adquiridos! Adicionado +${amount} ao seu reservatório.`, "success");
  };

  const handleSelectBiome = (biome: BiomeType) => {
    if (!settings.unlockedBiomes.includes(biome)) return;
    onModifySettings({
      ...settings,
      currentBiome: biome,
    });
  };

  // Styles definitions for different biomes
  const getBiomeStyles = (biome: BiomeType) => {
    switch (biome) {
      case 'sunny':
        return {
          wrapper: 'bg-gradient-to-b from-sky-300 via-emerald-100 to-emerald-250 dark:from-sky-950 dark:via-emerald-950/40 dark:to-emerald-950',
          soil: 'bg-emerald-600/10 dark:bg-emerald-500/5 border-emerald-500/20',
          title: 'Clareira Ensolarada ☀️',
          particleColor: 'bg-amber-400/40',
          particleEmoji: '🍃',
        };
      case 'sakura':
        return {
          wrapper: 'bg-gradient-to-b from-rose-200 via-rose-50 to-pink-100 dark:from-purple-950/40 dark:via-rose-950/20 dark:to-rose-950',
          soil: 'bg-pink-500/10 dark:bg-pink-500/5 border-pink-400/20',
          title: 'Parque de Sakura 🌸',
          particleColor: 'bg-rose-300/60',
          particleEmoji: '🌸',
        };
      case 'desert':
        return {
          wrapper: 'bg-gradient-to-b from-amber-200 via-orange-50 to-amber-100 dark:from-amber-950/30 dark:via-yellow-950/20 dark:to-orange-950/40',
          soil: 'bg-amber-600/10 dark:bg-amber-500/5 border-amber-500/20',
          title: 'Deserto Místico 🏜️',
          particleColor: 'bg-yellow-300/40',
          particleEmoji: '✨',
        };
      case 'mystic':
        return {
          wrapper: 'bg-gradient-to-b from-indigo-950 via-indigo-900 to-violet-950',
          soil: 'bg-indigo-500/10 border-indigo-500/20',
          title: 'Vale Luminescente ✨',
          particleColor: 'bg-teal-300/60 shadow-[0_0_8px_rgba(45,212,191,0.8)]',
          particleEmoji: '🧚',
        };
      case 'arctic':
        return {
          wrapper: 'bg-gradient-to-b from-sky-100 via-cyan-50 to-blue-100 dark:from-sky-950/70 dark:via-cyan-950/40 dark:to-blue-950',
          soil: 'bg-cyan-500/10 dark:bg-cyan-500/5 border-cyan-400/30',
          title: 'Estufa Glacial Polo Norte ❄️',
          particleColor: 'bg-blue-250/40',
          particleEmoji: '❄️',
        };
      case 'volcanic':
        return {
          wrapper: 'bg-gradient-to-b from-amber-950 via-red-950 to-stone-950',
          soil: 'bg-red-900/15 border-red-500/30',
          title: 'Estufa de Magma Vulcânico 🔥',
          particleColor: 'bg-orange-500/30 shadow-[0_0_4px_rgba(249,115,22,0.6)]',
          particleEmoji: '🔥',
        };
      case 'cosmic':
        return {
          wrapper: 'bg-gradient-to-b from-slate-950 via-purple-950 to-black',
          soil: 'bg-fuchsia-400/10 border-fuchsia-500/20',
          title: 'Estufa Estelar Sideral 🌌',
          particleColor: 'bg-purple-300/70 shadow-[0_0_10px_rgba(168,85,247,0.8)]',
          particleEmoji: '✨',
        };
    }
  };

  const activeStyles = getBiomeStyles(settings.currentBiome);

  const getTreeEmoji = (tree: Tree) => {
    if (tree.withered) return '🥀';
    const species = ESPECIO_DATABASE.find(s => s.id === tree.speciesId);
    if (!species) return '🌳';
    if (tree.phase === 'seed') return species.emojiSemente;
    if (tree.phase === 'sprout') return species.emojiBroto;
    if (tree.phase === 'sapling') return species.emojiArbusto;
    if (tree.phase === 'mature') return species.emojiAdulto;
    if (tree.phase === 'ancient') return species.emojiAncia;
    return '🌳';
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Comum': return 'text-emerald-500';
      case 'Incomum': return 'text-blue-500';
      case 'Rara': return 'text-purple-500';
      case 'Lendária': return 'text-amber-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar Garden Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/40 dark:border-emerald-900/10 gap-4">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Jardim Virtual de Estudos Integrado
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Seu Ecossistema: <span className="text-emerald-600 dark:text-emerald-400">{activeStyles.title}</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 py-1.5 rounded-xl shadow-xs text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 select-none">
            <span className="text-lg">⭐</span>
            Points: <span className="text-emerald-600 font-mono text-sm">{settings.focusPoints} XP</span>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 py-1.5 rounded-xl shadow-xs text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 select-none">
            <span>💧</span>
            Água: <span className="text-blue-500 font-mono text-sm">{settings.waterReserve}</span>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 px-3 py-1.5 rounded-xl shadow-xs text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 select-none">
            <span>🍂</span>
            Fertilizante: <span className="text-amber-600 font-mono text-sm">{settings.fertilizerReserve}</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('garden')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'garden'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-150 dark:border-gray-700 hover:bg-gray-50'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            Meu Jardim
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'shop'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-150 dark:border-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Loja & Estilos
          </button>
          <button
            onClick={() => setActiveTab('atlas')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'atlas'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-150 dark:border-gray-700 hover:bg-gray-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Atlas de Evolução
          </button>
          <button
            onClick={() => setActiveTab('polaroids')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer relative ${
              activeTab === 'polaroids'
                ? 'bg-emerald-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-150 dark:border-gray-700 hover:bg-gray-50'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Estufa Fotográfica
            {fotos.length > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-rose-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold px-0.5">
                {fotos.length}
              </span>
            )}
          </button>
        </div>

        {/* Rain Action Button and Camera */}
        <div className="flex gap-2">
          {activeTab === 'garden' && plantedTrees.length > 0 && (
            <>
              <button
                onClick={() => setCameraOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-850 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 flex items-center gap-1.5 transition-all text-center cursor-pointer"
                title="Tirar uma Polaroid de uma das suas árvores cultivadas!"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Polaroid 📸</span>
              </button>

              <button
                onClick={triggerFocusRain}
                disabled={isFocusRaining}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:scale-105 active:scale-95 disabled:opacity-50 text-white transition-all shadow-md flex items-center gap-2 cursor-pointer"
                title="Gaste 15💧 para irrigar TODAS as plantas"
              >
                <span className="text-sm select-none leading-none">🌧️</span>
                <span>Chuva de Foco</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}
      <AnimatePresence mode="wait">
        {activeTab === 'garden' ? (
          <motion.div
            key="garden-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`relative rounded-3xl h-[420px] shadow-inner overflow-hidden border border-gray-200 dark:border-gray-800 transition-colors duration-500 ${activeStyles.wrapper}`}
          >
            {/* Ground style cosmetic layer */}
            {settings.equippedGroundSkin === 'moss' && (
              <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-emerald-600/35 to-transparent pointer-events-none select-none z-0" />
            )}
            {settings.equippedGroundSkin === 'sand' && (
              <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-amber-500/25 to-transparent pointer-events-none select-none z-0" />
            )}
            {settings.equippedGroundSkin === 'cosmic_dust' && (
              <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-purple-850/45 to-transparent pointer-events-none select-none z-0" />
            )}

            {/* Glass style cosmetic sheen overlay */}
            {settings.equippedGlassSkin === 'prism' && (
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 via-teal-500/10 to-yellow-500/10 backdrop-blur-[0.5px] border-l-4 border-pink-400/40 border-r-4 border-teal-400/40 opacity-80 pointer-events-none select-none z-20" />
            )}
            {settings.equippedGlassSkin === 'retro' && (
              <div className="absolute inset-0 bg-orange-950/10 border-[5px] border-double border-orange-500/30 shadow-[inset_0_0_20px_rgba(249,115,22,0.25)] pointer-events-none select-none z-20">
                <div className="w-full h-1 bg-orange-500/5 absolute top-1/4 animate-bounce" />
                <div className="w-full h-1 bg-orange-500/5 absolute top-2/4 animate-bounce" />
              </div>
            )}
            {settings.equippedGlassSkin === 'royal' && (
              <div className="absolute inset-0 bg-sky-500/5 border-[6px] border-amber-400/50 shadow-[inset_0_0_25px_rgba(217,119,6,0.25)] rounded-3xl pointer-events-none select-none z-20" />
            )}

            {/* Focus rain visual overlay */}
            {isFocusRaining && (
              <div className="absolute inset-0 z-20 pointer-events-none select-none overflow-hidden bg-blue-500/10 backdrop-blur-[0.5px]">
                {/* Raining lines */}
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute bg-gradient-to-b from-blue-300 to-sky-400 opacity-60 w-[1.5px] h-8 rounded"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `-${Math.random() * 40}%`,
                    }}
                    animate={{
                      y: ['-50px', '450px'],
                      x: ['0px', '10px']
                    }}
                    transition={{
                      duration: Math.random() * 0.8 + 0.6,
                      repeat: Infinity,
                      delay: Math.random() * 1.5,
                      ease: 'linear'
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Visual biome particles floating */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
              
              {/* Cloud landmarks if bought */}
              {settings.unlockedLandmarks.includes('bridge') && (
                <motion.div
                  animate={{ x: ['-20%', '120%'] }}
                  transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
                  className="absolute top-8 left-0 text-5xl opacity-20 pointer-events-none"
                >
                  ☁️
                </motion.div>
              )}

              {/* Raindrops / Pollen falling */}
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute rounded-full pointer-events-none ${activeStyles.particleColor}`}
                  style={{
                    width: Math.random() * 8 + 4 + 'px',
                    height: Math.random() * 8 + 4 + 'px',
                    left: Math.random() * 100 + '%',
                  }}
                  animate={{
                    y: ['-10%', '110%'],
                    x: ['-20px', '20px', '-20px'],
                    opacity: [0, 0.7, 0]
                  }}
                  transition={{
                    duration: Math.random() * 12 + 8,
                    repeat: Infinity,
                    delay: Math.random() * 10,
                    ease: 'linear'
                  }}
                />
              ))}

              {/* Floating birds or butterflies depending on landmarks/trees */}
              {plantedTrees.length >= 5 && (
                <motion.div
                  animate={{
                    x: ['-10%', '110%'],
                    y: [120, 80, 160, 100],
                  }}
                  transition={{
                    duration: 35,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute text-2xl"
                >
                  🦋
                </motion.div>
              )}

              {plantedTrees.length >= 12 && (
                <motion.div
                  animate={{
                    x: ['110%', '-10%'],
                    y: [40, 50, 30, 45],
                  }}
                  transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute text-2xl"
                >
                  🐦
                </motion.div>
              )}

              {/* Rainbow decorative item */}
              {plantedTrees.length >= 25 && (
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-7xl opacity-15">
                  🌈
                </div>
              )}
            </div>

            {/* Landmarks rendering */}
            <div className="absolute inset-0 pointer-events-none select-none">
              
              {/* Cozy bonfire */}
              {settings.unlockedLandmarks.includes('fire') && (
                <div className="absolute bottom-6 left-1/3 text-4xl animate-bounce flex flex-col items-center">
                  🔥
                  <span className="text-[10px] font-bold text-gray-800 bg-white/70 dark:bg-gray-900/70 border border-gray-100 rounded px-1 -mt-1 shadow-xs font-mono">Fogueira</span>
                </div>
              )}

              {/* Wooden Well */}
              {settings.unlockedLandmarks.includes('well') && (
                <div className="absolute bottom-16 right-1/4 text-4xl flex flex-col items-center">
                  🛖
                  <span className="text-[10px] font-bold text-gray-800 bg-white/70 dark:bg-gray-900/70 border border-gray-100 rounded px-1 -mt-1 shadow-xs font-mono">Poço</span>
                </div>
              )}

              {/* Camp Tent */}
              {settings.unlockedLandmarks.includes('tent') && (
                <div className="absolute bottom-10 left-12 text-5xl flex flex-col items-center">
                  ⛺
                  <span className="text-[10px] font-bold text-gray-800 bg-white/70 dark:bg-gray-900/70 border border-gray-100 rounded px-1 -mt-1 shadow-xs font-mono">Abrigo</span>
                </div>
              )}
            </div>

            {/* Biome selector buttons on bottom-left */}
            <div className="absolute top-4 left-4 z-20 flex gap-1 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xs p-1 rounded-xl border border-white/20 shadow-sm">
              {settings.unlockedBiomes.map(biome => (
                <button
                  key={biome}
                  onClick={() => handleSelectBiome(biome)}
                  className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${
                    settings.currentBiome === biome
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/50'
                  }`}
                >
                  {biome === 'sunny' ? '☀️ Foco' : biome === 'sakura' ? '🌸 Sakura' : biome === 'desert' ? '🏜️ Sol' : biome === 'mystic' ? '✨ Vale' : biome === 'arctic' ? '❄️ Glacial' : biome === 'volcanic' ? '🔥 Magma' : '🌌 Estelar'}
                </button>
              ))}
            </div>

            {/* Trees Canvas Area */}
            {plantedTrees.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center select-none">
                <span className="text-6xl animate-bounce mb-3">🌱</span>
                <h4 className="font-bold text-gray-800 dark:text-gray-200">Sua floresta está deserta por enquanto</h4>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  Abra um ciclo de estudos Pomodoro ou inicie o Cronômetro de estudos. Ao terminar, uma árvore brotará aqui!
                </p>
              </div>
            ) : (
              <div className="absolute inset-0 z-10 w-full h-full p-8">
                {plantedTrees.map(tree => {
                  const species = ESPECIO_DATABASE.find(s => s.id === tree.speciesId);
                  const isHungry = tree.growthPercent < 100;

                  return (
                    <div 
                      key={tree.id}
                      className="absolute group"
                      style={{
                        left: `${tree.positionX}%`,
                        top: `${tree.positionY}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {/* Tree visual button */}
                      <button
                        onClick={() => onSelectTree(tree)}
                        className={`flex flex-col items-center focus:outline-none relative p-3 rounded-full hover:scale-115 transition-all ${activeStyles.soil} border cursor-pointer ${
                          tree.withered
                            ? 'border-red-400/80 dark:border-red-650 bg-red-500/10 opacity-70 animate-pulse'
                            : isHungry 
                              ? 'border-amber-400/80 dark:border-amber-700/60 shadow-md shadow-amber-500/10 animate-pulse hover:animate-none' 
                              : 'border-gray-200 dark:border-gray-800'
                        }`}
                      >
                        {/* Interactive Growth Ring */}
                        {!tree.withered && tree.growthPercent < 100 && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <svg className="w-14 h-14 transform -rotate-90">
                              <circle 
                                cx="28" cy="28" r="23" 
                                className="stroke-gray-200/40 dark:stroke-gray-700/30" 
                                strokeWidth="2" fill="transparent" 
                              />
                              <circle 
                                cx="28" cy="28" r="23" 
                                className="stroke-amber-500 dark:stroke-amber-600" 
                                strokeWidth="2.5" fill="transparent" 
                                strokeDasharray={144.5}
                                strokeDashoffset={144.5 - (144.5 * tree.growthPercent) / 100}
                              />
                            </svg>
                          </div>
                        )}

                        {/* Urgent Hunger Indicator Badge */}
                        {!tree.withered && isHungry && (
                          <div className="absolute -top-1.5 -left-1.5 z-20 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-blue-500 text-[10px] text-white font-bold border-2 border-white dark:border-gray-900 animate-bounce shadow-md">
                            💧
                          </div>
                        )}

                        {/* Withered Alarm indicator */}
                        {tree.withered && (
                          <div className="absolute -top-1.5 -left-1.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-rose-650 text-[10px] text-white font-bold border-2 border-white dark:border-gray-900 animate-bounce shadow-md">
                            🥀
                          </div>
                        )}

                        <span className={`text-4xl select-none leading-none z-10 drop-shadow-md transition-all duration-300 ${
                          tree.withered
                            ? 'grayscale-[80%] opacity-70 saturate-[30%]'
                            : isHungry 
                              ? 'grayscale-[45%] opacity-80 saturate-[50%] hover:grayscale-0 hover:opacity-100 hover:saturate-100' 
                              : 'grayscale-0 opacity-100'
                        }`}>
                          {getTreeEmoji(tree)}
                        </span>
                        
                        {/* Small species tag on hover */}
                        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 p-2 rounded-lg bg-gray-900/95 text-white border border-gray-750 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none shadow-lg table whitespace-nowrap leading-normal font-sans">
                          <p className="font-bold flex items-center gap-1.5 justify-center">
                            {species?.nome}
                            <span className={`text-[9px] px-1 rounded-sm bg-gray-800 ${getRarityColor(species?.raridade || '')}`}>
                              {species?.raridade}
                            </span>
                          </p>
                          <p className="text-gray-300">Tema: <b className="text-white">{tree.assunto}</b></p>
                          <p className="text-emerald-400 font-bold mt-0.5">
                            {tree.withered ? (
                              <span className="text-rose-400 font-extrabold uppercase">⚠️ Murcha (Inatividade)</span>
                            ) : (
                              <>Estágio: <span className="text-white">{tree.phase === 'seed' ? 'Semente' : tree.phase === 'sprout' ? 'Broto' : tree.phase === 'sapling' ? 'Arbusto' : tree.phase === 'mature' ? 'Maduro' : 'Anciã'}</span> ({tree.growthPercent}%)</>
                            )}
                          </p>
                          {tree.withered ? (
                            <p className="text-rose-350 text-[8px] mt-0.5 font-bold animate-pulse text-center">Abrir painel para Reavivar! 🧪</p>
                          ) : isHungry && (
                            <p className="text-amber-400 font-extrabold flex items-center gap-1 mt-0.5 animate-pulse text-[9px] justify-center">
                              ⚠️ NECESSITA DE REGA/ADUBO 💧🍂
                            </p>
                          )}
                        </div>
                      </button>

                      {/* Deciduous small custom actions */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Quer mesmo desenterrar a árvore "${tree.assunto}"? Isso irá tirá-la definitivamente do jardim.`)) {
                            onDitchTree(tree.id);
                          }
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 text-[10px] items-center justify-center font-bold shadow-sm hidden group-hover:flex z-20"
                        title="Desenterrar árvore"
                      >
                        🗑
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : activeTab === 'shop' ? (
          <motion.div
            key="shop-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl space-y-6"
          >
            <div className="border-b border-gray-100 dark:border-gray-700 pb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                Venda de Biomas & Suprimentos para Jardinagem
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Pague usando seus Pontos de Foco acumulados estudando todos os dias.
              </p>
            </div>

            {/* Item Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* SECTION: Supplies */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 border-l-4 border-emerald-500 pl-2">
                  Suprimentos & Adubos
                </h4>
                
                <div className="space-y-3">
                  {/* Item: 5 Water */}
                  <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-850 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">Balde de Água 💧</h5>
                      <p className="text-[11px] text-gray-500">+5 Gotas d'água no estoque</p>
                    </div>
                    <button
                      onClick={() => handleBuySupplies('water', 5, 75)}
                      className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xs cursor-pointer"
                    >
                      75 XP
                    </button>
                  </div>

                  {/* Item: 2 Fertilizer */}
                  <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-850 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">Adubo Concentrado 🍂</h5>
                      <p className="text-[11px] text-gray-500">+2 Fertilizantes premium</p>
                    </div>
                    <button
                      onClick={() => handleBuySupplies('fertilizer', 2, 120)}
                      className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xs cursor-pointer"
                    >
                      120 XP
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION: Biomes */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 border-l-4 border-emerald-500 pl-2">
                  Biomas do Território
                </h4>

                <div className="space-y-3">
                  {/* Biome: Sakura */}
                  <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-850 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">Parque de Sakura 🌸</h5>
                      <p className="text-[11px] text-gray-500">Pétalas caindo suaves</p>
                    </div>
                    {settings.unlockedBiomes.includes('sakura') ? (
                      <span className="text-xs font-bold text-emerald-600">Comprado</span>
                    ) : (
                      <button
                        onClick={() => handleBuyBiome('sakura', 150)}
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xs"
                      >
                        150 XP
                      </button>
                    )}
                  </div>

                  {/* Biome: Desert */}
                  <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-850 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">Deserto Místico 🏜️</h5>
                      <p className="text-[11px] text-gray-500">Oásis de paz sob o sol</p>
                    </div>
                    {settings.unlockedBiomes.includes('desert') ? (
                      <span className="text-xs font-bold text-emerald-600">Comprado</span>
                    ) : (
                      <button
                        onClick={() => handleBuyBiome('desert', 200)}
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xs"
                      >
                        200 XP
                      </button>
                    )}
                  </div>

                  {/* Biome: Mystic */}
                  <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-850 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">Vale Luminescente ✨</h5>
                      <p className="text-[11px] text-gray-500">Pétalas bio-luminescentes</p>
                    </div>
                    {settings.unlockedBiomes.includes('mystic') ? (
                      <span className="text-xs font-bold text-emerald-600">Comprado</span>
                    ) : (
                      <button
                        onClick={() => handleBuyBiome('mystic', 350)}
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xs"
                      >
                        350 XP
                      </button>
                    )}
                  </div>

                  {/* Biome: Arctic */}
                  <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-850 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">Estufa Glacial ❄️</h5>
                      <p className="text-[11px] text-gray-500">Cultivos frios sob a neve</p>
                    </div>
                    {settings.unlockedBiomes.includes('arctic') ? (
                      <span className="text-xs font-bold text-emerald-600">Comprado</span>
                    ) : (
                      <button
                        onClick={() => handleBuyBiome('arctic', 300)}
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xs"
                      >
                        300 XP
                      </button>
                    )}
                  </div>

                  {/* Biome: Volcanic */}
                  <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-850 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">Estufa de Magma 🔥</h5>
                      <p className="text-[11px] text-gray-500">Calor termal de alta pressão</p>
                    </div>
                    {settings.unlockedBiomes.includes('volcanic') ? (
                      <span className="text-xs font-bold text-emerald-600">Comprado</span>
                    ) : (
                      <button
                        onClick={() => handleBuyBiome('volcanic', 450)}
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xs"
                      >
                        450 XP
                      </button>
                    )}
                  </div>

                  {/* Biome: Cosmic */}
                  <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-850 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">Estufa Sideral 🌌</h5>
                      <p className="text-[11px] text-gray-500">Gravidade zero astronômica</p>
                    </div>
                    {settings.unlockedBiomes.includes('cosmic') ? (
                      <span className="text-xs font-bold text-emerald-600">Comprado</span>
                    ) : (
                      <button
                        onClick={() => handleBuyBiome('cosmic', 600)}
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xs"
                      >
                        600 XP
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION: Landmarks */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 border-l-4 border-emerald-500 pl-2">
                  Monumentos & Natureza
                </h4>

                <div className="space-y-3">
                  {/* Landmark: Camp tent */}
                  <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-850 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">Cabana de Leitura ⛺</h5>
                      <p className="text-[11px] text-gray-500">Um abrigo fofo e aconchegante</p>
                    </div>
                    {settings.unlockedLandmarks.includes('tent') ? (
                      <span className="text-xs font-bold text-emerald-600">Instalado</span>
                    ) : (
                      <button
                        onClick={() => handleBuyLandmark('tent', 100, 'Cabana de Leitura')}
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xs"
                      >
                        100 XP
                      </button>
                    )}
                  </div>

                  {/* Landmark: Bonfire */}
                  <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-850 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">Fogueira Estelar 🔥</h5>
                      <p className="text-[11px] text-gray-500">Ilumine noites de estudo</p>
                    </div>
                    {settings.unlockedLandmarks.includes('fire') ? (
                      <span className="text-xs font-bold text-emerald-600">Instalado</span>
                    ) : (
                      <button
                        onClick={() => handleBuyLandmark('fire', 120, 'Fogueira Estelar')}
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xs"
                      >
                        120 XP
                      </button>
                    )}
                  </div>

                  {/* Landmark: Celestial Clouds */}
                  <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-850 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">Nuvens Celestes ☁️</h5>
                      <p className="text-[11px] text-gray-500">Nuvens flutuando devagar no céu</p>
                    </div>
                    {settings.unlockedLandmarks.includes('bridge') ? (
                      <span className="text-xs font-bold text-emerald-600">Ativo</span>
                    ) : (
                      <button
                        onClick={() => handleBuyLandmark('bridge', 80, 'Nuvens Celestes')}
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xs"
                      >
                        80 XP
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 4: COSMETICS & ESTHETICS (equippedGlassSkin & equippedGroundSkin) */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-emerald-850 dark:text-emerald-400 border-l-4 border-emerald-500 pl-2">
                  Suítes de Vidros & Rádio Lo-Fi
                </h4>

                <div className="space-y-3.5">
                  {/* Glass skins category */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-extrabold tracking-widest text-gray-400 block uppercase font-mono">Cúpula da Estufa</span>
                    
                    {/* Glass 1: Prism */}
                    <div className="p-2 border border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-850/30 rounded-xl flex justify-between items-center text-xs">
                      <span className="font-extrabold text-gray-900 dark:text-gray-100">💎 Prisma Iridescente</span>
                      {settings.unlockedGlassSkins?.includes('prism') ? (
                        <button
                          onClick={() => {
                            onModifySettings({ ...settings, equippedGlassSkin: settings.equippedGlassSkin === 'prism' ? 'default' : 'prism' });
                            notify("Filtro de Cúpula alterado!", "success");
                          }}
                          className={`text-[8px] font-black px-1.5 py-0.5 rounded cursor-pointer ${settings.equippedGlassSkin === 'prism' ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                        >
                          {settings.equippedGlassSkin === 'prism' ? 'Ativo' : 'Equipar'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (settings.focusPoints < 90) {
                              notify("Pontos de Foco insuficientes. Custa 90 XP!", "warning");
                              return;
                            }
                            onModifySettings({
                              ...settings,
                              focusPoints: settings.focusPoints - 90,
                              unlockedGlassSkins: [...(settings.unlockedGlassSkins || ['default']), 'prism']
                            });
                            notify("Vidro Prisma desbloqueado!", "success");
                          }}
                          className="text-[8px] font-black px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                        >
                          90 XP
                        </button>
                      )}
                    </div>

                    {/* Glass 2: Retro */}
                    <div className="p-2 border border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-850/30 rounded-xl flex justify-between items-center text-xs">
                      <span className="font-extrabold text-gray-900 dark:text-gray-100">👾 Retro Grid Neon</span>
                      {settings.unlockedGlassSkins?.includes('retro') ? (
                        <button
                          onClick={() => {
                            onModifySettings({ ...settings, equippedGlassSkin: settings.equippedGlassSkin === 'retro' ? 'default' : 'retro' });
                            notify("Filtro de Cúpula alterado!", "success");
                          }}
                          className={`text-[8px] font-black px-1.5 py-0.5 rounded cursor-pointer ${settings.equippedGlassSkin === 'retro' ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                        >
                          {settings.equippedGlassSkin === 'retro' ? 'Ativo' : 'Equipar'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (settings.focusPoints < 110) {
                              notify("Pontos de Foco insuficientes. Custa 110 XP!", "warning");
                              return;
                            }
                            onModifySettings({
                              ...settings,
                              focusPoints: settings.focusPoints - 110,
                              unlockedGlassSkins: [...(settings.unlockedGlassSkins || ['default']), 'retro']
                            });
                            notify("Estilo Retro Grid desbloqueado!", "success");
                          }}
                          className="text-[8px] font-black px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                        >
                          110 XP
                        </button>
                      )}
                    </div>

                    {/* Glass 3: Royal */}
                    <div className="p-2 border border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-850/30 rounded-xl flex justify-between items-center text-xs">
                      <span className="font-extrabold text-gray-900 dark:text-gray-100">👑 Imperial de Ouro</span>
                      {settings.unlockedGlassSkins?.includes('royal') ? (
                        <button
                          onClick={() => {
                            onModifySettings({ ...settings, equippedGlassSkin: settings.equippedGlassSkin === 'royal' ? 'default' : 'royal' });
                            notify("Molduras barrocas imperiais douradas equipadas!", "success");
                          }}
                          className={`text-[8px] font-black px-1.5 py-0.5 rounded cursor-pointer ${settings.equippedGlassSkin === 'royal' ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                        >
                          {settings.equippedGlassSkin === 'royal' ? 'Ativo' : 'Equipar'}
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (settings.focusPoints < 130) {
                              notify("Pontos de foco insuficientes. Custa 130 XP!", "warning");
                              return;
                            }
                            onModifySettings({
                              ...settings,
                              focusPoints: settings.focusPoints - 130,
                              unlockedGlassSkins: [...(settings.unlockedGlassSkins || ['default']), 'royal']
                            });
                            notify("Bordas barrocas imperiais desbloqueadas!", "success");
                          }}
                          className="text-[8px] font-black px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded cursor-pointer"
                        >
                          130 XP
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Ground skins selector */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold tracking-widest text-gray-400 block uppercase font-mono">Piso do Canteiro</span>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {['classic', 'moss', 'sand', 'cosmic_dust'].map((ground) => (
                        <button
                          key={ground}
                          onClick={() => {
                            onModifySettings({ ...settings, equippedGroundSkin: ground as any });
                            notify(`Canteiro alterado para ${ground.toUpperCase()}!`, "info");
                          }}
                          className={`p-1 border text-[9px] font-extrabold rounded-lg transition-all cursor-pointer ${
                            settings.equippedGroundSkin === ground 
                              ? 'border-emerald-600 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300' 
                              : 'border-gray-200 bg-white dark:bg-gray-800 text-gray-500'
                          }`}
                        >
                          {ground === 'classic' ? '🌱 Gramado' : ground === 'moss' ? '🟢 Musgo' : ground === 'sand' ? '🏜️ Areias' : '🌌 Cósmico'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ambient sound synthesizer */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-extrabold tracking-widest text-gray-400 block uppercase font-mono">Estúdio de Rádio Lo-Fi</span>
                    <div className="space-y-1 mt-1 font-sans">
                      {[
                        { id: 'study_piano', label: 'Estudo de Piano 🎹' },
                        { id: 'study_rain', label: 'Chuva Reconfortante 🌧️' },
                        { id: 'study_fire', label: 'Estalos da lareira 🔥' }
                      ].map((sound) => (
                        <button
                          key={sound.id}
                          onClick={() => {
                            if (activeAudioAmbient === sound.id) {
                              setActiveAudioAmbient(null);
                              notify("Rádio Lo-Fi desligada", "info");
                            } else {
                              setActiveAudioAmbient(sound.id);
                              notify(`Tocando ${sound.label}! Bons estudos.`, "success");
                            }
                          }}
                          className={`w-full p-1.5 border rounded-lg text-left text-[11px] font-semibold transition-all flex justify-between items-center cursor-pointer ${
                            activeAudioAmbient === sound.id 
                              ? 'border-blue-600 bg-blue-500/10 text-blue-900 dark:text-blue-300 shadow-sm font-bold' 
                              : 'border-gray-100 bg-white dark:bg-gray-850 hover:bg-gray-50/50'
                          }`}
                        >
                          <span>{sound.label}</span>
                          <span className="text-[8px] font-black">{activeAudioAmbient === sound.id ? '🔊 TOCANDO' : 'Mudo'}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </motion.div>
        ) : activeTab === 'atlas' ? (
          <motion.div
            key="atlas-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl space-y-6"
          >
            <div className="border-b border-gray-150 dark:border-gray-700 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                Atlas Botânico das Espécies (Estágios de Crescimento)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">
                Veja as características fito-morfológicas e as proporções de visual nos 5 estágios de evolução de cada semente estudável!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6" key="atlas-grid">
              {/* Left Species List */}
              <div className="md:col-span-4 space-y-2">
                <span className="text-[10px] font-black uppercase text-gray-400 block tracking-tight font-sans">Espécies Cadastradas</span>
                <div className="space-y-1.5">
                  {ESPECIO_DATABASE.map((sp, idx) => (
                    <button
                      key={sp.id}
                      onClick={() => {
                        setAtlasSpeciesIdx(idx);
                        audioSynth.playClick();
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        atlasSpeciesIdx === idx 
                          ? 'border-emerald-600 bg-emerald-500/10' 
                          : 'border-gray-100 bg-white dark:bg-gray-850'
                      }`}
                    >
                      <div className="font-sans">
                        <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span>{sp.emojiAdulto}</span> {sp.nome}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{sp.descricao}</p>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${getRarityColor(sp.raridade)}`}>
                        {sp.raridade}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Evolutionary Showcase */}
              <div className="md:col-span-8 p-5 bg-gray-50/50 dark:bg-gray-850 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between" key="showcase-card">
                {(() => {
                  const sp = ESPECIO_DATABASE[atlasSpeciesIdx];
                  if (!sp) return null;

                  return (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 dark:border-gray-750 pb-3 font-sans">
                        <div>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${getRarityColor(sp.raridade)} bg-white dark:bg-gray-900 shadow-xs`}>
                             Espécie {sp.raridade}
                          </span>
                          <h4 className="text-lg font-extrabold text-gray-900 dark:text-white mt-1.5">{sp.nome}</h4>
                        </div>
                        <span className="text-xs text-gray-500 italic mt-1 sm:mt-0">“{sp.lore}”</span>
                      </div>

                      {/* Timeline stages showcase */}
                      <div className="grid grid-cols-5 gap-2.5">
                        {[
                          { key: 'seed', label: '1. Semente', emoji: sp.emojiSemente },
                          { key: 'sprout', label: '2. Broto', emoji: sp.emojiBroto },
                          { key: 'sapling', label: '3. Arbusto', emoji: sp.emojiArbusto },
                          { key: 'mature', label: '4. Adulta', emoji: sp.emojiAdulto },
                          { key: 'ancient', label: '5. Anciã', emoji: sp.emojiAncia }
                        ].map((stg) => (
                          <button
                            key={stg.key}
                            onClick={() => {
                              setAtlasStage(stg.key as any);
                              audioSynth.playClick();
                            }}
                            className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-between gap-1 cursor-pointer h-24 ${
                              atlasStage === stg.key 
                                ? 'border-amber-500 bg-amber-500/10 shadow-xs scale-105'
                                : 'border-gray-100 bg-white dark:bg-gray-900 hover:scale-[1.02]'
                            }`}
                          >
                            <span className="text-[10px] font-black text-gray-400 tracking-tight font-sans">{stg.label}</span>
                            <span className="text-3.5xl select-none leading-none z-10">{stg.emoji}</span>
                            <span className="text-[8px] text-gray-450 font-bold uppercase tracking-tight leading-none font-mono">{stg.key === 'ancient' ? 'Protegida' : 'Proporções'}</span>
                          </button>
                        ))}
                      </div>

                      {/* Stage details banner */}
                      <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-850 space-y-1 font-sans">
                        <p className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                          🔍 Propriedades Botânicos: {atlasStage === 'seed' ? 'Célula Semente' : atlasStage === 'sprout' ? 'Broto Clorofilado' : atlasStage === 'sapling' ? 'Arbusto Vigoroso' : atlasStage === 'mature' ? 'Árvore Adulta Luxuriante' : 'Muda Anciã Lendária'}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                          {atlasStage === 'seed' && `Estágio embrionário obtido na brotação preliminar de focos. Em solo fértil, serve como pilar de estudos recentes. Altamente seguro contra pragas, mas requer hidratação contínua.`}
                          {atlasStage === 'sprout' && `Manifesta as primeiras raízes sob o substrato de estudos. Excelente trocador gasoso, representa o avanço inicial dos cronômetros e a solidificação da memorização.`}
                          {atlasStage === 'sapling' && `Árvore jovem. O arbusto possui caules lignificados através de revisões ativas e espalhadas. Sobrevivência sensível: murcha no Modo Sobrevivência se houver negligência.`}
                          {atlasStage === 'mature' && `Totalmente crescida com flores de herança pedagógica! Permite capturar Polaroids de lembrança com legendas de relatórios didáticos para seu álbum.`}
                          {atlasStage === 'ancient' && `Árvore lendária mística imortalizada! Desenvolvida ao máximo usando adubos vegetais de alta performance e revisões frequentes. É imune a qualquer seca ou penalidade de ócio.`}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <div className="text-[11px] text-gray-450 leading-normal font-sans">
                  💡 <b>Evolução em Estágios Visuais:</b> Cada semente plantada responde aos cuidados de nutrição correspondentes à sua disciplina! Conquiste novos suprimentos e veja suas espécies progredirem fisicamente no jardim.
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="polaroids-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-3xl space-y-6"
          >
            <div className="border-b border-gray-150 dark:border-gray-700 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-600 animate-pulse" />
                  Estufa Fotográfica & Registro de Resumos 📸
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-sans">
                  Visualize Polaroids analógicas de suas árvores cultivadas e mantenha um histórico lindo de resumos pedagógicos!
                </p>
              </div>

              {plantedTrees.length > 0 ? (
                <button
                  onClick={() => setCameraOpen(true)}
                  className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-black rounded-lg shadow-sm hover:opacity-90 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  Tirar Polaroid 📸
                </button>
              ) : null}
            </div>

            {fotos.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-150 dark:border-gray-850 rounded-2xl p-6 font-sans">
                <span className="text-5xl animate-bounce">🎞️</span>
                <h4 className="font-bold text-gray-800 dark:text-gray-300 mt-2">Nenhuma recordação capturada</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 leading-normal">
                  Cultive pelo menos uma espécie no jardim até atingir o estágio Maduro 🌳 ou Ancião 🪵. Assim que atingirem, capture uma recordação fotográfica do seu conhecimento para arquivar no mural!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" key="polaroids-grid">
                {fotos.map((foto) => (
                  <motion.div
                    key={foto.id}
                    whileHover={{ scale: 1.02, rotate: Math.random() * 2 - 1 }}
                    className="p-4 bg-zinc-50 dark:bg-zinc-90 w-full border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between"
                  >
                    <div>
                      {/* Photo Container */}
                      <div className="aspect-square bg-gradient-to-tr from-sky-400/10 via-emerald-450/15 to-purple-400/10 rounded border border-gray-150 dark:border-neutral-800/60 flex flex-col items-center justify-center relative overflow-hidden group select-none">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/30 z-10" />
                        <span className="text-7xl drop-shadow-lg z-10">{foto.emoji}</span>
                        
                        <div className="absolute bottom-2 inset-x-2 flex justify-between text-[8px] font-mono font-black text-white z-20 bg-neutral-900/60 px-1.5 py-0.5 rounded select-none">
                          <span>ESPÉCIE: {foto.raridade.toUpperCase()}</span>
                          <span>{foto.data}</span>
                        </div>
                      </div>

                      {/* Caption text */}
                      <div className="pt-4 pb-2 space-y-1 font-sans">
                        <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-black tracking-tight uppercase">
                          # {foto.assunto.toUpperCase()}
                        </p>
                        <h5 className="text-sm font-extrabold text-neutral-800 dark:text-neutral-100 leading-snug line-clamp-1">
                          {foto.titulo}
                        </h5>
                        <p className="text-[11px] text-neutral-550 dark:text-neutral-400 leading-relaxed italic line-clamp-3">
                          “{foto.comentario}”
                        </p>
                      </div>
                    </div>

                    {/* Footer bar */}
                    <div className="border-t border-neutral-200 dark:border-neutral-850 pt-2 mt-2 flex justify-between items-center font-sans">
                      <span className="text-[9px] font-bold text-gray-450 dark:text-gray-550">
                        Nível: {foto.biome === 'ancient' ? 'Lendária Anciã 🪵' : 'Adulta Madura 🌳'}
                      </span>

                      <button
                        onClick={() => {
                          if (confirm("Quer mesmo deitar fora esta Polaroid da estufa?")) {
                            if (onDeleteFoto) onDeleteFoto(foto.id);
                            notify("A recordação fotográfica foi removida!", "info");
                          }
                        }}
                        className="p-1 text-rose-500 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                        title="Descartar Polaroid"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: TIRAR FOTO POLAROID */}
      {cameraOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-950 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 max-w-md w-full space-y-4"
          >
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3 flex items-center gap-2 font-sans">
              <Camera className="w-5 h-5 text-emerald-600 animate-bounce" />
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Capturar Polaroid de Lembrança 📸</h3>
                <p className="text-[11px] text-gray-500">Registre suas conquistas botânicas com anotações de foco</p>
              </div>
            </div>

            <div className="space-y-4 font-sans">
              {/* Select target tree */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 block">Escolha uma Árvore:</label>
                <select
                  value={selectedTreeForCap}
                  onChange={(e) => setSelectedTreeForCap(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-gray-150 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                >
                  <option value="">-- Escolha uma das Árvores Adultas/Anciãs --</option>
                  {plantedTrees.map((t) => {
                    const spec = ESPECIO_DATABASE.find(s => s.id === t.speciesId);
                    return (
                      <option key={t.id} value={t.id.toString()}>
                        {spec?.emojiAdulto || '🌳'} {t.assunto} ({t.phase === 'ancient' ? 'Anciã 🪵' : t.phase === 'mature' ? 'Maduro 🌳' : 'Jovem 🌱'})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Polaroid Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 block">Título do Polaroid:</label>
                <input
                  type="text"
                  placeholder="Ex: Recordação do Meu Ipê Lendário"
                  value={capTitle}
                  onChange={(e) => setCapTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-150 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-semibold"
                />
              </div>

              {/* Caption text summary */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 block">Resumo de Estudos ou Anotações:</label>
                <textarea
                  placeholder="Escreva uma bela síntese do que você aprendeu nessa sessão de foco!"
                  rows={3}
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-150 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 leading-normal"
                />
              </div>
            </div>

            {/* Modal actions */}
            <div className="pt-2 flex gap-2.5 font-sans">
              <button
                onClick={() => {
                  setCameraOpen(false);
                  setSelectedTreeForCap('');
                  setCaptionText('');
                  setCapTitle('');
                }}
                className="w-1/2 py-2 text-xs font-bold bg-gray-105 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg text-center cursor-pointer"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  if (!selectedTreeForCap) {
                    notify("Selecione qual árvore quer fotografar!", "warning");
                    return;
                  }
                  if (!capTitle.trim()) {
                    notify("Insira um título para emoldurar seu Polaroid!", "warning");
                    return;
                  }

                  const tr = plantedTrees.find(tree => tree.id.toString() === selectedTreeForCap);
                  if (!tr) {
                    notify("Árvore não localizada no ecossistema!", "error");
                    return;
                  }

                  const sp = ESPECIO_DATABASE.find(s => s.id === tr.speciesId);

                  // camera shutter visual sound trigger
                  audioSynth.playReadShort();

                  if (onSaveFoto) {
                    onSaveFoto({
                      id: 'polaroid_' + Date.now().toString() + '_' + Math.floor(Math.random() * 1000000),
                      titulo: capTitle,
                      comentario: captionText || 'Cultivo de foco bem-sucedido e registrado para posteridade pedagógica.',
                      data: new Date().toLocaleDateString('pt-BR'),
                      emoji: getTreeEmoji(tr),
                      raridade: sp?.nome || 'Árvore de Memorização',
                      assunto: tr.assunto,
                      biome: tr.phase,
                      materiaNome: tr.materiaNome || 'Geral'
                    });
                  }

                  if (onAddTimelineEvent) {
                    onAddTimelineEvent(
                      'Foto Revelada!',
                      `Você revelou seu Polaroid de "${tr.assunto}" no Álbum de Recordações.`,
                      'evento',
                      '📸'
                    );
                  }

                  notify("📸 FLASH! Polaroid capturado e emoldurado no seu mural da Estufa!", "success");

                  setCameraOpen(false);
                  setSelectedTreeForCap('');
                  setCaptionText('');
                  setCapTitle('');
                  setActiveTab('polaroids');
                }}
                className="w-1/2 py-2 text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-lg shadow hover:opacity-90 flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
              >
                Revelar Polaroid ✨
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
