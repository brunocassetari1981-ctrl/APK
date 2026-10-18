import React, { useState } from 'react';
import {
  Smartphone,
  X,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Terminal,
  ShieldCheck,
  Download,
  QrCode,
  Sparkles,
  Zap,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { useApp } from '../context/AppContext';

interface PlayStoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayStoreInfoModal: React.FC<PlayStoreInfoModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'realtime' | 'apk'>('realtime');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  // Use the live shared preview URL or current window URL
  const appUrl =
    typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
      ? window.location.href.split('?')[0]
      : 'https://ais-dev-tr3y7zuvgoc4h76vlsm4ui-406707449082.us-east1.run.app';

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    appUrl
  )}&bgcolor=020617&color=10b981&margin=2`;

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      const response = await fetch('/FortuneGo-APK-Package.zip');
      if (!response.ok) throw new Error('Falha ao carregar pacote ZIP');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'FortuneGo-APK-Package.zip';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }, 4000);
      setDownloadSuccess(true);
      showToast('Download do FortuneGo-APK-Package.zip iniciado!');
    } catch (err) {
      console.warn('Direct blob download error, trying direct window open:', err);
      window.open('/FortuneGo-APK-Package.zip', '_blank');
      showToast('Abrindo download do arquivo em nova janela...');
    } finally {
      setTimeout(() => setIsDownloading(false), 1200);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    showToast('Link do app copiado! Envie para o seu celular Android.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCommands = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast('Comandos copiados!');
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleDirectInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      showToast('Aplicativo instalado no seu Android com sucesso!');
      onClose();
    } else {
      showToast('Selecione "Adicionar à tela inicial" no menu do Chrome.');
    }
  };

  const capacitorCommands = `npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "FortuneGo" "com.fortunego.app"
npm run build
npx cap add android
npx cap build android`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-emerald-500/30 border border-amber-500/40 p-0.5 flex items-center justify-center shrink-0 shadow-xl shadow-emerald-950/40 overflow-hidden ring-2 ring-emerald-500/50">
              <img
                src="/SmallTile.scale-400.png"
                alt="Ícone do APK FortuneGo"
                className="w-full h-full object-cover rounded-[14px]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-lg sm:text-xl">
                  Instalar no Android & Baixar APK
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Ícone Chama Ativo
                </span>
              </div>
              <p className="text-xs text-slate-400">
                FortuneGo — Apostas: Novo ícone e atalho oficial atualizados para Android e Web
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('realtime')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'realtime'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>1. Instalar com Atualizações Ao Vivo (Recomendado)</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'apk'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>2. Gerar Arquivo .APK Físico</span>
          </button>
        </div>

        {/* Tab 1: Real-time installation on Android (WebAPK) */}
        {activeTab === 'realtime' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Highlight Banner */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>O melhor método para testar e ver as alterações:</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Ao instalar dessa forma, o <strong>FortuneGo</strong> roda em tela cheia no seu Android exatamente como um APK nativo. Toda vez que fizermos uma alteração aqui no código, <strong>ela é atualizada na hora no seu celular</strong> sem você ter que desinstalar ou gerar um novo arquivo!
              </p>
            </div>

            {/* QR Code and Instructions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Aponte a Câmera do Android
                </span>
                <div className="p-2 bg-slate-950 rounded-xl border border-emerald-500/30 shadow-md">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code do App"
                    className="w-40 h-40 rounded-lg object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  Abre direto no Chrome do celular
                </span>
              </div>

              {/* Step by Step */}
              <div className="space-y-3 flex flex-col justify-center text-xs">
                <h5 className="font-bold text-white text-sm">Passo a passo no Android:</h5>
                <ol className="space-y-2.5 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      1
                    </span>
                    <span>Abra a câmera do celular ou acesse o link no <strong>Google Chrome</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      2
                    </span>
                    <span>
                      Toque no aviso <strong>"Adicionar FortuneGo à tela inicial"</strong> ou nos <strong>3 pontinhos</strong> do Chrome &gt; <strong>"Instalar aplicativo"</strong>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                      3
                    </span>
                    <span>
                      Pronto! O app abre em tela cheia com o novo ícone oficial no Android, sem barra de navegação do navegador!
                    </span>
                  </li>
                </ol>

                {/* If accessing on a device that supports direct prompt */}
                {isInstallable && (
                  <button
                    onClick={handleDirectInstall}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instalar no Celular Agora com 1 Toque</span>
                  </button>
                )}
              </div>
            </div>

            {/* Link Copy Box */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-semibold block">
                Ou envie este link para o WhatsApp / Telegram do seu celular:
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={appUrl}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Export physical .APK */}
        {activeTab === 'apk' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Direct Package Download with URL Location info */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-400" />
                  1. Baixar FortuneGo.apk (Instalador Oficial Android)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                  7.2 MB • Assinado V1/V2/V3
                </span>
              </div>

              {/* URL Location Box */}
              <div className="p-3 bg-slate-900/90 rounded-xl border border-emerald-500/20 text-xs space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-emerald-400">🌐 Localização de URL Configurada:</span>
                  <code className="text-white text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-700 break-all select-all">
                    https://ais-dev-tr3y7zuvgoc4h76vlsm4ui-406707449082.us-east1.run.app
                  </code>
                </div>
                <div className="text-slate-300 text-[11px] space-y-1">
                  <p>• <strong>Alterar URL no Celular:</strong> No app instalado, dê um <strong>toque longo de 2 segundos</strong> na tela para abrir a janela e digitar qualquer URL.</p>
                  <p>• <strong>Modo Offline Embutido:</strong> O APK inclui a plataforma completa (jogos de cassino, apostas, carteira) para funcionar 100% mesmo sem internet.</p>
                  <p>• <strong>Onde fica no Código:</strong> No arquivo <code>MainActivity.java</code> na linha 37 (<code>public static final String DEFAULT_URL</code>).</p>
                </div>
              </div>
              
              <div className="pt-1 flex flex-wrap gap-2.5">
                <a
                  href="/FortuneGo.apk"
                  download="FortuneGo.apk"
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs rounded-xl inline-flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar FortuneGo.apk (Instalador)</span>
                </a>

                <a
                  href="/FortuneGo-Android-Source.zip"
                  download="FortuneGo-Android-Source.zip"
                  className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 border border-slate-700/80 transition-all"
                >
                  <Terminal className="w-3.5 h-3.5 text-amber-400" />
                  <span>Código-Fonte Android (.ZIP)</span>
                </a>

                <button
                  onClick={handleDownloadZip}
                  disabled={isDownloading}
                  className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 border border-slate-700/80 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDownloading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : downloadSuccess ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Pacote Completo (.ZIP)</span>
                </button>
              </div>

              {/* Quick Individual Files */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span>Arquivos avulsos:</span>
                <a
                  href="/SmallTile.scale-400.png"
                  download="SmallTile.scale-400.png"
                  target="_blank"
                  className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  Ícone Chama (PNG)
                </a>
                <span>•</span>
                <a
                  href="/manifest.json"
                  download="manifest.json"
                  target="_blank"
                  className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  manifest.json
                </a>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">
                  2. Gerador Automático de APK (PWABuilder - Oficial)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-400">
                  Gera .APK Online
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                O <strong>PWABuilder</strong> conecta ao app com o novo ícone e compila o arquivo <code>.apk</code> assinado pronto para instalar no Android:
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <a
                  href={`https://www.pwabuilder.com?site=${encodeURIComponent(appUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2 border border-slate-700 shadow"
                >
                  <span>Gerar .APK com PWABuilder</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  3. Capacitor (Compilação Offline do APK no Android Studio)
                </span>
                <button
                  onClick={() => handleCopyCommands(capacitorCommands, 2)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                >
                  {copiedIndex === 2 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 2 ? 'Copiado!' : 'Copiar Comandos'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Para compilar manualmente no Android Studio usando o pacote descompactado:
              </p>
              <pre className="bg-slate-900 p-3 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
                {capacitorCommands}
              </pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            100% compatível com Android 8.0 até Android 15
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
