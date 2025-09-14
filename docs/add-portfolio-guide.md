# Portfolio Management Guide

## 🎯 Adding New Portfolio Projects

### Method 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Table Editor → `portfolio_projects`
3. **Click "Insert" → "Insert row"**
4. **Fill in the required fields**:

```json
{
  "title": "Your Project Title",
  "description": "Detailed project description...",
  "short_description": "Brief summary for cards",
  "service_id": "cad-design", // or "ai-ml", "blockchain", "3d-animation", "ecommerce-tech"
  "client_name": "Client Name (optional)",
  "show_client_name": true, // or false for confidential
  "is_featured": true, // shows first with star
  "is_published": true, // must be true to appear on site
  "display_order": 0, // lower numbers appear first
  "challenge": "What problem did you solve?",
  "solution": "How did you solve it?", 
  "results": "What were the outcomes?",
  "project_metrics": {
    "completion_time": "6 weeks",
    "cost_savings": "$50,000",
    "performance_increase": "40%"
  },
  "tags": ["CAD Design", "Engineering", "AutoCAD"],
  "thumbnail_url": "/images/portfolio/project-thumb.jpg"
}
```

### Method 2: Adding Project Files

After creating a project, add files to `portfolio_files` table:

```json
{
  "portfolio_project_id": "your-project-id-here",
  "filename": "project-drawing.dwg",
  "original_filename": "Client_Project_Final_v2.dwg", 
  "file_type": "dwg", // dwg, pdf, step, jpg, mp4, etc.
  "file_category": "cad_file", // cad_file, 3d_model, documentation, image
  "file_path": "/downloads/cad/project-drawing.dwg",
  "file_url": "/downloads/cad/project-drawing.dwg", 
  "file_size_bytes": 2400000,
  "description": "Main assembly drawing with dimensions",
  "software_used": "AutoCAD 2024",
  "is_downloadable": true, // allow downloads
  "is_public": true, // show on public site
  "display_order": 1 // order in file list
}
```

## 🖼️ Image Management

### Where to Store Images:

1. **Project Thumbnails**: `/public/images/portfolio/[service]/[project-name]-thumb.jpg`
2. **Project Gallery**: `/public/images/portfolio/[service]/[project-name]/`
3. **Downloadable Files**: `/public/downloads/[service]/`

### Image Structure Example:
```
public/
├── images/
│   └── portfolio/
│       ├── cad-design/
│       │   ├── robotic-assembly-thumb.jpg
│       │   └── robotic-assembly/
│       │       ├── photo1.jpg
│       │       └── photo2.jpg
│       ├── ai-ml/
│       │   ├── prediction-model-thumb.jpg
│       │   └── prediction-model/
│       └── blockchain/
│           ├── supply-chain-thumb.jpg
│           └── supply-chain/
└── downloads/
    ├── cad/
    │   ├── robotic-assembly.dwg
    │   └── robotic-assembly.pdf
    ├── ai-ml/
    │   └── model-documentation.pdf
    └── blockchain/
        └── smart-contract.sol
```

## 🎨 Image Best Practices

### Thumbnail Images:
- **Size**: 800x600px (4:3 ratio)
- **Format**: JPG (optimized for web)
- **File size**: Under 200KB
- **Naming**: `[project-slug]-thumb.jpg`

### Gallery Images:
- **Size**: 1200x900px max
- **Format**: JPG or PNG
- **File size**: Under 500KB each
- **Naming**: Descriptive names

### File Downloads:
- Keep original filenames when possible
- Organize by service type
- Include file size in database for display

## 🚀 Quick Add Template

Copy this template to quickly add new projects:

```sql
-- Add this in Supabase SQL Editor
INSERT INTO portfolio_projects (
  title, description, short_description, service_id, 
  is_featured, is_published, display_order,
  thumbnail_url, tags
) VALUES (
  'Your Amazing Project',
  'Full description of what you built and achieved...',
  'Quick summary for portfolio cards',
  'cad-design', -- Change to your service
  false, -- Set true for featured
  true,  -- Must be true to show
  10,    -- Display order
  '/images/portfolio/cad-design/your-project-thumb.jpg',
  ARRAY['CAD', 'Engineering', 'SolidWorks']
);
```

## 📱 Testing Your Portfolio

After adding projects:
1. Check your dev server: http://localhost:8082/services/engineering-technical
2. Verify images load correctly
3. Test download links
4. Check mobile responsiveness

Your portfolio system will automatically display new projects on the appropriate service pages!