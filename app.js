import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDzIv0DMqGoqIbzyzfOsZE-jE0uLYoik48",
  authDomain: "rico-pedidos.firebaseapp.com",
  projectId: "rico-pedidos",
  storageBucket: "rico-pedidos.firebasestorage.app",
  messagingSenderId: "623723216104",
  appId: "1:623723216104:web:21c906e11fb6e8df1d5d5d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let todosLosProductos = [];
let carrito = {};

async function cargarProductos() {

  const snapshot = await getDocs(
    collection(db, "productos")
  );

  todosLosProductos = [];

  snapshot.forEach(doc => {
    todosLosProductos.push(doc.data());
  });

  mostrarProductos(todosLosProductos);
}

function mostrarProductos(lista) {

  const contenedor = document.getElementById("productos");

  contenedor.innerHTML = "";

  lista.forEach(producto => {

    contenedor.innerHTML += `
      <div class="producto">

        <img src="${producto.imagen}" alt="${producto.nombre}">

        <h3>${producto.nombre}</h3>

        <div class="categoria">
          ${producto.categoria}
        </div>

        <p class="precio">
          $${producto.precio}
        </p>

        <p class="stock">
          Stock: ${producto.stock}
        </p>

     <div class="controles">

        <button onclick="restarProducto('${producto.nombre}')">
        -
        </button>

        <span id="cantidad-${producto.nombre}">
        0
        </span>

        <button onclick="sumarProducto('${producto.nombre}')">
        +
        </button>
  
     </div>

    </div>
    `;
  });
}

window.filtrar = function(categoria) {

  if (categoria === "todos") {
    mostrarProductos(todosLosProductos);
    return;
  }

  const filtrados = todosLosProductos.filter(
    p => p.categoria.toLowerCase() === categoria
  );

  mostrarProductos(filtrados);
}

cargarProductos();

function actualizarCarrito() {

  const lista = document.getElementById("lista-carrito");

  lista.innerHTML = "";

  let total = 0;
  let cantidadTotal = 0;

  Object.values(carrito).forEach(item => {

    const subtotal =
      item.producto.precio * item.cantidad;

    total += subtotal;
    cantidadTotal += item.cantidad;

    // Actualiza el número que aparece
    // debajo del producto

    const contador =
      document.getElementById(
        `cantidad-${item.producto.nombre}`
      );

    if (contador) {
      contador.textContent = item.cantidad;
    }

    lista.innerHTML += `
    <li>
     ${item.producto.nombre}
     x${item.cantidad}

     <strong>
     $${subtotal}
     </strong>
     </li>
     `;

  });

  // Productos que NO están en el carrito
  // vuelven a mostrar 0

  todosLosProductos.forEach(producto => {

    if (!carrito[producto.nombre]) {

      const contador =
        document.getElementById(
          `cantidad-${producto.nombre}`
        );

      if (contador) {
        contador.textContent = 0;
      }
    }

  });

  document.getElementById("cantidad-carrito")
    .textContent = cantidadTotal;

  document.getElementById("total")
    .textContent = total;
}

window.enviarWhatsApp = function() {

  if (Object.keys(carrito).length === 0) {
    alert("Tu carrito está vacío");
    return;
  }

  let mensaje = "Hola, quiero pedir:%0A%0A";

  const direccion =
  document.getElementById("direccion").value;

  const observaciones =
  document.getElementById("observaciones").value;

  const ubicacion =
  document.getElementById("ubicacion").value;

  let total = 0;

  Object.values(carrito).forEach(item => {

    const subtotal =
      item.producto.precio * item.cantidad;

    mensaje +=
      `• ${item.producto.nombre} x${item.cantidad} - $${subtotal}%0A`;

    total += subtotal;
  });

  mensaje += `%0A💰 Total: $${total}`;

  if (direccion.trim() !== "") {

  mensaje += `%0A🏠 Dirección:%0A${direccion}%0A`;

}

if (observaciones.trim() !== "") {

  mensaje += `%0A📝 Observaciones:%0A${observaciones}%0A`;

}

if (ubicacion !== "") {

  mensaje += `%0A📍 Ubicación:%0A${ubicacion}%0A`;

}

  const telefono = "5493731558574";

  const url =
    `https://wa.me/${telefono}?text=${mensaje}`;

  window.open(url, "_blank");
}
window.sumarProducto = function(nombreProducto) {

  const producto = todosLosProductos.find(
    p => p.nombre === nombreProducto
  );

  if (carrito[nombreProducto]) {

    carrito[nombreProducto].cantidad++;

  } else {

    carrito[nombreProducto] = {
      producto,
      cantidad: 1
    };

  }

  actualizarCarrito();
}

window.restarProducto = function(nombreProducto) {

  if (!carrito[nombreProducto]) return;

  carrito[nombreProducto].cantidad--;

  if (carrito[nombreProducto].cantidad <= 0) {
    delete carrito[nombreProducto];
  }

  actualizarCarrito();
}
window.vaciarCarrito = function() {

  if (!confirm("¿Vaciar carrito?")) {
    return;
  }

  carrito = {};

  actualizarCarrito();

}
window.obtenerUbicacion = function() {

  if (!navigator.geolocation) {
    alert("Tu dispositivo no soporta ubicación");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function(posicion) {

      const lat = posicion.coords.latitude;
      const lng = posicion.coords.longitude;

      const link =
        `https://maps.google.com/?q=${lat},${lng}`;

      document.getElementById("ubicacion").value =
        link;

      alert("Ubicación guardada");

    },
    function() {
      alert("No se pudo obtener la ubicación");
    }
  );
}
