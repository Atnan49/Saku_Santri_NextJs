'use client';

import { useRouter } from 'next/navigation';
import { Monitor, Smartphone } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#E5E5EA',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '420px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        {/* Apple Style Icon Logo */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '18px',
          backgroundColor: '#007AFF',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#FFFFFF',
          fontSize: '36px',
          fontWeight: 'black',
          boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)'
        }}>
          S
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1C1C1E', letterSpacing: '-0.5px' }}>Saku Santri</h1>
          <p style={{ fontSize: '13px', color: '#8E8E93', marginTop: '6px' }}>Sistem Informasi SPP & Penagihan Iuran Sekolah</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '8px' }}>
          <button 
            onClick={() => router.push('/admin')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#1C1C1E',
              cursor: 'pointer',
              transition: 'background-color 0.15s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F2F2F7')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            <Monitor size={18} style={{ color: '#007AFF' }} />
            <span>Portal Bendahara (Admin macOS)</span>
          </button>

          <button 
            onClick={() => router.push('/wali')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '14px',
              backgroundColor: '#007AFF',
              border: 'none',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'background-color 0.15s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0063CC')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007AFF')}
          >
            <Smartphone size={18} />
            <span>Portal Wali Murid (iOS Web)</span>
          </button>
        </div>

        <div style={{
          borderTop: '1px solid rgba(0,0,0,0.06)',
          paddingTop: '16px',
          width: '100%',
          textAlign: 'center',
          fontSize: '11px',
          color: '#8E8E93'
        }}>
          Saku Santri — Single Tenant Production Ready
        </div>
      </div>
    </div>
  );
}
