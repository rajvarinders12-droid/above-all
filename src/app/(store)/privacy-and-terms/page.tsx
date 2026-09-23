import React from 'react';

export default function PrivacyAndTermsPage() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#040404',
            color: 'white',
            padding: '8rem 2rem 4rem',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                lineHeight: '1.8'
            }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    marginBottom: '3rem',
                    textAlign: 'center',
                    letterSpacing: '0.05em'
                }}>PRIVACY & TERMS</h1>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem' }}>Shipping Policy</h2>
                    <p style={{ opacity: 0.8 }}>
                        We process and dispatch all orders with care. Please allow around <strong>4-5 working days</strong> for the delivery of your items once the order is placed. We strive to get your products to you as quickly and securely as possible.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem' }}>Return & Exchange Policy</h2>
                    <p style={{ opacity: 0.8 }}>
                        Customer satisfaction is our priority. We gladly accept exchanges if you have received the wrong size or color of a product. However, please note that we <strong>do not provide refunds</strong>. All exchanges must be initiated promptly after receiving your piece.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem' }}>Privacy Policy</h2>
                    <p style={{ opacity: 0.8, marginBottom: '1rem' }}>
                        Your privacy is critically important to us. We respect your privacy regarding any information we may collect while operating our website.
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', opacity: 0.8, listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '0.5rem' }}>We only ask for personal information when we truly need it to provide a service to you.</li>
                        <li style={{ marginBottom: '0.5rem' }}>We collect it by fair and lawful means, with your knowledge and consent.</li>
                        <li style={{ marginBottom: '0.5rem' }}>We don't share any personally identifying information publicly or with third-parties, except when required to by law.</li>
                        <li style={{ marginBottom: '0.5rem' }}>You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services.</li>
                    </ul>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.5rem' }}>Terms of Service</h2>
                    <p style={{ opacity: 0.8 }}>
                        By accessing our website, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
                    </p>
                </section>
            </div>
        </div>
    );
}
