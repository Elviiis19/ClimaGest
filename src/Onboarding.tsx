import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Building2, User as UserIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { UserProfile } from './types';

export function OnboardingScreen({ 
  user, 
  onComplete 
}: { 
  user: User, 
  onComplete: (data: UserProfile & { done: boolean }) => void 
}) {
  const [name, setName] = useState(user.displayName || '');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company) return;
    
    setLoading(true);
    const end = new Date();
    end.setDate(end.getDate() + 7);

    const profileData: UserProfile = { 
       id: user.uid,
       email: user.email || '',
       name, 
       company, 
       subscriptionStatus: 'trial',
       subscriptionPlan: 'free',
       trialEnd: end.toISOString(),
       createdAt: new Date().toISOString()
    };

    try {
      // Regra exige plan=="free" e certas chaves exatas na criaçao para simplificar. 
      // Mas nas regras modifiquei para suportar fields atuais
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email: profileData.email,
        name: profileData.name,
        company: profileData.company,
        subscriptionPlan: profileData.subscriptionPlan,
        subscriptionStatus: profileData.subscriptionStatus,
        trialEnd: profileData.trialEnd,
        createdAt: new Date().toISOString() // Let's pass the string explicitly because we didn't use Timestamp 
      });
      onComplete({ ...profileData, done: true });
    } catch(err: any) {
      console.error(err);
      window.alert("Erro ao salvar perfil: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-2">Bem-vindo(a)!</h1>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">
            Sua conta foi criada com sucesso. Antes de começarmos, por favor preencha os dados da sua empresa para configurar o seu painel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Seu Nome / Responsável</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserIcon size={18} />
              </div>
              <input
                type="text"
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-colors"
                placeholder="Ex: João Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nome da Empresa</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Building2 size={18} />
              </div>
              <input
                type="text"
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-colors"
                placeholder="Ex: JS Climatização"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Este nome aparecerá nos relatórios e orçamentos.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all outline-none focus:ring-4 focus:ring-blue-100 mt-4 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Configurar Sistema Estúdio"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
