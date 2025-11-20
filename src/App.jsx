import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Wifi, History, Signal, CheckCircle, Wallet, Menu, X, Bell, 
  Copy, CreditCard, ChevronRight, LogOut, Lock, Mail, User, AlertTriangle
} from 'lucide-react';

// --- 1. PAYSTACK IMPORT ---
import { usePaystackPayment } from 'react-paystack';

// --- FIREBASE IMPORTS ---
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
  onSnapshot,
  updateDoc, 
  increment 
} from 'firebase/firestore';

// --- YOUR PERSONALIZED KEYS ---
const firebaseConfig = { 
  apiKey: "AIzaSyCtu-sQVbndAjPfz1Z-fLTnk6InKfh_Ii4", 
  authDomain: "swift-vtu.firebaseapp.com", 
  projectId: "swift-vtu",
  storageBucket: "swift-vtu.appspot.com",
  messagingSenderId: "544144161674",
  appId: "1:544144161674:web:4b2f44dd46ff68f5d8e673",
  measurementId: "G-3Q1SDERTR0"
};

// Your Paystack Key
const PAYSTACK_PUBLIC_KEY = 'pk_test_f5c4d670ac569c64f08b5015f53dad9edc1c1132';

// Initialize Firebase
const app = initializeApp(typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';


// --- MOCK DATA ---
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
  const [dbError, setDbError] = useState('');

  // --- Payment State ---
  const [depositAmount, setDepositAmount] = useState('');

  // --- App State ---
  const [activeTab, setActiveTab] = useState('data'); 
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);

  // --- HELPER: Get Correct User Document Reference ---
  const getUserDocRef = (uid) => {
    if (typeof __app_id !== 'undefined') {
        return doc(db, 'artifacts', appId, 'users', uid, 'profile');
    }
    return doc(db, "users", uid);
  };

  // --- PAYMENT SUCCESS LOGIC ---
  const onSuccess = async (reference) => {
    // 1. Close Modal immediately
    setShowFundModal(false);
    setLoading(true);
    
    try {
      const userRef = getUserDocRef(user.uid);
      const amountToAdd = Number(depositAmount);

      if (isNaN(amountToAdd) || amountToAdd <= 0) throw new Error("Invalid amount");

      // 2. Update Database
      await updateDoc(userRef, {
        walletBalance: increment(amountToAdd) 
      });
      
      alert(`Payment Successful! ₦${amountToAdd} added to wallet.`);
      setDepositAmount('');
    } catch (error) {
      console.error("Error funding wallet:", error);
      if (error.code === 'permission-denied') {
          alert("Permission Denied: Check Firebase Rules.");
      } else {
          alert("Payment verified but update failed: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- PAYSTACK CONFIGURATION (DYNAMIC) ---
  // We initialize the hook without specific config to avoid stale state
  const initializePayment = usePaystackPayment({
      publicKey: PAYSTACK_PUBLIC_KEY,
  });

  const triggerPayment = () => {
    if (!depositAmount || Number(depositAmount) < 100) {
      alert("Minimum deposit is ₦100");
      return;
    }

    // Generate a UNIQUE reference for THIS specific click
    const config = {
        reference: (new Date()).getTime().toString(),
        email: user.email,
        amount: Number(depositAmount) * 100, // Kobo
        publicKey: PAYSTACK_PUBLIC_KEY,
    };
    
    // Open Paystack with the fresh config
    initializePayment({
        config,
        onSuccess: onSuccess,
        onClose: () => alert("Transaction cancelled")
    });
  };

  // --- AUTH LISTENER ---
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try { await signInWithCustomToken(auth, __initial_auth_token); } 
        catch (e) { console.error("Auth error", e); }
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = getUserDocRef(currentUser.uid);
        const unsubDoc = onSnapshot(userDocRef, 
          (docSnap) => {
            if (docSnap.exists()) {
              setUserData(docSnap.data());
              setDbError(''); 
            } else {
               setDoc(userDocRef, {
                  name: currentUser.email.split('@')[0],
                  email: currentUser.email,
                  walletBalance: 0.00,
                  phone: "08000000000",
                  accountBank: "Wema Bank",
                  createdAt: new Date().toISOString()
               });
            }
          },
          (error) => {
             console.error("Firestore Error:", error);
             setDbError(error.message);
          }
        );
        return () => unsubDoc();
      } else {
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- HANDLERS ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const userDocRef = getUserDocRef(res.user.uid);
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
    const userRef = getUserDocRef(user.uid);
    updateDoc(userRef, {
        walletBalance: increment(-purchaseAmount)
    }).then(() => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
    }).catch((err) => {
        setLoading(false);
        alert("Transaction failed: " + err.message);
    });
  };

  // --- HANDLERS FOR UI ---
  const handleNetworkSelect = (network) => {
    setSelectedNetwork(network);
    setSelectedPlan('');
  };

  const handleCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try { document.execCommand('copy'); alert("Copied!"); } 
    catch (err) { console.error('Unable to copy', err); }
    document.body.removeChild(textArea);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };


  // --- RENDER AUTH ---
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-6">SwiftVTU Login</h1>
          {authError && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{authError}</div>}
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-xl" value={fullName} onChange={e => setFullName(e.target.value)} required />}
            <input type="email" placeholder="Email" className="w-full p-3 border rounded-xl" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" className="w-full p-3 border rounded-xl" value={password} onChange={e => setPassword(e.target.value)} required />
            <button disabled={authLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">{authLoading ? 'Wait...' : (isLogin ? 'Sign In' : 'Register')}</button>
          </form>
          <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-blue-600 text-sm">Switch to {isLogin ? 'Sign Up' : 'Login'}</button>
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 relative pb-20">
      <header className="bg-blue-900 text-white p-4 sticky top-0 z-20 shadow-lg flex justify-between items-center">
         <span className="font-bold text-lg">SwiftVTU</span>
         <button onClick={() => signOut(auth)}><LogOut size={18}/></button>
      </header>
      
      {dbError && <div className="bg-red-100 text-red-900 p-3 text-center font-bold">{dbError}</div>}

      <main className="max-w-md mx-auto p-4 space-y-6">
        <div className="bg-blue-800 rounded-2xl p-6 text-white shadow-xl relative">
          <p className="text-blue-200 text-xs font-bold uppercase">Welcome, {userData?.name}</p>
          <h2 className="text-3xl font-bold mt-1">₦{userData?.walletBalance?.toLocaleString() || '0.00'}</h2>
          <button onClick={() => setShowFundModal(true)} className="mt-4 w-full bg-white text-blue-900 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
            <CreditCard size={16} /> Fund Wallet
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <form onSubmit={handlePurchase} className="space-y-4">
             <div className="grid grid-cols-4 gap-2">
                 {NETWORKS.map(n => (
                    <button key={n.id} type="button" onClick={() => setSelectedNetwork(n)} className={`p-2 rounded-lg border-2 flex flex-col items-center ${selectedNetwork.id === n.id ? 'border-blue-600 bg-blue-50' : 'border-transparent bg-gray-50'}`}>
                       <span className="text-[10px] font-bold">{n.label}</span>
                    </button>
                 ))}
             </div>
             <div className="flex gap-2">
               <button type="button" onClick={() => setActiveTab('data')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${activeTab === 'data' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50'}`}>Data</button>
               <button type="button" onClick={() => setActiveTab('airtime')} className={`flex-1 py-2 rounded-lg font-bold text-sm ${activeTab === 'airtime' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50'}`}>Airtime</button>
             </div>
             {activeTab === 'data' ? (
                 <select onChange={e => setSelectedPlan(e.target.value)} className="w-full p-3 border rounded-xl bg-white">
                    <option>Select Plan</option>
                    {DATA_PLANS[selectedNetwork.id].map(p => <option key={p.id} value={p.id}>{p.name} - ₦{p.price}</option>)}
                 </select>
              ) : (
                 <input type="number" placeholder="Amount" onChange={e => setAmount(e.target.value)} className="w-full p-3 border rounded-xl" />
              )}
              <input type="tel" placeholder="Phone Number" className="w-full p-3 border rounded-xl" />
            <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold">{loading ? 'Processing...' : 'Purchase'}</button>
          </form>
        </div>
      </main>

      {/* FUND MODAL */}
      {showFundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative">
            <button onClick={() => setShowFundModal(false)} className="absolute right-4 top-4"><X/></button>
            <h2 className="text-xl font-bold mb-6">Fund Wallet</h2>
            
            <div className="mb-6 pt-6 border-t border-gray-100">
               <p className="text-xs text-blue-600 font-bold uppercase mb-2">Instant Card Funding</p>
               <input 
                 type="number" 
                 placeholder="Enter Amount (e.g. 1000)" 
                 className="w-full p-3 border border-gray-200 rounded-xl mb-3"
                 value={depositAmount}
                 onChange={e => setDepositAmount(e.target.value)}
               />
               <button onClick={triggerPayment} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700">
                 <Lock size={16} /> Pay Securely Now
               </button>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
           <div className="bg-white p-8 rounded-2xl text-center">
              <CheckCircle size={40} className="text-green-600 mx-auto mb-2"/>
              <h2 className="text-xl font-bold">Success!</h2>
           </div>
        </div>
      )}
    </div>
  );
}