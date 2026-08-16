(function () {
  "use strict";

  let productos = [];
  let config = {
    nombre_tienda: "LA BASE 3D",
    bajada: "",
    whatsapp: "",
    mensaje_saludo: "Hola! Quiero hacer este pedido:",
    aviso_titulo: "Antes de confirmar",
    aviso_texto: "",
  };
  let categoriaActiva = "Todos";
  let avisoYaVisto = false;
  const carrito = {}; // { id: { producto, cantidad } }

  const el = {
    grilla: document.getElementById("grilla"),
    filtros: document.getElementById("filtros"),
    sinProductos: document.getElementById("sin-productos"),
    nombreTienda: document.getElementById("nombre-tienda"),
    bajadaTienda: document.getElementById("bajada-tienda"),
    contadorCarrito: document.getElementById("contador-carrito"),
    btnAbrirCarrito: document.getElementById("btn-abrir-carrito"),
    btnCerrarCarrito: document.getElementById("btn-cerrar-carrito"),
    overlay: document.getElementById("overlay-carrito"),
    panelCarrito: document.getElementById("panel-carrito"),
    listaCarrito: document.getElementById("lista-carrito"),
    totalCarrito: document.getElementById("total-carrito"),
    btnWhatsapp: document.getElementById("btn-enviar-whatsapp"),
    avisoTitulo: document.getElementById("aviso-titulo"),
    avisoTexto: document.getElementById("aviso-texto"),
    overlayAviso: document.getElementById("overlay-aviso"),
    modalAviso: document.getElementById("modal-aviso"),
    modalAvisoTitulo: document.getElementById("modal-aviso-titulo"),
    modalAvisoTexto: document.getElementById("modal-aviso-texto"),
    btnCerrarAviso: document.getElementById("btn-cerrar-aviso"),
  };

  function formatoPrecio(num) {
    return "$" + Number(num).toLocaleString("es-AR");
  }

  async function cargarDatos() {
    try {
      const [resProductos, resConfig] = await Promise.all([
        fetch("/products.json", { cache: "no-store" }),
        fetch("/data/config.json", { cache: "no-store" }),
      ]);
      productos = resProductos.ok ? await resProductos.json() : [];
      if (resConfig.ok) config = { ...config, ...(await resConfig.json()) };
    } catch (e) {
      console.error("No se pudieron cargar los datos del catálogo", e);
      productos = [];
    }
    aplicarConfig();
    renderFiltros();
    renderGrilla();
  }

  function aplicarConfig() {
    document.title = config.nombre_tienda;
    el.nombreTienda.textContent = config.nombre_tienda;
    el.bajadaTienda.textContent = config.bajada || "";
    if (config.aviso_titulo) {
      el.avisoTitulo.textContent = config.aviso_titulo;
      el.modalAvisoTitulo.textContent = config.aviso_titulo;
    }
    if (config.aviso_texto) {
      el.avisoTexto.textContent = config.aviso_texto;
      el.modalAvisoTexto.textContent = config.aviso_texto;
    }
  }

  function renderFiltros() {
    const categorias = ["Todos", ...new Set(productos.map((p) => p.categoria).filter(Boolean))];
    el.filtros.innerHTML = "";
    categorias.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "filtro-chip" + (cat === categoriaActiva ? " activo" : "");
      btn.textContent = cat;
      btn.addEventListener("click", () => {
        categoriaActiva = cat;
        renderFiltros();
        renderGrilla();
      });
      el.filtros.appendChild(btn);
    });
    el.filtros.hidden = categorias.length <= 1;
  }

  function renderGrilla() {
    const visibles = productos.filter(
      (p) => categoriaActiva === "Todos" || p.categoria === categoriaActiva
    );

    el.grilla.innerHTML = "";
    el.sinProductos.hidden = productos.length > 0;

    visibles.forEach((p) => {
      const card = document.createElement("article");
      card.className = "tarjeta";
      card.innerHTML = `
        <div class="tarjeta__foto-wrap">
          <img class="tarjeta__foto" src="${p.foto || ""}" alt="${p.nombre}" loading="lazy">
          <span class="tarjeta__precio">${formatoPrecio(p.precio)}</span>
          ${p.disponible === false ? '<span class="tarjeta__agotado">Sin stock</span>' : ""}
        </div>
        <div class="tarjeta__cuerpo">
          ${p.categoria ? `<span class="tarjeta__categoria">${p.categoria}</span>` : ""}
          <h3 class="tarjeta__nombre">${p.nombre}</h3>
          ${p.descripcion ? `<p class="tarjeta__desc">${p.descripcion}</p>` : ""}
          <button class="tarjeta__btn" ${p.disponible === false ? "disabled" : ""}>
            ${p.disponible === false ? "Sin stock" : "Agregar al pedido"}
          </button>
        </div>
      `;
      const btn = card.querySelector(".tarjeta__btn");
      if (p.disponible !== false) {
        btn.addEventListener("click", () => agregarAlCarrito(p));
      }
      el.grilla.appendChild(card);
    });
  }

  function agregarAlCarrito(producto) {
    if (!carrito[producto.id]) {
      carrito[producto.id] = { producto, cantidad: 0 };
    }
    carrito[producto.id].cantidad += 1;
    renderCarrito();
    abrirCarrito();
  }

  function cambiarCantidad(id, delta) {
    if (!carrito[id]) return;
    carrito[id].cantidad += delta;
    if (carrito[id].cantidad <= 0) delete carrito[id];
    renderCarrito();
  }

  function quitarDelCarrito(id) {
    delete carrito[id];
    renderCarrito();
  }

  function renderCarrito() {
    const items = Object.values(carrito);
    const totalItems = items.reduce((acc, it) => acc + it.cantidad, 0);
    const totalPrecio = items.reduce((acc, it) => acc + it.cantidad * it.producto.precio, 0);

    el.contadorCarrito.textContent = totalItems;
    el.totalCarrito.textContent = formatoPrecio(totalPrecio);

    if (items.length === 0) {
      el.listaCarrito.innerHTML = '<p class="carrito-vacio">Todavía no agregaste nada.</p>';
    } else {
      el.listaCarrito.innerHTML = "";
      items.forEach(({ producto, cantidad }) => {
        const fila = document.createElement("div");
        fila.className = "item-carrito";
        fila.innerHTML = `
          <img src="${producto.foto || ""}" alt="">
          <div class="item-carrito__info">
            <p class="item-carrito__nombre">${producto.nombre}</p>
            <span class="item-carrito__precio">${formatoPrecio(producto.precio)} c/u</span>
          </div>
          <div class="item-carrito__cantidad">
            <button data-accion="restar" aria-label="Restar">−</button>
            <span>${cantidad}</span>
            <button data-accion="sumar" aria-label="Sumar">+</button>
          </div>
          <button class="item-carrito__quitar" aria-label="Quitar">Quitar</button>
        `;
        fila.querySelector('[data-accion="sumar"]').addEventListener("click", () => cambiarCantidad(producto.id, 1));
        fila.querySelector('[data-accion="restar"]').addEventListener("click", () => cambiarCantidad(producto.id, -1));
        fila.querySelector(".item-carrito__quitar").addEventListener("click", () => quitarDelCarrito(producto.id));
        el.listaCarrito.appendChild(fila);
      });
    }

    actualizarLinkWhatsapp(items, totalPrecio);
  }

  function actualizarLinkWhatsapp(items, totalPrecio) {
    if (items.length === 0 || !config.whatsapp) {
      el.btnWhatsapp.setAttribute("aria-disabled", "true");
      el.btnWhatsapp.removeAttribute("href");
      return;
    }
    el.btnWhatsapp.removeAttribute("aria-disabled");

    const lineas = items.map(
      ({ producto, cantidad }) =>
        `• ${cantidad}x ${producto.nombre} - ${formatoPrecio(producto.precio * cantidad)}`
    );
    const mensaje = [
      config.mensaje_saludo,
      "",
      ...lineas,
      "",
      `Total: ${formatoPrecio(totalPrecio)}`,
    ].join("\n");

    const url = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(mensaje)}`;
    el.btnWhatsapp.setAttribute("href", url);
  }

  function abrirCarrito() {
    if (!avisoYaVisto) {
      mostrarAviso();
      return;
    }
    el.overlay.hidden = false;
    el.panelCarrito.hidden = false;
  }
  function cerrarCarrito() {
    el.overlay.hidden = true;
    el.panelCarrito.hidden = true;
  }

  function mostrarAviso() {
    el.overlayAviso.hidden = false;
    el.modalAviso.hidden = false;
  }
  function cerrarAviso() {
    el.overlayAviso.hidden = true;
    el.modalAviso.hidden = true;
    avisoYaVisto = true;
    el.overlay.hidden = false;
    el.panelCarrito.hidden = false;
  }

  el.btnAbrirCarrito.addEventListener("click", abrirCarrito);
  el.btnCerrarCarrito.addEventListener("click", cerrarCarrito);
  el.overlay.addEventListener("click", cerrarCarrito);
  el.btnCerrarAviso.addEventListener("click", cerrarAviso);
  el.overlayAviso.addEventListener("click", cerrarAviso);

  cargarDatos();
})();
