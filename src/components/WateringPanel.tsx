import React from 'react';
import { Tree, GardenSettings, ESPECIO_DATABASE, TreePhase } from '../types';
import { Droplet, Sprout, TrendingUp, Sparkles, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { audioSynth } from '../utils/audio';

interface WateringPanelProps {
  tree: Tree;
  settings: GardenSettings;
  onModifyTree: (modifiedTree: Tree) => void;
  onModifySettings: (modifiedSettings: GardenSettings) => void;
  onClose: () => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export default function WateringPanel({ 
  tree, 
  settings, 
  onModifyTree, 
  onModifySettings, 
  onClose,
  showToast
}: WateringPanelProps) {
  
  const species = ESPECIO_DATABASE.find(s => s.id === tree.speciesId);

  const notify = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    if (showToast) {
      showToast(msg, type);
    } else {
      alert(msg);
    }
  };

  const getPhaseName = (phase: TreePhase) => {
    switch (phase) {
      case 'seed': return 'Semente 🌰';
      case 'sprout': return 'Broto 🌿';
      case 'sapling': return 'Arbusto 🪴';
      case 'mature': return 'Árvore Adulta 🌳';
      case 'ancient': return 'Árvore Anciã 🪵';
      default: return 'Espécime';
    }
  };

  const currentEmoji = () => {
    if (tree.withered) return '🥀';
    if (!species) return '🌳';
    switch (tree.phase) {
      case 'seed': return species.emojiSemente;
      case 'sprout': return species.emojiBroto;
      case 'sapling': return species.emojiArbusto;
      case 'mature': return species.emojiAdulto;
      case 'ancient': return species.emojiAncia;
      default: return '🌳';
    }
  };

  const handleWater = () => {
    if (settings.waterReserve < 3) {
      notify('Você precisa de pelo menos 3 gotas d\'água (💧) para regar sua planta! Faça mais sessões de estudo focadas.', 'warning');
      return;
    }

    if (tree.growthPercent >= 100) {
      notify('Sua árvore já está 100% desenvolvida! Você pode usar fertilizante para torná-la Anciã.', 'info');
      return;
    }

    // Spend 3 water, add 8% growth
    const newGrowth = Math.min(tree.growthPercent + 8, 100);
    let newPhase = tree.phase;

    if (newGrowth >= 100) {
      newPhase = 'mature';
    } else if (newGrowth >= 60) {
      newPhase = 'sapling';
    } else if (newGrowth >= 25) {
      newPhase = 'sprout';
    }

    const updatedTree: Tree = {
      ...tree,
      growthPercent: newGrowth,
      phase: newPhase,
      waterDroplets: tree.waterDroplets + 1,
    };

    const updatedSettings: GardenSettings = {
      ...settings,
      waterReserve: settings.waterReserve - 3,
      focusPoints: settings.focusPoints + 3, // earn some focus points as XP!
    };

    onModifyTree(updatedTree);
    onModifySettings(updatedSettings);
    audioSynth.playWatering();
    notify('💧 Planta regada com 3 gotas! (+8% Crescimento)', 'success');
  };

  const handleFertilize = () => {
    if (tree.phase === 'mature' && tree.growthPercent >= 100) {
      if (settings.fertilizerReserve < 4) {
        notify('Você precisa de 4 Fertilizantes (🍂) para realizar a Fusão Lendária de Anciã!', 'warning');
        return;
      }
      if (settings.focusPoints < 150) {
        notify('Você precisa de pelo menos 150 de Foco (XP) para guiar a Fusão Anciã!', 'warning');
        return;
      }

      // Evolve to ancient
      const updatedTree: Tree = {
        ...tree,
        phase: 'ancient',
        fertilizerAmount: tree.fertilizerAmount + 1,
      };

      const updatedSettings: GardenSettings = {
        ...settings,
        fertilizerReserve: settings.fertilizerReserve - 4,
        focusPoints: settings.focusPoints - 150, // Converte 150 de XP na evolução
      };

      onModifyTree(updatedTree);
      onModifySettings(updatedSettings);
      audioSynth.playAncientEvolution();
      notify('🎉 Espetacular! Sua árvore evoluiu para o estágio Lendário Anciã! Ela trará bônus eternos de sabedoria ao seu ecossistema!', 'success');
      return;
    }

    if (settings.fertilizerReserve < 3) {
      notify('Você precisa de pelo menos 3 Fertilizantes (🍂) para realizar a fertilização! Compre na loja ou complete metas.', 'warning');
      return;
    }

    if (tree.growthPercent >= 100) {
      notify('Esta planta já está madura. O fertilizante agora serve para evoluí-la para Anciã (se estiver adulta).', 'info');
      return;
    }

    // Spend 3 fertilizer, add 16% growth
    const newGrowth = Math.min(tree.growthPercent + 16, 100);
    let newPhase = tree.phase;

    if (newGrowth >= 100) {
      newPhase = 'mature';
    } else if (newGrowth >= 60) {
      newPhase = 'sapling';
    } else if (newGrowth >= 25) {
      newPhase = 'sprout';
    }

    const updatedTree: Tree = {
      ...tree,
      growthPercent: newGrowth,
      phase: newPhase,
      fertilizerAmount: tree.fertilizerAmount + 1,
    };

    const updatedSettings: GardenSettings = {
      ...settings,
      fertilizerReserve: settings.fertilizerReserve - 3,
      focusPoints: settings.focusPoints + 10,
    };

    onModifyTree(updatedTree);
    onModifySettings(updatedSettings);
    audioSynth.playFertilizing();
    notify('🍂 Fertilizado com estimulante! (+16% Crescimento)', 'success');
  };

  const triggerAudioBeep = (freq: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // Ignorar erros de áudio silencioso
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 cursor-default"
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
                {getPhaseName(tree.phase)}
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                {species?.nome || 'Árvore de Estudos'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Assunto: <strong className="text-gray-700 dark:text-gray-300">{tree.assunto}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-bold"
            >
              ✕
            </button>
          </div>

          {/* Visual Nurturing Area */}
          <div className="bg-emerald-50/40 dark:bg-emerald-950/10 rounded-2xl p-8 border border-emerald-100/20 dark:border-emerald-900/20 mb-6 flex flex-col items-center justify-center relative overflow-hidden">
            
            {/* Soft decorative background patterns */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
              <span className="text-9xl">🌿</span>
            </div>

            {/* Simulated shadow */}
            <div className="w-16 h-2 bg-black/10 dark:bg-black/30 rounded-full blur-xs absolute bottom-12"></div>

            <motion.div 
              animate={{ 
                scale: tree.phase === 'seed' ? [1, 1.05, 1] : [1, 1.02, 1],
                y: tree.phase === 'ancient' ? [0, -4, 0] : [0, -2, 0]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="text-7xl mb-6 relative select-none"
            >
              {currentEmoji()}
              
              {tree.phase === 'ancient' && (
                <span className="absolute -top-2 -right-2 text-2xl animate-spin" style={{ animationDuration: '8s' }}>✨</span>
              )}
            </motion.div>

            {/* Growth Gauge */}
            <div className="w-full space-y-1 z-10">
              <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-400">
                <span>Crescimento</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {tree.growthPercent}%
                </span>
              </div>
              <div className="relative h-4 bg-gray-200 dark:bg-gray-750 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800">
                <motion.div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${tree.growthPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Ações de Cultivo</h4>
            
            {tree.withered ? (
              <div className="p-5 bg-red-500/10 border border-rose-300 dark:border-rose-900 rounded-2xl text-center space-y-3">
                <p className="text-sm font-black text-rose-800 dark:text-rose-300 uppercase tracking-wide flex items-center justify-center gap-1.5">
                  <span>🥀</span> Espécime Murcha!
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
                  Esta semente ou broto murchou temporariamente devido à falta de regularidade nos estudos semanais. Use suprimentos ecológicos para reavivar a espécie!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (settings.waterReserve < 2 || settings.fertilizerReserve < 1) {
                      notify("Suprimentos insuficientes! Você precisa de 2 Baldes de Água 💧 e 1 Adubo 🍂 para restabelecer a saúde desta espécie.", "warning");
                      return;
                    }

                    // Revive tree
                    const revivedTree = {
                      ...tree,
                      withered: false
                    };
                    const updatedSettings = {
                      ...settings,
                      waterReserve: settings.waterReserve - 2,
                      fertilizerReserve: settings.fertilizerReserve - 1,
                    };

                    onModifyTree(revivedTree);
                    onModifySettings(updatedSettings);
                    audioSynth.playAncientEvolution();
                    notify("✨ Maravilha! A muda absorveu a mistura revitalizadora e restabeleceu toda a sua saúde botânica!", "success");
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-transform duration-100 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>✨</span> Revitalizar Planta (2 💧 + 1 🍂)
                </button>
              </div>
            ) : (
              /* Water and Fertilizer grid */
              <div className="grid grid-cols-2 gap-3">
                
                {/* BUTTON: Watering */}
                <button
                  onClick={handleWater}
                  disabled={tree.growthPercent >= 100}
                  className="flex flex-col items-center justify-center p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:border-blue-200 transition-all group disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Droplet className="w-5 h-5 fill-current" />
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Regar</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">Custo: 3 💧 (Possui: {settings.waterReserve})</span>
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">+8% Crescimento</span>
                </button>

                {/* BUTTON: Fertilize */}
                <button
                  onClick={handleFertilize}
                  className="flex flex-col items-center justify-center p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 hover:border-amber-200 transition-all group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {tree.phase === 'mature' && tree.growthPercent >= 100 ? 'Anciã Lendária' : 'Fertilizar'}
                  </span>
                  {tree.phase === 'mature' && tree.growthPercent >= 100 ? (
                    <>
                      <span className="text-[10px] text-gray-400 mt-0.5">Custo: 4 🍂 + 150 XP</span>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-1">Evolução Lendária ✨</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] text-gray-400 mt-0.5">Custo: 3 🍂 (Possui: {settings.fertilizerReserve})</span>
                      <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-1">+16% Crescimento</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Small stats summary */}
            <div className="bg-gray-50 dark:bg-gray-850 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 space-y-1.5">
              <div className="flex justify-between">
                <span>Total de vezes que recebeu Rega:</span>
                <span className="font-semibold text-gray-850 dark:text-gray-200">{tree.waterDroplets} vezes</span>
              </div>
              <div className="flex justify-between">
                <span>Dose de Fertilizante recebida:</span>
                <span className="font-semibold text-gray-850 dark:text-gray-200">{tree.fertilizerAmount} vezes</span>
              </div>
              <div className="flex justify-between">
                <span>Tempo original de estudo:</span>
                <span className="font-semibold text-gray-850 dark:text-gray-200">{tree.duracaoMin} min estudados</span>
              </div>
              <div className="flex justify-between">
                <span>Data de Plantio original:</span>
                <span className="font-semibold text-gray-850 dark:text-gray-200">{tree.dataPlantio}</span>
              </div>
            </div>
            
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-bold text-sm transition-colors"
              >
                Voltar ao Jardim
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
