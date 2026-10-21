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
    #placar {
        position: absolute;
        top: 15px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 24px;
        font-weight: bold;
        color: #fff;
        background: rgba(0, 0, 0, 0.5);
        padding: 5px 15px;
        border-radius: 4px;
        border: 2px solid #fff;
        z-index: 5;
    }
`;
document.head.appendChild(estilos);

// Adiciona o elemento visual do placar dinamicamente
const gameContainer = document.getElementById("game-container");
const placarDiv = document.createElement("div");
placarDiv.id = "placar";
placarDiv.innerText = "BRASIL 0 x 0 RIVAL";
if (gameContainer) {
    gameContainer.appendChild(placarDiv);
}

// ==========================================
// 2. LÓGICA E ELEMENTOS DO JOGO (JAVASCRIPT)
// ==========================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const menuInicial = document.getElementById("menu-inicial");
const fsBtn = document.getElementById("fs-btn");

let jogoRodando = false;
let mouseX = 0, mouseY = 0;
let golsAliado = 0, golsRival = 0;

let teclas = {
    w: false, a: false, s: false, d: false,
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false
};

let bola = { x: 400, y: 250, r: 8, dono: null, velocidade: 0, dx: 0, dy: 0, timerChuteIA: 0 };
let jogadores = [
    // Time do Usuário (Azul) - Posições de Origem fixadas para reorganização
    { id: 1, x: 220, y: 130, ox: 220, oy: 130, time: "aliado", cor: "#1e88e5", corPele: "#ffdbac" },
    { id: 2, x: 220, y: 370, ox: 220, oy: 370, time: "aliado", cor: "#1e88e5", corPele: "#f1c27d" },
    { id: 3, x: 360, y: 250, ox: 360, oy: 250, time: "aliado", cor: "#1e88e5", corPele: "#e0ac69" },
    // Time Adversário Inteligente (Vermelho)
    { id: 4, x: 580, y: 130, ox: 580, oy: 130, time: "rival", cor: "#e53935", corPele: "#ffdbac" },
    { id: 5, x: 580, y: 370, ox: 580, oy: 370, time: "rival", cor: "#e53935", corPele: "#8d5524" },
    { id: 6, x: 460, y: 250, ox: 460, oy: 250, time: "rival", cor: "#e53935", corPele: "#f1c27d" }
];

bola.dono = jogadores[2];

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W') teclas.w = true;
    if (e.key === 'a' || e.key === 'A') teclas.a = true;
    if (e.key === 's' || e.key === 'S') teclas.s = true;
    if (e.key === 'd' || e.key === 'D') teclas.d = true;
    if (e.key in teclas) teclas[e.key] = true;

    if (e.code === "Space") {
        e.preventDefault();
        if (bola.dono && bola.dono.time === "aliado") {
            let dx = mouseX - bola.x;
            let dy = mouseY - bola.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                bola.dx = dx / dist;
                bola.dy = dy / dist;
                
                // Determina se é um chute pro gol ou um passe rasteiro
                if (mouseX > 700 && mouseY > 180 && mouseY < 320) {
                    bola.velocidade = 12; // Chute forte pro gol!
                } else {
                    bola.velocidade = 8.5; // Passe controlado para os amigos
                }
                bola.dono = null;
            }
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'W') teclas.w = false;
    if (e.key === 'a' || e.key === 'A') teclas.a = false;
    if (e.key === 's' || e.key === 'S') teclas.s = false;
    if (e.key === 'd' || e.key === 'D') teclas.d = false;
    if (e.key in teclas) teclas[e.key] = false;
});

function iniciarJogo() {
    menuInicial.style.display = "none";
    jogoRodando = true;
    gameLoop();
}

function reiniciarPosicoes() {
    jogadores.forEach(p => {
        p.x = p.ox;
        p.y = p.oy;
    });
    bola.velocidade = 0;
    bola.dx = 0; bola.dy = 0;
    bola.x = 400; bola.y = 250;
    bola.dono = jogadores[2];
}

function atualizar() {
    // 1. Movimentação do Jogador Aliado Ativo
    let jogadorAtivo = (bola.dono && bola.dono.time === "aliado") ? bola.dono : jogadores[2];
    let moveX = 0, moveY = 0;
    if (teclas.w || teclas.ArrowUp) moveY = -1;
    if (teclas.s || teclas.ArrowDown) moveY = 1;
    if (teclas.a || teclas.ArrowLeft) moveX = -1;
    if (teclas.d || teclas.ArrowRight) moveX = 1;

    if (moveX !== 0 || moveY !== 0) {
        let comprimento = Math.sqrt(moveX * moveX + moveY * moveY);
        jogadorAtivo.x += (moveX / comprimento) * 2.8;
        jogadorAtivo.y += (moveY / comprimento) * 2.8;
    }

    // 2. Comportamento Físico da Bola
    if (bola.dono) {
        bola.x = bola.dono.x + 6;
        bola.y = bola.dono.y + 12;
    } else {
        bola.x += bola.dx * bola.velocidade;
        bola.y += bola.dy * bola.velocidade;
        bola.velocidade *= 0.98;
        if (bola.velocidade < 0.15) bola.velocidade = 0;

        // Interceptação por proximidade
        jogadores.forEach(p => {
            let dist = Math.sqrt(Math.pow(p.x - bola.x, 2) + Math.pow(p.y - bola.y, 2));
            if (dist < 20) { bola.dono = p; bola.velocidade = 0; }
        });
    }

    // 3. INTELIGÊNCIA ARTIFICIAL ADVERSÁRIA (DIFÍCIL)
    if (bola.dono && bola.dono.time === "rival") {
        // IA com posse de bola: Avança de forma inteligente e decide entre passar ou chutar no seu gol
        let atacante = bola.dono;
        let dxGol = 20 - atacante.x;
        let dyGol = 250 - atacante.y;
        let distGol = Math.sqrt(dxGol * dxGol + dyGol * dyGol);

        if (distGol < 280) { // Perto do gol? Chuta!
            bola.dx = dxGol / distGol;
            bola.dy = dyGol / distGol;
            bola.velocidade = 10;
            bola.dono = null;
        } else { // Longe? Avança carregando a bola ou passa para um parceiro livre
            atacante.x -= 1.8;
            atacante.y += (250 - atacante.y) * 0.01;
            
            // Chance de tocar para um companheiro de equipe melhor posicionado
            bola.timerChuteIA++;
            if(bola.timerChuteIA > 120) {
                let outrosRivais = jogadores.filter(p => p.time === "rival" && p.id !== atacante.id);
                let parceiro = outrosRivais[Math.floor(Math.random() * outrosRivais.length)];
                let dxP = parceiro.x - bola.x;
                let dyP = parceiro.y - bola.y;
                let distP = Math.sqrt(dxP*dxP + dyP*dyP);
                bola.dx = dxP / distP; bola.dy = dyP / distP;
                bola.velocidade = 7.5; bola.dono = null;
                bola.timerChuteIA = 0;
            }
        }
    } else {
        // IA sem a bola: Faz marcação dinâmica por zona e persegue inteligentemente
        jogadores.forEach(p => {
            if (p.time === "rival") {
                if (bola.dono && bola.dono.time === "aliado") {
                    // Se você está avançando, um adversário te caça e os outros cercam as linhas de passe
                    let distParaUsuario = Math.sqrt(Math.pow(bola.dono.x - p.x, 2) + Math.pow(bola.dono.y - p.y, 2));
                    if(p.id === 6 || distParaUsuario < 180) {
                        let dx = bola.x - p.x; let dy = bola.y - p.y;
                        let dist = Math.sqrt(dx*dx + dy*dy);
                        p.x += (dx / dist) * 1.9; p.y += (dy / dist) * 1.9;
                    } else {
                        // Voltar para cobrir sua zona de defesa original
                        p.x += (p.ox - p.x) * 0.02; p.y += (p.oy - p.y) * 0.02;
                    }
                } else {
                    // Bola rolando solta: o defensor mais próximo corre em direção a ela
                    let dx = bola.x - p.x; let dy = bola.y - p.y;
                    let dist = Math.sqrt(dx*dx + dy*dy);
