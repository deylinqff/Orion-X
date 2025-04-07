import { generarImagen } from "./ia-img.js";
import { obtenerRespuestaIA } from "./ai-api.js";

document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("user-input").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// Función para detectar idioma y reproducir la voz, ignorando emojis, código, enlaces, etc.
function speakText(text) {
    // Eliminar bloques de código
    text = text.replace(/```[\s\S]*?```/g, '');

    // Eliminar enlaces (http o https)
    text = text.replace(/https?:\/\/\S+/g, '');

    // Eliminar emojis
    text = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{1F1E6}-\u{1F1FF}]/gu, '');

    // Eliminar caracteres innecesarios de markdown
    text = text.replace(/[*_~`#>]/g, '');

    // Detectar idioma
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = text.match(/[áéíóúñ¿¡]/i) ? "es-ES" : "en-US";
    speechSynthesis.speak(utterance);
}

async function sendMessage() {
    const userInput = document.getElementById("user-input").value.trim();
    if (userInput) {
        appendMessage(userInput, "user");
        document.getElementById("user-input").value = '';

        appendMessage("👑 Escribiendo...", "bot");

        if (userInput.toLowerCase().startsWith("generar imagen")) {
            const promptImagen = userInput.substring(15).trim();
            try {
                const imagenUrl = await generarImagen(promptImagen);
                removeTypingIndicator();
                appendImage(imagenUrl);
            } catch (error) {
                removeTypingIndicator();
                appendMessage("Hubo un error al generar la imagen.", "bot");
            }
        } else {
            try {
                const botResponse = await obtenerRespuestaIA(userInput);
                removeTypingIndicator();
                typeMessage(botResponse);
            } catch (error) {
                removeTypingIndicator();
                appendMessage("Hubo un error al obtener la respuesta.", "bot");
            }
        }
    }
}

function appendImage(imageUrl) {
    const chatBox = document.getElementById("chat-box");
    const imageDiv = document.createElement("div");
    imageDiv.classList.add("message", "bot");
    const imageElement = document.createElement("img");
    imageElement.src = imageUrl;
    imageElement.alt = "Imagen generada por IA";
    imageDiv.appendChild(imageElement);
    chatBox.appendChild(imageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessage(message, sender) {
    const chatBox = document.getElementById("chat-box");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
    const chatBox = document.getElementById("chat-box");
    const messages = chatBox.getElementsByClassName("bot");
    if (messages.length > 0) {
        messages[messages.length - 1].remove();
    }
}

function containsCode(text) {
    return /```[\s\S]*?```/.test(text);
}

function extractCode(text) {
    const match = text.match(/```(?:\w*\n)?([\s\S]*?)```/);
    return match ? match[1].trim() : text;
}

function typeMessage(message) {
    const chatBox = document.getElementById("chat-box");

    if (containsCode(message)) {
        const code = extractCode(message);
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", "bot");

        const codeBox = document.createElement("div");
        codeBox.classList.add("code-box");
        codeBox.innerHTML = `<pre><code>${code}</code></pre>`;

        messageDiv.appendChild(codeBox);
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    } else {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", "bot");

        const textSpan = document.createElement("span");
        const speakBtn = document.createElement("button");

        let i = 0;
        const typingSpeed = 30;
        textSpan.textContent = '';
        messageDiv.appendChild(textSpan);

        speakBtn.textContent = "🔊 Escuchar";
        speakBtn.classList.add("speak-btn");
        speakBtn.style.marginLeft = "10px";
        speakBtn.style.border = "none";
        speakBtn.style.background = "transparent";
        speakBtn.style.color = "#007bff";
        speakBtn.style.cursor = "pointer";

        speakBtn.onclick = () => speakText(message);

        const interval = setInterval(() => {
            textSpan.textContent += message[i];
            i++;
            if (i === message.length) {
                clearInterval(interval);
                messageDiv.appendChild(speakBtn);
            }
        }, typingSpeed);

        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}