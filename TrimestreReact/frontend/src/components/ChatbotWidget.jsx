import React, { useState, useRef, useEffect } from 'react';
import { API_URL } from '../context/AuthContext';

const SUGERENCIAS = [
  '¿Cuáles son los paquetes disponibles?',
  '¿Tienen viajes a la playa?',
  '¿Cuánto cuesta un viaje a Cancún?',
  '¿Qué incluye el paquete todo incluido?',
  '¿Hay viajes para familias?',
  '¿Cuál es la mejor temporada para viajar?'
];

const MascotAria = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 42 Q5 30 2 22 Q8 28 15 38 Q10 35 6 30 Q14 36 20 44 Z" fill="#0d6b5e" />
    <path d="M16 38 Q8 26 5 18 Q12 24 18 35 Q14 32 10 26 Q16 32 20 40 Z" fill="#0d6b5e" />
    <path d="M12 34 Q6 22 3 14 Q10 20 16 32 Q12 28 8 22 Q14 28 18 36 Z" fill="#0d6b5e" />
    <path d="M15 36 Q10 26 8 22 Q14 28 18 38 Z" fill="#f4b740" opacity="0.6" />
    <path d="M12 32 Q8 24 6 20 Q10 26 14 34 Z" fill="#f4b740" opacity="0.5" />
    <path d="M82 42 Q95 30 98 22 Q92 28 85 38 Q90 35 94 30 Q86 36 80 44 Z" fill="#0d6b5e" />
    <path d="M84 38 Q92 26 95 18 Q88 24 82 35 Q86 32 90 26 Q84 32 80 40 Z" fill="#0d6b5e" />
    <path d="M88 34 Q94 22 97 14 Q90 20 84 32 Q88 28 92 22 Q86 28 82 36 Z" fill="#0d6b5e" />
    <path d="M85 36 Q90 26 92 22 Q86 28 82 38 Z" fill="#f4b740" opacity="0.6" />
    <path d="M88 32 Q92 24 94 20 Q90 26 86 34 Z" fill="#f4b740" opacity="0.5" />
    <path d="M42 82 L38 96 L44 88 L40 98 L46 90 L44 97 L48 86 L50 95 L50 84 L54 95 L52 86 L56 97 L54 90 L60 98 L56 88 L62 96 L58 82 Z" fill="#0d6b5e" />
    <path d="M44 84 L46 92 L48 86 L50 90 L50 84 L52 90 L52 86 L54 92 L56 84 Z" fill="#f4b740" opacity="0.5" />
    <ellipse cx="50" cy="55" rx="22" ry="24" fill="#1a5c59" />
    <ellipse cx="50" cy="60" rx="14" ry="16" fill="#f4b740" />
    <ellipse cx="50" cy="57" rx="10" ry="12" fill="#fcd34d" />
    <circle cx="50" cy="32" r="16" fill="#1a5c59" />
    <path d="M34 28 Q50 18 66 28" fill="#073f3d" stroke="#073f3d" strokeWidth="1" />
    <rect x="36" y="24" width="28" height="6" rx="2" fill="#073f3d" />
    <rect x="36" y="28" width="28" height="3" rx="1" fill="#f4b740" />
    <path d="M42 24 Q50 20 58 24" fill="#073f3d" />
    <ellipse cx="50" cy="23" rx="6" ry="3" fill="#073f3d" />
    <circle cx="50" cy="25" r="2" fill="#f4b740" />
    <ellipse cx="42" cy="34" rx="5" ry="5.5" fill="white" />
    <ellipse cx="58" cy="34" rx="5" ry="5.5" fill="white" />
    <circle cx="43" cy="34" r="3" fill="#073f3d" />
    <circle cx="59" cy="34" r="3" fill="#073f3d" />
    <circle cx="44.5" cy="32.5" r="1.2" fill="white" />
    <circle cx="60.5" cy="32.5" r="1.2" fill="white" />
    <path d="M46 39 L50 47 L54 39 Q50 41 46 39 Z" fill="#f59e0b" />
    <path d="M47 39.5 L50 44 L53 39.5 Q50 41.5 47 39.5 Z" fill="#d97706" opacity="0.4" />
    <path d="M44 78 L42 90 M42 90 L38 92 M42 90 L44 93" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M56 78 L58 90 M58 90 L54 92 M58 90 L60 93" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
);

export const ChatbotWidget = () => {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [animado, setAnimado] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  useEffect(() => {
    if (abierto && inputRef.current) {
      inputRef.current.focus();
    }
  }, [abierto]);

  useEffect(() => {
    if (abierto && mensajes.length === 0) {
      const timer = setTimeout(() => {
        setAnimado(true);
        setTimeout(() => {
          setMensajes([{
            id: 1,
            tipo: 'bot',
            texto: '¡Hola! Soy Aria, tu asistente de viajes de Horizonte Viajes. Como un colibrí, viajo rápido para ayudarte a encontrar el viaje perfecto. ¿En qué puedo ayudarte hoy?',
            hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          }]);
        }, 800);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [abierto, mensajes.length]);

  const enviarMensaje = async (texto = input) => {
    if (!texto.trim() || enviando) return;
    const mensajeUsuario = {
      id: Date.now(),
      tipo: 'usuario',
      texto: texto.trim(),
      hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
    setMensajes(prev => [...prev, mensajeUsuario]);
    setInput('');
    setEnviando(true);
    try {
      const respuesta = await fetch(API_URL + '/chatbot/publico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto.trim() })
      });
      if (respuesta.ok) {
        const data = await respuesta.json();
        setMensajes(prev => [...prev, {
          id: Date.now() + 1,
          tipo: 'bot',
          texto: data.respuesta || data.mensaje || 'Lo siento, no pude procesar tu mensaje.',
          hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        setMensajes(prev => [...prev, {
          id: Date.now() + 1,
          tipo: 'bot',
          texto: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
          hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch {
      setMensajes(prev => [...prev, {
        id: Date.now() + 1,
        tipo: 'bot',
        texto: 'No pude conectar con el servidor. Verifica tu conexión e intenta de nuevo.',
        hora: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  const handleSugerencia = (sug) => {
    enviarMensaje(sug);
  };

  return (
    <>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.85; }
        }
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes tooltipPulse {
          0%, 100% { opacity: 1; transform: translateY(0) scale(1); }
          50% { opacity: 0.9; transform: translateY(-2px) scale(1.02); }
        }

        .chatbot-button {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #073f3d, #1a5c59);
          border: 3px solid #f4b740;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 24px rgba(7, 63, 61, 0.4);
          z-index: 9999;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          animation: pulse 2s ease-in-out infinite;
        }
        .chatbot-button:hover {
          transform: scale(1.1);
          box-shadow: 0 8px 32px rgba(7, 63, 61, 0.55);
        }
        .chatbot-button .close-x {
          color: white;
          font-size: 26px;
          font-weight: 700;
          line-height: 1;
          transition: transform 0.3s ease;
        }

        .chatbot-tooltip {
          position: fixed;
          bottom: 170px;
          right: 24px;
          background: white;
          border-radius: 16px;
          padding: 14px 18px;
          box-shadow: 0 6px 24px rgba(7, 63, 61, 0.25);
          z-index: 9998;
          animation: tooltipPulse 2.5s ease-in-out infinite;
          max-width: 220px;
        }
        .chatbot-tooltip::after {
          content: '';
          position: absolute;
          bottom: -10px;
          right: 24px;
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 10px solid white;
        }
        .chatbot-tooltip-title {
          font-size: 14px;
          font-weight: 700;
          color: #073f3d;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .chatbot-tooltip-sub {
          font-size: 12px;
          color: #666;
        }

        .chatbot-window {
          position: fixed;
          bottom: 168px;
          right: 24px;
          width: 320px;
          height: 420px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(7, 63, 61, 0.3);
          display: flex;
          flex-direction: column;
          z-index: 10000;
          overflow: hidden;
          animation: slideUp 0.35s ease-out;
          border: 1px solid rgba(7, 63, 61, 0.1);
        }

        .chatbot-header {
          background: linear-gradient(135deg, #073f3d, #1a5c59);
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .chatbot-header-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(244, 183, 64, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(244, 183, 64, 0.3);
          flex-shrink: 0;
        }
        .chatbot-header-info {
          flex: 1;
        }
        .chatbot-header-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .chatbot-header-name {
          color: white;
          font-size: 18px;
          font-weight: 700;
        }
        .chatbot-header-badge {
          background: #f4b740;
          color: #073f3d;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 10px;
        }
        .chatbot-header-status {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 2px;
        }
        .chatbot-header-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          animation: pulse 1.5s ease-in-out infinite;
        }
        .chatbot-header-status-text {
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
        }
        .chatbot-header-close {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .chatbot-header-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .chatbot-messages {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #f8fafb;
        }
        .chatbot-messages::-webkit-scrollbar {
          width: 5px;
        }
        .chatbot-messages::-webkit-scrollbar-thumb {
          background: #c4c4c4;
          border-radius: 10px;
        }

        .chatbot-msg {
          display: flex;
          gap: 8px;
          animation: fadeInUp 0.3s ease-out;
          max-width: 85%;
        }
        .chatbot-msg.usuario {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        .chatbot-msg.bot {
          align-self: flex-start;
        }

        .chatbot-msg-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 10px;
          font-weight: 700;
        }
        .chatbot-msg-avatar.bot-avatar {
          background: linear-gradient(135deg, #073f3d, #1a5c59);
          border: 2px solid #f4b740;
          padding: 2px;
        }
        .chatbot-msg-avatar.user-avatar {
          background: linear-gradient(135deg, #073f3d, #1a5c59);
          color: white;
        }

        .chatbot-msg-bubble {
          padding: 8px 12px;
          max-width: 220px;
          font-size: 13px;
          line-height: 1.45;
          word-break: break-word;
        }
        .chatbot-msg-bubble.bot-bubble {
          background: white;
          color: #1a1a1a;
          border: 1px solid #e5e7eb;
          border-bottom-left-radius: 4px;
        }
        .chatbot-msg-bubble.user-bubble {
          background: linear-gradient(135deg, #073f3d, #1a5c59);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .chatbot-msg-hora {
          font-size: 10px;
          color: #999;
          margin-top: 4px;
        }
        .chatbot-msg-hora.user-hora {
          text-align: right;
          color: rgba(255, 255, 255, 0.6);
        }

        .chatbot-typing {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 16px 8px;
          animation: fadeIn 0.3s ease-out;
        }
        .chatbot-typing-dots {
          display: flex;
          gap: 4px;
          background: white;
          border: 1px solid #e5e7eb;
          padding: 10px 16px;
          border-radius: 16px;
          border-bottom-left-radius: 4px;
        }
        .chatbot-typing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #073f3d;
        }
        .chatbot-typing-dot:nth-child(1) { animation: typing 1.2s infinite 0s; }
        .chatbot-typing-dot:nth-child(2) { animation: typing 1.2s infinite 0.2s; }
        .chatbot-typing-dot:nth-child(3) { animation: typing 1.2s infinite 0.4s; }

        .chatbot-sugerencias {
          padding: 8px 16px 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          background: #f8fafb;
          border-top: 1px solid #f0f0f0;
          animation: fadeInUp 0.4s ease-out;
        }
        .chatbot-sugerencia-btn {
          background: white;
          border: 1px solid #073f3d;
          color: #073f3d;
          padding: 7px 13px;
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .chatbot-sugerencia-btn:hover {
          background: #073f3d;
          color: white;
          transform: scale(1.03);
        }

        .chatbot-input-area {
          padding: 12px 16px;
          display: flex;
          gap: 8px;
          align-items: center;
          border-top: 1px solid #e5e7eb;
          background: white;
          flex-shrink: 0;
        }
        .chatbot-input {
          flex: 1;
          border: 2px solid #e5e7eb;
          border-radius: 24px;
          padding: 10px 18px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .chatbot-input:focus {
          border-color: #073f3d;
        }
        .chatbot-input::placeholder {
          color: #aaa;
        }
        .chatbot-send {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(135deg, #073f3d, #1a5c59);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, opacity 0.2s;
          flex-shrink: 0;
          font-size: 18px;
        }
        .chatbot-send:hover {
          transform: scale(1.08);
        }
        .chatbot-send:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .chatbot-footer {
          padding: 8px 16px;
          text-align: center;
          font-size: 10px;
          color: #999;
          background: white;
          border-top: 1px solid #f0f0f0;
          flex-shrink: 0;
        }
      `}</style>

      {!abierto && (
        <div className="chatbot-tooltip" onClick={() => setAbierto(true)}>
          <div className="chatbot-tooltip-title">
            <MascotAria size={22} />
            ¡Hola! Soy Aria
          </div>
          <div className="chatbot-tooltip-sub">Preguntame lo que quieras</div>
        </div>
      )}

      <button
        className="chatbot-button"
        onClick={() => setAbierto(!abierto)}
        aria-label={abierto ? 'Cerrar chat' : 'Abrir chat'}
      >
        {abierto ? (
          <span className="close-x">×</span>
        ) : (
              <MascotAria size={28} />
        )}
      </button>

      {abierto && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-avatar">
              <MascotAria size={30} />
            </div>
            <div className="chatbot-header-info">
              <div className="chatbot-header-name-row">
                <span className="chatbot-header-name">Aria</span>
                <span className="chatbot-header-badge">IA</span>
              </div>
              <div className="chatbot-header-status">
                <div className="chatbot-header-dot"></div>
                <span className="chatbot-header-status-text">En línea</span>
              </div>
            </div>
            <button className="chatbot-header-close" onClick={() => setAbierto(false)}>
              ×
            </button>
          </div>

          <div className="chatbot-messages">
            {mensajes.map((msg) => (
              <div key={msg.id} className={`chatbot-msg ${msg.tipo}`}>
                {msg.tipo === 'bot' ? (
                  <div className="chatbot-msg-avatar bot-avatar">
                    <MascotAria size={20} />
                  </div>
                ) : (
                  <div className="chatbot-msg-avatar user-avatar">Tu</div>
                )}
                <div>
                  <div className={`chatbot-msg-bubble ${msg.tipo === 'bot' ? 'bot-bubble' : 'user-bubble'}`}>
                    {msg.texto}
                  </div>
                  <div className={`chatbot-msg-hora ${msg.tipo === 'usuario' ? 'user-hora' : ''}`}>
                    {msg.hora}
                  </div>
                </div>
              </div>
            ))}
            {enviando && (
              <div className="chatbot-typing">
                <div className="chatbot-msg-avatar bot-avatar">
                  <MascotAria size={20} />
                </div>
                <div className="chatbot-typing-dots">
                  <div className="chatbot-typing-dot"></div>
                  <div className="chatbot-typing-dot"></div>
                  <div className="chatbot-typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {mensajes.length === 1 && (
            <div className="chatbot-sugerencias">
              {SUGERENCIAS.map((sug, i) => (
                <button
                  key={i}
                  className="chatbot-sugerencia-btn"
                  onClick={() => handleSugerencia(sug)}
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              className="chatbot-input"
              type="text"
              placeholder="Preguntale a Aria..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={enviando}
            />
            <button
              className="chatbot-send"
              onClick={() => enviarMensaje()}
              disabled={!input.trim() || enviando}
              aria-label="Enviar mensaje"
            >
              {enviando ? '⏳' : '➤'}
            </button>
          </div>

          <div className="chatbot-footer">
            Aria por Horizonte Viajes - Asistente con IA
          </div>
        </div>
      )}
    </>
  );
};
