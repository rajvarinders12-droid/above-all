'use client';

import Link from 'next/link';
import { useState } from 'react';

interface CategoryCardProps {
    title: string;
    href: string;
    imageUrl: string;
    hoverImageUrl?: string;
}

export default function CategoryCard({ title, href, imageUrl, hoverImageUrl }: CategoryCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link href={href} style={{ textDecoration: 'none', color: 'white', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
                style={{
                    aspectRatio: '3/4',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    borderRadius: '2px', // Sharper edges for a premium feel
                    backgroundColor: '#111',
                    boxShadow: isHovered ? '0 12px 40px rgba(0,0,0,0.8)' : '0 4px 20px rgba(0,0,0,0.4)',
                    transition: 'box-shadow 0.5s ease'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Background Image Container */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url("${imageUrl}")`,
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        transition: 'opacity 0.5s ease',
                        opacity: isHovered && hoverImageUrl ? 0 : 1,
                    }}
                />

                {hoverImageUrl && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: `url("${hoverImageUrl}")`,
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                            transition: 'opacity 0.5s ease',
                            opacity: isHovered ? 1 : 0,
                        }}
                    />
                )}
            </div>

            {/* Text Container Below the Card */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 0.25rem',
                }}
            >
                <div
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '1rem',
                        fontWeight: 500,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                        transition: 'color 0.3s ease',
                    }}
                >
                    {title}
                </div>
                <div style={{
                    height: '1px',
                    background: isHovered ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255,255,255,0.2)',
                    transition: 'background 0.3s ease, width 0.3s ease',
                    width: isHovered ? '32px' : '20px'
                }} />
            </div>
        </Link>
    );
}
