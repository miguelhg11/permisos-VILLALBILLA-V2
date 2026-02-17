import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, FileText, MessageSquare, AlertCircle, Info, Users, DownloadCloud } from 'lucide-react'

export default function PermitDetail({ permit, role, onBack }) {
    if (!permit) return null
    const logoPath = '/DOCS/image.png'

    const styles = role === 'funcionario' ? {
        color: 'blue',
        text: 'text-blue-500',
        textLight: 'text-blue-400',
        bg: 'bg-blue-600',
        border: 'border-blue-500/20',
        gradient: 'from-blue-600 to-blue-900',
        glow: 'shadow-[0_0_40px_rgba(59,130,246,0.1)]'
    } : {
        color: 'red',
        text: 'text-red-500',
        textLight: 'text-red-400',
        bg: 'bg-red-600',
        border: 'border-red-500/20',
        gradient: 'from-red-600 to-red-900',
        glow: 'shadow-[0_0_40px_rgba(239,68,68,0.1)]'
    }

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 pb-24 font-sans selection:bg-white/20">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center group/nav">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-xs font-black text-white px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 uppercase tracking-[0.2em]"
                >
                    <ArrowLeft size={18} /> Volver
                </button>

                <div className="hidden sm:flex items-center">
                    <a
                        href={role === 'funcionario' ? '/docs/acuerdo.pdf' : '/docs/convenio.pdf'}
                        download
                        className={`group relative flex items-center gap-3 px-5 py-2.5 bg-white/5 glass border border-white/10 rounded-2xl hover:scale-105 transition-all duration-300 shadow-xl ${styles.glow}`}
                    >
                        <div className={`p-2 ${styles.bg} rounded-xl shadow-lg group-hover:rotate-12 transition-transform`}>
                            <DownloadCloud size={18} className={`text-white`} />
                        </div>
                        <div className="text-left">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">Oficial</p>
                            <p className="text-xs font-black text-white uppercase tracking-tight">
                                Descargar {role === 'funcionario' ? 'Acuerdo' : 'Convenio'}
                            </p>
                        </div>
                    </a>
                </div>

                <img src={logoPath} alt="Logo" className="h-8 md:h-12 object-contain opacity-70 group-hover/nav:opacity-100 transition-opacity" />
            </nav>

            <main className="max-w-5xl mx-auto pt-32 px-6">
                <header className="mb-14">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-4">
                            <span className={`w-8 h-1 ${styles.bg} rounded-full`} />
                            <p className={`text-xs font-black uppercase tracking-[0.4em] ${styles.text}`}>
                                Apartado {permit.letter} • Artículo 11
                            </p>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tighter uppercase mb-4">
                            {permit.title}
                        </h1>
                        <p className="text-xl text-slate-400 font-medium italic leading-snug max-w-3xl border-l-2 border-white/10 pl-6">
                            "{permit.tenSeconds.cubre}"
                        </p>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
                    <motion.div
                        whileHover={{ y: -2 }}
                        className={`md:col-span-12 lg:col-span-7 glass-card rounded-[2.5rem] p-10 md:p-12 border-white/10 ${styles.glow} relative flex flex-col justify-center overflow-hidden`}
                    >
                        <div className={`absolute -top-20 -right-20 w-80 h-80 bg-${styles.color}-600/5 blur-[100px] rounded-full`} />

                        <div className="flex items-center gap-3 mb-8">
                            <Clock size={24} className={styles.text} />
                            <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Información de Derecho</h2>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <p className={`text-3xl md:text-5xl font-black ${styles.text} leading-tight tracking-tight`}>
                                {permit.tenSeconds.corresponde}
                            </p>
                        </div>

                        <div className="mt-10 pt-10 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-10">
                            <div>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Duración detallada</p>
                                <p className="text-sm text-white leading-relaxed font-bold">{permit.duracion}</p>
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Acreditación</p>
                                <p className="text-sm text-slate-300 font-bold uppercase tracking-tight">{permit.tenSeconds.justificante}</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="md:col-span-12 lg:col-span-5 glass-card rounded-[2.5rem] p-10 border-white/5 bg-white/[0.01] flex flex-col gap-10">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <Users size={22} className={styles.text} />
                                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Beneficiarios</h3>
                            </div>
                            <p className="text-base text-white font-black leading-relaxed tracking-tight uppercase">
                                {permit.quien}
                            </p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                            <div className="flex gap-2 items-center mb-3">
                                <Info size={16} className={styles.text} />
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Protocolo</span>
                            </div>
                            <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                                {permit.condiciones}
                            </p>
                        </div>
                    </div>

                    <div className="md:col-span-12">
                        <div className="bg-white/5 rounded-[3rem] p-10 md:p-12 border border-white/10 flex flex-col md:flex-row md:items-center gap-10 relative overflow-hidden group">
                            <div className={`absolute inset-0 bg-gradient-to-r from-${styles.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 shrink-0 z-10">
                                <FileText size={48} className="text-white opacity-80" />
                            </div>
                            <div className="space-y-3 z-10">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Documentación Requerida</h3>
                                <p className="text-xl md:text-3xl font-black text-white leading-tight">
                                    {permit.documentacion}
                                </p>
                            </div>
                        </div>
                    </div>

                    {permit.faq && (
                        <div className="md:col-span-12 pt-16 space-y-12">
                            <div className="flex items-center gap-8">
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.6em] whitespace-nowrap">Preguntas Frecuentes</h3>
                                <div className="h-[1px] w-full bg-white/5" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {permit.faq.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] flex flex-col gap-4 hover:border-white/10 transition-colors"
                                    >
                                        <div className="flex gap-3">
                                            <MessageSquare size={18} className={styles.text} />
                                            <p className="text-base font-black text-white leading-snug tracking-tight">
                                                {item.q.startsWith('¿') ? item.q : `¿${item.q}`}
                                            </p>
                                        </div>
                                        <p className="text-sm text-slate-400 font-medium leading-relaxed border-l-2 border-white/5 pl-6 ml-2">
                                            {item.a}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
                <motion.button
                    whileHover={{ y: -3, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className={`flex items-center gap-3 bg-${styles.color}-600 text-white px-10 py-4 rounded-2xl font-black text-xs tracking-widest uppercase shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-white/20 transition-all`}
                >
                    <ArrowLeft size={20} /> Dashboard Principal
                </motion.button>
            </div>
        </div>
    )
}
