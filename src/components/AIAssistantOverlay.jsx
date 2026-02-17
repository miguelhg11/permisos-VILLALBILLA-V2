import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldAlert } from 'lucide-react'

export default function AIAssistantOverlay({ onDismiss }) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Pequeño delay para que aparezca después de que la respuesta se asiente
        const timer = setTimeout(() => setIsVisible(true), 600)
        return () => clearTimeout(timer)
    }, [])

    const handleDismiss = () => {
        setIsVisible(false)
        setTimeout(onDismiss, 500)
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md pointer-events-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 cursor-pointer"
                        onClick={handleDismiss}
                    />

                    <div className="relative flex flex-col items-center md:flex-row md:items-end gap-8 max-w-4xl w-full pointer-events-none px-4">

                        {/* El Funcionario */}
                        <div className="relative w-72 h-72 md:w-[450px] md:h-[450px] flex-shrink-0 pointer-events-auto">
                            {/* Glow effect backend */}
                            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full animate-pulse" />

                            {/* Imagen Base con animación de "hablar" */}
                            <motion.img
                                src="/funcionario.png"
                                alt="Asistente IA"
                                className="w-full h-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                                animate={{
                                    y: [0, -8, 0],
                                    scale: [1, 1.02, 1],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />

                            {/* Animación de Hablar (Micro-movimientos) */}
                            <motion.div
                                className="absolute inset-0 z-20 pointer-events-none"
                                animate={{
                                    scaleY: [1, 1.01, 1, 1.02, 1],
                                }}
                                transition={{
                                    duration: 0.2,
                                    repeat: Infinity,
                                    repeatType: 'mirror',
                                    ease: "linear"
                                }}
                            />
                        </div>

                        {/* Bocadillo de Texto (Speech Bubble) - Estilo Premium Apple-like */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, x: 50, y: 20 }}
                            animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 30 }}
                            transition={{
                                delay: 0.3,
                                type: 'spring',
                                damping: 18,
                                stiffness: 120
                            }}
                            className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-[3.5rem] rounded-bl-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] relative pointer-events-auto max-w-lg group overflow-hidden"
                        >
                            {/* Glass gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-white/[0.02] to-purple-500/10" />

                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse delay-75" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse delay-150" />
                                    </div>
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] opacity-80">AI Assistant Protocol</span>
                                </div>

                                <p className="text-white text-xl md:text-2xl font-bold leading-[1.3] tracking-tight">
                                    "Soy tu asistente IA para consultas de permisos, y te ayudaré lo mejor que pueda, pero <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent font-black">la última palabra</span> respecto a la interpretación final la tiene siempre RRHH."
                                </p>

                                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <div className="p-2 bg-white/5 rounded-xl">
                                            <ShieldAlert size={18} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400">Interpretación</span>
                                            <span className="text-[10px] font-bold text-slate-500 italic">No vinculante administrativamente</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDismiss}
                                        className="group relative px-8 py-4 bg-white text-black rounded-2xl overflow-hidden hover:scale-105 active:scale-95 transition-all shadow-2xl"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">Entendido</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </div>
            )}
        </AnimatePresence>
    )
}
