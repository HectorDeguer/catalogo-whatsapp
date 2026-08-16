# LA BASE 3D — Catálogo con pedidos por WhatsApp

Sitio estático con:
- Catálogo público (sin registro) con carrito y checkout por WhatsApp.
- Panel `/admin` para cargar productos con fotos (Decap CMS).

## 1. Subir el proyecto a GitHub

```
cd catalogo-whatsapp
git init
git add .
git commit -m "Catálogo inicial"
```

Creá un repositorio nuevo en GitHub y subilo:
```
git remote add origin https://github.com/TU-USUARIO/catalogo-whatsapp.git
git branch -M main
git push -u origin main
```

## 2. Conectar el repo a Netlify

1. En Netlify: **Add new site → Import an existing project → GitHub** y elegí el repo.
2. Build command: `node build.js` (ya viene en `netlify.toml`, no hace falta tocarlo).
3. Publish directory: `.` (ya viene configurado).
4. Deploy site.

## 3. Activar Netlify Identity (para poder loguearte en /admin)

1. En el panel del sitio en Netlify: **Site configuration → Identity → Enable Identity**.
2. En **Identity → Registration**, elegí **Invite only** (así solo vos podés entrar al admin).
3. En **Identity → Services → Git Gateway**, clickeá **Enable Git Gateway**. Esto es lo que le permite al CMS guardar cambios en tu repo sin que necesites un token técnico.
4. En la pestaña **Identity** del panel, **Invite users** → poné tu email. Te va a llegar un mail para crear tu contraseña.

## 4. Entrar al panel

Andá a `https://tu-sitio.netlify.app/admin`, iniciá sesión con el usuario que invitaste, y ya podés:
- Agregar/editar/borrar productos (con foto, precio, categoría, disponibilidad).
- Cambiar el nombre de la tienda y **tu número de WhatsApp** en "Ajustes de la tienda".
- Editar el **aviso previo al pedido** (título y texto) — por defecto dice "Consultanos los días
  de entrega. Coordinamos punto de encuentro en Concepción." Ese aviso aparece como ventana emergente
  la primera vez que alguien abre el carrito, y queda siempre visible arriba del botón de WhatsApp.

Cada vez que guardás algo en el admin, Netlify vuelve a buildear el sitio automáticamente (tarda ~1 minuto) y el catálogo público se actualiza solo.

## 5. Tu número de WhatsApp

En `/admin → Ajustes de la tienda → General`, cargá tu número con código de país, sin `+` ni espacios.
Ejemplo Argentina (Tucumán, código 381): `5493811234567`.

## Cómo funciona el pedido

El visitante arma su carrito y toca "Enviar pedido por WhatsApp". Se abre `wa.me` con el mensaje
ya redactado (productos, cantidades y total) directo a tu número. El visitante solo tiene que
tocar "Enviar" en WhatsApp — no hace falta backend ni API paga de WhatsApp Business.

## Estructura

```
index.html          → catálogo público
css/style.css        → estilos
js/main.js            → carrito + link de WhatsApp
admin/                → panel Decap CMS
data/productos/*.json → un archivo por producto (lo genera el admin)
data/config.json      → nombre de la tienda, whatsapp, etc.
build.js               → junta data/productos/*.json en products.json
```

## Probarlo en tu compu antes de subir

No hace falta Node para nada más que el build. Para ver el sitio local:
```
node build.js
npx serve .
```
(El panel `/admin` no va a funcionar en local porque necesita Git Gateway de Netlify;
para probarlo tenés que verlo ya desplegado.)
