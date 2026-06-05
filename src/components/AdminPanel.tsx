import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ShieldCheck, UserCheck, Search, Users, Activity, Power, PowerOff, Shield, RefreshCw } from 'lucide-react';
import { handleFirestoreError } from '../firebase';
import { UserProfile, AdminProfile } from '../types';

export function AdminPanel({ currentUserEmail }: { currentUserEmail: string | null }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminLevel, setNewAdminLevel] = useState<'master' | 'full' | 'viewer'>('viewer');

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      const qUsers = query(collection(db, 'users'));
      const qsUsers = await getDocs(qUsers);
      const fetchedUsers: UserProfile[] = qsUsers.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
      setUsers(fetchedUsers);

      const qAdmins = query(collection(db, 'admins'));
      const qsAdmins = await getDocs(qAdmins);
      const fetchedAdmins: AdminProfile[] = qsAdmins.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminProfile));
      setAdmins(fetchedAdmins);
    } catch (e: any) {
      console.error(e);
      window.alert("Erro ao carregar dados do admin: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  const handleUpdateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { subscriptionStatus: newStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, subscriptionStatus: newStatus } : u));
    } catch (e: any) {
      window.alert("Erro ao atualizar usuário: " + e.message);
    }
  };

  const handleExtendSubscription = async (userId: string, days: number) => {
    try {
      const u = users.find(u => u.id === userId);
      if (!u) return;

      const currentEnd = u.trialEnd ? new Date(u.trialEnd) : new Date();
      // Only extend if it's currently expired or close to. Otherwise, add to current.
      const newEnd = new Date(Math.max(Date.now(), currentEnd.getTime()));
      newEnd.setDate(newEnd.getDate() + days);

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { trialEnd: newEnd.toISOString() });
      setUsers(users.map(u => u.id === userId ? { ...u, trialEnd: newEnd.toISOString() } : u));
      window.alert("Assinatura estendida com sucesso!");
    } catch (e: any) {
      window.alert("Erro ao estender: " + e.message);
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    if(!window.confirm("ATENÇÃO: Deseja realmente excluir este usuário e todos os seus dados? Esta ação não pode ser desfeita.")) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(u => u.id !== userId));
      window.alert("Usuário excluído.");
    } catch(e: any) {
      window.alert("Erro ao excluir: " + e.message);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newAdminEmail) return;
    try {
      // Usar email como ID se preferir, ou usar um UUID gerado para ser mais flexível, vamos usar addDoc ou setDoc
      // Wait, firebase rule checks id. We can just use encoded email or let firebase generator use ID and check incoming auth
      // Usually users ID is their Firebase uid. So how will they be added? 
      // If we don't have their uid, we can manually add their UID?
      // For Admins collection we can just set the document ID as their UID, BUT we don't know their UID till they login.
      // So let's store it as document ID. 
      // Actually, if we use UUID then `exists(/databases/$(database)/documents/admins/$(request.auth.uid))` won't work!!!
      // The rules expect the admin document ID to be the user's UID.
      // However, Master can add them via User UID.
      window.alert("Para adicionar um admin, encontre o UID dele na lista de usuários cadastrados ou acesse via console.");
    } catch (e: any) {
      window.alert("Erro: " + e.message);
    }
  };
  
  const makeAdminFromUID = async (uid: string, email: string) => {
    try {
       await setDoc(doc(db, 'admins', uid), {
          email: email,
          level: 'full',
          createdAt: new Date().toISOString()
       });
       window.alert("Administrador adicionado!");
       fetchSystemData();
    } catch(e:any) {
       window.alert("Erro: " + e.message);
    }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  // Calculate generic sales analytics based on users
  const totalSubscribers = users.filter(u => u.subscriptionPlan && u.subscriptionPlan !== 'free' && u.subscriptionPlan !== 'trial').length;
  // Estimate revenue based on standard plans (just a rough overview)
  const estimatedRevenue = users.reduce((acc, u) => {
    if(u.subscriptionPlan === 'mensal') return acc + 49.90;
    if(u.subscriptionPlan === 'trimestral') return acc + 139.90;
    if(u.subscriptionPlan === 'semestral') return acc + 259.90;
    if(u.subscriptionPlan === 'anual') return acc + 479.0;
    return acc;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 mb-6 mt-2">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2"><ShieldCheck size={28} className="text-blue-600"/> Painel Administrativo</h2>
        <p className="text-sm text-slate-500 font-medium">Controle total da plataforma Clima Gest PRO.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-slate-400 font-bold"><RefreshCw className="animate-spin text-blue-500 mr-2" /> Carregando Sistema...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-500">Usuários Totais</h4>
                  <span className="text-2xl font-black text-slate-800">{users.length}</span>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users /></div>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-500">Assinaturas Pagas</h4>
                  <span className="text-2xl font-black text-slate-800">{totalSubscribers}</span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><UserCheck /></div>
             </div>
             <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-500">Capital Giro (Vendas)</h4>
                  <span className="text-2xl font-black text-emerald-600">R$ {estimatedRevenue.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-slate-900 text-white rounded-xl"><Activity /></div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-slate-800">Gerenciamento de Assinantes</h3>
               <div className="relative">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   type="text" 
                   className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                   placeholder="Buscar por nome ou email..."
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                 />
               </div>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-500">
                      <th className="pb-3 px-2">Usuário</th>
                      <th className="pb-3 px-2">Plano</th>
                      <th className="pb-3 px-2">Status</th>
                      <th className="pb-3 px-2">Expira em</th>
                      <th className="pb-3 px-2 text-right">Ações de Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUsers.map(user => {
                       const expired = user.trialEnd ? new Date(user.trialEnd) < new Date() : false;
                       return (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="py-3 px-2">
                             <div className="font-bold text-slate-800">{user.name}</div>
                             <div className="text-[10px] text-slate-400">{user.email} (UID: {user.id.slice(0, 5)}..)</div>
                          </td>
                          <td className="py-3 px-2">
                             <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                               {user.subscriptionPlan || 'N/A'}
                             </span>
                          </td>
                          <td className="py-3 px-2">
                             {user.subscriptionStatus === 'blocked' ? (
                               <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded uppercase">Bloqueado</span>
                             ) : expired ? (
                               <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase">Expirado</span>
                             ) : (
                               <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase">Ativo</span>
                             )}
                          </td>
                          <td className="py-3 px-2 text-xs font-bold text-slate-500">
                             {user.trialEnd ? new Date(user.trialEnd).toLocaleDateString() : '--'}
                          </td>
                          <td className="py-3 px-2 text-right">
                             <div className="flex justify-end gap-2">
                               {user.subscriptionStatus !== 'blocked' ? (
                                 <button onClick={() => handleUpdateUserStatus(user.id, 'blocked')} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg" title="Bloquear Acesso"><PowerOff size={16} /></button>
                               ) : (
                                 <button onClick={() => handleUpdateUserStatus(user.id, 'active')} className="text-emerald-500 hover:bg-emerald-50 p-1.5 rounded-lg" title="Desbloquear Acesso"><Power size={16} /></button>
                               )}
                               
                               <button onClick={() => handleExtendSubscription(user.id, 30)} className="text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 rounded-lg cursor-pointer">
                                 +30 Dias
                               </button>
                               
                               {!admins.find(a => a.id === user.id) && (
                                 <button onClick={() => makeAdminFromUID(user.id, user.email)} className="text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 rounded-lg cursor-pointer flex items-center gap-1" title="Tornar Admin">
                                   <Shield size={12} /> Promover
                                 </button>
                               )}
                               
                               <button onClick={() => handleDeleteUser(user.id)} className="text-[10px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-1 rounded-lg cursor-pointer">
                                 Excluir
                               </button>
                             </div>
                          </td>
                        </tr>
                       )
                    })}
                  </tbody>
               </table>
             </div>
          </div>
        </>
      )}

    </div>
  );
}
