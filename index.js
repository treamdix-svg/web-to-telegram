const express = require('express')
const fetch = require('node-fetch')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

/* ==============================
   KONFIG
============================== */
const BOT_TOKEN = '8229069332:AAG_xJtl6ZRMexHENgI_f9uEAd6HnXR3WFA'
const ADMIN_IDS = ['5555675824']
const SECRET_KEY = 'xstreamku'
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyIAq9u5_MLY90OY_5FPe7J-CE5Yz922UPc7ebU7VnsiXSLwXTikLd1A32DUvNv1CDv/exec'

/* ==============================
   WEBHOOK
============================== */
app.all('/webhook', async (req, res) => {
  try {
    if (req.query.key !== SECRET_KEY) {
      return res.status(403).send('Forbidden')
    }

    /* ==============================
       TERIMA PESAN
    ============================== */
    const message =
      req.query.message ||
      req.body.message ||
      null

    if (!message) {
      return res.status(400).send('No message')
    }

    /* ==============================
       KIRIM TELEGRAM
    ============================== */
    for (const chat_id of ADMIN_IDS) {
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id,
            text: message
          })
        }
      )
    }

    /* ==============================
       SIMPAN KE GOOGLE SHEET (OPSIONAL)
    ============================== */
    if (SHEET_URL.startsWith('https')) {
      await fetch(SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          website: req.headers.host,
          waktu: new Date().toLocaleString('id-ID')
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
   START
============================== */
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('✅ Webhook aktif')
})
