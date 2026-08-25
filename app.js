import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmx1BOHt_BTCl9qaXWbKqEsPMPlaFehqE",
  authDomain: "free-wi-fi-espiritual.firebaseapp.com",
  databaseURL: "https://free-wi-fi-espiritual-default-rtdb.firebaseio.com",
  projectId: "free-wi-fi-espiritual",
  storageBucket: "free-wi-fi-espiritual.firebasestorage.app",
  messagingSenderId: "600203686396",
  appId: "1:600203686396:web:ed2a5af938d8bc0819c279",
  measurementId: "G-KDML5MLL0F"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- FUNCIÓN PARA PUBLICAR MENSAJES ---
async function handlePublish() {
  const userInput = document.getElementById("userInput");
  const commentInput = document.getElementById("commentInput");

  if (!userInput || !commentInput) return;

  const name = userInput.value.trim();
  const comment = commentInput.value.trim();

  if (!name || !comment) {
    alert("Por favor llena ambos campos (Nombre y Mensaje).");
    return;
  }

  // Se limpian las casillas inmediatamente al enviar
  userInput.value = "";
  commentInput.value = "";

  try {
    const commentsRef = ref(db, 'comentarios');
    await push(commentsRef, {
      nombre: name,
      texto: comment,
      fecha: Date.now()
    });
  } catch (error) {
    console.error("Error al guardar en Realtime Database:", error);
    alert("Ocurrió un error al enviar: " + error.message);
    // Si falla el envío, se devuelven los datos a los inputs
    userInput.value = name;
    commentInput.value = comment;
  }
}
// Vinculación de evento al botón
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("publishBtn");
  if (btn) {
    btn.onclick = handlePublish;
  }
});

// --- LECTURA EN TIEMPO REAL Y PROGRESO DEL WI-FI ---
const commentsRef = ref(db, 'comentarios');

onValue(commentsRef, (snapshot) => {
  const wall = document.getElementById("wall");
  if (!wall) return;

  wall.innerHTML = "";
  const data = snapshot.val();

  if (data) {
    const commentsList = Object.values(data);

    // Renderizar cada post-it en el muro
    commentsList.forEach((item, index) => {
      const card = document.createElement("div");
      const colorClass = `card-color-${(index % 3) + 1}`;
      const rot = Math.floor(Math.random() * 8) - 4;

      card.className = `card ${colorClass}`;
      card.style.transform = `rotate(${rot}deg)`;
      card.innerHTML = `<strong>${escapeHtml(item.nombre)}</strong><p>${escapeHtml(item.texto)}</p>`;

      wall.appendChild(card);
    });

    // Actualizar Wi-Fi e imagen según el total de post-its
    updateWifi(commentsList.length);
  } else {
    updateWifi(0);
  }
});

function updateWifi(count) {
  const dot = document.querySelector(".dot");
  const b1 = document.querySelector(".bar-1");
  const b2 = document.querySelector(".bar-2");
  const b3 = document.querySelector(".bar-3");
  const statusMessage = document.getElementById("statusMessage");
  const caricaturaWifi = document.getElementById("caricaturaWifi");

  if (!dot || !statusMessage) return;

  [dot, b1, b2, b3].forEach(el => el && el.classList.remove("active"));
  statusMessage.classList.remove("connected");

  let currentImage = "cariWifi1.png";

  if (count >= 1) {
    dot.classList.add("active");
    currentImage = "cariWifi1.png";
  }
  if (count >= 7) {
    b1.classList.add("active");
    currentImage = "cariWifi2.png";
  }
  if (count >= 15) {
    b2.classList.add("active");
    currentImage = "cariWifi3.png";
  }
  if (count >= 25) {
    b3.classList.add("active");
    statusMessage.innerText = "Conectado con DIOS";
    statusMessage.classList.add("connected");
    currentImage = "cariWifi4.png";
  } else {
    statusMessage.innerText = "Conectando ...";
  }

  if (caricaturaWifi && caricaturaWifi.getAttribute("src") !== currentImage) {
    caricaturaWifi.src = currentImage;
  }
}

function escapeHtml(str) {
  return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}