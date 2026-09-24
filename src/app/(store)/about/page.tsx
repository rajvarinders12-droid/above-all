import React from 'react';
import Image from 'next/image';

export const metadata = {
    title: 'About Us | Above All',
    description: 'Learn more about Above All, elevated essentials designed for every version of you.',
};

export default function AboutPage() {
    return (
        <main className="about-page" style={{ minHeight: '100vh', background: '#000000', color: '#ffffff' }}>

            {/* Hero Section */}
            <div className="about-hero" style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <Image
                    src="/hero-img.PNG"
                    alt="Above All - Our Story"
                    fill
                    style={{ objectFit: 'cover', opacity: 0.5 }}
                    priority
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, #000000 100%)' }} />

                <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 1rem' }}>
                    <h1 className="hero-title" style={{ fontFamily: 'var(--font-serif)', letterSpacing: '0.1em', margin: 0, fontWeight: 300, textTransform: 'uppercase' }}>
                        OUR STORY
                    </h1>
                </div>
            </div>

            {/* Main Container */}
            <div className="about-container" style={{ margin: '0 auto', display: 'flex', flexDirection: 'column' }}>

                {/* Intro Statement Centered */}
                <div className="intro-section" style={{ textAlign: 'center', margin: '0 auto' }}>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '2rem' }}>
                        Redefining culture. One silhouette at a time.
                    </p>
                    <h2 className="intro-subtitle" style={{ letterSpacing: '0.02em', textTransform: 'uppercase', margin: 0, fontWeight: 300 }}>
                        We don&apos;t just follow trends.<br />We set the <span style={{ color: '#888', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>standard</span>.
                    </h2>
                </div>

                {/* Left/Right Split - Large Image and Text */}
                <div className="split-section" style={{ display: 'grid', alignItems: 'center' }}>

                    <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', maxHeight: '750px', overflow: 'hidden' }}>
                        <Image
                            src="/2.PNG"
                            alt="Above All Aesthetic"
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    </div>

                    <div className="text-content" style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 className="section-title" style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, marginBottom: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            Born from the underground
                        </h3>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: '2.2', fontWeight: 300, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <p>
                                Elevated for the extraordinary. Above All represents the convergence of luxury aesthetics and raw streetwear authenticity.
                            </p>
                            <p>
                                Our garments are more than fabric—they are statements of intent. Every piece is meticulously crafted to empower the wearer, ensuring you stand out in rooms you haven&apos;t even entered yet.
                            </p>
                            <p>
                                Quality is our language. Authenticity is our currency. We are dedicated to providing elevated essentials designed for every version of you. No compromises, no shortcuts. Just pure, unadulterated style.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Editorial Visual Grid */}
                <div className="editorial-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '6rem', width: '100%' }}>
                    <div className="grid-item-1" style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
                        <Image src="/b1.webp" alt="Abova Look 1" fill style={{ objectFit: 'cover' }} />
                    </div>
                    <div className="grid-item-2" style={{ position: 'relative', aspectRatio: '3/4', transform: 'translateY(15%)', overflow: 'hidden' }}>
                        <Image src="/black1.HEIC" alt="Abova Look 2" fill style={{ objectFit: 'cover', background: '#111' }} onError={(e) => { e.currentTarget.src = "/black3.jpeg"; }} />
                        {/* Fallback to black3.jpeg since Next might not support HEIC in all browsers natively in standard img tags, but Next.js loader might convert it - just a safe fallback */}
                    </div>
                    <div className="grid-item-3" style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
                        <Image src="/green1.jpeg" alt="Abova Look 3" fill style={{ objectFit: 'cover' }} />
                    </div>
                </div>

                {/* GenZ Quote Section */}
                <div className="quote-section" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <p className="quote-text" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                        &quot;Vibes unmatched. Always <span style={{ fontWeight: 600, textTransform: 'uppercase', fontStyle: 'normal', letterSpacing: '0.15em', color: '#ffffff' }}>Abova</span> the noise.&quot;
                    </p>
                    <span style={{ fontSize: '0.75rem', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: '1.5rem' }}>
                        — The New Era
                    </span>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .about-hero {
                    height: 70vh;
                    margin-top: 80px;
                }
                .hero-title {
                    font-size: 8rem;
                    margin-top: 10%;
                }
                .about-container {
                    max-width: 1400px;
                    padding: 6rem 2rem 10rem 2rem;
                    gap: 10rem;
                }
                .intro-section {
                    max-width: 900px;
                }
                .intro-subtitle {
                    font-size: 3.8rem;
                    line-height: 1.4;
                }
                .split-section {
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 6rem;
                }
                .text-content {
                    gap: 2rem;
                    padding: 0 1rem;
                }
                .section-title {
                    font-size: 3rem;
                }
                .quote-section {
                    padding-top: 8rem;
                    padding-bottom: 4rem;
                    gap: 2rem;
                }
                .quote-text {
                    font-size: 3.2rem;
                    max-width: 1000px;
                    line-height: 1.4;
                }

                /* Mobile Adjustments */
                @media (max-width: 768px) {
                    .about-hero {
                        height: 50vh;
                    }
                    .hero-title {
                        font-size: 3rem;
                        margin-top: 0;
                    }
                    .about-container {
                        padding: 3rem 1.5rem 6rem 1.5rem;
                        gap: 5rem;
                    }
                    .intro-subtitle {
                        font-size: 1.8rem;
                        line-height: 1.5;
                    }
                    .split-section {
                        grid-template-columns: 1fr;
                        gap: 3rem;
                    }
                    .text-content {
                        gap: 1.5rem;
                        padding: 0;
                    }
                    .section-title {
                        font-size: 2rem;
                    }
                    .quote-section {
                        padding-top: 5rem;
                        padding-bottom: 2rem;
                    }
                    .quote-text {
                        font-size: 1.8rem;
                        line-height: 1.5;
                    }
                    .editorial-grid {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                        margin-top: 4rem !important;
                    }
                    .grid-item-2 {
                        transform: translateY(0) !important;
                    }
                }
            `}} />
        </main>
    );
}
