import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { ShieldCheck, Calendar, Users, FileText, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      console.error(e);
      if (e.code === 'auth/popup-blocked') {
        setError('O navegador bloqueou a janela de login. Por favor, permita pop-ups na barra de endereços ou abra o app em uma nova guia externa.');
      } else {
        setError(e.message || 'Erro ao fazer login com o Google.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      
      {/* LEFT SIDE: Marketing & Copy */}
      <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center relative overflow-hidden bg-white">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-8 uppercase tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Sistema SaaS para Refrigeração
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight mb-6">
            Escale sua empresa de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Climatização</span>
          </h1>
          
          <p className="text-slate-500 text-lg md:text-xl font-medium mb-10 leading-relaxed">
            Gestão de ordens de serviço, manutenção preventiva (PMOC), finanças e controle de clientes. Tudo em um único lugar.
          </p>
          
          <div className="space-y-4 mb-12">
            {[
              "Histórico e Prontuários dos Equipamentos",
              "Gestão de Agendamentos e Calendário de Limpezas",
              "Alertas de Vencimento de Manutenção Periódica",
              "Geração de Etiquetas PMOC via QR Code",
              "Controle de Finanças e Reposição de Estoque"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 size={20} className="text-emerald-500" />
                <span className="text-sm font-semibold text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Background abstract decorations */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-blue-50/50 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-cyan-50/50 blur-3xl" />
      </div>

      {/* RIGHT SIDE: Login / Subscription Form */}
      <div className="md:w-1/2 bg-slate-50 p-8 md:p-16 flex flex-col justify-center items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-1.5 mb-2">
              Clima Gest <span className="text-xs bg-blue-50 text-blue-600 font-extrabold px-1.5 py-0.5 rounded uppercase">PRO</span>
            </h2>
            <p className="text-sm text-slate-500 font-medium">Faça login para acessar o painel empresarial</p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-xs font-semibold mb-6 flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full relative bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all outline-none focus:ring-4 focus:ring-slate-100 disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{loading ? 'Acessando...' : 'Entrar com Google'}</span>
            </button>
            
            <div className="flex items-center gap-3">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-xs text-slate-400 font-semibold uppercase">ou</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <p className="text-xs text-center text-slate-500 leading-relaxed font-medium">
              Primeiro acesso? Um <strong className="text-slate-700">teste de 7 dias grátis</strong> será ativado automaticamente. Após, você poderá escolher um plano (Mensal, Trimestral, Semestral ou Anual).
            </p>
          </div>
        </motion.div>

        {/* Pricing Mini-Teaser */}
        <div className="mt-12 text-center">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-4">Escolha seu plano após o teste</p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-white px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 opacity-70">Mensal<br/>R$ 49,90</span>
            <span className="bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center border border-blue-200 px-4 py-2 rounded-lg text-xs font-black text-blue-700 relative overflow-hidden shadow-sm">
               Anual (Best)<br/>R$ 479,00
            </span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
