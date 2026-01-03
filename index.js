const express = require('express')
const fetch = require('node-fetch')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ===== KONFIGURASI =====
const BOT_TOKEN = '8229069332:AAG_xJtl6ZRMexHENgI_f9uEAd6HnXR3WFA'
const ADMIN_IDS = ['5555675824'] // tambah admin: ['id1','id2']
const SECRET_KEY = 'xstreamku'
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyIAq9u5_MLY90OY_5FPe7J-CE5Yz922UPc7ebU7VnsiXSLwXTikLd1A32DUvNv1CDv/exec'

// rate limit sederhana (anti spam ringan)
let lastHit = 0
const LIMIT_MS = 1500

app.all('/webhook', async (req, res) => {
  // 🔐 keamanan
  if (req.query.key !== SECRET_KEY) {
    return res.status(403).send('Forbidden')
  }

  // 🛡️ anti spam
  const now = Date.now()
  if (now - lastHit < LIMIT_MS) {
    return res.send('Slow down')
  }
  lastHit = now

  const tipe = req.body.tipe || req.query.tipe || 'ORDER'

  const data = {
    produk: req.body.produk || req.query.produk || '-',
    nama: req.body.nama || req.query.nama || '-',
    kontak: req.body.kontak || req.query.kontak || '-',
    website: req.headers.host || '-',
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  }

  const waktu = new Date().toLocaleString('id-ID')

  let title = '🛒 ORDER MASUK'
  if (tipe === 'KONTAK') title = '📩 PESAN KONTAK'
  if (tipe === 'TEST') title = '🧪 TEST WEBHOOK'

  const message =
`${title}

📦 Produk   : ${data.produk}
👤 Nama     : ${data.nama}
📞 Kontak   : ${data.kontak}
🌐 Website  : ${data.website}
🕒 Waktu    : ${waktu}`

  // 📲 kirim ke semua admin Telegram
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

  // 📊 simpan ke Google Sheets (hanya ORDER)
  if (tipe === 'ORDER' && SHEET_URL.startsWith('https')) {
    await fetch(SHEET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  }

  res.send('OK')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('Webhook produksi aktif')
})


