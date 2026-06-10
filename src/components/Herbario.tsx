import React, { useState } from 'react';
import { ESPECIO_DATABASE, BotanicalSpecies, Tree } from '../types';
import { Search, Lock, Unlock, Sparkles, AlertCircle, Info, BookOpen, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HerbarioProps {
  plantedTrees: Tree[];
}

export default function Herbario({ plantedTrees }: HerbarioProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('All');
  const [selectedSpecies, setSelectedSpecies] = useState<BotanicalSpecies | null>(null);

  // Determine which species are "unlocked" (either planted at least once or unlocked by metric)
  const isSpeciesUnlocked = (speciesId: string) => {
    return plantedTrees.some(t => t.speciesId === speciesId);
  };

  const getPlantedCount = (speciesId: string) => {
    return plantedTrees.filter(t => t.speciesId === speciesId).length;
  };

  const filteredSpecies = ESPECIO_DATABASE.filter(s => {
    const matchesSearch = s.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = selectedRarity === 'All' || s.raridade === selectedRarity;
    return matchesSearch && matchesRarity;
  });

  const getRarityBadgeStyle = (rarity: string) => {
    switch (rarity) {
      case 'Comum':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200';
      case 'Incomum':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200';
      case 'Rara':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200';
      case 'Lendária':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-200 animate-pulse';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            Herbário Botânico de Foco
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Descubra sementes e espécies raras completando diferentes hábitos de estudos.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar espécie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 w-full md:w-60 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={selectedRarity}
            onChange={(e) => setSelectedRarity(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">Todas Raridades</option>
            <option value="Comum">Comum</option>
            <option value="Incomum">Incomum</option>
            <option value="Rara">Rara</option>
            <option value="Lendária">Lendária</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpecies.map(species => {
          const unlocked = isSpeciesUnlocked(species.id);
          const count = getPlantedCount(species.id);

          return (
            <motion.div
              key={species.id}
              layoutId={`species-card-${species.id}`}
              onClick={() => setSelectedSpecies(species)}
              whileHover={{ y: -3 }}
              className={`p-4 border rounded-xl cursor-pointer transition-all ${
                unlocked 
                  ? 'bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/60 border-gray-200 dark:border-gray-750 hover:shadow-md'
                  : 'bg-gray-100/50 dark:bg-gray-900/40 border-dashed border-gray-300 dark:border-gray-800 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getRarityBadgeStyle(species.raridade)}`}>
                  {species.raridade}
                </span>

                <div className="flex items-center gap-1.5">
                  {unlocked ? (
                    <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/35">
                      {count} Cultivadas
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                      Bloqueado
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center text-4xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden shrink-0">
                  {unlocked ? (
                    <span className="translate-y-0.5 transform scale-110 select-none">{species.emojiAdulto}</span>
                  ) : (
                    <Lock className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {unlocked ? species.nome : 'Espécie Misteriosa'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {species.categoria}
                  </p>
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1 lines-clamp-1 truncate">
                    {unlocked ? 'Toque para detalhes' : `Requisito: ${species.comoDesbloquear}`}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox details modal */}
      <AnimatePresence>
        {selectedSpecies && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              {/* Header colored banner */}
              <div className="h-28 bg-gradient-to-r from-emerald-400 to-teal-500 dark:from-emerald-900 dark:to-teal-900 flex items-end p-4 relative">
                <button
                  onClick={() => setSelectedSpecies(null)}
                  className="absolute top-4 right-4 bg-black/20 text-white hover:bg-black/35 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm focus:outline-none transition-colors"
                >
                  ✕
                </button>
                <div className="absolute -bottom-8 left-6 w-20 h-20 rounded-2xl bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-905 shadow-md flex items-center justify-center text-4xl">
                  {isSpeciesUnlocked(selectedSpecies.id) ? (
                    <span className="select-none">{selectedSpecies.emojiAdulto}</span>
                  ) : (
                    <Lock className="w-8 h-8 text-gray-400" />
                  )}
                </div>
              </div>

              <div className="pt-12 px-6 pb-6">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isSpeciesUnlocked(selectedSpecies.id) ? selectedSpecies.nome : 'Semente Desconhecida'}
                  </h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getRarityBadgeStyle(selectedSpecies.raridade)}`}>
                    {selectedSpecies.raridade}
                  </span>
                </div>

                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide uppercase mb-4">
                  {selectedSpecies.categoria}
                </p>

                {/* Lore info box */}
                <div className="bg-emerald-50/50 dark:bg-emerald-950/15 p-4 rounded-xl border border-emerald-100/30 dark:border-emerald-900/20 mb-4 text-justify">
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide mb-1">
                    <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                    Misticismo e Lore
                  </h4>
                  <p className="text-sm italic text-gray-600 dark:text-gray-300">
                    &ldquo;{selectedSpecies.lore}&rdquo;
                  </p>
                </div>

                {/* Growth stages description if unlocked */}
                {isSpeciesUnlocked(selectedSpecies.id) ? (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Fases Evolutivas da Espécie:</h4>
                    <div className="grid grid-cols-5 gap-1.5 text-center bg-gray-50 dark:bg-gray-800/40 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <div>
                        <div className="text-lg bg-white dark:bg-gray-800 rounded-md p-1 border border-gray-200/50 dark:border-gray-700">{selectedSpecies.emojiSemente}</div>
                        <span className="text-[10px] text-gray-400">Semente</span>
                      </div>
                      <div>
                        <div className="text-lg bg-white dark:bg-gray-800 rounded-md p-1 border border-gray-200/50 dark:border-gray-700">{selectedSpecies.emojiBroto}</div>
                        <span className="text-[10px] text-gray-400">Broto</span>
                      </div>
                      <div>
                        <div className="text-lg bg-white dark:bg-gray-800 rounded-md p-1 border border-gray-200/50 dark:border-gray-700">{selectedSpecies.emojiArbusto}</div>
                        <span className="text-[10px] text-gray-400">Arbusto</span>
                      </div>
                      <div>
                        <div className="text-lg bg-white dark:bg-gray-800 rounded-md p-1 border border-emerald-500 bg-emerald-50/20">{selectedSpecies.emojiAdulto}</div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Madura</span>
                      </div>
                      <div>
                        <div className="text-lg bg-white dark:bg-gray-800 rounded-md p-1 border border-gray-200/50 dark:border-gray-700">{selectedSpecies.emojiAncia}</div>
                        <span className="text-[10px] text-gray-400">Anciã</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* How to unlock details */}
                <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">Condição de Cultivo: </span>
                      {selectedSpecies.comoDesbloquear}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-semibold text-gray-900 dark:text-white">Descrição Geral: </span>
                    {selectedSpecies.descricao}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedSpecies(null)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Fechar Registro
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
