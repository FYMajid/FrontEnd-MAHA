"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, X, ChevronDown, Receipt, Edit2, Trash2, Download, Send, Eye, Clock, Check, AlertCircle } from 'lucide-react';
import { transactionService, InvoiceRecord } from '@/services/transactions';
import { contactService } from '@/services/contacts';
import { matterService, MatterItem } from '@/services/matters';

export default function InvoicePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [matters, setMatters] = useState<any[]>([]);
  const [allMatters, setAllMatters] = useState<any[]>([]);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [clientId, setClientId] = useState('');
  const [matterId, setMatterId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('INV-001');
  const [customInvoiceNo, setCustomInvoiceNo] = useState(false);
  
  // Contact Information (Kepada)
  const [kepadaPhone, setKepadaPhone] = useState('');
  const [kepadaEmail, setKepadaEmail] = useState('');
  const [kepadaProvince, setKepadaProvince] = useState('');
  const [kepadaCity, setKepadaCity] = useState('');
  const [kepadaZipCode, setKepadaZipCode] = useState('');
  const [kepadaAddress, setKepadaAddress] = useState('');
  
  // Pengirim Information (From)
  const [pengirimPhone, setPengirimPhone] = useState('');
  const [pengirimEmail, setPengirimEmail] = useState('');
  const [pengirimProvince, setPengirimProvince] = useState('');
  const [pengirimCity, setPengirimCity] = useState('');
  const [pengirimZipCode, setPengirimZipCode] = useState('');
  const [pengirimAddress, setPengirimAddress] = useState('');
  
  // Additional Fields
  const [tagihan, setTagihan] = useState('');
  const [pajak, setPajak] = useState('10');
  const [diskon, setDiskon] = useState('0');
  const [akunBank, setAkunBank] = useState('');
  const [isTermin, setIsTermin] = useState(false);
  const [terminDate, setTerminDate] = useState('');
  const [tandaTangan, setTandaTangan] = useState(false);
  const [stempel, setStempel] = useState(false);
  const [ditandatanganiOleh, setDitandatanganiOleh] = useState('');
  const [sebagatPosisi, setSebagatPosisi] = useState('');
  const [pemberiPersetujuan, setPemberiPersetujuan] = useState('');
  
  // Billing Items State
  const [billingItems, setBillingItems] = useState<any[]>([]);
  const [itemDescription, setItemDescription] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [itemRate, setItemRate] = useState('');
  const [taxPercent, setTaxPercent] = useState('10');

  // Hitung subtotal dan total
  const subtotal = billingItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const tax = subtotal * (parseFloat(taxPercent || '0') / 100);
  const total = subtotal + tax;

  // Fetch Data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [invoiceData, contactData, allMatters] = await Promise.all([
          transactionService.listInvoices({
            search: searchQuery,
            status: activeFilter === 'All' ? undefined : activeFilter.toUpperCase() as any,
          }),
          contactService.list(),
          matterService.list(),
        ]);
        
        setInvoices(invoiceData);
        setContacts(contactData);
        setAllMatters(allMatters);
        setMatters(allMatters);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchQuery, activeFilter]);

  // Filter Matters when client changes
  useEffect(() => {
    if (!clientId) {
      setMatters(allMatters);
      setMatterId('');
      return;
    }

    // Filter matters for the selected client
    const clientMatters = allMatters.filter((m: MatterItem) => m.clientId === clientId);
    setMatters(clientMatters);
  }, [clientId, allMatters]);

  const addBillingItem = () => {
    if (itemDescription && itemQty && itemRate) {
      const newItem = {
        id: Date.now(),
        description: itemDescription,
        quantity: parseInt(itemQty),
        rate: parseFloat(itemRate),
        amount: parseInt(itemQty) * parseFloat(itemRate)
      };
      setBillingItems([...billingItems, newItem]);
      setItemDescription('');
      setItemQty('1');
      setItemRate('');
    }
  };

  const removeBillingItem = (id: number) => {
    setBillingItems(billingItems.filter(item => item.id !== id));
  };

  const handleSaveInvoice = async () => {
    try {
      setIsSaving(true);
      
      if (!clientId || !matterId || !dueDate || billingItems.length === 0) {
        alert('Mohon lengkapi semua field yang wajib diisi');
        return;
      }

      const payload = {
        clientId,
        matterId,
        invoiceNo,
        invoiceDate,
        dueDate,
        paymentTerms,
        description,
        notes,
        taxPercent: parseFloat(pajak || '0') || 0,
        items: billingItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
        })),
        // Additional invoice fields
        kepadaPhone,
        kepadaEmail,
        kepadaProvince,
        kepadaCity,
        kepadaZipCode,
        kepadaAddress,
        pengirimPhone,
        pengirimEmail,
        pengirimProvince,
        pengirimCity,
        pengirimZipCode,
        pengirimAddress,
        tagihan,
        diskon: parseFloat(diskon || '0') || 0,
        akunBank,
        isTermin,
        terminDate,
        tandaTangan,
        stempel,
        ditandatanganiOleh,
        sebagatPosisi,
        pemberiPersetujuan,
      };

      if (editingId) {
        await transactionService.updateInvoice(editingId, payload);
      } else {
        await transactionService.createInvoice(payload);
      }

      // Reload data
      const freshData = await transactionService.listInvoices({
        search: searchQuery,
        status: activeFilter === 'All' ? undefined : activeFilter.toUpperCase() as any,
      });
      setInvoices(freshData);
      
      // Reset form
      handleCloseModal();
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Gagal menyimpan invoice');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (confirm('Yakin ingin menghapus invoice ini?')) {
      try {
        await transactionService.removeInvoice(id);
        setInvoices(invoices.filter(inv => inv.id !== id));
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Gagal menghapus invoice');
      }
    }
  };

  const handleEditInvoice = (invoice: InvoiceRecord) => {
    setEditingId(invoice.id);
    setClientId(invoice.clientId);
    setMatterId(invoice.matterId);
    setInvoiceDate(invoice.invoiceDate.split('T')[0]);
    setDueDate(invoice.dueDate.split('T')[0]);
    setPaymentTerms(invoice.paymentTerms || 'Net 30');
    setDescription(invoice.description || '');
    setNotes(invoice.notes || '');
    setTaxPercent(String(invoice.taxPercent));
    setInvoiceNo(invoice.invoiceNo || 'INV-001');
    setCustomInvoiceNo(false);
    setKepadaPhone((invoice as any).kepadaPhone || '');
    setKepadaEmail((invoice as any).kepadaEmail || '');
    setKepadaProvince((invoice as any).kepadaProvince || '');
    setKepadaCity((invoice as any).kepadaCity || '');
    setKepadaZipCode((invoice as any).kepadaZipCode || '');
    setKepadaAddress((invoice as any).kepadaAddress || '');
    setPengirimPhone((invoice as any).pengirimPhone || '');
    setPengirimEmail((invoice as any).pengirimEmail || '');
    setPengirimProvince((invoice as any).pengirimProvince || '');
    setPengirimCity((invoice as any).pengirimCity || '');
    setPengirimZipCode((invoice as any).pengirimZipCode || '');
    setPengirimAddress((invoice as any).pengirimAddress || '');
    setTagihan((invoice as any).tagihan || '');
    setPajak(String((invoice as any).pajak || '10'));
    setDiskon(String((invoice as any).diskon || '0'));
    setAkunBank((invoice as any).akunBank || '');
    setIsTermin((invoice as any).isTermin || false);
    setTerminDate((invoice as any).terminDate || '');
    setTandaTangan((invoice as any).tandaTangan || false);
    setStempel((invoice as any).stempel || false);
    setDitandatanganiOleh((invoice as any).ditandatanganiOleh || '');
    setSebagatPosisi((invoice as any).sebagatPosisi || '');
    setPemberiPersetujuan((invoice as any).pemberiPersetujuan || '');
    setBillingItems(invoice.items.map(item => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      amount: item.amount,
    })));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setClientId('');
    setMatterId('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setPaymentTerms('Net 30');
    setDescription('');
    setNotes('');
    setInvoiceNo('INV-001');
    setCustomInvoiceNo(false);
    setKepadaPhone('');
    setKepadaEmail('');
    setKepadaProvince('');
    setKepadaCity('');
    setKepadaZipCode('');
    setKepadaAddress('');
    setPengirimPhone('');
    setPengirimEmail('');
    setPengirimProvince('');
    setPengirimCity('');
    setPengirimZipCode('');
    setPengirimAddress('');
    setTagihan('');
    setPajak('10');
    setDiskon('0');
    setAkunBank('');
    setIsTermin(false);
    setTerminDate('');
    setTandaTangan(false);
    setStempel(false);
    setDitandatanganiOleh('');
    setSebagatPosisi('');
    setPemberiPersetujuan('');
    setBillingItems([]);
    setTaxPercent('10');
  };

  return (
    <div className="min-h-screen bg-[#F5F2F2] dark:bg-[#2B2A2A] text-[#2B2A2A] dark:text-[#F5F2F2] p-4 md:p-10 transition-colors duration-500 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER & FILTERS BAR --- */}
        <div className="flex flex-wrap items-center gap-6 mb-10 bg-white dark:bg-[#333232] p-4 rounded-[2rem] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 shadow-sm">
          <div className="relative flex-grow max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#5A7ACD] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari invoice perkara..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#F5F2F2] dark:bg-[#2B2A2A] border border-transparent rounded-2xl w-full pl-12 pr-4 py-3.5 text-sm font-bold outline-none focus:ring-4 focus:ring-[#5A7ACD]/10 transition-all"
            />
          </div>
          
          <div className="flex bg-[#F5F2F2] dark:bg-[#2B2A2A] p-1.5 rounded-2xl border border-[#2B2A2A]/5 gap-1">
            {['All', 'DRAFT', 'PENDING', 'PAID', 'OVERDUE'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeFilter === f ? 'bg-[#5A7ACD] text-white shadow-lg' : 'opacity-40 hover:opacity-100'
                }`}
              >
                {f === 'UNPAID' ? 'Unpaid' : f}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="ml-auto bg-[#5A7ACD] hover:bg-[#FEB05D] text-white hover:text-[#2B2A2A] px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-[#5A7ACD]/20 active:scale-95"
          >
            Add Invoice
          </button>
        </div>       

        {/* --- DATA TABLE / EMPTY STATE --- */}
        {invoices.length === 0 ? (
        <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-[3rem] p-24 text-center flex flex-col items-center justify-center min-h-[500px] shadow-xl shadow-[#2B2A2A]/5 dark:shadow-none">
          <div className="relative mb-8 group transition-transform hover:scale-105">
            <div className="bg-[#5A7ACD]/5 dark:bg-[#F5F2F2]/5 p-12 rounded-[3rem] border-2 border-dashed border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10">
              <FileText size={80} className="text-[#5A7ACD] opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="absolute -top-4 -right-4 bg-[#FEB05D] p-4 rounded-2xl shadow-xl shadow-[#FEB05D]/20 animate-bounce">
                <Plus size={24} className="text-[#2B2A2A]" />
              </div>
            </div>
          </div>
          <h3 className="text-[#2B2A2A] dark:text-[#F5F2F2] text-2xl font-black uppercase tracking-tighter mb-2">No invoice found</h3>
          <button onClick={() => setIsModalOpen(true)} className="text-[#5A7ACD] dark:text-[#FEB05D] text-xs font-black uppercase tracking-widest mt-4 border-b-2 border-transparent hover:border-current transition-all">Add Invoice Sekarang</button>
        </div>
        ) : (
        <div className="bg-white dark:bg-[#333232] border border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 rounded-[2rem] shadow-xl overflow-hidden">
          {/* TABLE HEADER */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 bg-[#F5F2F2] dark:bg-[#2B2A2A]">
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest opacity-40">#</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest opacity-40">Invoice No.</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest opacity-40">Client</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest opacity-40">Matter</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest opacity-40">Amount</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-40">Status</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest opacity-40">Date</th>
                  <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest opacity-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice, idx) => (
                  <tr key={invoice.id} className="border-b border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 hover:bg-[#5A7ACD]/2 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold">{idx + 1}</td>
                    <td className="px-6 py-4 text-sm font-bold font-mono">{invoice.invoiceNo}</td>
                    <td className="px-6 py-4 text-sm font-bold">{invoice.client?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm font-bold truncate">{invoice.matter?.caseArea || '-'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-right">Rp {invoice.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
                          invoice.status === 'PAID' ? 'bg-[#22C55E]/10 text-[#22C55E]' :
                          invoice.status === 'PENDING' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                          invoice.status === 'OVERDUE' ? 'bg-[#EF4444]/10 text-[#EF4444]' :
                          'bg-[#6B7280]/10 text-[#6B7280]'
                        }`}>
                          {invoice.status === 'PAID' && <Check size={14} />}
                          {invoice.status === 'PENDING' && <Clock size={14} />}
                          {invoice.status === 'OVERDUE' && <AlertCircle size={14} />}
                          {invoice.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold opacity-70">{new Date(invoice.invoiceDate).toLocaleDateString('id-ID')}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 hover:bg-[#5A7ACD]/10 dark:hover:bg-[#F5F2F2]/5 rounded-lg transition-all text-[#5A7ACD]" title="View">
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditInvoice(invoice)}
                          className="p-2 hover:bg-[#5A7ACD]/10 dark:hover:bg-[#F5F2F2]/5 rounded-lg transition-all text-[#5A7ACD]" 
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button className="p-2 hover:bg-[#5A7ACD]/10 dark:hover:bg-[#F5F2F2]/5 rounded-lg transition-all text-[#5A7ACD]" title="Download">
                          <Download size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteInvoice(invoice.id)}
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


        {/* --- SPLIT MODAL ADD INVOICE --- */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2B2A2A]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-[#F5F2F2] dark:bg-[#2B2A2A] w-full max-w-[96%] h-[92vh] rounded-[3rem] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 shadow-2xl flex overflow-hidden animate-in zoom-in duration-300">
              
              {/* Bagian Kiri: Input Data */}
              <div className="w-[45%] p-8 border-r border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10 overflow-y-auto no-scrollbar bg-white dark:bg-[#2B2A2A]">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-[#2B2A2A] dark:text-[#F5F2F2] text-xl font-black uppercase tracking-tighter leading-tight">
                    Tambah Invoice
                  </h2>
                  <button onClick={handleCloseModal} className="p-2 hover:bg-[#2B2A2A]/5 dark:hover:bg-[#F5F2F2]/5 rounded-full transition-all text-[#2B2A2A] dark:text-[#F5F2F2]">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* KONTAK & PERKARA */}
                  <section className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase ml-1 tracking-widest opacity-60">Kontak</label>
                        <select 
                          value={clientId}
                          onChange={(e) => setClientId(e.target.value)}
                          className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none appearance-none focus:border-[#5A7ACD]"
                        >
                          <option value="">Pilih Kontak</option>
                          {contacts.map(contact => (
                            <option key={contact.id} value={contact.id}>{contact.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase ml-1 tracking-widest opacity-60">Perkara</label>
                        <select 
                          value={matterId}
                          onChange={(e) => setMatterId(e.target.value)}
                          disabled={!clientId}
                          className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none appearance-none focus:border-[#5A7ACD] disabled:opacity-50"
                        >
                          <option value="">Pilih Perkara</option>
                          {matters.map(matter => (
                            <option key={matter.id} value={matter.id}>{matter.caseArea} - {matter.caseType}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* TANGGAL & NOMOR INVOICE */}
                  <section className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase ml-1 tracking-widest opacity-60">Tanggal</label>
                        <input 
                          type="date" 
                          value={invoiceDate}
                          onChange={(e) => setInvoiceDate(e.target.value)}
                          className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#5A7ACD]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase ml-1 tracking-widest opacity-60">Nomor Invoice</label>
                        <input 
                          type="text"
                          value={invoiceNo}
                          onChange={(e) => setInvoiceNo(e.target.value)}
                          disabled={customInvoiceNo}
                          placeholder="INV-001"
                          className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#5A7ACD] disabled:opacity-50"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={customInvoiceNo}
                        onChange={(e) => setCustomInvoiceNo(e.target.checked)}
                        className="w-4 h-4 border-2 border-[#5A7ACD] rounded" 
                      />
                      <span className="text-[10px] font-bold">Kustom Nomor Invoice</span>
                    </label>
                  </section>

                  {/* KEPADA YTH (BILL TO) */}
                  <section className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Kepada Yth:</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="tel" 
                        value={kepadaPhone}
                        onChange={(e) => setKepadaPhone(e.target.value)}
                        placeholder="Nomor Telepon" 
                        className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#5A7ACD]" 
                      />
                      <input 
                        type="email" 
                        value={kepadaEmail}
                        onChange={(e) => setKepadaEmail(e.target.value)}
                        placeholder="Email" 
                        className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#5A7ACD]" 
                      />
                      <select 
                        value={kepadaProvince}
                        onChange={(e) => setKepadaProvince(e.target.value)}
                        className="col-span-2 w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none appearance-none focus:border-[#5A7ACD]"
                      >
                        <option>Pilih Provinsi</option>
                        <option>Jakarta</option>
                        <option>Bandung</option>
                        <option>Surabaya</option>
                      </select>
                      <input 
                        type="text" 
                        value={kepadaCity}
                        onChange={(e) => setKepadaCity(e.target.value)}
                        placeholder="Kota" 
                        className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#5A7ACD]" 
                      />
                      <input 
                        type="text" 
                        value={kepadaZipCode}
                        onChange={(e) => setKepadaZipCode(e.target.value)}
                        placeholder="Kode Pos" 
                        className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#5A7ACD]" 
                      />
                      <textarea 
                        value={kepadaAddress}
                        onChange={(e) => setKepadaAddress(e.target.value)}
                        placeholder="Alamat" 
                        rows={2} 
                        className="col-span-2 w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#5A7ACD] resize-none" 
                      />
                    </div>
                  </section>

                  {/* PENGIRIM (FROM) */}
                  <section className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Pengirim:</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="tel" 
                        value={pengirimPhone}
                        onChange={(e) => setPengirimPhone(e.target.value)}
                        placeholder="Nomor Telepon" 
                        className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#5A7ACD]" 
                      />
                      <input 
                        type="email" 
                        value={pengirimEmail}
                        onChange={(e) => setPengirimEmail(e.target.value)}
                        placeholder="Email" 
                        className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#5A7ACD]" 
                      />
                      <select 
                        value={pengirimProvince}
                        onChange={(e) => setPengirimProvince(e.target.value)}
                        className="col-span-2 w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none appearance-none focus:border-[#5A7ACD]"
                      >
                        <option>Pilih Provinsi</option>
                        <option>Jakarta</option>
                        <option>Bandung</option>
                        <option>Surabaya</option>
                      </select>
                      <input 
                        type="text" 
                        value={pengirimCity}
                        onChange={(e) => setPengirimCity(e.target.value)}
                        placeholder="Kota" 
                        className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#5A7ACD]" 
                      />
                      <input 
                        type="text" 
                        value={pengirimZipCode}
                        onChange={(e) => setPengirimZipCode(e.target.value)}
                        placeholder="Kode Pos" 
                        className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#5A7ACD]" 
                      />
                      <textarea 
                        value={pengirimAddress}
                        onChange={(e) => setPengirimAddress(e.target.value)}
                        placeholder="Alamat" 
                        rows={2} 
                        className="col-span-2 w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#5A7ACD] resize-none" 
                      />
                    </div>
                  </section>

                  {/* TAGIHAN, PAJAK & DISKON */}
                  <section className="space-y-3">
                    <select 
                      value={tagihan}
                      onChange={(e) => setTagihan(e.target.value)}
                      className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none appearance-none focus:border-[#5A7ACD]"
                    >
                      <option>Pilih Tagihan</option>
                      <option>Layanan</option>
                      <option>Biaya</option>
                    </select>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <input 
                          type="number" 
                          value={pajak}
                          onChange={(e) => setPajak(e.target.value)}
                          placeholder="Pajak" 
                          className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#5A7ACD]" 
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-60">%</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={diskon}
                          onChange={(e) => setDiskon(e.target.value)}
                          placeholder="Diskon" 
                          className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#5A7ACD]" 
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-60">%</span>
                      </div>
                    </div>
                  </section>

                  {/* AKUN BANK & TERMIN */}
                  <section className="space-y-3">
                    <select 
                      value={akunBank}
                      onChange={(e) => setAkunBank(e.target.value)}
                      className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none appearance-none focus:border-[#5A7ACD]"
                    >
                      <option>Akun Bank Tujuan</option>
                      <option>BCA 123456</option>
                      <option>Mandiri 654321</option>
                    </select>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 flex-1 cursor-pointer">
                        <div 
                          onClick={() => setIsTermin(false)}
                          className={`w-4 h-4 rounded-full border-2 border-[#5A7ACD] flex items-center justify-center transition-all ${!isTermin ? 'bg-[#5A7ACD]' : ''}`}
                        >
                          {!isTermin && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        <span className="text-[10px] font-bold">Termin</span>
                      </label>
                      <label className="flex items-center gap-2 flex-1 cursor-pointer">
                        <div 
                          onClick={() => setIsTermin(true)}
                          className={`w-4 h-4 rounded-full border-2 border-[#5A7ACD] flex items-center justify-center transition-all ${isTermin ? 'bg-[#5A7ACD]' : ''}`}
                        >
                          {isTermin && <div className="w-2 h-2 rounded-full bg-white"></div>}
                        </div>
                        <span className="text-[10px] font-bold">Non Termin</span>
                      </label>
                    </div>
                    <input 
                      type="date" 
                      value={terminDate}
                      onChange={(e) => setTerminDate(e.target.value)}
                      className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#5A7ACD]" 
                    />
                  </section>

                  {/* CATATAN & DIGITAL SIGNATURE */}
                  <section className="space-y-3">
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Catatan tambahan" 
                      rows={3}
                      className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none resize-none focus:border-[#5A7ACD]"
                    />
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={tandaTangan}
                        onChange={(e) => setTandaTangan(e.target.checked)}
                        className="w-4 h-4 border-2 border-[#5A7ACD] rounded" 
                      />
                      <span className="text-[10px] font-bold">Tanda Tangan Digital</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={stempel}
                        onChange={(e) => setStempel(e.target.checked)}
                        className="w-4 h-4 border-2 border-[#5A7ACD] rounded" 
                      />
                      <span className="text-[10px] font-bold">Stempel Digital</span>
                    </label>
                    <select 
                      value={ditandatanganiOleh}
                      onChange={(e) => setDitandatanganiOleh(e.target.value)}
                      className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none appearance-none focus:border-[#5A7ACD]"
                    >
                      <option>Ditandatangani Oleh</option>
                      <option>Aufa Hajran</option>
                      <option>Rina Wijaya</option>
                    </select>
                    <input 
                      type="text" 
                      value={sebagatPosisi}
                      onChange={(e) => setSebagatPosisi(e.target.value)}
                      placeholder="Sebagai Posisi" 
                      className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none focus:border-[#5A7ACD]" 
                    />
                    <select 
                      value={pemberiPersetujuan}
                      onChange={(e) => setPemberiPersetujuan(e.target.value)}
                      className="w-full bg-[#F5F2F2] dark:bg-[#333232] border border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 rounded-2xl p-3 text-sm font-bold outline-none appearance-none focus:border-[#5A7ACD]"
                    >
                      <option>Pemberi Persetujuan</option>
                      <option>Director</option>
                      <option>Manager</option>
                    </select>
                  </section>

                  {/* BUTTONS */}
                  <section className="grid grid-cols-2 gap-3 pt-4 border-t border-[#2B2A2A]/5 dark:border-[#F5F2F2]/10">
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-3 border border-[#2B2A2A]/20 dark:border-[#F5F2F2]/20 hover:bg-[#2B2A2A]/5 dark:hover:bg-[#F5F2F2]/5 text-[#2B2A2A] dark:text-[#F5F2F2] font-black text-xs uppercase tracking-widest rounded-2xl transition-all"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveInvoice}
                      disabled={isSaving}
                      className="px-6 py-3 bg-[#5A7ACD] hover:bg-[#FEB05D] disabled:opacity-50 text-white hover:text-[#2B2A2A] font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-[#5A7ACD]/20"
                    >
                      {isSaving ? 'Menyimpan...' : 'Konfirmasi'}
                    </button>
                  </section>
                </div>
              </div>

              {/* Bagian Kanan: Preview Dokumen */}
              <div className="w-[55%] bg-[#F5F2F2] dark:bg-[#4A4949] p-8 overflow-y-auto no-scrollbar shadow-inner flex flex-col items-center justify-start">
                <div className="w-full max-w-2xl bg-white dark:bg-[#333232] p-12 rounded-lg shadow-2xl text-[#2B2A2A] dark:text-[#F5F2F2]">
                  
                  {/* HEADER */}
                  <div className="text-center mb-8 pb-8 border-b-2 border-[#2B2A2A]/20 dark:border-[#F5F2F2]/20">
                    <h2 className="text-lg font-black uppercase tracking-tight mb-2">({clientId ? contacts.find(c => c.id === clientId)?.name : 'Mahasiswa hukum'})</h2>
                    <p className="text-xs opacity-60">Nomor Telepon: {kepadaPhone || '-'}</p>
                    <p className="text-xs opacity-60">Email: {kepadaEmail || '-'}</p>
                  </div>

                  {/* INVOICE INFO */}
                  <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b-2 border-[#2B2A2A]/20 dark:border-[#F5F2F2]/20">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide opacity-60 mb-2">Kepada Yth:</p>
                      <p className="font-bold text-sm uppercase mb-3">{contacts.find(c => c.id === clientId)?.name || 'Nama Client'}</p>
                      <p className="text-xs opacity-60 mb-1">Perkara &nbsp; : &nbsp; {matters.find(m => m.id === matterId)?.caseArea || '-'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-60">Nomor invoice</p>
                      <p className="font-bold text-sm mb-3">{invoiceNo || 'INV-001'}</p>
                      <p className="text-xs opacity-60">Tanggal</p>
                      <p className="font-bold text-sm">{invoiceDate ? new Date(invoiceDate).toLocaleDateString('id-ID') : '-'}</p>
                    </div>
                  </div>

                  {/* KEPADA YTH & PENGIRIM */}
                  <div className="grid grid-cols-2 gap-8 mb-8 pb-8">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide opacity-60 mb-3">Kepada Yth:</p>
                      <p className="text-xs mb-2">{kepadaPhone || '-'}</p>
                      <p className="text-xs mb-2">{kepadaCity || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide opacity-60 mb-3">Pengirim:</p>
                      <p className="text-sm font-black uppercase mb-1">({contacts.find(c => c.id === clientId)?.name || 'Mahasiswa hukum'})</p>
                    </div>
                  </div>

                  {/* PERKARA */}
                  <div className="mb-8">
                    <p className="text-xs font-black uppercase tracking-wide opacity-60 mb-2">Perkara &nbsp; : &nbsp; {matters.find(m => m.id === matterId)?.caseArea || '-'}</p>
                  </div>

                  {/* BILLING TABLE */}
                  <div className="mb-8">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="border-b-2 border-[#2B2A2A]/30 dark:border-[#F5F2F2]/30">
                          <th className="text-left py-3 font-black uppercase tracking-wide opacity-60">TIPE</th>
                          <th className="text-left py-3 font-black uppercase tracking-wide opacity-60">KETERANGAN</th>
                          <th className="text-center py-3 font-black uppercase tracking-wide opacity-60">TANGGAL</th>
                          <th className="text-right py-3 font-black uppercase tracking-wide opacity-60">JUMLAH</th>
                          <th className="text-right py-3 font-black uppercase tracking-wide opacity-60">SUB TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingItems.length > 0 ? (
                          billingItems.map((item, idx) => (
                            <tr key={item.id} className="border-b border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10 hover:bg-[#5A7ACD]/5">
                              <td className="py-3 text-xs">{tagihan || 'Layanan'}</td>
                              <td className="py-3 text-xs">{item.description}</td>
                              <td className="py-3 text-center text-xs">{invoiceDate ? new Date(invoiceDate).toLocaleDateString('id-ID') : '-'}</td>
                              <td className="py-3 text-right text-xs">{item.quantity}</td>
                              <td className="py-3 text-right text-xs font-bold">Rp {item.amount.toLocaleString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr className="border-b border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10">
                            <td colSpan={5} className="py-6 text-center opacity-30 italic text-xs">Tidak diketahui</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* PAYMENT & TOTAL INFO */}
                  <div className="space-y-3 mb-8 pb-8 border-b border-[#2B2A2A]/20 dark:border-[#F5F2F2]/20">
                    <div className="flex justify-between text-xs">
                      <span>Pembayaran Transfer Ke Rekening :</span>
                      <span className="font-bold">Sub Total</span>
                      <span className="font-bold">Rp {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span></span>
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-[#5A7ACD] dark:text-[#FEB05D]">Rp {total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* JATUH TEMPO */}
                  <div className="text-xs">
                    <p><span className="font-black">Jatuh Tempo</span> &nbsp; : &nbsp; <span>{dueDate ? new Date(dueDate).toLocaleDateString('id-ID') : '-'}</span></p>
                  </div>

                  {/* FOOTER */}
                  <div className="text-right mt-8 pt-8 border-t border-[#2B2A2A]/10 dark:border-[#F5F2F2]/10">
                    <p className="text-[10px] text-[#5A7ACD] dark:text-[#FEB05D] font-black uppercase tracking-widest cursor-pointer hover:opacity-60">Format Kami</p>
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