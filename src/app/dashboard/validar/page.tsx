/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useSession, signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { QrCode, CheckCircle2, LogOut } from "lucide-react";
import { Sidebar } from "../../../components/sidebar";
import styles from "./styles.module.css";

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
  const [feedback, setFeedback] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);

  // 🔊 Som + vibração
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
      if (navigator.vibrate) navigator.vibrate(200);
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
    if (scanning) return;
    setScanning(true);
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("reader");
    }

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (w, h) => {
            const min = Math.min(w, h);
            return { width: Math.floor(min * 0.7), height: Math.floor(min * 0.7) };
          },
        },
        async (decodedText) => {
          playFeedback();
          setScannedResult(decodedText);
          await fetchPersonData(decodedText);
          setOpen(true);
          stopScanner();
        },

        (err) => console.warn("Erro ao ler QR:", err)
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

  const [personData, setPersonData] = useState<{ nome?: string; cpf?: string } | null>(null);

const fetchPersonData = async (id: string) => {
  try {
    const res = await fetch(`/api/pessoas/${id}`);
    if (!res.ok) throw new Error("Erro ao buscar dados da pessoa");
    const data = await res.json();
    setPersonData(data);
  } catch (err) {
    console.error(err);
    setPersonData(null);
  }
};


  return (
    <div className="flex min-h-screen bg-gray-50 relative">
      {/* Sidebar visível apenas para admin */}
      {user?.role === "admin" && (
        <div className="hidden md:block">
          <Sidebar />
        </div>
      )}

      {/* Feedback visual no topo */}
      {feedback && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg z-50 animate-fade-in-out">
          {feedback}
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

        {/* 🔹 Novo botão: voltar para login */}
        {!scanning && (
          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Voltar
          </Button>
        )}
      </main>

      {/* 🔹 Modal de confirmação */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl shadow-xl bg-gradient-to-br from-[#f0f0f0] to-[#f0f0f0]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              Confirmar Entrega para {personData?.nome ?? scannedResult}
            </DialogTitle>

            <p className="text-sm text-gray-900 mt-1">
              CPF: {personData?.cpf ?? "Não encontrado"}
            </p>

            {/*<DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              Confirmar Entrega para {scannedResult}
            </DialogTitle>*/}
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
                    personId: scannedResult,
                    delivererId: user?.id,
                  }),
                });

                const data = await res.json();
                if (data.status === "success") {
                  setFeedback("✅ Entrega registrada com sucesso!");
                } else if (data.status === "already_received") {
                  setFeedback("⚠️ Essa pessoa já recebeu neste mês!");
                } else {
                  setFeedback("❌ Erro ao registrar entrega.");
                }

                setOpen(false);
                setTimeout(() => setFeedback(null), 3000); // some em 3 segundos
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
