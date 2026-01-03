const express = require('express')
const fetch = require('node-fetch')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const BOT_TOKEN = '8229069332:AAH_MNo0F4WGAONJQ4O3Vd6mHtaDG2WztO8'
const ADMIN_ID = '5555675824'

app.all('/webhook', async (req, res) => {
  const data = req.body || {}

  const text =
`🔔 NOTIF WEBSITE
Method: ${req.method}
Data:
${JSON.stringify(data, null, 2)}`

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: ADMIN_ID,
      text
    })
  })

  res.send('OK')
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log('Webhook aktif')
})
