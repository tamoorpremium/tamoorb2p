import { readdirSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Enable __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// folders to exclude
const exclude = ["node_modules", ".git", "dist", "build", ".next", "out", ".vscode", ".idea"];

function listDir(dir, prefix = "") {
  const items = readdirSync(dir, { withFileTypes: true });

  items.forEach((item, i) => {
    const isLast = i === items.length - 1;
    const connector = isLast ? "└── " : "├── ";

    if (exclude.includes(item.name)) return;

    console.log(prefix + connector + item.name);

    if (item.isDirectory()) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      listDir(path.join(dir, item.name), newPrefix);
    }
  });
}

// start from current directory
listDir(__dirname);
