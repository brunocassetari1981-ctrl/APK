import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  QrCode,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  History,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WalletView: React.FC = () => {
  const { user, depositPix, withdrawPix, transactions, showToast, resetDemoBalance } = useApp();

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [depositAmount, setDepositAmount] = useState<number>(50);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [pixKeyType, setPixKeyType] = useState<string>('CPF');
  const [pixKey, setPixKey] = useState<string>('123.456.789-00');
  const [hasCopiedPix, setHasCopiedPix] = useState(false);

  const depositPresets = [20, 50, 100, 200, 500];

  // Simulated authentic PIX Copia e Cola payload
  const pixCopiaCola = `00020126580014br.gov.bcb.pix0136${user.id}-fortunego-pix520400005303986540${depositAmount.toFixed(
    2
  )}5802BR5925FORTUNEGO PAGAMENTOS LTDA6009SAO PAULO62070503***6304E1F2`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCopiaCola);
    setHasCopiedPix(true);
    showToast('Código PIX Copia e Cola copiado com sucesso!');
    setTimeout(() => setHasCopiedPix(false), 3000);
  };

  const handleConfirmPixPayment = () => {
    depositPix(depositAmount);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    withdrawPix(withdrawAmount, pixKey, pixKeyType);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wallet Balance Card */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/20 p-5 sm:p-7 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Wallet className="w-4 h-4" />
              <span>Carteira Digital PIX</span>
            </div>
            <p className="text-slate-400 text-xs">Saldo Disponível para Saque e Jogos</p>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
              R$ {user.balance.toFixed(2)}
            </h1>
            <p className="text-xs text-emerald-400 font-semibold mt-1">
              + R$ {user.bonus.toFixed(2)} de bônus promocional ativo
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('deposit')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
                activeTab === 'deposit'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Depositar PIX</span>
            </button>
            <button
              onClick={() => setActiveTab('withdraw')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
                activeTab === 'withdraw'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Sacar PIX</span>
            </button>
          </div>
        </div>

        {/* Ambient decorative shape */}
        <div className="absolute -right-10 -bottom-20 w-60 h-60 rounded-full border-[32px] border-emerald-500/10 pointer-events-none" />
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('deposit')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'deposit'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Depósito Instantâneo</span>
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'withdraw'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Saque PIX</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
            activeTab === 'history'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Histórico</span>
        </button>
      </div>

      {/* TAB 1: Depósito via PIX */}
      {activeTab === 'deposit' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-7 space-y-6 shadow-xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              Depósito via PIX Automático (Instantâneo)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              O saldo cai na hora em sua conta FortuneGo, 24 horas por dia, 7 dias por semana.
            </p>
          </div>

          {/* Value Presets */}
          <div>
            <label className="text-xs text-slate-400 font-semibold block mb-2">
              Selecione o valor do depósito
            </label>
            <div className="grid grid-cols-5 gap-2">
              {depositPresets.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDepositAmount(preset)}
                  className={`py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
                    depositAmount === preset
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  R$ {preset}
                </button>
              ))}
            </div>
            <div className="mt-2.5 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                R$
              </span>
              <input
                type="number"
                min="5"
                step="5"
                value={depositAmount || ''}
                onChange={e => setDepositAmount(Math.max(5, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 pl-9 pr-3 text-white font-bold text-sm focus:outline-none"
                placeholder="Outro valor"
              />
            </div>
          </div>

          {/* QR Code & Copia e Cola Container */}
          <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800/80 flex flex-col md:flex-row items-center gap-6">
            {/* Simulated PIX QR Box */}
            <div className="w-44 h-44 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-lg relative">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-950">
                {/* Visual authentic QR grid pattern */}
                <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                <rect x="5" y="5" width="20" height="20" fill="white" />
                <rect x="10" y="10" width="10" height="10" fill="currentColor" />

                <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                <rect x="75" y="5" width="20" height="20" fill="white" />
                <rect x="80" y="10" width="10" height="10" fill="currentColor" />

                <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                <rect x="5" y="75" width="20" height="20" fill="white" />
                <rect x="10" y="80" width="10" height="10" fill="currentColor" />

                {/* Random decorative data points */}
                <rect x="36" y="12" width="6" height="6" />
                <rect x="46" y="24" width="8" height="8" />
                <rect x="58" y="14" width="6" height="12" />
                <rect x="15" y="45" width="12" height="6" />
                <rect x="38" y="42" width="10" height="10" />
                <rect x="55" y="48" width="8" height="8" />
                <rect x="70" y="50" width="14" height="6" />
                <rect x="38" y="72" width="8" height="8" />
                <rect x="54" y="68" width="6" height="14" />
                <rect x="72" y="76" width="12" height="12" />
              </svg>
            </div>

            {/* Instruction and Copy-paste */}
            <div className="flex-1 space-y-3 w-full">
              <div>
                <p className="text-sm font-bold text-white">Chave PIX Copia e Cola</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Abra seu aplicativo do banco, escolha PIX Copia e Cola e cole o código abaixo.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={pixCopiaCola}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {hasCopiedPix ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>{hasCopiedPix ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-900 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleConfirmPixPayment}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-98"
                >
                  <Zap className="w-4 h-4" />
                  <span>Simular Confirmação PIX (R$ {depositAmount.toFixed(2)})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Saque via PIX */}
      {activeTab === 'withdraw' && (
        <form
          onSubmit={handleWithdraw}
          className="bg-slate-900 rounded-2xl border border-slate-800 p-5 sm:p-7 space-y-5 shadow-xl"
        >
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-emerald-400" />
              Saque PIX para sua Conta Bancária
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              O dinheiro é transferido imediatamente via PIX para o titular cadastrado.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1.5">
                Tipo de Chave PIX
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['CPF', 'E-mail', 'Telefone', 'Aleatória'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPixKeyType(type)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      pixKeyType === type
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1.5">
                Chave PIX
              </label>
              <input
                type="text"
                required
                value={pixKey}
                onChange={e => setPixKey(e.target.value)}
                placeholder="Insira sua chave PIX"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 px-3 text-white text-sm font-medium focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>Valor do Saque (Mínimo R$ 10,00)</span>
                <span>Saldo Disponível: R$ {user.balance.toFixed(2)}</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  R$
                </span>
                <input
                  type="number"
                  min="10"
                  max={user.balance}
                  step="1"
                  required
                  value={withdrawAmount || ''}
                  onChange={e => setWithdrawAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2.5 pl-9 pr-3 text-white font-bold text-sm focus:outline-none"
                  placeholder="Valor para saque"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={withdrawAmount < 10 || withdrawAmount > user.balance}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-950/40 transition-transform active:scale-98 disabled:opacity-50"
            >
              Solicitar Saque PIX (R$ {withdrawAmount.toFixed(2)})
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Histórico de Transações */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              Extrato de Transações
            </h2>
            <span className="text-xs text-slate-400">{transactions.length} registros</span>
          </div>

          <div className="space-y-2.5">
            {transactions.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-500">Nenhuma transação registrada.</p>
            ) : (
              transactions.map(tx => {
                const isPositive = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isPositive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isPositive ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{tx.description}</p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(tx.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-black ${
                          isPositive ? 'text-emerald-400' : 'text-slate-200'
                        }`}
                      >
                        {isPositive ? '+' : ''}R$ {Math.abs(tx.amount).toFixed(2)}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                        Concluído
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
