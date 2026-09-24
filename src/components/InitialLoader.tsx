'use client';

import { useEffect, useState } from 'react';

export default function InitialLoader() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if the loader has already been shown in this session
        const hasSeenLoader = sessionStorage.getItem('above_all_has_seen_loader');

        if (hasSeenLoader) {
            setIsLoading(false);
            return;
        }

        // If not seen, mark it as seen and hide loader after an animation delay
        sessionStorage.setItem('above_all_has_seen_loader', 'true');

        // The loader duration
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2800); // 2.8 seconds cinematic load

        return () => clearTimeout(timer);
    }, []);

    if (!isLoading) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#050505',
            zIndex: 999999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'loaderFadeOut 0.8s cubic-bezier(0.76, 0, 0.24, 1) calc(2.8s - 0.8s) forwards',
        }}>
            <style>{`
                @keyframes loaderFadeOut {
                    0% {
                        opacity: 1;
                        visibility: visible;
                    }
                    100% {
                        opacity: 0;
                        visibility: hidden;
                    }
                }
                @keyframes logoScale {
                    0% {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    30% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1.02);
                    }
                }
                .loader-logo {
                    width: 200px;
                    max-width: 60vw;
                    animation: logoScale 2.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                    filter: drop-shadow(0 0 20px rgba(255,255,255,0.1));
                }
                .loader-progress-container {
                    width: 140px;
                    height: 1px;
                    background-color: rgba(255, 255, 255, 0.1);
                    margin-top: 30px;
                    overflow: hidden;
                    border-radius: 2px;
                    position: relative;
                }
                .loader-progress-bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 0%;
                    background-color: #ffffff;
                    animation: loadProgress 2s cubic-bezier(0.76, 0, 0.24, 1) forwards;
                    animation-delay: 0.3s;
                }
                @keyframes loadProgress {
                    0% { width: 0%; }
                    40% { width: 30%; }
                    80% { width: 80%; }
                    100% { width: 100%; }
                }
            `}</style>

            <img
                src="/loader.webp"
                alt="ABOVA Logo Loader"
                className="loader-logo"
            />

            <div className="loader-progress-container">
                <div className="loader-progress-bar"></div>
            </div>
        </div>
    );
}
