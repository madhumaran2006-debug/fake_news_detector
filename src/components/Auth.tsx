import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { ShieldCheck, Chrome } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-10 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-50 rounded-2xl">
            <ShieldCheck className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">TruthLens</h1>
        <p className="text-slate-500 mt-3 mb-10">
          Your AI-powered companion for detecting fake news and verifying information.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-4 px-6 rounded-2xl border-2 border-slate-100 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600"></div>
          ) : (
            <>
              <Chrome className="w-5 h-5 text-blue-600" />
              Continue with Google
            </>
          )}
        </button>

        <p className="text-xs text-slate-400 mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
