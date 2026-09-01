# 🎨 Bitigey Design Studio — Next-Gen Multi-Layer Vector & Graphic Editor

<div align="center">

[![Author](https://img.shields.io/badge/Author-Tunahan_Haksever-8b5cf6?style=for-the-badge&logo=github&logoColor=white)](https://github.com/tunahanhaksever)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Launch_Studio-00f2fe?style=for-the-badge&logo=googlechrome&logoColor=black)](https://tunahanhaksever.github.io/bitigey-design-studio/)
[![Tusi Lang](https://img.shields.io/badge/Language-Tusi_Lang_(.tusi)-e11d48?style=for-the-badge&logo=codeforces&logoColor=white)](https://tunahanhaksever.github.io/tusi-lang/)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)
[![Languages](https://img.shields.io/badge/Stack-JavaScript_%7C_TypeScript_%7C_Python_%7C_Tusi_%7C_C-f59e0b?style=for-the-badge)](https://tunahanhaksever.github.io/bitigey-design-studio/)
[![Platform](https://img.shields.io/badge/Platform-Web_/_Desktop_PWA-3b82f6?style=for-the-badge)](https://tunahanhaksever.github.io/bitigey-design-studio/)

**Tarayıcı üzerinde çalışan, çok katmanlı (multi-layer) vektör çizim motoru, lüks tipografi atölyesi, piksel düzeyinde görsel filtreleme, hazır sosyal medya ve yayın şablonları, C/WASM filtre çekirdeği ve Python otomasyon CLI modülü içeren hepsi bir arada grafik tasarım stüdyosu.**

[🚀 Canlı Web Uygulamasını Başlat](https://tunahanhaksever.github.io/bitigey-design-studio/) • [✨ Yetenekler](#-temel-özellikler) • [🛠️ Mimari & Çoklu Dil Yapısı](#-teknik-mimari--diller) • [💾 Dışa Aktarma](#-dışa-aktarma-formatları) • [🇹🇷 Tunahan Haksever](#-geliştirici-ve-vizyon)

</div>

---

## 🌟 Temel Özellikler

| Modül | Açıklama |
| :--- | :--- |
| 🥞 **Çok Katmanlı (Multi-Layer) Tuval** | Katman sırasını değiştirme (Öne getir / Arkaya gönder), kilitleme, görünürlük açma/kapama, opaklık (opacity) ve harmanlama (blend mode) kontrolleri. |
| ✒️ **Vektör & Geometrik Şekiller** | Dikdörtgen, yumuşak köşeli kartlar, elips, yıldız, çokgen, oklar, serbest fırça ve kaligrafi kalemi (Dolgu, Kenarlık, Gölge ve Blur). |
| 🔤 **Lüks Tipografi & Font Stüdyosu** | Seçkin yazı tipleri (*Cinzel, Playfair Display, Outfit, Inter, JetBrains Mono*), harf aralığı (letter-spacing), satır aralığı, altın degrade dolgu ve metin gölgeleri. |
| 🎛️ **Profesyonel Görsel Filtre Motoru** | Parlaklık, Kontrast, Doygunluk, Renk Tonu (Hue-Rotate), Sepya, Siyah-Beyaz (Monochrome), Film Grain ve Cyberpunk renk profilleri. |
| 📐 **Akıllı Tuval Boyutları & Şablonlar** | Instagram Post (1:1), Story/Reels (9:16), YouTube Thumbnail (16:9), Twitter/X Banner ve Edebi Kitap Kapağı önayarları. |
| 🔄 **Sınırsız Geçmiş (Undo / Redo)** | `Ctrl + Z` ve `Ctrl + Y` ile sınırsız geçmiş adımı. |
| 💾 **JSON Proje Kaydetme & Yükleme** | Tasarımları `.bitigey.json` formatında kaydedip dilediğiniz zaman tarayıcıya geri yükleyerek düzenlemeye devam etme. |

---

## 🛠️ Teknik Mimari & Diller (Multi-Language Stack)

Proje hem web üzerinde sıfır sunucu gecikmesiyle çalışmakta hem de arka planda güçlü bir çoklu dil mimarisi barındırmaktadır:

- **JavaScript (ES6+) & HTML5 Canvas 2D:** Hızlı, reaktif ve dokunsal kullanıcı arayüzü motoru.
- **TypeScript:** Vektör matematiği, nesne modelleri ve katman durumları için güçlü tip tanımları (`src/types/design.d.ts`).
- **C & WebAssembly (WASM):** Piksel matrisi dönüşümleri, konvolüsyon ve hızlı filtre işleme motoru (`wasm/filters.c`).
- **Python:** Komut satırından toplu görsel boyutlandırma, filigran ekleme ve render otomasyonu sağlayan CLI modülü (`cli/bitigey_batch_processor.py`).

---

## 💾 Dışa Aktarma Formatları

- **Ultra HD PNG:** Şeffaf veya opak arkaplanlı pikselsiz dışa aktarım.
- **JPG:** Optimize edilmiş sıkıştırma ve kalite ayarı.
- **SVG:** Vektörel ölçeklenebilir format.
- **JSON:** Proje durumunu saklayan düzenlenebilir kaynak dosyası.

---

## 🚀 Hızlı Başlangıç

### Web Üzerinden Çalıştırma
```bash
# 1. Depoyu klonlayın
git clone https://github.com/tunahanhaksever/bitigey-design-studio.git

# 2. Dizin içine girin
cd bitigey-design-studio

# 3. index.html dosyasını doğrudan tarayıcınızda açın!
```

### Python CLI Otomasyonunu Kullanma
```bash
# Toplu görsel işleme ve filigran ekleme
python cli/bitigey_batch_processor.py --input ./images --output ./processed --brightness 1.2 --contrast 1.1
```

---

## 👨‍💻 Geliştirici ve Vizyon

**Tunahan Haksever**, kullanıcı deneyimi odaklı görsel araçlar, tarayıcı tabanlı editörler ve bağımsız yazılım sistemleri geliştiren yazılımcı ve yazardır.

- **GitHub:** [@tunahanhaksever](https://github.com/tunahanhaksever)
- **Ekosistem:** [bitigey.com](https://bitigey.com)
- **Proje:** Bitigey Design Studio

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır. Copyright (c) 2026 Tunahan Haksever.
