import React, { useState } from 'react';
import { Revisao } from '../types';

interface RevisaoListProps {
  revisoes: Revisao[];
  onAddManualRevisao: (conteudo: string, nivel: number, ultima: string, intervaloPersonalizado: boolean, diasPersonalizados: number) => void;
  onMarkRevisaoCompleted: (id: number) => void;
  onRemoveRevisao: (id: number) => void;
  getTodayDate: () => string;
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const RevisaoList: React.FC<RevisaoListProps> = ({
  revisoes,
  onAddManualRevisao,
  onMarkRevisaoCompleted,
  onRemoveRevisao,
  getTodayDate,
  showToast,
}) => {
  const [rConteudo, setRConteudo] = useState('');
  const [rNivel, setRNivel] = useState(1);
  const [rUltima, setRUltima] = useState(getTodayDate());
  const [rIntervaloPersonalizado, setRIntervaloPersonalizado] = useState(false);
  const [rDiasPersonalizados, setRDiasPersonalizados] = useState(3);
  const [searchRevisoes, setSearchRevisoes] = useState('');
  const [filterStatusRevs, setFilterStatusRevs] = useState('all');

  const handleCreate = () => {
    if (!rConteudo.trim()) {
      return showToast('Insira o assunto da revisão!', 'warning');
    }
    onAddManualRevisao(rConteudo, rNivel, rUltima, rIntervaloPersonalizado, rDiasPersonalizados);
    setRConteudo('');
  };

  return (
    <div className="space-y-6">
      {/* Manual Review agender */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">📅 Agendamento Manual de Revisões</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Assunto</label>
            <input
              type="text"
              placeholder="Ex: Teoria de Conjuntos"
              value={rConteudo}
              onChange={(e) => setRConteudo(e.target.value)}
              className="w-full px-3.5 py-1.5 text-sm border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Nível do Conteúdo</label>
            <select
              value={rNivel}
              onChange={(e) => setRNivel(Number(e.target.value))}
              disabled={rIntervaloPersonalizado}
              className={`w-full px-3.5 py-1.5 text-sm border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-900 text-gray-750 dark:text-gray-300 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none ${rIntervaloPersonalizado ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <option value={1}>1 - Básico (Rega diária)</option>
              <option value={2}>2 - Intermediário (Rega a cada 3 dias)</option>
              <option value={3}>3 - Consolidado (Rega semanal)</option>
              <option value={4}>4 - Memorizado (Adubado mensal)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Último Contato</label>
            <input
              type="date"
              value={rUltima}
              onChange={(e) => setRUltima(e.target.value)}
              className="w-full px-3.5 py-1.5 text-sm border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-750/50">
          <div className="flex items-center gap-2">
            <label className="relative flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rIntervaloPersonalizado}
                onChange={(e) => setRIntervaloPersonalizado(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-650 peer-checked:bg-emerald-500"></div>
              <span className="ms-2.5 text-xs font-bold text-gray-650 dark:text-gray-300 flex items-center gap-1.5 cursor-pointer">
                <span>⚙️</span> Personalizar Intervalo (dias)
              </span>
            </label>

            {rIntervaloPersonalizado && (
              <input
                type="number"
                min={1}
                max={365}
                value={rDiasPersonalizados}
                onChange={(e) => setRDiasPersonalizados(Math.max(1, Number(e.target.value)))}
                className="w-20 px-2.5 py-1 text-xs font-bold border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            )}
          </div>

          <button
            onClick={handleCreate}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            Agendar Data Customizada
          </button>
        </div>
      </div>

      {/* Review logs and search table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Grade Spaced Repetitions (Revisões Periódicas)</h3>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar assunto..."
              value={searchRevisoes}
              onChange={(e) => setSearchRevisoes(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-950 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />

            <select
              value={filterStatusRevs}
              onChange={(e) => setFilterStatusRevs(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Todas</option>
              <option value="overdue">Atrasadas ⚠️</option>
              <option value="today">Hoje</option>
              <option value="ontime">Em dia</option>
            </select>
          </div>
        </div>

        {revisoes.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-8">Nenhuma revisão espaçada pendente no momento.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-850 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-750">
                  <th className="p-3 font-semibold">Tópico / Assunto</th>
                  <th className="p-3 font-semibold">Última Revisão</th>
                  <th className="p-3 font-semibold">Próxima Revisão</th>
                  <th className="p-3 font-semibold">Tipo</th>
                  <th className="p-3 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {revisoes.filter(r => {
                  const nameMatches = r.conteudo.toLowerCase().includes(searchRevisoes.toLowerCase());
                  const today = getTodayDate();
                  if (filterStatusRevs === 'overdue') return nameMatches && r.proxima < today;
                  if (filterStatusRevs === 'today') return nameMatches && r.proxima === today;
                  if (filterStatusRevs === 'ontime') return nameMatches && r.proxima > today;
                  return nameMatches;
                }).sort((a, b) => a.proxima.localeCompare(b.proxima))
                .map(r => {
                  const todayStr = getTodayDate();
                  const isOverdue = r.proxima < todayStr;
                  const isToday = r.proxima === todayStr;

                  return (
                    <tr key={r.id} className="border-b border-gray-100 dark:border-gray-750/30 hover:bg-gray-50/20">
                      <td className="p-3 font-bold text-gray-900 dark:text-white capitalize">{r.conteudo}</td>
                      <td className="p-3 font-mono text-gray-500 dark:text-gray-400">{r.ultima}</td>
                      <td className="p-3">
                        <span className={`font-mono font-bold ${
                          isOverdue ? 'text-red-500' : isToday ? 'text-amber-500' : 'text-emerald-650'
                        }`}>
                          {r.proxima} {isOverdue && '⚠️'} {isToday && '🔔'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          r.ciclo ? 'bg-indigo-100/80 text-indigo-800' : 'bg-gray-150 text-gray-700 dark:bg-gray-750 dark:text-gray-300'
                        }`}>
                          {r.ciclo ? `Ciclo ${r.etapa}/${r.totalEtapas}` : 'Manual'}
                        </span>
                      </td>
                      <td className="p-3 flex items-center justify-center gap-1">
                        <button
                          onClick={() => onMarkRevisaoCompleted(r.id)}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-750 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/50 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 rounded-lg text-[11px] font-bold cursor-pointer"
                          title="Marcar como realizada"
                        >
                          Resolvido ✅
                        </button>
                        <button
                          onClick={() => onRemoveRevisao(r.id)}
                          className="p-1.5 rounded bg-gray-100 dark:bg-gray-750 hover:bg-red-50 hover:text-red-650 dark:hover:bg-red-950/20 text-gray-400 font-bold ml-1 cursor-pointer"
                          title="Excluir agendamento"
                        >
                          🗑
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
