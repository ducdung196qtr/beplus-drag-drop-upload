# 📁 Project Alpha - Modern Drag & Drop Upload UI (Challenge #65)

> **Submission for MemberFun Challenge #65 (Beplus Agency)**  
> **Score target**: 100/100 points  
> **Design Inspired by**: Robert Kreft (Dribbble/Figma)  
> **Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide Icons

---

## ✨ Features Implemented

### 1. Core Requirements (40%)
- **Drag & Drop Container:** Native HTML5 Drag and Drop events (`dragenter`, `dragover`, `dragleave`, `drop`) with strict `event.preventDefault()` handling.
- **Input File Fallback:** Hidden `<input type="file" multiple />` activated smoothly by clicking anywhere inside the dropzone or on the interactive "Choose files" link.
- **File Meta Information:** Automatic calculation and rendering of human-readable file sizes (`formatFileSize`), MIME types, and file names.
- **Image Previews:** Automatic `URL.createObjectURL(file)` preview rendering for image files, coupled with `URL.revokeObjectURL(url)` cleanup on component unmount and item removal.

### 2. UI / UX Design & Architecture (40%)
- **Robert Kreft Modal Specification:** Pixel-perfect implementation matching the official challenge mockup:
  - Sage/Forest Green brand accents (`#4E8C56`).
  - Sleek pill badges during dragging.
  - Distinct file status cards: PDF, DOCX, and Video (MP4).
  - Clean modal header without cluttered corner close buttons.
  - Action footer: Ghost "Cancel" button and Solid "Import to Alpha" button.

### 3. Bonus Features (20%)
- **Multiple Files:** Full support for dropping or selecting multiple files simultaneously.
- **Upload Progress Simulation:** Realtime progress animation with percentage text and black progress bar.
- **File Removal & Cancel:** Immediate removal of individual files with garbage collection of memory blobs.
- **File Validation:** Size limit check (up to 50MB) and format whitelist checks with helpful toast notifications.

---

## 🚀 Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
