# Baileys Api Server
## _Manajemen Baileys Dengan Mudah_

Baileys Api Server terinspirasi dari kemudahan penggunaan [WPPConnect Server](https://github.com/wppconnect-team/wppconnect-server) oleh [Edgard Lorraine Messias](https://github.com/edgardmessias)

- Banyak sesi
- Generate token/ Api Key
- Menggunakan semua fitur yang dimiliki Baileys

## Features

- Generate Token/ Api Key
- Banyak Sesi
- Membuat Sesi
- Mulai Ulang Sesi/ Mulai Ulang Semua Sesi
- Webhook
- Logout Sesi
- Tutup Sesi
- Otomatis menandai pesan sebagai sudah Dibaca, jika pesan sudah dikirim ke webhook dengan status Ok
- Otomatis kirim pesan yg belum di baca ke Webhook saat Mulai Ulang
- Kirim semua Fitur pesan Baileys

## Maaf
Saya tidak menyertakan dokumentasi, namun anda dapat menggunakan [Postman .json](https://github.com/syifarahmat/baileys.api.server/blob/main/postman.json) yang sudah saya sediakan
Kamu dapat menggunakan [webhook minimal ini](https://github.com/syifarahmat/webhook) untuk mencobanya.

## Penggunaan

    yarn install
    yarn start:nodemon --port 5959 
    yarn start:nodemon --secretKey AKUANAKINDONESIA
    yarn start:nodemon --webhookUrl https://syifarahmat.github.io/

    yarn build
    
