const botaoMenu = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

function fecharMenu() {
    if (!menu || !botaoMenu) return;

    menu.classList.remove("ativo");
    botaoMenu.setAttribute("aria-expanded", "false");
    botaoMenu.setAttribute("aria-label", "Abrir menu");
    botaoMenu.textContent = "☰";
}

if (botaoMenu && menu) {
    botaoMenu.addEventListener("click", () => {
        const aberto = menu.classList.toggle("ativo");

        botaoMenu.setAttribute("aria-expanded", String(aberto));
        botaoMenu.setAttribute(
            "aria-label",
            aberto ? "Fechar menu" : "Abrir menu"
        );

        botaoMenu.textContent = aberto ? "✕" : "☰";
    });

    menu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", fecharMenu);
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            fecharMenu();
        }
    });
}

/* CARRINHO GLOBAL */
let carrinho = [];

try {
    const dadosSalvos = JSON.parse(
        localStorage.getItem("casaDoGraoCarrinho") || "[]"
    );

    if (Array.isArray(dadosSalvos)) {
        carrinho = dadosSalvos.filter(item =>
            item &&
            typeof item.id === "string" &&
            Number.isInteger(item.quantidade) &&
            item.quantidade > 0
        );
    }
} catch (erro) {
    carrinho = [];
}

const contadorCarrinho = document.getElementById("contador-carrinho");
const mensagemCarrinho = document.getElementById("mensagem-carrinho");


function atualizarContador() {

    const contador = document.getElementById(
        "contador-carrinho"
    );

    if (!contador) return;

    let itens = [];

    try {
        const dados = JSON.parse(
            localStorage.getItem("casaDoGraoCarrinho") || "[]"
        );

        itens = Array.isArray(dados) ? dados : [];

    } catch (erro) {
        console.error("Erro ao ler o carrinho:", erro);
    }

    const quantidade = itens.reduce((total, produto) => {
        return total + Math.max(0, Number(produto.quantidade) || 0);
    }, 0);

    contador.textContent = quantidade;

}


let tempoMensagem;

function mostrarMensagem(texto) {
    if (!mensagemCarrinho) return;

    mensagemCarrinho.textContent = texto;
    mensagemCarrinho.classList.add("visivel");

    clearTimeout(tempoMensagem);

    tempoMensagem = setTimeout(() => {
        mensagemCarrinho.classList.remove("visivel");
    }, 3000);
}

function salvarCarrinho() {
    try {
        localStorage.setItem(
            "casaDoGraoCarrinho",
            JSON.stringify(carrinho)
        );
    } catch (erro) {
        console.warn("Não foi possível salvar o carrinho.");
    }
}

function adicionarItemAoCarrinho(produto) {
    const itemExistente = carrinho.find(item => item.id === produto.id);

    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: 1
        });
    }

    salvarCarrinho();
    atualizarContador();
}

/* BOTÕES DA HOME */
const produtosFavoritos = {
    cappuccino: {
        id: "cappuccino-classico",
        nome: "Cappuccino da Casa",
        preco: 14.90
    },
    espresso: {
        id: "espresso-classico",
        nome: "Espresso Especial",
        preco: 8.90
    },
    croissant: {
        id: "croissant-tradicional",
        nome: "Croissant Artesanal",
        preco: 12.90
    },
    brownie: {
        id: "brownie-chocolate",
        nome: "Brownie de Chocolate",
        preco: 13.90
    }
};

const botoesAdicionar = document.querySelectorAll(".adicionar-produto");

botoesAdicionar.forEach(botao => {
    botao.addEventListener("click", () => {
        const chave = botao.dataset.produto;
        const produto = produtosFavoritos[chave];

        if (!produto) return;

        adicionarItemAoCarrinho(produto);
        mostrarMensagem(produto.nome + " adicionado ao carrinho!");
    });
});

atualizarContador();


const listaCarrinho = document.getElementById("lista-carrinho");
const carrinhoVazio = document.getElementById("carrinho-vazio");

const subtotalCarrinho = document.getElementById("subtotal-carrinho");
const totalCarrinho = document.getElementById("total-carrinho");

// Compatibilidade com itens salvos nas primeiras versões
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

function obterDadosProduto(item) {
    const padrao = produtosBasicos[item.id];

    const nome = padrao?.nome ?? item.nome;
    const preco = padrao?.preco ?? item.preco;

    if (
        typeof nome !== "string" ||
        !Number.isFinite(preco) ||
        preco < 0
    ) {
        return null;
    }

    return { nome, preco };
}

// ATUALIZAR QUANTIDADES

function alterarQuantidade(id, diferenca) {
    const item = carrinho.find(produto => produto.id === id);

    if (!item) return;

    item.quantidade = Math.max(
        1,
        Math.min(20, item.quantidade + diferenca)
    );

    salvarCarrinho();
    atualizarContador();
    renderizarCarrinho();
}

// REMOVER PRODUTO

function removerProduto(id) {
    const indice = carrinho.findIndex(produto => produto.id === id);

    if (indice === -1) return;

    carrinho.splice(indice, 1);

    salvarCarrinho();
    atualizarContador();
    renderizarCarrinho();
}

// CRIAR CARTÃO DE PRODUTO

function criarItemCarrinho(item, produto) {
    const card = document.createElement("article");
    card.className = "item-carrinho";

    card.innerHTML = `
        <div class="item-dados">
            <h3></h3>
            <p class="preco-unitario"></p>
        </div>

        <div class="item-controles">
            <div class="controle-quantidade">
                <button type="button" class="diminuir">−</button>
                <span class="quantidade"></span>
                <button type="button" class="aumentar">+</button>
            </div>

            <strong class="preco-item"></strong>

            <button type="button" class="remover-item">
                Remover
            </button>
        </div>
    `;

    card.querySelector("h3").textContent = produto.nome;

    card.querySelector(".preco-unitario").textContent =
        formatarMoeda(produto.preco) + " por unidade";

    card.querySelector(".quantidade").textContent =
        item.quantidade;

    card.querySelector(".preco-item").textContent =
        formatarMoeda(produto.preco * item.quantidade);

    const diminuir = card.querySelector(".diminuir");
    const aumentar = card.querySelector(".aumentar");
    const remover = card.querySelector(".remover-item");

    diminuir.setAttribute(
        "aria-label",
        "Diminuir quantidade de " + produto.nome
    );

    aumentar.setAttribute(
        "aria-label",
        "Aumentar quantidade de " + produto.nome
    );

    remover.setAttribute(
        "aria-label",
        "Remover " + produto.nome
    );

    diminuir.disabled = item.quantidade <= 1;
    aumentar.disabled = item.quantidade >= 20;

    diminuir.addEventListener("click", () => {
        alterarQuantidade(item.id, -1);
    });

    aumentar.addEventListener("click", () => {
        alterarQuantidade(item.id, 1);
    });

    remover.addEventListener("click", () => {
        removerProduto(item.id);
    });

    return card;
}

// EXIBIR CARRINHO

function renderizarCarrinho() {

    if (
        !listaCarrinho ||
        !carrinhoVazio ||
        !subtotalCarrinho ||
        !totalCarrinho
    ) {
        return;
    }


    listaCarrinho.replaceChildren();

    let subtotal = 0;
    let produtosValidos = 0;

    carrinho.forEach(item => {
        const produto = obterDadosProduto(item);

        if (!produto) return;

        produtosValidos++;

        subtotal += produto.preco * item.quantidade;

        const card = criarItemCarrinho(item, produto);
        listaCarrinho.appendChild(card);
    });

    carrinhoVazio.hidden = produtosValidos > 0;

    subtotalCarrinho.textContent = formatarMoeda(subtotal);
    totalCarrinho.textContent = formatarMoeda(subtotal);
}


/* SINCRONIZAR O CARRINHO ENTRE AS PÁGINAS */

function sincronizarCarrinho() {

    try {
        const dadosSalvos = JSON.parse(
            localStorage.getItem("casaDoGraoCarrinho") || "[]"
        );

        carrinho = Array.isArray(dadosSalvos)
            ? dadosSalvos.filter(item =>
                item &&
                typeof item.id === "string" &&
                Number.isInteger(item.quantidade) &&
                item.quantidade > 0
            )
            : [];

    } catch (erro) {
        carrinho = [];
        console.error("Erro ao carregar carrinho:", erro);
    }

    // Remove produtos antigos que não podem ser exibidos
    const itensValidos = carrinho.filter(
        item => obterDadosProduto(item) !== null
    );

    if (itensValidos.length !== carrinho.length) {
        carrinho = itensValidos;
        salvarCarrinho();
    }

    // Atualiza o número no cabeçalho
    atualizarContador();

    // Atualiza os produtos, se estiver na página do carrinho
    if (
        listaCarrinho &&
        carrinhoVazio &&
        subtotalCarrinho &&
        totalCarrinho
    ) {
        renderizarCarrinho();
    }
}

// Carregar os dados ao abrir a página
sincronizarCarrinho();

// Atualizar ao voltar para a página
window.addEventListener(
    "pageshow",
    sincronizarCarrinho
);

// Atualizar quando os dados mudarem em outra aba
window.addEventListener(
    "storage",
    evento => {
        if (evento.key === "casaDoGraoCarrinho") {
            sincronizarCarrinho();
        }
    }
);

// Atualizar quando outro código avisar sobre mudanças
window.addEventListener(
    "carrinhoAtualizado",
    sincronizarCarrinho
);


