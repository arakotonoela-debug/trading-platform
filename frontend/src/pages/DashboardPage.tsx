import React from 'react';
import { Card } from '../components/Card';
import { Chart } from '../components/Chart';
import { TradeTable } from '../components/TradeTable';
import { Alert } from '../components/Alert';
import { useAccounts } from '../hooks/useAccounts';
import { useTrades } from '../hooks/useTrades';
import { TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { accounts } = useAccounts();
  const { trades, getTradeStats } = useTrades();

  const stats = getTradeStats();

  // Données pour les graphiques
  const performanceData = [
    { name: 'Jour 1', profit: 100 },
    { name: 'Jour 2', profit: 250 },
    { name: 'Jour 3', profit: 180 },
    { name: 'Jour 4', profit: 420 },
    { name: 'Jour 5', profit: 550 },
    { name: 'Jour 6', profit: 680 },
    { name: 'Jour 7', profit: 850 },
  ];

  const winRateData = [
    { name: 'Gagnants', value: 58 },
    { name: 'Perdants', value: 42 },
  ];

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalProfit = accounts.reduce((sum, acc) => sum + acc.profit, 0);
  const avgDrawdown = accounts.length > 0
    ? accounts.reduce((sum, acc) => sum + acc.drawdown, 0) / accounts.length
    : 0;

  const recentTrades = trades.filter(t => t.status === 'closed').slice(-5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Bienvenue sur votre plateforme de trading</p>
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        <Alert
          type="info"
          title="Statut du système"
          message="Tous les services fonctionnent normalement. 3 comptes actifs."
          closable={true}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Solde Total"
          value={`${totalBalance.toFixed(2)}€`}
          icon={<Wallet size={32} />}
          trend="up"
          trendValue="+12.5% ce mois"
        />
        <Card
          title="Profit Réalisé"
          value={`${totalProfit.toFixed(2)}€`}
          icon={<TrendingUp size={32} />}
          trend={totalProfit > 0 ? 'up' : 'down'}
          trendValue={`${totalProfit > 0 ? '+' : ''}${((totalProfit / totalBalance) * 100).toFixed(2)}%`}
        />
        <Card
          title="Taux de Gain"
          value={`${stats.winRate.toFixed(1)}%`}
          icon={<Target size={32} />}
          subtitle={`${stats.closedTrades} trades fermés`}
        />
        <Card
          title="Drawdown Moyen"
          value={`${avgDrawdown.toFixed(2)}%`}
          icon={<TrendingDown size={32} />}
          trend="neutral"
          subtitle="Limite: 10%"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart
          type="area"
          data={performanceData}
          dataKey="profit"
          title="Performance (7 derniers jours)"
          height={300}
          color="#3b82f6"
        />
        <Chart
          type="bar"
          data={winRateData}
          dataKey="value"
          title="Taux de Gain"
          height={300}
          color="#10b981"
        />
      </div>

      {/* Accounts Summary */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Comptes Actifs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div key={account.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{account.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{account.propFirm}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  account.status === 'trading'
                    ? 'bg-green-100 text-green-800'
                    : account.status === 'verified'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {account.status === 'trading' ? 'Trading' : account.status === 'verified' ? 'Vérifié' : 'Évaluation'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Solde</span>
                  <span className="font-semibold text-gray-900">{account.balance.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Profit</span>
                  <span className={`font-semibold ${account.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {account.profit > 0 ? '+' : ''}{account.profit.toFixed(2)}€
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Drawdown</span>
                  <span className="font-semibold text-gray-900">{account.drawdown.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trades */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Trades Récents</h2>
        <TradeTable trades={recentTrades} />
      </div>
    </div>
  );
};
