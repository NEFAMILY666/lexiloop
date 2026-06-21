# Lexiloop

私人、遊戲化的單字練習網站。支援單筆新增、CSV 批次匯入、瀏覽器英文發音、選擇題、XP、連勝與錯題熟練度。

## 第一次設定

### 1. 建立 Supabase 題庫

1. 在 [Supabase](https://supabase.com/) 建立免費專案。
2. 到 **SQL Editor**，貼上並執行 [`supabase/schema.sql`](supabase/schema.sql)。
3. 在 **Table Editor → allowed_users** 新增一列，把自己的登入信箱填入 `email`。信箱只存在資料庫，不會出現在前端或 GitHub。
4. 到 **Authentication → Providers → Google** 啟用 Google 登入，填入 Google Cloud OAuth Client ID 與 Client Secret。
5. Google OAuth 的 Authorized redirect URI 使用 Supabase 顯示的 callback URL：`https://YOUR_PROJECT.supabase.co/auth/v1/callback`。
6. 到 **Authentication → URL Configuration**，將 GitHub Pages 網址设為 Site URL，並加到 Redirect URLs。

### 2. 設定 GitHub Pages

在 GitHub 專案的 **Settings → Secrets and variables → Actions** 新增：

- `VITE_SUPABASE_URL`：Supabase Project URL
- `VITE_SUPABASE_ANON_KEY`：Supabase 的 publishable/anon key

再到 **Settings → Pages → Build and deployment**，Source 選擇 **GitHub Actions**。推送到 `main` 後會自動部署。

## 匯入格式

CSV 第一列可以是標題，欄位順序如下：

```csv
term,definition,example,part_of_speech,level
serendipity,意外發現美好事物的機緣,Finding this café was pure serendipity.,noun,B2
```

## 本機預覽

```bash
npm install
npm run dev
```

本機未設定 Supabase 時會自動載入示範題庫，方便預覽所有互動。
