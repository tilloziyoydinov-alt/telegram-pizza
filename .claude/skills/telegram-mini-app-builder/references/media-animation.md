# Product media & animation options

Offer as a short menu with ⭐ default. Respect `prefers-reduced-motion`, keep each asset small (images ≤150 KB WebP, Lottie ≤100 KB, video loop ≤1 MB, lazy-loaded) — Mini Apps run on weak phones and mobile data.

## Image source
- ⭐ Bepul stok (Unsplash https://unsplash.com, Pexels https://www.pexels.com) — free license; replace with client photos later.
- Mijozning o'z rasmlari — best for trust; ask for square, light background.
- AI generatsiya — fast, consistent style; label as illustrative.
- Transparent PNG/WebP "cut-out" product on colored circle — premium look, consistent cards.

## Animation styles (pick 1–2)
1. ⭐ Micro-interactions: card press scale (0.97), ➕ button bounce, add-to-cart "fly to cart" dot, badge pop. Cheap, big perceived quality. (framer-motion)
2. Hero motion: slow Ken Burns zoom on banner, parallax on scroll.
3. "Jonli" mahsulot: steam/sparkle Lottie overlay on hot food; rotating pizza (CSS rotate on cut-out PNG).
4. Video loop: 3–5 s muted MP4/WebM in product sheet (poster image first).
5. Page transitions: bottom sheet spring, tab cross-fade, skeleton shimmer while loading.
6. Success moment: confetti/Lottie checkmark + haptic `notificationOccurred('success')` after order.

## Palette proposals (examples; adapt to brand)
- Classic food: #E2483D red, #FFB703 yellow, #1F2937 text, white bg.
- Premium: #111111 bg, #C9A227 gold, #F5F5F5 text.
- Fresh/healthy: #2A9D8F green, #E9C46A accent, #264653 text.
Fonts: Inter / Manrope (latin + cyrillic) via next/font.
