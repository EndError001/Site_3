
/* =====================================
   CASA DO GRÃO - EFEITOS DOS PRODUTOS
===================================== */

(() => {

    const seletor = ".produto-card, .cardapio-card";

    const movimentoReduzido = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const mouseDisponivel = window.matchMedia(
        "(hover: hover) and (pointer: fine)"
    );

    let quadro = null;
    let cartaoAtivo = null;

    function restaurarCartao(cartao) {

        if (!cartao) return;

        cartao.style.setProperty("--tilt-x", "0deg");
        cartao.style.setProperty("--tilt-y", "0deg");

        cartao.style.setProperty("--light-x", "50%");
        cartao.style.setProperty("--light-y", "50%");

        cartaoAtivo = null;
    }

    // EFEITO 3D ACOMPANHANDO O MOUSE

    document.addEventListener("pointermove", evento => {

        if (movimentoReduzido.matches ||
            !mouseDisponivel.matches) return;

        const cartao = evento.target instanceof Element
            ? evento.target.closest(seletor)
            : null;

        if (cartaoAtivo && cartaoAtivo !== cartao) {
            restaurarCartao(cartaoAtivo);
        }

        if (!cartao) return;

        cartaoAtivo = cartao;

        if (quadro !== null) {
            cancelAnimationFrame(quadro);
        }

        const xMouse = evento.clientX;
        const yMouse = evento.clientY;

        quadro = requestAnimationFrame(() => {

            quadro = null;

            const area = cartao.getBoundingClientRect();

            const x = (xMouse - area.left) / area.width;
            const y = (yMouse - area.top) / area.height;

            const giroX = (0.5 - y) * 7;
            const giroY = (x - 0.5) * 9;

            cartao.style.setProperty(
                "--tilt-x",
                `${giroX.toFixed(2)}deg`
            );

            cartao.style.setProperty(
                "--tilt-y",
                `${giroY.toFixed(2)}deg`
            );

            cartao.style.setProperty(
                "--light-x",
                `${(x * 100).toFixed(1)}%`
            );

            cartao.style.setProperty(
                "--light-y",
                `${(y * 100).toFixed(1)}%`
            );

        });

    });

    // RESTAURAR QUANDO O MOUSE SAIR

    document.addEventListener("pointerout", evento => {

        const cartao = evento.target instanceof Element
            ? evento.target.closest(seletor)
            : null;

        if (!cartao) return;

        const destino = evento.relatedTarget;

        if (!(destino instanceof Node) ||
            !cartao.contains(destino)) {

            if (quadro !== null) {
                cancelAnimationFrame(quadro);
                quadro = null;
            }

            restaurarCartao(cartao);
        }

    });

    window.addEventListener("blur", () => {
        restaurarCartao(cartaoAtivo);
    });

    // ANIMAÇÃO DOS BOTÕES DE ADICIONAR

    document.addEventListener("click", evento => {

        const botao = evento.target instanceof Element
            ? evento.target.closest(
                ".adicionar-produto, .cardapio-botao"
              )
            : null;

        if (!botao || movimentoReduzido.matches) return;

        botao.animate(
            [
                { transform: "scale(1)" },
                { transform: "scale(0.93)" },
                { transform: "scale(1)" }
            ],
            {
                duration: 280,
                easing: "ease-out"
            }
        );

    });

})();
