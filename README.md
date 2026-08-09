# PINCO — Tasodifiy tanlov

Ishtirokchilar ID raqamlari orasida halol tanlov o'tkazish uchun statik sayt. Hammasi brauzerda ishlaydi — server yo'q, ma'lumot hech qayerga yuborilmaydi.

## Imkoniyatlar

- 1000 tagacha noyob ID (matn sifatida, boshidagi nollar saqlanadi)
- G'oliblar sonini tanlash (+ / − tugmalari)
- `crypto.getRandomValues()` orqali xavfsiz tasodifiy tanlov (siljishsiz — rejection sampling)
- Takrorlanishsiz tanlov
- **Avtomatik istisno**: bir marta g'olib chiqqan ID keyingi tanlovlarda ishtirok etmaydi — bitta odam ikki marta yutolmaydi. Bu faqat yangi ID ro'yxati kiritilganda tozalanadi
- Barcha ishtirokchilar allaqachon g'olib chiqqan bo'lsa, tugma shunchaki o'chiriladi — xato ko'rsatilmaydi
- Ishtirokchilar ro'yxatining SHA-256 xeshi — natijalar keyin almashtirilmaganini tasdiqlaydi
- Natijalarni va xeshni buferga nusxalash
- G'oliblar butun ekran markazida, konfetti animatsiyasi bilan ko'rsatiladi

## Fayllar

- `index.html`
- `styles.css`
- `app.js`
- `pinco-logo.png`

## GitHub Pages'da yangilash

1. GitHub'dagi repozitoriyani oching.
2. `Add file → Upload files`.
3. Barcha 4 faylni tortib tashlang — GitHub mavjudlarini almashtirishni taklif qiladi.
4. `Commit changes` → Pages saytni qayta qurishini kuting (odatda 1–2 daqiqa).
5. **Muhim:** brauzer eski versiyani keshdan ko'rsatishi mumkin. Sahifani albatta qattiq yangilang: `Ctrl/Cmd + Shift + R`, yoki yangi/anonim oynada oching, so'ng tekshiring.
