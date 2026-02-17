import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Briefcase, ArrowRight } from 'lucide-react'

export default function Home({ onSelectRole }) {
    const logoPath = '/docs/image.png'

    return (
        <div className="min-h-screen mesh-gradient flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full animate-pulse" />

            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mb-16 flex flex-col items-center"
            >
                <img
                    src={logoPath}
                    alt="Ayuntamiento de Villalbilla"
                    className="h-32 md:h-48 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                />
                <h1 className="mt-8 text-2xl md:text-3xl font-black text-white tracking-[0.4em] uppercase text-center opacity-80 decoration-blue-500/50 underline-offset-8 underline">
                    Portal de Permisos
                </h1>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl z-10">
                <motion.button
                    whileHover={{ y: -5 }}
                    onClick={() => onSelectRole('funcionario')}
                    className="group relative flex-1 glass-card p-10 rounded-3xl glow-blue border-blue-500/20 flex flex-col items-center text-center btn-premium"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/40">
                        <ShieldCheck className="text-white" size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">FUNCIONARIOS</h2>
                    <p className="text-slate-400 text-base font-medium uppercase tracking-widest mb-6">Acuerdo de Personal</p>
                    <div className="flex items-center gap-2 text-blue-400 font-bold group-hover:text-blue-300 transition-colors text-lg">
                        ENTRAR <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </motion.button>

                <motion.button
                    whileHover={{ y: -5 }}
                    onClick={() => onSelectRole('laboral')}
                    className="group relative flex-1 glass-card p-10 rounded-3xl glow-red border-red-500/20 flex flex-col items-center text-center btn-premium"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-red-500/40">
                        <Briefcase className="text-white" size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">LABORALES</h2>
                    <p className="text-slate-400 text-base font-medium uppercase tracking-widest mb-6">Convenio Colectivo</p>
                    <div className="flex items-center gap-2 text-red-400 font-bold group-hover:text-red-300 transition-colors text-lg">
                        ENTRAR <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                </motion.button>
            </div>

            <footer className="absolute bottom-8 text-slate-500 text-xs font-bold tracking-widest uppercase text-center px-4">
                Ayuntamiento de Villalbilla • © 2026 Ecosistema Digital
            </footer>
        </div>
    )
}
