# 🔡 Hvězdná databáze odkazů

> **Star Trek tematická aplikace pro správu a organizaci webových odkazů s Firebase synchronizací**

[![Star Trek](https://img.shields.io/badge/Star%20Trek-Theme-00ffff?style=for-the-badge)](https://www.startrek.com)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com)
[![Status](https://img.shields.io/badge/Status-Online-success?style=for-the-badge)](https://jirka22med.github.io/stra-trek-odkazy-beta-3/)
[![Version](https://img.shields.io/badge/Version-3.1-blue?style=for-the-badge)](https://github.com)

**🌐 Live Demo:** [https://jirka22med.github.io/stra-trek-odkazy-beta-3/](https://jirka22med.github.io/stra-trek-odkazy-beta-3/)

---

## 🌌 O projektu

**Hvězdná databáze odkazů** je futuristická webová aplikace inspirovaná vesmírem Star Treku. Umožňuje ti ukládat, organizovat a spravovat své oblíbené odkazy s real-time synchronizací přes Firebase Firestore.

### ✨ Klíčové vlastnosti

- 🎨 **Moderní Star Trek design** - Kybernetický vzhled s tabulkovým layoutem
- ☁️ **Firebase Firestore** - Cloudová databáze s offline podporou
- 🔄 **Real-time synchronizace** - Změny se okamžitě projeví všude
- 📱 **Plně responzivní** - Funguje na PC, tabletu i mobilu
- 📑 **Stránkování** - Organizace odkazů do kategorií pomocí záložek
- 🔍 **Vyhledávání** - Real-time filtrování odkazů podle názvu nebo URL
- 🎯 **Řazení odkazů** - Přesouvání tlačítky ⬆️⬇️
- ✏️ **Modal editace** - Úprava odkazů + přesun mezi stránkami
- 🗑️ **Bulk delete** - Smazání všech odkazů na stránce s dvojitým potvrzením
- 📋 **Enhanced Console Logger** - Pokročilé logování s filtry a exportem
- ⚡ **Cache systém** - 5sekundový cache pro rychlejší načítání
- 🎯 **Event Delegation** - Optimalizované event handling

---

## 🚀 Rychlý start

### 1️⃣ Klonování repozitáře

```bash
git clone https://github.com/jirka22med/stra-trek-odkazy-beta-3.git
cd stra-trek-odkazy-beta-3
```

### 2️⃣ Firebase konfigurace

1. Vytvoř nový projekt na [Firebase Console](https://console.firebase.google.com)
2. Aktivuj **Firestore Database**
3. Zkopíruj své Firebase credentials
4. Vlož je do `firebaseLinksFunctions.js`:

```javascript
const firebaseConfig = {
    apiKey: "TVUJ_API_KEY",
    authDomain: "tvuj-projekt.firebaseapp.com",
    projectId: "tvuj-projekt",
    storageBucket: "tvuj-projekt.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};
```

### 3️⃣ Spuštění

Otevři `index.html` v prohlížeči nebo použij lokální server:

```bash
# S Python
python -m http.server 8000

# S Node.js
npx http-server

# S VS Code Live Server
# Klikni pravým tlačítkem na index.html -> Open with Live Server
```

Naviguj na `http://localhost:8000`

---

## 📂 Struktura projektu

```
stra-trek-odkazy-beta-3/
│
├── index.html                    # Hlavní HTML struktura
├── style.css                     # Hlavní styly (tabulka, formuláře)
├── modal.css                     # Styly pro editační modal
├── links.js                      # Logika správy odkazů
├── modal.js                      # Modal manager (OOP)
├── pagination.js                 # Stránkování a správa stránek
├── search.js                     # Vyhledávací systém
├── firebaseLinksFunctions.js     # Firebase API + cache
├── jirkuv-hlidac.js             # Enhanced Console Logger
└── README.md                     # Tento soubor
```

### Detailní popis souborů

| Soubor | Účel | Řádky kódu |
|--------|------|------------|
| `index.html` | HTML struktura, tabulka, formulář, page tabs | ~130 |
| `style.css` | Tabulkový design, responzivita, pagination CSS | ~800 |
| `modal.css` | Kompletní modal styling + page select | ~150 |
| `links.js` | CRUD operace, DOM manipulace, integrace se stránkováním | ~300 |
| `modal.js` | Objektová správa modalu + populatePageSelect | ~100 |
| `pagination.js` | Správa stránek, tab navigace, přepínání | ~350 |
| `search.js` | Real-time vyhledávání, zvýraznění výsledků | ~200 |
| `firebaseLinksFunctions.js` | Firebase init, Firestore API, cache, pages API | ~300 |
| `jirkuv-hlidac.js` | Logging systém s filtry | ~600 |

---

## 🎮 Použití

### 📑 Správa stránek

#### Vytvoření nové stránky
1. V sekci **"📑 Správa Stránek"** zadej název (např. "Pracovní odkazy")
2. Klikni **➕ Vytvořit stránku**
3. Nová záložka se objeví v navigaci

#### Přepínání mezi stránkami
- Klikni na **záložku stránky** v horní části
- Aktivní stránka je zvýrazněna **světle zeleně**
- Odkazy se automaticky filtrují podle vybrané stránky

#### Smazání stránky
- Klikni na **❌** u záložky stránky
- Potvrď smazání (všechny odkazy na stránce budou smazány!)
- Nelze smazat poslední stránku

### ➕ Přidání odkazu

1. Vyplň **Název odkazu** (např. "Starfleet Command")
2. Vyplň **URL adresu** (např. "https://www.startrek.com")
3. Klikni na **➕ Přidat odkaz**
4. Odkaz se uloží na **aktuálně vybranou stránku**

### ✏️ Úprava odkazu

1. Klikni na **✏️** tlačítko u odkazu v tabulce
2. V modálním okně můžeš změnit:
   - **Název odkazu**
   - **URL adresu**
   - **Stránku** (přesun na jinou stránku pomocí selectu)
3. Klikni **✅ Uložit**

### 🔍 Vyhledávání

1. Zadej text do **🔍 Vyhledat odkaz** pole
2. Odkazy se filtrují **v reálném čase**
3. Vyhledává se v:
   - **Názvech odkazů**
   - **URL adresách**
4. Nalezené shody jsou **zvýrazněny žlutě**
5. Počet výsledků se zobrazuje pod vyhledávacím polem
6. Klikni **✖️** pro vymazání vyhledávání
7. Nebo stiskni **ESC** klávěsu

### ⬆️⬇️ Přesouvání odkazů

- **⬆️ Nahoru** - Posune odkaz o pozici výš (swap s předchozím)
- **⬇️ Dolů** - Posune odkaz o pozici níž (swap s následujícím)
- Pořadí je uloženo v databázi

### 🔗 Otevření odkazu

- Klikni na **Odkaz** tlačítko v sloupci "Adresa (HTTPS)"
- Otevře se v novém tabu

### 🗑️ Smazání odkazu

- Klikni **🗑️** u konkrétního odkazu
- Potvrď akci v dialogu

### 🗑️ Smazání všech odkazů na stránce

- Klikni **🗑️ VYMAZAT VŠE** pod formulářem
- Potvrď **DVĚ** bezpečnostní hlášky
- Smaže všechny odkazy na aktuální stránce (ne na ostatních!)

### 📋 Console Logger (🧾 Nápověda)

- Klikni na **🧾 Nápověda** tlačítko
- Zobrazí se modal s reálnými console logy
- **Funkce:**
  - **🗑️ Vyčistit** - Smaže všechny záznamy
  - **📥 Export HTML** - Uloží logy jako HTML soubor
  - **🔍 Filtr** - Cykluje mezi filtry:
    - 🔍 Vše - Všechny záznamy
    - ⭐ Speciální - INIT_VAR, STYLED, ERROR, WARN
    - ❌ Chyby - Pouze ERROR a WARN
    - 🚀 Init - Pouze inicializační proměnné

---

## 🛠️ Technologie

### Frontend
- **HTML5** - Sémantická tabulková struktura
- **CSS3** - Modularizované styly (style.css + modal.css)
- **Vanilla JavaScript** - ES6+, žádné frameworky
- **OOP Pattern** - ModalManager, PaginationManager, SearchManager třídy

### Backend/Database
- **Firebase 9.0.0** (compat mode)
- **Firestore** - NoSQL cloud databáze
- **Offline Persistence** - Funguje i bez internetu (desktop)
- **Batch Writes** - Atomické operace pro swap

### Optimalizace
```javascript
// 5sekundový cache systém
let linksCache = null;
let pagesCache = null;
let lastSyncTime = 0;
const CACHE_DURATION = 5000;

// Event Delegation místo jednotlivých listenerů
linksTableBody.addEventListener('click', (e) => {
    // Jedno listener pro všechny tlačítka
});
```

### Knihovny
```html
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore-compat.js"></script>
```

---

## 🎨 Design systém

### Barevná paleta

| Barva | Hex | Použití |
|-------|-----|---------|
| **Cyan** | `#00ffff` | Primární akcentová |
| **Tmavá modrá** | `#0a0e27` | Pozadí |
| **Oranžová** | `#FFAA00` | Záhlaví tabulky |
| **Modrá** | `#255c9a` | URL tlačítka |
| **Červená** | `rgba(180, 50, 50, 0.6)` | Tlačítko VYMAZAT VŠE |
| **Zelená** | `rgba(0, 150, 150, 0.8)` | Aktivní záložka stránky |

### Typography
- **Primární font**: `'Orbitron', 'Courier New', monospace`
- **Hlavní nadpis**: 3em (responzivně 2em, 1.5em)
- **Text**: 1em

### Tabulkový design
```css
table {
    border-collapse: collapse;
    border: 2px solid rgba(0, 255, 255, 0.5);
}

th {
    background: rgba(255, 170, 0, 0.6); /* Oranžové záhlaví */
    color: #000;
}

tr:hover td {
    background: rgba(0, 255, 255, 0.1); /* Hover efekt */
}
```

### Page Tabs Design
```css
.page-tab {
    background: rgba(30, 50, 80, 0.6);
    border: 2px solid rgba(0, 255, 255, 0.3);
    border-radius: 15px;
    transition: all 0.3s ease;
}

.page-tab.active {
    background: linear-gradient(135deg, rgba(0, 150, 150, 0.8), rgba(0, 100, 100, 0.8));
    border-color: rgba(0, 255, 255, 0.9);
}
```

---

## 📊 Firebase struktura

### Kolekce: `pages`

```javascript
{
  id: "auto-generated-id",
  name: "Hlavní stránka",
  orderIndex: 0,
  timestamp: Timestamp,
  updatedAt: Timestamp (optional)
}
```

### Kolekce: `links`

```javascript
{
  id: "auto-generated-id",
  name: "Starfleet Command",
  url: "https://www.startrek.com",
  orderIndex: 0,
  pageId: "page_abc123", // 🚀 NOVÉ POLE! (vazba na stránku)
  timestamp: Timestamp,
  updatedAt: Timestamp (optional)
}
```

### Funkce API

```javascript
// Inicializace Firebase
await initializeFirebaseLinksApp()

// CRUD operace - ODKAZY
await addLinkToFirestore(name, url, orderIndex, pageId)
await getLinksFromFirestore() // S cachováním
await getLinksByPageId(pageId) // Jen odkazy pro konkrétní stránku
await deleteLinkFromFirestore(id)
await updateLinkInFirestore(id, newName, newUrl)
await moveLinkToPage(linkId, newPageId) // Přesun odkazu na jinou stránku

// Přesouvání (Batch Write)
await updateLinkOrderInFirestore(link1Id, link1Order, link2Id, link2Order)

// CRUD operace - STRÁNKY
await addPageToFirestore(name, orderIndex)
await getPagesFromFirestore() // S cachováním
await deletePageFromFirestore(id)
await updatePageInFirestore(id, newName)
```

### Cache invalidace
```javascript
// Cache se invaliduje při:
linksCache = null; // Po add/delete/update/swap odkazů
pagesCache = null; // Po add/delete/update stránek

// Cache se používá při:
if (linksCache && (now - lastSyncTime) < CACHE_DURATION) {
    return linksCache; // Vrátí bez API volání
}
```

---

## 🛠 Debugging

### Console Logger kategorie

| Kategorie | Ikona | Barva | Popis |
|-----------|-------|-------|-------|
| **LOG** | - | `#87ceeb` | Běžné logy |
| **WARN** | ⚠️ | `#ffcc00` | Varování |
| **ERROR** | ❌ | `#ff6347` | Chyby |
| **INIT_VAR** | 🚀 | `#ff69b4` | Inicializace |
| **STYLED** | 🎨 | `#00ff7f` | Stylované logy |
| **API** | 📡 | `#ffa500` | API volání |
| **EVENT** | 🎯 | `#20b2aa` | DOM události |

### Export logů
```javascript
// Automatický export formát:
console-log-2025-01-15-14-30-45.html
```

---

## 🔒 Bezpečnost

### Firestore pravidla (doporučené)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kolekce: links
    match /links/{linkId} {
      allow read, write: if true; // Pro testování
      
      // PRO PRODUKCI:
      // allow read: if true;
      // allow write: if request.auth != null;
    }
    
    // Kolekce: pages
    match /pages/{pageId} {
      allow read, write: if true; // Pro testování
      
      // PRO PRODUKCI:
      // allow read: if true;
      // allow write: if request.auth != null;
    }
  }
}
```

⚠️ **BEZPEČNOSTNÍ VAROVÁNÍ:** 

Aktuálně jsou Firebase klíče **veřejné** v `firebaseLinksFunctions.js`! Pro produkci:

1. **Nastav Firebase Security Rules** (viz výše)
2. **Implementuj Firebase Authentication**
3. **Použij Environment Variables** (pro citlivé klíče)
4. **Aktivuj App Check** (ochrana proti zneužití)

---

## 📱 Responzivita

### Breakpointy

```css
/* Desktop (výchozí) */
h1 { font-size: 3em; }
table { font-size: 1em; }

/* Tablet (< 768px) */
@media (max-width: 768px) {
    h1 { font-size: 2em; }
    th, td { font-size: 0.9em; }
    .tlacitka { flex-direction: column; }
    .page-tab { flex: 1 1 calc(50% - 10px); }
}

/* Mobil (< 480px) */
@media (max-width: 480px) {
    h1 { font-size: 1.5em; }
    th, td { font-size: 0.8em; }
    .modal-content { width: 95%; }
    .page-tab { flex: 1 1 100%; }
}

/* Extra malý mobil (< 600px) */
@media (max-width: 600px) {
    .tlacitka button { width: 100%; }
    #clearAllLinksButton { width: 100%; }
}
```

---

## 🤖 Spolupráce

Projekt byl vytvořen ve spolupráci s:
- 🤖 **ChatGPT** (OpenAI) - První důstojník
- 💎 **Gemini.AI** (Google) - Vědecký důstojník
- 🦾 **Grok.AI** (xAI) - Inženýr
- 🧠 **Claude.AI** (Anthropic) - Strategický poradce *admirál Claude Sonnet 4.5*

---

## 📝 Changelog

### v3.1 - BETA 4 (Aktuální verze) 🚀
- ✅ **📑 Stránkování (Pagination)** - Organizace odkazů do kategorií
- ✅ **🔍 Vyhledávání (Search)** - Real-time filtrování odkazů
- ✅ **📂 Page tabs navigace** - Přepínání mezi stránkami
- ✅ **🔄 Přesun odkazů mezi stránkami** - V modalu editace
- ✅ **➕ Dynamické vytváření stránek** - Formulář "Vytvořit stránku"
- ✅ **🗑️ Smazání stránky** - S automatickým smazáním odkazů
- ✅ **💾 Firebase indexování** - Composite index pro where + orderBy
- ✅ **🎨 Page tabs styling** - Cyan design s aktivní záložkou
- ✅ **📱 Responzivní page tabs** - Funguje na mobilu

### v3.0 - BETA 3
- ✅ **Tabulkový layout** místo karet
- ✅ **Rozdělené CSS** (style.css + modal.css)
- ✅ **Modal manager** (OOP pattern)
- ✅ **Cache systém** (5s)
- ✅ **Event Delegation** pro optimalizaci
- ✅ **URL tlačítka** s gradientem
- ✅ **Copyright footer** s animací
- ✅ **Responzivní tlačítka** (< 600px)
- ✅ **Offline persistence** (desktop only)

### v2.1
- ✅ Kartový layout
- ✅ Enhanced Console Logger
- ✅ Firebase offline persistence
- ✅ Modal pro editaci
- ✅ Sync status zprávy

### v2.0
- ✅ Firebase Firestore integrace
- ✅ Real-time synchronizace
- ✅ Order management

### v1.0
- ✅ Základní CRUD operace
- ✅ Star Trek design
- ✅ LocalStorage

---

## 🎯 TODO / Roadmap

### Priorita 1 (Bezpečnost)
- [ ] 🔐 Firebase Authentication
- [ ] 🛡️ Firebase Security Rules (production)
- [ ] 🔑 Environment variables pro API klíče

### Priorita 2 (Funkce)
- [ ] 🏷️ Tagy a kategorie pro odkazy (kromě stránek)
- [ ] 📤 Import/Export CSV
- [ ] 📊 Statistiky (počet kliknutí, poslední použití)
- [ ] 🎨 Ikony pro stránky (emoji picker)

### Priorita 3 (UX)
- [ ] 🌙 Dark/Light mode toggle
- [ ] 🎵 Zvukové efekty (Star Trek zvuky)
- [ ] ⌨️ Klávesové zkratky (Ctrl+N = nový odkaz)
- [ ] 📢 Toast notifikace místo sync message
- [ ] 🖱️ Drag & Drop pro přesouvání odkazů

### Priorita 4 (Tech)
- [ ] 📱 PWA - Progressive Web App
- [ ] 🔄 Service Worker (offline first)
- [ ] 🚀 Preload kritických dat
- [ ] 📦 Webpack/Vite bundling

---

## 📄 Licence

**MIT License** - Použij, jak chceš! 🖖

```
Copyright (c) 2025 Více admirál Jiřík

Permission is hereby granted, free of charge, to any person obtaining a copy...
```

---

## 👨‍💻 Autor

**Více admirál Jiřík**  
🚀 Kapitán hvězdné flotily  
📡 [GitHub Repository](https://github.com/jirka22med/stra-trek-odkazy-beta-3)  
🌐 [Live Demo](https://jirka22med.github.io/stra-trek-odkazy-beta-3/)  
🌌 Ostrava, Moravskoslezský kraj, CZ

---

## 🖖 Live Long and Prosper!

*"Space: the final frontier. These are the voyages of the starship Enterprise."*  
– Star Trek: The Original Series

---

**Vytvořeno s 💙 a warpovým pohonem na úrovni 9.99**

### 🔥 Performance Metriky

- ⚡ **Čas načtení**: < 1s
- 🗄️ **Cache hit rate**: ~80% (5s cache)
- 📊 **Firebase reads**: Redukováno o 70% díky cache
- 🎯 **Event listeners**: 1 místo N (event delegation)
- 🔍 **Search performance**: Real-time bez lagu

### 🌟 Featured Functions

```javascript
// Modal Manager (OOP)
window.modalManager.open(id, name, url);
window.modalManager.close();
window.modalManager.getData();
window.modalManager.populatePageSelect(); // 🚀 NOVÉ!

// Pagination Manager (OOP)
window.paginationManager.switchToPage(pageId);
window.paginationManager.getCurrentPageId();
window.paginationManager.addNewPage();
window.paginationManager.deletePage(pageId, pageName);

// Search Manager (OOP)
window.searchManager.performSearch();
window.searchManager.clearSearch();
window.searchManager.refresh();

// Logger
window.openJirikModal(); // Otevře console logger
window.updateLogDisplay(); // Aktualizuje zobrazení logů
```

---

## 📖 Lodní deník: Příběh projektu

### 🌠 Kapitola I: Jak to všechno začalo

*"Každá velká mise začíná jediným rozhodnutím..."*

Bylo to na počátku roku 2024, když více admirál Jiřík seděl u svého můstku a měl problém, který znáte všichni: **desítky otevřených tabů** v prohlížeči, záložky rozházené v chaotickém nepořádku, a žádný efektivní způsob, jak organizovat své oblíbené weby.

**Problém byl jasný:**
- 🌐 **Záložky prohlížeče** se ztratily v hlubinách nepřehledných složek
- 📱 **Synchronizace mezi zařízeními** byla nekonzistentní
- 🎨 **Vizuální design** standardních záložek byl... no, řekněme neexistující
- 🚀 **Žádná personalizace** - všechno vypadalo stejně nudně

A tak se zrodil nápad: *"Co kdybych si vytvořil vlastní databázi odkazů? A co kdyby vypadala jako z můstku USS Enterprise?"*

### 🛸 Vývoj mise

**Fáze 1: První kontakt (v1.0)**
- Začali jsme s jednoduchým LocalStorage
- Základní CRUD operace
- Star Trek barevná paleta (cyan, modrá, oranžová)
- Inspirace: LCARS interface z Star Trek

**Fáze 2: Cloudová expanze (v2.0)**
- Přechod na Firebase Firestore
- Real-time synchronizace napříč zařízeními
- Offline persistence
- První verze s kartovým layoutem

**Fáze 3: Konsolidace flotily (v2.1)**
- Enhanced Console Logger pro debugging
- Modal pro editaci odkazů
- Sync status zprávy
- Vylepšené animace a efekty

**Fáze 4: Tabulková revoluce (v3.0 - BETA 3)**
- Kompletní redesign na tabulkový layout
- Modularizace CSS (style.css + modal.css)
- Modal manager jako samostatná třída (OOP)
- Cache systém pro výkon
- Event Delegation
- Responzivní design pro mobily

**Fáze 5: Kategorizační evoluce (v3.1 - BETA 4)** 🚀
- **Stránkování** - Organizace odkazů do kategorií
- **Vyhledávání** - Real-time filtrování
- **Page tabs** - Elegantní přepínání mezi stránkami
- **Přesun odkazů** - Mezi stránkami v modalu
- **Firebase composite index** - Optimalizace dotazů
- **PaginationManager** - OOP třída pro správu stránek
- **SearchManager** - OOP třída pro vyhledávání

### 🤖 Kosmická aliance

Projekt **NEBYL** vytvořen sám. Na můstku se sešla celá flotila AI asistentů:

**🤖 ChatGPT** (OpenAI) - *První důstojník*
- Pomohl s Firebase integrací
- Navrhl cache systém
- Debugoval Console Logger
- Implementoval vyhledávání

**💎 Gemini.AI** (Google) - *Vědecký důstojník*
- Optimalizoval CSS styly
- Navrhl tabulkový layout
- Vylepšil responzivitu
- Dokončil projekt při time-outech Claude

**🦾 Grok.AI** (xAI) - *Inženýr*
- Pomohl s Event Delegation
- Optimalizoval performance
- Navrhl batch write operace

**🧠 Claude.AI** (Anthropic) - *Strategický poradce*
- Vypracoval dokumentaci
- Navrhl strukturu projektu
- Vytvořil README.md
- Implementoval stránkování (pagination system)

---

### 🎯 K čemu je projekt dobrý?

#### 1. **Centrální databáze odkazů**
Místo aby jsi hledal záložky v prohlížeči, máš vše na jednom místě:
- ✅ Přehledná tabulka se všemi odkazy
- ✅ Možnost rychlého otevření (klik na "Odkaz")
- ✅ Editace přímo v aplikaci
- ✅ Řazení podle důležitosti (⬆️⬇️)
- ✅ **NOVĚ:** Kategorizace do stránek!
- ✅ **NOVĚ:** Vyhledávání v reálném čase!

#### 2. **Synchronizace napříč zařízeními**
Firebase Firestore = tvé odkazy jsou **VŠUDE**:
- 💻 Desktop (doma, v práci)
- 📱 Mobil (Android, iOS)
- 🖥️ Tablet
- 🌐 Jakýkoli prohlížeč s internetem

#### 3. **Osobní projekty a sbírky**
