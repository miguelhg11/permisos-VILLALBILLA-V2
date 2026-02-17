import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react'

export default function VoiceSearch({ onResult, accentColor }) {
    const [isListening, setIsListening] = useState(false)
    const [error, setError] = useState(null)
    const [browserSupportsSpeech, setBrowserSupportsSpeech] = useState(true)
    const recognitionRef = useRef(null)

    useEffect(() => {
        const SpeechRecognition = window.webkitSpeechRecognition || window.speechRecognition
        if (!SpeechRecognition) {
            setBrowserSupportsSpeech(false)
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        }
    }, [])

    const startListening = () => {
        setError(null)
        const SpeechRecognition = window.webkitSpeechRecognition || window.speechRecognition

        if (!SpeechRecognition) {
            setError('Tu navegador no soporta búsqueda por voz')
            return
        }

        try {
            const recognition = new SpeechRecognition()
            recognitionRef.current = recognition

            recognition.lang = 'es-ES'
            recognition.interimResults = false
            recognition.maxAlternatives = 1
            recognition.continuous = false

            recognition.onstart = () => {
                setIsListening(true)
            }

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error)
                setIsListening(false)

                switch (event.error) {
                    case 'not-allowed':
                        setError('Permiso de micrófono denegado')
                        break
                    case 'no-speech':
                        // Ignore no-speech as it's common
                        break
                    case 'network':
                        setError('Error de red al intentar reconocer voz')
                        break
                    default:
                        setError(`Error: ${event.error}`)
                }
            }

            recognition.onend = () => {
                setIsListening(false)
            }

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript
                if (transcript) {
                    onResult(transcript)
                }
            }

            recognition.start()
        } catch (err) {
            console.error('Failed to start recognition:', err)
            setError('Error al iniciar el micrófono')
            setIsListening(false)
        }
    }

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }
    }

    if (!browserSupportsSpeech) return null

    return (
        <div className="relative flex items-center">
            <button
                onClick={isListening ? stopListening : startListening}
                className={`group relative p-3 rounded-full transition-all duration-300 ${isListening
                    ? `bg-${accentColor}-600 text-white animate-smooth-pulse z-10 scale-110`
                    : error
                        ? 'text-red-500 hover:bg-red-500/10'
                        : `text-slate-400 hover:text-${accentColor}-500 hover:bg-${accentColor}-500/10`
                    }`}
                title={isListening ? "Detener escucha" : "Buscar por voz"}
            >
                {/* Modern Ripple Effect */}
                {isListening && (
                    <>
                        <div className={`absolute inset-0 rounded-full bg-${accentColor}-500 animate-ripple`} style={{ animationDelay: '0s' }} />
                        <div className={`absolute inset-0 rounded-full bg-${accentColor}-500 animate-ripple`} style={{ animationDelay: '0.6s' }} />
                        <div className={`absolute inset-0 rounded-full bg-${accentColor}-500 animate-ripple`} style={{ animationDelay: '1.2s' }} />
                    </>
                )}

                <div className="relative z-20 flex items-center justify-center">
                    {isListening ? (
                        <div className="flex items-center gap-[3px] h-5 px-1">
                            <div className="w-[3px] h-3 bg-white rounded-full animate-sound-1" />
                            <div className="w-[4px] h-5 bg-white rounded-full animate-sound-2" />
                            <div className="w-[3px] h-4 bg-white rounded-full animate-sound-3" />
                            <div className="w-[4px] h-3 bg-white rounded-full animate-sound-4" />
                            <div className="w-[3px] h-4 bg-white rounded-full animate-sound-1" style={{ animationDelay: '0.2s' }} />
                        </div>
                    ) : error ? (
                        <AlertCircle size={22} className="opacity-80" />
                    ) : (
                        <Mic size={22} className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    )}
                </div>

                {isListening && (
                    <span className="absolute -top-0 -right-0 flex h-3 w-3 z-30">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                    </span>
                )}
            </button>

            {error && (
                <div className="absolute right-full mr-2 whitespace-nowrap bg-red-500 text-white text-[10px] font-bold py-1 px-2 rounded-md shadow-lg pointer-events-none uppercase tracking-tighter">
                    {error}
                </div>
            )}
        </div>
    )
}
