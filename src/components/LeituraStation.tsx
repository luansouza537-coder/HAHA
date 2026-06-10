import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Leitura } from '../types';
import { BookMarked, BookOpen, Trash2, Plus, Trophy, Star } from 'lucide-react';

interface LeituraStationProps {
  leituras: Leitura[];
  onAddLeitura: (
    titulo: string,
    tipo: Leitura['tipo'],
    paginas: number,
    assunto: string,
    data: string,
    categoriaFilme: string
  ) => void;
  onRemoveLeitura: (id: number) => void;
  getTodayDate: () => string;
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  audioSynth: {
    playClick: () => void;
  };
}

export const LeituraStation: React.FC<LeituraStationProps> = ({
  leituras,
  onAddLeitura,
  onRemoveLeitura,
  getTodayDate,
  showToast,
  audioSynth,
}) => {
  const [lTipo, setLTipo] = useState<Leitura['tipo']>('Livro');
  const [lTitulo, setLTitulo] = useState('');
  const [lAssunto, setLAssunto] = useState('');
  const [lData, setLData] = useState(getTodayDate());
  const [lPaginas, setLPaginas] = useState(280);
  const [lCategoriaFilme, setLCategoriaFilme] = useState('Outros (Filme convencional / Lazer)');

  const handleSubmit = () => {
    if (!lTitulo.trim()) {
      const typeLabel = lTipo === 'Livro' ? 'título do livro' : 'título do material';
      return showToast(`Por favor, insira o ${typeLabel}!`, 'warning');
    }
    
    onAddLeitura(lTitulo, lTipo, lPaginas, lAssunto, lData, lCategoriaFilme);
    
    // Reset state
    setLTitulo('');
    setLAssunto('');
    setLData(getTodayDate());
    // Assign sensible default based on current type again
    if (lTipo === 'Livro') setLPaginas(280);
    else if (lTipo === 'Artigo') setLPaginas(20);
    else if (lTipo === 'Filme') setLPaginas(120);
    else if (lTipo === 'Podcast') setLPaginas(30);
    else setLPaginas(8);
  };

  const handleTypeSelect = (type: Leitura['tipo'], defaultPages: number) => {
    setLTipo(type);
    setLPaginas(defaultPages);
    audioSynth.playClick();
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-orange-500/10 border border-amber-500/20 p-6 md:p-8 dark:from-amber-950/20 dark:to-orange-950/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase bg-amber-500/20 text-amber-705 dark:text-amber-400">
              <BookMarked className="w-3 h-3 animate-pulse" />
              Estação Intelectual
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              CultivaMente 🌿🧠
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-350 max-w-xl">
              A cada leitura finalizada, você extrai nutrientes para o seu jardim mental. Quanto maior a obra concluída, mais água e adubo lendário você absorve para regar suas árvores!
            </p>
          </div>
          {/* Stat Cards Header */}
          <div className="flex gap-2.5 flex-wrap">
            <div className="bg-white/80 dark:bg-gray-900/40 border border-amber-200/50 dark:border-amber-900/20 px-4 py-2.5 rounded-2xl flex flex-col">
              <span className="text-[9px] font-extrabold text-gray-400 dark:text-gray-500 uppercase">Livros & Artigos</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {leituras.filter(l => l.tipo === 'Livro' || l.tipo === 'Artigo').length} 📚
              </span>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/40 border border-amber-200/50 dark:border-amber-900/20 px-4 py-2.5 rounded-2xl flex flex-col">
              <span className="text-[9px] font-extrabold text-gray-400 dark:text-gray-500 uppercase">Filmes & Podcasts</span>
              <span className="text-xl font-black text-teal-650 dark:text-teal-400 font-mono">
                {leituras.filter(l => l.tipo === 'Filme' || l.tipo === 'Podcast').length} 🎙️
              </span>
            </div>
            <div className="bg-white/80 dark:bg-gray-900/40 border border-amber-200/50 dark:border-amber-900/20 px-4 py-2.5 rounded-2xl flex flex-col">
              <span className="text-[9px] font-extrabold text-gray-400 dark:text-gray-500 uppercase">Volume Total</span>
              <span className="text-xl font-black text-indigo-650 dark:text-indigo-400 font-mono">
                {leituras.reduce((acc, curr) => acc + (curr.paginas || 0), 0)} min/p.
              </span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Grid: Form registering (Apenas Leitura de Nome) vs Reward Rules Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Registering Form Panel */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Registrar Conclusão Intelectual 🧠</h3>
              <p className="text-[11px] text-gray-500">Registre livros, artigos, filmes ou podcasts e alimente seu Jardim Mental.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Name of the Reading - Centralized single field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-350 flex items-center gap-1.5 animate-fade-in">
                <span>
                  {lTipo === 'Livro' ? '📚' 
                    : lTipo === 'Artigo' ? '📄' 
                    : lTipo === 'Filme' ? '🎬' 
                    : lTipo === 'Podcast' ? '🎙️' 
                    : lTipo === 'Escrita Artigo' ? '✍️' 
                    : lTipo === 'TCC' ? '🎓' 
                    : lTipo === 'Resumo' ? '📝' 
                    : lTipo === 'Redação' ? '✏️' 
                    : lTipo === 'Reportagem' ? '📰' 
                    : lTipo === 'Mídia Social' ? '📱' 
                    : '📝'}
                </span>{' '}
                {lTipo === 'Livro'
                  ? 'Título do Livro Concluído:'
                  : lTipo === 'Artigo'
                  ? 'Título do Artigo ou Pesquisa:'
                  : lTipo === 'Filme'
                  ? 'Título do Filme ou Documentário:'
                  : lTipo === 'Podcast'
                  ? 'Título do Podcast / Episódio:'
                  : lTipo === 'Escrita Artigo'
                  ? 'Título do Artigo Científico Escrito:'
                  : lTipo === 'TCC'
                  ? 'Título do TCC ou Monografia Produzida:'
                  : lTipo === 'Resumo'
                  ? 'Título do Resumo / Abstract de Estudo:'
                  : lTipo === 'Redação'
                  ? 'Título da Redação ou Ensaio Redigido:'
                  : lTipo === 'Reportagem'
                  ? 'Título da Reportagem / Crônica Crítica:'
                  : lTipo === 'Mídia Social'
                  ? 'Título do Post Intelectual / Thread Educativa:'
                  : 'Título do Material de Estudo:'}
              </label>
              <input
                type="text"
                placeholder={
                  lTipo === 'Livro'
                    ? 'Ex: Teoria Geral do Estado, Crítica da Razão Pura...'
                    : lTipo === 'Artigo'
                    ? 'Ex: Inteligência de Máquinas e Aprendizado, Artigo 19 da LINDB...'
                    : lTipo === 'Filme'
                    ? 'Ex: O Jogo da Imitação, Uma Mente Brilhante, Interestelar...'
                    : lTipo === 'Podcast'
                    ? 'Ex: SciCast #450, Nerdologia Biologia Humana...'
                    : lTipo === 'Escrita Artigo'
                    ? 'Ex: Redes Neurais na Engenharia Biomédica, Análise do Artigo 5º...'
                    : lTipo === 'TCC'
                    ? 'Ex: Impacto da LGPD nos Setores de Tecnologia da Infomação...'
                    : lTipo === 'Resumo'
                    ? 'Ex: Resumo de Direito Constitucional, Principais Conceitos de Termodinâmica...'
                    : lTipo === 'Redação'
                    ? 'Ex: O Futuro da Democracia Digital, Desafios Ambientais no Século XXI...'
                    : lTipo === 'Reportagem'
                    ? 'Ex: A Evolução Urbana nos Centros Tecnológicos Brasileiros...'
                    : lTipo === 'Mídia Social'
                    ? 'Ex: Thread Simplificando a Teoria da Relatividade Geral...'
                    : 'Ex: Resumo de Anotações, Post de blog acadêmico...'
                }
                value={lTitulo}
                onChange={(e) => setLTitulo(e.target.value)}
                className="w-full px-4 py-3 text-sm font-semibold border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-900 rounded-xl focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-500 focus:outline-none transition-all text-gray-900 dark:text-white"
              />
            </div>

            {/* Optional parameters for categorization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-650 dark:text-gray-400 flex items-center gap-1">
                  <span>🏷️</span> Assunto ou Tema (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Direito, Medicina, Economia"
                  value={lAssunto}
                  onChange={(e) => setLAssunto(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-900 rounded-xl focus:ring-1 focus:ring-amber-400 focus:outline-none transition-all text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-650 dark:text-gray-400 flex items-center gap-1">
                  <span>📅</span> Data de Término
                </label>
                <input
                  type="date"
                  value={lData}
                  onChange={(e) => setLData(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-900 rounded-xl focus:ring-1 focus:ring-amber-400 focus:outline-none transition-all text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Media/Type selector options - CARDS instead of standard dropdown! */}
            <div className="space-y-4">
              
              {/* CATEGORY 1: CONSUME */}
              <div className="space-y-2 animate-fade-in">
                <label className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block font-sans">
                  📚 Consumo Intelectual (Leituras & Mídias)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleTypeSelect('Livro', 280)}
                    className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                      lTipo === 'Livro'
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 shadow-md border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20'
                        : 'bg-gray-50/50 dark:bg-gray-850 border-gray-150 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-lg">📚</span>
                      {lTipo === 'Livro' && <span className="absolute top-1 right-1 text-[8px] text-amber-500 font-extrabold">✓</span>}
                    </div>
                    <div className="mt-1.5">
                      <h4 className="font-extrabold text-[10.5px] text-gray-800 dark:text-white leading-tight">Livro Inteiro</h4>
                      <p className="text-[8.5px] text-gray-400 mt-0.5 leading-tight">Teoria & Temas</p>
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-dashed border-gray-100 dark:border-gray-750 w-full">
                      <p className="text-[8.5px] font-black text-amber-600 dark:text-amber-400 leading-tight">
                        <span>⚡ Max XP</span>
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeSelect('Artigo', 20)}
                    className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                      lTipo === 'Artigo'
                        ? 'bg-teal-50/40 dark:bg-teal-950/20 shadow-md border-teal-400 dark:border-teal-600 ring-2 ring-teal-400/20'
                        : 'bg-gray-50/50 dark:bg-gray-850 border-gray-150 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-lg">📄</span>
                      {lTipo === 'Artigo' && <span className="absolute top-1 right-1 text-[8px] text-teal-500 font-extrabold">✓</span>}
                    </div>
                    <div className="mt-1.5">
                      <h4 className="font-extrabold text-[10.5px] text-gray-800 dark:text-white leading-tight">Artigo Lido</h4>
                      <p className="text-[8.5px] text-gray-400 mt-0.5 leading-tight">Doutrinas/Científico</p>
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-dashed border-gray-100 dark:border-gray-750 w-full">
                      <p className="text-[8.5px] font-black text-teal-650 dark:text-teal-400 leading-tight">
                        <span>⚡ +30 XP base</span>
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeSelect('Filme', 120)}
                    className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                      lTipo === 'Filme'
                        ? 'bg-purple-50/40 dark:bg-purple-950/20 shadow-md border-purple-400 dark:border-purple-600 ring-2 ring-purple-400/20'
                        : 'bg-gray-50/50 dark:bg-gray-850 border-gray-150 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-lg">🎬</span>
                      {lTipo === 'Filme' && <span className="absolute top-1 right-1 text-[8px] text-purple-500 font-extrabold">✓</span>}
                    </div>
                    <div className="mt-1.5">
                      <h4 className="font-extrabold text-[10.5px] text-gray-800 dark:text-white leading-tight">Filme Acadêmico</h4>
                      <p className="text-[8.5px] text-gray-400 mt-0.5 leading-tight">Valores Teóricos</p>
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-dashed border-gray-100 dark:border-gray-750 w-full">
                      <p className="text-[8.5px] font-black text-purple-600 dark:text-purple-400 leading-tight">
                        <span>⚡ +25 XP base</span>
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeSelect('Podcast', 30)}
                    className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                      lTipo === 'Podcast'
                        ? 'bg-fuchsia-150/10 dark:bg-fuchsia-950/20 shadow-md border-fuchsia-400 dark:border-fuchsia-600 ring-2 ring-fuchsia-400/20'
                        : 'bg-gray-50/50 dark:bg-gray-850 border-gray-150 dark:border-gray-750 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-lg">🎙️</span>
                      {lTipo === 'Podcast' && <span className="absolute top-1 right-1 text-[8px] text-fuchsia-500 font-extrabold">✓</span>}
                    </div>
                    <div className="mt-1.5">
                      <h4 className="font-extrabold text-[10.5px] text-gray-800 dark:text-white leading-tight">Podcast / Ep.</h4>
                      <p className="text-[8.5px] text-gray-400 mt-0.5 leading-tight">Foco de Minutos</p>
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-dashed border-gray-100 dark:border-gray-750 w-full">
                      <p className="text-[8.5px] font-black text-fuchsia-600 dark:text-fuchsia-400 leading-tight">
                        <span>⚡ Dinâmico</span>
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeSelect('Outro', 8)}
                    className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                      lTipo === 'Outro'
                        ? 'bg-indigo-50/40 dark:bg-indigo-950/20 shadow-md border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-400/20'
                        : 'bg-gray-50/50 dark:bg-gray-850 border-gray-150 dark:border-gray-750 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-lg">🖥️</span>
                      {lTipo === 'Outro' && <span className="absolute top-1 right-1 text-[8px] text-indigo-500 font-extrabold">✓</span>}
                    </div>
                    <div className="mt-1.5">
                      <h4 className="font-extrabold text-[10.5px] text-gray-800 dark:text-white leading-tight">Outros Canais</h4>
                      <p className="text-[8.5px] text-gray-400 mt-0.5 leading-tight">Blogs & Resumos</p>
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-dashed border-gray-100 dark:border-gray-750 w-full">
                      <p className="text-[8.5px] font-black text-indigo-600 dark:text-indigo-400 leading-tight">
                        <span>⚡ +30 XP</span>
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* CATEGORY 2: PRODUCE (WRITING) */}
              <div className="space-y-2 animate-fade-in">
                <label className="text-[10px] font-black text-blue-650 dark:text-blue-400 uppercase tracking-widest block font-sans">
                  ✍️ Produção Intelectual Autoral (Escrita & Resumos)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleTypeSelect('Escrita Artigo', 15)}
                    className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                      lTipo === 'Escrita Artigo'
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 shadow-md border-blue-400 dark:border-blue-600 ring-2 ring-blue-400/20'
                        : 'bg-gray-50/50 dark:bg-gray-850 border-gray-150 dark:border-gray-750 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-lg">✍️</span>
                      {lTipo === 'Escrita Artigo' && <span className="absolute top-1 right-1 text-[8px] text-blue-500 font-extrabold">✓</span>}
                    </div>
                    <div className="mt-1.5">
                      <h4 className="font-extrabold text-[10px] text-gray-800 dark:text-white leading-tight">Artigo Escrito</h4>
                      <p className="text-[8px] text-gray-400 mt-0.5 leading-tight">Escrita Acadêmica</p>
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-dashed border-gray-100 dark:border-gray-750 w-full">
                      <p className="text-[8px] font-black text-blue-600 dark:text-blue-400 leading-tight">
                        <span>⚡ +180 XP base</span>
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeSelect('TCC', 40)}
                    className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                      lTipo === 'TCC'
                        ? 'bg-rose-50/50 dark:bg-rose-955/20 shadow-md border-rose-400 dark:border-rose-600 ring-2 ring-rose-400/20'
                        : 'bg-gray-50/50 dark:bg-gray-850 border-gray-150 dark:border-gray-750 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-lg">🎓</span>
                      {lTipo === 'TCC' && <span className="absolute top-1 right-1 text-[8px] text-rose-500 font-extrabold">✓</span>}
                    </div>
                    <div className="mt-1.5">
                      <h4 className="font-extrabold text-[10px] text-gray-800 dark:text-white leading-tight">TCC / Monog.</h4>
                      <p className="text-[8px] text-gray-400 mt-0.5 leading-tight">Trabalho Final</p>
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-dashed border-rose-100 dark:border-rose-950/50 w-full">
                      <p className="text-[8px] font-black text-rose-600 dark:text-rose-400 leading-tight">
                        <span>⚡ +300 XP base</span>
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeSelect('Resumo', 3)}
                    className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                      lTipo === 'Resumo'
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md border-emerald-400 dark:border-emerald-600 ring-2 ring-emerald-400/20'
                        : 'bg-gray-50/50 dark:bg-gray-850 border-gray-150 dark:border-gray-750 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-lg">📝</span>
                      {lTipo === 'Resumo' && <span className="absolute top-1 right-1 text-[8px] text-emerald-500 font-extrabold">✓</span>}
                    </div>
                    <div className="mt-1.5">
                      <h4 className="font-extrabold text-[10px] text-gray-800 dark:text-white leading-tight">Resumo</h4>
                      <p className="text-[8px] text-gray-400 mt-0.5 leading-tight">Fichas & Sínteses</p>
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-dashed border-gray-100 dark:border-gray-750 w-full">
                      <p className="text-[8px] font-black text-emerald-605 dark:text-emerald-400 leading-tight">
                        <span>⚡ +40 XP base</span>
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeSelect('Redação', 2)}
                    className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                      lTipo === 'Redação'
                        ? 'bg-amber-50/50 dark:bg-amber-955/20 shadow-md border-amber-400 dark:border-amber-600 ring-2 ring-amber-400/20'
                        : 'bg-gray-50/50 dark:bg-gray-850 border-gray-150 dark:border-gray-750 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-lg">✏️</span>
                      {lTipo === 'Redação' && <span className="absolute top-1 right-1 text-[8px] text-amber-500 font-extrabold">✓</span>}
                    </div>
                    <div className="mt-1.5">
                      <h4 className="font-extrabold text-[10px] text-gray-800 dark:text-white leading-tight">Redação</h4>
                      <p className="text-[8px] text-gray-400 mt-0.5 leading-tight">Ensaio / Dissertação</p>
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-dashed border-gray-100 dark:border-gray-750 w-full">
                      <p className="text-[8px] font-black text-amber-600 dark:text-amber-400 leading-tight">
                        <span>⚡ +90 XP base</span>
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeSelect('Reportagem', 5)}
                    className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                      lTipo === 'Reportagem'
                        ? 'bg-cyan-50/50 dark:bg-cyan-950/20 shadow-md border-cyan-400 dark:border-cyan-600 ring-2 ring-cyan-400/20'
                        : 'bg-gray-50/50 dark:bg-gray-850 border-gray-150 dark:border-gray-750 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-lg">📰</span>
                      {lTipo === 'Reportagem' && <span className="absolute top-1 right-1 text-[8px] text-cyan-500 font-extrabold">✓</span>}
                    </div>
                    <div className="mt-1.5">
                      <h4 className="font-extrabold text-[10px] text-gray-800 dark:text-white leading-tight">Reportagem</h4>
                      <p className="text-[8px] text-gray-400 mt-0.5 leading-tight">Crônica & Mídia</p>
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-dashed border-gray-100 dark:border-gray-750 w-full">
                      <p className="text-[8px] font-black text-cyan-650 dark:text-cyan-400 leading-tight">
                        <span>⚡ +120 XP base</span>
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeSelect('Mídia Social', 1)}
                    className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                      lTipo === 'Mídia Social'
                        ? 'bg-fuchsia-50/40 dark:bg-fuchsia-955/20 shadow-md border-fuchsia-400 dark:border-fuchsia-600 ring-2 ring-fuchsia-400/20'
                        : 'bg-gray-50/50 dark:bg-gray-850 border-gray-150 dark:border-gray-750 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start w-full">
                      <span className="text-lg">📱</span>
                      {lTipo === 'Mídia Social' && <span className="absolute top-1 right-1 text-[8px] text-fuchsia-500 font-extrabold">✓</span>}
                    </div>
                    <div className="mt-1.5">
                      <h4 className="font-extrabold text-[10px] text-gray-800 dark:text-white leading-tight">Artigo de Rede</h4>
                      <p className="text-[8px] text-gray-400 mt-0.5 leading-tight">Post Intelectual</p>
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-dashed border-gray-100 dark:border-gray-750 w-full">
                      <p className="text-[8px] font-black text-fuchsia-650 dark:text-fuchsia-400 leading-tight">
                        <span>⚡ +30 XP base</span>
                      </p>
                    </div>
                  </button>
                </div>
              </div>

            </div>

            {/* Prefill helper selectors inside specific views */}
            {lTipo === 'Filme' && (
              <div className="p-4 bg-purple-500/5 dark:bg-purple-950/10 border border-purple-200 dark:border-purple-800/60 rounded-3xl space-y-4 shadow-xs">
                <div>
                  <p className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <span>🎬</span> Categoria de Valor Científico / Acadêmico:
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed font-sans">
                    Filmes com profundidade analítica, teórica ou factual rendem bônus de XP extras no seu jardim mental.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { label: 'Filme mudo (pré-década de 1930)', desc: 'Valor histórico máximo (+40 XP)', icon: '🎞️' },
                    { label: 'Filme de autor (cinema de arte) - ex: Bergman, Tarkovsky', desc: 'Profundidade analítica máxima (+35 XP)', icon: '🎨' },
                    { label: 'Filme experimental / vanguardista', desc: 'Inovação estética e estrutural (+30 XP)', icon: '🌌' },
                    { label: 'Cinema direto / documentário observacional', desc: 'Conteúdo puramente factual (+25 XP)', icon: '📹' },
                    { label: 'Documentário científico, cinebiografia ou histórico', desc: 'Informação, contexto e reflexão (+20 XP)', icon: '💡' },
                    { label: 'Outros (Filme convencional / Lazer)', desc: 'Consumo geral / Entretenimento (+0 XP)', icon: '🍿' }
                  ].map((c) => {
                    const isSelected = lCategoriaFilme === c.label;
                    return (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => {
                          setLCategoriaFilme(c.label);
                          audioSynth.playClick();
                          showToast(`Categoria selecionada: ${c.label}!`, 'info');
                        }}
                        className={`p-2.5 rounded-2xl border transition-all text-left flex items-start gap-2.5 cursor-pointer text-xs ${
                          isSelected
                            ? 'bg-purple-500/10 border-purple-400 text-purple-800 dark:text-purple-300 ring-1 ring-purple-400/20'
                            : 'bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-750 hover:bg-gray-50/50'
                        }`}
                      >
                        <span className="text-base mt-0.5">{c.icon}</span>
                        <div className="flex-1 min-w-0">
                          <strong className="block font-black text-[10px] leading-snug truncate">{c.label.split(' - ')[0]}</strong>
                          <span className="block text-[8px] text-purple-650 dark:text-purple-405 mt-0.5 font-bold font-mono">{c.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-dashed border-purple-200 dark:border-purple-800/50 pt-3">
                  <p className="text-xs font-bold text-purple-705 dark:text-purple-300 flex items-center gap-1.5 animate-pulse">
                    <span>🎬</span> Recomendações de Filmes Acadêmicos e Intelectuais:
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1">
                  {[
                    { title: "O Jogo da Imitação", theme: "Criptografia & Alan Turing", duration: 114, cat: 'Documentário científico, cinebiografia ou histórico' },
                    { title: "Uma Mente Brilhante", theme: "Matemática & Teoria dos Jogos", duration: 135, cat: 'Documentário científico, cinebiografia ou histórico' },
                    { title: "Interestelar", theme: "Física, Gravidade & Relatividade", duration: 169, cat: 'Documentário científico, cinebiografia ou histórico' },
                    { title: "Metropolis (1927)", theme: "Expressão Mudo Clássico", duration: 153, cat: 'Filme mudo (pré-década de 1930)' },
                    { title: "O Encouraçado Potemkin", theme: "Linguagem de Montagem & Cinema Histórico", duration: 75, cat: 'Filme mudo (pré-década de 1930)' },
                    { title: "A Paixão de Joana d'Arc", theme: "Clássico Dramático & Expressão Silenciosa", duration: 82, cat: 'Filme mudo (pré-década de 1930)' },
                    { title: "Morangos Silvestres", theme: "Filosofia Existencial (Bergman)", duration: 91, cat: 'Filme de autor (cinema de arte) - ex: Bergman, Tarkovsky' },
                    { title: "Stalker (1979)", theme: "Metafísica, Filosofia & Arte (Tarkovsky)", duration: 161, cat: 'Filme de autor (cinema de arte) - ex: Bergman, Tarkovsky' },
                    { title: "O Sétimo Selo (1957)", theme: "Teologia, Morte & Filosofia (Bergman)", duration: 96, cat: 'Filme de autor (cinema de arte) - ex: Bergman, Tarkovsky' },
                    { title: "O Cão Andaluz (1929)", theme: "Surrealismo Vanguardista Luis Buñuel", duration: 16, cat: 'Filme experimental / vanguardista' },
                    { title: "Koyaanisqatsi (1982)", theme: "Documentário Experimental Sem Diálogos", duration: 86, cat: 'Filme experimental / vanguardista' },
                    { title: "Chronicle of a Summer", theme: "Sociologia & Cinema Verdade Francês", duration: 86, cat: 'Cinema direto / documentário observacional' },
                    { title: "High School (1968)", theme: "Análise Social & Cinema Direto", duration: 75, cat: 'Cinema direto / documentário observacional' },
                    { title: "Estrelas Além do Tempo", theme: "Cálculo Orbital NASA & Direitos Civis", duration: 127, cat: 'Documentário científico, cinebiografia ou histórico' },
                    { title: "Privacidade Hackeada", theme: "Ética de Algoritmos & Big Data", duration: 139, cat: 'Cinema direto / documentário observacional' },
                    { title: "O Menino que Descobriu o Vento", theme: "Engenharia & Desenvolvimento Sustentável", duration: 113, cat: 'Documentário científico, cinebiografia ou histórico' },
                    { title: "O Ponto de Mutação", theme: "Teoria de Sistemas & Nova Física", duration: 112, cat: 'Filme de autor (cinema de arte) - ex: Bergman, Tarkovsky' },
                    { title: "Cosmos (Série Especial)", theme: "Astronomia & Divulgação de Carl Sagan", duration: 60, cat: 'Documentário científico, cinebiografia ou histórico' },
                    { title: "Cidadão Kane (1941)", theme: "Narrativa & Sociologia da Imprensa", duration: 119, cat: 'Filme de autor (cinema de arte) - ex: Bergman, Tarkovsky' },
                    { title: "O Gabinete do Dr. Caligari", theme: "Expressionismo Alemão & Psicologia", duration: 74, cat: 'Filme mudo (pré-década de 1930)' }
                  ].map((m, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setLTitulo(m.title);
                        setLAssunto(m.theme);
                        setLPaginas(m.duration);
                        setLCategoriaFilme(m.cat);
                        audioSynth.playClick();
                        showToast(`Selecionado: ${m.title}! Preenchida categoria e duração (${m.duration} min)`, 'info');
                      }}
                      className="p-2 border border-purple-100/40 dark:border-purple-900 bg-white dark:bg-gray-900 rounded-xl hover:bg-purple-100/50 dark:hover:bg-purple-950/30 text-left transition-all duration-150 cursor-pointer flex flex-col justify-center"
                    >
                      <strong className="text-[10px] text-gray-950 dark:text-white truncate block font-bold leading-tight">{m.title}</strong>
                      <span className="text-[8px] text-purple-600 dark:text-purple-400 font-bold font-mono block mt-0.5 leading-tight">{m.duration}m &bull; {m.theme}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {lTipo === 'Podcast' && (
              <div className="p-4 bg-fuchsia-500/5 dark:bg-fuchsia-950/10 border border-fuchsia-200 dark:border-fuchsia-800/60 rounded-2xl space-y-2.5">
                <p className="text-xs font-bold text-fuchsia-700 dark:text-fuchsia-400 flex items-center gap-1.5 animate-pulse">
                  <span>🎙️</span> Recomendações de Podcasts Educativos e Instrutivos:
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-[190px] overflow-y-auto pr-1">
                  {[
                    { title: "SciCast", theme: "Física, Química, Biologia & História Geral", defaultDuration: 60 },
                    { title: "NerdCologia", theme: "Biologia de Sistemas, Antropologia & História", defaultDuration: 30 },
                    { title: "Fronteiras da Ciência", theme: "Epistemologia & Método Científico", defaultDuration: 45 },
                    { title: "Escriba Cafe", theme: "História Antiga & Mistérios Arqueológicos", defaultDuration: 40 },
                    { title: "Braincast", theme: "Tecnologia, Sociedade de Rede & Ética Digital", defaultDuration: 55 },
                    { title: "Filosofia Pop", theme: "Correntes de Pensamento & Diálogos Culturais", defaultDuration: 50 },
                    { title: "Naruhodo!", theme: "Ciência por Trás do Cotidiano & Psicologia", defaultDuration: 40 },
                    { title: "Xadrez Verbal", theme: "Geopolítica Global, História & Política Coletiva", defaultDuration: 120 },
                    { title: "Flow de Mente", theme: "Psicologia Cognitiva & Produtividade Prática", defaultDuration: 75 },
                    { title: "Dragões de Garagem", theme: "Divulgação Científica, Biologia & Ecofítica", defaultDuration: 50 }
                  ].map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setLTitulo(p.title);
                        setLAssunto(p.theme);
                        setLPaginas(p.defaultDuration);
                        audioSynth.playClick();
                        showToast(`Selecionado: ${p.title}! Duração padrão preenchida (${p.defaultDuration} min)`, 'info');
                      }}
                      className="p-2 border border-fuchsia-100/40 dark:border-fuchsia-900 bg-white dark:bg-gray-900 rounded-xl hover:bg-fuchsia-100/50 dark:hover:bg-fuchsia-950/30 text-left transition-all duration-150 cursor-pointer flex flex-col justify-center"
                    >
                      <strong className="text-[10px] text-gray-950 dark:text-white truncate block font-bold leading-tight">{p.title}</strong>
                      <span className="text-[8px] text-fuchsia-600 dark:text-fuchsia-400 font-bold font-mono block mt-0.5 leading-tight">{p.defaultDuration}m &bull; {p.theme}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual fine-tuning of page counts */}
            <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-2xl border border-gray-150 dark:border-gray-750 space-y-3">
              <div className="flex justify-between items-center text-xs font-sans">
                <span className="font-bold text-gray-650 dark:text-gray-450 flex items-center gap-1">
                  {['Escrita Artigo', 'TCC', 'Resumo', 'Redação', 'Reportagem', 'Mídia Social'].includes(lTipo)
                    ? '✍️ Ajustar volume de produção (Páginas/Posts):'
                    : lTipo === 'Podcast' || lTipo === 'Filme' 
                    ? '⏳ Ajustar tempo focado (Minutos):' 
                    : '📕 Ajustar número aproximado de páginas lidas:'
                  }
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-xs font-mono animate-bounce">
                  {lPaginas}
                  {['Escrita Artigo', 'TCC', 'Resumo', 'Redação', 'Reportagem'].includes(lTipo) 
                    ? ' págs' 
                    : lTipo === 'Mídia Social' 
                    ? ' post' 
                    : lTipo === 'Podcast' || lTipo === 'Filme' 
                    ? ' min' 
                    : ' págs'}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={600}
                value={lPaginas}
                onChange={(e) => setLPaginas(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[10px] text-gray-400 leading-normal font-sans">
                {['Escrita Artigo', 'TCC', 'Resumo', 'Redação', 'Reportagem', 'Mídia Social'].includes(lTipo)
                  ? 'Ajuste o tamanho do conteúdo escrito para multiplicar seus bônus de XP focado.'
                  : lTipo === 'Podcast' || lTipo === 'Filme'
                  ? 'Ajuste a duração assistida ou ouvida. Podcasts e Filmes rendem XP escalável ou balanceado com base na dedicação!'
                  : 'Arraste para estimar com precisão o tamanho final da obra lida e catalogada.'
                }
              </p>

              {/* Live Rewards Calculator Widget */}
              {(() => {
                const activePages = lPaginas;
                let liveXP = 30;
                let liveWater = 1;
                let liveFertilizer = 0;

                if (lTipo === 'Artigo') {
                  liveXP = Math.floor(30 + activePages * 1.5);
                  liveWater = Math.max(1, Math.floor(activePages / 7));
                  liveFertilizer = Math.max(0, Math.floor(activePages / 20));
                } else if (lTipo === 'Livro') {
                  liveXP = Math.floor(100 + activePages * 0.5);
                  liveWater = Math.max(2, Math.floor(activePages / 35));
                  liveFertilizer = Math.max(1, Math.floor(activePages / 90));
                } else if (lTipo === 'Filme') {
                  let categoryBonus = 0;
                  if (lCategoriaFilme === 'Filme mudo (pré-década de 1930)') categoryBonus = 40;
                  else if (lCategoriaFilme === 'Filme de autor (cinema de arte) - ex: Bergman, Tarkovsky') categoryBonus = 35;
                  else if (lCategoriaFilme === 'Filme experimental / vanguardista') categoryBonus = 30;
                  else if (lCategoriaFilme === 'Cinema direto / documentário observacional') categoryBonus = 25;
                  else if (lCategoriaFilme === 'Documentário científico, cinebiografia ou histórico') categoryBonus = 20;

                  liveXP = Math.floor(25 + activePages * 0.2 + categoryBonus);
                  liveWater = Math.max(1, Math.floor(activePages / 60) + (categoryBonus > 0 ? 1 : 0));
                  liveFertilizer = categoryBonus >= 25 ? 1 : 0;
                } else if (lTipo === 'Podcast') {
                  liveXP = Math.max(15, Math.floor(15 + activePages * 0.6));
                  liveWater = Math.max(1, Math.floor(activePages / 35));
                  liveFertilizer = Math.max(0, Math.floor(activePages / 70));
                } else if (lTipo === 'Escrita Artigo') {
                  liveXP = Math.floor(180 + activePages * 5);
                  liveWater = Math.max(4, Math.floor(activePages / 3));
                  liveFertilizer = Math.max(2, Math.floor(activePages / 6));
                } else if (lTipo === 'TCC') {
                  liveXP = Math.floor(300 + activePages * 6);
                  liveWater = Math.max(6, Math.floor(activePages / 4));
                  liveFertilizer = Math.max(3, Math.floor(activePages / 10));
                } else if (lTipo === 'Resumo') {
                  liveXP = Math.floor(40 + activePages * 4);
                  liveWater = Math.max(1, Math.floor(activePages / 2));
                  liveFertilizer = Math.max(0, Math.floor(activePages / 5));
                } else if (lTipo === 'Redação') {
                  liveXP = Math.floor(90 + activePages * 6);
                  liveWater = Math.max(2, Math.floor(activePages * 1.5));
                  liveFertilizer = Math.max(1, Math.floor(activePages / 2));
                } else if (lTipo === 'Reportagem') {
                  liveXP = Math.floor(120 + activePages * 4);
                  liveWater = Math.max(3, Math.floor(activePages / 2));
                  liveFertilizer = Math.max(1, Math.floor(activePages / 4));
                } else if (lTipo === 'Mídia Social') {
                  liveXP = Math.floor(30 + activePages * 6);
                  liveWater = Math.max(1, Math.floor(activePages));
                  liveFertilizer = 0;
                }

                return (
                  <div className="grid grid-cols-3 gap-2 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-500/15 dark:border-amber-500/35 p-3 rounded-2xl relative overflow-hidden mt-3">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/75 dark:bg-gray-900/40 text-center border border-gray-100 dark:border-gray-800">
                      <span className="text-lg animate-pulse">✨</span>
                      <span className="text-[8.5px] font-extrabold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">XP Ganho</span>
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5 border-none">+{liveXP} XP</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/75 dark:bg-gray-900/40 text-center border border-gray-100 dark:border-gray-800">
                      <span className="text-lg animate-bounce">💧</span>
                      <span className="text-[8.5px] font-extrabold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-sans">Água</span>
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400 mt-0.5">+{liveWater} 💧</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/75 dark:bg-gray-900/40 text-center border border-gray-100 dark:border-gray-800">
                      <span className="text-lg">🍂</span>
                      <span className="text-[8.5px] font-extrabold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">Adubos</span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">+{liveFertilizer} 🍂</span>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Finalizar & Carregar Recompensa 🎓
            </button>
          </div>
        </div>

        {/* Dynamic Rule Box Widget on Side */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-xs space-y-4">
            <h4 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500 animate-bounce" /> Regras Básicas do Consultório Mental
            </h4>
            
            <div className="space-y-3 text-xs text-gray-650 dark:text-gray-300">
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-850 border border-gray-100 dark:border-gray-700 leading-normal space-y-2 font-sans">
                <p className="font-bold text-gray-800 dark:text-gray-200">Recompensas imediatas:</p>
                <p className="text-[11px]">Sempre que arquivar uma leitura válida, os recursos listados serão imediatamente adicionados à sua **Carteira de Cultivo** no cabeçalho do aplicativo!</p>
              </div>

              <div className="space-y-2 text-[11px] leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black font-mono mt-0.5 animate-pulse">1</span>
                  <span><b>Artigo Científico:</b> Rende <b>30 XP base + 1.5 XP</b> por página lida. Perfeito para manter a fluidez de curto prazo.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black font-mono mt-0.5">2</span>
                  <span><b>Livro Completo:</b> Estudo robusto e profundo. Rende <b>100 XP base + 0.5 XP</b> por página lida, mais bônus exponenciais de até <b>+8 Regas 💧</b> e <b>+3 Adubos 🍂</b>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black font-mono mt-0.5">3</span>
                  <span><b>Filmes Acadêmicos:</b> Estudo contextualizado por minutos (+0.2 XP/min) com <b>Bônus de profundidade analítica</b> de até <b>+40 XP</b> (ex.: filmes mudos clássicos, filmes de arte de autor, ou documentários factuais).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black font-mono mt-0.5">4</span>
                  <span><b>Garantidor de Streak:</b> Realizar um registro de qualquer mídia mantém sua <b>Meta Diária de Estudos</b> ativa no painel, garantindo que suas sequências (streak) fiquem plenamente protegidas!</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500/5 to-indigo-600/10 border border-indigo-200/50 p-5 rounded-3xl space-y-2.5">
            <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
              <Star className="w-3.5 h-3.5 fill-current animate-pulse" /> Sabedoria Botanista
            </p>
            <p className="text-[11px] font-mono italic text-gray-600 dark:text-gray-300 leading-relaxed">
              "Quem rega seu próprio cérebro com as águas douradas da leitura estuda menos vezes, mas entende muito mais profunda e solidamente."
            </p>
          </div>
        </div>

      </div>

      {/* 🌈 EXCLUSIVE GAME FEATURE: GORGEOUS WOODEN BOOKSHELF VIEW (ESTANTE) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Estante Visual de Leituras Concluídas</h3>
              <p className="text-xs text-gray-500">Seus registros representados como lombadas de livros reais colecionadas por você.</p>
            </div>
          </div>
          {leituras.length > 0 && (
            <span className="text-[10px] bg-amber-100 dark:bg-amber-955 px-2.5 py-1 rounded-full text-amber-800 dark:text-amber-400 font-extrabold">
              {leituras.length} {leituras.length === 1 ? 'Volume Catalogado' : 'Volumes Catalogados'} 📖
            </span>
          )}
        </div>

        {leituras.length === 0 ? (
          <div className="py-14 text-center space-y-3">
            <span className="text-5xl block animate-bounce">🏺</span>
            <h4 className="font-bold text-gray-700 dark:text-gray-350">Sua estante ainda está vazia</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">Coloque sua mente para carburar! Registre seu primeiro livro ou artigo lido e assista ele brotar em uma linda lombada colorida aqui.</p>
          </div>
        ) : (
          <div className="space-y-12 py-4">
            {/* Realistic Wooden Shelf Layer with Books */}
            <div className="relative pt-10 pb-2 px-6 bg-amber-900/5 dark:bg-amber-950/10 border border-amber-900/10 rounded-3xl">
              
              <div className="flex flex-wrap items-end gap-1.5 justify-start relative z-10 min-h-[160px] max-w-full overflow-x-auto pb-1">
                {leituras.map((l, idx) => {
                  const colors = [
                    { background: 'from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600', text: 'text-amber-105 border-amber-700/40 text-[9px]' },
                    { background: 'from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600', text: 'text-teal-105 border-teal-700/40 text-[9px]' },
                    { background: 'from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600', text: 'text-indigo-105 border-indigo-700/40 text-[9px]' },
                    { background: 'from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600', text: 'text-emerald-105 border-emerald-700/40 text-[9px]' },
                    { background: 'from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600', text: 'text-rose-105 border-rose-700/40 text-[9px]' },
                    { background: 'from-indigo-700 to-violet-800 hover:from-indigo-600 hover:to-violet-700', text: 'text-violet-105 border-indigo-805/40 text-[9px]' },
                    { background: 'from-cyan-600 to-teal-650 hover:from-cyan-550 hover:to-teal-600', text: 'text-cyan-105 border-cyan-705/40 text-[9px]' },
                    { background: 'from-yellow-600 to-amber-705 hover:from-yellow-550 hover:to-amber-650', text: 'text-yellow-50 border-yellow-700/40 text-[9px]' }
                  ];
                  const styleConfig = colors[idx % colors.length];

                  const bookType = l.tipo || 'Livro';
                  const baseHeightSpine = bookType === 'Livro' ? 140 : bookType === 'Filme' ? 122 : bookType === 'Artigo' ? 100 : bookType === 'Podcast' ? 108 : 80;
                  const pOffset = Math.min((l.paginas || 20) * 0.12, 40);
                  const finalHeight = `${baseHeightSpine + pOffset}px`;
                  const spineWidth = bookType === 'Livro' ? 'w-[32px] sm:w-[38px]' : bookType === 'Filme' ? 'w-[28px] sm:w-[32px]' : 'w-[22px] sm:w-[26px]';

                  return (
                    <motion.div
                      key={l.id}
                      className={`group/book relative cursor-pointer border ${spineWidth} bg-gradient-to-b ${styleConfig.background} ${styleConfig.text} hover:scale-105 rounded-t-md hover:-translate-y-3.5 transition-all duration-300 shadow-md hover:shadow-xl flex flex-col justify-between items-center`}
                      style={{ height: finalHeight }}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.05, 0.8), duration: 0.4 }}
                    >
                      <div className="w-full h-1 bg-yellow-400/50 rounded-t-md shrink-0 mb-1" />

                      <div className="flex-1 w-full flex items-center justify-center p-1 overflow-hidden select-none">
                        <p className="text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap capitalize origin-center rotate-90 text-center select-none truncate max-w-[120px]">
                          {l.titulo}
                        </p>
                      </div>

                      <div className="pb-1 text-[9px] font-black tracking-tighter opacity-70 flex flex-col items-center">
                        <span className="font-sans">{bookType === 'Livro' ? 'L' : bookType === 'Artigo' ? 'A' : bookType === 'Filme' ? 'F' : bookType === 'Podcast' ? 'P' : 'O'}</span>
                        <span className="text-[8px] font-normal scale-90">{l.paginas}{bookType === 'Podcast' || bookType === 'Filme' ? 'm' : 'p'}</span>
                      </div>

                      <div className="absolute inset-y-0 left-0.5 w-[2px] bg-white/20 pointer-events-none group-hover/book:w-[4px] transition-all" />
                      <div className="absolute inset-y-0 right-0.5 w-[2px] bg-black/20 pointer-events-none" />

                      <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-48 bg-gray-900/95 dark:bg-gray-950 border border-gray-750 p-2.5 rounded-xl z-30 opacity-0 group-hover/book:opacity-100 pointer-events-none transition-opacity duration-300 text-[10px] text-white space-y-1.5 shadow-2xl">
                        <div className="flex justify-between items-center gap-1.5 leading-none">
                          <span className="text-[9px] px-1.5 py-0.5 bg-gray-800 text-yellow-400 font-extrabold rounded-sm shadow-xs">
                            {l.tipo}
                          </span>
                          <p className="text-gray-400 font-mono text-[8px] font-semibold">{l.data}</p>
                        </div>
                        <h5 className="font-bold text-sm tracking-tight capitalize text-white truncate">{l.titulo}</h5>
                        <div className="border-t border-gray-800 pt-1 text-gray-300 leading-normal font-sans">
                          <p>Assunto: <strong className="text-white">{l.assunto || 'Não definido'}</strong></p>
                          {bookType === 'Filme' && l.categoriaFilme && (
                            <p>Categoria: <strong className="text-purple-300 font-mono text-[9px]">{l.categoriaFilme.split(' - ')[0]}</strong></p>
                          )}
                          <p>Duração/Pág: <strong className="text-emerald-400 font-mono">{l.paginas}{bookType === 'Podcast' || bookType === 'Filme' ? ' min' : ' págs'} 🎓</strong></p>
                        </div>
                        <p className="text-[9px] text-amber-300/90 font-mono italic animate-pulse">Clique para remover 🗑</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveLeitura(l.id);
                        }}
                        className="absolute -bottom-6 opacity-0 group-hover/book:opacity-100 bg-red-500 hover:bg-red-700 text-white p-1 rounded-full text-[9px] transition-all duration-200 z-10 size-5 flex items-center justify-center shadow-md shadow-red-500/20 cursor-pointer"
                        title="Remover este registro"
                      >
                        ✕
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Thick Wooden Shelf Board */}
              <div className="h-5 w-full bg-gradient-to-r from-amber-800 via-amber-700 to-amber-850 dark:from-amber-950 dark:via-amber-900 dark:to-orange-955 rounded-b-xl border-t border-amber-600/30 shadow-md relative z-20">
                <div className="absolute inset-x-0 bottom-0.5 h-1 bg-black/20" />
                <div className="absolute inset-x-0 top-0.5 h-0.5 bg-white/20" />
              </div>
            </div>

            {/* Interactive Cards View for lists */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3.5">
                Lista Detalhada de Leituras ({leituras.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {leituras.map(l => (
                  <div key={l.id} className="p-4 rounded-3xl bg-gray-50/40 dark:bg-gray-850/20 border border-gray-150 dark:border-gray-750 flex justify-between items-start hover:border-amber-400/50 hover:bg-gray-100/10 transition-all shadow-xs">
                    <div className="space-y-2">
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                        l.tipo === 'Livro' 
                          ? 'bg-amber-100/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-250/20' 
                          : l.tipo === 'Artigo'
                          ? 'bg-teal-100/80 dark:bg-teal-950/40 text-teal-800 dark:text-teal-400 border-teal-250/20'
                          : l.tipo === 'Filme'
                          ? 'bg-purple-100/80 dark:bg-purple-950/40 text-purple-800 dark:text-purple-400 border-purple-250/20'
                          : l.tipo === 'Podcast'
                          ? 'bg-fuchsia-100/80 dark:bg-fuchsia-950/40 text-fuchsia-800 dark:text-fuchsia-400 border-fuchsia-250/20'
                          : 'bg-indigo-100/80 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-400 border-indigo-250/20'
                      }`}>
                        {l.tipo}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-gray-950 dark:text-white capitalize">{l.titulo}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">Assunto: <b className="text-gray-750 dark:text-gray-300">{l.assunto || 'Geral'}</b></p>
                        {l.tipo === 'Filme' && l.categoriaFilme && (
                          <p className="text-[9.5px] text-purple-600 dark:text-purple-400 font-extrabold font-mono mt-0.5 flex items-center gap-1">
                            <span>🎬</span> Categoria: {l.categoriaFilme.split(' - ')[0]}
                          </p>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                        <span>📅 {l.data}</span>
                        <span>&bull;</span>
                        <span>{l.paginas} {l.tipo === 'Podcast' || l.tipo === 'Filme' ? 'minutos' : 'páginas'}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => onRemoveLeitura(l.id)}
                      className="p-2 rounded-xl bg-gray-100/90 dark:bg-gray-800/80 hover:bg-red-50 hover:text-red-550 dark:hover:bg-red-950/20 text-gray-400 transition-colors cursor-pointer"
                      title="Deletar leitura"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
