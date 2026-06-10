/// <reference types="vite/client" />
import React from 'react';
import AnalyticsDash from './components/AnalyticsDash';
import GardenBiome from './components/GardenBiome';
import Herbario from './components/Herbario';
import WateringPanel from './components/WateringPanel';
import ActiveTimer from './components/ActiveTimer';
import { audioSynth } from './utils/audio';
import { QuestaoManager } from './components/QuestaoManager';
import { RevisaoList } from './components/RevisaoList';
import { LeituraStation } from './components/LeituraStation';
import { getTodayDate } from './utils/helpers';
import { useAppState } from './hooks/useAppState';

// Lucide icons
import {
  BookOpen,
  Plus,
  Settings, Undo2, Sun, Moon, Sparkles, Droplets, Info,
  CheckCircle, AlertCircle, AlertTriangle, X,
  LayoutDashboard, Sprout, Timer, GraduationCap, History,
  Flame, Award, Volume2, VolumeX, Lightbulb, PenTool,
  Search, Filter, HelpCircle
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const {
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
    conIsFilteringActive,
    conIsDateRangeInvalid,
    filteredMaterias,
    totalConteudosFiltrados,
    showToast,
    toggleSound,
    toggleDarkMode,
    executeUndo,
    addTimelineEvent,
    handleAddConteudo,
    handleRemoveConteudo,
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
    handleRestoreAutoBackup,
    handleDitchTree,
    handleAddLeitura,
    handleRemoveLeitura,
    getSubjectSuggestions,
  } = useAppState();

  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-base font-black text-indigo-700 dark:text-indigo-300 mt-5 mb-2.5">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-lg font-black text-purple-900 dark:text-purple-100 mt-6 mb-3">{line.replace('# ', '')}</h1>;
      }

      const parts: Array<string | React.ReactNode> = [];
      let currentLine = line;

      let listPrefix = "";
      if (line.trim().startsWith('- ')) {
        listPrefix = "• ";
        currentLine = line.trim().substring(2);
      } else if (/^\d+\.\s+/.test(line.trim())) {
        const match = line.trim().match(/^(\d+\.\s+)/);
        if (match) {
          listPrefix = match[1];
          currentLine = line.trim().substring(match[0].length);
        }
      }

      const regex = /\*\*(.*?)\*\*/g;
      let lastIndex = 0;
      let match;

      while ((match = regex.exec(currentLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(currentLine.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-extrabold text-indigo-900 dark:text-indigo-200 bg-indigo-500/10 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded text-[11px]">{match[1]}</strong>);
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < currentLine.length) {
        parts.push(currentLine.substring(lastIndex));
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className={`text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-gray-300 my-1.5 ${listPrefix ? 'pl-4 relative' : ''}`}>
          {listPrefix && <span className="absolute left-0 top-0 font-extrabold text-indigo-600 dark:text-indigo-400">{listPrefix}</span>}
          {parts.length > 0 ? parts : currentLine}
        </p>
      );
    });
  };

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} transition-all`}>
      
      {/* Top Main Navigation header */}
      <header className="border-b border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-wrap justify-between items-center gap-4">
          
          {/* Logo brand */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center relative shadow-md shadow-emerald-500/20 group">
              <BookOpen className="w-5 h-5 text-emerald-100/70 absolute bottom-1.5 group-hover:scale-95 transition-transform" />
              <Sprout className="w-5 h-5 text-white absolute top-1 animate-bounce group-hover:scale-110 transition-transform" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-gray-950 dark:text-white leading-tight">
                Cultiva<span className="text-emerald-650 dark:text-emerald-400">Mente</span>
              </h1>
              <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500">
                Gamified Focus Forest
              </span>
            </div>
          </div>

          {/* Quick Stats overview bar */}
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            {/* Streak Badge */}
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/15 dark:to-orange-500/15 px-3 py-1.5 rounded-xl border border-orange-200/50 dark:border-orange-950/20 text-xs font-extrabold text-orange-600 dark:text-orange-400 shadow-sm">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse fill-current" />
              <span>{streak.currentStreak}d de Streak</span>
            </div>

            {/* XP Badge */}
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/15 dark:to-teal-500/15 px-3 py-1.5 rounded-xl border border-emerald-200/50 dark:border-emerald-950/20 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 shadow-sm">
              <Award className="w-4 h-4 text-emerald-500 animate-bounce" />
              <span>{gardenSettings.focusPoints} XP</span>
            </div>

            {/* Water reserve Badge */}
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-500/15 dark:to-cyan-500/15 px-3 py-1.5 rounded-xl border border-blue-200/50 dark:border-blue-950/20 text-xs font-extrabold text-blue-600 dark:text-blue-400 shadow-sm">
              <Droplets className="w-4 h-4 text-blue-500 animate-pulse" />
              <span>{gardenSettings.waterReserve} 💧</span>
            </div>

            {/* Fertilizer reserve Badge */}
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-amber-600/10 dark:from-amber-500/15 dark:to-amber-600/15 px-3 py-1.5 rounded-xl border border-amber-200/50 dark:border-amber-950/20 text-xs font-extrabold text-amber-700 dark:text-amber-400 shadow-sm">
              <Sprout className="w-4 h-4 text-amber-600 dark:text-amber-500" />
              <span>{gardenSettings.fertilizerReserve} 🍂</span>
            </div>
            
            {/* Action Bar helpers */}
            <div className="flex items-center gap-1">
              <button 
                onClick={executeUndo} 
                className="p-2 h-9 w-9 rounded-xl border border-gray-150 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors disabled:opacity-40"
                disabled={historyStack.length === 0}
                title={`Desfazer última alteração: ${historyStack[historyStack.length - 1]?.desc || 'Nenhuma'}`}
              >
                <Undo2 className="w-4 h-4 mx-auto" />
              </button>

              <button 
                onClick={toggleDarkMode} 
                className="p-2 h-9 w-9 rounded-xl border border-gray-150 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                title="Alternar tema"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400 mx-auto" /> : <Moon className="w-4 h-4 mx-auto" />}
              </button>

              <button 
                onClick={toggleSound} 
                className={`p-2 h-9 w-9 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                  soundEnabled 
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-500/5 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                    : 'border-gray-150 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-450 hover:text-gray-600 dark:hover:text-gray-350'
                }`}
                title={soundEnabled ? "Efeitos de som: Ligados 🔊" : "Efeitos de som: Desligados 🔇"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button 
                onClick={() => setIsMetasOpen(true)} 
                className="p-2 h-9 w-9 rounded-xl border border-gray-150 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                title="Configurações e Metas"
              >
                <Settings className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Primary viewport content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main navigation controller side bar */}
          <nav className="lg:col-span-3 space-y-2.5 relative">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-2 mb-1 flex items-center gap-1">
              <span>🚀</span> Estações de Foco
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
                { id: 'plantacao', label: 'Seu Jardim (Estufa)', icon: Sprout, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
                { id: 'pomodoro', label: 'Pomodoro Foco', icon: Timer, color: 'text-red-500 bg-red-50 dark:bg-red-950/20' },
                { id: 'questoes', label: 'Painel de Questões', icon: HelpCircle, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
                { id: 'conteudos', label: 'Disciplinas & Grade', icon: GraduationCap, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
                { id: 'revisoes', label: 'Tabela de Revisões', icon: History, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/20' },
                { id: 'leituras', label: 'Estação de Leitura', icon: BookOpen, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
                { id: 'anotacoes', label: 'Notas & Insights', icon: PenTool, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20' },
                { id: 'flashcards', label: 'Flashcards Fixação', icon: Lightbulb, color: 'text-rose-500 bg-rose-550/15 dark:bg-rose-950/20' },
                { id: 'conquistas', label: 'Insígnias & Estufa', icon: Award, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' },
              ].map(tab => {
                const IconComp = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      audioSynth.playClick();
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-bold transition-all relative group cursor-pointer ${
                      isActive
                        ? 'text-white font-extrabold shadow-sm bg-gradient-to-r from-emerald-600 to-teal-650'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-gray-800/60 hover:text-gray-950 dark:hover:text-white'
                    }`}
                  >
                    {/* Animated side dot indicator */}
                    {isActive && (
                      <motion.div 
                        layoutId="activeSideDot"
                        className="absolute left-1 w-1.5 h-1.5 rounded-full bg-white"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    
                    {/* Icon container with background depth */}
                    <div className={`p-1.5 rounded-lg transition-transform duration-300 group-hover:scale-115 group-hover:rotate-6 ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : tab.color
                    }`}>
                      <IconComp className="w-4 h-4" />
                    </div>

                    <span className="relative z-10 flex items-center gap-1.5">
                      {tab.label}
                      {tab.id === 'conteudos' && conIsFilteringActive && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 border border-amber-500 animate-pulse" title="Filtros de Grade ativos!" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-6 border-t border-gray-150 dark:border-gray-800">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-2 mb-2">Backups Corporais</p>
              
              <div className="space-y-1.5 px-1">
                <button
                  onClick={handleExportBackup}
                  className="w-full text-left font-semibold text-xs text-gray-500 dark:text-gray-400 py-1.5 px-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between"
                >
                  <span>Exportar Dados</span>
                  <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">JSON</span>
                </button>

                <label className="w-full text-left font-semibold text-xs text-gray-500 dark:text-gray-400 py-1.5 px-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between cursor-pointer">
                  <span>Importar Dados</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                  <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">UP</span>
                </label>
              </div>
            </div>

            {/* Elegant, Non-Intrusive Description about CultivaMente */}
            <div className="pt-6 border-t border-gray-150 dark:border-gray-800 mt-4 px-2">
              <div className="p-4 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent rounded-2xl border border-emerald-500/10 dark:border-emerald-500/5 text-xs text-gray-500 dark:text-gray-400 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200">
                  <Sprout className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  <span>Sobre o CultivaMente</span>
                </div>
                <p className="leading-relaxed">
                  O <strong>CultivaMente</strong> é um gerenciador de estudos gamificado projetado para transformar horas de foco produtivo em árvores e sementes digitais de sabedoria na sua Estufa mental.
                </p>
                <p className="leading-relaxed">
                  Estude usando o cronômetro Pomodoro, resolva questões, mantenha em dia suas revisões espaçadas ou registre leituras de livros para enriquecer sua jornada intelectual e ver sua floresta florescer!
                </p>
              </div>
            </div>
          </nav>

          {/* Active component panels */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <AnalyticsDash
                questoes={questoes}
                plantedTrees={plantedTrees}
                sessoesEstudo={sessoesEstudo}
                streak={streak}
                settings={gardenSettings}
                metas={metas}
                materias={materias}
                onUpdateMetas={setMetas}
                gardenEvent={gardenEvent}
                timelineEvents={timelineEvents}
                onUpdateGardenEvent={setGardenEvent}
                onAddTimelineEvent={addTimelineEvent}
                onUpdateSettings={setGardenSettings}
              />
            )}

            {/* TAB: PLANTAÇÃO */}
            {activeTab === 'plantacao' && (
              <div className="space-y-6">
                <GardenBiome
                  plantedTrees={plantedTrees}
                  settings={gardenSettings}
                  onModifySettings={handleModifySettings}
                  onSelectTree={setSelectedTreeForNurture}
                  onDitchTree={handleDitchTree}
                  onModifyTrees={setPlantedTrees}
                  showToast={showToast}
                  fotos={fotos}
                  onSaveFoto={(novaFoto) => setFotos(prev => [novaFoto, ...prev])}
                  onDeleteFoto={(fotoId) => setFotos(prev => prev.filter(f => f.id !== fotoId))}
                  onAddTimelineEvent={addTimelineEvent}
                />
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-xs">
                  <Herbario plantedTrees={plantedTrees} />
                </div>
              </div>
            )}

            {/* TAB: POMODORO */}
            <div className={activeTab === 'pomodoro' ? "block" : "hidden"}>
              <ActiveTimer
                onSessionComplete={handleActiveSessionComplete}
                suggestedSubjects={getSubjectSuggestions()}
                showToast={showToast}
              />
            </div>

            {/* TAB: QUESTÕES */}
            {activeTab === 'questoes' && (
              <QuestaoManager
                questoes={questoes}
                onAddQuestoes={handleAddQuestoes}
                onRemoveQuestoesByAssunto={handleRemoveQuestoesByAssunto}
                getSubjectSuggestions={getSubjectSuggestions}
                showToast={showToast}
              />
            )}

            {/* TAB: CONTEUDOS */}
            {activeTab === 'conteudos' && (
              <div className="space-y-6">
                
                {/* Subject scheduling planner */}
                <div className="bg-gradient-to-br from-emerald-50/30 to-white dark:from-emerald-950/5 dark:to-gray-800 p-6 rounded-3xl border border-emerald-100/50 dark:border-emerald-900/10 space-y-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    ➕ Planejar Disciplinas & Conteúdos Ativos
                  </h2>

                  <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${selectedMateriaId === '' ? '5' : '3'} gap-4 items-end`}>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Matéria</label>
                      <select
                        value={selectedMateriaId}
                        onChange={(e) => setSelectedMateriaId(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3.5 py-1.5 text-sm border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">Nova matéria...</option>
                        {materias.map(m => (
                          <option key={m.id} value={m.id}>{m.emoji} {m.nome}</option>
                        ))}
                      </select>
                    </div>

                    {selectedMateriaId === '' && (
                      <>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Nova matéria (se não selecionada)</label>
                          <input
                            type="text"
                            placeholder="Ex: Direito Civil"
                            value={newMateriaNome}
                            onChange={(e) => setNewMateriaNome(e.target.value)}
                            className="w-full px-3.5 py-1.5 text-sm border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Emoji da matéria</label>
                          <select
                            value={newMateriaEmoji}
                            onChange={(e) => setNewMateriaEmoji(e.target.value)}
                            className="w-full px-3.5 py-1.5 text-sm border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="🌿">🌿 Folha / Arbusto</option>
                            <option value="🌵">🌵 Cacto Simétrico</option>
                            <option value="🌲">🌲 Pinheiro Verde</option>
                            <option value="🌴">🌴 Palmeira Tropical</option>
                            <option value="🌸">🌸 Cerejeira Floral</option>
                            <option value="🌻">🌻 Girassol Solar</option>
                            <option value="🪵">🪵 Bonsai Sábio</option>
                          </select>
                        </div>
                      </>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">🌿 Nome do conteúdo</label>
                      <input
                        type="text"
                        placeholder="Ex: Contratos"
                        value={conteudoNome}
                        onChange={(e) => setConteudoNome(e.target.value)}
                        className="w-full px-3.5 py-1.5 text-sm border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Data do estudo</label>
                      <input
                        type="date"
                        value={conteudoData}
                        onChange={(e) => setConteudoData(e.target.value)}
                        className="w-full px-3.5 py-1.5 text-sm border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleAddConteudo}
                      className="px-5 py-2.5 bg-emerald-650 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Agendar Cronograma Espaçado
                    </button>
                  </div>
                </div>

                {/* Search & Filters Section */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-150 dark:border-gray-750 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-gray-750">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-550/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                        <Filter className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-gray-800 dark:text-gray-100">Filtrar & Buscar Grade</h4>
                        <p className="text-[10px] text-gray-400">Encontre conteúdos antigos usando data, assunto ou matéria</p>
                      </div>
                    </div>
                    {conIsFilteringActive && (
                      <button
                        onClick={() => {
                          setConSearchQuery('');
                          setConFilterMateriaId('all');
                          setConFilterDateStart('');
                          setConFilterDateEnd('');
                        }}
                        className="self-start sm:self-auto px-2.5 py-1 text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                      >
                        ✕ Limpar Filtros
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Search query field */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Busca de Texto</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Ex: Contratos, Civil..."
                          value={conSearchQuery}
                          onChange={(e) => setConSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-xs text-gray-800 dark:text-gray-150 border border-gray-150 dark:border-gray-750 bg-gray-50/50 dark:bg-gray-850/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-semibold"
                        />
                      </div>
                    </div>

                    {/* Subject Filter field */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Filtrar por Matéria</label>
                      <select
                        value={conFilterMateriaId}
                        onChange={(e) => setConFilterMateriaId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs text-gray-800 dark:text-gray-150 border border-gray-150 dark:border-gray-750 bg-gray-50/50 dark:bg-gray-850/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-semibold"
                      >
                        <option value="all">Todas as Matérias</option>
                        {materias.map(m => (
                          <option key={m.id} value={m.id}>{m.emoji} {m.nome}</option>
                        ))}
                      </select>
                    </div>

                    {/* Start Date field */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Desde</label>
                      <input
                        type="date"
                        value={conFilterDateStart}
                        onChange={(e) => setConFilterDateStart(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs text-gray-800 dark:text-gray-150 border border-gray-150 dark:border-gray-750 bg-gray-50/50 dark:bg-gray-850/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-semibold"
                      />
                    </div>

                    {/* End Date field */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Até</label>
                      <input
                        type="date"
                        value={conFilterDateEnd}
                        onChange={(e) => setConFilterDateEnd(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs text-gray-800 dark:text-gray-150 border border-gray-150 dark:border-gray-750 bg-gray-50/50 dark:bg-gray-850/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all font-semibold"
                      />
                    </div>
                  </div>

                  {conIsDateRangeInvalid && (
                    <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-2xl">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Intervalo inválido! A data inicial ("Desde") não deve ser posterior à data final ("Até").</span>
                    </div>
                  )}

                  {conIsFilteringActive && (
                    <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-650 dark:text-emerald-400 bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10 dark:border-emerald-500/5">
                      <span>
                        🔍 Resultados da busca: Encontrados <strong>{totalConteudosFiltrados}</strong> conteúdo{totalConteudosFiltrados !== 1 ? 's' : ''} em <strong>{filteredMaterias.length}</strong> matéria{filteredMaterias.length !== 1 ? 's' : ''} correspondente{filteredMaterias.length !== 1 ? 's' : ''}.
                      </span>
                    </div>
                  )}
                </div>

                {/* Subjects breakdown list */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-2">
                    {conIsFilteringActive ? 'Resultados do Filtro' : 'Disciplinas Cultivadas'}
                  </h3>
                  
                  {materias.length === 0 ? (
                    <p className="text-center text-xs text-gray-450 py-12">Nenhuma disciplina na grade estudantil por enquanto.</p>
                  ) : filteredMaterias.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-150 dark:border-gray-700 text-center space-y-3">
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">Nenhum conteúdo estudado corresponde aos filtros ou termos de pesquisa aplicados.</p>
                      <button
                        onClick={() => {
                          setConSearchQuery('');
                          setConFilterMateriaId('all');
                          setConFilterDateStart('');
                          setConFilterDateEnd('');
                        }}
                        className="px-3.5 py-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-500 bg-emerald-50 hover:bg-emerald-100/50 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-xl transition-all cursor-pointer"
                      >
                        Redefinir Filtros 🔄
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredMaterias.map(m => (
                        <div key={m.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-xs flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center border-b border-gray-50 dark:border-gray-750 pb-2 mb-3">
                              <span className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                                <span className="text-xl select-none leading-none">{m.emoji}</span>
                                {m.nome}
                              </span>
                            </div>

                            <div className="space-y-2.5 mb-2">
                              {m.conteudos.map(c => {
                                const matchedRevsCount = revisoes.filter(r => r.grupoId === c.grupoId).length;
                                const finishedCount = Math.max(4 - matchedRevsCount, 0);

                                return (
                                  <div key={c.id} className="flex justify-between items-center text-xs p-2 rounded-xl bg-gray-50/40 dark:bg-gray-850/30 border border-gray-100/10 hover:bg-gray-50 dark:hover:bg-gray-850/70">
                                    <div>
                                      <p className="font-bold text-gray-850 dark:text-gray-200 capitalize">{c.nome}</p>
                                      <span className="text-[10px] text-gray-400">Estudado em {c.data}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-semibold text-gray-500">
                                        Revisões: {finishedCount}/4 feitas
                                      </span>
                                      <button
                                        onClick={() => handleRemoveConteudo(m.id, c.id, c.grupoId)}
                                        className="text-red-500 hover:text-red-700 font-bold"
                                        title="Excluir assunto"
                                      >
                                        🗑
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB: REVISÕES */}
            {activeTab === 'revisoes' && (
              <RevisaoList
                revisoes={revisoes}
                onAddManualRevisao={handleAddManualRevisao}
                onMarkRevisaoCompleted={handleMarkRevisaoCompleted}
                onRemoveRevisao={handleRemoveRevisao}
                getTodayDate={getTodayDate}
                showToast={showToast}
              />
            )}

            {/* TAB: LEITURAS */}
            {activeTab === 'leituras' && (
              <LeituraStation
                leituras={leituras}
                onAddLeitura={handleAddLeitura}
                onRemoveLeitura={handleRemoveLeitura}
                getTodayDate={getTodayDate}
                showToast={showToast}
                audioSynth={audioSynth}
              />
            )}



            {/* LEGACY INLINE READINGS CLEANED */}

            {/* TAB: FLASHCARDS GAMIFICADOS */}
            {activeTab === 'flashcards' && (
              <div className="space-y-6 animate-fade-in text-left">
                {/* Header card with information */}
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 rounded-3xl text-white shadow-md relative overflow-hidden">
                  <div className="relative z-10 space-y-2">
                    <span className="text-[10px] uppercase font-black tracking-widest bg-white/20 px-2.5 py-1 rounded-full text-rose-100 flex items-center gap-1 w-fit">
                      🧠 Estação Spaced Repetition, Flashcards & Memorização Ativa
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Flashcards Gamificados Automatizados</h2>
                    <p className="text-xs text-rose-100 max-w-2xl leading-relaxed">
                      Utilize a técnica de repetição espaçada (Active Recall) para fixar conteúdos estudados para sempre. Seus cartões se reajustam dinamicamente baseados na facilidade do seu acerto. Respostas corretas garantem recompensas no Jardim!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left panel: Active Study deck */}
                  <div className="lg:col-span-2 space-y-6 text-left">
                    
                    {/* Active Question Panel */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-xs space-y-4">
                      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
                        <span>🎴 Deck Ativo de Fixação</span>
                        <span className="text-xs font-bold text-rose-650 dark:text-rose-450 font-mono bg-rose-500/10 px-2.5 py-1 rounded-full">
                          {flashcards.length} Cartões Totais
                        </span>
                      </h3>

                      {flashcards.length === 0 ? (
                        <div className="p-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center text-gray-500 max-w-md mx-auto">
                          <p className="text-lg">🗃️</p>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-2">Nenhum cartão no seu arquivo</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Crie um flashcard manualmente ao lado ou use a Geração Inteligente para começar!</p>
                        </div>
                      ) : (
                        (() => {
                          // Filter card to show active or let them choose any
                          const todayStr = getTodayDate();
                          const pendingToday = flashcards.filter(fc => fc.proximaData <= todayStr);
                          const pendingNotReviewed = pendingToday.filter(fc => !reviewedThisSession.includes(fc.id));
                          const activeCard = fcActiveId !== null ? flashcards.find(c => c.id === fcActiveId) : (pendingNotReviewed.length > 0 ? pendingNotReviewed[0] : null);

                          return (
                            <div className="space-y-4 text-left">
                              {activeCard ? (
                                <>
                                  <div className="flex justify-between items-center bg-gray-55 dark:bg-gray-850 px-4 py-2.5 rounded-2xl border border-gray-150 dark:border-gray-750">
                                    <div className="flex flex-col">
                                      <span className="text-[10px] font-bold text-gray-450 dark:text-gray-500 uppercase">Assunto / Tema</span>
                                      <span className="text-xs font-black text-gray-850 dark:text-gray-200 bg-rose-500/10 px-2 py-0.5 rounded-md w-fit mt-0.5">{activeCard.assunto}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                      <span className="text-[10px] font-bold text-gray-450 dark:text-gray-500 uppercase">Dificuldade</span>
                                      <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">{activeCard.nivelDificuldade}</span>
                                    </div>
                                  </div>

                                  {/* FLIPPING CORE FLASHCARD GRID CARD */}
                                  <div 
                                    onClick={() => setFcFlipped(!fcFlipped)}
                                    className={`min-h-[220px] rounded-3xl border p-6 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.99] relative overflow-hidden select-none text-left ${
                                      fcFlipped 
                                        ? 'bg-gradient-to-br from-indigo-50 to-purple-50/40 dark:from-indigo-950/20 dark:to-purple-950/10 border-indigo-200 dark:border-indigo-850'
                                        : 'bg-white hover:bg-gray-55 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                    }`}
                                  >
                                    {fcFlipped ? (
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400">
                                          <span>💡 REVELAÇÃO EXPLICATIVA:</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-relaxed font-sans">
                                          {activeCard.resposta}
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        <div className="flex items-center gap-1.5 text-xs font-black text-rose-550 dark:text-rose-455 animate-pulse">
                                          <span>❓ PERGUNTA DE FIXAÇÃO:</span>
                                        </div>
                                        <p className="text-base sm:text-lg font-black tracking-tight text-gray-900 dark:text-white leading-snug font-sans">
                                          {activeCard.pergunta}
                                        </p>
                                      </div>
                                    )}

                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-[10px] font-extrabold text-gray-450 dark:text-gray-500 uppercase tracking-widest font-sans">
                                      <span>{fcFlipped ? "Clique para reverter à pergunta" : "Clique ou toque para Ver Resposta"}</span>
                                      <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Seq: {activeCard.sequenciaAcertos}🔥</span>
                                    </div>
                                  </div>

                                  {/* RECALL CONTROLS & DYNAMIC AI EXPLANATION */}
                                  {fcFlipped && (
                                    <div className="space-y-3 pt-2">
                                      {/* Original recall button grid */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleFlashcardRecall(activeCard.id, false);
                                          }}
                                          className="px-5 py-3 bg-rose-550 hover:bg-rose-600 text-white font-extrabold text-xs rounded-2xl cursor-pointer shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 animate-bounce-in font-sans"
                                        >
                                          Errei / Estudar Novamente 🔴
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleFlashcardRecall(activeCard.id, true);
                                          }}
                                          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-2xl cursor-pointer shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 animate-bounce-in font-sans"
                                        >
                                          Acertei / Lembrado Fácil 🟢
                                        </button>
                                      </div>

                                      {/* Gemini explanation helper button */}
                                      <div className="pt-1 select-none">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleExplainFlashcard(activeCard);
                                          }}
                                          disabled={explainingCardId === activeCard.id}
                                          className={`w-full py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black transition-all font-sans ${
                                            explainingCardId === activeCard.id
                                              ? 'bg-indigo-350 dark:bg-indigo-900/40 text-white cursor-not-allowed animate-pulse'
                                              : 'bg-indigo-650/10 hover:bg-indigo-650/20 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-350 border border-indigo-200/50 dark:border-indigo-850'
                                          } cursor-pointer`}
                                        >
                                          {explainingCardId === activeCard.id ? (
                                            <>
                                              <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent border-indigo-650 animate-spin" />
                                              Mapeando sinapses cognitivas...
                                            </>
                                          ) : (
                                            <>
                                              <span>🔮 Explicar Conceito &amp; Criar Mnemônico com Gemini IA</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="p-8 border border-dashed border-emerald-250 dark:border-emerald-800 rounded-3xl text-center max-w-md mx-auto bg-emerald-500/5 dark:bg-emerald-500/10 space-y-3 my-2 shadow-xs">
                                  <p className="text-4xl animate-bounce">🎉</p>
                                  <p className="text-sm font-black text-emerald-800 dark:text-emerald-400 font-sans">Todas as revisões concluídas por hoje!</p>
                                  <p className="text-xs text-gray-550 dark:text-gray-400 leading-relaxed font-semibold font-sans">
                                    Sua repetição espaçada está em dia. Excelente consistência nos estudos! Volte amanhã para novas sessões ou explore seus cartões na lista abaixo.
                                  </p>
                                  {reviewedThisSession.length > 0 && (
                                    <button
                                      onClick={() => setReviewedThisSession([])}
                                      className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-extrabold text-xs tracking-wider rounded-2xl transition-all cursor-pointer shadow-md active:scale-98 font-sans"
                                    >
                                      Recomeçar Sessão de Revisão 🔄
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Spaced lists indicators */}
                              <div className="pt-4 text-left">
                                <h4 className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3 text-left">Lista Completa de Decks</h4>
                                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                                  {flashcards.map(fc => (
                                    <div 
                                      key={fc.id}
                                      onClick={() => {
                                        setFcActiveId(fc.id);
                                        setFcFlipped(false);
                                      }}
                                      className={`px-3.5 py-2 rounded-xl text-left text-xs flex items-center justify-between border cursor-pointer ${
                                        fc.id === activeCard.id
                                          ? 'border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/10'
                                          : 'border-gray-150 dark:border-gray-750 hover:bg-gray-50/50'
                                      }`}
                                    >
                                      <span className="truncate max-w-[200px] font-bold text-gray-850 dark:text-gray-100">{fc.pergunta}</span>
                                      <div className="flex items-center gap-2 font-mono text-[9px] text-gray-450 shrink-0">
                                        <span className="bg-rose-500/10 px-1.5 py-0.5 rounded text-rose-600 dark:text-rose-455 font-bold">{fc.assunto}</span>
                                        <span>Prox: {fc.proximaData}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* DYNAMIC EXPANDED AI EXPLANATION DIALOG OVERLAY */}
                              {activeExplanation && (
                                <div onClick={() => setActiveExplanation(null)} className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in text-left cursor-pointer">
                                  <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col cursor-default">
                                    {/* Modal Header */}
                                    <div className="p-5 border-b border-gray-150 dark:border-gray-750 flex justify-between items-center bg-indigo-50/50 dark:bg-indigo-950/20">
                                      <div className="flex items-center gap-2">
                                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold">
                                          🔮
                                        </div>
                                        <div>
                                          <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Estufa Cognitiva IA Gemini</h3>
                                          <p className="text-[9px] text-gray-450 dark:text-gray-500 font-bold uppercase tracking-widest">{activeCard.assunto}</p>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => setActiveExplanation(null)}
                                        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-250 dark:bg-gray-750 hover:text-gray-950 dark:hover:text-white transition-all cursor-pointer text-xs"
                                      >
                                        ✕
                                      </button>
                                    </div>

                                    {/* Corpo scrollável com renderMarkdown */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-2 text-xs text-gray-700 dark:text-gray-300">
                                      {renderMarkdown(activeExplanation)}
                                    </div>

                                    {/* Footer status credits */}
                                    <div className="p-4 border-t border-gray-150 dark:border-gray-750 flex justify-between items-center text-[10px] font-bold text-gray-450 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-850/20">
                                      <span>Gerado com IA Gemini-2.5-flash</span>
                                      <button
                                        onClick={() => setActiveExplanation(null)}
                                        className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                                      >
                                        Fixar na mente 🧠
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}

                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>

                  {/* Right panel: Generate & Manual creations */}
                  <div className="space-y-6 text-left">
                    {/* Smart AI automated synthesizer card */}
                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-5 rounded-3xl border border-indigo-950/50 text-white shadow-xs space-y-3.5 text-left">
                      <div className="space-y-1 text-left">
                        <span className="text-[9px] font-extrabold tracking-widest uppercase bg-indigo-500/40 px-2 py-0.5 rounded text-indigo-200">Sintetizador de Decks</span>
                        <h4 className="text-sm font-black">Geração de Flashcards Automatizados</h4>
                        <p className="text-[11px] text-indigo-200 leading-relaxed">
                          Selecione um tópico estudado para gerar automaticamente cartões de fixação active-recall para consolidação cognitiva instantânea!
                        </p>
                      </div>

                      <div className="space-y-2 mt-4 text-gray-800 dark:text-gray-150">
                        <select
                          id="auto-generate-subject"
                          value={autoGenerateSubject}
                          onChange={(e) => setAutoGenerateSubject(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white text-gray-900 rounded-xl focus:outline-none font-bold cursor-pointer"
                        >
                          <option value="">-- Escolha um assunto --</option>
                          {getSubjectSuggestions().map((su, ix) => (
                            <option key={ix} value={su}>{su}</option>
                          ))}
                          <option value="Histórico Geral">Histórico Geral</option>
                          <option value="Direito Constitucional">Direito Constitucional</option>
                          <option value="Neurociência Integrada">Neurociência Integrada</option>
                          <option value="Cálculo Diferencial">Cálculo Diferencial</option>
                        </select>

                        <button
                          disabled={fcGenerating}
                          onClick={() => {
                            if (!autoGenerateSubject) return showToast('Selecione um assunto para sintetizar o deck!', 'warning');
                            handleTriggerAutomatedGeneration(autoGenerateSubject);
                          }}
                          className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {fcGenerating ? (
                            <>
                              <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent border-gray-900 animate-spin" />
                              Sintetizando Decks... 🧠⚡
                            </>
                          ) : (
                            "Sintetizar Decks de Fixação 🧠⚡"
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Manual active creation panel */}
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-4 text-left">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest text-left">➕ Cadastrar Flashcard Manual</h4>
                      
                      <div className="space-y-3 text-left">
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Pergunta Do Cartão</label>
                          <textarea
                            rows={2}
                            placeholder="Ex: O que é Heurística de Disponibilidade?"
                            value={fcPergunta}
                            onChange={(e) => setFcPergunta(e.target.value)}
                            className="w-full text-xs p-2.5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-150 dark:border-gray-750 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Resposta/Definição</label>
                          <textarea
                            rows={3}
                            placeholder="Ex: Viés cognitivo que superestima a frequência de informações facilmente lembradas."
                            value={fcResposta}
                            onChange={(e) => setFcResposta(e.target.value)}
                            className="w-full text-xs p-2.5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-150 dark:border-gray-750 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-3 text-left">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Tema/Assunto</label>
                            <input
                              type="text"
                              placeholder="Ex: Psicologia"
                              value={fcAssunto}
                              onChange={(e) => setFcAssunto(e.target.value)}
                              className="w-full text-xs p-2.5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-150 dark:border-gray-750 focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Dificuldade</label>
                            <select
                              value={fcDificuldade}
                              onChange={(e: any) => setFcDificuldade(e.target.value)}
                              className="w-full text-xs p-2.5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl border border-gray-150 dark:border-gray-750 focus:outline-none font-bold"
                            >
                              <option value="Fácil">Fácil</option>
                              <option value="Médio">Médio</option>
                              <option value="Difícil">Difícil</option>
                            </select>
                          </div>
                        </div>

                        <button
                          onClick={handleCreateFlashcard}
                          className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          Ativar Flashcard 🧬
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CONQUISTAS, EVENTOS E TIMELINE */}
            {activeTab === 'conquistas' && (
              <div className="space-y-6 animate-fade-in text-left">
                {/* Upper banner summary */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-650 p-6 rounded-3xl text-white shadow-md relative overflow-hidden">
                  <div className="relative z-10 space-y-2">
                    <span className="text-[10px] uppercase font-black tracking-widest bg-white/20 px-2.5 py-1 rounded-full text-emerald-100 flex items-center gap-1 w-fit">
                      🏆 Insígnias de Cultivo, Linha do Tempo e Gestão Ambiental
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Gamificação Integrativa e Ecossistema do Jardim</h2>
                    <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
                      Sua dedicação acadêmica floresce o solo. Colete as insígnias de cultivo mais nobres, simule e trate pragas no solo de sua estufa e visualize a sua história de esforço em ordem cronológica!
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                  {/* Left part: Insignias deck (2 Columns wide) */}
                  <div className="lg:col-span-2 space-y-6 text-left">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-xs space-y-4 text-left">
                      <div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">🏆 Insígnias de Cultivo Colecionáveis (Badges)</h3>
                        <p className="text-xs text-gray-400 mt-1">Acumule conquistas completando sessões, anotações detalhadas, livros lidos e resolvendo simulações!</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {achievements.map((ach) => (
                          <div 
                            key={ach.id}
                            className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex gap-3 text-left ${
                              ach.desbloqueado
                                ? `bg-gradient-to-br from-white to-gray-50/30 dark:from-gray-800 dark:to-gray-850/20 border-gray-150 dark:border-gray-750 shadow-xs border-emerald-400/35`
                                : 'bg-gray-50/50 dark:bg-gray-900 border-gray-150 dark:border-gray-800 opacity-60'
                            }`}
                          >
                            {/* Icon / Badge color */}
                            <div className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-tr ${ach.corBadge} text-white flex items-center justify-center text-xl shadow-md`}>
                              {ach.desbloqueado ? ach.emoji : '🔒'}
                            </div>

                            <div className="space-y-1 w-full text-left">
                              <div className="flex items-center justify-between text-left">
                                <h4 className="text-xs font-black text-gray-900 dark:text-white truncate max-w-[110px]">{ach.titulo}</h4>
                                <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                                  ach.desbloqueado 
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold' 
                                    : 'bg-gray-105 dark:bg-gray-850 text-gray-450'
                                }`}>
                                  {ach.desbloqueado ? 'Adquirida' : 'Bloqueada'}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-300 leading-snug">{ach.descricao}</p>
                              
                              <div className="pt-1 flex items-center justify-between text-[9px] text-gray-400 dark:text-gray-500">
                                <span className="font-bold">Meta: {ach.requisitoTxt}</span>
                                <span className="text-amber-500 font-extrabold flex items-center gap-0.5 shrink-0">+{ach.xpBonus} FP</span>
                              </div>

                              {ach.desbloqueado && ach.dataDesbloqueio && (
                                <p className="text-[8px] font-black text-gray-400 dark:text-gray-500 text-right mt-1 font-mono uppercase bg-gray-50 dark:bg-gray-950 p-1 rounded">
                                  Conquistado em: {ach.dataDesbloqueio}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline section: Linha do Tempo Estética de Coletas e Frutos */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-xs space-y-4 text-left">
                      <div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">🌱 Linha do Tempo de Coletas e Frutos</h3>
                        <p className="text-xs text-gray-400 mt-1">Seu registro cronológico de conquistas intelectuais, sementes germinadas e pragas tratadas.</p>
                      </div>

                      <div className="relative border-l border-gray-200 dark:border-gray-800 pl-4 ml-2.5 space-y-4 max-h-[340px] overflow-y-auto pr-1 text-left">
                        {timelineEvents.map((ev) => (
                          <div key={ev.id} className="relative group text-left">
                            {/* Dot indicator */}
                            <div className="absolute -left-[24.5px] top-1 w-4 h-4 rounded-full bg-white dark:bg-gray-900 border border-emerald-500 flex items-center justify-center text-[10px] shadow-sm shrink-0">
                              {ev.emoji}
                            </div>

                            <div className="bg-gray-50/50 dark:bg-gray-850 p-3 rounded-2xl border border-gray-100 dark:border-gray-750 transition-all hover:bg-gray-100/95 dark:hover:bg-gray-800 space-y-1 text-left">
                              <div className="flex items-center justify-between text-left">
                                <h4 className="text-xs font-black text-gray-800 dark:text-gray-100">{ev.titulo}</h4>
                                <span className="text-[9px] font-mono text-gray-400">{ev.data}</span>
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400">{ev.mensagem}</p>
                              <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                ev.tipo === 'colheita' 
                                  ? 'bg-amber-500/10 text-amber-600'
                                  : ev.tipo === 'recompensa' 
                                  ? 'bg-purple-500/10 text-purple-600 font-extrabold' 
                                  : 'bg-teal-500/10 text-teal-650'
                              }`}>
                                {ev.tipo}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right part: Daily Events Simulator */}
                  <div className="space-y-6 text-left">
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-4 text-left">
                      <div className="space-y-1 text-left">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                          <span>👾</span> Eventos & Pragas da Estufa
                        </h3>
                        <p className="text-[11px] text-gray-400">
                          Pragas causam perda nutricional se esquecidas. Faça simulações e limpe os solos para acumular FP e sementes lendárias!
                        </p>
                      </div>

                      {/* Simulator Active state box */}
                      {gardenEvent ? (
                        <div className={`p-4 rounded-2xl border text-left ${
                          gardenEvent.pernicioso 
                            ? 'bg-rose-500/10 border-rose-250 text-rose-900 dark:text-red-300'
                            : 'bg-emerald-500/10 border-emerald-250 text-emerald-900 dark:text-emerald-300'
                        } space-y-3`}>
                          <div className="flex items-start gap-1.5 text-left">
                            <span className="text-xl inline-block mt-0.5 shrink-0">{gardenEvent.tipo === 'pula_pulga' ? '🕷️' : '☀️'}</span>
                            <div className="text-left w-full">
                              <h4 className="text-xs font-black tracking-tight text-left">{gardenEvent.titulo}</h4>
                              <p className="text-[10px] font-semibold opacity-90 mt-0.5 leading-snug">{gardenEvent.descricao}</p>
                            </div>
                          </div>

                          <div className="text-[10px] font-bold bg-white/40 dark:bg-black/20 p-2 rounded-lg space-y-1 text-gray-700 dark:text-gray-300 text-left">
                            <p>⚠️ Consumo / Efeito: {gardenEvent.impactoTxt}</p>
                            <p>⏳ Prazo de Ação: {gardenEvent.duracaoDias} dias</p>
                          </div>

                          {gardenEvent.pernicioso ? (
                            <button
                              onClick={() => {
                                // Treat Pests using 1 water reserve droplet
                                if (gardenSettings.waterReserve < 1) {
                                  return showToast('Você precisa de pelo menos 1 drop de Regador 💧 para tratar as pragas!', 'warning');
                                }
                                setGardenSettings(prev => ({
                                  ...prev,
                                  waterReserve: prev.waterReserve - 1,
                                  focusPoints: prev.focusPoints + 35 // Reward 35 FP
                                }));
                                addTimelineEvent('Solo Higienizado 🧹', `Tratou o solo e dedetizou as pragas de "${gardenEvent.titulo}"!`, 'colheita', '🧹');
                                setGardenEvent(null);
                                showToast('Praga tratada! Solo esterilizado com sucesso. Recompensa: +35 FP!', 'success');
                              }}
                              className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
                            >
                              Aplicar Saneador Ambiental (Consome 1 💧)
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                // Embrace good weather event
                                setGardenSettings(prev => ({
                                  ...prev,
                                  focusPoints: prev.focusPoints + 20
                                }));
                                addTimelineEvent('Clima Aproveitado ☀️', `Aproveitou a bênção solar de "${gardenEvent.titulo}" para germinar sementes!`, 'colheita', '☀️');
                                setGardenEvent(null);
                                showToast('Evento concluído! Seus conhecimentos absorveram energia renovada, +20 FP!', 'success');
                              }}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
                            >
                              Coletar Nutrientes do Clima ✨
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 border border-dashed border-gray-150 rounded-2xl text-center text-gray-500 bg-gray-50/20">
                          <p className="text-xl">☀️</p>
                          <p className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mt-1">Clima da Estufa Estável</p>
                          <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">Nenhuma praga ou evento ativo no momento.</p>
                        </div>
                      )}

                      {/* Simulate Button trigger */}
                      <button
                        onClick={() => {
                          const scenarios = [
                            {
                              id: 101,
                              titulo: "Praga de Pulgões nos Brotos 🕷️",
                              descricao: "Seus cactos estão sofrendo ataques de insetos oportunistas devido ao clima quente da estufa.",
                              pernicioso: true,
                              duracaoDias: 2,
                              impactoTxt: "Reduz vigor da terra. Trate com 1 gota de regador.",
                              tipo: 'pula_pulga' as const
                            },
                            {
                              id: 102,
                              titulo: "Solstício de Radiância Intensa ☀️",
                              descricao: "Luz solar abundante acelera o metabolismo. Excelente oportunidade para fotossíntese.",
                              pernicioso: false,
                              duracaoDias: 1,
                              impactoTxt: "Regala +20 FP de bônus clorofilado instantâneo.",
                              tipo: 'sol_intenso' as const
                            },
                            {
                              id: 103,
                              titulo: "Invasão de Caracóis Mendedores de Folhas 🐌",
                              descricao: "O solo úmido atraiu moluscos vorazes que atacam sementes jovens de Sakura.",
                              pernicioso: true,
                              duracaoDias: 3,
                              impactoTxt: "Ameaça brotação. Requer Regador Tratado para esterilizar.",
                              tipo: 'pula_pulga' as const
                            }
                          ];

                          const randomChoice = scenarios[Math.floor(Math.random() * scenarios.length)];
                          setGardenEvent(randomChoice);
                          addTimelineEvent('Inflexão Ambiental 🎲', `Nova dinâmica de estufa: "${randomChoice.titulo}"!`, 'colheita', '🎲');
                          showToast(`Simulador Ativado: ${randomChoice.titulo}`, 'info');
                        }}
                        className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-650 dark:text-gray-100 font-extrabold text-xs rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer shadow-xs active:scale-98 flex items-center justify-center gap-1.5"
                      >
                        Simular Praga / Clima Estufa 🎲⛈️
                      </button>
                    </div>

                    {/* Additional helpful guide */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-905 border border-amber-100 dark:border-gray-800 p-4 rounded-3xl text-left space-y-2">
                      <span className="text-emerald-600 dark:text-teal-400 font-bold text-xs flex items-center gap-1">
                        <span>🧪</span> Dica de Pesquisa Acadêmica
                      </span>
                      <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                        A higienização biológica do solo protege suas árvores maduras contra o esquecimento. Mantenha seu deck de <strong>Flashcards de Memorização</strong> atualizado diariamente para ativar resistências naturais às pragas e insetos!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'anotacoes' && (
              <div className="space-y-6">
                
                {/* Header card with information */}
                <div className="bg-gradient-to-r from-cyan-600 to-teal-650 p-6 rounded-3xl text-white shadow-md relative overflow-hidden">
                  <div className="relative z-10 space-y-2">
                    <span className="text-[10px] uppercase font-black tracking-widest bg-white/20 px-2.5 py-1 rounded-full text-cyan-100 flex items-center gap-1 w-fit">
                      <Sparkles className="w-3 h-3 animate-spin" /> Bloco de Notas, Insights & Prêmios Autoral
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Criação de Conhecimento e Síntese Intelectual</h2>
                    <p className="text-xs text-cyan-100 max-w-2xl leading-relaxed">
                      Efetuar anotações sobre o que você estuda é fundamental para a fixação. Aqui, seus resumos, insights e conceitos geram pontuação direta de XP, água e adubo para o seu jardim! Notas maiores e estruturadas geram recompensas ainda mais ricas.
                    </p>
                  </div>
                  {/* Subtle geometric background light */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl transform translate-x-12 -translate-y-12" />
                </div>

                {/* Main panel divide layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT COLUMN: Insights History & Selector */}
                  <div className="lg:col-span-4 space-y-4">
                    <button
                      onClick={handleCreateNovaNota}
                      className="w-full py-3 bg-cyan-605 hover:bg-cyan-650 text-white rounded-2xl font-bold text-xs shadow-md shadow-cyan-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Escrever Nova Anotação
                    </button>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-xs space-y-3">
                      <div className="font-bold text-xs text-gray-500 uppercase tracking-widest px-1">
                        Suas Memórias ({anotacoes.length})
                      </div>

                      {anotacoes.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-400">
                          Nenhum insight rascunhado ainda.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                          {anotacoes.map(n => {
                            const isSelected = nNotaAtivaId === n.id;
                            return (
                              <div
                                key={n.id}
                                onClick={() => {
                                  setNNotaAtivaId(n.id);
                                  setNTitulo(n.titulo);
                                  setNConteudo(n.conteudo);
                                  setNAssunto(n.assunto);
                                  audioSynth.playClick();
                                }}
                                className={`group p-3.5 rounded-2xl border transition-all cursor-pointer text-left relative ${
                                  isSelected
                                    ? 'bg-cyan-50/70 border-cyan-300 dark:bg-cyan-950/20 dark:border-cyan-850'
                                    : 'bg-gray-50/50 hover:bg-gray-50 border-gray-100 dark:bg-gray-850/20 dark:border-gray-750/30 dark:hover:bg-gray-850/60'
                                }`}
                              >
                                <div className="flex justify-between items-start gap-1">
                                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-gray-100 dark:bg-gray-800 text-gray-650 dark:text-gray-400">
                                    {n.assunto}
                                  </span>
                                  <span className="text-[9px] text-gray-400 font-mono">{n.data}</span>
                                </div>
                                
                                <h4 className="font-bold text-xs text-gray-905 dark:text-white mt-2 truncate capitalize">
                                  {n.titulo}
                                </h4>
                                <p className="text-[10px] text-gray-400 mt-0.5 count-char truncate">
                                  {n.conteudo}
                                </p>

                                <div className="flex items-center justify-between mt-3 border-t border-gray-100/50 dark:border-gray-700/50 pt-2 text-[9px]">
                                  <span className="text-gray-400 font-mono">
                                    {n.caracteres} caracteres
                                  </span>

                                  {n.recompensaResgatada ? (
                                    <span className="text-emerald-600 font-bold flex items-center gap-0.5 dark:text-emerald-400">
                                      🔒 Resgatado
                                    </span>
                                  ) : n.caracteres >= 50 ? (
                                    <span className="text-cyan-605 font-bold flex items-center gap-0.5 dark:text-cyan-400 animate-pulse">
                                      🔓 Resgatar!
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 italic">
                                      Curta (+50 carac)
                                    </span>
                                  )}
                                </div>

                                {/* Fast delete button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNota(n.id);
                                  }}
                                  className="absolute top-2 right-2 p-1 opacity-0 hover:opacity-100 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:scale-110 transition-all cursor-pointer"
                                  title="Apagar Nota"
                                >
                                  ✕
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: Note Writing & Reward Station */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-4">
                      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-750 pb-3">
                        <h3 className="text-sm font-extrabold text-gray-950 dark:text-white flex items-center gap-1.5">
                          <Lightbulb className="w-4 h-4 text-cyan-500" />
                          {nNotaAtivaId ? 'Editar Anotação Salva' : 'Escrever Nova Produção'}
                        </h3>
                        {nNotaAtivaId && (
                          <button
                            onClick={() => handleDeleteNota(nNotaAtivaId)}
                            className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1 shrink-0"
                          >
                            Excluir Nota 🗑
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Título da Anotação</label>
                          <input
                            type="text"
                            placeholder="Dê um título expressivo (Ex: Mecanismo de Ação do Ibuprofeno)"
                            value={nTitulo}
                            onChange={(e) => setNTitulo(e.target.value)}
                            className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Assunto / Tópico</label>
                          <input
                            type="text"
                            placeholder="Ex: Farmacologia, História Geral, TCC, etc."
                            value={nAssunto}
                            onChange={(e) => setNAssunto(e.target.value)}
                            className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase flex justify-between">
                          <span>Conteúdo Intelectual (Síntese)</span>
                          <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 font-bold">
                            {nConteudo.length} caracteres
                          </span>
                        </label>
                        <textarea
                          rows={12}
                          placeholder="Escreva seus resumos, fórmulas, sinopse, redações ou observações científicas aqui. Use o espaço para consolidar o que você aprendeu de forma ativa..."
                          value={nConteudo}
                          onChange={(e) => setNConteudo(e.target.value)}
                          className="w-full p-4 border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-900 text-gray-850 dark:text-gray-150 rounded-2xl text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
                        />
                      </div>

                      {/* Dynamic Prize Simulator Panel based on Writing counts */}
                      <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 space-y-3">
                        <div className="flex items-center justify-between border-b border-cyan-500/10 pb-2">
                          <h4 className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                            🏆 Simulador de Bonificações de Escrita
                          </h4>
                          <span className="text-[10px] font-mono text-gray-500">
                            Nível de Profundidade
                          </span>
                        </div>

                        {(() => {
                          const userLength = nConteudo.length;
                          let lvlName = "Vazio";
                          let remaining = 50 - userLength;
                          let xp = 0, water = 0, fert = 0;

                          if (userLength === 0) {
                            lvlName = "Nenhum Conteúdo";
                          } else if (userLength < 50) {
                            lvlName = "Esboço Rápido (Insuficiente)";
                            xp = 10;
                          } else if (userLength >= 50 && userLength < 200) {
                            lvlName = 'Level Bronze 🥉';
                            xp = 20;
                            water = 1;
                          } else if (userLength >= 200 && userLength < 800) {
                            lvlName = 'Level Prata (Excelente Recall) 🥈';
                            xp = 50;
                            water = 2;
                            fert = 1;
                          } else {
                            lvlName = 'Level Ouro (Tese Completa) 🥇';
                            xp = 110;
                            water = 4;
                            fert = 2;
                          }

                          return (
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-900 dark:text-white">
                                  {lvlName}
                                </p>
                                <p className="text-[11px] text-gray-400 leading-normal">
                                  {remaining > 0 ? (
                                    <>Faltam mais <strong className="text-cyan-600 dark:text-cyan-400 font-mono">{remaining} caracteres</strong> para desbloquear a recompensa inicial!</>
                                  ) : (
                                    <>Você gerou um mapa mental de alta consistência intelectual. Pronto para lucrar no jardim!</>
                                  )}
                                </p>
                              </div>

                              <div className="flex gap-2.5 shrink-0 self-end sm:self-auto">
                                <div className="flex flex-col items-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-750 px-2.5 py-1 rounded-xl text-center">
                                  <span className="text-[8px] font-bold text-gray-400 uppercase">XP Ganhos</span>
                                  <span className="text-xs font-black text-amber-500">+{xp} FP</span>
                                </div>
                                <div className="flex flex-col items-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-750 px-2.5 py-1 rounded-xl text-center">
                                  <span className="text-[8px] font-bold text-gray-400 uppercase">Regador</span>
                                  <span className="text-xs font-black text-blue-500">+{water} 💧</span>
                                </div>
                                <div className="flex flex-col items-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-750 px-2.5 py-1 rounded-xl text-center">
                                  <span className="text-[8px] font-bold text-gray-400 uppercase">Adubo</span>
                                  <span className="text-xs font-black text-emerald-500">+{fert} 🍂</span>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={handleSaveNota}
                            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-750 dark:hover:bg-gray-700 dark:text-gray-100 rounded-xl font-extrabold text-xs shadow-xs cursor-pointer"
                          >
                            Salvar Alterações 💾
                          </button>

                          <button
                            disabled={aiGenerating}
                            onClick={handleGenerateAIFlashcards}
                            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                              aiGenerating 
                                ? 'bg-cyan-100 text-cyan-650 dark:bg-cyan-950/40 dark:text-cyan-400 cursor-wait animate-pulse'
                                : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 text-white shadow-cyan-500/10 hover:shadow-cyan-500/20'
                            }`}
                          >
                            {aiGenerating ? (
                              <>
                                <span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full" />
                                Cultivando Cartões...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                Gerar Flashcards com IA ✨
                              </>
                            )}
                          </button>

                          {nNotaAtivaId && (() => {
                            const activeNote = anotacoes.find(n => n.id === nNotaAtivaId);
                            if (!activeNote) return null;
                            return (
                              <>
                                <button
                                  onClick={() => handleExportMarkdown(activeNote)}
                                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs cursor-pointer"
                                  title="Exportar como Markdown (.md)"
                                >
                                  Exportar Markdown 📥
                                </button>
                                <button
                                  onClick={() => handlePrintPDF(activeNote)}
                                  className="px-4 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl font-bold text-xs cursor-pointer"
                                  title="Imprime ou exporta em PDF"
                                >
                                  Imprimir PDF 🖨️
                                </button>
                              </>
                            );
                          })()}
                        </div>

                        {nNotaAtivaId ? (
                          (() => {
                            const nota = anotacoes.find(n => n.id === nNotaAtivaId);
                            const resgatado = nota?.recompensaResgatada;
                            const habilitado = (nota?.caracteres || 0) >= 50;

                            return (
                              <button
                                onClick={() => handleClaimNotaRecompensas(nNotaAtivaId)}
                                disabled={resgatado || !habilitado}
                                className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md ${
                                  resgatado
                                    ? 'bg-gray-100 dark:bg-gray-850 text-gray-450 cursor-not-allowed shadow-none border border-gray-200 dark:border-gray-800'
                                    : !habilitado
                                    ? 'bg-cyan-500/10 text-cyan-400 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-cyan-500 to-teal-550 hover:from-cyan-600 hover:to-teal-650 text-white cursor-pointer active:scale-98 transition-all'
                                }`}
                              >
                                {resgatado ? (
                                  <>Recompensa Resgatada! 🔒</>
                                ) : (
                                  <>Resgatar Prêmios Intelectuais! 🚀</>
                                )}
                              </button>
                            );
                          })()
                        ) : (
                          <button
                            onClick={handleSaveNota}
                            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-550 text-white rounded-xl font-bold text-xs"
                          >
                            Salvar p/ Ativar Prêmios 🔓
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>
      </main>

      {/* MODAL: INTERACTIVE WATERING & NURTURE PANEL */}
      {selectedTreeForNurture && (
        <WateringPanel
          tree={selectedTreeForNurture}
          settings={gardenSettings}
          onModifyTree={handleModifyTree}
          onModifySettings={handleModifySettings}
          showToast={showToast}
          onClose={() => {
            setSelectedTreeForNurture(null);
          }}
        />
      )}

      {/* MODAL: METAS CONFIGURATION AND TIMESPACES SETTINGS */}
      {isMetasOpen && (
        <div onClick={() => setIsMetasOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer">
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden p-6 max-w-md w-full border border-gray-150 dark:border-gray-800 space-y-4 cursor-default">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">🎯 Metas de Produtividade Diária</h3>
              <p className="text-xs text-gray-500">Defina seus objetivos para manter o Streak ativo.</p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs text-gray-700">
              <div className="space-y-1">
                <label className="font-bold text-gray-500 block">Questões</label>
                <input
                  type="number"
                  min={0}
                  value={metas.questoes}
                  onChange={(e) => setMetas({ ...metas, questoes: Number(e.target.value) })}
                  className="w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-800 px-2.5 py-1.5 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 block">Revisões</label>
                <input
                  type="number"
                  min={0}
                  value={metas.revisoes}
                  onChange={(e) => setMetas({ ...metas, revisoes: Number(e.target.value) })}
                  className="w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-800 px-2.5 py-1.5 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 block">Leituras</label>
                <input
                  type="number"
                  min={0}
                  value={metas.leituras}
                  onChange={(e) => setMetas({ ...metas, leituras: Number(e.target.value) })}
                  className="w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-800 px-2.5 py-1.5 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-500 block">Minutos Foco</label>
                <input
                  type="number"
                  min={0}
                  value={metas.tempoMin}
                  onChange={(e) => setMetas({ ...metas, tempoMin: Number(e.target.value) })}
                  className="w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-800 px-2.5 py-1.5 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <fieldset className="border border-gray-150 dark:border-gray-800 p-3 rounded-lg text-xs">
              <legend className="font-bold text-emerald-650 px-1.5">Intervalos do Ciclo Espaçado (dias)</legend>
              <div className="grid grid-cols-4 gap-2">
                {metas.intervalosCiclo.map((dia, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Rega {idx+1}</span>
                    <input
                      type="number"
                      min={1}
                      value={dia}
                      onChange={(e) => {
                        const copy = [...metas.intervalosCiclo];
                        copy[idx] = Math.max(Number(e.target.value), 1);
                        setMetas({ ...metas, intervalosCiclo: copy });
                      }}
                      className="w-full border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-800 p-1.5 rounded text-gray-900 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </fieldset>

            <div className="border-t border-gray-150 dark:border-gray-800 pt-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">💾</span>
                  <span className="text-xs font-black text-gray-800 dark:text-gray-200">Cópia de Segurança (Backup)</span>
                </div>
                
                {/* Auto backup switch */}
                <label className="relative inline-flex items-center cursor-pointer select-none text-[11px] font-bold text-gray-600 dark:text-gray-300 gap-1.5">
                  <input
                    type="checkbox"
                    checked={!!gardenSettings.autoBackupEnabled}
                    onChange={(e) => setGardenSettings(prev => ({ ...prev, autoBackupEnabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-7 h-4 bg-gray-200 dark:bg-gray-750 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500 relative"></div>
                  <span>Auto-Backup</span>
                </label>
              </div>
              
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium leading-relaxed">
                {gardenSettings.autoBackupEnabled 
                  ? "Sua Estufa está protegida! Backup incremental automático ativado a cada nova ação significativa (revisões, notas, etc)." 
                  : "Backup automático desativado. Exporte seus dados locais manualmente como arquivo JSON para segurança."}
              </p>

              {/* Restore Auto-Backup option if exists */}
              {localStorage.getItem('cultivamente_auto_backup') && (
                <div className="p-2.5 bg-amber-500/5 hover:bg-amber-500/10 dark:bg-amber-950/10 dark:hover:bg-amber-950/20 border border-amber-500/20 rounded-xl text-center flex flex-col items-center gap-1">
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">
                    ⚠️ Cópia de Segurança Salva no Navegador
                  </span>
                  <button
                    type="button"
                    onClick={handleRestoreAutoBackup}
                    className="text-[10px] bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-extrabold px-3 py-1 rounded-lg transition-all cursor-pointer"
                  >
                    Restaurar Auto-Backup Recente 🔄
                  </button>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="px-3 py-2 bg-indigo-50/50 hover:bg-indigo-100/50 dark:bg-indigo-950/25 dark:hover:bg-indigo-950/40 border border-indigo-250 dark:border-indigo-900 text-indigo-700 dark:text-indigo-400 font-extrabold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  Exportar Backup 📥
                </button>
                
                <label className="px-3 py-2 bg-emerald-50/50 hover:bg-emerald-100/50 dark:bg-emerald-950/25 dark:hover:bg-emerald-950/40 border border-emerald-250 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 font-extrabold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer text-center select-none text-xs">
                  Importar Backup 📤
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsMetasOpen(false)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-lg"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM DESIGNED CONFIRMATION MODAL OVERLAY */}
      {confirmModal && (
        <div onClick={() => setConfirmModal(null)} className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[10000] p-4 animate-fade-in cursor-pointer">
          <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl max-w-md w-full overflow-hidden text-left animate-zoom-in cursor-default">
            {/* Header */}
            <div className="p-5 border-b border-gray-150 dark:border-gray-750 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/20">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400 font-bold text-xs select-none">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white">
                    {confirmModal.title}
                  </h3>
                  <p className="text-[9px] text-rose-550 dark:text-rose-455 font-bold uppercase tracking-widest leading-none mt-0.5">
                    {confirmModal.isIrreversible ? 'Ação Irreversível' : 'Ação de Segurança'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfirmModal(null)}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-705 dark:hover:bg-gray-700 hover:text-gray-950 dark:hover:text-white transition-all cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* Message Body */}
            <div className="p-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
                {confirmModal.message}
              </p>
            </div>

            {/* Footer Controls */}
            <div className="p-4 border-t border-gray-150 dark:border-gray-750 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-850/20">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-300 font-extrabold text-xs rounded-xl cursor-pointer transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setConfirmModal(null);
                  try {
                    confirmModal.onConfirm();
                  } catch (e) {
                    console.error("Erro na confirmação do modal:", e);
                  }
                }}
                className="px-4 py-2 bg-rose-550 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all shadow-md active:scale-95"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST SYSTEM CONTAINER */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-md w-full sm:w-85 pointer-events-none p-4">
        <AnimatePresence>
          {toasts.map((toast) => {
            const getColors = () => {
              switch (toast.type) {
                case 'success':
                  return 'bg-emerald-50 dark:bg-emerald-950/95 text-emerald-950 dark:text-emerald-100 border-emerald-250 dark:border-emerald-900/60';
                case 'error':
                  return 'bg-rose-50 dark:bg-rose-950/95 text-rose-950 dark:text-rose-100 border-rose-250 dark:border-rose-900/60';
                case 'warning':
                  return 'bg-amber-50 dark:bg-amber-950/95 text-amber-950 dark:text-amber-100 border-amber-250 dark:border-amber-900/60';
                case 'info':
                default:
                  return 'bg-blue-50 dark:bg-blue-950/95 text-blue-950 dark:text-blue-100 border-blue-250 dark:border-blue-900/60';
              }
            };

            const getIcon = () => {
              switch (toast.type) {
                case 'success':
                  return <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />;
                case 'error':
                  return <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
                case 'warning':
                  return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
                case 'info':
                default:
                  return <Info className="w-5 h-5 text-blue-600 shrink-0" />;
              }
            };

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xl pointer-events-auto backdrop-blur-xs ${getColors()}`}
              >
                {getIcon()}
                <div className="flex-1 text-xs font-bold leading-relaxed">
                  {toast.message}
                </div>
                <button
                  type="button"
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="text-gray-400 hover:text-gray-650 dark:hover:text-gray-200 focus:outline-none transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
