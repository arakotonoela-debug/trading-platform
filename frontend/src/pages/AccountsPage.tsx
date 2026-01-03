import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Play, Pause } from 'lucide-react';
import { useAccounts, Account } from '../hooks/useAccounts';
import { Card } from '../components/Card';

export const AccountsPage: React.FC = () => {
  const { accounts, createAccount, updateAccount, deleteAccount, loading } = useAccounts();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    propFirm: 'DNA_FUNDED',
    balance: 10000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await updateAccount(editingId, formData);
      setEditingId(null);
    } else {
      await createAccount(formData);
    }

    setFormData({ name: '', propFirm: 'DNA_FUNDED', balance: 10000 });
    setShowForm(false);
  };

  const handleEdit = (account: Account) => {
    setFormData({
      name: account.name,
      propFirm: account.propFirm,
      balance: account.balance,
    });
    setEditingId(account.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte?')) {
      await deleteAccount(id);
    }
  };

  const propFirms = [
    { value: 'DNA_FUNDED', label: 'DNA Funded' },
    { value: 'BRIGHTFUNDED', label: 'BrightFunded' },
    { value: 'TOP_TIER', label: 'Top Tier Trader' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Comptes</h1>
          <p className="text-gray-600 mt-1">Gérez vos comptes prop firm</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', propFirm: 'DNA_FUNDED', balance: 10000 });
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Nouveau Compte
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingId ? 'Modifier le compte' : 'Créer un nouveau compte'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du compte
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: DNA Funded 1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prop Firm
                </label>
                <select
                  value={formData.propFirm}
                  onChange={(e) => setFormData({ ...formData, propFirm: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  {propFirms.map((firm) => (
                    <option key={firm.value} value={firm.value}>
                      {firm.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Solde Initial (€)
                </label>
                <input
                  type="number"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
                  placeholder="10000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                  min="1000"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? 'Traitement...' : editingId ? 'Modifier' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{account.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{account.propFirm}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                account.status === 'trading'
                  ? 'bg-green-100 text-green-800'
                  : account.status === 'verified'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {account.status === 'trading' ? '🟢 Trading' : account.status === 'verified' ? '🔵 Vérifié' : '🟡 Évaluation'}
              </span>
            </div>

            {/* Stats */}
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Solde</span>
                <span className="font-bold text-gray-900">{account.balance.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Profit</span>
                <span className={`font-bold ${account.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {account.profit > 0 ? '+' : ''}{account.profit.toFixed(2)}€
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Rendement</span>
                <span className={`font-bold ${account.profitPercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {account.profitPercent > 0 ? '+' : ''}{account.profitPercent.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Drawdown</span>
                <span className="font-bold text-gray-900">{account.drawdown.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Trades</span>
                <span className="font-bold text-gray-900">{account.trades}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(account)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                <Edit2 size={16} />
                Modifier
              </button>
              <button
                onClick={() => handleDelete(account.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
              >
                <Trash2 size={16} />
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && !showForm && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 mb-4">Aucun compte créé pour le moment</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Créer votre premier compte
          </button>
        </div>
      )}
    </div>
  );
};
