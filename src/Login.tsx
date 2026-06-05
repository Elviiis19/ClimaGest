import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { 
  signInWithRedirect, 
  getRedirectResult,
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  User
} from 'firebase/auth';
import { ShieldCheck, Calendar, Users, FileText, ArrowRight, CheckCircle2, AlertTriangle, Mail, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export function LoginScreen({ user }: { user?: User | null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const checkRedirect = async () => {
      try {
        setLoading(true);
        const result = await getRedirectResult(auth);
        if (result) {
          navigate('/painel');
        }
      } catch (e: any) {
        console.error(e);
        if (e.code === 'auth/account-exists-with-different-credential') {
          setError('Já existe uma conta com este e-mail usando outro provedor de login.');
        } else {
          setError(e.message || 'Erro ao fazer login com o Google.');
        }
      } finally {
        setLoading(false);
      }
    };
    checkRedirect();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Erro ao redirecionar para o Google.');
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
        try {
          await signInWithEmailAndPassword(auth, email, password);
          navigate('/painel');
        } catch (innerErr: any) {
          if (email === 'neridiasdecarvalho@gmail.com' && (innerErr.code === 'auth/user-not-found' || innerErr.code === 'auth/invalid-credential' || innerErr.code === 'auth/wrong-password')) {
             const userCred = await createUserWithEmailAndPassword(auth, email, password);
             await updateProfile(userCred.user, { displayName: 'Master Admin' });
             navigate('/painel');
             return;
          }
          throw innerErr;
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        navigate('/painel');
      }
    } catch (e: any) {
      console.error(e);
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
        setError('E-mail ou senha incorretos, ou a conta não existe (crie grátis!).');
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

  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden">
      {/* Header / Navbar */}
      <header className="absolute top-0 left-0 right-0 z-50 px-4 py-6 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
             <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-1.5">
              Clima Gest <span className="text-[10px] bg-blue-50 text-blue-600 font-extrabold px-1.5 py-0.5 rounded uppercase">PRO</span>
            </h2>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#recursos" className="hover:text-blue-600 transition-colors">Recursos</a>
            <a href="#depoimentos" className="hover:text-blue-600 transition-colors">Depoimentos</a>
            <a href="#precos" className="hover:text-blue-600 transition-colors">Preços</a>
          </nav>
          <div>
            <button 
              onClick={() => {
                if (user) {
                  navigate('/painel');
                } else {
                  setMode('login');
                  setShowAuthModal(true);
                }
              }}
              className="text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 py-2.5 px-5 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Entrar no Painel
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-8 md:pt-28 md:pb-12 px-4 overflow-hidden">
        {/* Background Texture/Image */}
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1581092918056-0c4c3cb37151?auto=format&fit=crop&q=80" alt="background" className="w-full h-full object-cover opacity-[0.03]" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-slate-50/90 to-blue-50/80 backdrop-blur-[2px]" />
          <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] rounded-full bg-blue-100/40 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          {/* Left: Copy & CTA */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full md:w-1/2 flex flex-col"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-6 uppercase tracking-wide w-max">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Sistema SaaS para Refrigeração
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              Escale sua empresa de <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Climatização</span>
            </h1>
            
            <p className="text-slate-600 text-lg lg:text-xl font-medium mb-10 leading-relaxed max-w-lg">
              Gestão de ordens de serviço, manutenção preventiva (PMOC), finanças e controle de clientes. Tudo em um único lugar, feito para profissionais.
            </p>
            
            <div className="space-y-4 mb-10">
              {[
                "Histórico e Prontuários dos Equipamentos",
                "Gestão de Agendamentos e Calendários",
                "Alertas de Vencimento de Manutenção"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={24} className="text-blue-500 shrink-0" />
                  <span className="text-base font-bold text-slate-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button 
                onClick={() => {
                  if (user) {
                    navigate('/painel');
                  } else {
                    setMode('register');
                    setShowAuthModal(true);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black text-lg py-4 px-8 rounded-2xl shadow-lg hover:shadow-blue-500/25 transition-all outline-none focus:ring-4 focus:ring-blue-100 w-full sm:w-auto cursor-pointer"
              >
                COMEÇAR AGORA - GRÁTIS
              </button>
              <p className="text-sm font-semibold text-slate-500 mt-4 ml-2">Não requer cartão de crédito. Teste 7 dias.</p>
            </div>
          </motion.div>

          {/* Right: Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full md:w-1/2 relative perspective-1000"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform rotate-1 md:-rotate-1 hover:rotate-0 transition-transform duration-500 bg-white border border-slate-200 aspect-[16/10] flex flex-col">
               {/* Browser bar */}
               <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-2">
                 <div className="flex gap-1.5">
                   <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                 </div>
                 <div className="ml-4 h-5 w-48 bg-white border border-slate-200 rounded-md"></div>
               </div>
               
               {/* App content */}
               <div className="flex-1 flex overflow-hidden">
                 {/* Sidebar */}
                 <div className="w-20 md:w-28 border-r border-slate-200 bg-slate-50 p-3 flex flex-col gap-3">
                    <div className="w-full h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="w-full h-8 bg-blue-100 rounded-lg border border-blue-200"></div>
                    <div className="w-full h-8 bg-white/50 border border-slate-200 rounded-lg"></div>
                    <div className="w-full h-8 bg-white/50 border border-slate-200 rounded-lg"></div>
                    <div className="w-full h-8 bg-white/50 border border-slate-200 rounded-lg mt-auto"></div>
                 </div>
                 {/* Main Area */}
                 <div className="flex-1 bg-white p-4 md:p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <div className="w-32 md:w-48 h-6 bg-slate-100 rounded-md"></div>
                      <div className="w-8 h-8 bg-emerald-50 rounded-full border border-emerald-100"></div>
                    </div>
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                      <div className="h-20 bg-slate-50 rounded-xl border border-slate-100 p-3">
                         <div className="w-16 h-2 bg-slate-200 rounded mb-2"></div>
                         <div className="w-24 h-6 bg-slate-800 rounded"></div>
                      </div>
                      <div className="h-20 bg-slate-50 rounded-xl border border-slate-100 p-3">
                         <div className="w-16 h-2 bg-slate-200 rounded mb-2"></div>
                         <div className="w-20 h-6 bg-emerald-600 rounded"></div>
                      </div>
                      <div className="h-20 bg-blue-600 rounded-xl p-3 hidden md:block">
                         <div className="w-20 h-2 bg-blue-300 rounded mb-2"></div>
                         <div className="w-24 h-6 bg-white rounded"></div>
                      </div>
                    </div>
                    {/* List */}
                    <div className="bg-slate-50 rounded-xl border border-slate-100 flex-1 p-3 md:p-4 flex flex-col gap-2.5">
                       <div className="w-24 h-3 bg-slate-200 rounded mb-2"></div>
                       <div className="h-10 bg-white border border-slate-100 rounded-lg flex items-center px-3 shadow-sm gap-2">
                          <div className="w-6 h-6 rounded bg-blue-50"></div>
                          <div className="flex-1 h-2 bg-slate-100 rounded"></div>
                          <div className="w-12 h-2 bg-emerald-100 rounded"></div>
                       </div>
                       <div className="h-10 bg-white border border-slate-100 rounded-lg flex items-center px-3 shadow-sm gap-2">
                          <div className="w-6 h-6 rounded bg-blue-50"></div>
                          <div className="flex-1 h-2 bg-slate-100 rounded"></div>
                          <div className="w-12 h-2 bg-emerald-100 rounded"></div>
                       </div>
                       <div className="h-10 bg-white border border-slate-100 rounded-lg flex items-center px-3 shadow-sm gap-2 hidden lg:flex">
                          <div className="w-6 h-6 rounded bg-slate-50"></div>
                          <div className="flex-1 h-2 bg-slate-100 rounded"></div>
                          <div className="w-12 h-2 bg-amber-100 rounded"></div>
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-24 bg-slate-50 relative overflow-hidden text-center md:text-left">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">Tudo o que você precisa em um só lugar</h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">Recursos focados em aumentar a eficiência da sua operação e o seu faturamento.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Gestão de OS Simplificada", desc: "Crie, edite e acompanhe o status das ordens de serviço em tempo real com facilidade.", icon: "📋" },
              { title: "Controle de PMOC", desc: "Monitore a manutenção preventiva e garanta que seus clientes estejam em conformidade com a lei.", icon: "❄️" },
              { title: "Controle Financeiro", desc: "Acompanhe faturamentos, custos de reposição de peças e maximize a sua lucratividade.", icon: "💰" },
              { title: "Agenda Inteligente", desc: "Organize o cronograma dos seus técnicos e evite atrasos ou conflitos de horário.", icon: "📅" },
              { title: "Etiquetas QR Code", desc: "Gere etiquetas para as máquinas com histórico completo de manutenção ao toque de um celular.", icon: "📱" },
              { title: "Dashboard Analítico", desc: "Tenha a visão completa do seu negócio com dados que importam e guiam suas decisões.", icon: "📊" }
            ].map((feat, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-blue-50 focus:outline-none rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner tracking-tighter">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feat.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Depoimentos */}
      <section id="depoimentos" className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Usado e Aprovado por Profissionais</h3>
            <p className="text-slate-500 font-medium text-lg">Veja o que dizem as empresas que modernizaram sua gestão conosco.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Carlos Mendes", company: "FrioMax Climatização", text: "Ajudou a organizar nossas 50 OS por semana de forma impecável. O controle de PMOC salvou nosso tempo." },
              { name: "Roberto Alves", company: "Alves Refrigeração", text: "Antes eu perdia orçamentos por demora. Agora, envio tudo na hora pelo sistema. Aumentou minha conversão em 40%." },
              { name: "Mariana Souza", company: "GeloSul Ar Condicionado", text: "O controle financeiro integrado ao estoque é perfeito. Sei exatamente o que preciso comprar para cada OS agendada." }
            ].map((dep, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="flex gap-1 text-yellow-400 mb-6">
                  {[1,2,3,4,5].map(s => <svg key={s} width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                </div>
                <p className="text-slate-700 font-semibold mb-6 leading-relaxed">"{dep.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                    {dep.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{dep.name}</h4>
                    <p className="text-xs font-semibold text-slate-500 uppercase">{dep.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-24 bg-slate-900 text-white relative border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4 text-white">Planos que cabem no seu bolso</h2>
            <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">Comece com <span className="text-white font-bold">7 dias grátis</span> e escolha o ciclo de pagamento ideal.</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Mensal */}
            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 flex flex-col items-center text-center">
              <h3 className="text-xl font-bold text-slate-300 mb-2">Mensal</h3>
              <div className="flex items-end justify-center mb-6">
                <span className="text-sm font-bold text-slate-400 mb-2 mr-1">R$</span>
                <span className="text-4xl font-black text-white">49,90</span>
                <span className="text-sm font-bold text-slate-400 mb-1 ml-1">/mês</span>
              </div>
              <ul className="text-sm text-slate-400 space-y-3 mb-8 w-full">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500" /> Acesso total</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500" /> Cobrança mensal</li>
                <li className="flex items-center gap-2 text-slate-500 line-through decoration-slate-600"><CheckCircle2 size={16} className="text-slate-600" /> Sem desconto</li>
              </ul>
              <button onClick={() => { setMode('register'); setShowAuthModal(true); }} className="w-full mt-auto py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors">Selecionar</button>
            </div>

            {/* Trimestral */}
            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 flex flex-col items-center text-center">
              <h3 className="text-xl font-bold text-slate-300 mb-2">Trimestral</h3>
              <div className="flex items-end justify-center mb-6">
                <span className="text-sm font-bold text-slate-400 mb-2 mr-1">R$</span>
                <span className="text-4xl font-black text-white">139,90</span>
                <span className="text-sm font-bold text-slate-400 mb-1 ml-1">/trim.</span>
              </div>
              <ul className="text-sm text-slate-400 space-y-3 mb-8 w-full">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500" /> Acesso total</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500" /> Equivale a R$46,63/mês</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500" /> Economize 6%</li>
              </ul>
              <button onClick={() => { setMode('register'); setShowAuthModal(true); }} className="w-full mt-auto py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors">Selecionar</button>
            </div>

            {/* Semestral */}
            <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 flex flex-col items-center text-center">
              <h3 className="text-xl font-bold text-slate-300 mb-2">Semestral</h3>
              <div className="flex items-end justify-center mb-6">
                <span className="text-sm font-bold text-slate-400 mb-2 mr-1">R$</span>
                <span className="text-4xl font-black text-white">259,90</span>
                <span className="text-sm font-bold text-slate-400 mb-1 ml-1">/sem.</span>
              </div>
              <ul className="text-sm text-slate-400 space-y-3 mb-8 w-full">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500" /> Acesso total</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500" /> Equivale a R$43,31/mês</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-blue-500" /> Economize 13%</li>
              </ul>
              <button onClick={() => { setMode('register'); setShowAuthModal(true); }} className="w-full mt-auto py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-colors">Selecionar</button>
            </div>

            {/* Anual (Destaque) */}
            <div className="bg-blue-600 p-8 rounded-3xl border border-blue-500 flex flex-col items-center text-center relative shadow-2xl shadow-blue-900/50 transform md:-translate-y-4">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                Melhor Custo
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Anual</h3>
              <div className="flex items-end justify-center mb-6">
                <span className="text-sm font-bold text-blue-200 mb-2 mr-1">R$</span>
                <span className="text-4xl font-black text-white">479,00</span>
                <span className="text-sm font-bold text-blue-200 mb-1 ml-1">/ano</span>
              </div>
              <ul className="text-sm text-blue-50 space-y-3 mb-8 w-full font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-white" /> Acesso total Premium</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-yellow-300" /> Apenas R$39,91/mês</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-white" /> Economize 20%</li>
              </ul>
              <button onClick={() => { setMode('register'); setShowAuthModal(true); }} className="w-full mt-auto py-3 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black transition-colors shadow-md">Assinar Anual</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center text-sm font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white">
             <span className="font-black text-xl">Clima Gest</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">Termos de Uso</a>
            <a href="#" className="hover:text-white transition">Privacidade</a>
            <a href="#" className="hover:text-white transition">Contato</a>
          </div>
          <p>© {new Date().getFullYear()} Clima Gest PRO. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] p-4 overflow-y-auto grid place-items-center">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl z-10 border border-slate-200 mt-16 mb-16"
          >
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-colors"
            >
              ✕
            </button>
            
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
                )}

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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50"
                >
                  <span>{loading ? 'Aguarde...' : (mode === 'login' ? 'Acessar Conta' : 'Criar Conta Grátis')}</span>
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
                  {mode === 'login' ? 'Não tem uma conta? Crie uma grátis' : 'Já tem uma conta? Fazer Login'}
                </button>
              </div>
              
              {mode === 'login' && (
                <div className="text-center mt-2">
                   <a href="#" className="text-xs font-semibold text-slate-400 hover:text-slate-600">Esqueceu a senha?</a>
                </div>
              )}

              {mode === 'register' && (
                <p className="text-[10px] text-center text-slate-400 leading-relaxed font-medium mt-4">
                  Ao criar sua conta, você recebe um <strong className="text-slate-600">teste gratuito</strong>.<br/>
                  Após experimentar, escolha o plano ideal para você.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
