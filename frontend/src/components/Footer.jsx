import React from 'react';
import { Layout } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{ background: '#1c1d1f', color: '#fff', padding: '48px 0 24px 0', marginTop: 'auto' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>MiniLMS for Business</h4>
                    <Link to="#" style={{ fontSize: '0.875rem', color: '#e5e7eb' }}>Teach on MiniLMS</Link>
                    <Link to="#" style={{ fontSize: '0.875rem', color: '#e5e7eb' }}>Get the app</Link>
                    <Link to="#" style={{ fontSize: '0.875rem', color: '#e5e7eb' }}>About us</Link>
                    <Link to="#" style={{ fontSize: '0.875rem', color: '#e5e7eb' }}>Contact us</Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Link to="#" style={{ fontSize: '0.875rem', color: '#e5e7eb' }}>Careers</Link>
                    <Link to="#" style={{ fontSize: '0.875rem', color: '#e5e7eb' }}>Blog</Link>
                    <Link to="#" style={{ fontSize: '0.875rem', color: '#e5e7eb' }}>Help and Support</Link>
                    <Link to="#" style={{ fontSize: '0.875rem', color: '#e5e7eb' }}>Affiliate</Link>
                    <Link to="#" style={{ fontSize: '0.875rem', color: '#e5e7eb' }}>Investors</Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Link to="#" style={{ fontSize: '0.875rem', color: '#e5e7eb' }}>Terms</Link>
                    <Link to="#" style={{ fontSize: '0.875rem', color: '#e5e7eb' }}>Privacy policy</Link>
                    <Link to="#" style={{ fontSize: '0.875rem', color: '#e5e7eb' }}>Cookie settings</Link>
                    <Link to="#" style={{ fontSize: '0.875rem', color: '#e5e7eb' }}>Sitemap</Link>
                    <Link to="#" style={{ fontSize: '0.875rem', color: '#e5e7eb' }}>Accessibility statement</Link>
                </div>
            </div>

            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #3e4143', paddingTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '1.25rem', fontWeight: 700, fontFamily: '"Suisse Works", serif' }}>
                    <Layout size={24} />
                    <span>MiniLMS</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#e5e7eb' }}>
                    &copy; {new Date().getFullYear()} MiniLMS, Inc.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
