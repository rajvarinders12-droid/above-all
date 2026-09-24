import FeaturedProducts from '@/components/FeaturedProducts';
import DynamicCategories from '@/components/DynamicCategories';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div style={{ background: '#000000', color: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* 1. Hero Section */}
      <section className="hero-section" style={{
        minHeight: '100vh',
        display: 'flex',
        width: '100%',
        position: 'relative'
      }}>
        {/* Left Side: Content */}
        <div className="hero-content-side" style={{ flex: '1 1 50%', minWidth: 0, backgroundColor: '#080808', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 4rem' }}>
          <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingTop: '80px' }}>
            <div className="hero-eyebrow" style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
              ABOVA — ABOVE ALL
            </div>

            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 4vw, 5rem)', fontWeight: 400, margin: 0, lineHeight: 1.1, color: '#f5f5f5' }}>
              Elevated<br />
              Essentials.
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '450px', margin: 0, fontWeight: 300 }}>
              For every version of you. Timeless pieces engineered from premium fabric, designed to stand above the noise.
            </p>

            <Link href="/products" className="hero-btn" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#ffffff', color: '#000000', textDecoration: 'none',
              fontSize: '0.7rem', letterSpacing: '0.15em', fontWeight: 600,
              padding: '0.85rem 1.75rem', width: 'fit-content',
              textTransform: 'uppercase', transition: 'all 0.3s ease', marginTop: '1.5rem'
            }}>
              DISCOVER COLLECTION <span style={{ marginLeft: '1rem', fontSize: '1.1rem', fontWeight: 400 }}>→</span>
            </Link>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="hero-image-side" style={{
          flex: '1 1 50%',
          minWidth: 0,
          position: 'relative',
          backgroundColor: '#0a0a0a',
          overflow: 'hidden'
        }}>
          <Image
            src="/sample.jpg"
            alt="Hero Background"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            quality={100}
            priority
          />
          {/* Subtle gradient overlay to blend the harsh edge on the image side if needed */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, rgba(8,8,8,0.7) 0%, transparent 15%)', zIndex: 5 }} />
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator" style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', zIndex: 20 }}>
          SCROLL
        </div>

        {/* Local CSS for Hero */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @media (max-width: 900px) {
            .hero-section {
              flex-direction: column !important;
              height: 100vh !important;
              min-height: 100vh !important;
              overflow: hidden;
            }
            .hero-content-side {
              padding: 2rem 2rem !important;
              order: 2;
              flex: 1 1 50% !important;
            }
            .hero-content-side > div {
              padding-top: 0 !important;
              gap: 1.5rem !important;
            }
            .hero-eyebrow {
              display: none !important;
            }
            .hero-image-side {
              order: 1;
              min-height: unset !important;
              height: 50% !important;
              flex: 1 1 50% !important;
              width: 100%;
            }
            .scroll-indicator {
              display: none;
            }
          }
          .hero-btn:hover {
            background: #e0e0e0 !important;
            transform: translateX(5px);
          }
          `
        }} />
      </section>

      {/* 2. Infinite Marquee Image Gallery */}
      <section style={{ padding: '6rem 0 4rem 0', overflow: 'hidden', width: '100%' }}>
        {/* Infinite Marquee Container */}
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <div
            className="marquee-track"
            style={{
              display: 'flex',
              gap: '1.5rem',
              width: 'max-content',
            }}
          >
            {/* Duplicated array for seamless scrolling */}
            {[
              '/1.PNG', '/2.PNG', '/3.PNG', '/4.PNG', '/sample.jpg',
              '/b1.webp', '/b2.webp', '/b3.webp', '/b4.webp', '/b5.webp', '/b6.webp',
              '/black3.jpeg', '/green1.jpeg', '/plain white 1.jpeg', '/white 2.jpeg',
              '/hwhite1.webp', '/hwhite2.webp',
              '/1.PNG', '/2.PNG', '/3.PNG', '/4.PNG', '/sample.jpg',
              '/b1.webp', '/b2.webp', '/b3.webp', '/b4.webp', '/b5.webp', '/b6.webp',
              '/black3.jpeg', '/green1.jpeg', '/plain white 1.jpeg', '/white 2.jpeg',
              '/hwhite1.webp', '/hwhite2.webp'
            ].map((src, i) => (
              <div key={i} style={{
                minWidth: '240px',
                height: '360px',
                borderRadius: '8px',
                background: `url(${src}) center/cover no-repeat`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.8)'
              }} />
            ))}
          </div>
        </div>

        {/* Editorial Statement */}
        <div style={{ textAlign: 'center', marginTop: '4rem', marginBottom: '2rem', padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 4vw, 3.25rem)', fontWeight: 500, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, lineHeight: 1.3 }}>
            Abova isn't just a brand.<br />
            <span style={{ fontWeight: 400, color: '#ffffff' }}>It's a mentality.</span>
          </h2>
        </div>

        {/* Global style injection for marquee animation */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-50% - 0.75rem)); }
          }
          .marquee-track {
            animation: marquee 160s linear infinite;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
        `}} />
      </section>

      {/* 3. Categories Grid */}
      <section style={{ padding: '4rem 2rem 10rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '4rem' }}>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.15em', margin: 0 }}>
            Abova Collection
          </h2>
          <Link href="/collections" style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.4)', paddingBottom: '4px' }}>
            Explore All
          </Link>
        </div>
        <DynamicCategories />
      </section>

      {/* 4. Brand Chapters */}
      <section style={{ padding: '8rem 2rem', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '5rem' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.2em', color: 'var(--text-secondary)' }}>01</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400 }}>Considered</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', fontSize: '0.95rem' }}>Every pattern is cut and refined countless times until the drape is perfect. We obsess over the micro-details so you don't have to.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.2em', color: 'var(--text-secondary)' }}>02</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400 }}>Elevated</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', fontSize: '0.95rem' }}>We source heavyweight, premium organic cottons and custom-milled French terry to ensure structural integrity and longevity.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', letterSpacing: '0.2em', color: 'var(--text-secondary)' }}>03</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', fontWeight: 400 }}>Timeless</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', fontSize: '0.95rem' }}>Unbound by seasonal trends. Our pieces are designed to be the foundational anchors of your wardrobe year after year.</p>
          </div>

        </div>
      </section>

      {/* 5. The Collection (Dynamic Products) */}
      <section style={{ padding: '10rem 2rem', background: '#000000' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', gap: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: 400, margin: 0, lineHeight: 1.1 }}>
              The Collection
            </h2>
            <Link href="/products" style={{ textDecoration: 'none', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '0.8rem 2rem', fontSize: '0.75rem', letterSpacing: '0.1em', transition: 'var(--transition-fast)' }}>
              VIEW ALL
            </Link>
          </div>

          <FeaturedProducts />
        </div>
      </section>

      {/* 6. About Us CTA */}
      <section style={{ padding: '8rem 2rem', background: '#0a0a0a', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6rem' }}>

          {/* Left Text */}
          <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: 400, color: '#fff', marginBottom: '1.5rem', textTransform: 'uppercase', lineHeight: '1.1' }}>
              The Abova<br />Story
            </h2>
            <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.5)', marginBottom: '2rem' }} />
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '2.5rem', maxWidth: '500px' }}>
              <span style={{ fontStyle: 'italic', fontSize: '1.2rem', color: '#fff' }}>"Quality over everything."</span>
              <br /><br />
              At Above All, we keep things simple. We design premium, comfortable essentials that fit beautifully into your everyday life—so you can always look and feel your absolute best.
            </p>
            <Link href="/about" style={{ display: 'inline-block', padding: '1rem 3rem', background: '#ffffff', color: '#000000', textDecoration: 'none', fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 700, transition: 'var(--transition-fast)' }}>
              ABOUT ABOVA
            </Link>
          </div>

          {/* Right Image */}
          <div style={{ flex: '1 1 400px' }}>
            <div style={{
              width: '100%',
              aspectRatio: '16 / 10',
              position: 'relative',
              background: 'url("/about%20cta.jpeg") center/cover no-repeat',
              borderRadius: '2px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            }} />
          </div>

        </div>
      </section>
    </div>
  );
}
