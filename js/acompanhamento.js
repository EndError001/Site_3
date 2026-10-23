
/* CASA DO GRÃO — ACOMPANHAMENTO */

(() => {

    const pagamento = document.getElementById(
        "etapa-pagamento"
    );

    const preparacao = document.getElementById(
        "etapa-preparacao"
    );

    const pronto = document.getElementById(
        "etapa-pronto"
    );

    if (!pagamento || !preparacao || !pronto) {
        return;
    }

    const descricao = document.querySelector(
        ".acompanhamento-descricao"
    );

    const parametros = new URLSearchParams(
        window.location.search
    );

    const token = parametros.get("token");

    if (!token) {

        descricao.textContent =
            "Nenhum pedido registrado foi selecionado. " +
            "Abra esta página pelo link gerado " +
            "na finalização do pedido.";

        return;
    }

    function marcarEtapa(elemento, ativa) {
        elemento.classList.toggle("ativa", ativa);
    }

    function atualizarTela(pedido) {

        const status = pedido.status;

        marcarEtapa(
            pagamento,
            status === "aguardando_pix" ||
            status === "pago"
        );

        marcarEtapa(
            preparacao,
            status === "preparando"
        );

        
        marcarEtapa(
            pronto,
            status === "pronto" ||
            status === "concluido"
        );


        if (status === "aguardando_pix") {
            descricao.textContent =
                `Pedido ${pedido.numero}: ` +
                "aguardando confirmação do Pix.";
        }

        if (status === "pago") {
            descricao.textContent =
                `Pedido ${pedido.numero}: ` +
                "pagamento confirmado! " +
                "Aguardando início do preparo.";
        }

        if (status === "preparando") {
            descricao.textContent =
                `Pedido ${pedido.numero}: ` +
                "seu café está sendo preparado!";
        }

        if (status === "pronto") {
            descricao.textContent =
                `Pedido ${pedido.numero}: pedido pronto!`;
        }
        
        if (status === "concluido") {

            descricao.textContent =
                `Pedido ${pedido.numero}: ` +
                "pedido concluído! Obrigado por escolher " +
                "a Casa do Grão.";

            const tituloFinal = pronto.querySelector("strong");

            if (tituloFinal) {
                tituloFinal.textContent =
                    "3. Pedido entregue ou retirado";
            }
        }

    }

    async function consultarPedido() {

        try {

            const resposta = await fetch(
                "/api/pedidos/status?token=" +
                encodeURIComponent(token),
                { cache: "no-store" }
            );

            if (!resposta.ok) {
                throw new Error(
                    "Pedido não encontrado."
                );
            }

            const pedido = await resposta.json();

            atualizarTela(pedido);

        } catch (erro) {

            descricao.textContent =
                "Não foi possível atualizar o pedido: " +
                erro.message;
        }
    }

    consultarPedido();

    // Consultar novamente a cada 10 segundos

    setInterval(consultarPedido, 10000);

})();
