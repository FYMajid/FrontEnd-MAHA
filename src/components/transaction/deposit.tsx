"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, X, ChevronDown, Calendar, FileText, Landmark, Edit2, Eye, TrendingDown } from 'lucide-react';
import { transactionService, DepositRecord } from '@/services/transactions';
import { contactService } from '@/services/contacts';
import { matterService, MatterItem } from '@/services/matters';

export default function DepositPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'ADD' | 'REFUND'>('ADD');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [matters, setMatters] = useState<MatterItem[]>([]);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [clientId, setClientId] = useState('');
  const [matterId, setMatterId] = useState<string | null>(null);
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [receiptProof, setReceiptProof] = useState('');
  const [destinationBank, setDestinationBank] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [description, setDescription] = useState('');

  // Fetch Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [depositData, contactData, allMatters] = await Promise.all([
          transactionService.listDeposits({
            search: searchQuery,
          }),
          contactService.list(),
          matterService.list(),
        ]);
        
        setDeposits(depositData);
        setContacts(contactData);
        setMatters(allMatters);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchQuery]);

  // Filter Matters when client changes
  useEffect(() => {
    if (!clientId) {
      setMatterId(null);
      return;
    }
  }, [clientId]);

  const handleSaveDeposit = async () => {
    try {
      setIsSaving(true);
      
      if (!clientId || !transactionDate || !amount) {
        alert('Mohon lengkapi semua field yang wajib diisi');
        return;
      }

      const payload = {
        action: modalType,
        clientId,
        matterId: matterId || null,
        transactionDate,
        amount: parseFloat(amount),
        paymentMethod,
        referenceNo,
        description,
      };

      if (editingId) {
        // For editing, use updateDepositAccount which takes a different DTO
        await transactionService.updateDeposit(editingId, {
          clientId,
          matterId: matterId || null,
          transactionDate,
          amount: parseFloat(amount),
          paymentMethod,
          referenceNo,
          description,
        });
      } else {
        await transactionService.createDeposit(payload);
      }

      // Reload data
      const freshData = await transactionService.listDeposits({
        search: searchQuery,
      });
      setDeposits(freshData);
      
      // Reset form
      handleCloseModal();
    } catch (error) {
      console.error('Error saving deposit:', error);
      alert('Gagal menyimpan deposit');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDeposit = async (id: string) => {
    if (confirm('Yakin ingin menghapus data deposit ini?')) {
      try {
        await transactionService.removeDeposit(id);
        setDeposits(deposits.filter(d => d.id !== id));
      } catch (error) {
        console.error('Error deleting deposit:', error);
        alert('Gagal menghapus deposit');
      }
    }
  };

  const handleEditDeposit = (deposit: DepositRecord) => {
    setEditingId(deposit.id);
    setClientId(deposit.clientId);
    setMatterId(deposit.matterId || null);
    setTransactionDate(deposit.lastTransactionDate.split('T')[0]);
    setAmount(String(deposit.amount));
    setPaymentMethod(deposit.paymentMethod || '');
    setReferenceNo(deposit.referenceNo || '');
    setDescription(deposit.description || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setClientId('');
    setMatterId(null);
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setAmount('');
    setPaymentMethod('');
    setReceiptProof('');
    setDestinationBank('');
    setReferenceNo('');
    setDescription('');
  };

  

  return (
    <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[#2B2A2A] dark:text-[#F5F2F2] p-4 md:p-10 transition-colors duration-500 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER & ACTIONS --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#5A7ACD] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari data deposit..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-2xl w-full pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-[#5A7ACD]/10 transition-all"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
             <button 
               onClick={() => { setModalType('ADD'); setIsModalOpen(true); }}
               className="flex-1 md:flex-none bg-[#5A7ACD] hover:bg-[#FEB05D] text-[#F5F2F2] hover:text-[#2B2A2A] px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-[#5A7ACD]/20 transition-all active:scale-95"
             >
               Add Deposit
             </button>
             <button 
               onClick={() => { setModalType('REFUND'); setIsModalOpen(true); }}
               className="flex-1 md:flex-none bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 text-[#2B2A2A] dark:text-[#F5F2F2] px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#FEB05D] hover:text-[#2B2A2A] hover:border-transparent transition-all shadow-sm"
             >
               Refund
             </button>
          </div>
        </div>

       

        {/* --- DATA TABLE / EMPTY STATE --- */}
        {deposits.length === 0 ? (
        <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-[3rem] p-24 text-center flex flex-col items-center justify-center min-h-[500px] shadow-xl shadow-[#2B2A2A]/5 dark:shadow-none">
          <div className="relative mb-8 group transition-transform hover:scale-105">
            <div className="bg-[#5A7ACD]/5 dark:bg-[#F5F2F2]/5 p-12 rounded-[3rem] border-2 border-dashed border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10">
              <Landmark size={80} className="text-[#5A7ACD] opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="absolute -top-4 -right-4 bg-[#FEB05D] p-4 rounded-2xl shadow-xl shadow-[#FEB05D]/20 animate-bounce">
                <Plus size={24} className="text-[#2B2A2A]" />
              </div>
            </div>
          </div>
          <h3 className="text-[#2B2A2A] dark:text-[#F5F2F2] text-2xl font-black uppercase tracking-tighter mb-2">No deposit found</h3>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest max-w-xs mx-auto leading-relaxed italic">
            Belum ada catatan deposit klien dalam sistem MAHA. Gunakan tombol di atas untuk manajemen dana titipan.
          </p>
        </div>
        ) : (
        <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-[2rem] shadow-xl overflow-hidden">
          {/* TABLE HEADER */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 bg-[#F5F2F2] dark:bg-[#2B2A2A]">
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest opacity-40">#</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest opacity-40">Client</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest opacity-40">Matter</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest opacity-40">Deposit Amount</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest opacity-40">Utilized</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest opacity-40">Available</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest opacity-40">Date</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((deposit, idx) => (
                  <tr key={deposit.id} className="border-b border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 hover:bg-[#5A7ACD]/2 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold">{idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-bold">{deposit.client?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm font-bold truncate">{deposit.matter?.caseArea || '-'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-[#5A7ACD]">Rp {deposit.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="text-right">
                        <p className="text-sm font-bold">Rp {deposit.utilizedAmount.toLocaleString()}</p>
                        <div className="w-20 h-1.5 bg-[#2B2A2A]/10 dark:bg-[#F5F2F2]/10 rounded-full mt-1 ml-auto overflow-hidden">
                          <div 
                            className="h-full bg-[#F59E0B] rounded-full" 
                            style={{width: `${deposit.utilizationPercent}%`}}
                          ></div>
                        </div>
                        <p className="text-[9px] opacity-40 mt-1">{deposit.utilizationPercent}%</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-[#22C55E]">Rp {deposit.availableAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold opacity-70">{new Date(deposit.lastTransactionDate).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 hover:bg-[#5A7ACD]/10 dark:hover:bg-[#F5F2F2]/5 rounded-lg transition-all text-[#5A7ACD]" title="View Details">
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditDeposit(deposit)}
                          className="p-2 hover:bg-[#5A7ACD]/10 dark:hover:bg-[#F5F2F2]/5 rounded-lg transition-all text-[#5A7ACD]" 
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 hover:bg-[#F59E0B]/10 dark:hover:bg-[#F5F2F2]/5 rounded-lg transition-all text-[#F59E0B]" title="Request Refund">
                           <TrendingDown size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteDeposit(deposit.id)}
                          className="p-2 hover:bg-[#EF4444]/10 dark:hover:bg-[#F5F2F2]/5 rounded-lg transition-all text-[#EF4444]" 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}


        {/* --- MODAL ADD/REFUND DEPOSIT --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2B2A2A]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-[#F5F2F2] dark:bg-[#2B2A2A] w-full max-w-lg max-h-[90vh] rounded-[3rem] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 shadow-2xl flex flex-col animate-in zoom-in duration-300 overflow-hidden text-[#2B2A2A] dark:text-[#F5F2F2]">
              
              <div className="p-8 border-b border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 flex justify-between items-center shrink-0 bg-white dark:bg-[#333232]">
                <div className="flex items-center gap-4">
                  <div className="bg-[#5A7ACD] p-3 rounded-2xl text-white shadow-lg shadow-[#5A7ACD]/20">
                    {modalType === 'ADD' ? <Plus size={24} /> : <TrendingDown size={24} />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter leading-tight">{modalType === 'ADD' ? 'Tambah' : 'Pengembalian'} Deposit</h2>
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-1">Sistem Keuangan Perkara MAHA</p>
                  </div>
                </div>
                <button onClick={handleCloseModal} className="p-2 hover:bg-[#2B2A2A]/5 dark:hover:bg-[#F5F2F2]/5 rounded-full transition-all">
                  <X size={28} />
                </button>
              </div>

              <div className="p-10 space-y-4 overflow-y-auto text-[#2B2A2A] dark:text-[#F5F2F2]">
                
                {/* KLIEN */}
                <div className="relative">
                  <select 
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-xl p-4 text-sm font-bold outline-none appearance-none focus:border-[#5A7ACD]"
                  >
                    <option value="" disabled hidden>Klien</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>{contact.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16}/>
                </div>

                {/* PERKARA */}
                <div className="relative">
                  <select 
                    value={matterId || ''}
                    onChange={(e) => setMatterId(e.target.value || null)}
                    disabled={!clientId}
                    className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-xl p-4 text-sm font-bold outline-none appearance-none focus:border-[#5A7ACD] disabled:opacity-50"
                  >
                    <option value="" disabled hidden>Perkara</option>
                    {matters
                      .filter((m: MatterItem) => m.clientId === clientId)
                      .map(matter => (
                        <option key={matter.id} value={matter.id}>{matter.caseArea} - {matter.caseType}</option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16}/>
                </div>

                {/* TANGGAL */}
                <div className="relative">
                  <input 
                    type="date" 
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-xl p-4 text-sm font-bold outline-none focus:border-[#5A7ACD] appearance-none"
                    style={{ color: transactionDate ? 'inherit' : 'transparent' }}
                  />
                  {!transactionDate && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold pointer-events-none opacity-70">
                      Tanggal
                    </span>
                  )}
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16}/>
                </div>

                {/* BUKTI PENERIMAAN */}
                <div className="relative">
                  <select 
                    value={receiptProof}
                    onChange={(e) => setReceiptProof(e.target.value)}
                    className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-xl p-4 text-sm font-bold outline-none appearance-none focus:border-[#5A7ACD]"
                  >
                    <option value="" disabled hidden>Bukti Penerimaan</option>
                    <option value="Kuitansi">Kuitansi</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Nota">Nota</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16}/>
                </div>

                {/* METODE PENERIMAAN */}
                <div className="relative">
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-xl p-4 text-sm font-bold outline-none appearance-none focus:border-[#5A7ACD]"
                  >
                    <option value="" disabled hidden>Metode Penerimaan</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16}/>
                </div>

                {/* REKENING BANK TUJUAN */}
                <div className="relative">
                  <select 
                    value={destinationBank}
                    onChange={(e) => setDestinationBank(e.target.value)}
                    className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-xl p-4 text-sm font-bold outline-none appearance-none focus:border-[#5A7ACD]"
                  >
                    <option value="" disabled hidden>Rekening Bank Tujuan</option>
                    <option value="BCA">BCA</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BNI">BNI</option>
                    <option value="BRI">BRI</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16}/>
                </div>

                {/* JUMLAH */}
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="Jumlah"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-xl p-4 text-sm font-bold outline-none focus:border-[#5A7ACD]" 
                  />
                </div>

                {/* SALDO DEPOSIT */}
                {modalType === 'REFUND' && (
                  <div className="pt-4 mt-2">
                    <h3 className="text-[#5A7ACD] font-bold text-sm mb-3">Saldo Deposit</h3>
                    <div className="w-full bg-[#2B2A2A]/5 dark:bg-[#333232] rounded-xl p-4 text-sm font-bold text-[#2B2A2A] dark:text-[#F5F2F2]">
                      Saldo : Rp 0,00
                    </div>
                  </div>
                )}
              </div>

              <div className="p-10 shrink-0 bg-white dark:bg-[#333232] flex justify-end items-center gap-6 border-t border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10">
                <button 
                  onClick={handleCloseModal} 
                  className="text-sm font-bold opacity-80 hover:opacity-100 transition-all px-4 py-2"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveDeposit}
                  disabled={isSaving}
                  className="px-8 py-3 bg-[#5A7ACD] hover:bg-[#FEB05D] disabled:opacity-50 text-[#F5F2F2] hover:text-[#2B2A2A] font-bold rounded-xl transition-all text-sm shadow-xl shadow-[#5A7ACD]/20 active:scale-95"
                >
                  {isSaving ? 'Processing...' : 'Konfirmasi'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}