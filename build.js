// Se ejecuta automáticamente en cada build de Netlify (ver netlify.toml).
// Junta todos los archivos data/productos/*.json (uno por producto, generados
// por el panel admin) en un único products.json que el sitio público consume.
const fs = require("fs");
const path = require("path");

const PRODUCTOS_DIR = path.join(__dirname, "data", "productos");
const OUTPUT_FILE = path.join(__dirname, "products.json");

function build() {
  if (!fs.existsSync(PRODUCTOS_DIR)) {
    fs.writeFileSync(OUTPUT_FILE, "[]");
    console.log("No hay carpeta data/productos todavía. products.json vacío.");
    return;
  }

  const archivos = fs
    .readdirSync(PRODUCTOS_DIR)
    .filter((f) => f.endsWith(".json"));

  const productos = archivos
    .map((archivo) => {
      const contenido = fs.readFileSync(
        path.join(PRODUCTOS_DIR, archivo),
        "utf-8"
      );
      try {
        const data = JSON.parse(contenido);
        data.id = archivo.replace(/\.json$/, "");
        return data;
      } catch (e) {
        console.warn(`No se pudo parsear ${archivo}, se omite.`);
        return null;
      }
    })
    .filter(Boolean);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(productos, null, 2));
  console.log(`products.json generado con ${productos.length} producto(s).`);
}

build();
