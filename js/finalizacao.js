
/* =========================================
   CASA DO GRÃO
   FINALIZAÇÃO DO PEDIDO
========================================= */

(() => {

    const formulario = document.getElementById(
        "form-finalizacao"
    );

    if (!formulario) return;

    const listaResumo = document.getElementById(
        "lista-resumo"
    );

    const totalElemento = document.getElementById(
        "total-finalizacao"
    );

    const camposEntrega = document.getElementById(
        "campos-entrega"
    );

    const botaoFinalizar = document.getElementById(
        "botao-finalizar"
    );

    const mensagem = document.getElementById(
        "mensagem-finalizacao"
    );

    const nomeCliente = document.getElementById(
        "cliente-nome"
    );

    const telefoneCliente = document.getElementById(
        "cliente-telefone"
    );

    const radiosRecebimento = formulario.querySelectorAll(
        'input[name="recebimento"]'
    );

    const camposEndereco = [
        "entrega-rua",
        "entrega-bairro",
        "entrega-cidade"
    ].map(id => document.getElementById(id));

    let itensCarrinho = [];
    let subtotal = 0;
    const TAXA_ENTREGA = 5.00;
    let painelRevisao = null;

    // COMPATIBILIDADE COM PREÇOS DO CARRINHO

    const produtosBasicos = {
        "cappuccino-classico": {
            nome: "Cappuccino Clássico",
            preco: 14.90
        },

        "espresso-classico": {
            nome: "Espresso Clássico",
            preco: 7.90
        },

        "croissant-tradicional": {
            nome: "Croissant Tradicional",
            preco: 12.90
        },

        "brownie-chocolate": {
            nome: "Brownie de Chocolate",
            preco: 13.90
        }
    };

    function formatarMoeda(valor) {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    /* =====================================
       TAXA FIXA DE ENTREGA
    ===================================== */

    const linhaTotal = totalElemento.closest(
        ".finalizacao-total"
    );

    const linhaTaxa = document.createElement("div");
    linhaTaxa.className = "finalizacao-linha-frete";

    const tituloTaxa = document.createElement("span");
    tituloTaxa.textContent = "Taxa de entrega";

    const valorTaxa = document.createElement("strong");
    valorTaxa.textContent = "R$ 0,00";

    linhaTaxa.append(tituloTaxa, valorTaxa);

    if (linhaTotal) {

        linhaTotal.before(linhaTaxa);

        const tituloTotal = linhaTotal.querySelector(
            "span"
        );

        if (tituloTotal) {
            tituloTotal.textContent = "Total do pedido";
        }
    }

    function atualizarTotalComEntrega() {

        const recebimento = formulario.querySelector(
            'input[name="recebimento"]:checked'
        )?.value;

        const taxa = (
            itensCarrinho.length > 0 &&
            recebimento === "entrega"
        )
            ? TAXA_ENTREGA
            : 0;

        const total = Number(
            (subtotal + taxa).toFixed(2)
        );

        valorTaxa.textContent = formatarMoeda(taxa);

        totalElemento.textContent =
            formatarMoeda(total);
    }


    // CARREGAR PRODUTOS SALVOS

    function carregarCarrinho() {

        try {

            const dados = JSON.parse(
                localStorage.getItem(
                    "casaDoGraoCarrinho"
                ) || "[]"
            );

            if (!Array.isArray(dados)) {
                return [];
            }

            return dados.map(item => {

                if (
                    !item ||
                    typeof item.id !== "string" ||
                    !Number.isInteger(item.quantidade) ||
                    item.quantidade <= 0
                ) {
                    return null;
                }

                const padrao = produtosBasicos[item.id];

                const nome = padrao
                    ? padrao.nome
                    : item.nome;

                const preco = padrao
                    ? padrao.preco
                    : Number(item.preco);

                if (
                    typeof nome !== "string" ||
                    !nome.trim() ||
                    !Number.isFinite(preco) ||
                    preco < 0
                ) {
                    return null;
                }

                return {
                    id: item.id,
                    nome,
                    preco,
                    quantidade: item.quantidade
                };

            }).filter(Boolean);

        } catch (erro) {

            console.error(
                "Erro ao carregar o carrinho:",
                erro
            );

            return [];
        }

    }

    // EXIBIR RESUMO DOS PRODUTOS

    function atualizarResumo() {

        itensCarrinho = carregarCarrinho();

        listaResumo.replaceChildren();

        subtotal = 0;

        if (itensCarrinho.length === 0) {

            const itemVazio = document.createElement(
                "li"
            );

            itemVazio.textContent =
                "Seu carrinho está vazio.";

            listaResumo.appendChild(itemVazio);

            atualizarTotalComEntrega();

            botaoFinalizar.disabled = true;

            mensagem.textContent =
                "Adicione produtos ao carrinho para continuar.";

            return;
        }

        itensCarrinho.forEach(item => {

            const totalItem =
                item.preco * item.quantidade;

            subtotal += totalItem;

            const linha = document.createElement("li");

            const nome = document.createElement("strong");

            nome.textContent =
                item.quantidade + "x " + item.nome;

            const preco = document.createElement("p");

            preco.textContent =
                formatarMoeda(totalItem);

            linha.appendChild(nome);
            linha.appendChild(preco);

            listaResumo.appendChild(linha);

        });

        subtotal = Number(subtotal.toFixed(2));

        atualizarTotalComEntrega();

        botaoFinalizar.disabled = false;

        mensagem.textContent = "";

    }

    // RETIRADA OU ENTREGA

    function atualizarRecebimento() {

        const selecionado = formulario.querySelector(
            'input[name="recebimento"]:checked'
        );

        const entrega =
            selecionado?.value === "entrega";

        camposEntrega.hidden = !entrega;
        camposEntrega.disabled = !entrega;

        camposEndereco.forEach(campo => {

            if (!campo) return;

            campo.required = entrega;

        });
        atualizarTotalComEntrega();
        limparRevisao();

    }

    radiosRecebimento.forEach(radio => {

        radio.addEventListener(
            "change",
            atualizarRecebimento
        );

    });

    // REMOVER REVISÃO ANTIGA QUANDO O CLIENTE EDITAR

    function limparRevisao() {

        if (painelRevisao) {
            painelRevisao.remove();
            painelRevisao = null;
        }

    }

    formulario.addEventListener(
        "input",
        limparRevisao
    );

    // CRIAR UMA LINHA NA REVISÃO

    function criarLinha(rotulo, valor) {

        const linha = document.createElement("p");

        const destaque = document.createElement("strong");

        destaque.textContent = rotulo + ": ";

        linha.appendChild(destaque);

        linha.appendChild(
            document.createTextNode(valor)
        );

        return linha;
    }

    // REVISAR PEDIDO

    formulario.addEventListener(
        "submit",
        evento => {

            evento.preventDefault();

            atualizarResumo();
            limparRevisao();

            if (itensCarrinho.length === 0) {
                return;
            }

            const nome = nomeCliente.value.trim();

            const telefone = telefoneCliente.value.trim();

            const digitosTelefone =
                telefone.replace(/\D/g, "");

            if (
                digitosTelefone.length < 10 ||
                digitosTelefone.length > 11
            ) {

                mensagem.textContent =
                    "Informe um telefone válido com DDD.";

                telefoneCliente.focus();

                return;
            }

            const recebimento = formulario.querySelector(
                'input[name="recebimento"]:checked'
            )?.value;

            const observacoes = document.getElementById(
                "pedido-observacoes"
            ).value.trim();

            painelRevisao = document.createElement(
                "section"
            );

            painelRevisao.className =
                "finalizacao-painel";

            const titulo = document.createElement("h2");

            titulo.textContent = "Revisão do pedido";

            painelRevisao.appendChild(titulo);

            painelRevisao.appendChild(
                criarLinha("Cliente", nome)
            );

            painelRevisao.appendChild(
                criarLinha("Telefone", telefone)
            );

            painelRevisao.appendChild(
                criarLinha(
                    "Recebimento",
                    recebimento === "entrega"
                        ? "Entrega"
                        : "Retirada na cafeteria"
                )
            );

            if (recebimento === "entrega") {

                const rua = document.getElementById(
                    "entrega-rua"
                ).value.trim();

                const bairro = document.getElementById(
                    "entrega-bairro"
                ).value.trim();

                const cidade = document.getElementById(
                    "entrega-cidade"
                ).value.trim();

                const complemento = document.getElementById(
                    "entrega-complemento"
                ).value.trim();

                const endereco = [
                    rua,
                    bairro,
                    cidade,
                    complemento
                ].filter(Boolean).join(", ");

                painelRevisao.appendChild(
                    criarLinha("Endereço", endereco)
                );

            }

            const tituloProdutos = document.createElement(
                "h3"
            );

            tituloProdutos.textContent = "Produtos";

            painelRevisao.appendChild(tituloProdutos);

            itensCarrinho.forEach(item => {

                const valor =
                    item.preco * item.quantidade;

                painelRevisao.appendChild(
                    criarLinha(
                        item.quantidade + "x " + item.nome,
                        formatarMoeda(valor)
                    )
                );

            });

            painelRevisao.appendChild(
                criarLinha(
                    "Subtotal dos produtos",
                    formatarMoeda(subtotal)
                )
            );

            // TAXA DE ENTREGA E TOTAL DO PEDIDO

            const taxaEntrega = recebimento === "entrega"
                ? TAXA_ENTREGA
                : 0;

            const totalPedido = Number(
                (subtotal + taxaEntrega).toFixed(2)
            );

            painelRevisao.appendChild(
                criarLinha(
                    "Taxa de entrega",
                    formatarMoeda(taxaEntrega)
                )
            );

            painelRevisao.appendChild(
                criarLinha(
                    "Total do pedido",
                    formatarMoeda(totalPedido)
                )
            );

            if (observacoes) {

                painelRevisao.appendChild(
                    criarLinha(
                        "Observações",
                        observacoes
                    )
                );

            }

            const aviso = document.createElement("p");

            aviso.textContent =
                "Esta é apenas uma prévia. " +
                "Nenhum pedido foi enviado ou cobrado. " +
                "Taxas e disponibilidade de entrega " +
                "ainda precisam ser confirmadas.";

            painelRevisao.appendChild(aviso);

            mensagem.before(painelRevisao);

            mensagem.textContent =
                "Confira os dados acima. " +
                "Esta etapa ainda não envia o pedido.";

            painelRevisao.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

    // ATUALIZAR AO VOLTAR PARA A PÁGINA

    window.addEventListener("pageshow", () => {
        atualizarResumo();
        limparRevisao();
    });

    // ATUALIZAR QUANDO OUTRA ABA ALTERAR O CARRINHO

    window.addEventListener("storage", evento => {

        if (
            evento.key === "casaDoGraoCarrinho"
        ) {
            atualizarResumo();
            limparRevisao();
        }

    });

    // INICIALIZAR

    atualizarRecebimento();
    atualizarResumo();

})();
