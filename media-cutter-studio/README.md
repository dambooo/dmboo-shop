# Media Cutter Studio

Browser дээр ажилладаг audio/video cut хийх Next.js project.

## Features

- Audio болон Video файл upload хийх
- Эхлэх болон дуусах хугацаа сонгож тайрах
- Тайрсан файлыг шууд download хийх
- Бүх процесс хэрэглэгчийн browser дотор хийгдэнэ (FFmpeg WASM)

## Run

```bash
npm install
npm run dev
```

Дараа нь `http://localhost:3000` нээнэ.

## Ашиглах заавар

1. `Файл сонгох` товчоор audio/video файлаа оруулна.
2. `Эхлэх`, `Дуусах` range slider-уудаар тайрах хэсгээ сонгоно.
3. `Cut хийх` товч дарна.
4. `Тайрсан файлыг татах` холбоосоор гарсан файлаа авна.

## Тэмдэглэл

- Анхны удаа `Cut хийх` үед FFmpeg engine ачаалах тул бага зэрэг хугацаа орж болно.
- Том файл дээр browser санах ой их ашиглагддаг.
