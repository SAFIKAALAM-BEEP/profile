// ALL YOUR CONTENT LIVES HERE. Edit this file; no need to touch the components.

// Basic character details shown at the top of the sheet.
export const character = {
  name: "Your Name",
  className: "Bioinformatician",
  level: "Level 3 · Undergraduate",
  blurb: "I turn messy biological data into questions worth asking.",
  links: { github: "https://github.com/your-username", email: "mailto:you@example.com" },
};

// "Backstory": each string becomes one paragraph in the About Me section.
export const about = [
  "I'm a student drawn to the place where biology meets code. I started with wet-lab curiosity and found that most of my questions were really data questions.",
  "These days I build small pipelines and ML models for genomics and protein data, and I like projects where I have to learn the biology as well as the maths.",
  "Outside of class you'll find me running tabletop campaigns and looking for my next dataset to explore.",
];

// "Ability scores": click one on the page to roll a d20 with its modifier.
export const abilities = [
  { name: "Python", score: 17, icon: "🐍" },
  { name: "Statistics", score: 15, icon: "📊" },
  { name: "Biology", score: 14, icon: "🧬" },
  { name: "ML", score: 14, icon: "🧠" },
  { name: "R", score: 12, icon: "📈" },
  { name: "Writing", score: 13, icon: "✒️" },
];

// Inventory = skills, grouped like item categories (each slot has an icon).
export const inventory = [
  { slot: "Weapons", icon: "⚔️", items: ["scikit-learn", "PyTorch", "pandas", "Biopython"] },
  { slot: "Armor", icon: "🛡️", items: ["Git", "Docker", "Unit tests"] },
  { slot: "Potions", icon: "🧪", items: ["Jupyter", "Nextflow", "SQL", "Matplotlib"] },
  { slot: "Scrolls", icon: "📜", items: ["BLAST", "scanpy", "Snakemake"] },
];

// Bookshelf entries. status "done" = completed quest, "active" = spell being cast.
// Spine height is calculated from the title length, so no height is needed here.
// `icon` is the little emblem (decal) stamped on the spine.
export const books = [
  { id: 1, title: "Variant Caller", status: "done", icon: "🧬", color: "#6b2d2d",
    summary: "A small pipeline that calls and annotates SNPs from sequencing reads.",
    details: "Built with Snakemake and Biopython. Compared my calls against a reference set.",
    tags: ["Python", "Snakemake"], repo: "https://github.com/your-username/variant-caller" },
  { id: 2, title: "Gene Expression Clusters", status: "done", icon: "🔬", color: "#2d4a3e",
    summary: "Unsupervised clustering of RNA-seq samples to find hidden subtypes.",
    details: "Used PCA, UMAP and k-means; checked cluster stability with bootstrapping.",
    tags: ["scanpy", "ML"], repo: "https://github.com/your-username/expression-clusters" },
  { id: 3, title: "Protein Fold Classifier", status: "done", icon: "🧠", color: "#3a3a6b",
    summary: "A CNN that predicts protein fold families from sequence embeddings.",
    details: "Fine-tuned in PyTorch. Reached solid accuracy; lessons on class imbalance.",
    tags: ["PyTorch", "Proteins"], repo: "https://github.com/your-username/fold-classifier" },
  { id: 4, title: "Cell Atlas", status: "active", icon: "🌌", color: "#7a5a1e",
    summary: "Integrating public single-cell datasets to map cell types across tissues.",
    details: "In progress: batch-correction methods and benchmarking.",
    tags: ["scanpy", "Integration"], repo: "https://github.com/your-username/cell-atlas" },
  { id: 5, title: "Drug-Response Model", status: "active", icon: "💊", color: "#4b2d6b",
    summary: "Predicting cell-line drug response from genomic features.",
    details: "In progress: comparing regularised regression with gradient boosting.",
    tags: ["scikit-learn", "Stats"], repo: "https://github.com/your-username/drug-response" },
];