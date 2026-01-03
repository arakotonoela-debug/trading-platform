import React from 'react';
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice?: number;
  profit?: number;
  profitPercent?: number;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
  strategy: string;
}

interface TradeTableProps {
  trades: Trade[];
  onTradeClick?: (trade: Trade) => void;
}

export const TradeTable: React.FC<TradeTableProps> = ({ trades, onTradeClick }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'BUY' ? 'text-green-600' : 'text-red-600';
  };

  const getProfitColor = (profit?: number) => {
    if (!profit) return 'text-gray-600';
    return profit > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Symbole
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Prix d'entrée
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Stratégie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Profit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {trades.map((trade) => (
              <tr
                key={trade.id}
                onClick={() => onTradeClick?.(trade)}
                className="hover:bg-gray-50 transition cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-semibold text-gray-900">{trade.symbol}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`flex items-center gap-1 font-medium ${getTypeColor(trade.type)}`}>
                    {trade.type === 'BUY' ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                    {trade.type}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {trade.entryPrice.toFixed(4)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-sm">
                  {trade.strategy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`font-semibold ${getProfitColor(trade.profit)}`}>
                    {trade.profit !== undefined ? (
                      <>
                        {trade.profit > 0 ? '+' : ''}{trade.profit.toFixed(2)}€
                        {trade.profitPercent !== undefined && (
                          <span className="text-xs ml-1">
                            ({trade.profitPercent > 0 ? '+' : ''}{trade.profitPercent.toFixed(2)}%)
                          </span>
                        )}
                      </>
                    ) : (
                      '-'
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trade.status)}`}>
                    {trade.status === 'open' ? 'Ouvert' : 'Fermé'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(trade.openedAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <ChevronRight size={20} className="text-gray-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {trades.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Aucun trade pour le moment</p>
        </div>
      )}
    </div>
  );
};
