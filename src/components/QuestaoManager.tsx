import React, { useState } from 'react';
import { Questao } from '../types';
import { Trash2 } from 'lucide-react';

interface QuestaoManagerProps {
  questoes: Questao[];
  onAddQuestoes: (assunto: string, total: number, acertos: number) => void;
  onRemoveQuestoesByAssunto: (assunto: string) => void;
  getSubjectSuggestions: () => string[];
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const QuestaoManager: React.FC<QuestaoManagerProps> = ({
  questoes,
  onAddQuestoes,
  onRemoveQuestoesByAssunto,
  getSubjectSuggestions,
  showToast,
}) => {
  const [qAssunto, setQAssunto] = useState('');
  const [qTotal, setQTotal] = useState(10);
  const [qAcertos, setQAcertos] = useState(8);
  const [searchQuestoes, setSearchQuestoes] = useState('');

  const handleSave = () => {
    if (!qAssunto.trim()) {
      return showToast('Qual o assunto estudado?', 'warning');
    }
    if (isNaN(qTotal) || isNaN(qAcertos) || qTotal <= 0 || qAcertos < 0 || qAcertos > qTotal) {
      return showToast('Preencha quantidades numéricas válidas de questões e acertos.', 'error');
    }
    onAddQuestoes(qAssunto, qTotal, qAcertos);
    setQAssunto('');
  };

  return (
    <div className="space-y-6">
      {/* Form to log questions set */}
      <div id="questao-form-card" className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5 animate-fade-in">
          📝 Registrador Técnico de Questões
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Assunto / Tópico</label>
            <input
              id="questao-assunto-input"
              type="text"
              placeholder="Ex: Contratos, Direitos Fundamentais"
              value={qAssunto}
              onChange={(e) => setQAssunto(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              list="questoes-subjects-suggest"
            />
            <datalist id="questoes-subjects-suggest">
              {getSubjectSuggestions().map((su, ix) => (
                <option key={ix} value={su} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Total de Questões</label>
            <input
              id="questao-total-input"
              type="number"
              min={1}
              value={qTotal}
              onChange={(e) => setQTotal(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Acertos</label>
            <input
              id="questao-acertos-input"
              type="number"
              min={0}
              max={qTotal}
              value={qAcertos}
              onChange={(e) => setQAcertos(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            id="questao-save-btn"
            onClick={handleSave}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Salvar Desempenho
          </button>
        </div>
      </div>

      {/* Table results breakdown */}
      <div id="questao-report-card" className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Relatório Consolidado de Questões</h3>
          <input
            id="questao-search-input"
            type="text"
            placeholder="Filtrar assunto..."
            value={searchQuestoes}
            onChange={(e) => setSearchQuestoes(e.target.value)}
            className="px-3.5 py-1.5 text-xs border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-950 rounded-lg focus:outline-none text-gray-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {questoes.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-6">Nenhum questionário registrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-850 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-750">
                  <th className="p-3 font-semibold">Tópico Assunto</th>
                  <th className="p-3 font-semibold">Total</th>
                  <th className="p-3 font-semibold">Acertos</th>
                  <th className="p-3 font-semibold">Erros</th>
                  <th className="p-3 font-semibold">Aproveitamento</th>
                  <th className="p-3 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(
                  questoes.reduce((acc, q) => {
                    acc[q.assunto] = acc[q.assunto] || { total: 0, acertos: 0 };
                    acc[q.assunto].total += q.total;
                    acc[q.assunto].acertos += q.acertos;
                    return acc;
                  }, {} as Record<string, { total: number; acertos: number }>)
                ).filter(([ass]) => ass.toLowerCase().includes(searchQuestoes.toLowerCase()))
                .map(([ass, resItem], index) => {
                  const res = resItem as { total: number; acertos: number };
                  const errs = res.total - res.acertos;
                  const pct = res.total > 0 ? (res.acertos / res.total) * 100 : 0;
                  return (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-750/30 hover:bg-gray-50/20">
                      <td className="p-3 font-bold text-gray-900 dark:text-white capitalize">{ass}</td>
                      <td className="p-3 font-mono text-gray-600 dark:text-gray-400">{res.total}</td>
                      <td className="p-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{res.acertos}</td>
                      <td className="p-3 font-mono text-red-500">{errs}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{pct.toFixed(0)}%</span>
                          <div className="w-20 h-2 bg-gray-150 dark:bg-gray-750 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onRemoveQuestoesByAssunto(ass)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
