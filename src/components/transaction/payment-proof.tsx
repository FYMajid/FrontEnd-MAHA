"use client";

import React, { useState, useEffect } from 'react';
import {
  Search, Plus, FileCheck, X,
  ChevronDown, Building2,
  Edit2, Trash2, Eye, CheckCircle, Clock, User
} from 'lucide-react';
import { transactionService, PaymentProofRecord, InvoiceRecord } from '@/services/transactions';

export default function PaymentProofPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data
  const [proofs, setProofs] = useState<PaymentProofRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [senderName, setSenderName] = useState('');
  const [bankTarget, setBankTarget] = useState('');
  const [paymentPurpose, setPaymentPurpose] = useState('');
  const [digitalSignature, setDigitalSignature] = useState('');
  const [digitalStamp, setDigitalStamp] = useState('');
  const [signedBy, setSignedBy] = useState('');
  const [signedAs, setSignedAs] = useState('');

  // Fetch Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [proofData, invoiceData] = await Promise.all([
          transactionService.listPaymentProofs({
            search: searchQuery,
            status: activeFilter === 'All' ? undefined : activeFilter.toUpperCase() as any,
          }),
          transactionService.listInvoices(),
        ]);
        
        setProofs(proofData);
        setInvoices(invoiceData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    if (!isModalOpen || invoiceId || invoices.length === 0) return;
    setInvoiceId(invoices[0].id);
  }, [isModalOpen, invoiceId, invoices]);

  const handleSaveProof = async () => {
    try {
      setIsSaving(true);
      
      if (!invoiceId || !paymentDate || !amountPaid) {
        alert('Mohon lengkapi semua field yang wajib diisi');
        return;
      }

      const payload = {
        invoiceId,
        paymentDate,
        amountPaid: parseFloat(amountPaid),
        paymentMethod,
        referenceNo: senderName,
        notes,
      };

      if (editingId) {
        await transactionService.updatePaymentProof(editingId, payload);
      } else {
        await transactionService.createPaymentProof(payload);
      }

      // Reload data
      const freshData = await transactionService.listPaymentProofs({
        search: searchQuery,
        status: activeFilter === 'All' ? undefined : activeFilter.toUpperCase() as any,
      });
      setProofs(freshData);
      
      // Reset form
      handleCloseModal();
    } catch (error) {
      console.error('Error saving proof:', error);
      alert('Gagal menyimpan bukti pembayaran');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProof = async (id: string) => {
    if (confirm('Yakin ingin menghapus bukti pembayaran ini?')) {
      try {
        await transactionService.removePaymentProof(id);
        setProofs(proofs.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting proof:', error);
        alert('Gagal menghapus bukti pembayaran');
      }
    }
  };

  const handleEditProof = (proof: PaymentProofRecord) => {
    setEditingId(proof.id);
    setInvoiceId(proof.invoiceId);
    setPaymentDate(proof.paymentDate.split('T')[0]);
    setAmountPaid(String(proof.amountPaid));
    setPaymentMethod(proof.paymentMethod || '');
    setNotes(proof.notes || '');
    setSenderName(proof.referenceNo || '');
    setBankTarget('');
    setPaymentPurpose('');
    setDigitalSignature('');
    setDigitalStamp('');
    setSignedBy('');
    setSignedAs('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setInvoiceId('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setAmountPaid('');
    setPaymentMethod('');
    setNotes('');
    setSenderName('');
    setBankTarget('');
    setPaymentPurpose('');
    setDigitalSignature('');
    setDigitalStamp('');
    setSignedBy('');
    setSignedAs('');
  };

  
  return (
    <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[#2B2A2A] dark:text-[#F5F2F2] p-4 md:p-10 transition-colors duration-500 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- CONTROL BAR --- */}
        <div className="flex flex-wrap items-center gap-6 mb-10 bg-white dark:bg-[#333232] p-4 rounded-[2rem] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 shadow-sm">
          <div className="relative flex-grow max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#5A7ACD] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari bukti pembayaran..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#F5F2F2] dark:bg-[#2B2A2A] border border-transparent rounded-2xl w-full pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-[#5A7ACD]/10 transition-all"
            />
          </div>
          
          <div className="flex bg-[#F5F2F2] dark:bg-[#2B2A2A] p-1.5 rounded-2xl border border-[#2B2A2A]/5 gap-1">
            {['All', 'VERIFIED', 'PENDING'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeFilter === f ? 'bg-[#5A7ACD] text-white shadow-lg' : 'opacity-40 hover:opacity-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="ml-auto bg-[#5A7ACD] hover:bg-[#FEB05D] text-white hover:text-[#2B2A2A] px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-[#5A7ACD]/20 active:scale-95 flex items-center gap-2"
          >
            <Plus size={18} /> Add Proof
          </button>
        </div>

        {/* --- DATA TABLE / EMPTY STATE --- */}
        {proofs.length === 0 ? (
        <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-[3rem] p-24 text-center flex flex-col items-center justify-center min-h-[500px] shadow-xl shadow-[#2B2A2A]/5 dark:shadow-none">
          <div className="relative mb-8 group transition-transform hover:scale-105">
            <div className="bg-[#5A7ACD]/5 dark:bg-[#F5F2F2]/5 p-12 rounded-[3rem] border-2 border-dashed border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10">
              <FileCheck size={80} className="text-[#5A7ACD] opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="absolute -top-4 -right-4 bg-[#FEB05D] p-4 rounded-2xl shadow-xl shadow-[#FEB05D]/20 animate-bounce">
                <Plus size={24} className="text-[#2B2A2A]" />
              </div>
            </div>
          </div>
          <h3 className="text-[#2B2A2A] dark:text-[#F5F2F2] text-2xl font-black uppercase tracking-tighter mb-2">No payment proof found</h3>
          <p className="text-xs font-bold opacity-40 uppercase tracking-widest max-w-xs mx-auto leading-relaxed italic">
            Belum ada unggahan konfirmasi pembayaran dari klien yang tercatat dalam sistem MAHA.
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
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest opacity-40">Invoice</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest opacity-40">Client</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest opacity-40">Amount</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest opacity-40">Payment Date</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-40">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest opacity-40">Verified By</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {proofs.map((proof, idx) => (
                  <tr key={proof.id} className="border-b border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 hover:bg-[#5A7ACD]/2 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold">{idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-bold font-mono">{proof.invoice?.invoiceNo || '-'}</td>
                    <td className="px-6 py-4 text-sm font-bold">{proof.invoice?.client?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-right">Rp {proof.amountPaid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold">{new Date(proof.paymentDate).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                          proof.status === 'VERIFIED' ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                          proof.status === 'PENDING' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                          'bg-[#6B7280]/10 text-[#6B7280]'
                        }`}>
                          {proof.status === 'VERIFIED' && <CheckCircle size={14} />}
                          {proof.status === 'PENDING' && <Clock size={14} />}
                          {proof.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold opacity-70 flex items-center gap-2">
                      {proof.verifiedBy && (
                        <>
                          <User size={14} />
                          {proof.verifiedBy}
                        </>
                      )}
                      {!proof.verifiedBy && <span className="opacity-40">-</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {proof.fileUrl && (
                          <a href={proof.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-[#5A7ACD]/10 dark:hover:bg-[#F5F2F2]/5 rounded-lg transition-all text-[#5A7ACD]" title="View Document">
                            <Eye size={16} />
                          </a>
                        )}
                        <button 
                          onClick={() => handleEditProof(proof)}
                          className="p-2 hover:bg-[#5A7ACD]/10 dark:hover:bg-[#F5F2F2]/5 rounded-lg transition-all text-[#5A7ACD]" 
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProof(proof.id)}
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


        {/* --- MODAL ADD PAYMENT PROOF --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2B2A2A]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-[#F5F2F2] dark:bg-[#2B2A2A] w-full max-w-6xl rounded-[3rem] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in duration-300">
              
              {/* Header */}
              <div className="p-8 border-b border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 flex items-center justify-between bg-white dark:bg-[#333232]">
                <div className="flex items-center gap-4">
                  <div className="bg-[#5A7ACD] p-3 rounded-2xl text-white shadow-lg shadow-[#5A7ACD]/20">
                    <FileCheck size={24} />
                  </div>
                  <div>
                    <h2 className="text-[#2B2A2A] dark:text-[#F5F2F2] text-2xl font-black uppercase tracking-tighter leading-tight">{editingId ? 'Edit' : 'Add'} Payment Proof</h2>
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest mt-1 text-[#2B2A2A] dark:text-[#F5F2F2]">Konfirmasi Transaksi Perkara</p>
                  </div>
                </div>
                <button onClick={handleCloseModal} className="p-2 hover:bg-[#2B2A2A]/5 dark:hover:bg-[#F5F2F2]/5 rounded-full transition-all text-[#2B2A2A] dark:text-[#F5F2F2]">
                  <X size={28} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 md:p-8 lg:p-10 overflow-y-auto no-scrollbar">
                <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
                  <div className="bg-transparent rounded-2xl flex flex-col pt-0">
                    <div className="flex items-center gap-3 mb-6">
                      <FileCheck className="text-[#5A7ACD]" size={20} />
                      <h3 className="text-[#5A7ACD] font-bold text-lg">Tambah Kwitansi</h3>
                    </div>

                    <div className="space-y-4 text-[#2B2A2A] dark:text-[#F5F2F2]">
                      <div>
                        <input
                          type="text"
                          placeholder="Pengirim"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          className="w-full bg-transparent border border-[#2B2A2A]/20 dark:border-[#F5F2F2]/20 rounded-lg px-4 py-2.5 text-[13px] font-medium outline-none focus:border-[#5A7ACD] transition-all"
                        />
                      </div>

                      <hr className="border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 my-2" />

                      <div>
                        <input
                          type="number"
                          placeholder="Nilai Pembayaran"
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value)}
                          className="w-full bg-transparent border border-[#2B2A2A]/20 dark:border-[#F5F2F2]/20 rounded-lg px-4 py-2.5 text-[13px] font-medium outline-none focus:border-[#5A7ACD] transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full bg-transparent border border-[#2B2A2A]/20 dark:border-[#F5F2F2]/20 rounded-lg px-4 py-2.5 text-[13px] font-medium outline-none appearance-none focus:border-[#5A7ACD] transition-all"
                          >
                            <option value="">Metode Penerimaan</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cash">Cash</option>
                            <option value="Check">Check</option>
                            <option value="E-Wallet">E-Wallet</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16} />
                        </div>
                        <div className="relative">
                          <select
                            value={bankTarget}
                            onChange={(e) => setBankTarget(e.target.value)}
                            className="w-full bg-transparent border border-[#2B2A2A]/20 dark:border-[#F5F2F2]/20 rounded-lg px-4 py-2.5 text-[13px] font-medium outline-none appearance-none focus:border-[#5A7ACD] transition-all"
                          >
                            <option value="">Rekening Bank Tujuan</option>
                            <option value="BCA-1234567890">BCA - 1234567890</option>
                            <option value="BRI-9876543210">BRI - 9876543210</option>
                            <option value="MANDIRI-4443322110">Mandiri - 4443322110</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16} />
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Tujuan Pembayaran"
                          value={paymentPurpose}
                          onChange={(e) => setPaymentPurpose(e.target.value)}
                          className="w-full bg-transparent border border-[#2B2A2A]/20 dark:border-[#F5F2F2]/20 rounded-lg px-4 py-2.5 text-[13px] font-medium outline-none focus:border-[#5A7ACD] transition-all"
                        />
                      </div>

                      <hr className="border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 my-2" />

                      <div>
                        <textarea
                          placeholder="Catatan Tambahan"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full bg-transparent border border-[#2B2A2A]/20 dark:border-[#F5F2F2]/20 rounded-lg px-4 py-2.5 text-[13px] font-medium outline-none focus:border-[#5A7ACD] transition-all resize-none h-24"
                        ></textarea>
                      </div>

                      <hr className="border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 my-2" />

                      <div className="relative">
                        <select
                          value={digitalSignature}
                          onChange={(e) => setDigitalSignature(e.target.value)}
                          className="w-full bg-transparent border border-[#2B2A2A]/20 dark:border-[#F5F2F2]/20 rounded-lg px-4 py-2.5 text-[13px] font-medium outline-none appearance-none focus:border-[#5A7ACD] transition-all"
                        >
                          <option value="">Tanda Tangan Digital</option>
                          <option value="signature-1">Tanda tangan 1</option>
                          <option value="signature-2">Tanda tangan 2</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16} />
                      </div>

                      <div className="relative">
                        <select
                          value={digitalStamp}
                          onChange={(e) => setDigitalStamp(e.target.value)}
                          className="w-full bg-transparent border border-[#2B2A2A]/20 dark:border-[#F5F2F2]/20 rounded-lg px-4 py-2.5 text-[13px] font-medium outline-none appearance-none focus:border-[#5A7ACD] transition-all"
                        >
                          <option value="">Stempel Digital</option>
                          <option value="stamp-1">Stempel 1</option>
                          <option value="stamp-2">Stempel 2</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" size={16} />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <input
                            type="text"
                            placeholder="Ditandatangani Oleh"
                            value={signedBy}
                            onChange={(e) => setSignedBy(e.target.value)}
                            className="w-full bg-transparent border border-[#2B2A2A]/20 dark:border-[#F5F2F2]/20 rounded-lg px-4 py-2.5 text-[13px] font-medium outline-none focus:border-[#5A7ACD] transition-all"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Sebagai Posisi"
                            value={signedAs}
                            onChange={(e) => setSignedAs(e.target.value)}
                            className="w-full bg-transparent border border-[#2B2A2A]/20 dark:border-[#F5F2F2]/20 rounded-lg px-4 py-2.5 text-[13px] font-medium outline-none focus:border-[#5A7ACD] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-3">
                      <button
                        onClick={handleCloseModal}
                        className="w-full py-2.5 rounded-lg border border-[#2B2A2A]/40 dark:border-[#F5F2F2]/40 text-[13px] font-bold text-[#2B2A2A] dark:text-[#F5F2F2] hover:bg-[#2B2A2A]/5 dark:hover:bg-[#F5F2F2]/5 transition-all"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handleSaveProof}
                        disabled={isSaving}
                        className="w-full py-2.5 bg-[#5A7ACD] hover:bg-[#FEB05D] disabled:opacity-50 text-white font-bold rounded-lg transition-all text-[13px] shadow-sm active:scale-95"
                      >
                        {isSaving ? 'Menyimpan...' : editingId ? 'Perbarui' : 'Konfirmasi'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#F5F2F2] border border-[#2B2A2A]/10 rounded-xl p-8 text-[#2B2A2A] shadow-md flex pr-12 h-fit">
                    <div className="flex flex-col w-full">
                      <div className="flex items-center gap-4">
                        <div className="text-[#5A7ACD]">
                          <Building2 size={36} strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-base font-bold">(Mahasiswa hukum)</p>
                          <p className="text-[10px] font-bold opacity-60">Nomor Telepon: - Email: -</p>
                        </div>
                      </div>

                      <div className="mt-8 mb-4">
                        <p className="text-sm font-bold">Kwitansi</p>
                      </div>

                      <div className="space-y-6 text-xs font-bold mt-2">
                        <div className="flex items-end">
                          <span className="w-36">Telah Diterima</span>
                          <span className="mr-2">:</span>
                          <div className="flex-1 border-b border-[#2B2A2A]/40 mb-[2px]" />
                          <span className="mx-2">Rp</span>
                          <div className="w-28 border-b border-[#2B2A2A]/40 mb-[2px] text-right">
                            {Number.isFinite(Number(amountPaid)) && Number(amountPaid) > 0
                              ? Number(amountPaid).toLocaleString('id-ID')
                              : '0,00'}
                          </div>
                        </div>

                        <div className="flex items-end">
                          <span className="w-36">Terbilang</span>
                          <span className="mr-2">:</span>
                          <div className="flex-1 border-b border-[#2B2A2A]/40 mb-[2px]">
                            NOL RUPIAH
                          </div>
                        </div>

                        <div className="flex items-end">
                          <span className="w-36">Tujuan Pembayaran</span>
                          <span className="mr-2">:</span>
                          <div className="flex-1 border-b border-[#2B2A2A]/40 mb-[2px]">
                            {paymentPurpose || ' '}
                          </div>
                        </div>

                        <div className="pt-6 text-[10px] opacity-70">
                          Pembayaran Transfer Ke Rekening :
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}