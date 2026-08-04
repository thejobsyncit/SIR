import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreditCard, ShieldCheck, CheckCircle2, Lock, X, ArrowRight, DollarSign, Check } from 'lucide-react';

export const PaymentGatewayModal = () => {
  const { activeModal, setActiveModal } = useApp();
  const [gateway, setGateway] = useState('stripe'); // 'stripe' | 'paypal' | 'razorpay'
  const [service, setService] = useState('Verification Charges');
  const [amount, setAmount] = useState(199);
  const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'success'
  const [receipt, setReceipt] = useState(null);

  if (activeModal !== 'payment') return null;

  const handlePay = async () => {
    setStatus('processing');
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gateway, serviceName: service, amount, currency: 'USD' })
      });
      const data = await res.json();
      setReceipt(data);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-card bg-white dark:bg-navy-900 border border-gold-500/30 rounded-2xl max-w-lg w-full p-6 shadow-luxury relative overflow-hidden">
        
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-navy-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 text-gold-500 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-navy-900 dark:text-white">Online Payment Gateway</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Secure 256-Bit SSL Encrypted Transaction</p>
            </div>
          </div>
          <button 
            onClick={() => { setActiveModal(null); setStatus('idle'); }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === 'idle' && (
          <div className="space-y-4 text-xs">
            {/* Service Selector */}
            <div>
              <label className="block font-bold text-navy-900 dark:text-slate-200 mb-1">Select Service to Pay:</label>
              <select 
                value={service}
                onChange={(e) => {
                  setService(e.target.value);
                  if (e.target.value === 'Registration Fee') setAmount(49);
                  else if (e.target.value === 'Resume Service') setAmount(99);
                  else if (e.target.value === 'Verification Charges') setAmount(199);
                  else if (e.target.value === 'Visa Processing') setAmount(399);
                  else setAmount(299);
                }}
                className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl p-2.5 text-navy-900 dark:text-white font-semibold"
              >
                <option value="Registration Fee">Candidate Premium Registration ($49)</option>
                <option value="Resume Service">AI Resume Optimization & VIP Headhunter Rewrite ($99)</option>
                <option value="Verification Charges">6-Point Employee Background Verification Audit ($199)</option>
                <option value="Visa Processing">GCC Work Visa Fast-Track Guidance & Attestation ($399)</option>
                <option value="Career Services">1-on-1 Executive Career Coaching Session ($299)</option>
              </select>
            </div>

            {/* Amount Banner */}
            <div className="flex justify-between items-center p-3 rounded-xl bg-navy-950 text-white border border-gold-500/30">
              <span className="font-semibold text-slate-300">Total Payable Amount:</span>
              <span className="text-xl font-extrabold text-gold-400">${amount} USD</span>
            </div>

            {/* Payment Gateway Toggle */}
            <div>
              <label className="block font-bold text-navy-900 dark:text-slate-200 mb-2">Select Payment Provider:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setGateway('stripe')}
                  className={`p-3 rounded-xl border font-bold text-center transition ${
                    gateway === 'stripe'
                      ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                      : 'border-slate-300 dark:border-navy-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  💳 Stripe
                </button>
                <button
                  type="button"
                  onClick={() => setGateway('paypal')}
                  className={`p-3 rounded-xl border font-bold text-center transition ${
                    gateway === 'paypal'
                      ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                      : 'border-slate-300 dark:border-navy-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  🅿️ PayPal
                </button>
                <button
                  type="button"
                  onClick={() => setGateway('razorpay')}
                  className={`p-3 rounded-xl border font-bold text-center transition ${
                    gateway === 'razorpay'
                      ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                      : 'border-slate-300 dark:border-navy-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  ⚡ Razorpay
                </button>
              </div>
            </div>

            {/* Simulated Card Input */}
            <div className="space-y-2 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-500">Cardholder Name</label>
                <input type="text" defaultValue="John Doe" className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2 text-navy-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-500">Card Number</label>
                  <input type="text" defaultValue="4242 •••• •••• 4242" className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2 text-navy-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500">CVC</label>
                  <input type="text" defaultValue="888" className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-lg p-2 text-navy-900 dark:text-white" />
                </div>
              </div>
            </div>

            <button
              onClick={handlePay}
              className="w-full py-3 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl shadow-gold-glow hover:opacity-95 transition flex items-center justify-center space-x-2"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Pay ${amount} via {gateway.toUpperCase()}</span>
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-navy-900 dark:text-white">Authorizing Secure Payment via {gateway.toUpperCase()}...</p>
          </div>
        )}

        {status === 'success' && receipt && (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="font-serif text-lg font-bold text-navy-900 dark:text-white">Payment Completed Successfully!</h4>
            <p className="text-xs text-slate-500">Transaction ID: <span className="font-mono text-gold-500 font-bold">{receipt.transactionId}</span></p>

            <div className="p-3 bg-slate-100 dark:bg-navy-800 rounded-xl text-left text-xs space-y-1">
              <p><strong>Service:</strong> {receipt.serviceName}</p>
              <p><strong>Amount Paid:</strong> ${receipt.amount} {receipt.currency}</p>
              <p><strong>Payment Gateway:</strong> {receipt.gateway.toUpperCase()}</p>
              <p><strong>Status:</strong> <span className="text-emerald-500 font-bold">Confirmed</span></p>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-gold-shimmer text-navy-950 font-bold text-xs rounded-xl"
            >
              Close & View Receipt Confirmation
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
