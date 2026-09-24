import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'ABOVA | Above All';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: '#000000',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <img
                    src="https://theabova.com/abova-logo.png"
                    alt="ABOVA Logo"
                    style={{ width: 500, height: 'auto', objectFit: 'contain' }}
                />
            </div>
        ),
        {
            ...size,
        }
    );
}
