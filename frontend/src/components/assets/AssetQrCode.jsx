import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function AssetQrCode({ asset }) {
  const canvasRef = useRef(null);

  const assetUrl = `${window.location.origin}/assets/${asset._id}`;

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${asset.assetTag}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="bg-surface/90 backdrop-blur-md border border-border/80 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
      <div ref={canvasRef} className="shrink-0 p-3 bg-white rounded-xl border border-border/60 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]">
        <QRCodeCanvas value={assetUrl} size={128} level="M" fgColor="#0F172A" bgColor="#FFFFFF" />
      </div>
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-1">Asset QR Code</h3>
        <p className="text-xs text-ink-muted mb-1">Scan to open this asset's detail page.</p>
        <p className="font-mono text-xs text-accent break-all mb-4">{assetUrl}</p>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white hover:bg-accent-hover rounded-lg text-sm font-medium shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download QR
        </button>
      </div>
    </div>
  );
}
