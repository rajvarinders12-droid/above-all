'use client';

import { Menu, X, Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const cartCount = useCartStore((state) => state.getCartCount());
    const { user, isAdmin, initialize } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    // Search States
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [isFetchingProducts, setIsFetchingProducts] = useState(false);

    // Categories for Navbar Menu
    const [navCategories, setNavCategories] = useState<{ id: string, name: string }[]>([]);

    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setMounted(true);

        initialize();
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);

        // Prevent scrolling on the main page when menu or search is open
        if (menuOpen || searchOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        const fetchCategories = async () => {
            if (navCategories.length > 0) return;
            try {
                const snap = await getDocs(collection(db, 'categories'));
                const cats = snap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
                cats.sort((a, b) => a.name.localeCompare(b.name));
                setNavCategories(cats);
            } catch (err) {
                console.error("Error fetching categories for navbar", err);
            }
        };

        if (menuOpen) {
            fetchCategories();
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [menuOpen, searchOpen, navCategories.length, initialize]);

    // Fetch products once when search is opened
    useEffect(() => {
        if (searchOpen && products.length === 0 && !isFetchingProducts) {
            setIsFetchingProducts(true);
            const fetchProducts = async () => {
                try {
                    const querySnapshot = await getDocs(collection(db, 'products'));
                    const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setProducts(fetched);
                } catch (error) {
                    console.error("Error fetching products for search", error);
                } finally {
                    setIsFetchingProducts(false);
                }
            };
            fetchProducts();
        }

        if (searchOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [searchOpen, products.length, isFetchingProducts]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredProducts([]);
        } else {
            const query = searchQuery.toLowerCase();
            const results = products.filter(p =>
                (p.name && p.name.toLowerCase().includes(query)) ||
                (p.category && p.category.toLowerCase().includes(query))
            );
            setFilteredProducts(results);
        }
    }, [searchQuery, products]);

    const navLinks = [
        { label: 'HOME', href: '/' },
        { label: 'SHOP', href: '/' },
        { label: 'NEW ARRIVALS', href: '/' },
        { label: 'CAMPAIGNS', href: '/' },
        { label: 'ABOUT', href: '/' },
    ];

    return (
        <>
            {/* Main Navbar */}
            <nav style={{
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 50,
                padding: '1.25rem clamp(1rem, 4vw, 2rem)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.4s ease',
                background: scrolled || menuOpen ? '#000000' : 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
                borderBottom: 'none',
                color: '#ffffff'
            }}>
                {/* Menu Toggle */}
                <div
                    onClick={() => setMenuOpen(!menuOpen)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 400, cursor: 'pointer', zIndex: 60 }}
                >
                    <div style={{ position: 'relative', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={22} strokeWidth={1} style={{ position: 'absolute', opacity: menuOpen ? 1 : 0, transform: menuOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'all 0.5s cubic-bezier(0.85, 0, 0.15, 1)' }} />
                        <Menu size={22} strokeWidth={1} style={{ position: 'absolute', opacity: menuOpen ? 0 : 1, transform: menuOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'all 0.5s cubic-bezier(0.85, 0, 0.15, 1)' }} />
                    </div>
                    <span style={{ transition: 'opacity 0.3s' }}>{menuOpen ? 'CLOSE' : 'MENU'}</span>
                </div>

                {/* Logo */}
                <div style={{ zIndex: 60, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                    <Link href="/" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Image
                            src="/loader.webp"
                            alt="Above All Logo"
                            width={140}
                            height={45}
                            style={{ objectFit: 'contain' }}
                            priority
                            unoptimized
                        />
                    </Link>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'clamp(1rem, 3vw, 2rem)', fontSize: '0.7rem', letterSpacing: '0.15em', fontWeight: 400, textTransform: 'uppercase', zIndex: 60, justifyContent: 'flex-end', flex: 1, minWidth: 0 }}>
                    <span onClick={() => setSearchOpen(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} className="nav-hidden-mobile menu-link-hover">
                        Search
                    </span>
                    {mounted && user ? (
                        <>
                            {isAdmin && (
                                <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center' }} className="nav-hidden-mobile">
                                    Admin
                                </Link>
                            )}
                            <Link href="/account" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center' }} className="nav-hidden-mobile">
                                Account
                            </Link>
                        </>
                    ) : (
                        mounted && (
                            <Link href="/login" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center' }} className="nav-hidden-mobile">
                                Login
                            </Link>
                        )
                    )}
                    <Link href="/cart" onClick={() => setMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#fff', whiteSpace: 'nowrap' }}>
                        Cart ({mounted ? cartCount : 0})
                    </Link>
                </div>
            </nav>

            <div className="menu-overlay" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100vh',
                background: '#0a0a0a',
                zIndex: 45, // Below the navbar explicit z-index
                pointerEvents: menuOpen ? 'auto' : 'none',
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? 'translateY(0)' : 'translateY(-10px)',
                visibility: menuOpen ? 'visible' : 'hidden',
                transition: 'all 0.5s cubic-bezier(0.85, 0, 0.15, 1)',
            }}>
                <div className="menu-container" style={{
                    width: '100%',
                    maxWidth: '1400px',
                    margin: '0 auto',
                    height: '80vh',
                }}>
                    {/* Left Column: Main Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            opacity: menuOpen ? 1 : 0,
                            transform: menuOpen ? 'translateY(0)' : 'translateY(40px)',
                            transition: menuOpen ? `all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s` : 'all 0.3s ease',
                        }}>
                            <Link
                                href={'/products'}
                                onClick={() => setMenuOpen(false)}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    textDecoration: 'none',
                                    color: '#fff',
                                    width: '100%',
                                }}
                                className="main-menu-link"
                            >
                                <span className="menu-link-text">
                                    All Pieces
                                </span>
                                <span style={{
                                    fontSize: '0.75rem',
                                    letterSpacing: '0.2em',
                                    color: 'rgba(255,255,255,0.5)',
                                    fontFamily: 'sans-serif'
                                }}>
                                    01
                                </span>
                            </Link>
                        </div>
                        {navCategories.map((cat, index) => (
                            <div key={cat.id} style={{
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                opacity: menuOpen ? 1 : 0,
                                transform: menuOpen ? 'translateY(0)' : 'translateY(40px)',
                                transition: menuOpen ? `all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.2 + ((index + 1) * 0.1)}s` : 'all 0.3s ease',
                            }}>
                                <Link
                                    href={`/category/${cat.name.toLowerCase().replace(/\\s+/g, '-')}`}
                                    onClick={() => setMenuOpen(false)}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        textDecoration: 'none',
                                        color: '#fff',
                                        width: '100%',
                                    }}
                                    className="main-menu-link"
                                >
                                    <span className="menu-link-text">
                                        {cat.name}
                                    </span>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        letterSpacing: '0.2em',
                                        color: 'rgba(255,255,255,0.5)',
                                        fontFamily: 'sans-serif'
                                    }}>
                                        {(index + 2).toString().padStart(2, '0')}
                                    </span>
                                </Link>
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Secondary Links & Footer */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        paddingTop: '2.5rem',
                        opacity: menuOpen ? 1 : 0,
                        transform: menuOpen ? 'translateX(0)' : 'translateX(20px)',
                        transition: menuOpen ? 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s' : 'all 0.3s ease',
                    }}>
                        <div className="secondary-links-row" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', rowGap: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', letterSpacing: '0.15em' }}>
                            <Link href="/about" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.3s ease' }} className="hover-white">ABOUT US</Link>
                            <span style={{ opacity: 0.3 }}>•</span>

                            {mounted && user ? (
                                <>
                                    {isAdmin && (
                                        <>
                                            <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.3s ease' }} className="hover-white">ADMIN DASHBOARD</Link>
                                            <span style={{ opacity: 0.3 }}>•</span>
                                        </>
                                    )}
                                    <Link href="/account" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.3s ease' }} className="hover-white">ACCOUNT</Link>
                                    <span style={{ opacity: 0.3 }}>•</span>
                                </>
                            ) : mounted ? (
                                <>
                                    <Link href="/login" onClick={() => setMenuOpen(false)} style={{ textDecoration: 'none', color: 'inherit', transition: 'color 0.3s ease' }} className="hover-white">LOGIN / REGISTER</Link>
                                    <span style={{ opacity: 0.3 }}>•</span>
                                </>
                            ) : null}

                            {/* Social Icons within the flow */}
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <Link href="https://instagram.com" target="_blank" className="hover-white" style={{ color: 'inherit', transition: 'color 0.3s ease', display: 'flex' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                </Link>
                                <span style={{ opacity: 0.3 }}>•</span>
                                <Link href="https://wa.me/" target="_blank" className="hover-white" style={{ color: 'inherit', transition: 'color 0.3s ease', display: 'flex' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                </Link>
                            </div>
                        </div>

                        <div style={{
                            color: 'rgba(255,255,255,0.6)',
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.25rem',
                            lineHeight: '1.5',
                            maxWidth: '280px',
                            paddingBottom: '2.5rem'
                        }}>
                            Elevated essentials, designed for every version of you.
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Screen Search Overlay */}
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
                background: 'rgba(0,0,0,0.98)', zIndex: 55, // Between nav elements and menu
                opacity: searchOpen ? 1 : 0, pointerEvents: searchOpen ? 'auto' : 'none',
                visibility: searchOpen ? 'visible' : 'hidden',
                transition: 'all 0.4s cubic-bezier(0.85, 0, 0.15, 1)',
                display: 'flex', flexDirection: 'column', paddingTop: '120px', paddingBottom: '40px'
            }}>
                <div style={{
                    position: 'absolute', top: '1.25rem', right: '2rem', cursor: 'pointer',
                    fontSize: '0.75rem', letterSpacing: '0.15em', display: 'flex',
                    alignItems: 'center', gap: '0.5rem', zIndex: 60
                }} onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                    CLOSE <X size={20} strokeWidth={1} />
                </div>

                <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '0 2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>

                    <div style={{ position: 'relative', width: '100%', marginBottom: '3rem' }}>
                        <SearchIcon size={24} style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} strokeWidth={1} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="WHAT ARE YOU LOOKING FOR?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', top: 0, left: 0, background: 'transparent',
                                border: 'none', borderBottom: '1px solid rgba(255,255,255,0.2)',
                                padding: '1rem 1rem 1rem 3rem', fontSize: '1.5rem', color: '#fff',
                                fontFamily: 'var(--font-serif)', outline: 'none', transition: 'border-color 0.3s'
                            }}
                            onFocus={(e) => e.target.style.borderBottom = '1px solid white'}
                            onBlur={(e) => e.target.style.borderBottom = '1px solid rgba(255,255,255,0.2)'}
                        />
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '2rem' }}>
                        {isFetchingProducts ? (
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>Loading catalog...</p>
                        ) : searchQuery.trim() !== '' && filteredProducts.length === 0 ? (
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>NO RESULTS FOUND</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '2rem' }}>
                                {filteredProducts.map((product) => (
                                    <Link href={`/product/${product.id}`} key={product.id} onClick={() => setSearchOpen(false)} style={{ textDecoration: 'none', color: '#fff', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="menu-link-hover">
                                        <div style={{ width: '100%', aspectRatio: '3/4', backgroundColor: '#111', position: 'relative', overflow: 'hidden' }}>
                                            {product.mainImageUrl ? (
                                                <Image src={product.mainImageUrl} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="200vw" />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>NO IMAGE</div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.05em', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h4>
                                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>₹{product.price || product.actualPrice}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Global style injections for hover classes locally */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .menu-overlay {
                    display: flex;
                    align-items: center;
                    padding: 0 4rem;
                    padding-top: 80px;
                }
                .menu-container {
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 4rem;
                }
                .main-menu-link {
                    transition: color 0.3s ease;
                    padding: 2.5rem 0;
                }
                .main-menu-link:hover {
                    color: var(--text-secondary);
                }
                .menu-link-text {
                    font-family: var(--font-serif);
                    font-size: clamp(2rem, 4vw, 3.5rem);
                    font-weight: 400;
                    letter-spacing: 0.02em;
                }
                .hover-white:hover {
                    color: #ffffff !important;
                }
                .menu-link-hover:hover {
                    color: var(--text-secondary) !important;
                }
                
                /* Splash Screen Reveal Animation */
                .splash-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100vh;
                    background-color: #000000;
                    z-index: 55;
                    animation: splashFade 2.5s cubic-bezier(0.77, 0, 0.175, 1) forwards;
                }

                .logo-anim-wrapper {
                    animation: splashLogo 2.5s cubic-bezier(0.77, 0, 0.175, 1) forwards;
                }

                @keyframes splashFade {
                    0% { opacity: 1; pointer-events: auto; }
                    40% { opacity: 1; pointer-events: auto; }
                    90% { opacity: 0; visibility: hidden; pointer-events: none; }
                    100% { opacity: 0; visibility: hidden; pointer-events: none; }
                }

                @keyframes splashLogo {
                    0% { transform: translate(-50%, 45vh) scale(3.5); }
                    30% { transform: translate(-50%, 45vh) scale(3.5); }
                    90% { transform: translate(-50%, 0) scale(1); }
                    100% { transform: translate(-50%, 0) scale(1); }
                }

                @media (max-width: 768px) {
                    @keyframes splashLogo {
                        0% { transform: translate(-50%, 40vh) scale(2); }
                        30% { transform: translate(-50%, 40vh) scale(2); }
                        90% { transform: translate(-50%, 0) scale(1); }
                        100% { transform: translate(-50%, 0) scale(1); }
                    }
                }
                .menu-sublink {
                    color: var(--text-tertiary);
                    text-decoration: none;
                    font-size: 0.8rem;
                    letter-spacing: 0.15em;
                    transition: color 0.3s ease;
                }
                .menu-sublink:hover {
                    color: var(--text-primary);
                }
                @media (max-width: 900px) {
                    .menu-overlay {
                        padding: 0 1.5rem;
                        padding-top: 100px;
                        align-items: flex-start;
                        overflow-y: auto;
                    }
                    .menu-container {
                        grid-template-columns: 1fr;
                        height: auto !important;
                        gap: 2.5rem;
                        padding-bottom: 6rem;
                    }
                    .main-menu-link {
                        padding: 1.5rem 0;
                    }
                    .menu-link-text {
                        font-size: 1.8rem;
                    }
                }
                @media (max-width: 768px) {
                    .nav-hidden-mobile {
                        display: none !important;
                    }
                }
            `}} />
        </>
    );
}
