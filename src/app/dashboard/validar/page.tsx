/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { QrCode, CheckCircle2 } from "lucide-react";
import { Sidebar } from "../../../components/sidebar";
import styles from "./styles.module.css";

// 🔹 Criamos um tipo para extender a sessão do NextAuth
type CustomUser = {
  id?: number;
  role?: string;
  name?: string;
  email?: string;
};

export default function ValidarPage() {
  const { data: session } = useSession();
  const user = session?.user as CustomUser | undefined;

  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);

  // 🔊 Beep + vibração
  const playFeedback = () => {
    try {
      const audioCtx =
        new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);

      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    } catch (err) {
      console.warn("Erro ao tocar feedback:", err);
    }
  };

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignora se já estiver parado
      }
      setScanning(false);
    }
  }, [scanning]);

  const startScanner = useCallback(async () => {
    if (scanning) return; // 🚫 já está rodando
    setScanning(true);

    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("reader");
    }

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
            return {
              width: Math.floor(minEdgeSize * 0.7),
              height: Math.floor(minEdgeSize * 0.7),
            };
          },
        },
        (decodedText) => {
          playFeedback();
          setScannedResult(decodedText);
          setOpen(true);
          stopScanner();
        },
        (errorMessage) => {
          console.warn("Erro ao ler QR Code:", errorMessage);
        }
      );
    } catch (err) {
      console.error("Erro ao iniciar câmera:", err);
      setScanning(false);
    }
  }, [scanning, stopScanner]);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  useEffect(() => {
    if (!open) {
      setScannedResult(null);
      stopScanner().then(() => startScanner());
    }
  }, [open, stopScanner, startScanner]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar só aparece se o usuário for admin */}
      {user?.role === "admin" && (
        <div className="hidden md:block">
          <Sidebar />
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6">
        <div className="text-center mb-6 px-2">
          <QrCode className="w-14 h-14 md:w-16 md:h-16 mx-auto text-green-600" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mt-2">
            Leitor de QR Code
          </h1>
          <p className="text-gray-500 text-sm md:text-base">
            Aponte a câmera para o QR Code da carteirinha
          </p>
        </div>

        <div
          id="reader"
          className={`w-full max-w-sm md:max-w-md lg:max-w-lg rounded-xl shadow-lg overflow-hidden border border-gray-200 ${styles.scanner}`}
        />
        {!scanning && (
  <Button onClick={startScanner} className="mb-4">
    Ativar Câmera
  </Button>
)}

      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              Confirmar Entrega para {scannedResult}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-6 w-full sm:w-auto"
              onClick={async () => {
                if (!scannedResult) return;

                const res = await fetch("/api/deliveries/scan", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    personId: scannedResult, // o QR já contém o ID
                    delivererId: user?.id, // opcional, quem entregou
                  }),
                });

                const data = await res.json();
                if (data.status === "success") {
                  alert("Entrega registrada com sucesso ✅");
                } else if (data.status === "already_received") {
                  alert("⚠️ Essa pessoa já recebeu neste mês!");
                } else {
                  alert("Erro ao registrar entrega.");
                }
                setOpen(false);
              }}
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
