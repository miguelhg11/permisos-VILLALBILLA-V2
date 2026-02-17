import React, { useState } from 'react'
import Home from './components/Home'
import Dashboard from './components/Dashboard'
import PermitDetail from './components/PermitDetail'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
    const [userRole, setUserRole] = useState(null) // 'funcionario' | 'laboral'
    const [view, setView] = useState('home') // 'home' | 'dashboard' | 'detail'
    const [selectedPermit, setSelectedPermit] = useState(null)

    const handleSelectRole = (role) => {
        setUserRole(role)
        setView('dashboard')
    }

    const handleSelectPermit = (permit) => {
        setSelectedPermit(permit)
        setView('detail')
    }

    const goBack = () => {
        if (view === 'detail') setView('dashboard')
        else if (view === 'dashboard') setView('home')
    }

    return (
        <div className="min-h-screen w-full overflow-x-hidden">
            <AnimatePresence mode="wait">
                {view === 'home' && (
                    <motion.div
                        key="home"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Home onSelectRole={handleSelectRole} />
                    </motion.div>
                )}

                {view === 'dashboard' && (
                    <motion.div
                        key="dashboard"
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Dashboard
                            role={userRole}
                            onSelectPermit={handleSelectPermit}
                            onBack={() => setView('home')}
                        />
                    </motion.div>
                )}

                {view === 'detail' && (
                    <motion.div
                        key="detail"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.1, opacity: 0 }}
                    >
                        <PermitDetail
                            permit={selectedPermit}
                            role={userRole}
                            onBack={() => setView('dashboard')}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default App
