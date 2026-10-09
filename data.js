// ALL YOUR CONTENT LIVES HERE. Edit this file; no need to touch the components.

// Basic character details shown at the top of the sheet.
export const character = {
  name: "Your Name",
  className: "Bioinformatician",
  level: "Level 3 · Undergraduate",
  blurb: "I turn messy biological data into questions worth asking.",
  links: { github: "https://github.com/your-username", email: "mailto:you@example.com" },
};

// "Ability scores": a playful way to show broad strengths (score out of 20).
export const abilities = [
  { name: "Python", score: 17 },
  { name: "Statistics", score: 15 },
  { name: "Biology", score: 14 },
  { name: "ML", score: 14 },
  { name: "R", score: 12 },
  { name: "Writing", score: 13 },
];

// Inventory = skills, grouped like item categories.
export const inventory = [
  { slot: "Weapons", items: ["scikit-learn", "PyTorch", "pandas", "Biopython"] },
  { slot: "Armor", items: ["Git", "Docker", "Unit tests"] },
  { slot: "Potions", items: ["Jupyter", "Nextflow", "SQL", "Matplotlib"] },
  { slot: "Scrolls", items: ["BLAST", "scanpy", "Snakemake"] },
];

// Bookshelf entries. status "done" = completed quest, "active" = spell being cast.
// height (px) and color give each spine its own look.
export const books = [
  { id: 1, title: "Variant Caller", status: "done", height: 190, color: "#6b2d2d",
    summary: "A small pipeline that calls and annotates SNPs from sequencing reads.",
    details: "Built with Snakemake and Biopython. Compared my calls against a reference set.",
    tags: ["Python", "Snakemake"], repo: "https://github.com/your-username/variant-caller" },
  { id: 2, title: "Gene Expression Clusters", status: "done", height: 170, color: "#2d4a3e",
    summary: "Unsupervised clustering of RNA-seq samples to find hidden subtypes.",
    details: "Used PCA, UMAP and k-means; checked cluster stability with bootstrapping.",
    tags: ["scanpy", "ML"], repo: "https://github.com/your-username/expression-clusters" },
  { id: 3, title: "Protein Fold Classifier", status: "done", height: 205, color: "#3a3a6b",
    summary: "A CNN that predicts protein fold families from sequence embeddings.",
    details: "Fine-tuned in PyTorch. Reached solid accuracy; lessons on class imbalance.",
    tags: ["PyTorch", "Proteins"], repo: "https://github.com/your-username/fold-classifier" },
  { id: 4, title: "Single-Cell Atlas", status: "active", height: 185, color: "#7a5a1e",
    summary: "Integrating public single-cell datasets to map cell types across tissues.",
    details: "In progress: batch-correction methods and benchmarking.",
    tags: ["scanpy", "Integration"], repo: "https://github.com/your-username/cell-atlas" },
  { id: 5, title: "Drug-Response Model", status: "active", height: 175, color: "#4b2d6b",
    summary: "Predicting cell-line drug response from genomic features.",
    details: "In progress: comparing regularised regression with gradient boosting.",
    tags: ["scikit-learn", "Stats"], repo: "https://github.com/your-username/drug-response" },
];
