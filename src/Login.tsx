import React, { useState } from 'react';
import { auth } from './firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { ShieldCheck, Calendar, Users, FileText, ArrowRight, CheckCircle2, AlertTriangle, Mail, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      console.error(e);
      if (e.code === 'auth/popup-blocked') {
        setError('O navegador bloqueou a janela de login do Google. Por favor, permita pop-ups ou crie uma conta com e-mail e senha abaixo.');
      } else if (e.code === 'auth/account-exists-with-different-credential') {
        setError('Já existe uma conta com este e-mail usando outro provedor de login.');
      } else {
        setError(e.message || 'Erro ao fazer login com o Google.');
      }
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha o e-mail e a senha.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      }
    } catch (e: any) {
      console.error(e);
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
        setError('E-mail ou senha incorretos.');
      } else if (e.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado.');
      } else if (e.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else if (e.code === 'auth/operation-not-allowed') {
        setError('O login por e-mail e senha não está habilitado no Firebase (habilite no Console).');
      } else {
        setError(`Erro: ${e.code || e.message || 'Erro de autenticação.'}`);
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
            <p className="text-sm text-slate-500 font-medium">{mode === 'login' ? 'Faça login para acessar o painel' : 'Crie sua conta gratuitamente'}</p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-xs font-semibold mb-6 flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="button"
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
            
            <div className="flex items-center gap-3 py-2">
              <div className="h-px bg-slate-200 flex-1"></div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">ou e-mail</span>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Users size={18} />
                    </div>
                    <input
                      type="text"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-colors"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-colors"
                    placeholder="Seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-colors"
                    placeholder={mode === 'login' ? "Sua senha" : "Crie uma senha forte"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
              >
                <span>{loading ? 'Aguarde...' : (mode === 'login' ? 'Entrar no Painel' : 'Criar Conta Grátis')}</span>
              </button>
            </form>

            <div className="text-center mt-6">
              <button 
                type="button" 
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                }}
                className="text-sm font-semibold text-slate-600 hover:text-blue-600"
              >
                {mode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Fazer Login'}
              </button>
            </div>
            
            {mode === 'register' && (
              <p className="text-[10px] text-center text-slate-400 leading-relaxed font-medium mt-4">
                Ao criar sua conta, você recebe um <strong className="text-slate-600">teste de 7 dias grátis</strong>.<br/>
                Após, escolha um plano (Mensal, Trimestral, Semestral ou Anual).
              </p>
            )}
          </div>
        </motion.div>
      </div>
      
    </div>
  );
}
