import { useState, useCallback, useEffect } from 'react';

export interface Trade {
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
  confidence: number;
  accountId: string;
}

interface UseTradesReturn {
  trades: Trade[];
  loading: boolean;
  error: string | null;
  fetchTrades: (accountId?: string) => Promise<void>;
  createTrade: (data: Partial<Trade>) => Promise<Trade | null>;
  closeTrade: (id: string, exitPrice: number) => Promise<Trade | null>;
  getTrade: (id: string) => Trade | undefined;
  getTradeStats: () => {
    totalTrades: number;
    openTrades: number;
    closedTrades: number;
    winRate: number;
    totalProfit: number;
    profitFactor: number;
  };
}

export const useTrades = (): UseTradesReturn => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  const fetchTrades = useCallback(
    async (accountId?: string) => {
      setLoading(true);
      setError(null);

      try {
        const url = accountId
          ? `http://localhost:3001/api/trades?accountId=${accountId}`
          : 'http://localhost:3001/api/trades';

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des trades');
        }

        const data = await response.json();
        setTrades(data.data || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const createTrade = useCallback(
    async (data: Partial<Trade>) => {
      try {
        const response = await fetch('http://localhost:3001/api/trades', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la création du trade');
        }

        const result = await response.json();
        const newTrade = result.data;

        setTrades([...trades, newTrade]);
        return newTrade;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur';
        setError(message);
        return null;
      }
    },
    [token, trades]
  );

  const closeTrade = useCallback(
    async (id: string, exitPrice: number) => {
      try {
        const response = await fetch(`http://localhost:3001/api/trades/${id}/close`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ exitPrice }),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la fermeture du trade');
        }

        const result = await response.json();
        const closedTrade = result.data;

        setTrades(trades.map((t) => (t.id === id ? closedTrade : t)));
        return closedTrade;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur';
        setError(message);
        return null;
      }
    },
    [token, trades]
  );

  const getTrade = useCallback(
    (id: string) => {
      return trades.find((t) => t.id === id);
    },
    [trades]
  );

  const getTradeStats = useCallback(() => {
    const closedTrades = trades.filter((t) => t.status === 'closed');
    const openTrades = trades.filter((t) => t.status === 'open');

    const winningTrades = closedTrades.filter((t) => (t.profit || 0) > 0);
    const losingTrades = closedTrades.filter((t) => (t.profit || 0) < 0);

    const totalProfit = closedTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalWins = winningTrades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profit || 0), 0));

    return {
      totalTrades: trades.length,
      openTrades: openTrades.length,
      closedTrades: closedTrades.length,
      winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
      totalProfit,
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : 0,
    };
  }, [trades]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return {
    trades,
    loading,
    error,
    fetchTrades,
    createTrade,
    closeTrade,
    getTrade,
    getTradeStats,
  };
};
