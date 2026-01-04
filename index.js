const express = require('express')
const fetch = require('node-fetch')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/* ==============================
   KONFIGURASI
   ============================== */
const BOT_TOKEN = '8229069332:AAG_xJtl6ZRMexHENgI_f9uEAd6HnXR3WFA'
const ADMIN_IDS = ['5555675824'] // chat_id admin
const SECRET_KEY = 'xstreamku'
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyIAq9u5_MLY90OY_5FPe7J-CE5Yz922UPc7ebU7VnsiXSLwXTikLd1A32DUvNv1CDv/exec' // opsional

/* ==============================
   WEBHOOK
   ============================== */
app.all('/webhook', async (req, res) => {
  try {
    // 🔐 SECURITY
    if (req.query.key !== SECRET_KEY) {
      return res.status(403).send('Forbidden')
    }

    /* ==============================
       AMBIL DATA (AMAN)
       ============================== */
    const tipe    = req.query.tipe || req.body.tipe || 'ORDER'
    const produk  = req.query.produk || req.body.produk || '-'
    const nama    = req.query.nama || req.body.nama || '-'
    const kontak  = req.query.kontak || req.body.kontak || '-'
    const email   = req.query.email || req.body.email || '-'
    const website = req.query.website || req.body.website || req.headers.host || '-'
    const waktu   = new Date().toLocaleString('id-ID')

    /* ==============================
       FORMAT TELEGRAM (FINAL)
       ============================== */
    let title = '💰 PEMBAYARAN BERHASIL'
    if (tipe === 'TEST') title = '🧪 TEST WEBHOOK'
    if (tipe === 'ORDER') title = '🛒 ORDER MASUK'

    const message = `
${title}

📦 Produk   : ${produk}
👤 Nama     : ${nama}
📞 Kontak   : ${kontak}
📧 Email    : ${email}
🌐 Website  : ${website}
🕒 Waktu    : ${waktu}
`

    /* ==============================
       KIRIM KE TELEGRAM
       ============================== */
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

    res.send('OK')

  } catch (err) {
    console.error('WEBHOOK ERROR:', err)
    res.status(500).send('ERROR')
  }
})

/* ==============================
   START SERVER
   ============================== */
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('✅ Webhook aktif & aman')
})
