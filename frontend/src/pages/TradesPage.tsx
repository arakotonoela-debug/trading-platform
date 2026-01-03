import React, { useState } from 'react';
import { Filter, Download } from 'lucide-react';
import { useTrades } from '../hooks/useTrades';
import { TradeTable } from '../components/TradeTable';
import { Card } from '../components/Card';

export const TradesPage: React.FC = () => {
  const { trades, getTradeStats } = useTrades();
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [filterSymbol, setFilterSymbol] = useState<string>('all');

  const stats = getTradeStats();

  const filteredTrades = trades.filter((trade) => {
    if (filterStatus !== 'all' && trade.status !== filterStatus) return false;
    if (filterSymbol !== 'all' && trade.symbol !== filterSymbol) return false;
    return true;
  });

  const symbols = Array.from(new Set(trades.map((t) => t.symbol)));

  const handleExport = () => {
    const csv = [
      ['Symbole', 'Type', 'Prix d\'entrée', 'Prix de sortie', 'Profit', 'Statut', 'Date'],
      ...trades.map((t) => [
        t.symbol,
        t.type,
        t.entryPrice,
        t.exitPrice || '-',
        t.profit || '-',
        t.status,
        t.openedAt,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trades.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historique des Trades</h1>
          <p className="text-gray-600 mt-1">Consultez tous vos trades</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          <Download size={20} />
          Exporter
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Total Trades"
          value={stats.totalTrades}
          subtitle={`${stats.openTrades} ouvert(s)`}
        />
        <Card
          title="Taux de Gain"
          value={`${stats.winRate.toFixed(1)}%`}
          subtitle={`${stats.closedTrades} trades fermés`}
          trend={stats.winRate > 50 ? 'up' : 'down'}
        />
        <Card
          title="Profit Total"
          value={`${stats.totalProfit.toFixed(2)}€`}
          trend={stats.totalProfit > 0 ? 'up' : 'down'}
        />
        <Card
          title="Profit Factor"
          value={stats.profitFactor.toFixed(2)}
          subtitle="Idéal: > 1.5"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="all">Tous</option>
              <option value="open">Ouvert</option>
              <option value="closed">Fermé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symbole
            </label>
            <select
              value={filterSymbol}
              onChange={(e) => setFilterSymbol(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="all">Tous</option>
              {symbols.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {filteredTrades.length} Trade(s) trouvé(s)
        </h2>
        <TradeTable trades={filteredTrades} />
      </div>
    </div>
  );
};
