# PINCO — Random Draw

Statik sayt: ishtirokchilar ID raqamlari orasida halol tasodifiy tanlov. Server yo'q, ma'lumot hech qayerga yuborilmaydi. / Static site for a fair random draw among participant IDs. No server, no data leaves the browser. / Статический сайт для честного случайного розыгрыша ID участников. Без сервера, без отправки данных.

## Imkoniyatlar / Features / Возможности

- UZ / RU / ENG interfeys — pastki panelda tanlangan til `localStorage`'da saqlanadi
- 50 000 tagacha noyob ID
- G'oliblar sonini tanlash
- `crypto.getRandomValues()` orqali xavfsiz tasodifiy tanlov (rejection sampling — siljishsiz)
- Takrorlanishsiz tanlov + **avtomatik istisno**: bir marta g'olib chiqqan ID keyingi tanlovlarda ishtirok etmaydi, faqat yangi ro'yxat kiritilganda tozalanadi
- SHA-256 xesh — ro'yxat almashtirilmaganini tasdiqlaydi
- G'oliblar ekran markazida, konfetti animatsiyasi bilan

## Fayllar

- `index.html`
- `styles.css`
- `app.js`
- `pinco-logo.png`

## GitHub Pages'da yangilash

1. Repozitoriyani oching → `Add file → Upload files`.
2. Barcha 4 faylni tortib tashlang (mavjudlarini almashtiradi).
3. `Commit changes` → 1–2 daqiqa kuting.
4. **Muhim:** eski versiya keshda qolishi mumkin — sahifani qattiq yangilang: `Ctrl/Cmd + Shift + R`, yoki yangi anonim oynada tekshiring.
