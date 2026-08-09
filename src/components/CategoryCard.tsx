'use client';

import Link from 'next/link';
import { useState } from 'react';

interface CategoryCardProps {
    title: string;
    href: string;
    imageUrl: string;
}

export default function CategoryCard({ title, href, imageUrl }: CategoryCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link href={href} style={{ textDecoration: 'none', color: 'white', display: 'block' }}>
            <div
                style={{
                    height: '75vh',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Background Image Container for Scale Effect */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: `url(${imageUrl}) center/cover no-repeat`,
                        transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                    }}
                />

                {/* Gradient Overlay for Text Readability - Darkening on Hover */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)',
                        transition: 'opacity 0.5s ease',
                        opacity: isHovered ? 1 : 0.85,
                    }}
                />

                {/* Text Container at Bottom Left */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: '3rem',
                        left: '3rem',
                        fontFamily: 'var(--font-serif)',
                        fontSize: '2.2rem',
                        opacity: 0.9,
                        color: 'white',
                        textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        pointerEvents: 'none', // just in case to let clicks pass through to the link
                    }}
                >
                    {title}
                </div>
            </div>
        </Link>
    );
}
