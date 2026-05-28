# LingoLand English Kids

Web app học tiếng Anh cho bé, chạy được trên Mac, iPhone qua link tunnel, và có thể deploy lên GitHub Pages.

## Chạy local và iPhone

Double-click:

```text
Run English App.command
```

Shortcut sẽ:

- Cài dependency nếu thiếu.
- Chạy app local trên Mac.
- Mở app trên Mac.
- Copy link iPhone online cố định vào clipboard và hiện popup.

Link iPhone online cố định:

```text
https://trantuan110191.github.io/lingoland-english-kids/
```

Link này không phụ thuộc Terminal hay Cloudflare Tunnel.

## Chạy bằng Terminal

```bash
npm install
npm run dev
```

Mở trên Mac:

```text
http://localhost:5173/
```

Mở cho iPhone cùng Wi-Fi:

```bash
npm run dev:phone
```

## Build

```bash
npm run build
```

File deploy nằm trong thư mục:

```text
dist/
```

## Deploy GitHub Pages

App này là web tĩnh, nên GitHub Pages phục vụ trực tiếp từ branch `main`.

Sau khi sửa local, chạy:

```bash
npm run build
git add .
git commit -m "Update English app"
git push
```

GitHub Pages sẽ tự cập nhật link online từ branch `main`:

```text
https://trantuan110191.github.io/lingoland-english-kids/
```

## Thêm từ vựng

Thêm ảnh vào thư mục đúng chủ đề trong `assets/`, rồi chạy:

```bash
python3 generate_assets_vocabulary.py
```

Tạo/tải lại asset mẫu:

```bash
python3 seed_topic_assets.py
python3 generate_assets_vocabulary.py
```
