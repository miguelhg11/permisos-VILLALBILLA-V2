import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Search, Clock, MessageSquare, X, DownloadCloud, AlertCircle, Loader2, Shield } from 'lucide-react'
import funcionariosData from '../data/funcionarios.json'
import laboralesData from '../data/laborales.json'
import VoiceSearch from './VoiceSearch'
import RAGEngine from '../lib/ragEngine'
import AIAssistantOverlay from './AIAssistantOverlay'
import AdminDashboard from './AdminDashboard'

export default function Dashboard({ role, onSelectPermit, onBack }) {
    const [search, setSearch] = useState('')
    const [aiResponse, setAiResponse] = useState(null)
    const [chatHistory, setChatHistory] = useState([])
    const [followUp, setFollowUp] = useState('')
    const [isIterating, setIsIterating] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [showAssistant, setShowAssistant] = useState(false)
    const [showAdmin, setShowAdmin] = useState(false)

    const rag = useMemo(() => new RAGEngine(role.toUpperCase()), [role])

    const data = role === 'funcionario' ? funcionariosData : laboralesData
    const logoPath = '/docs/image.png'

    const styles = role === 'funcionario' ? {
        color: 'blue',
        text: 'text-blue-500',
        bg: 'bg-blue-600',
        border: 'border-blue-500/20',
        glass: 'glass-blue',
        glow: 'glow-blue',
        gradient: 'from-blue-500 to-blue-700'
    } : {
        color: 'red',
        text: 'text-red-500',
        bg: 'bg-red-600',
        border: 'border-red-500/20',
        glass: 'glass-red',
        glow: 'glow-red',
        gradient: 'from-red-500 to-red-700'
    }

    const handleVoiceResult = (text) => {
        setSearch(text)
    }

    const handleSearchSubmit = async () => {
        if (!search.trim() || isSearching) return
        setIsSearching(true)
        // Ya no reseteamos el historial aquí para permitir contextualización continua
        try {
            // Intentamos recuperar el contexto del último mensaje si existe para ayudar a la IA
            const lastContext = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1].context : null;
            const result = await rag.processQuery(search, chatHistory, lastContext)

            setAiResponse(result)
            if (result.type === 'success') {
                setChatHistory(prev => [...prev, {
                    query: search,
                    response: result.aiSummary,
                    context: result.originalContext
                }])

                // Check if this is the first response of the session
                const sessionshown = sessionStorage.getItem('assistant_shown')
                if (!sessionshown) {
                    setShowAssistant(true)
                    sessionStorage.setItem('assistant_shown', 'true')
                }
            }
        } finally {
            setIsSearching(false)
        }
    }

    const handleFollowUp = async (text) => {
        if (!text.trim()) return
        setIsIterating(true)

        // Recuperamos el contexto del último mensaje para forzarlo/seguirlo
        const lastContext = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1].context : null;

        const result = await rag.processQuery(text, chatHistory, lastContext)
        setAiResponse(result)
        if (result.type === 'success') {
            setChatHistory(prev => [...prev, { query: text, response: result.aiSummary, context: result.originalContext }])
            setFollowUp('')
        }
        setIsIterating(false)
    }

    const filteredData = data.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.letter.toLowerCase().includes(search.toLowerCase())
    )

    const renderAISummary = (text) => {
        if (!text) return null
        return text.split('\n').map((line, i) => {
            if (line.trim().startsWith('[TITULO:')) {
                const title = line.replace(/\[TITULO:\s*(.*?)\]/, '$1').trim()
                return <h3 key={i} className="text-lg font-black text-white mt-8 mb-4 uppercase tracking-tighter border-l-4 border-blue-500 pl-4">{title}</h3>
            }
            if (line.trim() === '') return <div key={i} className="h-4" />

            // Procesamos negritas simples **texto**
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <p key={i} className="text-slate-300 leading-relaxed mb-4 text-base font-medium">
                    {parts.map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j} className="text-white font-black">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </p>
            );
        })
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 pb-20 overflow-x-hidden">
            <header className="glass-card sticky top-0 z-30 border-b border-white/5 px-4 py-6 md:px-12 backdrop-blur-3xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 justify-between">
                    <div className="flex items-center gap-8 group">
                        <button
                            onClick={() => {
                                if (aiResponse) {
                                    setAiResponse(null)
                                    setSearch('')
                                    setChatHistory([])
                                } else {
                                    onBack()
                                }
                            }}
                            className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10"
                        >
                            <ArrowLeft size={20} className="text-white" />
                        </button>
                        <div className="flex items-center gap-4 relative">
                            <img
                                src={logoPath}
                                alt="Logo"
                                className="h-12 w-auto object-contain filter brightness-110 cursor-help"
                                onClick={() => setShowAdmin(true)}
                            />
                            <div className="hidden sm:block">
                                <p className={`text-xs font-black ${styles.text} uppercase tracking-[0.3em]`}>
                                    {role === 'funcionario' ? 'Personal Funcionario' : 'Personal Laboral'}
                                </p>
                                <h1 className="text-xl font-black text-white uppercase tracking-tighter">Art. 11 Permisos</h1>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center">
                        <a
                            href={role === 'funcionario' ? '/docs/acuerdo.pdf' : '/docs/convenio.pdf'}
                            download
                            className={`group relative flex items-center gap-3 px-5 py-2.5 ${styles.glass} border ${styles.border} rounded-2xl hover:scale-105 transition-all duration-300 shadow-xl ${styles.glow}`}
                        >
                            <div className={`p-2 ${styles.bg} rounded-xl shadow-lg group-hover:rotate-12 transition-transform`}>
                                <DownloadCloud size={18} className="text-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Oficial</p>
                                <p className="text-xs font-black text-white uppercase tracking-tight">
                                    Descargar {role === 'funcionario' ? 'Acuerdo' : 'Convenio'}
                                </p>
                            </div>
                        </a>
                    </div>

                    <div className="relative group w-full md:w-[550px] flex items-center gap-3">
                        <div className={`relative flex-1 glass-card rounded-2xl overflow-hidden border border-white/10 focus-within:border-${styles.color}-500/50 transition-all bg-white/5`}>
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder={`Consultar con IA ${role}...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                                className="w-full bg-transparent py-4 pl-12 pr-4 text-sm focus:outline-none text-white font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="glass-card p-1 rounded-2xl border border-white/10">
                                <VoiceSearch onResult={handleVoiceResult} accentColor={styles.color} />
                            </div>
                            <button
                                onClick={handleSearchSubmit}
                                disabled={!search.trim() || isSearching}
                                className={`px-6 py-4 ${styles.bg} text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95 disabled:opacity-30 disabled:grayscale disabled:scale-100 flex items-center gap-2`}
                            >
                                {isSearching ? (
                                    <>
                                        <span>Procesando</span>
                                        <Loader2 size={16} className="animate-spin" />
                                    </>
                                ) : (
                                    <>
                                        <span>Enviar</span>
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {aiResponse && (
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className={`max-w-7xl mx-auto mt-6 glass-card rounded-3xl overflow-hidden border border-${styles.color}-500/30 ${styles.glow}`}
                        >
                            <div className="bg-gradient-to-r from-slate-900 to-transparent p-6 md:p-10">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 ${styles.bg} rounded-2xl shadow-lg shadow-${styles.color}-500/20`}>
                                            <MessageSquare size={18} className="text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">Análisis Profesional</h2>
                                            <p className="text-lg font-black text-white tracking-tight uppercase">{aiResponse.interpretation}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => {
                                        setAiResponse(null)
                                        setSearch('')
                                        setChatHistory([])
                                    }} className="p-3 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white">
                                        <X size={24} />
                                    </button>
                                </div>

                                {aiResponse.type === 'success' ? (
                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                            {aiResponse.showCard !== false && (
                                                <div className="lg:col-span-4 space-y-6">
                                                    <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 space-y-8">
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-[0.3em]">Duración Legal</p>
                                                            <p className={`text-2xl font-black ${styles.text} leading-tight tracking-tight uppercase`}>{aiResponse.respuestaOperativa.duracion}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-500 uppercase mb-3 tracking-[0.3em]">Acreditación</p>
                                                            <p className="text-sm text-slate-200 font-bold leading-relaxed uppercase tracking-tight">{aiResponse.respuestaOperativa.documentacion}</p>
                                                        </div>
                                                    </div>

                                                    <div className={`p-6 bg-${styles.color}-500/5 rounded-2xl border border-${styles.color}-500/10 flex items-start gap-4`}>
                                                        <div className={`w-2 h-2 mt-2 rounded-full ${styles.bg} animate-pulse`} />
                                                        <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
                                                            {aiResponse.nextStep}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className={aiResponse.showCard !== false ? "lg:col-span-8" : "lg:col-span-12"}>
                                                <div className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-white/5 relative shadow-2xl overflow-hidden min-h-[300px]">
                                                    <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${styles.bg} rounded-full opacity-50`} />
                                                    <div className="relative z-10">
                                                        {renderAISummary(aiResponse.aiSummary)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Clarification Options Buttons */}
                                        {aiResponse.clarificationOptions && aiResponse.clarificationOptions.length > 0 && (
                                            <div className="pt-8 border-t border-white/5">
                                                <div className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto">
                                                    {aiResponse.clarificationOptions.map((option, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleFollowUp(option)}
                                                            disabled={isIterating}
                                                            className={`group relative px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white uppercase tracking-widest hover:bg-${styles.color}-500/10 hover:border-${styles.color}-500/50 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-3`}
                                                        >
                                                            {isIterating ? (
                                                                <Loader2 size={14} className="animate-spin text-white" />
                                                            ) : (
                                                                <div className={`w-1.5 h-1.5 rounded-full ${styles.bg} group-hover:scale-150 transition-transform`} />
                                                            )}
                                                            {option}
                                                            {!isIterating && <ArrowRight size={14} className={`text-slate-500 group-hover:text-white transition-colors`} />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-red-500/5 p-8 rounded-3xl border border-red-500/20">
                                        <p className="text-base text-red-400 font-black flex items-center gap-3">
                                            <AlertCircle size={20} />
                                            {aiResponse.text}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-12 mt-12 mb-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredData.map((p, idx) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            key={p.id}
                            onClick={() => onSelectPermit(p)}
                            className={`group glass-card p-1 rounded-[2.5rem] cursor-pointer transition-all duration-500 ${styles.glow} animate-float`}
                            style={{ animationDelay: `${idx * 0.2}s` }}
                        >
                            <div className="bg-slate-900/60 rounded-[2.2rem] p-6 h-full border border-white/5 flex flex-col relative overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                                <div className="flex items-center justify-between mb-8">
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${styles.gradient} flex items-center justify-center text-lg font-black text-white shadow-lg shadow-${styles.color}-500/20 uppercase`}>
                                        {p.letter}
                                    </div>
                                    <div className="bg-white/5 px-4 py-2 rounded-full flex items-center gap-2 border border-white/5">
                                        <Clock size={16} className={styles.text} />
                                        <span className="text-xs font-black text-white tracking-widest uppercase">{p.tenSeconds.corresponde.split(' ')[0]} {p.tenSeconds.corresponde.split(' ')[1]}</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-white uppercase leading-[1.1] mb-4 tracking-tighter group-hover:translate-x-1 transition-transform">
                                    {p.title}
                                </h3>

                                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest line-clamp-1 max-w-[80%] italic">
                                        {p.tenSeconds.cubre}
                                    </p>
                                    <div className={`p-2 bg-${styles.color}-500/10 rounded-xl group-hover:bg-${styles.color}-500 transition-colors`}>
                                        <ArrowRight size={18} className={`text-${styles.color}-400 group-hover:text-white transition-colors`} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </main>

            {showAssistant && (
                <AIAssistantOverlay onDismiss={() => setShowAssistant(false)} />
            )}

            {showAdmin && (
                <AdminDashboard onClose={() => setShowAdmin(false)} />
            )}
        </div>
    )
}
