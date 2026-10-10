const express = require('express')
const fetch = require('node-fetch')

const app = express()

/* ==============================
   KONFIGURASI
============================== */
const BOT_TOKEN  = '8229069332:AAG_xJtl6ZRMexHENgI_f9uEAd6HnXR3WFA'
const ADMIN_IDS  = ['5555675824']
const SECRET_KEY = 'xstreamku'

/* ==============================
   TELEGRAM
============================== */
async function kirimTelegram(chat_id, text) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text }),
    timeout: 10000
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.ok === false) {
    throw new Error(`chat ${chat_id}: ${res.status} ${data.description || ''}`.trim())
  }
}

/* ==============================
   WEBHOOK
============================== */
app.get('/webhook', async (req, res) => {
  try {
    if (req.query.key !== SECRET_KEY) {
      return res.status(403).send('Forbidden')
    }

    const tipe    = req.query.tipe || 'ORDER'
    const produk  = req.query.produk || '-'
    const nama    = req.query.nama || '-'
    const email   = req.query.email || '-'
    const kontak  = req.query.kontak || '-'
    const link    = req.query.order_url || '-'
    const website = req.query.website || '-'
    const waktu   = new Date().toLocaleString('id-ID')

    const title =
      tipe === 'PAID'
        ? '💰 PEMBAYARAN BERHASIL'
        : '🛒 ORDER MASUK'

    const message = `
${title}

📦 Produk   : ${produk}
👤 Nama     : ${nama}
📞 Telepon  : ${kontak}
📧 Email    : ${email}
🌐 Website  : ${website}
🔗 Link     : ${link}
🕒 Waktu    : ${waktu}
`

    const results = await Promise.allSettled(
      ADMIN_IDS.map(chat_id => kirimTelegram(chat_id, message))
    )

    const gagal = results.filter(r => r.status === 'rejected')
    gagal.forEach(r => console.error('TELEGRAM ERROR', r.reason.message))

    if (gagal.length === results.length) {
      return res.status(502).send('Gagal mengirim ke Telegram')
    }

    res.send('OK')

  } catch (err) {
    console.error('WEBHOOK ERROR', err)
    res.status(500).send('ERROR')
  }
})

/* ==============================
   START SERVER
============================== */
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('✅ Webhook aktif & stabil')
})
