import React, { useState } from 'react';
import { Plus, Settings, Toggle2 } from 'lucide-react';
import { Card } from '../components/Card';

interface Strategy {
  id: string;
  name: string;
  type: string;
  description: string;
  enabled: boolean;
  winRate: number;
  profitFactor: number;
  trades: number;
  parameters: Record<string, any>;
}

export const StrategiesPage: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([
    {
      id: '1',
      name: 'Trend Following',
      type: 'TREND_FOLLOWING',
      description: 'Suivi de tendance avec moyennes mobiles',
      enabled: true,
      winRate: 58,
      profitFactor: 1.8,
      trades: 45,
      parameters: {
        ma_short: 20,
        ma_long: 50,
        min_confidence: 0.6,
        take_profit_pips: 50,
        stop_loss_pips: 30,
      },
    },
    {
      id: '2',
      name: 'Mean Reversion',
      type: 'MEAN_REVERSION',
      description: 'Retour à la moyenne avec bandes de Bollinger',
      enabled: true,
      winRate: 55,
      profitFactor: 1.6,
      trades: 32,
      parameters: {
        bb_period: 20,
        bb_std_dev: 2,
        min_confidence: 0.65,
        take_profit_pips: 30,
        stop_loss_pips: 40,
      },
    },
    {
      id: '3',
      name: 'Scalping',
      type: 'SCALPING',
      description: 'Positions courtes avec RSI',
      enabled: false,
      winRate: 52,
      profitFactor: 1.4,
      trades: 28,
      parameters: {
        rsi_period: 14,
        rsi_overbought: 70,
        rsi_oversold: 30,
        min_confidence: 0.7,
        take_profit_pips: 5,
        stop_loss_pips: 10,
      },
    },
  ]);

  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [showForm, setShowForm] = useState(false);

  const toggleStrategy = (id: string) => {
    setStrategies(
      strategies.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleSaveParameters = (updatedParams: Record<string, any>) => {
    if (selectedStrategy) {
      setStrategies(
        strategies.map((s) =>
          s.id === selectedStrategy.id
            ? { ...s, parameters: updatedParams }
            : s
        )
      );
      setSelectedStrategy(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stratégies de Trading</h1>
          <p className="text-gray-600 mt-1">Gérez et configurez vos stratégies</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus size={20} />
          Nouvelle Stratégie
        </button>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{strategy.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{strategy.description}</p>
              </div>
              <button
                onClick={() => toggleStrategy(strategy.id)}
                className={`p-2 rounded-lg transition ${
                  strategy.enabled
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <Toggle2 size={20} />
              </button>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Taux de Gain</span>
                <span className="font-bold text-gray-900">{strategy.winRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Profit Factor</span>
                <span className="font-bold text-gray-900">{strategy.profitFactor.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Trades</span>
                <span className="font-bold text-gray-900">{strategy.trades}</span>
              </div>
            </div>

            {/* Status */}
            <div className="mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                strategy.enabled
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {strategy.enabled ? '✓ Activée' : '✗ Désactivée'}
              </span>
            </div>

            {/* Actions */}
            <button
              onClick={() => setSelectedStrategy(strategy)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              <Settings size={16} />
              Configurer
            </button>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {selectedStrategy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Configurer: {selectedStrategy.name}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {Object.entries(selectedStrategy.parameters).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {key.replace(/_/g, ' ')}
                  </label>
                  <input
                    type={typeof value === 'number' ? 'number' : 'text'}
                    defaultValue={value}
                    step={typeof value === 'number' && value < 1 ? 0.01 : 1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => setSelectedStrategy(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => handleSaveParameters(selectedStrategy.parameters)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
