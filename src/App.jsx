import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Wifi, 
  CreditCard, 
  History, 
  ChevronRight, 
  Signal, 
  CheckCircle, 
  Wallet,
  Menu,
  X,
  Bell
} from 'lucide-react';

// Mock Data for "Cheap" Data Plans
const DATA_PLANS = {
  MTN: [
    { id: 'm1', name: '1GB SME', price: 250, duration: '30 Days' },
    { id: 'm2', name: '2GB SME', price: 500, duration: '30 Days' },
    { id: 'm3', name: '3GB SME', price: 750, duration: '30 Days' },
    { id: 'm4', name: '5GB SME', price: 1250, duration: '30 Days' },
    { id: 'm5', name: '10GB SME', price: 2500, duration: '30 Days' },
  ],
  AIRTEL: [
    { id: 'a1', name: '750MB Corp', price: 200, duration: '14 Days' },
    { id: 'a2', name: '1.5GB Corp', price: 400, duration: '30 Days' },
    { id: 'a3', name: '3GB Corp', price: 800, duration: '30 Days' },
    { id: 'a4', name: '5GB Corp', price: 1300, duration: '30 Days' },
  ],
  GLO: [
    { id: 'g1', name: '1GB Gift', price: 240, duration: '14 Days' },
    { id: 'g2', name: '2.5GB Gift', price: 550, duration: '30 Days' },
    { id: 'g3', name: '5.8GB Gift', price: 1200, duration: '30 Days' },
  ],
  '9MOBILE': [
    { id: 'e1', name: '1GB SME', price: 300, duration: '30 Days' },
    { id: 'e2', name: '2GB SME', price: 600, duration: '30 Days' },
    { id: 'e3', name: '5GB SME', price: 1500, duration: '30 Days' },
  ]
};

const NETWORKS = [
  { id: 'MTN', color: 'bg-yellow-400', text: 'text-yellow-900', label: 'MTN' },
  { id: 'AIRTEL', color: 'bg-red-600', text: 'text-white', label: 'Airtel' },
  { id: 'GLO', color: 'bg-green-600', text: 'text-white', label: 'Glo' },
  { id: '9MOBILE', color: 'bg-emerald-900', text: 'text-white', label: '9mobile' },
];

export default function VTUApp() {
  // State Management
  const [activeTab, setActiveTab] = useState('data'); // 'data' or 'airtime'
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [walletBalance, setWalletBalance] = useState(15450.00);
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'Data', desc: 'MTN 1GB SME', amount: 250, date: 'Today, 10:23 AM', status: 'Success' },
    { id: 2, type: 'Airtime', desc: 'Airtel VTU', amount: 1000, date: 'Yesterday, 4:15 PM', status: 'Success' },
    { id: 3, type: 'Data', desc: 'Glo 5.8GB', amount: 1200, date: '18 Nov, 09:00 AM', status: 'Failed' },
  ]);
  const [showMenu, setShowMenu] = useState(false);

  // Handlers
  const handleNetworkSelect = (network) => {
    setSelectedNetwork(network);
    setSelectedPlan(''); // Reset plan when network changes
  };

  const handlePurchase = (e) => {
    e.preventDefault();
    
    // Basic Validation
    if (phoneNumber.length < 11) {
      alert("Please enter a valid phone number");
      return;
    }
    
    const purchaseAmount = activeTab === 'data' 
      ? DATA_PLANS[selectedNetwork.id].find(p => p.id === selectedPlan)?.price || 0
      : parseFloat(amount);

    if (purchaseAmount > walletBalance) {
      alert("Insufficient wallet balance!");
      return;
    }

    setLoading(true);

    // Simulate API Call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setWalletBalance(prev => prev - purchaseAmount);
      
      // Add to history
      const newTx = {
        id: Date.now(),
        type: activeTab === 'data' ? 'Data' : 'Airtime',
        desc: activeTab === 'data' 
          ? `${selectedNetwork.label} ${DATA_PLANS[selectedNetwork.id].find(p => p.id === selectedPlan)?.name}`
          : `${selectedNetwork.label} VTU`,
        amount: purchaseAmount,
        date: 'Just now',
        status: 'Success'
      };
      setTransactions([newTx, ...transactions]);

      // Reset Success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setPhoneNumber('');
        setAmount('');
        setSelectedPlan('');
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20 md:pb-0">
      
      {/* --- Header --- */}
      <header className="bg-blue-900 text-white p-4 sticky top-0 z-20 shadow-lg">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
              <Signal size={18} />
            </div>
            <span className="font-bold text-lg">SwiftData</span>
          </div>
          <div className="flex items-center space-x-4">
            <Bell size={20} className="text-blue-200" />
            <button onClick={() => setShowMenu(!showMenu)}>
              {showMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* --- Wallet Card --- */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
          <div className="relative z-10">
            <p className="text-blue-200 text-sm mb-1">Wallet Balance</p>
            <h2 className="text-3xl font-bold">₦{walletBalance.toLocaleString()}</h2>
            <div className="flex mt-4 space-x-3">
              <button className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2">
                <Wallet size={16} /> Fund Wallet
              </button>
            </div>
          </div>
        </div>

        {/* --- Service Tabs --- */}
        <div className="bg-white p-1 rounded-xl shadow-sm flex">
          <button 
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-3 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'data' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Wifi size={18} /> Buy Data
          </button>
          <button 
            onClick={() => setActiveTab('airtime')}
            className={`flex-1 py-3 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'airtime' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Smartphone size={18} /> Buy Airtime
          </button>
        </div>

        {/* --- Main Form --- */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <form onSubmit={handlePurchase} className="space-y-6">
            
            {/* Network Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Network</label>
              <div className="grid grid-cols-4 gap-3">
                {NETWORKS.map((net) => (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => handleNetworkSelect(net)}
                    className={`
                      aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all border-2
                      ${selectedNetwork.id === net.id ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent bg-gray-50 hover:bg-gray-100'}
                    `}
                  >
                    <div className={`w-8 h-8 rounded-full ${net.color} flex items-center justify-center shadow-sm`}>
                      {/* Simple generic indicator if no logo */}
                    </div>
                    <span className="text-[10px] font-bold">{net.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Plan / Amount Inputs */}
            <div className="space-y-4">
              {activeTab === 'data' ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Data Plan</label>
                  <select 
                    required
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full p-3 bg-gray-50 border-none rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none appearance-none"
                  >
                    <option value="">Select a plan</option>
                    {DATA_PLANS[selectedNetwork.id].map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - ₦{plan.price} ({plan.duration})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Amount (₦)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="100 - 50,000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 bg-gray-50 border-none rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none"
                  />
                  <div className="flex gap-2">
                    {[100, 200, 500, 1000].map(amt => (
                      <button 
                        key={amt}
                        type="button"
                        onClick={() => setAmount(amt)}
                        className="flex-1 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 text-gray-600"
                      >
                        ₦{amt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    required
                    maxLength={11}
                    placeholder="080..."
                    value={phoneNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPhoneNumber(val);
                    }}
                    className="w-full p-3 bg-gray-50 border-none rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none pl-10 font-mono"
                  />
                  <Smartphone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading || (activeTab === 'data' && !selectedPlan) || (activeTab === 'airtime' && !amount) || phoneNumber.length < 11}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition-all transform active:scale-95
                ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              `}
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>Pay ₦{activeTab === 'data' ? (DATA_PLANS[selectedNetwork.id].find(p => p.id === selectedPlan)?.price || 0) : (amount || 0)}</>
              )}
            </button>

          </form>
        </div>

        {/* --- Transaction History --- */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <History size={18} className="text-blue-600" /> Recent Transactions
            </h3>
            <button className="text-xs text-blue-600 font-medium hover:underline">View All</button>
          </div>

          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'Data' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                    {tx.type === 'Data' ? <Wifi size={18} /> : <Smartphone size={18} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{tx.desc}</p>
                    <p className="text-xs text-gray-400">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-gray-800">-₦{tx.amount}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${tx.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* --- Success Modal --- */}
      {success && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center space-y-4 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Success!</h2>
              <p className="text-gray-500">Your transaction has been processed successfully.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <div className="flex justify-between mb-2">
                <span>Service</span>
                <span className="font-bold">{activeTab === 'data' ? 'Data Bundle' : 'Airtime Topup'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Network</span>
                <span className="font-bold">{selectedNetwork.label}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span>Amount</span>
                <span className="font-bold text-gray-900">₦{activeTab === 'data' ? (DATA_PLANS[selectedNetwork.id].find(p => p.id === selectedPlan)?.price || 0) : amount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}