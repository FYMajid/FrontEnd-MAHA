'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, ArrowRight, Copy, CheckCircle } from 'lucide-react';
import { promoCodeService, PromoCode } from '@/services/promoCodeService';
import { formatAsUsd } from '@/utils/currency';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AUTO_CLOSE_TIME = 10000; // 10 seconds per promo
const CYCLE_TIME = 10000;

const PromoPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [activePromos, setActivePromos] = useState<PromoCode[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasClosed, setHasClosed] = useState(false);
    const [progress, setProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const pathname = usePathname();

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setHasClosed(true);
    }, []);

    const handleCopy = () => {
        if (!currentPromo) return;
        navigator.clipboard.writeText(currentPromo.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Reset popup whenever user changes page
    useEffect(() => {
        setIsVisible(false);
        setHasClosed(false);
        setCurrentIndex(0);
        setProgress(0);
        setCopied(false);

        const timer = setTimeout(() => {
            if (activePromos.length > 0) {
                setIsVisible(true);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [pathname, activePromos.length]);

    useEffect(() => {
        const fetchPromos = async () => {
            try {
                const data = await promoCodeService.getActivePromos();
                if (data && data.length > 0) {
                    setActivePromos(data);
                }
            } catch (error) {
                console.error("Failed to fetch promos for popup", error);
            }
        };

        fetchPromos();
    }, []);

    // Cycling and Progress Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        let progressInterval: NodeJS.Timeout;

        if (isVisible && activePromos.length > 0) {
            // Reset progress when index changes
            setProgress(0);

            progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) return 100;
                    return prev + (100 / (CYCLE_TIME / 100)); // Update every 100ms
                });
            }, 100);

            interval = setInterval(() => {
                if (activePromos.length > 1) {
                    setCurrentIndex(prev => (prev + 1) % activePromos.length);
                } else {
                    // If only 1 promo, auto-close after time is out
                    handleClose();
                }
            }, CYCLE_TIME);
        }

        return () => {
            clearInterval(interval);
            clearInterval(progressInterval);
        };
    }, [isVisible, activePromos.length, currentIndex, handleClose]);

    if (activePromos.length === 0 || hasClosed) return null;

    const currentPromo = activePromos[currentIndex];

    return (
        <AnimatePresence mode="wait">
            {isVisible && (
                <motion.div
                    key={currentPromo.id}
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    className="fixed bottom-6 right-4 md:bottom-10 md:right-10 z-[9999] w-[calc(100vw-2rem)] max-w-[320px] md:max-w-[380px]"
                >
                    <div className="relative bg-[#111] border border-white/10 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden group">
                        {/* Background Glow */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#FF3131]/20 blur-[60px] rounded-full" />

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 md:top-5 md:right-5 z-20 p-1.5 md:p-2 bg-white/5 hover:bg-[#FF3131] hover:text-white rounded-lg md:rounded-xl transition-all text-white/40"
                        >
                            <X size={14} className="md:w-4 md:h-4" />
                        </button>

                        <div className="p-6 md:p-8">
                            <div className="flex items-center justify-between mb-5 md:mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#FF3131] flex items-center justify-center text-white shadow-lg shadow-[#FF3131]/30">
                                        <Gift size={16} className="md:w-[18px] md:h-[18px]" />
                                    </div>
                                    <span className="text-[9px] md:text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">Special Offer</span>
                                </div>
                                {activePromos.length > 1 && (
                                    <span className="text-[8px] md:text-[9px] font-bold text-white/30 tracking-widest uppercase">
                                        {currentIndex + 1} / {activePromos.length}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-2xl md:text-3xl font-black italic uppercase text-white leading-[0.9] mb-3 md:mb-4 tracking-tighter">
                                GET {currentPromo.discountType === 1 ? `${currentPromo.discountAmount}%` : formatAsUsd(currentPromo.discountAmount)} <br />
                                <span className="text-[#FF3131]">OFF NOW</span>
                            </h3>

                            <p className="text-gray-400 text-xs md:text-sm font-medium italic mb-6 md:mb-8 leading-relaxed">
                                Limited deal for {currentPromo.restrictedToPackage === 0 ? 'any package' : 'selected packages'}. Use code <span className="text-white font-mono font-black">{currentPromo.code}</span> at checkout.
                            </p>

                            <div className="flex flex-col gap-3">
                                <div className="flex gap-2">
                                    <Link href="/price/promo" className="flex-1" onClick={handleClose}>
                                        <button className="w-full h-full bg-white text-black py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-[9px] md:text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#FF3131] hover:text-white transition-all shadow-xl">
                                            VIEW ALL DEALS <ArrowRight size={12} className="md:w-3.5 md:h-3.5" />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={handleCopy}
                                        className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all ${copied ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                                        title="Copy Code"
                                    >
                                        {copied ? <CheckCircle size={18} className="md:w-5 md:h-5" /> : <Copy size={18} className="md:w-5 md:h-5" />}
                                    </button>
                                </div>
                                <div className="flex justify-center">
                                    <span className="text-[8px] md:text-[9px] font-bold text-white/20 uppercase tracking-widest">Limited Slots Available</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Progress Bar Decor */}
                        <div className="h-1.5 w-full bg-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.1, ease: "linear" }}
                                className="h-full bg-[#FF3131]"
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PromoPopup;
