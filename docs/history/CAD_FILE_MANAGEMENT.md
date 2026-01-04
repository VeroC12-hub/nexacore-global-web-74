# CAD File Management Guide

## 📁 **Folder Structure**

```
public/
├── images/portfolio/cad/              # Preview images (JPG/PNG)
│   ├── conveyor-assembly-thumb.jpg    # Featured project thumbnail
│   ├── machine-parts-thumb.jpg        # Featured project thumbnail
│   └── samples/                       # Small sample thumbnails
│       ├── gear-assembly.jpg
│       ├── bracket-design.jpg
│       ├── housing-part.jpg
│       ├── weld-symbol.jpg
│       ├── pcb-layout.jpg
│       └── sheet-metal.jpg
└── downloads/cad/                     # Downloadable CAD files
    ├── conveyor-assembly.dwg          # AutoCAD file
    ├── conveyor-assembly.pdf          # PDF for viewing
    ├── conveyor-assembly.step         # 3D model
    ├── machine-parts.dwg
    ├── machine-parts.pdf
    └── samples/                       # Sample downloads
        ├── gear-assembly.step
        ├── bracket-design.dwg
        ├── housing-part.step
        ├── weld-symbol.pdf
        ├── pcb-layout.pdf
        └── sheet-metal.step
```

## 🔄 **Easy File Updates**

### **To Add New CAD Project:**

1. **Add thumbnail image** to `public/images/portfolio/cad/`
2. **Add CAD files** to `public/downloads/cad/`
3. **Update the data** in `EngineeringTechnical.tsx`:

```javascript
// Edit this section to add new projects:
const cadPortfolioData = {
  featured: [
    {
      id: 'your-new-project',
      title: 'Your New Project Title',
      description: 'Project description here',
      software: 'SolidWorks', // or 'AutoCAD', 'Fusion 360', etc.
      type: '3D Assembly', // or 'Technical Drawing'
      thumbnail: '/images/portfolio/cad/your-project-thumb.jpg',
      files: {
        dwg: '/downloads/cad/your-project.dwg',    // Optional
        pdf: '/downloads/cad/your-project.pdf',    // Required
        step: '/downloads/cad/your-project.step'   // Optional
      }
    }
  ]
};
```

## 📋 **File Format Strategy**

### **Save Both Formats:**
- **DWG files** → For CAD professionals (native AutoCAD)  
- **PDF files** → For viewing/printing (universal)
- **STEP files** → For 3D models (universal CAD exchange)

### **Image Previews:**
- **Size**: 800x600px for featured, 400x400px for samples
- **Format**: JPG (smaller files) or PNG (better quality)
- **Content**: Screenshots from your CAD software showing the model/drawing

## ⚡ **Quick Update Process:**

### **To Replace a CAD File:**
1. Save new file with **same filename** in `/downloads/cad/`
2. Save new thumbnail with **same filename** in `/images/portfolio/cad/`
3. **No code changes needed!** - Files update automatically

### **Example:**
```bash
# Replace conveyor assembly:
# 1. Save: public/downloads/cad/conveyor-assembly.dwg (new file)
# 2. Save: public/images/portfolio/cad/conveyor-assembly-thumb.jpg (new thumbnail)
# 3. Refresh page - done!
```

## 🎯 **Best Practices**

1. **File Naming**: Use lowercase, hyphens for spaces
   - ✅ `gear-assembly.dwg`  
   - ❌ `Gear Assembly.dwg`

2. **Image Optimization**: Compress images for web
   - Featured: < 500KB each
   - Samples: < 200KB each

3. **File Security**: CAD files will be publicly downloadable
   - Only upload files you want to share
   - Remove proprietary information

## 🔧 **Current Portfolio Setup:**

- **2 Featured Projects** (large cards)
- **6 Sample Projects** (small grid)
- **Download buttons** for PDF/DWG/STEP files
- **Software badges** (SolidWorks, AutoCAD, etc.)
- **Hover effects** showing available downloads

## 📞 **Need Help?**
Edit the `cadPortfolioData` object in the code to customize projects, or add files to the folders above!