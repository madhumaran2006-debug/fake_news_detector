import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { analyzeNews } from '../lib/gemini';
import { Search, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NewsAnalyzerProps {
  user: User;
}

export default function NewsAnalyzer({ user }: NewsAnalyzerProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ label: string; confidence: number; explanation: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await analyzeNews(text);
      
      // Save to Firestore
      await addDoc(collection(db, 'news_checks'), {
        userId: user.uid,
        text,
        label: analysis.label,
        confidence: analysis.confidence,
        explanation: analysis.explanation,
        timestamp: serverTimestamp(),
      });

      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Analyze News</h2>
        <p className="text-slate-500 mt-2">Paste a headline or article text below to verify its credibility.</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter news headline or article text here..."
          className="w-full min-h-[200px] p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-slate-700 leading-relaxed"
        />
        
        <div className="flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={loading || !text.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "rounded-2xl p-8 border shadow-xl",
              result.label === 'Real' 
                ? "bg-emerald-50 border-emerald-100" 
                : "bg-rose-50 border-rose-100"
            )}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-full",
                  result.label === 'Real' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                )}>
                  {result.label === 'Real' ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                </div>
                <div>
                  <h3 className={cn(
                    "text-2xl font-bold",
                    result.label === 'Real' ? "text-emerald-900" : "text-rose-900"
                  )}>
                    {result.label === 'Real' ? 'Likely Real' : 'Likely Fake'}
                  </h3>
                  <p className={cn(
                    "text-lg font-medium mt-1",
                    result.label === 'Real' ? "text-emerald-700" : "text-rose-700"
                  )}>
                    Confidence: {result.confidence}%
                  </p>
                </div>
              </div>

              <div className="flex-1 max-w-md">
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">AI Explanation</h4>
                  <p className="text-slate-700 leading-relaxed italic">"{result.explanation}"</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
