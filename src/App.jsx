import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Wifi, History, Signal, CheckCircle, Wallet, Menu, X, Bell, 
  Copy, CreditCard, ChevronRight, LogOut, Lock, Mail, User
} from 'lucide-react';

// --- 1. FIX: Import Firebase functions directly from the library, not './firebase'
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';

// --- 2. FIX: Define Firebase Config INSIDE this file ---
// If running in the preview, this uses the built-in secure environment variables.
// If running locally in VS Code, you must replace 'PLACEHOLDER_KEY' with your real keys.
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : { 
      apiKey: "AIzaSyCtu-sQVbndAjPfz1Z-fLTnk6InKfh_Ii4", 
      authDomain: "swift-vtu.firebaseapp.com", 
      projectId: "swift-vtu",
      storageBucket: "swift-vtu.appspot.com",
      messagingSenderId: "544144161674",
      appId: "1:544144161674:web:4b2f44dd46ff68f5d8e673",
      measurementId: "G-3Q1SDERTR0"
    };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

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
  ],
  GLO: [
    { id: 'g1', name: '1GB Gift', price: 240, duration: '14 Days' },
    { id: 'g2', name: '2.5GB Gift', price: 550, duration: '30 Days' },
  ],
  '9MOBILE': [
    { id: 'e1', name: '1GB SME', price: 300, duration: '30 Days' },
  ]
};

const NETWORKS = [
  { id: 'MTN', color: 'bg-yellow-400', text: 'text-yellow-900', label: 'MTN' },
  { id: 'AIRTEL', color: 'bg-red-600', text: 'text-white', label: 'Airtel' },
  { id: 'GLO', color: 'bg-green-600', text: 'text-white', label: 'Glo' },
  { id: '9MOBILE', color: 'bg-emerald-900', text: 'text-white', label: '9mobile' },
];

export default function VTUApp() {
  // --- Auth State ---
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // --- App State ---
  const [activeTab, setActiveTab] = useState('data'); 
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);

  // --- 0. Initial Auth (Preview Only) ---
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try {
          await signInWithCustomToken(auth, __initial_auth_token);
        } catch (e) { console.error("Auth error", e); }
      }
    };
    initAuth();
  }, []);

  // --- 1. Listen for Login Changes ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Handle Path for Preview vs Local
        const userDocRef = typeof __app_id !== 'undefined' 
          ? doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile') 
          : doc(db, "users", currentUser.uid);

        const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        });
        return () => unsubDoc();
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- 2. Handle Auth (Login/Signup) ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        
        // Handle Path for Preview vs Local
        const userDocRef = typeof __app_id !== 'undefined' 
          ? doc(db, 'artifacts', appId, 'users', res.user.uid, 'profile') 
          : doc(db, "users", res.user.uid);

        await setDoc(userDocRef, {
          name: fullName,
          email: email,
          walletBalance: 0.00,
          phone: "08123456789",
          accountBank: "Wema Bank",
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error(err);
      setAuthError(err.message.replace("Firebase: ", ""));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // --- 3. App Handlers ---
  const handleNetworkSelect = (network) => {
    setSelectedNetwork(network);
    setSelectedPlan('');
  };

  const handleCopy = (text) => {
    // Use execCommand for better iframe compatibility
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert("Copied!");
    } catch (err) {
      console.error('Unable to copy', err);
    }
    document.body.removeChild(textArea);
  };

  const handlePurchase = (e) => {
    e.preventDefault();
    if (!userData) return;

    const purchaseAmount = activeTab === 'data' 
      ? DATA_PLANS[selectedNetwork.id].find(p => p.id === selectedPlan)?.price || 0
      : parseFloat(amount);

    if (purchaseAmount > (userData.walletBalance || 0)) {
      alert("Insufficient wallet balance!");
      setShowFundModal(true);
      return;
    }

    setLoading(true);
    // Simulate Purchase
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 2000);
  };

  // --- RENDER: Auth Screen ---
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200">
              <Signal className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SwiftVTU</h1>
            <p className="text-gray-500 mt-1">{isLogin ? 'Welcome back!' : 'Create your account'}</p>
          </div>

          {authError && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-100">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input 
                    type="text" 
                    required 
                    className="w-full pl-10 p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none text-gray-700 font-medium"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="email" 
                  required 
                  className="w-full pl-10 p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none text-gray-700 font-medium"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="password" 
                  required 
                  minLength={6}
                  className="w-full pl-10 p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition outline-none text-gray-700 font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition disabled:bg-blue-400 shadow-lg shadow-blue-200 active:scale-95 transform"
            >
              {authLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center border-t pt-6">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 font-semibold hover:text-blue-800 transition"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: Dashboard ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 relative pb-20">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 sticky top-0 z-20 shadow-lg">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center shadow-inner">
              <Signal size={18} />
            </div>
            <span className="font-bold text-lg tracking-tight">SwiftVTU</span>
          </div>
          <button onClick={handleLogout} className="p-2 bg-blue-800/50 rounded-full hover:bg-blue-700 transition backdrop-blur-sm">
            <LogOut size={18} className="text-blue-100" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Wallet Card */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                {userData?.name ? userData.name.charAt(0) : 'U'}
              </div>
              <p className="text-blue-200 text-xs font-bold uppercase tracking-wider">
                {userData?.name || 'User'}
              </p>
            </div>
            
            <h2 className="text-4xl font-bold mt-2 tracking-tight">
              ₦{userData?.walletBalance?.toLocaleString() || '0.00'}
            </h2>
            
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setShowFundModal(true)}
                className="flex-1 bg-white text-blue-900 py-3 rounded-xl text-sm font-bold hover:bg-blue-50 transition shadow-sm flex items-center justify-center gap-2 active:scale-95"
              >
                <CreditCard size={18} /> Fund Wallet
              </button>
            </div>
          </div>
        </div>

        {/* Service Tabs */}
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

        {/* Purchase Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <form onSubmit={handlePurchase} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Network</label>
              <div className="grid grid-cols-4 gap-3">
                  {NETWORKS.map((net) => (
                    <button 
                      key={net.id} 
                      type="button" 
                      onClick={() => handleNetworkSelect(net)} 
                      className={`
                        aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 border-2 transition-all
                        ${selectedNetwork.id === net.id ? 'border-blue-600 bg-blue-50/50 scale-105' : 'border-transparent bg-gray-50 hover:bg-gray-100'}
                      `}
                    >
                      <div className={`w-8 h-8 rounded-full ${net.color} flex items-center justify-center text-white font-bold text-[10px] shadow-sm`}>
                        {/* Logo Placeholder */}
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">{net.label}</span>
                    </button>
                  ))}
              </div>
            </div>

            {activeTab === 'data' ? (
               <div className="space-y-2">
                 <label className="text-sm font-bold text-gray-700">Data Plan</label>
                 <div className="relative">
                   <select 
                     value={selectedPlan} 
                     onChange={(e) => setSelectedPlan(e.target.value)} 
                     className="w-full p-3.5 bg-gray-50 border-none rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 transition appearance-none font-medium"
                   >
                     <option value="">Select a plan</option>
                     {DATA_PLANS[selectedNetwork.id].map((p) => (
                       <option key={p.id} value={p.id}>{p.name} - ₦{p.price}</option>
                     ))}
                   </select>
                   <ChevronRight className="absolute right-4 top-4 text-gray-400 rotate-90 pointer-events-none" size={16} />
                 </div>
               </div>
            ) : (
               <div className="space-y-2">
                 <label className="text-sm font-bold text-gray-700">Amount</label>
                 <input 
                   type="number" 
                   placeholder="100 - 50,000" 
                   value={amount} 
                   onChange={(e) => setAmount(e.target.value)} 
                   className="w-full p-3.5 bg-gray-50 border-none rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 transition font-medium" 
                 />
               </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Phone Number</label>
              <input 
                type="tel" 
                placeholder="080..." 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)} 
                className="w-full p-3.5 bg-gray-50 border-none rounded-xl text-gray-700 focus:ring-2 focus:ring-blue-500 transition font-medium" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition active:scale-95 disabled:bg-blue-400"
            >
              {loading ? 'Processing...' : 'Purchase Now'}
            </button>
          </form>
        </div>
      </main>

      {/* Fund Modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowFundModal(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl p-6 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-6"></div>
            <h2 className="text-xl font-bold text-center mb-6 text-gray-900">Fund Wallet</h2>
            
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-6">
               <div className="flex justify-between mb-4 border-b border-blue-200 pb-4">
                 <span className="text-sm text-blue-600 font-medium">Bank Name</span>
                 <span className="font-bold text-gray-800">{userData?.accountBank || 'Wema Bank'}</span>
               </div>
               
               <div className="space-y-2">
                 <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Account Number</span>
                 <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                   <span className="text-2xl font-mono font-bold text-blue-900 tracking-widest">
                     {userData?.phone || '0000000000'}
                   </span>
                   <button 
                     onClick={() => handleCopy(userData?.phone || '')}
                     className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"
                   >
                     <Copy size={20}/>
                   </button>
                 </div>
               </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-xl flex gap-3 mb-6">
              <div className="mt-0.5 text-yellow-600">
                <Signal size={16} />
              </div>
              <p className="text-xs text-yellow-800 font-medium leading-relaxed">
                Transfer to the account number above. Your wallet will be credited automatically upon success.
              </p>
            </div>

            <button 
              onClick={() => setShowFundModal(false)} 
              className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition active:scale-95"
            >
              I have made the transfer
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Success!</h2>
            <p className="text-gray-500 text-sm">Your request has been processed.</p>
          </div>
        </div>
      )}
    </div>
  );
}