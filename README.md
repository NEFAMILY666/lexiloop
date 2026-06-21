# Lexiloop

私人、遊戲化的單字練習網站。支援 Google 登入、單筆新增、CSV 批次匯入、英文發音、選擇題、XP、連勝與熟練度。

## Firebase 第一次設定

### 1. 建立專案與網頁應用程式

1. 在 [Firebase Console](https://console.firebase.google.com/) 建立專案。
2. 在專案首頁點選 **Web（`</>`）** 新增網頁應用程式，不需要啟用 Firebase Hosting。
3. 保留畫面上的 `firebaseConfig`，稍後會把其中四個值加入 GitHub Secrets。

### 2. 啟用 Google 登入

1. 開啟 **Build → Authentication → Get started**。
2. 在 **Sign-in method** 選擇 **Google**，啟用並選擇支援信箱後儲存。
3. 到 Authentication 的 **Settings → Authorized domains**，加入 `nefamily666.github.io`。

### 3. 建立 Firestore 與安全規則

1. 開啟 **Build → Firestore Database → Create database**，選擇 Production mode。
2. 到 **Rules**，用 [`firebase/firestore.rules`](firebase/firestore.rules) 的完整內容取代預設規則並按 **Publish**。
3. 到 **Data** 建立 collection：`allowed_emails`。
4. 每個獲准信箱建立一個 document，**Document ID 直接填該信箱**；加入任意欄位，例如 `active`（boolean）=`true` 後儲存。

白名單信箱只存在 Firestore，安全規則禁止前端讀取或列出白名單。每位使用者也只能存取自己的題庫。

### 4. 設定 GitHub Actions Secrets

到 GitHub 專案的 **Settings → Secrets and variables → Actions** 建立：

| Secret 名稱 | firebaseConfig 對應值 |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

Firebase Web API key 會存在編譯後的網頁中；真正的資料保護由 Authentication 與 Firestore Security Rules 負責。

## 匯入格式

CSV 第一列可以是標題，欄位順序如下：

```csv
term,definition,example,part_of_speech,level
serendipity,意外發現美好事物的機緣,Finding this café was pure serendipity.,noun,B2
```

## 本機預覽

```bash
pnpm install
pnpm run dev
```

本機未設定 Firebase 時會自動載入示範題庫，方便預覽所有互動。
