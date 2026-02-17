import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Shield, Key, AlertTriangle, RefreshCw, X, CheckCircle } from 'lucide-react'
import RAGEngine from '../lib/ragEngine'

export default function AdminDashboard({ onClose }) {
    const [status, setStatus] = useState(RAGEngine.getStatus())

    useEffect(() => {
        const interval = setInterval(() => {
            setStatus(RAGEngine.getStatus())
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    const { currentIndex, totalKeys, stats, model } = status

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-500/10"
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-500/5 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20">
                            <Shield size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em]">Cerebro Central</h2>
                            <p className="text-xl font-black text-white tracking-tight uppercase">Admin Dashboard</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Key Rotation Visualizer */}
                    <div className="md:col-span-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Estado de Rotación</h3>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{model}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {RAGEngine.apiKeys.map((key, idx) => (
                                <div
                                    key={idx}
                                    className={`relative p-5 rounded-2xl border transition-all duration-500 ${idx === currentIndex
                                            ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                                            : 'bg-white/5 border-white/5 opacity-40'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <Key size={14} className={idx === currentIndex ? 'text-blue-400' : 'text-slate-500'} />
                                        {idx === currentIndex && (
                                            <div className="flex gap-1">
                                                <div className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0s' }} />
                                                <div className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                <div className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-tighter mb-1">Key {idx + 1}</p>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase truncate">
                                        {key.substring(0, 10)}...
                                    </p>
                                    {idx === currentIndex && (
                                        <div className="absolute top-2 right-2">
                                            <CheckCircle size={10} className="text-emerald-400" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Usage chart / bars */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Carga por Llave</p>
                                <p className="text-[10px] font-bold text-blue-400">{stats.totalRequests} Req. Totales</p>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                                {stats.keysUsage.map((usage, idx) => {
                                    const percent = stats.totalRequests === 0 ? 0 : (usage / stats.totalRequests) * 100
                                    return (
                                        <div
                                            key={idx}
                                            style={{ width: `${percent}%` }}
                                            className={`h-full transition-all duration-1000 ${idx % 2 === 0 ? 'bg-blue-500' : 'bg-blue-400'
                                                } ${idx === currentIndex ? 'brightness-125' : 'opacity-40'}`}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Stats sidebar */}
                    <div className="md:col-span-4 space-y-4">
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/10 rounded-xl">
                                    <Activity size={18} className="text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Rotaciones</p>
                                    <p className="text-xl font-black text-white">{stats.rotations}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500/10 rounded-xl">
                                    <AlertTriangle size={18} className="text-red-400" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Fallos 429</p>
                                    <p className="text-xl font-black text-red-400">{stats.failures}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl">
                                    <RefreshCw size={18} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Keys Activas</p>
                                    <p className="text-xl font-black text-white">{totalKeys}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-600 rounded-2xl flex flex-col items-center justify-center text-center gap-2 shadow-xl shadow-blue-500/20">
                            <p className="text-[9px] font-black text-blue-100 uppercase tracking-[0.2em]">Health Check</p>
                            <p className="text-xs font-black text-white uppercase italic">Sistema Operativo</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
