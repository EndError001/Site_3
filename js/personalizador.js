
/* ====================================
   CASA DO GRÃO - PERSONALIZADOR
==================================== */

(() => {

    const form = document.getElementById(
        "form-personalizador"
    );

    if (!form) return;

    const precoElemento = document.getElementById(
        "preco-personalizado"
    );

    const mensagem = document.getElementById(
        "mensagem-personalizador"
    );

    const tamanhos = {
        pequeno: { nome: "Pequeno", preco: 12.90 },
        medio: { nome: "Médio", preco: 14.90 },
        grande: { nome: "Grande", preco: 17.90 }
    };

    const leites = {
        integral: { nome: "Integral", preco: 0 },
        desnatado: { nome: "Desnatado", preco: 0 },
        vegetal: { nome: "Vegetal", preco: 2.50 },
        "zero-lactose": {
            nome: "Zero lactose",
            preco: 1.50
        }
    };

    const formatarMoeda = valor =>
        valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    function montarPedido() {

        const tamanho = form.elements.namedItem(
            "tamanho"
        ).value;

        const leite = form.elements.namedItem(
            "leite"
        ).value;

        const doseExtra = form.elements.namedItem(
            "dose-extra"
        ).checked;

        const calda = form.elements.namedItem(
            "calda"
        ).checked;

        const tamanhoEscolhido = tamanhos[tamanho];
        const leiteEscolhido = leites[leite];

        const total =
            tamanhoEscolhido.preco +
            leiteEscolhido.preco +
            (doseExtra ? 3.50 : 0) +
            (calda ? 2.00 : 0);

        const detalhes = [
            tamanhoEscolhido.nome,
            `Leite ${leiteEscolhido.nome}`,
            ...(doseExtra ? ["Dose extra"] : []),
            ...(calda ? ["Calda de chocolate"] : [])
        ];

        return {
            id: [
                "cappuccino-personalizado",
                tamanho,
                leite,
                doseExtra ? "extra" : "normal",
                calda ? "chocolate" : "sem-calda"
            ].join("-"),

            nome: `Cappuccino Clássico — ${detalhes.join(", ")}`,
            preco: Number(total.toFixed(2)),
            quantidade: 1
        };

    }

    function atualizarPreco() {

        const pedido = montarPedido();

        precoElemento.textContent =
            formatarMoeda(pedido.preco);

        mensagem.textContent = "";

    }

    form.addEventListener("change", atualizarPreco);

    form.addEventListener("submit", evento => {

        evento.preventDefault();

        const pedido = montarPedido();

        // Usa a função de carrinho já criada no main.js
        if (typeof adicionarItemAoCarrinho !== "function") {

            mensagem.textContent =
                "Não foi possível acessar o carrinho.";

            console.error(
                "Função adicionarItemAoCarrinho não encontrada."
            );

            return;
        }

        adicionarItemAoCarrinho(pedido);

        mensagem.textContent =
            "Seu cappuccino personalizado foi adicionado!";

        // Pequena animação de confirmação
        const botao = form.querySelector(
            ".personalizador-adicionar"
        );

        if (!window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches) {

            botao.animate(
                [
                    { transform: "scale(1)" },
                    { transform: "scale(0.97)" },
                    { transform: "scale(1)" }
                ],
                {
                    duration: 300,
                    easing: "ease-out"
                }
            );

        }

    });

    atualizarPreco();
})();


/* ====================================
   PERSONALIZADOR DO CARDÁPIO
==================================== */

(() => {

    // Executar somente no cardápio
    if (!document.getElementById("grid-cardapio")) {
        return;
    }

    // CRIAR JANELA DE PERSONALIZAÇÃO

    const modal = document.createElement("dialog");

    modal.className = "modal-personalizador";

    modal.innerHTML = `
        <form class="modal-personalizador-form">

            <button
                type="button"
                class="modal-personalizador-fechar"
                aria-label="Fechar">
                ✕
            </button>

            <p class="modal-personalizador-etiqueta">
                CASA DO GRÃO
            </p>

            <h2 id="modal-cafe-nome"></h2>

            <p class="modal-personalizador-descricao">
                Prepare seu café exatamente como gosta.
            </p>

            <label for="modal-cafe-tamanho">
                Escolha o tamanho
            </label>

            <select
                id="modal-cafe-tamanho"
                name="tamanho">

                <option value="pequeno">Pequeno</option>
                <option value="medio" selected>Médio</option>
                <option value="grande">Grande</option>

            </select>

            <label for="modal-cafe-leite">
                Escolha o leite
            </label>

            <select
                id="modal-cafe-leite"
                name="leite">

                <option value="integral">
                    Integral — incluso
                </option>

                <option value="desnatado">
                    Desnatado — incluso
                </option>

                <option value="vegetal">
                    Vegetal — + R$ 2,50
                </option>

                <option value="zero-lactose">
                    Zero lactose — + R$ 1,50
                </option>

            </select>

            <fieldset>

                <legend>Adicionais</legend>

                <label>
                    <input
                        type="checkbox"
                        name="doseExtra">
                    Dose extra de espresso (+ R$ 3,50)
                </label>

                <label>
                    <input
                        type="checkbox"
                        name="calda">
                    Calda de chocolate (+ R$ 2,00)
                </label>

            </fieldset>

            <div class="modal-personalizador-total">
                <span>Total</span>
                <strong id="modal-cafe-preco">
                    R$ 0,00
                </strong>
            </div>

            <button
                type="submit"
                class="modal-personalizador-adicionar">
                Adicionar ao carrinho
            </button>

            <p
                class="modal-personalizador-mensagem"
                role="status"
                aria-live="polite">
            </p>

        </form>
    `;

    document.body.appendChild(modal);

    // ELEMENTOS DA JANELA

    const formulario = modal.querySelector("form");

    const nomeElemento = modal.querySelector(
        "#modal-cafe-nome"
    );

    const precoElemento = modal.querySelector(
        "#modal-cafe-preco"
    );

    const mensagem = modal.querySelector(
        ".modal-personalizador-mensagem"
    );

    let cafeSelecionado = null;

    // PREÇOS ADICIONAIS

    const tamanhos = {
        pequeno: { nome: "Pequeno", ajuste: -2 },
        medio: { nome: "Médio", ajuste: 0 },
        grande: { nome: "Grande", ajuste: 3 }
    };

    const leites = {
        integral: { nome: "Integral", ajuste: 0 },
        desnatado: { nome: "Desnatado", ajuste: 0 },
        vegetal: { nome: "Vegetal", ajuste: 2.50 },
        "zero-lactose": {
            nome: "Zero lactose",
            ajuste: 1.50
        }
    };

    function formatarMoeda(valor) {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    // LER OPÇÕES ESCOLHIDAS

    function obterOpcoes() {

        return {
            tamanho: formulario.elements
                .namedItem("tamanho").value,

            leite: formulario.elements
                .namedItem("leite").value,

            doseExtra: formulario.elements
                .namedItem("doseExtra").checked,

            calda: formulario.elements
                .namedItem("calda").checked
        };
    }

    // CALCULAR PREÇO

    function calcularPreco(opcoes) {

        if (!cafeSelecionado) return null;

        const tamanho = tamanhos[opcoes.tamanho];
        const leite = leites[opcoes.leite];

        if (!tamanho || !leite) return null;

        let total = cafeSelecionado.preco;

        total += tamanho.ajuste;
        total += leite.ajuste;

        if (opcoes.doseExtra) total += 3.50;
        if (opcoes.calda) total += 2.00;

        return Number(
            Math.max(0.01, total).toFixed(2)
        );
    }

    // ATUALIZAR VALOR NA TELA

    function atualizarPreco() {

        const preco = calcularPreco(obterOpcoes());

        if (preco === null) return;

        precoElemento.textContent =
            formatarMoeda(preco);
    }

    formulario.addEventListener(
        "change",
        atualizarPreco
    );

    // ABRIR PERSONALIZADOR

    document.addEventListener("click", evento => {

        if (!(evento.target instanceof Element)) {
            return;
        }

        const botao = evento.target.closest(
            "[data-personalizar]"
        );

        if (!botao) return;

        evento.preventDefault();

        const id = botao.dataset.id;
        const nome = botao.dataset.nome;
        const preco = Number(botao.dataset.preco);

        if (
            !id ||
            !nome ||
            !Number.isFinite(preco) ||
            preco <= 0
        ) {
            console.error(
                "Dados inválidos para personalização."
            );
            return;
        }

        cafeSelecionado = {
            id,
            nome,
            preco
        };

        // MOSTRAR OS PREÇOS DE CADA TAMANHO

        const seletorTamanho = formulario.elements
            .namedItem("tamanho");

        Object.entries(tamanhos).forEach(([valor, dados]) => {

            const opcao = seletorTamanho.querySelector(
                `option[value="${valor}"]`
            );

            if (!opcao) return;

            const precoTamanho = Math.max(
                0.01,
                cafeSelecionado.preco + dados.ajuste
            );

            opcao.textContent =
                `${dados.nome} — ${formatarMoeda(precoTamanho)}`;

        });

        formulario.reset();

        nomeElemento.textContent = nome;
        mensagem.textContent = "";

        atualizarPreco();

        modal.showModal();
    });

    // FECHAR PERSONALIZADOR

    modal.querySelector(
        ".modal-personalizador-fechar"
    ).addEventListener("click", () => {
        modal.close();
    });

    modal.addEventListener("click", evento => {
        if (evento.target === modal) {
            modal.close();
        }
    });

    // ADICIONAR PRODUTO PERSONALIZADO

    formulario.addEventListener("submit", evento => {

        evento.preventDefault();

        if (!cafeSelecionado) return;

        const opcoes = obterOpcoes();
        const preco = calcularPreco(opcoes);

        if (preco === null) return;

        const detalhes = [
            tamanhos[opcoes.tamanho].nome,
            "Leite " + leites[opcoes.leite].nome
        ];

        if (opcoes.doseExtra) {
            detalhes.push("Dose extra");
        }

        if (opcoes.calda) {
            detalhes.push("Calda de chocolate");
        }

        // Identificador único por combinação

        const id = [
            "personalizado",
            cafeSelecionado.id,
            opcoes.tamanho,
            opcoes.leite,
            opcoes.doseExtra ? "extra" : "normal",
            opcoes.calda ? "calda" : "sem-calda"
        ].join("-");

        const produto = {
            id,
            nome: cafeSelecionado.nome +
                " — " + detalhes.join(", "),
            preco,
            quantidade: 1
        };

        // Integração com main.js

        if (
            typeof adicionarItemAoCarrinho !==
            "function"
        ) {
            mensagem.textContent =
                "Erro ao acessar o carrinho.";
            return;
        }

        adicionarItemAoCarrinho(produto);

        mensagem.textContent =
            "Café adicionado ao carrinho!";

    });

})();
