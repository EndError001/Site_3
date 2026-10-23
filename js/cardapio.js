const produtosCardapio = [
    {
        id: "espresso-classico",
        nome: "Espresso Clássico",
        descricao: "Café curto, intenso e aromático.",
        preco: 7.90,
        categoria: "cafes",
        imagem: "assets/imagens/espresso.png",
        tags: ["Intenso", "Clássico"]
    },
    {
        id: "espresso-duplo",
        nome: "Espresso Duplo",
        descricao: "Duas doses de espresso para quem gosta de mais intensidade.",
        preco: 10.90,
        categoria: "cafes",
        imagem: "assets/imagens/espresso-duplo.png",
        tags: ["Forte", "Duplo"]
    },
    {
        id: "ristretto",
        nome: "Ristretto",
        descricao: "Espresso mais curto e concentrado.",
        preco: 8.90,
        categoria: "cafes",
        imagem: "assets/imagens/ristretto.png",
        tags: ["Concentrado"]
    },
    {
        id: "americano",
        nome: "Americano",
        descricao: "Espresso diluído em água quente, equilibrado e suave.",
        preco: 9.90,
        categoria: "cafes",
        imagem: "assets/imagens/americano.png",
        tags: ["Suave"]
    },
    {
        id: "macchiato",
        nome: "Macchiato",
        descricao: "Espresso com um toque de espuma de leite.",
        preco: 10.90,
        categoria: "cafes",
        imagem: "assets/imagens/macchiato.png",
        tags: ["Com Leite"]
    },
    {
        id: "cappuccino-classico",
        nome: "Cappuccino Clássico",
        descricao: "Espresso, leite vaporizado e espuma cremosa.",
        preco: 14.90,
        categoria: "cafes",
        imagem: "assets/imagens/cappuccino-classico.png",
        tags: ["Com Leite", "Espuma"]
    },
    {
        id: "latte",
        nome: "Latte",
        descricao: "Espresso com bastante leite vaporizado.",
        preco: 15.90,
        categoria: "cafes",
        imagem: "assets/imagens/latte.png",
        tags: ["Cremoso", "Com Leite"]
    },
    {
        id: "flat-white",
        nome: "Flat White",
        descricao: "Espresso com leite e microespuma fina.",
        preco: 16.90,
        categoria: "cafes",
        imagem: "assets/imagens/flat-white.png",
        tags: ["Microespuma"]
    },
    {
        id: "mocha",
        nome: "Mocha",
        descricao: "Espresso, leite e chocolate.",
        preco: 17.90,
        categoria: "cafes",
        imagem: "assets/imagens/mocha.png",
        tags: ["Chocolate", "Com Leite"]
    },
    {
        id: "caramel-macchiato",
        nome: "Caramel Macchiato",
        descricao: "Leite, espresso e caramelo.",
        preco: 18.90,
        categoria: "cafes",
        imagem: "assets/imagens/caramel-macchiato.png",
        tags: ["Caramelo", "Especial"]
    },
    {
        id: "affogato",
        nome: "Affogato",
        descricao: "Sorvete de baunilha com espresso quente.",
        preco: 17.90,
        categoria: "cafes",
        imagem: "assets/imagens/affogato.png",
        tags: ["Sobremesa", "Especial"]
    },
    {
        id: "cold-brew",
        nome: "Cold Brew",
        descricao: "Café extraído lentamente em água fria.",
        preco: 14.90,
        categoria: "gelados",
        imagem: "assets/imagens/cold-brew.png",
        tags: ["Gelado"]
    },
    {
        id: "iced-latte",
        nome: "Iced Latte",
        descricao: "Espresso com leite e gelo.",
        preco: 16.90,
        categoria: "gelados",
        imagem: "assets/imagens/iced-latte.png",
        tags: ["Gelado", "Com Leite"]
    },
    {
        id: "iced-mocha",
        nome: "Iced Mocha",
        descricao: "Café gelado com leite e chocolate.",
        preco: 18.90,
        categoria: "gelados",
        imagem: "assets/imagens/iced-mocha.png",
        tags: ["Gelado", "Chocolate"]
    },

    {
        id: "croissant-tradicional",
        nome: "Croissant Tradicional",
        descricao: "Massa folhada amanteigada e crocante.",
        preco: 12.90,
        categoria: "salgados",
        imagem: "assets/imagens/croissant-tradicional.png",
        tags: ["Folhado"]
    },
    {
        id: "croissant-amendoas",
        nome: "Croissant de Amêndoas",
        descricao: "Croissant especial com recheio e cobertura de amêndoas.",
        preco: 16.90,
        categoria: "doces",
        imagem: "assets/imagens/croissant-amendoas.png",
        tags: ["Doce", "Especial"]
    },

    {
        id: "brownie-chocolate",
        nome: "Brownie de Chocolate",
        descricao: "Brownie macio com sabor intenso de chocolate.",
        preco: 13.90,
        categoria: "doces",
        imagem: "assets/imagens/brownie.png",
        tags: ["Chocolate"]
    },
    {
        id: "torradas-artesanais",
        nome: "Torradas Artesanais",
        descricao: "Pão tostado servido com manteiga ou geleia.",
        preco: 10.90,
        categoria: "salgados",
        imagem: "assets/imagens/torradas-artesanais.png",
        tags: ["Clássico"]
    },
    {
        id: "misto-quente",
        nome: "Misto Quente",
        descricao: "Pão dourado com queijo derretido e presunto.",
        preco: 14.90,
        categoria: "salgados",
        imagem: "assets/imagens/misto-quente.png",
        tags: ["Salgado"]
    },
    {
        id: "pao-de-queijo",
        nome: "Pão de Queijo",
        descricao: "Casquinha levemente crocante e interior macio.",
        preco: 8.90,
        categoria: "salgados",
        imagem: "assets/imagens/pao-de-queijo.png",
        tags: ["Tradicional"]
    },
    {
        id: "cookie-chocolate",
        nome: "Cookie de Chocolate",
        descricao: "Cookie amanteigado com gotas de chocolate.",
        preco: 9.90,
        categoria: "doces",
        imagem: "assets/imagens/cookie-de-chocolate.png",
        tags: ["Cookie", "Chocolate"]
    },
    {
        id: "cinnamon-roll",
        nome: "Cinnamon Roll",
        descricao: "Rocambole de canela com cobertura cremosa.",
        preco: 14.90,
        categoria: "doces",
        imagem: "assets/imagens/cinnamon-roll.png",
        tags: ["Canela"]
    },
    {
        id: "cheesecake",
        nome: "Cheesecake",
        descricao: "Torta cremosa com calda de frutas vermelhas.",
        preco: 17.90,
        categoria: "doces",
        imagem: "assets/imagens/cheesecake.png",
        tags: ["Sobremesa"]
    },
    {
        id: "bolo-cenoura",
        nome: "Bolo de Cenoura",
        descricao: "Bolo macio com cobertura de chocolate.",
        preco: 12.90,
        categoria: "doces",
        imagem: "assets/imagens/bolo-de-cenoura.png",
        tags: ["Bolo", "Chocolate"]
    }
];

const gridCardapio = document.getElementById("grid-cardapio");
const buscaProduto = document.getElementById("busca-produto");
const botoesFiltro = document.querySelectorAll(".filtro-btn");
const quantidadeProdutos = document.getElementById("quantidade-produtos");
const estadoVazio = document.getElementById("estado-vazio");

let categoriaAtual = "todos";
let termoBusca = "";

function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function criarCard(produto) {
    const article = document.createElement("article");
    article.className = "cardapio-card";

    const tagsHtml = produto.tags
        .map(tag => `<span class="cardapio-tag">${tag}</span>`)
        .join("");

    article.innerHTML = `
        <div class="cardapio-foto">
            <img src="${produto.imagem}" alt="${produto.nome}" loading="lazy">
        </div>

        <div class="cardapio-info">
            <h3>${produto.nome}</h3>
            <p>${produto.descricao}</p>

            <div class="cardapio-tags">
                ${tagsHtml}
            </div>

            <div class="cardapio-rodape">
                <span class="cardapio-preco">${formatarPreco(produto.preco)}</span>
                <button class="cardapio-botao" type="button" data-id="${produto.id}">
                    + Adicionar
                </button>
            </div>
        </div>
    `;

    // BOTÃO PERSONALIZAR - CAPPUCCINO

    
if ([
    "macchiato",
    "cappuccino-classico",
    "latte",
    "flat-white",
    "mocha",
    "caramel-macchiato",
    "iced-latte",
    "iced-mocha"
].includes(produto.id)) {


        const botaoPersonalizar =
            document.createElement("button");

        botaoPersonalizar.type = "button";

        botaoPersonalizar.className =
            "botao-personalizar";

        botaoPersonalizar.textContent =
            "Personalizar";

        botaoPersonalizar.dataset.personalizar = "";
        botaoPersonalizar.dataset.id = produto.id;
        botaoPersonalizar.dataset.nome = produto.nome;
        botaoPersonalizar.dataset.preco =
            String(produto.preco);

        article.querySelector(
            ".cardapio-info"
        ).appendChild(botaoPersonalizar);

    }

    return article;
}

function obterProdutosFiltrados() {
    return produtosCardapio.filter(produto => {
        const correspondeCategoria =
            categoriaAtual === "todos" || produto.categoria === categoriaAtual;

        const correspondeBusca =
            produto.nome.toLowerCase().includes(termoBusca) ||
            produto.descricao.toLowerCase().includes(termoBusca);

        return correspondeCategoria && correspondeBusca;
    });
}

function renderizarCardapio() {
    const filtrados = obterProdutosFiltrados();

    gridCardapio.innerHTML = "";
    quantidadeProdutos.textContent = filtrados.length;

    if (filtrados.length === 0) {
        estadoVazio.hidden = false;
        return;
    }

    estadoVazio.hidden = true;

    filtrados.forEach(produto => {
        const card = criarCard(produto);
        gridCardapio.appendChild(card);
    });

    ativarBotoesAdicionar();
}

function ativarBotoesAdicionar() {
    const botoes = document.querySelectorAll(".cardapio-botao");

    botoes.forEach(botao => {
        botao.addEventListener("click", () => {
            const id = botao.dataset.id;
            const produto = produtosCardapio.find(item => item.id === id);

            if (!produto) return;

            adicionarItemAoCarrinho({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco
            });

            mostrarMensagem(`${produto.nome} adicionado ao carrinho!`);
        });
    });
}

buscaProduto.addEventListener("input", (evento) => {
    termoBusca = evento.target.value.trim().toLowerCase();
    renderizarCardapio();
});

botoesFiltro.forEach(botao => {
    botao.addEventListener("click", () => {
        botoesFiltro.forEach(btn => btn.classList.remove("ativo"));
        botao.classList.add("ativo");

        categoriaAtual = botao.dataset.categoria;
        renderizarCardapio();
    });
});

renderizarCardapio();