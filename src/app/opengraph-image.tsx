import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'RoTech Development - Professionele Websites & Applicaties op Maat';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #312e81 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.1)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'rgba(139, 92, 246, 0.1)',
          }}
        />

        {/* Code decoration */}
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '60px',
            fontSize: '100px',
            color: 'rgba(99, 102, 241, 0.15)',
            fontFamily: 'monospace',
          }}
        >
          {'</>'}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '100px',
            right: '80px',
            fontSize: '80px',
            color: 'rgba(139, 92, 246, 0.15)',
            fontFamily: 'monospace',
          }}
        >
          {'{}'}
        </div>

        {/* Logo circle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            marginBottom: '30px',
            boxShadow: '0 20px 50px rgba(99, 102, 241, 0.4)',
          }}
        >
          <span
            style={{
              fontSize: '60px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            R
          </span>
        </div>

        {/* Main title */}
        <h1
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: 'white',
            margin: '0 0 20px 0',
            textAlign: 'center',
          }}
        >
          RoTech Development
        </h1>

        {/* Accent line */}
        <div
          style={{
            width: '400px',
            height: '4px',
            background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '2px',
            marginBottom: '25px',
          }}
        />

        {/* Tagline */}
        <p
          style={{
            fontSize: '28px',
            color: '#94a3b8',
            margin: '0 0 40px 0',
            textAlign: 'center',
          }}
        >
          Professionele Websites & Applicaties op Maat
        </p>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '60px',
            marginBottom: '30px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '18px' }}>
            <span style={{ color: '#10b981' }}>✓</span>
            <span>Modern Design</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '18px' }}>
            <span style={{ color: '#10b981' }}>✓</span>
            <span>SEO Geoptimaliseerd</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '18px' }}>
            <span style={{ color: '#10b981' }}>✓</span>
            <span>Snelle Oplevering</span>
          </div>
        </div>

        {/* Website URL */}
        <p
          style={{
            fontSize: '20px',
            color: '#6366f1',
            margin: 0,
          }}
        >
          ro-techdevelopment.dev
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
