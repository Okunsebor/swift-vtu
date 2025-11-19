import React, { useState } from 'react';
import { 
  Smartphone, 
  Wifi, 
  History, 
  Signal, 
  CheckCircle, 
  Wallet,
  Menu,
  X,
  Bell,
  Copy,
  CreditCard,
  ChevronRight,
  User
} from 'lucide-react';

// --- Mock Data ---
const DATA_PLANS = {
  MTN: [
    { id: 'm1', name: '1GB SME', price: 250, duration: '30 Days' },
    { id: 'm2', name: '2GB SME', price: 500, duration: '30 Days' },
    { id: 'm3', name: '3GB SME', price: 750, duration: '30 Days' },
    { id: 'm5', name: '10GB SME', price: 2500, duration: '30 Days' },
  ],
  AIRTEL: [
    { id: 'a1', name: '750MB Corp', price: 200, duration: '14 Days' },
    { id: 'a2', name: '1.5GB Corp', price: 400, duration: '30 Days' },
    { id: 'a3', name: '3GB Corp', price: 800, duration: '30 Days' },
  ],
  GLO: [
    { id: 'g1', name: '1GB Gift', price: 240, duration: '14 Days' },
    { id: 'g2', name: '2.5GB Gift', price: 550, duration: '30 Days' },
  ],
  '9MOBILE': [
    { id: 'e1', name: '1GB SME', price: 300, duration: '30 Days' },
    { id: 'e2', name: '2GB SME', price: 600, duration: '30 Days' },
  ]
};

const NETWORKS = [
  { id: 'MTN', color: 'bg-yellow-400', text: 'text-yellow-900', label: 'MTN' },
  { id: 'AIRTEL', color: 'bg-red-600', text: 'text-white', label: 'Airtel' },
  { id: 'GLO', color: 'bg-green-600', text: 'text-white', label: 'Glo' },
  { id: '9MOBILE', color: 'bg-emerald-900', text: 'text-white', label: '9mobile' },
];

export default function VTUApp() {
  // --- State ---
  const [activeTab, setActiveTab] = useState('data'); 
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false); // New Modal State

  // Mock User Data (In real app, this comes from database)
  const [user, setUser] = useState({
    name: "Prof. Okunsebor",
    walletBalance: 2500.00,
    phone: "08012345678", // This will be their account number
    accountBank: "Wema Bank" // Simulated Virtual Bank
  });

  const [transactions, setTransactions] = useState([
    { id: 1, type: 'Data', desc: 'MTN 1GB SME', amount: 250, date: 'Today, 10:23 AM', status: 'Success' },
    { id: 2, type: 'Airtime', desc: 'Airtel VTU', amount: 1000, date: 'Yesterday, 4:15 PM', status: 'Success' },
  ]);

  // --- Handlers ---
  const handleNetworkSelect = (network) => {
    setSelectedNetwork(network);
    setSelectedPlan('');
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Account number copied!");
  };

  const handlePurchase = (e) => {
    e.preventDefault();
    if (phoneNumber.length < 11) {
      alert("Please enter a valid phone number");
      return;
    }
    
    const purchaseAmount = activeTab === 'data' 
      ? DATA_PLANS[selectedNetwork.id].find(p => p.id === selectedPlan)?.price || 0
      : parseFloat(amount);

    if (purchaseAmount > user.walletBalance) {
      alert("Insufficient wallet balance! Please fund your wallet.");
      setShowFundModal(true); // Open fund modal automatically
      return;
    }

    setLoading(true);

    // Simulate API Call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setUser(prev => ({...prev, walletBalance: prev.walletBalance - purchaseAmount}));
      
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

      setTimeout(() => {
        setSuccess(false);
        setPhoneNumber('');
        setAmount('');
        setSelectedPlan('');
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 relative">
      
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

      <main className="max-w-md mx-auto p-4 space-y-6 pb-24">
        
        {/* --- Wallet Card --- */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">Available Balance</p>
                <h2 className="text-3xl font-bold mt-1">₦{user.walletBalance.toLocaleString()}</h2>
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Wallet size={20} />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setShowFundModal(true)}
                className="flex-1 bg-white text-blue-900 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-50 transition shadow-sm flex items-center justify-center gap-2"
              >
                <CreditCard size={16} /> Fund Wallet
              </button>
              <button className="px-4 bg-blue-800/50 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition backdrop-blur-md border border-blue-500/30">
                History
              </button>
            </div>
          </div>
        </div>

        {/* --- Service Tabs --- */}
        <div className="bg-white p-1.5 rounded-xl shadow-sm flex border border-gray-100">
          <button 
            onClick={() => setActiveTab('data')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'data' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Wifi size={18} /> Data
          </button>
          <button 
            onClick={() => setActiveTab('airtime')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'airtime' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Smartphone size={18} /> Airtime
          </button>
        </div>

        {/* --- Main Form --- */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <form onSubmit={handlePurchase} className="space-y-6">
            
            {/* Network Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Network</label>
              <div className="grid grid-cols-4 gap-3">
                {NETWORKS.map((net) => (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => handleNetworkSelect(net)}
                    className={`
                      aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all border-2
                      ${selectedNetwork.id === net.id ? 'border-blue-600 bg-blue-50/50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}
                    `}
                  >
                    <div className={`w-8 h-8 rounded-full ${net.color} flex items-center justify-center shadow-sm text-white font-bold text-[10px]`}>
                      {/* Placeholder for Logo */}
                    </div>
                    <span className="text-[11px] font-bold text-gray-600">{net.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Plan / Amount Inputs */}
            <div className="space-y-4">
              {activeTab === 'data' ? (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Data Plan</label>
                  <div className="relative">
                    <select 
                      required
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none appearance-none font-medium"
                    >
                      <option value="">Select a plan</option>
                      {DATA_PLANS[selectedNetwork.id].map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - ₦{plan.price}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-4 pointer-events-none text-gray-400">
                      <ChevronRight size={16} className="rotate-90" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Amount (₦)</label>
                  <input 
                    type="number" 
                    required
                    placeholder="100 - 50,000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none font-medium"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Phone Number</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    required
                    maxLength={11}
                    placeholder="080..."
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none pl-10 font-mono font-medium"
                  />
                  <Smartphone size={18} className="absolute left-3 top-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-200/50 flex items-center justify-center gap-2 transition-all active:scale-95
                ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
              `}
            >
              {loading ? 'Processing...' : 'Purchase Now'}
            </button>

          </form>
        </div>

        {/* --- Transaction History --- */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-gray-800 text-sm">Recent Transactions</h3>
            <button className="text-xs text-blue-600 font-bold">View All</button>
          </div>

          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'Data' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                    {tx.type === 'Data' ? <Wifi size={18} /> : <Smartphone size={18} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{tx.desc}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-gray-800">-₦{tx.amount}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tx.status === 'Success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* --- FUND WALLET MODAL (New!) --- */}
      {showFundModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowFundModal(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 relative z-10 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
            
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Fund Wallet</h2>
              <p className="text-sm text-gray-500 mt-1">Transfer to your dedicated account number below to fund your wallet instantly.</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100 mb-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-blue-200/50">
                  <span className="text-sm text-gray-500 font-medium">Bank Name</span>
                  <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-600 rounded-sm"></div> 
                    {user.accountBank}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pb-4 border-b border-blue-200/50">
                  <span className="text-sm text-gray-500 font-medium">Account Name</span>
                  <span className="text-sm font-bold text-gray-800">SwiftVTU - {user.name.split(' ')[1]}</span>
                </div>

                <div className="pt-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wide font-bold block mb-1">Account Number</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-bold text-blue-900">{user.phone}</span>
                    <button 
                      onClick={() => handleCopy(user.phone)}
                      className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg flex gap-3 items-start">
              <div className="mt-0.5 text-yellow-600">
                <Signal size={16} />
              </div>
              <p className="text-xs text-yellow-800 leading-relaxed">
                Transfers are automated. Your wallet will be credited immediately after the transfer is successful.
              </p>
            </div>

            <button 
              onClick={() => setShowFundModal(false)}
              className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl mt-6"
            >
              I have made the transfer
            </button>
          </div>
        </div>
      )}

      {/* --- Success Modal --- */}
      {success && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Transaction Successful</h2>
            <p className="text-gray-500 text-sm">Your purchase has been processed.</p>
          </div>
        </div>
      )}

    </div>
  );
}