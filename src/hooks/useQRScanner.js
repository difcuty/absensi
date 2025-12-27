// hooks/useQRScanner.js
import { useRef, useCallback } from 'react'; // Tambahkan useCallback
import { Html5Qrcode } from 'html5-qrcode';

export const useQRScanner = (elementId, onScanSuccess) => {
  const scannerRef = useRef(null);

  // Gunakan useCallback agar fungsi tidak dibuat ulang setiap render
  const startScanner = useCallback(async () => {
    // 1. Cek apakah elemen ada di DOM
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Elemen dengan id ${elementId} belum siap.`);
      return;
    }

    // 2. Hindari duplikasi instance
    if (scannerRef.current?.isScanning) return;

    try {
      scannerRef.current = new Html5Qrcode(elementId);
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 20,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        () => {} 
      );
    } catch (err) {
      console.error("Gagal memulai QR Scanner:", err);
    }
  }, [elementId, onScanSuccess]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("Gagal menghentikan QR Scanner:", err);
      }
    }
  }, []);

  return { startScanner, stopScanner };
};