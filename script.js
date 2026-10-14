<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meu Jogo de Futebol Pixel Art</title>
    <style>
        /* Estilos da página */
        body {
            margin: 0;
            padding: 0;
            background-color: #222;
            color: white;
            font-family: 'Courier New', Courier, monospace; /* Estilo retro */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            overflow: hidden;
        }

        h1 {
            margin-bottom: 10px;
            font-size: 24px;
            text-shadow: 2px 2px #000;
        }

        /* Container do jogo para controlar o Fullscreen */
        #game-container {
            position: relative;
            width: 800px;
            height: 500px;
            background: #000;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }

        /* Tela do jogo (Canvas) com renderização estilo pixel art */
        canvas {
            width: 100%;
            height: 100%;
            background: #4caf50;
            display: block;
            image-rendering: pixelated;
            image-rendering: crisp-edges;
        }

        /* Menu de Início */
        #menu-inicial {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10;
        }

        /* Botões */
        .btn {
            background-color: #ffeb3b;
            color: #000;
            border: 4px solid #fff;
            padding: 12px 24px;
            font-size: 18px;
            font-weight: bold;
            font-family: inherit;
            cursor: pointer;
            margin: 10px;
            box-shadow: 4px 4px 0px #000;
            transition: transform 0.1s;
        }
        .btn:hover {
            transform: scale(1.05);
            background-color: #fff;
        }
        .btn:active {
            transform: scale(0.95);
        }

        /* Instruções de controle */
        .controles {
            font-size: 14px;
            color: #ccc;
            text-align: center;
            margin-top: 20px;
            line-height: 1.6;
        }

        /* Botão de Tela Cheia fixado no topo do container */
        #fs-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 5;
            padding: 6px 12px;
            font-size: 12px;
            background: #333;
            color: #fff;
            border: 2px solid #fff;
            cursor: pointer;
            box-shadow: 2px 2px 0px #000;
        }
    </style>
</head>
<body>

    <h1>Pixel Soccer 2026</h1>

    <div id="game-container">
        <!-- Botão de Alternar Fullscreen -->
        <button id="fs-btn" onclick="toggleFullscreen()">TELA CHEIA</button>

        <!-- Menu Inicial -->
        <div id="menu-inicial">
            <h2 style="color: #ffeb3b; font-size: 32px; margin-bottom: 5px;">PIXEL SOCCER</h2>
            <p style="margin-bottom: 25px;">Toque para começar o campeonato!</p>
            <button class="btn" onclick="iniciarJogo()">INICIAR JOGO</button>
            <div class="controles">
                <strong>Como jogar:</strong><br>
                Mova o Mouse: Mira a direção do passe<br>
                Barra de Espaço: Passa a bola para o jogador mais próximo<br>
                O computador controla a defesa adversária!
            </div>
        </div>

        <!-- Tela de renderização do jogo -->
        <canvas id="gameCanvas" width="800" height="500"></canvas>
    </div>

    <!-- TODO O JAVASCRIPT ESTÁ INTEGRADO DIRETAMENTE AQUI ABAIXO -->
    <script>
        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");
        const menuInicial = document.getElementById("menu-inicial");
        const gameContainer = document.getElementById("game-container");
        const fsBtn = document.getElementById("fs-btn");

        // Estado do Jogo
        let jogoRodando = false;
        let mouseX = 0;
        let mouseY = 0;

        // Estrutura da bola
        let bola = { x: 400, y: 250, r: 7, dono: null, velocidade: 0, dx: 0, dy: 0 };

        // Definição dos Jogadores (Visual estilo Pixel Art manual via código)
        let jogadores = [
            // Meu Time (Aliados) - Camisa Azul
            { id: 1, x: 250, y: 150, time: "aliado", cor: "#2196f3", corPele: "#ffdbac" },
            { id: 2, x: 250, y: 350, time: "aliado", cor: "#2196f3", corPele: "#f1c27d" },
            { id: 3, x: 380, y: 250, time: "aliado", cor: "#2196f3", corPele: "#e0ac69" }, // Começa com a bola
            // Adversários (Inimigos) - Camisa Vermelha
            { id: 4, x: 550, y: 150, time: "rival", cor: "#f44336", corPele: "#ffdbac" },
            { id: 5, x: 550, y: 350, time: "rival", cor: "#f44336", corPele: "#8d5524" },
            { id: 6, x: 450, y: 250, time: "rival", cor: "#f44336", corPele: "#f1c27d" }
        ];

        // Definindo o jogador inicial que está com a bola
        bola.dono = jogadores[2]; 

        // Rastrear movimento do mouse
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });

        // Evento de apertar Espaço para passar a bola
        window.addEventListener('keydown', (e) => {
            if (e.code === "Space" && bola.dono && bola.dono.time === "aliado") {
                passarBola();
            }
        });

        function iniciarJogo() {
            menuInicial.style.display = "none";
            jogoRodando = true;
            loopPrincipal();
        }

        // Função de passar a bola baseada na mira do mouse
        function passarBola() {
            // Calcula o vetor de direção baseado no mouse
            let dx = mouseX - bola.x;
            let dy = mouseY - bola.y;
            let distancia = Math.sqrt(dx * dx + dy * dy);

            if (distancia > 0) {
                bola.dx = dx / distancia;
                bola.dy = dy / distancia;
                bola.velocidade = 7; // velocidade do passe
                bola.dono = null; // A bola agora está livre no campo
            }
        }

        // Desenha objetos em blocos rígidos para simular o visual Pixel Art
        function desenharPixelPlayer(player) {
            ctx.fillStyle = "#000"; // Sombra/Contorno inferior
            ctx.fillRect(player.x - 10, player.y + 12, 20, 4);

            ctx.fillStyle = player.cor; // Corpo/Camisa (Pixel Quadrado grande)
            ctx.fillRect(player.x - 10, player.y - 6, 20, 18);

            ctx.fillStyle = player.corPele; // Cabeça
            ctx.fillRect(player.x - 6, player.y - 16, 12, 10);

            ctx.fillStyle = "#000"; // Olhos de pixel
            ctx.fillRect(player.x - 4, player.y - 13, 2, 2);
            ctx.fillRect(player.x + 2, player.y - 13, 2, 2);

            // Destaca quem está controlando a bola no momento
            if (bola.dono === player) {
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 2;
                ctx.strokeRect(player.x - 14, player.y - 20, 28, 38);
            }
        }

        function desenharCampo() {
            // Gramado principal
            ctx.fillStyle = "#2e7d32";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Linhas brancas em estilo retro (linhas grossas pixeladas)
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.fillRect(10, 10, canvas.width - 20, 6); // Linha superior
            ctx.fillRect(10, canvas.height - 16, canvas.width - 20, 6); // Linha inferior
            ctx.fillRect(10, 10, 6, canvas.height - 20); // Linha esquerda
            ctx.fillRect(canvas.width - 16, 10, 6, canvas.height - 20); // Linha direita
            ctx.fillRect(canvas.width / 2 - 3, 10, 6, canvas.height - 20); // Linha de meio de campo
            
            // Grande área esquerda e direita
            ctx.fillRect(10, 125, 80, 6); ctx.fillRect(10, 369, 80, 6); ctx.fillRect(90, 125, 6, 250);
            ctx.fillRect(canvas.width - 90, 125, 80, 6); ctx.fillRect(canvas.width - 90, 369, 80, 6); ctx.fillRect(canvas.width - 96, 125, 6, 250);

            // Traves
            ctx.fillStyle = "#fff";
            ctx.fillRect(2, 190, 10, 120); // Trave esquerda
            ctx.fillRect(canvas.width - 12, 190, 10, 120); // Trave direita
        }

        // Lógica de movimentação automática e física
        function atualizarJogo() {
            // Se a bola está com alguém, ela segue a posição do jogador
            if (bola.dono) {
                bola.x = bola.dono.x + 8;
                bola.y = bola.dono.y + 10;
                
                // Se o dono for o usuário, ele segue levemente a direção do mouse
                if (bola.dono.time === "aliado") {
                    let dx = mouseX - bola.dono.x;
                    let dy = mouseY - bola.dono.y;
                    let dist = Math.sqrt(dx*dx + dy*dy);
                    if(dist > 20) {
                        bola.dono.x += (dx / dist) * 1.8;
                        bola.dono.y += (dy / dist) * 1.8;
                    }
                }
            } else {
                // Movimento físico da bola rolando livremente
                bola.x += bola.dx * bola.velocidade;
                bola.y += bola.dy * bola.velocidade;
                bola.velocidade *= 0.98; // Atrito da grama diminuindo a velocidade

                if (bola.velocidade < 0.2) bola.velocidade = 0;

                // Colisão/Interceptação da bola pelos jogadores livres
