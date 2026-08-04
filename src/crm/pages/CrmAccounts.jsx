import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  CreditCard, DollarSign, FileSpreadsheet, Plus, CheckCircle2, Clock, 
  Receipt, ArrowUpRight, TrendingUp, PieChart, Wallet, X, Send, Lock, Loader2, Check, Download, Building
} from 'lucide-react';

export const CrmAccounts = () => {
  const { invoices } = useCrm();
  const [invoiceList, setInvoiceList] = useState(invoices);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Payment Gateway Multi-Step State
  const [paymentGatewayOpen, setPaymentGatewayOpen] = useState(null);
  const [paymentStep, setPaymentStep] = useState('select'); // 'select' | 'stripe' | 'wire' | 'processing' | 'receipt'
  const [processingMsg, setProcessingMsg] = useState('Connecting to Gateway...');

  // Payment Form Input States
  const [cardForm, setCardForm] = useState({
    nameOnCard: 'Al Habtoor Finance VP',
    cardNumber: '4242 •••• •••• 4242',
    expDate: '08 / 28',
    cvc: '888',
    country: 'United Arab Emirates (UAE)'
  });

  const [wireForm, setWireForm] = useState({
    wireRef: 'WIRE-2026-9941',
    bankName: 'Emirates NBD (Dubai HQ)',
    transferDate: new Date().toISOString().split('T')[0]
  });

  const [settledReceipt, setSettledReceipt] = useState(null);

  // New Invoice Form
  const [newInv, setNewInv] = useState({
    client: 'Al Habtoor Contracting LLC',
    service: 'Executive Headhunting Fee - Civil PM',
    amountUSD: 25000,
    dueDate: '2026-08-25',
    candidatePlaced: 'Alexander Wright'
  });

  const handleCreateInvoice = (e) => {
    e.preventDefault();
    const base = Number(newInv.amountUSD);
    const vat = Math.round(base * 0.05); // 5% GCC VAT
    const invObj = {
      id: 'INV-2026-' + Math.floor(100 + Math.random() * 900),
      client: newInv.client,
      service: newInv.service,
      amountUSD: base,
      vatAmountUSD: vat,
      totalUSD: base + vat,
      dueDate: newInv.dueDate,
      status: 'Pending Payment',
      candidatePlaced: newInv.candidatePlaced
    };
    setInvoiceList([invObj, ...invoiceList]);
    setModalOpen(false);
  };

  const handlePayOnline = (inv) => {
    setPaymentGatewayOpen(inv);
    setPaymentStep('select');
  };

  const executePaymentSubmit = (methodName) => {
    setPaymentStep('processing');
    setProcessingMsg(`Initiating 256-bit SSL encrypted connection to ${methodName}...`);

    setTimeout(() => {
      setProcessingMsg(`Authorizing payment of $${paymentGatewayOpen.totalUSD.toLocaleString()} USD...`);
    }, 800);

    setTimeout(() => {
      setProcessingMsg(`Updating Treasury Ledger & Issuing Official Tax Invoice Receipt...`);
    }, 1500);

    setTimeout(() => {
      const transactionId = 'TXN-STRIPE-' + Math.floor(100000 + Math.random() * 900000);
      const updatedInv = { ...paymentGatewayOpen, status: 'Paid', transactionId, paidDate: new Date().toLocaleString() };
      
      setInvoiceList(prev => prev.map(i => i.id === paymentGatewayOpen.id ? updatedInv : i));
      setSettledReceipt({ ...updatedInv, method: methodName, transactionId });
      setPaymentStep('receipt');
    }, 2200);
  };

  const downloadReceiptFile = (receipt) => {
    const text = `=====================================================
SIR RECRUITMENT ENTERPRISE - OFFICIAL TAX RECEIPT
=====================================================
Invoice ID: ${receipt.id}
Transaction Ref: ${receipt.transactionId}
Client Company: ${receipt.client}
Payment Method: ${receipt.method}
Date Paid: ${receipt.paidDate}
TRN (Tax Reg No): 100482910300003

FINANCIAL BREAKDOWN:
-----------------------------------------------------
Base Placement Fee: $${receipt.amountUSD.toLocaleString()} USD
GCC VAT (5%): $${receipt.vatAmountUSD.toLocaleString()} USD
-----------------------------------------------------
TOTAL SETTLED: $${receipt.totalUSD.toLocaleString()} USD
STATUS: PAID & AUDITED (GRADE A)
=====================================================`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${receipt.id}_${receipt.client.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-navy-950 p-6 rounded-3xl border border-slate-200 dark:border-navy-800 shadow-sm">
        <div>
          <span className="bg-gold-500/20 text-gold-700 dark:text-gold-400 text-[10px] font-bold px-2.5 py-1 rounded uppercase">Corporate Treasury & Billing</span>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mt-1">Accounts & Revenue Management</h1>
          <p className="text-slate-600 dark:text-slate-400">Generate executive tax invoices, track GST/VAT bills, client dues & payment gateways.</p>
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Tax Invoice</span>
        </button>
      </div>

      {/* Financial Analytics KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Monthly Revenue Billed</span>
          <p className="font-serif text-2xl font-extrabold text-slate-900 dark:text-white">$485,000 USD</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +18.4% YoY Growth
          </p>
        </div>

        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Pending Accounts Receivable</span>
          <p className="font-serif text-2xl font-extrabold text-amber-600 dark:text-gold-400">
            ${invoiceList.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + i.totalUSD, 0).toLocaleString()} USD
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
            {invoiceList.filter(i => i.status !== 'Paid').length} Invoices Pending
          </p>
        </div>

        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">GCC VAT Collected (5%)</span>
          <p className="font-serif text-2xl font-extrabold text-purple-700 dark:text-purple-300">$24,250 USD</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Audit Compliant</p>
        </div>

        <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-5 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Net Headhunting Profit</span>
          <p className="font-serif text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">$398,500 USD</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">82.1% Profit Margin</p>
        </div>
      </div>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {invoiceList.map((inv) => (
          <div key={inv.id} className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 p-6 rounded-2xl space-y-4 hover:border-gold-500/50 transition shadow-sm">
            
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <div>
                <span className="font-mono text-gold-600 dark:text-gold-400 font-bold text-xs">{inv.id}</span>
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white mt-1">{inv.client}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] font-semibold">{inv.service}</p>
              </div>
              <span className={`px-2.5 py-1 rounded font-bold text-[10px] border ${
                inv.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-400 border-amber-300 dark:border-amber-500/30'
              }`}>
                {inv.status}
              </span>
            </div>

            <div className="p-3.5 bg-slate-100 dark:bg-navy-950 rounded-xl space-y-1.5 text-[11px]">
              <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">Base Placement Fee:</span> <strong className="text-slate-900 dark:text-white font-bold">${inv.amountUSD.toLocaleString()} USD</strong></div>
              <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">GCC VAT / GST (5%):</span> <strong className="text-purple-700 dark:text-purple-300 font-bold">${inv.vatAmountUSD.toLocaleString()} USD</strong></div>
              <div className="flex justify-between border-t border-slate-200 dark:border-navy-800 pt-1 text-sm"><span className="font-bold text-slate-900 dark:text-white">Total Payable Amount:</span> <strong className="text-amber-600 dark:text-gold-400 font-extrabold">${inv.totalUSD.toLocaleString()} USD</strong></div>
            </div>

            <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span>Candidate Placed: <strong className="text-slate-900 dark:text-white font-semibold">{inv.candidatePlaced}</strong></span>
              <span>Due Date: <strong className="text-slate-900 dark:text-white font-mono font-bold">{inv.dueDate}</strong></span>
            </div>

            {inv.status !== 'Paid' ? (
              <button
                onClick={() => handlePayOnline(inv)}
                className="w-full py-2.5 bg-gold-500 text-navy-950 font-bold rounded-xl shadow-gold-glow flex items-center justify-center space-x-2 cursor-pointer hover:opacity-95 transition"
              >
                <CreditCard className="w-4 h-4" />
                <span>Process Payment via Enterprise Gateway →</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <div className="flex-1 p-2 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 rounded-xl text-center text-emerald-800 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Tax Invoice Settled</span>
                </div>
                <button 
                  onClick={() => downloadReceiptFile(inv)}
                  className="px-3 py-2 bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 dark:hover:bg-navy-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl border border-slate-300 dark:border-navy-800 flex items-center gap-1 cursor-pointer"
                  title="Download Receipt TXT"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Receipt</span>
                </button>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* Generate Invoice Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-lg w-full p-6 shadow-luxury space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-3">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Generate Executive Tax Invoice</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Corporate Client Company</label>
                <input required type="text" value={newInv.client} onChange={e=>setNewInv({...newInv, client: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Placement Fee (USD)</label>
                  <input required type="number" value={newInv.amountUSD} onChange={e=>setNewInv({...newInv, amountUSD: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-mono font-bold focus:outline-none focus:border-gold-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                  <input required type="text" value={newInv.dueDate} onChange={e=>setNewInv({...newInv, dueDate: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-mono font-bold focus:outline-none focus:border-gold-500" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Candidate Placed</label>
                <input required type="text" value={newInv.candidatePlaced} onChange={e=>setNewInv({...newInv, candidatePlaced: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 text-slate-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-gold-500" />
              </div>
              <button type="submit" className="w-full py-3 bg-gold-shimmer text-navy-950 font-extrabold rounded-xl shadow-gold-glow hover:opacity-95 transition cursor-pointer">
                Issue Tax Invoice & Dispatch Statement
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Multi-Step Enterprise Payment Gateway Modal */}
      {paymentGatewayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card bg-white dark:bg-navy-900 border border-slate-200 dark:border-gold-500/40 rounded-2xl max-w-md w-full p-6 shadow-luxury space-y-4">
            
            {/* STEP 1: SELECT GATEWAY METHOD */}
            {paymentStep === 'select' && (
              <div className="space-y-4 text-center">
                <CreditCard className="w-12 h-12 text-gold-500 mx-auto" />
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Enterprise Payment Gateway</h3>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Settle Invoice <strong className="text-amber-800 dark:text-gold-400">{paymentGatewayOpen.id}</strong> for <strong className="text-slate-900 dark:text-white">{paymentGatewayOpen.client}</strong> (${paymentGatewayOpen.totalUSD.toLocaleString()} USD).
                </p>

                <div className="space-y-2 pt-2">
                  <button 
                    onClick={() => setPaymentStep('stripe')}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition active:scale-95"
                  >
                    <Lock className="w-4 h-4 text-indigo-200" />
                    <span>Pay via Stripe Business (Credit / Debit Card)</span>
                  </button>

                  <button 
                    onClick={() => setPaymentStep('wire')}
                    className="w-full py-3 bg-slate-100 dark:bg-navy-950 hover:bg-slate-200 dark:hover:bg-navy-800 text-amber-900 dark:text-gold-400 font-bold rounded-xl text-xs border border-slate-300 dark:border-navy-800 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
                  >
                    <Building className="w-4 h-4 text-gold-500" />
                    <span>Confirm Wire Transfer Received (AED / USD)</span>
                  </button>
                </div>

                <button onClick={() => setPaymentGatewayOpen(null)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold pt-2 cursor-pointer">
                  Cancel
                </button>
              </div>
            )}

            {/* STEP 2: STRIPE CARD CHECKOUT FORM */}
            {paymentStep === 'stripe' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-2">
                  <span className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 font-bold text-[10px] px-2 py-0.5 rounded border border-indigo-300 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Stripe 256-Bit Encrypted
                  </span>
                  <button onClick={() => setPaymentStep('select')} className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold">← Back</button>
                </div>

                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900 text-xs">
                  <p className="text-indigo-900 dark:text-indigo-200 font-bold">Total Payable: ${paymentGatewayOpen.totalUSD.toLocaleString()} USD</p>
                  <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-medium">Invoice: {paymentGatewayOpen.id} • {paymentGatewayOpen.client}</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); executePaymentSubmit('Stripe Business Checkout'); }} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Cardholder Full Name</label>
                    <input type="text" required value={cardForm.nameOnCard} onChange={e=>setCardForm({...cardForm, nameOnCard: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2 font-bold focus:border-indigo-500" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Card Number</label>
                    <input type="text" required value={cardForm.cardNumber} onChange={e=>setCardForm({...cardForm, cardNumber: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2 font-mono font-bold focus:border-indigo-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Expiry (MM / YY)</label>
                      <input type="text" required value={cardForm.expDate} onChange={e=>setCardForm({...cardForm, expDate: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2 font-mono font-bold focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">CVC Code</label>
                      <input type="password" required value={cardForm.cvc} onChange={e=>setCardForm({...cardForm, cvc: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2 font-mono font-bold focus:border-indigo-500" />
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition active:scale-95 flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>Authorize & Pay ${paymentGatewayOpen.totalUSD.toLocaleString()} USD</span>
                  </button>
                </form>
              </div>
            )}

            {/* STEP 3: BANK WIRE VERIFICATION FORM */}
            {paymentStep === 'wire' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-navy-800 pb-2">
                  <span className="bg-amber-100 dark:bg-gold-500/20 text-amber-900 dark:text-gold-400 font-bold text-[10px] px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                    <Building className="w-3 h-3" /> Treasury Wire Transfer
                  </span>
                  <button onClick={() => setPaymentStep('select')} className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold">← Back</button>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 text-[11px] space-y-1">
                  <p className="text-amber-900 dark:text-gold-400 font-bold">Dubai HQ Bank Account Details:</p>
                  <p className="text-slate-700 dark:text-slate-300 font-mono">IBAN: AE73 0330 0000 1122 3344 5566</p>
                  <p className="text-slate-700 dark:text-slate-300 font-mono">SWIFT Code: EBILAE2X (Emirates NBD)</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); executePaymentSubmit('Bank Wire Transfer (Dubai HQ)'); }} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Wire Transfer Reference ID</label>
                    <input type="text" required value={wireForm.wireRef} onChange={e=>setWireForm({...wireForm, wireRef: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2 font-mono font-bold focus:border-gold-500" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">Remitting Bank Name</label>
                    <input type="text" required value={wireForm.bankName} onChange={e=>setWireForm({...wireForm, bankName: e.target.value})} className="w-full bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2 font-bold focus:border-gold-500" />
                  </div>

                  <button type="submit" className="w-full py-3 bg-gold-500 hover:opacity-95 text-navy-950 font-extrabold rounded-xl shadow-gold-glow cursor-pointer transition active:scale-95 flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Confirm Wire Received (${paymentGatewayOpen.totalUSD.toLocaleString()} USD)</span>
                  </button>
                </form>
              </div>
            )}

            {/* STEP 4: PROCESSING LOADER */}
            {paymentStep === 'processing' && (
              <div className="py-8 text-center space-y-4">
                <Loader2 className="w-12 h-12 text-gold-500 animate-spin mx-auto" />
                <h4 className="font-serif text-lg font-bold text-slate-900 dark:text-white">Processing Encrypted Payment</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium animate-pulse">{processingMsg}</p>
              </div>
            )}

            {/* STEP 5: TAX RECEIPT CONFIRMATION */}
            {paymentStep === 'receipt' && settledReceipt && (
              <div className="space-y-4 text-center animate-in fade-in">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 rounded-full border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                  <Check className="w-8 h-8" />
                </div>

                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Tax Invoice Settled & Paid!</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  Payment of <strong className="text-emerald-600 dark:text-emerald-400">${settledReceipt.totalUSD.toLocaleString()} USD</strong> for <strong className="text-slate-900 dark:text-white">{settledReceipt.client}</strong> has been successfully credited.
                </p>

                <div className="p-3 bg-slate-100 dark:bg-navy-950 rounded-xl text-left text-[11px] space-y-1 font-mono border border-slate-200 dark:border-navy-800">
                  <p className="text-slate-500">Transaction ID: <strong className="text-slate-900 dark:text-white">{settledReceipt.transactionId}</strong></p>
                  <p className="text-slate-500">Payment Gateway: <strong className="text-amber-800 dark:text-gold-400">{settledReceipt.method}</strong></p>
                  <p className="text-slate-500">TRN Number: <strong className="text-slate-900 dark:text-white">TRN 100482910300003</strong></p>
                </div>

                <div className="space-y-2 pt-2">
                  <button 
                    onClick={() => downloadReceiptFile(settledReceipt)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Official Tax Receipt (.TXT)</span>
                  </button>

                  <button 
                    onClick={() => { setPaymentGatewayOpen(null); setSettledReceipt(null); }}
                    className="w-full py-2.5 bg-slate-100 dark:bg-navy-950 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs border border-slate-300 dark:border-navy-800 cursor-pointer"
                  >
                    Close & Return to Billing
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
