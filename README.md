# OmniDocs - Universal Local File Converter

## English Version

OmniDocs is a powerful, 100% client-side file converter designed for privacy and speed. Every conversion happens directly in your browser using WebAssembly and Javascript engines. No data ever leaves your computer.

### Key Features
- Local Processing: All files are processed on your machine (RAM/CPU). No uploads.
- Universal Support: Convert between common document and image formats.
- Privacy First: Ideal for sensitive documents and private images.
- High Performance: Leverages pdf-lib, mammoth.js, pdfjs-dist, and docx for robust handling.

### Supported Conversions
- Images: PNG, JPG, WEBP (bi-directional).
- Word to PDF: Full multi-page support with mammoth.js.
- PDF to Word: Text extraction and DOCX reconstruction.
- Text/Markdown: Direct conversion to PDF or between text formats.

### Tech Stack
- React + Vite
- Tailwind CSS (Liquid Glass UI)
- Framer Motion (Bento Design)
- WebAssembly-based processing libraries

---

## Version Française

OmniDocs est un convertisseur de fichiers universel, travaillant à 100% côté client pour garantir confidentialité et rapidité. Chaque conversion est effectuée directement dans votre navigateur via WebAssembly et Javascript. Aucune donnée ne quitte votre ordinateur.

### Caractéristiques Principales
- Traitement Local : Les fichiers sont traités via votre RAM/CPU. Aucun téléchargement sur serveur.
- Support Universel : Conversion entre les formats de documents et d'images les plus courants.
- Confidentialité Totale : Idéal pour les documents sensibles et images privées.
- Performance : Utilise pdf-lib, mammoth.js, pdfjs-dist et docx pour une gestion robuste.

### Conversions Supportées
- Images : PNG, JPG, WEBP (bi-directionnel).
- Word vers PDF : Support complet multi-pages avec mammoth.js.
- PDF vers Word : Extraction de texte et reconstruction DOCX.
- Texte/Markdown : Conversion directe vers PDF ou entre formats texte.

### Technologies
- React + Vite
- Tailwind CSS (Interface Liquid Glass)
- Framer Motion (Design Bento)
- Bibliothèques de traitement basées sur WebAssembly

---

### Deployment on Vercel
OmniDocs is optimized for Vercel deployment as a Static Site.
Settings:
- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist
- Node.js Version: 18+
