
/* CASA DO GRÃO — SERVIDOR LOCAL DE TESTES */

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const PORTA = 3000;
const RAIZ = path.resolve(__dirname, "..");
const ARQUIVO = path.join(__dirname, "pedidos.json");

const SENHA_ADMIN = process.env.ADMIN_PASSWORD;
const CHAVE_PIX = process.env.PIX_CHAVE;
const NOME_PIX = process.env.PIX_NOME;
const CIDADE_PIX = process.env.PIX_CIDADE;

if (
    !SENHA_ADMIN ||
    SENHA_ADMIN.length < 12 ||
    !CHAVE_PIX ||
    !NOME_PIX ||
    !CIDADE_PIX
) {
    console.error(
        "Configure ADMIN_PASSWORD, PIX_CHAVE, " +
        "PIX_NOME e PIX_CIDADE no terminal. " +
        "A senha deve ter pelo menos 12 caracteres."
    );
    process.exit(1);
}

/* PREÇOS OFICIAIS EM CENTAVOS */

const CATALOGO = {
    "espresso-classico": ["Espresso Clássico", 790],
    "espresso-duplo": ["Espresso Duplo", 1090],
    "ristretto": ["Ristretto", 890],
    "americano": ["Americano", 990],
    "macchiato": ["Macchiato", 1090],
    "cappuccino-classico": ["Cappuccino Clássico", 1490],
    "latte": ["Latte", 1590],
    "flat-white": ["Flat White", 1690],
    "mocha": ["Mocha", 1790],
    "caramel-macchiato": ["Caramel Macchiato", 1890],
    "affogato": ["Affogato", 1790],
    "cold-brew": ["Cold Brew", 1490],
    "iced-latte": ["Iced Latte", 1690],
    "iced-mocha": ["Iced Mocha", 1890],
    "croissant-tradicional": ["Croissant Tradicional", 1290],
    "croissant-amendoas": ["Croissant de Amêndoas", 1690],
    "brownie-chocolate": ["Brownie de Chocolate", 1390],
    "torradas-artesanais": ["Torradas Artesanais", 1090],
    "misto-quente": ["Misto Quente", 1490],
    "pao-de-queijo": ["Pão de Queijo", 890],
    "cookie-chocolate": ["Cookie de Chocolate", 990],
    "cinnamon-roll": ["Cinnamon Roll", 1490],
    "cheesecake": ["Cheesecake", 1790],
    "bolo-cenoura": ["Bolo de Cenoura", 1290]
};

const PERSONALIZAVEIS = [
    "macchiato", "cappuccino-classico", "latte",
    "flat-white", "mocha", "caramel-macchiato",
    "iced-latte", "iced-mocha"
];

const TAMANHOS = {
    pequeno: ["Pequeno", -200],
    medio: ["Médio", 0],
    grande: ["Grande", 300]
};

const LEITES = {
    integral: ["Integral", 0],
    desnatado: ["Desnatado", 0],
    vegetal: ["Vegetal", 250],
    "zero-lactose": ["Zero lactose", 150]
};

const sessoes = new Map();

let pedidos = fs.existsSync(ARQUIVO)
    ? JSON.parse(fs.readFileSync(ARQUIVO, "utf8"))
    : [];

function salvar() {
    const temporario = ARQUIVO + ".tmp";

    fs.writeFileSync(
        temporario,
        JSON.stringify(pedidos, null, 2)
    );

    fs.renameSync(temporario, ARQUIVO);
}

function enviar(res, status, dados, cabecalhos = {}) {
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        ...cabecalhos
    });

    res.end(JSON.stringify(dados));
}

async function lerJSON(req) {
    let texto = "";

    for await (const parte of req) {
        texto += parte;

        if (texto.length > 30000) {
            throw new Error("Dados muito grandes.");
        }
    }

    return JSON.parse(texto || "{}");
}

function textoSeguro(valor, limite = 100) {
    return typeof valor === "string"
        ? valor.trim().slice(0, limite)
        : "";
}

/* VALIDAR ITENS E PERSONALIZAÇÕES */

function consultarProduto(id) {

    if (CATALOGO[id]) {
        return {
            nome: CATALOGO[id][0],
            precoCentavos: CATALOGO[id][1]
        };
    }

    for (const [tamanho, infoTam] of Object.entries(TAMANHOS)) {
        for (const [leite, infoLeite] of Object.entries(LEITES)) {
            for (const extra of [false, true]) {
                for (const calda of [false, true]) {

                    const adicional =
                        infoLeite[1] +
                        (extra ? 350 : 0) +
                        (calda ? 200 : 0);

                    // PERSONALIZADOR DA PÁGINA INICIAL

                    const idHome = [
                        "cappuccino-personalizado",
                        tamanho,
                        leite,
                        extra ? "extra" : "normal",
                        calda ? "chocolate" : "sem-calda"
                    ].join("-");

                    if (id === idHome) {
                        const base = {
                            pequeno: 1290,
                            medio: 1490,
                            grande: 1790
                        }[tamanho];

                        return {
                            nome: "Cappuccino Clássico — " +
                                infoTam[0] + ", Leite " +
                                infoLeite[0],
                            precoCentavos: base + adicional
                        };
                    }

                    // PERSONALIZADOR DO CARDÁPIO

                    for (const produtoId of PERSONALIZAVEIS) {

                        const idCardapio = [
                            "personalizado",
                            produtoId,
                            tamanho,
                            leite,
                            extra ? "extra" : "normal",
                            calda ? "calda" : "sem-calda"
                        ].join("-");

                        if (id !== idCardapio) continue;

                        const base = CATALOGO[produtoId];

                        return {
                            nome: base[0] + " — " +
                                infoTam[0] + ", Leite " +
                                infoLeite[0] +
                                (extra ? ", Dose extra" : "") +
                                (calda ? ", Calda de chocolate" : ""),
                            precoCentavos:
                                base[1] +
                                infoTam[1] +
                                adicional
                        };
                    }
                }
            }
        }
    }

    return null;
}

/* GERAR PIX BR CODE */

function campo(id, valor) {
    const texto = String(valor);

    if (texto.length > 99) {
        throw new Error("Campo Pix inválido.");
    }

    return id + String(texto.length).padStart(2, "0") + texto;
}

function normalizar(valor, maximo) {
    return valor.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9 -]/g, "")
        .trim()
        .toUpperCase()
        .slice(0, maximo);
}

function pixDoPedido(pedido) {

    const conta =
        campo("00", "br.gov.bcb.pix") +
        campo("01", CHAVE_PIX.trim());

    const base =
        campo("00", "01") +
        campo("26", conta) +
        campo("52", "0000") +
        campo("53", "986") +
        campo("54", (pedido.totalCentavos / 100).toFixed(2)) +
        campo("58", "BR") +
        campo("59", normalizar(NOME_PIX, 25)) +
        campo("60", normalizar(CIDADE_PIX, 15)) +
        campo("62", campo("05", pedido.numero.slice(0, 25))) +
        "6304";

    let crc = 0xFFFF;

    for (const caractere of base) {
        crc ^= caractere.charCodeAt(0) << 8;

        for (let i = 0; i < 8; i++) {
            crc = crc & 0x8000
                ? ((crc << 1) ^ 0x1021) & 0xFFFF
                : (crc << 1) & 0xFFFF;
        }
    }

    return base + crc.toString(16)
        .toUpperCase().padStart(4, "0");
}

/* AUTENTICAÇÃO ADMINISTRATIVA */

function autorizado(req) {
    const cookie = req.headers.cookie || "";
    const id = cookie.match(/(?:^|;\s*)sessao=([^;]+)/)?.[1];
    const vencimento = sessoes.get(id);

    return Boolean(vencimento && vencimento > Date.now());
}

function senhaCorreta(recebida) {
    if (typeof recebida !== "string") return false;

    const calcular = valor =>
        crypto.createHash("sha256").update(valor).digest();

    return crypto.timingSafeEqual(
        calcular(recebida),
        calcular(SENHA_ADMIN)
    );
}

/* ARQUIVOS PÚBLICOS */

function servirArquivo(req, res, url) {

    const caminhoURL = decodeURIComponent(url.pathname);

    if (
        caminhoURL.startsWith("/backend/") ||
        caminhoURL.split("/").some(p => p.startsWith("."))
    ) {
        res.writeHead(403);
        return res.end();
    }

    const relativo = caminhoURL === "/"
        ? "/index.html"
        : caminhoURL;

    const arquivo = path.resolve(RAIZ, "." + relativo);

    if (!arquivo.startsWith(RAIZ + path.sep)) {
        res.writeHead(403);
        return res.end();
    }

    const extensoes = {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".mp4": "video/mp4",
        ".woff": "font/woff",
        ".woff2": "font/woff2"
    };

    if (!extensoes[path.extname(arquivo)]) {
        res.writeHead(403);
        return res.end();
    }

    fs.stat(arquivo, (erro, info) => {

        if (erro || !info.isFile()) {
            res.writeHead(404);
            return res.end("Arquivo não encontrado.");
        }

        res.writeHead(200, {
            "Content-Type": extensoes[path.extname(arquivo)]
        });

        fs.createReadStream(arquivo).pipe(res);
    });
}

/* ROTAS DO SERVIDOR */

const servidor = http.createServer(async (req, res) => {

    try {

        const url = new URL(
            req.url,
            "http://127.0.0.1:" + PORTA
        );

        const rota = url.pathname;

        if (!rota.startsWith("/api/")) {
            return servirArquivo(req, res, url);
        }

        // Não aceitar requisições de outras origens

        if (req.method !== "GET") {
            const origem = req.headers.origin;

            if (
                origem &&
                origem !== "http://127.0.0.1:" + PORTA &&
                origem !== "http://localhost:" + PORTA
            ) {
                return enviar(res, 403, {
                    erro: "Origem não permitida."
                });
            }
        }

        /* CRIAR PEDIDO */

        if (rota === "/api/pedidos" && req.method === "POST") {

            const dados = await lerJSON(req);

            if (
                !Array.isArray(dados.itens) ||
                dados.itens.length === 0 ||
                dados.itens.length > 50
            ) {
                throw new Error("Carrinho inválido.");
            }

            const recebimento = dados.recebimento;

            if (!["retirada", "entrega"].includes(recebimento)) {
                throw new Error("Recebimento inválido.");
            }

            const cliente = dados.cliente || {};
            const nome = textoSeguro(cliente.nome);
            const telefone = textoSeguro(cliente.telefone, 20);

            if (
                !nome ||
                !/^\d{10,11}$/.test(telefone.replace(/\D/g, ""))
            ) {
                throw new Error("Nome ou telefone inválido.");
            }

            const rua = textoSeguro(cliente.rua, 150);
            const bairro = textoSeguro(cliente.bairro);
            const cidade = textoSeguro(cliente.cidade);
            const complemento = textoSeguro(cliente.complemento, 150);

            if (
                recebimento === "entrega" &&
                (!rua || !bairro || !cidade)
            ) {
                throw new Error("Endereço incompleto.");
            }

            const itens = dados.itens.map(item => {

                if (
                    !item ||
                    typeof item.id !== "string" ||
                    !Number.isInteger(item.quantidade) ||
                    item.quantidade < 1 ||
                    item.quantidade > 20
                ) {
                    throw new Error("Quantidade inválida.");
                }

                const produto = consultarProduto(item.id);

                if (!produto) {
                    throw new Error(
                        "Produto não reconhecido: " + item.id
                    );
                }

                return {
                    id: item.id,
                    nome: produto.nome,
                    precoCentavos: produto.precoCentavos,
                    quantidade: item.quantidade
                };
            });

            const subtotalCentavos = itens.reduce(
                (soma, item) =>
                    soma + item.precoCentavos * item.quantidade,
                0
            );

            const freteCentavos =
                recebimento === "entrega" ? 500 : 0;

            const totalCentavos =
                subtotalCentavos + freteCentavos;

            if (
                totalCentavos <= 0 ||
                totalCentavos > 10000000 ||
                dados.totalEsperadoCentavos !== totalCentavos
            ) {
                throw new Error(
                    "O total não corresponde aos preços do servidor."
                );
            }

            const pedido = {
                id: crypto.randomUUID(),
                numero: "CG" + crypto.randomBytes(6)
                    .toString("hex").toUpperCase(),
                token: crypto.randomBytes(24)
                    .toString("hex"),
                criadoEm: new Date().toISOString(),
                recebimento,
                cliente: {
                    nome,
                    telefone,
                    endereco: [rua, bairro, cidade, complemento]
                        .filter(Boolean).join(", ")
                },
                itens,
                subtotalCentavos,
                freteCentavos,
                totalCentavos,
                status: "aguardando_pix"
            };

            pedidos.unshift(pedido);
            salvar();

            return enviar(res, 201, {
                numero: pedido.numero,
                token: pedido.token,
                totalCentavos,
                pixCopiaCola: pixDoPedido(pedido)
            });
        }

        /* CONSULTA DO CLIENTE */

        if (
            rota === "/api/pedidos/status" &&
            req.method === "GET"
        ) {
            const token = url.searchParams.get("token");

            const pedido = pedidos.find(
                p => p.token === token
            );

            if (!pedido) {
                return enviar(res, 404, {
                    erro: "Pedido não encontrado."
                });
            }

            return enviar(res, 200, {
                numero: pedido.numero,
                status: pedido.status
            });
        }

        /* LOGIN */

        if (
            rota === "/api/admin/login" &&
            req.method === "POST"
        ) {
            const dados = await lerJSON(req);

            if (!senhaCorreta(dados.senha)) {
                return enviar(res, 401, {
                    erro: "Senha incorreta."
                });
            }

            const token = crypto.randomBytes(32)
                .toString("hex");

            sessoes.set(
                token,
                Date.now() + 8 * 60 * 60 * 1000
            );

            return enviar(res, 200, { ok: true }, {
                "Set-Cookie":
                    `sessao=${token}; HttpOnly; ` +
                    "SameSite=Strict; Path=/; Max-Age=28800"
            });
        }

        /* SAIR */

        if (
            rota === "/api/admin/sair" &&
            req.method === "POST"
        ) {
            const id = (req.headers.cookie || "")
                .match(/(?:^|;\s*)sessao=([^;]+)/)?.[1];

            sessoes.delete(id);

            return enviar(res, 200, { ok: true }, {
                "Set-Cookie":
                    "sessao=; HttpOnly; SameSite=Strict; " +
                    "Path=/; Max-Age=0"
            });
        }

        /* VERIFICAR PERMISSÃO ADMIN */

        if (rota.startsWith("/api/admin/") && !autorizado(req)) {
            return enviar(res, 401, {
                erro: "Não autorizado."
            });
        }

        /* LISTAR PEDIDOS */

        if (
            rota === "/api/admin/pedidos" &&
            req.method === "GET"
        ) {
            return enviar(res, 200, {
                pedidos: pedidos.map(
                    ({ token, ...pedido }) => pedido
                )
            });
        }

        /* ATUALIZAR STATUS */

        const correspondencia = rota.match(
            /^\/api\/admin\/pedidos\/([a-f0-9-]+)$/
        );

        if (
            correspondencia &&
            req.method === "PATCH"
        ) {
            const dados = await lerJSON(req);

            const pedido = pedidos.find(
                p => p.id === correspondencia[1]
            );

            if (!pedido) {
                return enviar(res, 404, {
                    erro: "Pedido não encontrado."
                });
            }

            
            const transicoes = {
                aguardando_pix: "pago",
                pago: "preparando",
                preparando: "pronto",
                pronto: "concluido"
            };


            if (transicoes[pedido.status] !== dados.status) {
                return enviar(res, 400, {
                    erro: "Mudança de status não permitida."
                });
            }

            pedido.status = dados.status;
            salvar();

            return enviar(res, 200, {
                ok: true,
                status: pedido.status
            });
        }

        enviar(res, 404, {
            erro: "Rota não encontrada."
        });

    } catch (erro) {

        console.error(erro.message);

        enviar(res, 400, {
            erro: erro.message
        });
    }
});

servidor.listen(PORTA, "127.0.0.1", () => {

    console.log(
        "Casa do Grão: http://127.0.0.1:" + PORTA
    );

    console.log(
        "Painel: http://127.0.0.1:" +
        PORTA + "/admin.html"
    );
});
