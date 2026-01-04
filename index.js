const express = require('express')
const fetch = require('node-fetch')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/* ================= KONFIGURASI ================= */
const BOT_TOKEN = 'ISI_TOKEN_BOT_KAMU'
const ADMIN_IDS = ['5555675824'] // bisa tambah admin
const SECRET_KEY = 'xstreamku'
const SHEET_URL = 'ISI_URL_GOOGLE_SHEET_EXEC'

/* ============================================== */

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
      website: req.headers.host || '-',
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
    }

    const waktu = new Date().toLocaleString('id-ID')

    /* 🏷️ TITLE */
    let title = '🛒 ORDER MASUK'
    if (tipe === 'PAID') title = '💰 PEMBAYARAN BERHASIL'
    if (tipe === 'DONE') title = '✅ PESANAN SELESAI'
    if (tipe === 'TEST') title = '🧪 TEST WEBHOOK'

    /* 🔐 MASK PASSWORD */
    const maskedPassword =
      data.password_akun && data.password_akun !== '-'
        ? data.password_akun.slice(0, 2) + '****' + data.password_akun.slice(-2)
        : '-'

    /* 📩 FORMAT TELEGRAM */
    const message = `
${title}

📦 Produk   : ${data.produk}
👤 Nama     : ${data.nama}
📞 Kontak   : ${data.kontak}
🌐 Website  : ${data.website}

🔐 Akun
📧 Email    : ${data.email_akun}
🔑 Password : ${maskedPassword}

🕒 Waktu    : ${waktu}
📌 Status   : ${tipe}
`.trim()

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

    /* 📊 SIMPAN KE GOOGLE SHEETS */
    if (SHEET_URL.startsWith('https')) {
      await fetch(SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waktu,
          status: tipe,
          ...data
        })
      })
    }

    res.send('OK')
  } catch (err) {
    console.error('WEBHOOK ERROR:', err)
    res.send('ERROR')
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('🚀 Webhook PRODUKSI AKTIF')
})
