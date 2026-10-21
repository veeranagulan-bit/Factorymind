# FactoryMind ⚙️🧠

> **Next-gen Industrial AI Co-Pilot & Fleet Intelligence Platform.**  
> Features interactive 3D CNC Digital Twins, 48-channel Acoustic FFT vibration analysis, multi-document RAG knowledge retrieval, real-time voice diagnostics, and autonomous work order generation for precision 5-axis, VMC, and mill-turn machining operations.

---

## 🌟 Key Features

* **Interactive 3D Digital Twins (Three.js / React Three Fiber)**
  * Dedicated kinematics for 5 industrial machines:
    * **Haas VF-2SS**: 3-Axis Vertical Machining Center with direct-drive spindle & tool carousel.
    * **Mazak Integrex i-200**: Mill-Turn Lathe with hydraulic chuck & tilting B-axis milling head.
    * **Okuma Genos M560-V**: Heavy-duty bridge column VMC with ballscrew thermal overload diagnostics.
    * **DMG MORI DMU 50**: 5-Axis simultaneous milling with dual-trunnion rotary table ($\pm 110^\circ$ B-axis, $360^\circ$ C-axis).
    * **Makino a61nx**: Horizontal Machining Center (HMC) with 4-sided rotary tombstone pallet.
    * **Custom / Uploaded Cells**: Articulated 6-axis hybrid robotic machining cell with optical tracking.
  * Spatial component hot-spots with real-time temperature, vibration RMS, and predictive wear telemetry.

* **48-Channel Spindle Acoustic & Vibration FFT Analyzer**
  * Real-time logarithmic frequency spectrogram (100 Hz – 12.8 kHz).
  * Fault detection profiles for:
    * Bearing outer-race spalling (BPFO 2,420 Hz spike)
    * Dynamic endmill chatter & resonant deflection (680 Hz hump)
    * Coolant pump hydraulic cavitation (4,100 Hz hiss)
    * Nominal baseline machining harmonics (120 Hz)
  * Web Audio synthesizer to audition simulated machine acoustic signatures.

* **Multi-Document RAG Knowledge Base & Deep Keyword Search**
  * OCR parsing, 512-token semantic chunking, and BGE-Large vector embeddings stored in Qdrant HNSW graph index.
  * Instant multi-document keyword search (e.g. `overload`, `spindle`, `coolant`) with occurrence counts, page references, and matched keyword highlight markers.

* **Machine Asset Integration Wizard**
  * Upload local OEM documentation (.pdf, .cad, .glb, .wav).
  * 1-Click "Give Me OK" auto-provisions a matching 3D Digital Twin and acoustic FFT profile, or customize kinematics and acoustic peak frequencies.

* **AI Co-Pilot with Voice & 1-Click Work Order Generator**
  * Natural multi-turn maintenance reasoning, voice input via Web Speech API, and instant mute toggle.
  * 1-Click ISO-compliant CMMS maintenance work order generator with parts requisition, safety LOTO protocol, and torque specs.

* **Responsive Adaptation**
  * Phone layout: Touch-friendly targets, mobile bottom navigation bar, and collapsible drawer.
  * Laptop / Desktop layout: 12-column grid, pinned sidebar, and high-density telemetry HUDs.

---

## 🏗️ Architecture

* **Frontend**: React 19, TypeScript, Tailwind CSS, Three.js, React Three Fiber, React Three Drei, Lucide React, Framer Motion
* **Backend**: Spring Boot (Java), PostgreSQL, Redis
* **AI Engine**: FastAPI (Python), Qdrant Vector Database, BGE-Large Embeddings

---

## 🚀 Getting Started

### Prerequisites
* Node.js 18+ & npm
* Docker & Docker Compose (optional for full stack databases)

### Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
cd frontend
npm run build
```

---

## 📄 License
MIT License. Developed for Industrial AI & Autonomous Precision Manufacturing.
