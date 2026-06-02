# Recibos propios (branded)

Sistema de recibos propios para los pagos de Stripe, con marca según categoría:

- **Escuela de Perfusión** → cuotas (productos `Pago II–V`, variantes "Pago Parcial" $1,750 y fechada $2,500).
- **Board Latinoamericano de Perfusión** → resto (penalización/donación de $10, suscripción IA, guías).

El ruteo de marca está en `lib/receipts/brands.ts` (`ESCUELA_PRODUCT_IDS` / `ESCUELA_PRICE_IDS`).

## Flujo

1. Stripe dispara el webhook `app/api/webhook/stripe/route.ts`.
2. En `checkout.session.completed` (modo `payment`, pagado) → `sendReceiptForCheckoutSession()`.
   En `invoice.paid` (renovaciones de suscripción) → `sendReceiptForInvoice()`.
3. Se resuelve la marca, se genera el PDF (`lib/receipts/generateReceiptPdf.ts`, pdf-lib)
   y se envía por email (Zoho/nodemailer) con el PDF adjunto.
4. Idempotencia: se marca `receipt_sent=true` en el `metadata` del PaymentIntent,
   así los reintentos del webhook no duplican el correo.

## Variables de entorno (Vercel + .env.local)

```
# SMTP (Zoho)
SMTP_HOST=smtp.zoho.com          # o la IP 204.141.32.56 si hay problemas de DNS
SMTP_PORT=465
SMTP_USER=operaciones@alapescuela.com
SMTP_PASS=********                # ROTAR la contraseña que estaba hardcodeada
SMTP_SERVERNAME=smtp.zoho.com

# Opcionales (reply-to por marca)
ESCUELA_REPLY_TO=operaciones@alapescuela.com
BOARD_REPLY_TO=info@boardlatinoamericanodeperfusion.com

# Ya existentes
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> Las dos marcas envían desde la misma cuenta autenticada (`SMTP_USER`) para mantener
> alineados SPF/DKIM de `alapescuela.com`; solo cambia el nombre visible y el Reply-To.

## Logo

- Board: usa `public/images/board.png` (ya existe).
- Escuela: coloca el logo en **`public/images/alapescuela-logo.png`** (PNG/JPG).
  Si no existe, el PDF usa un encabezado de texto.

## Probar sin enviar correos

```
bun run scripts/preview-receipt.ts
# genera output/receipt-sample-escuela.pdf y output/receipt-sample-board.pdf
```

## Checklist para producción (go-live)

1. **Rotar** la contraseña de Zoho expuesta y cargar `SMTP_PASS` en Vercel.
2. Subir `public/images/alapescuela-logo.png`.
3. Verificar el webhook en Stripe (Developers → Webhooks) escuchando
   `checkout.session.completed` **e** `invoice.paid` hacia `/api/webhook/stripe`.
4. **Apagar los recibos automáticos de Stripe**: Settings → Customer emails →
   "Successful payments" (OFF), para que no llegue el recibo duplicado del Board.
5. Aprobar la plantilla y hacer un envío de prueba a una dirección propia.
6. (Opcional) Hacer privado el repositorio.
