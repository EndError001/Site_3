
/* =====================================
   CASA DO GRÃO - SISTEMA DE ANIMAÇÕES
===================================== */

(() => {

    const loader = document.getElementById("preloader");

    if (!loader) return;

    
    const inicioCarregamento = performance.now();
    const tempoMinimo = 2500;


    const imagemHero = document.querySelector(".hero-imagem");

    const numero = document.getElementById(
        "preloader-porcentagem"
    );

    const preenchimento = document.getElementById(
        "preloader-preenchimento"
    );

    const barra = document.getElementById(
        "preloader-progresso"
    );

    const botaoPular = document.getElementById(
        "pular-abertura"
    );

    const gsapDisponivel = typeof window.gsap !== "undefined";

    const movimentoReduzido = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    document.body.classList.add("pagina-carregando");

    let imagemPronta = false;
    let fontesProntas = false;
    let finalizado = false;

    const progresso = { valor: 0 };

    /* DESENHAR PORCENTAGEM */

    function desenharProgresso() {

        const valor = Math.round(progresso.valor);

        numero.textContent = `${valor}%`;
        preenchimento.style.width = `${valor}%`;

        barra.setAttribute("aria-valuenow", valor);

    }

    /* ATUALIZAR PROGRESSO */

    function atualizarProgresso() {

        // Documento: 20%
        // Imagem principal: 60%
        // Fontes: 20%

        const valor =
            20 +
            (imagemPronta ? 60 : 0) +
            (fontesProntas ? 20 : 0);

        if (gsapDisponivel && !movimentoReduzido) {

            gsap.to(progresso, {
                valor: valor,
                duration: 0.45,
                ease: "power1.out",
                overwrite: true,
                onUpdate: desenharProgresso
            });

        } else {

            progresso.valor = valor;
            desenharProgresso();

        }

    }

    /* ESPERAR IMAGEM PRINCIPAL */

    function aguardarImagem(imagem) {

        if (!imagem) return Promise.resolve(false);

        if (imagem.complete) {
            return Promise.resolve(imagem.naturalWidth > 0);
        }

        return new Promise(resolve => {

            imagem.addEventListener(
                "load",
                () => resolve(true),
                { once: true }
            );

            imagem.addEventListener(
                "error",
                () => resolve(false),
                { once: true }
            );

        });

    }

    /* ANIMAÇÃO DA PÁGINA INICIAL */

    function animarHero() {

        if (!gsapDisponivel || movimentoReduzido) {
            return;
        }

        const titulo = document.querySelector(".hero h1");

        if (!titulo) return;

        let elementosTitulo = titulo;

        // Divide o título em palavras
        if (window.SplitText) {

            gsap.registerPlugin(window.SplitText);

            const divisao = SplitText.create(titulo, {
                type: "words",
                mask: "words"
            });

            elementosTitulo = divisao.words;

        }

        const movimento = window.matchMedia(
            "(max-width: 768px)"
        ).matches ? 20 : 40;

        const timeline = gsap.timeline({
            defaults: {
                ease: "power3.out"
            }
        });

        // IMAGEM
        timeline.from(".hero-imagem", {
            opacity: 0,
            scale: 1.08,
            duration: 1.5
        }, 0);

        // SUBTÍTULO
        timeline.from(".hero-destaque", {
            opacity: 0,
            y: movimento,
            duration: 0.65
        }, 0.25);

        // TÍTULO PALAVRA POR PALAVRA
        timeline.from(elementosTitulo, {
            opacity: 0,
            y: movimento,
            duration: 0.8,
            stagger: 0.12
        }, 0.45);

        // DESCRIÇÃO
        timeline.from(".hero-descricao", {
            opacity: 0,
            y: 20,
            duration: 0.75
        }, 0.9);

        // BOTÕES
        timeline.from(".hero-botoes a", {
            opacity: 0,
            y: 20,
            duration: 0.65,
            stagger: 0.15
        }, 1.2);

        // INFORMAÇÕES
        timeline.from(".hero-servicos", {
            opacity: 0,
            y: 12,
            duration: 0.6
        }, 1.5);

    }

    /* FINALIZAR ABERTURA */

    function finalizarAbertura() {

        if (finalizado) return;

        finalizado = true;

        clearTimeout(limiteCarregamento);

        function removerTela() {

            loader.remove();

            document.body.classList.remove(
                "pagina-carregando"
            );

            animarHero();

        }

        if (!gsapDisponivel || movimentoReduzido) {

            removerTela();
            return;

        }

        // Transição cinematográfica
        gsap.to(loader, {
            opacity: 0,
            duration: 0.65,
            ease: "power2.inOut",
            onComplete: removerTela
        });

    }

    /* TEMPO MÁXIMO DE ESPERA */

    const limiteCarregamento = setTimeout(
        finalizarAbertura,
        6500
    );

    /* PERMITIR PULAR A ABERTURA */

    botaoPular.addEventListener(
        "click",
        finalizarAbertura
    );

    /* RESPEITAR MOVIMENTO REDUZIDO */

    if (movimentoReduzido) {

        finalizarAbertura();
        return;

    }

    /* COMEÇAR CARREGAMENTO */

    atualizarProgresso();

    const carregarImagem = aguardarImagem(
        imagemHero
    ).then(sucesso => {

        imagemPronta = sucesso;

        if (!finalizado) {
            atualizarProgresso();
        }

    });

    const carregarFontes = document.fonts
        ? document.fonts.ready.then(() => {

            fontesProntas = true;

            if (!finalizado) {
                atualizarProgresso();
            }

        })
        : Promise.resolve().then(() => {

            fontesProntas = true;

            if (!finalizado) {
                atualizarProgresso();
            }

        });

    Promise.allSettled([
        carregarImagem,
        carregarFontes
    ]).then(() => {

        if (!finalizado) {

            // Permite visualizar o progresso final
            
const tempoDecorrido =
    performance.now() - inicioCarregamento;

const tempoRestante = Math.max(
    0,
    tempoMinimo - tempoDecorrido
);

setTimeout(finalizarAbertura, tempoRestante);


        }

    });

})();
