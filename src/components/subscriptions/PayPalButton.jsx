/**
 * PayPalButton.jsx
 *
 * Componente de botón PayPal que usa el SDK JS v2 estándar.
 * Funciona tanto en sandbox como en producción.
 *
 * Props:
 *  - amount      {number}         Monto en USD
 *  - planId      {string}         ID del plan (para el campo custom en el backend)
 *  - userId      {string}         ID del usuario (para el campo custom en el backend)
 *  - onSuccess   {function}       Callback cuando el pago fue aprobado y verificado
 *  - onError     {function}       Callback en caso de error
 */
import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

// Precios aproximados en USD (los Hosted Buttons tienen el monto configurado en PayPal)
const PLAN_PRICES_USD = {
  basic:    17.00,   // ~1000 DOP
  pro:      34.00,   // ~2000 DOP
  business: 56.00,   // ~3250 DOP
};

// Client IDs por modo (el ID público de tu cuenta PayPal)
// IMPORTANTE: NO usamos process.env porque en el servidor el dashboard de entorno inyectó accidentalmente un texto truncado (con "..")
const PAYPAL_CLIENT_ID = 'AZwuqUgn-NxmY70zwMCJ4sNIweUr9frhUHux90ciPiSIB6l4MmzF3hvXQcvtR2Z449VgNKBfJsxjTZwz';

const BACKEND_URL = (() => {
  const apiUrl = process.env.REACT_APP_API_URL || '';
  // Si REACT_APP_API_URL termina en /api, quitarlo para obtener la base
  return apiUrl.replace(/\/api\/?$/, '') || 
    (window.location.hostname === 'localhost'
      ? 'http://localhost:3002'
      : 'https://posent-backend.onrender.com');
})();

let sdkLoaded = false;
let sdkLoading = false;
const sdkCallbacks = [];

function loadPayPalSDK() {
  return new Promise((resolve, reject) => {
    if (sdkLoaded && window.paypal) { resolve(window.paypal); return; }

    sdkCallbacks.push({ resolve, reject });
    if (sdkLoading) return;
    sdkLoading = true;

    // Limpiar scripts previos del SDK para evitar conflictos
    const existing = document.querySelectorAll('script[src*="paypal.com/sdk"]');
    existing.forEach(s => s.remove());
    delete window.paypal;

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture&disable-funding=venmo,card`;
    script.async = true;
    script.onload = () => {
      sdkLoaded = true;
      sdkLoading = false;
      sdkCallbacks.forEach(cb => cb.resolve(window.paypal));
      sdkCallbacks.length = 0;
    };
    script.onerror = (e) => {
      sdkLoading = false;
      sdkCallbacks.forEach(cb => cb.reject(new Error('No se pudo cargar el SDK de PayPal')));
      sdkCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

export default function PayPalButton({ amount, planId, userId, onSuccess, onError }) {
  const containerRef = useRef(null);
  const renderedRef = useRef(false);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'processing' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const effectiveAmount = amount || PLAN_PRICES_USD[planId] || 17;

  useEffect(() => {
    let cancelled = false;
    renderedRef.current = false;

    async function init() {
      try {
        const paypal = await loadPayPalSDK();
        if (cancelled || !containerRef.current) return;

        // Limpiar contenedor
        containerRef.current.innerHTML = '';
        renderedRef.current = false;

        await paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'pay',
          },

          // Crear la orden en PayPal
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  currency_code: 'USD',
                  value: effectiveAmount.toFixed(2),
                },
                description: `POSENT - Plan ${planId}`,
                custom_id: `${userId}:${planId}`,
              }],
              application_context: {
                brand_name: 'POSENT',
                user_action: 'PAY_NOW',
                return_url: window.location.href,
                cancel_url: window.location.href,
              }
            });
          },

          // Usuario aprueba el pago en PayPal
          onApprove: async (data, actions) => {
            setStatus('processing');
            try {
              // Capturar el pago
              const capture = await actions.order.capture();
              const orderId = capture.id || data.orderID;

              // Notificar al backend para registrar la suscripción en MongoDB
              const token = localStorage.getItem('token') || sessionStorage.getItem('token');
              let backendOk = false;

              try {
                const res = await fetch(`${BACKEND_URL}/api/paypal/verify-order`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                  },
                  body: JSON.stringify({ orderId, planId })
                });
                const json = await res.json();
                backendOk = json.success;
                if (!backendOk) console.warn('Backend verify-order:', json.message);
              } catch (e) {
                console.warn('No se pudo verificar con el backend:', e.message);
              }

              setStatus('ready');
              if (onSuccess) onSuccess({ orderId, planId, backendOk });

            } catch (err) {
              console.error('Error capturando pago:', err);
              setStatus('error');
              setErrorMsg('Error al procesar el pago. Por favor intenta de nuevo.');
              if (onError) onError(err);
            }
          },

          onError: (err) => {
            console.error('PayPal error:', err);
            setStatus('error');
            const msg = typeof err === 'string' ? err : (err?.message || 'Error en el pago de PayPal');
            setErrorMsg(msg);
            if (onError) onError(err);
          },

          onCancel: () => {
            setStatus('ready');
          }
        }).render(containerRef.current);

        if (!cancelled) {
          renderedRef.current = true;
          setStatus('ready');
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setErrorMsg('No se pudo cargar el botón de PayPal. Verifica tu conexión.');
          console.error('Error iniciando PayPal:', err);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [planId, userId, effectiveAmount]);

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {status === 'loading' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3, gap: 1 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" color="text.secondary">Cargando botón de PayPal...</Typography>
        </Box>
      )}

      {status === 'processing' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3, gap: 1 }}>
          <CircularProgress size={24} color="success" />
          <Typography variant="body2" color="success.main" fontWeight={600}>
            Procesando tu pago…
          </Typography>
        </Box>
      )}

      {status === 'error' && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg || 'Ocurrió un error con PayPal. Por favor recarga la página.'}
        </Alert>
      )}

      {/* Contenedor del botón PayPal — siempre en el DOM */}
      <Box
        ref={containerRef}
        sx={{
          display: (status === 'loading' || status === 'processing') ? 'none' : 'block',
          minHeight: 50,
        }}
      />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', textAlign: 'center', mt: 1 }}
      >
        🔒 Pago 100% seguro procesado por PayPal · {effectiveAmount.toFixed(2)} USD/mes
      </Typography>
    </Box>
  );
}
