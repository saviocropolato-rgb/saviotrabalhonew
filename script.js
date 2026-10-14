<!-- ... código anterior do seu menu (Inicio, Jogadores, Mapa, etc) ... -->
<nav>
    <!-- Seus botões de navegação existentes ficam aqui -->
</nav>

<!-- 1. COLE OS ESTILOS DO JOGO JUNTO COM SEUS ESTILOS EXISTENTES OU LOGO AQUI -->
<style>
    #game-container {
        position: relative;
        width: 800px;
        height: 500px;
        background: #000;
        margin: 20px auto; /* Centraliza o jogo na tela */
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    canvas {
        width: 100%;
        height: 100%;
        background: #4caf50;
        display: block;
        image-rendering: pixelated;
    }
    #menu-inicial {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 10;
        color: white;
        font-family: sans-serif;
    }
    .btn {
        background-color: #ffeb3b;
        color: #000;
        border: 4px solid #fff;
        padding: 12px 24px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
    }
    #fs-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 5;
        padding: 6px 12px;
        background: #333;
        color: #fff;
        border: 2px solid #fff;
        cursor: pointer;
    }
</style>

<!-- 2. COLE A ESTRUTURA VISUAL DO JOGO AQUI NO MEIO DA PÁGINA -->
<div id="game-container">
    <button id="fs-btn" onclick="toggleFullscreen()">TELA CHEIA</button>

    <div id="menu-inicial">
        <h2 style="color: #ffeb3b; font-size: 32px;">PIXEL SOCCER</h2>
        <button class="btn" onclick="iniciarJogo()">INICIAR JOGO</button>
        <p style="margin-top: 10px; font-size: 12px; color: #ccc;">Espaço: Passa | Mouse: Mira</p>
    </div>

    <canvas id="gameCanvas" width="800" height="500"></canvas>
</div>

<!-- 3. COLE O SCRIPT DE LÓGICA DO JOGO ANTES DE FECHAR O BODY -->
<script>
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const menuInicial = document.getElementById("menu-inicial");
    const gameContainer = document.getElementById("game-container");
    const fsBtn = document.getElementById("fs-btn");

    let juegoRodando = false;
    let mouseX = 0, mouseY = 0;
    let bola = { x: 400, y: 250, r: 7, dono: null, velocidade: 0, dx: 0, dy: 0 };
    let jogadores = [
        { id: 1, x: 250, y: 150, time: "aliado", cor: "#2196f3", corPele: "#ffdbac" },
        { id: 2, x: 250, y: 350, time: "aliado", cor: "#2196f3", corPele: "#f1c27d" },
        { id: 3, x: 380, y: 250, time: "aliado", cor: "#2196f3", corPele: "#e0ac69" },
        { id: 4, x: 550, y: 150, time: "rival", cor: "#f44336", corPele: "#ffdbac" },
        { id: 5, x: 550, y: 350, time: "rival", cor: "#f44336", corPele: "#8d5524" },
        { id: 6, x: 450, y: 250, time: "rival", cor: "#f44336", corPele: "#f1c27d" }
    ];
    bola.dono = jogadores[2];

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });

    window.addEventListener('keydown', (e) => {
        if (e.code === "Space" && bola.dono && bola.dono.time === "aliado") {
            let dx = mouseX - bola.x;
            let dy = mouseY - bola.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 0) {
                bola.dx = dx / dist; bola.dy = dy / dist;
                bola.velocidade = 7; bola.dono = null;
            }
        }
    });

    function iniciarJogo() {
        menuInicial.style.display = "none";
        juegoRodando = true;
        loop();
    }

    function loop() {
        if (!juegoRodando) return;
        
        // Atualização da física
        if (bola.dono) {
            bola.x = bola.dono.x + 8; bola.y = bola.dono.y + 10;
            if (bola.dono.time === "aliado") {
                let dx = mouseX - bola.dono.x; let dy = mouseY - bola.dono.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if(dist > 20) { bola.dono.x += (dx / dist) * 1.8; bola.dono.y += (dy / dist) * 1.8; }
            }
        } else {
            bola.x += bola.dx * bola.velocidade; bola.y += bola.dy * bola.velocidade;
            bola.velocidade *= 0.98;
            jogadores.forEach(p => {
                if (Math.sqrt(Math.pow(p.x - bola.x, 2) + Math.pow(p.y - bola.y, 2)) < 18) {
                    bola.dono = p; bola.velocidade = 0;
                }
            });
        }

        jogadores.forEach(p => {
            if (p.time === "rival" && bola.dono !== p) {
                let dx = bola.x - p.x; let dy = bola.y - p.y; let dist = Math.sqrt(dx*dx + dy*dy);
                if (dist > 5) { p.x += (dx / dist) * 1.2; p.y += (dy / dist) * 1.2; }
            }
            if(p.x < 20) p.x = 20; if(p.x > 780) p.x = 780;
            if(p.y < 20) p.y = 20; if(p.y > 480) p.y = 480;
        });

        // Desenho do campo
        ctx.fillStyle = "#2e7d32"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillRect(10, 10, canvas.width - 20, 4); ctx.fillRect(10, canvas.height - 14, canvas.width - 20, 4);
        ctx.fillRect(canvas.width / 2 - 2, 10, 4, canvas.height - 20);
        ctx.fillRect(2, 190, 10, 120); ctx.fillRect(canvas.width - 12, 190, 10, 120);

        // Desenho dos jogadores
        jogadores.forEach(p => {
            ctx.fillStyle = p.cor; ctx.fillRect(p.x - 10, p.y - 6, 20, 18);
            ctx.fillStyle = p.corPele; ctx.fillRect(p.x - 6, p.y - 16, 12, 10);
        });

        // Desenho da bola
        ctx.fillStyle = "#fff"; ctx.fillRect(bola.x - 6, bola.y - 6, 12, 12);

        requestAnimationFrame(loop);
    }

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
</script>

<!-- ... código do seu rodapé amarelo existente fica aqui abaixo ... -->
<footer>
    <!-- Mais informações entre em contato... -->
</footer>
