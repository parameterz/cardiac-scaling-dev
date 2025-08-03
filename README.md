# Cardiac Scaling Analysis Laboratory

An interactive educational platform for exploring cardiac measurement scaling approaches across different methodologies. This tool provides factual, data-driven comparisons of traditional ratiometric indexing with allometric scaling approaches, allowing users to understand the implications of different scaling choices.

## 🔬 Scientific Framework

The tool implements the scaling theory framework described by Dewey et al. and Gutgesell & Rembold, applied to the comprehensive reference dataset published by Strom et al. from the Multi-Ethnic Study of Atherosclerosis (MESA).

### Four Scaling Approaches
1. **Ratiometric BSA**: Current clinical standard (linear indexing to BSA)
2. **Allometric LBM**: Biological scaling using lean body mass
3. **Allometric BSA**: Geometric scaling using body surface area  
4. **Allometric Height**: Pure geometric scaling using height

### Measurement Categories
- **Linear (1D)**: Dimensions, diameters, thicknesses
- **Area (2D)**: Chamber areas, valve areas, cross-sectional areas
- **Mass/Volume (3D)**: Tissue masses, chamber volumes, flow rates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone [your-repo-url]
cd cardiac-scaling-analysis-laboratory

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Deployment
The built application can be deployed to any static hosting service (Netlify, Vercel, GitHub Pages, etc.).

## 📊 Features

- **Interactive Scaling Comparisons**: Visual comparison of different scaling methodologies
- **Measurement Type Organization**: Analysis grouped by geometric dimensionality (1D/2D/3D)
- **Formula Selection**: Multiple BSA and LBM calculation options
- **Coefficient Derivation**: Transparent implementation of the Dewey methodology
- **Data Export**: CSV export capabilities for further analysis
- **Progressive Disclosure**: Educational tooltips and detailed methodology explanations

## 📚 Data Sources

### Primary Dataset
Strom JB, Zhao Y, Farrell A, et al. Reference Values for Indexed Echocardiographic Chamber Sizes in Older Adults: The Multi-Ethnic Study of Atherosclerosis. *J Am Heart Assoc.* 2024;13:e034029. [doi:10.1161/JAHA.124.034029](https://doi.org/10.1161/JAHA.124.034029)

### Theoretical Framework
Dewey FE, Rosenthal D, Murphy DJ Jr, Froelicher VF, Ashley EA. Does size matter? Clinical applications of scaling cardiac size and function for body size. *Circulation.* 2008;117:2279-2287. [doi:10.1161/CIRCULATIONAHA.107.736785](https://doi.org/10.1161/CIRCULATIONAHA.107.736785)

## ⚠️ Important Disclaimers

**Educational Use Only**: This tool is intended for educational exploration of scaling principles and research purposes only. All data is derivative from published literature. **Not for clinical use** or patient care decisions.

**No Clinical Recommendations**: We are not proposing that derived coefficients be used clinically. All reference data comes from published literature and this analysis is exploratory in nature.

## 🛠️ Technical Architecture

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Pico CSS
- **Charts**: Recharts
- **Body Composition**: Multiple validated formulas (Boer, Hume, Lee, Yu, etc.)

## 📁 Project Structure

```
src/
├── components/          # React components
├── data/               # Data definitions and scaling laws
├── utils/              # Body composition calculations
└── config/             # Version and feature flags
```

## 🤝 Contributing

This is an educational research tool. Issues and suggestions for improvements are welcome.

## 📄 License

[Specify your license here]

## 🔗 Citation

If you use this tool in your research, please cite:

```
[Your citation format here]
Cardiac Scaling Analysis Laboratory. [Year]. 
Available at: [Your deployment URL]
```

---

*Companion analysis for: [Your letter to editor citation]*