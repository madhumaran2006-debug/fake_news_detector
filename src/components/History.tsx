import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { NewsCheck } from '../types';
import { Calendar, Clock, CheckCircle2, AlertCircle, ChevronRight, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface HistoryProps {
  user: User;
}

export default function History({ user }: HistoryProps) {
  const [checks, setChecks] = useState<NewsCheck[]>([]);
  const [loading, setLoading] = useState(true);

  const stats = useMemo(() => {
    const realCount = checks.filter(c => c.label === 'Real').length;
    const fakeCount = checks.filter(c => c.label === 'Fake').length;
    return [
      { name: 'Real', value: realCount, color: '#10b981' },
      { name: 'Fake', value: fakeCount, color: '#f43f5e' }
    ];
  }, [checks]);

  useEffect(() => {
    const q = query(
      collection(db, 'news_checks'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsCheck[];
      setChecks(data);
      setLoading(false);
    }, (error) => {
      console.error("History fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Your History</h2>
        <p className="text-slate-500 mt-2">Review your past news analysis results and statistics.</p>
      </header>

      {checks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <PieIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Distribution</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {stats.map(s => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs font-medium text-slate-600">{s.name}: {s.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900">Overview</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <p className="text-emerald-600 text-sm font-medium">Real Articles</p>
                <p className="text-3xl font-bold text-emerald-900 mt-1">{stats[0].value}</p>
              </div>
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                <p className="text-rose-600 text-sm font-medium">Fake Articles</p>
                <p className="text-3xl font-bold text-rose-900 mt-1">{stats[1].value}</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-blue-600 text-sm font-medium">Total Analyzed</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{checks.length}</p>
            </div>
          </div>
        </div>
      )}

      {checks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No history yet</h3>
          <p className="text-slate-500 mt-1">Start analyzing news to see your history here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          <h3 className="text-xl font-bold text-slate-900 mt-4">Recent Checks</h3>
          {checks.map((check, index) => (
            <motion.div
              key={check.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  check.label === 'Real' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {check.label === 'Real' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-slate-900 font-medium truncate text-lg">
                    {check.text}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {check.timestamp?.toDate().toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {check.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`font-semibold ${
                      check.label === 'Real' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {check.confidence}% Confidence
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-600 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

