
/* CASA DO GRÃO — PAINEL ADMINISTRATIVO */

(() => {

    const login = document.getElementById("login-admin");
    const painel = document.getElementById("painel-pedidos");
    const formLogin = document.getElementById("form-login");
    const lista = document.getElementById("lista-pedidos");
    const mensagem = document.getElementById("mensagem-admin");
    const erroLogin = document.getElementById("erro-login");
    const botaoSair = document.getElementById("sair-admin");

    const nomesStatus = {
        aguardando_pix: "Aguardando Pix",
        pago: "Pagamento confirmado",
        preparando: "Em preparação",
        pronto: "Pedido pronto"
    };

    async function requisicao(url, opcoes = {}) {

        const resposta = await fetch(url, {
            ...opcoes,
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                ...opcoes.headers
            }
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.erro || "Erro na comunicação."
            );
        }

        return dados;
    }

    function mostrarLogin() {
        login.hidden = false;
        painel.hidden = true;
        botaoSair.hidden = true;
    }

    function mostrarPainel() {
        login.hidden = true;
        painel.hidden = false;
        botaoSair.hidden = false;
    }

    function criarTexto(pai, tag, texto) {
        const elemento = document.createElement(tag);
        elemento.textContent = texto;
        pai.appendChild(elemento);
        return elemento;
    }

    function formatarMoeda(centavos) {
        return (centavos / 100).toLocaleString(
            "pt-BR",
            { style: "currency", currency: "BRL" }
        );
    }

    function criarBotao(pai, texto, acao) {

        const botao = document.createElement("button");
        botao.type = "button";
        botao.textContent = texto;

        botao.addEventListener("click", acao);

        pai.appendChild(botao);
    }

    async function mudarStatus(id, status) {

        if (status === "pago") {

            const confirmado = confirm(
                "Você conferiu o recebimento do Pix " +
                "no aplicativo Nubank e verificou o valor?"
            );

            if (!confirmado) return;
        }

        try {

            await requisicao(
                `/api/admin/pedidos/${encodeURIComponent(id)}`,
                {
                    method: "PATCH",
                    body: JSON.stringify({ status })
                }
            );

            mensagem.textContent =
                "Status atualizado com sucesso.";

            await carregarPedidos();

        } catch (erro) {
            mensagem.textContent = erro.message;
        }
    }

    function criarPedido(pedido) {

        const card = document.createElement("article");
        card.className = "admin-pedido";

        criarTexto(card, "h3", "Pedido " + pedido.numero);

        const status = criarTexto(
            card,
            "span",
            nomesStatus[pedido.status] || pedido.status
        );

        status.className = "admin-status";

        criarTexto(
            card, "p",
            "Cliente: " + pedido.cliente.nome
        );

        criarTexto(
            card, "p",
            "Telefone: " + pedido.cliente.telefone
        );

        criarTexto(
            card, "p",
            "Recebimento: " +
            (pedido.recebimento === "entrega"
                ? "Entrega"
                : "Retirada")
        );

        if (pedido.recebimento === "entrega") {
            criarTexto(
                card, "p",
                "Endereço: " + pedido.cliente.endereco
            );
        }

        const produtos = document.createElement("div");
        produtos.className = "admin-produtos";

        pedido.itens.forEach(item => {
            criarTexto(
                produtos,
                "p",
                `${item.quantidade}x ${item.nome} — ` +
                formatarMoeda(
                    item.precoCentavos * item.quantidade
                )
            );
        });

        card.appendChild(produtos);

        const total = document.createElement("div");
        total.className = "admin-total";

        criarTexto(total, "span", "Valor do pedido");

        criarTexto(
            total,
            "strong",
            formatarMoeda(pedido.totalCentavos)
        );

        card.appendChild(total);

        const acoes = document.createElement("div");
        acoes.className = "admin-acoes";

        if (pedido.status === "aguardando_pix") {
            criarBotao(
                acoes,
                "Confirmar Pix recebido",
                () => mudarStatus(pedido.id, "pago")
            );
        }

        if (pedido.status === "pago") {
            criarBotao(
                acoes,
                "Iniciar preparação",
                () => mudarStatus(pedido.id, "preparando")
            );
        }

        if (pedido.status === "preparando") {
            criarBotao(
                acoes,
                "Marcar como pronto",
                () => mudarStatus(pedido.id, "pronto")
            );
        }

if (pedido.status === "pronto") {

    const textoBotao =
        pedido.recebimento === "entrega"
            ? "Marcar como entregue"
            : "Marcar como retirado";

    criarBotao(
        acoes,
        textoBotao,
        () => mudarStatus(pedido.id, "concluido")
    );
}

        card.appendChild(acoes);
        lista.appendChild(card);
    }

    async function carregarPedidos() {

        try {

            const dados = await requisicao(
                "/api/admin/pedidos"
            );

           
mostrarPainel();
lista.replaceChildren();

// MOSTRAR APENAS PEDIDOS NÃO CONCLUÍDOS

const pedidosAtivos = dados.pedidos.filter(
    pedido => pedido.status !== "concluido"
);

if (pedidosAtivos.length === 0) {

    criarTexto(
        lista,
        "p",
        "Nenhum pedido pendente no momento."
    );

    return;
}

// EXIBIR PEDIDOS EM ANDAMENTO

pedidosAtivos.forEach(criarPedido);


        } catch (erro) {

            if (erro.message === "Não autorizado.") {
                mostrarLogin();
            } else {
                mensagem.textContent = erro.message;
            }
        }
    }

    formLogin.addEventListener("submit", async evento => {

        evento.preventDefault();

        const senha = document.getElementById(
            "senha-admin"
        ).value;

        try {

            await requisicao("/api/admin/login", {
                method: "POST",
                body: JSON.stringify({ senha })
            });

            document.getElementById(
                "senha-admin"
            ).value = "";

            erroLogin.textContent = "";

            await carregarPedidos();

        } catch (erro) {
            erroLogin.textContent = erro.message;
        }
    });

    document.getElementById(
        "atualizar-pedidos"
    ).addEventListener("click", carregarPedidos);

    botaoSair.addEventListener("click", async () => {

        try {
            await requisicao("/api/admin/sair", {
                method: "POST"
            });
        } finally {
            mostrarLogin();
        }
    });

    mostrarLogin();
    carregarPedidos();

})();
