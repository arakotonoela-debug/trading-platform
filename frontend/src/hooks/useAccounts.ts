import { useState, useCallback, useEffect } from 'react';

export interface Account {
  id: string;
  name: string;
  balance: number;
  equity: number;
  profit: number;
  profitPercent: number;
  drawdown: number;
  status: 'evaluation' | 'verified' | 'trading';
  propFirm: string;
  createdAt: string;
  trades: number;
}

interface UseAccountsReturn {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  createAccount: (data: Partial<Account>) => Promise<Account | null>;
  updateAccount: (id: string, data: Partial<Account>) => Promise<Account | null>;
  deleteAccount: (id: string) => Promise<boolean>;
  getAccount: (id: string) => Account | undefined;
}

export const useAccounts = (): UseAccountsReturn => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/accounts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des comptes');
      }

      const data = await response.json();
      setAccounts(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const createAccount = useCallback(
    async (data: Partial<Account>) => {
      try {
        const response = await fetch('http://localhost:3001/api/accounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la création du compte');
        }

        const result = await response.json();
        const newAccount = result.data;

        setAccounts([...accounts, newAccount]);
        return newAccount;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur';
        setError(message);
        return null;
      }
    },
    [token, accounts]
  );

  const updateAccount = useCallback(
    async (id: string, data: Partial<Account>) => {
      try {
        const response = await fetch(`http://localhost:3001/api/accounts/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour du compte');
        }

        const result = await response.json();
        const updatedAccount = result.data;

        setAccounts(accounts.map((acc) => (acc.id === id ? updatedAccount : acc)));
        return updatedAccount;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur';
        setError(message);
        return null;
      }
    },
    [token, accounts]
  );

  const deleteAccount = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`http://localhost:3001/api/accounts/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la suppression du compte');
        }

        setAccounts(accounts.filter((acc) => acc.id !== id));
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur';
        setError(message);
        return false;
      }
    },
    [token, accounts]
  );

  const getAccount = useCallback(
    (id: string) => {
      return accounts.find((acc) => acc.id === id);
    },
    [accounts]
  );

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return {
    accounts,
    loading,
    error,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getAccount,
  };
};
