import { useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';

export const useFaceAI = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * 1. Fungsi untuk memuat model secara berurutan.
   * Pemuatan berurutan (await satu per satu) jauh lebih baik untuk debugging 
   * daripada Promise.all karena kita tahu persis di model mana yang error.
   */
  const loadModels = useCallback(async () => {
    if (isLoaded) return true;

    try {
      const MODEL_URL = '/models';
      console.log("--- Memulai Pemuatan Model AI ---");

      // Load Tiny Face Detector
      console.log("1/3 Sedang memuat Tiny Face Detector...");
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      console.log("✅ Tiny Face Detector Siap");

      // Load Face Landmarks
      console.log("2/3 Sedang memuat Face Landmark 68...");
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      console.log("✅ Face Landmark 68 Siap");

      // Load Face Recognition
      console.log("3/3 Sedang memuat Face Recognition...");
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      console.log("✅ Face Recognition Siap");

      console.log("--- 🚀 SEMUA MODEL BERHASIL DIMUAT ---");
      setIsLoaded(true);
      return true;
    } catch (err) {
      console.group("❌ Gagal Memuat Model AI");
      console.error("Detail Error:", err.message);
      console.warn("Penyebab Umum: File di folder /public/models rusak (corrupt) atau hanya berisi teks HTML GitHub.");
      console.warn("Saran: Unduh ulang file model dan pastikan ukuran face_recognition_model-shard1 sekitar 6.4 MB.");
      console.groupEnd();
      return false;
    }
  }, [isLoaded]);

  /**
   * 2. Fungsi deteksi wajah dengan parameter yang dioptimalkan
   */
  const detectFace = async (videoRef) => {
    if (!videoRef.current) {
      console.warn("⚠️ Deteksi dibatalkan: Video Ref kosong");
      return null;
    }
    
    try {
      // InputSize 128 atau 160 lebih ringan untuk perangkat mobile
      const options = new faceapi.TinyFaceDetectorOptions({ 
        inputSize: 160, 
        scoreThreshold: 0.5 
      });

      const detection = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        console.log("🎯 Wajah terdeteksi!");
      }
      return detection;
    } catch (err) {
      console.error("❌ Terjadi kesalahan saat deteksi:", err);
      return null;
    }
  };

  /**
   * 3. Fungsi mematikan kamera dengan bersih
   */
  const stopCamera = (videoRef) => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => {
        track.stop();
        console.log(`Track ${track.kind} dihentikan.`);
      });
      videoRef.current.srcObject = null;
      console.log("📷 Kamera telah dimatikan sepenuhnya.");
    }
  };

  return {
    isLoaded,
    loadModels,
    detectFace,
    stopCamera
  };
};