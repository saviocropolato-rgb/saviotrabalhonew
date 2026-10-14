// ==========================================
// 1. INJEÇÃO DE CSS RETRO DIRETO VIA JAVASCRIPT
// ==========================================
const estilos = document.createElement("style");
estilos.innerHTML = `
    #game-container {
        position: relative;
        width: 800px;
        height: 500px;
        background: #1a4314;
        margin: 30px auto;
        box-shadow: 0 12px 35px rgba(0,0,0,0.6);
        border: 6px solid #fff;
        border-radius: 4px;
        overflow: hidden;
        font-family: 'Courier New', Courier, monospace;
    }
    canvas {
        width: 100%;
        height: 100%;
        display: block;
        image-rendering: pixelated;
    }
    #menu-inicial {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(10, 35, 10, 0.92);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        color: white;
        text-align: center;
    }
    .btn {
        background-color: #ffeb3b;
        color: #000;
        border: 4px solid #fff;
        padding: 14px 28px;
        font-size: 20px;
        font-weight: bold;
        font-family: inherit;
        cursor: pointer;
        box-shadow: 5px 5px 0px #000;
        transition: transform 0.1s, background-color 0.2s;
        margin: 15px 0;
    }
    .btn:hover {
        background-color: #ffffff;
        transform: scale(1.05);
    }
    .btn:active {
        transform: scale(0.95);
    }
    #fs-btn {
        position: absolute;
        top: 15px;
        right: 15px;
        z-index: 15;
        padding: 8px 16px;
        font-size: 11px;
        font-weight: bold;
        background: #222;
        color: #fff;
        border: 2px solid #fff;
        cursor: pointer;
        box-shadow: 3px 3px 0px #000;
    }
    #fs-btn:hover {
        background: #444;
    }
    .controles {
        font-size: 14px;
        color: #ddd;
        line-height: 1.6;
        background: rgba(0,0,0,0.4);
        padding: 10px 20px;
        border-radius: 4px;
        border: 1px dashed #fff;
    }
`;
document.head.appendChild(estilos);

// ==========================================
// 2. LÓGICA E ELEMENTOS DO JOGO (JAVASCRIPT)
// ==========================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menuInicial = document.getElementById("menu-inicial");
const gameContainer = document.getElementById("game-container");
const fsBtn = document.getElementById("fs-btn");

let jogoRodando = false;
let mouseX = 0, mouseY = 0;

// Configuração física da bola e jogadores
let bola = { x: 400, y: 250, r: 8, dono: null, velocidade: 0, dx: 0, dy: 0 };
let jogadores = [
    // Time do Usuário (Azul)
    { id: 1, x: 220, y: 130, time: "aliado", cor: "#1e88e5", corPele: "#ffdbac" },
    { id: 2, x: 220, y: 370, time: "aliado", cor: "#1e88e5", corPele: "#f1c27d" },
    { id: 3, x: 360, y: 250, time: "aliado", cor: "#1e88e5", corPele: "#e0ac69" },
    // Time Adversário (Vermelho)
    { id: 4, x: 580, y: 130, time: "rival", cor: "#e53935", corPele: "#ffdbac" },
    { id: 5, x: 580, y: 370, time: "rival", cor: "#e53935", corPele: "#8d5524" },
    { id: 6, x: 460, y: 250, time: "rival", cor: "#e53935", corPele: "#f1c27d" }
];

// O jogador 3 começa controlando a bola
bola.dono = jogadores[2];

// Rastreamento da posição do mouse
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
});

// Mecânica de chute ao apertar Espaço
window.addEventListener('keydown', (e) => {
    if (e.code === "Space" && bola.dono && bola.dono.time === "aliado") {
        let dx = mouseX - bola.x;
        let dy = mouseY - bola.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            bola.dx = dx / dist;
            bola.dy = dy / dist;
            bola.velocidade = 8.5; // Força do passe
            bola.dono = null;
        }
    }
});

// Inicia o Game Loop
function iniciarJogo() {
    menuInicial.style.display = "none";
    jogoRodando = true;
    gameLoop();
}

function atualizar() {
    if (bola.dono) {
        // A bola gruda no pé do jogador atual
        bola.x = bola.dono.x + 6;
        bola.y = bola.dono.y + 12;

        // Se o dono for o usuário, move o boneco na direção do mouse
        if (bola.dono.time === "aliado") {
            let dx = mouseX - bola.dono.x;
            let dy = mouseY - bola.dono.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 25) {
                bola.dono.x += (dx / dist) * 2.2;
                bola.dono.y += (dy / dist) * 2.2;
            }
        }
    } else {
        // Movimentação livre da bola rolando campo afora
        bola.x += bola.dx * bola.velocidade;
        bola.y += bola.dy * bola.velocidade;
        bola.velocidade *= 0.975; // Atrito/desaceleração gradual

        if (bola.velocidade < 0.15) bola.velocidade = 0;

        // Jogadores tentam pegar/interceptar a bola solta
        jogadores.forEach(p => {
            let dist = Math.sqrt(Math.pow(p.x - bola.x, 2) + Math.pow(p.y - bola.y, 2));
            if (dist < 20) {
                bola.dono = p;
                bola.velocidade = 0;
            }
        });
    }

    // Inteligência Artificial (IA) simples para os rivais vermelhos correrem atrás da bola
    jogadores.forEach(p => {
        if (p.time === "rival" && bola.dono !== p) {
            let dx = bola.x - p.x;
            let dy = bola.y - p.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 8) {
                p.x += (dx / dist) * 1.4;
                p.y += (dy / dist) * 1.4;
            }
        }

        // Restringe os jogadores para não saírem das bordas do gramado
        if (p.x < 25) p.x = 25; if (p.x > 775) p.x = 775;
        if (p.y < 25) p.y = 25; if (p.y > 475) p.y = 475;
    });
}

function desenhar() {
    // Desenha o gramado verde escuro
    ctx.fillStyle = "#2e7d32";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Linhas brancas pixeladas do campo de futebol
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(15, 15, canvas.width - 30, 4); // Cima
    ctx.fillRect(15, canvas.height - 19, canvas.width - 30, 4); // Baixo
    ctx.fillRect(15, 15, 4, canvas.height - 30); // Esquerda
    ctx.fillRect(canvas.width - 19, 15, 4, canvas.height - 30); // Direita
    ctx.fillRect(canvas.width / 2 - 2, 15, 4, canvas.height - 30); // Centro dividido

    // Círculo central do campo
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 55, 0, Math.PI * 2);
    ctx.stroke();

    // Trave Esquerda e Direita em branco sólido
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(2, 185, 13, 130);
    ctx.fillRect(canvas.width - 15, 185, 13, 130);

    // Desenha os Jogadores estilo Pixel Art (Blocos)
    jogadores.forEach(p => {
        ctx.fillStyle = "rgba(0,0,0,0.25)"; // Sombra sob o jogador
        ctx.fillRect(p.x - 12, p.y + 14, 24, 5);

        ctx.fillStyle = p.cor; // Corpo em formato quadrado uniforme
        ctx.fillRect(p.x - 12, p.y - 4, 24, 18);

        ctx.fillStyle = p.corPele; // Rosto quadrado superior
        ctx.fillRect(p.x - 7, p.y - 15, 14, 11);

        ctx.fillStyle = "#000000"; // Olhos simples de 2px
        ctx.fillRect(p.x - 4, p.y - 11, 2, 3);
        ctx.fillRect(p.x + 2, p.y - 11, 2, 3);

        // Alvo/Indicador dourado no jogador controlado atualmente pelo usuário
        if (bola.dono === p && p.time === "aliado") {
            ctx.strokeStyle = "#ffeb3b";
            ctx.lineWidth = 3;
            ctx.strokeRect(p.x - 16, p.y - 19, 32, 38);
        }
    });

    // Desenha a Bola Quadrada clássica de 8-bits
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(bola.x - bola.r, bola.y - bola.r, bola.r * 2, bola.r * 2);
    ctx.fillStyle = "#000000"; // Detalhe central da bola
    ctx.fillRect(bola.x - 2, bola.y - 2, 4, 4);

    // Linha guia de mira para auxiliar o passe do usuário
    if (bola.dono && bola.dono.time === "aliado") {
        ctx.strokeStyle = "rgba(255, 235, 59, 0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bola.x, bola.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
    }
}

function gameLoop() {
    if (!jogoRodando) return;
    atualizar();
    desenhar();
    requestAnimationFrame(gameLoop);
}

// Controle de Janela Cheia (Fullscreen)
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        gameContainer.requestFullscreen?.() || gameContainer.webkitRequestFullscreen?.();
        fsBtn.innerText = "SAIR TELA CHEIA";
    } else {
        document.exitFullscreen?.() || document.webkitExitFullscreen?.();
        fsBtn.innerText = "TELA CHEIA";
    }
}
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) fsBtn.innerText = "TELA CHEIA";
});
