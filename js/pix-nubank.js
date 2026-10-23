
/* =========================================
   CASA DO GRÃO — PIX NUBANK
   Cobrança com conferência manual
========================================= */

(() => {

    const formulario = document.getElementById(
        "form-finalizacao"
    );

    if (!formulario) return;

    /* CONFIGURAÇÃO DO RECEBEDOR */

    const CHAVE_PIX = "d54a2399-e0fe-4c97-af0b-118863485a28";
    const NOME_RECEBEDOR = "Lucas de Oliveira Lopes";
    const CIDADE_RECEBEDOR = "Porto Alegre";

    /* CRIAR A ÁREA DE PAGAMENTO */

    const areaPix = document.createElement("section");

    areaPix.className = "pagamento-pix";
    areaPix.hidden = true;

    areaPix.innerHTML = `
        <h2>Pagamento via Pix</h2>

        <p>
            Pague diretamente para a conta Nubank
            vinculada à chave Pix da cafeteria.
        </p>

        <button
            type="button"
            id="gerar-pix"
            class="pix-botao">
            Gerar Pix do pedido
        </button>

        <div id="pix-resultado" hidden>

            <p class="pix-valor">
                Valor do Pix:
                <strong id="pix-valor-total"></strong>
            </p>

            <div id="pix-qrcode"></div>

            <label for="pix-codigo">
                Pix Copia e Cola
            </label>

            <textarea
                id="pix-codigo"
                rows="4"
                readonly></textarea>

            <button
                type="button"
                id="copiar-pix"
                class="pix-botao">
                Copiar código Pix
            </button>

            <a
                href="acompanhar-pedido.html"
                class="pix-botao pix-acompanhar">

                Acompanhar meu pedido

            </a>

            <p class="pix-aviso">
                Após pagar, aguarde a conferência
                do recebimento pela cafeteria.
                O pedido não é confirmado
                automaticamente.
            </p>

        </div>

        <p id="pix-mensagem" role="status"></p>
    `;

    formulario.appendChild(areaPix);

    const botaoGerar = document.getElementById("gerar-pix");
    const botaoCopiar = document.getElementById("copiar-pix");
    const resultado = document.getElementById("pix-resultado");
    const campoCodigo = document.getElementById("pix-codigo");
    const mensagem = document.getElementById("pix-mensagem");
    const qrContainer = document.getElementById("pix-qrcode");
    const valorNaTela = document.getElementById("pix-valor-total");

    /* CAMPOS DO PADRÃO BR CODE */

    function campo(id, valor) {

        const texto = String(valor);

        if (texto.length > 99) {
            throw new Error("Campo Pix muito longo.");
        }

        return id +
            String(texto.length).padStart(2, "0") +
            texto;
    }

    /* NORMALIZAR NOME E CIDADE */

    function normalizar(texto, limite) {

        return texto
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9 -]/g, "")
            .trim()
            .toUpperCase()
            .slice(0, limite);
    }

    /* CRC16 DO PIX */

    function calcularCRC16(texto) {

        let crc = 0xFFFF;

        for (let i = 0; i < texto.length; i++) {

            crc ^= texto.charCodeAt(i) << 8;

            for (let bit = 0; bit < 8; bit++) {

                if (crc & 0x8000) {
                    crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
                } else {
                    crc = (crc << 1) & 0xFFFF;
                }
            }
        }

        return crc.toString(16)
            .toUpperCase()
            .padStart(4, "0");
    }

    /* GERAR PIX COPIA E COLA */

    function gerarCodigoPix(valor) {

        if (
            CHAVE_PIX === "SUA_CHAVE_ALEATORIA_AQUI" ||
            NOME_RECEBEDOR === "NOME_DO_TITULAR" ||
            CIDADE_RECEBEDOR === "SUA_CIDADE"
        ) {
            throw new Error(
                "Configure sua chave Pix, nome e cidade."
            );
        }

        const chave = CHAVE_PIX.trim();

        if (!chave || chave.length > 77) {
            throw new Error("Chave Pix inválida.");
        }

        const nome = normalizar(NOME_RECEBEDOR, 25);
        const cidade = normalizar(CIDADE_RECEBEDOR, 15);

        if (!nome || !cidade) {
            throw new Error("Dados do recebedor inválidos.");
        }

        const contaPix =
            campo("00", "br.gov.bcb.pix") +
            campo("01", chave);

        const identificador =
            "CG" + Date.now().toString(36).toUpperCase();

        const dadosAdicionais =
            campo("05", identificador);

        const codigo =
            campo("00", "01") +
            campo("26", contaPix) +
            campo("52", "0000") +
            campo("53", "986") +
            campo("54", valor.toFixed(2)) +
            campo("58", "BR") +
            campo("59", nome) +
            campo("60", cidade) +
            campo("62", dadosAdicionais) +
            "6304";

        return codigo + calcularCRC16(codigo);
    }

    /* OBTER O TOTAL EXIBIDO NO CHECKOUT */

    function obterTotal() {

        const elemento = document.getElementById(
            "total-finalizacao"
        );

        const texto = elemento?.textContent || "";

        const valor = Number(
            texto
                .replace(/\./g, "")
                .replace(/[^\d,]/g, "")
                .replace(",", ".")
        );

        if (!Number.isFinite(valor) || valor <= 0) {
            return null;
        }

        return valor;
    }

    /* EXIBIR PAGAMENTO APÓS A REVISÃO */

    formulario.addEventListener("submit", () => {

        queueMicrotask(() => {

            
const revisao = formulario.querySelector(
    "section.finalizacao-painel"
);


            const recebimento = formulario.querySelector(
                'input[name="recebimento"]:checked'
            )?.value;

            areaPix.hidden = !revisao;
            resultado.hidden = true;
            mensagem.textContent = "";

            if (!revisao) return;

            
            // PIX DISPONÍVEL PARA RETIRADA E ENTREGA

            botaoGerar.disabled = false;

            mensagem.textContent =
                recebimento === "entrega"
                    ? "Taxa fixa de R$ 5,00 incluída no total."
                    : "Retirada sem taxa de entrega.";


        });
    });

    /* INVALIDAR PAGAMENTO SE EDITAR PEDIDO */

    function invalidarPagamento() {

        areaPix.hidden = true;
        resultado.hidden = true;
        campoCodigo.value = "";
    }

    formulario.addEventListener(
        "input",
        invalidarPagamento
    );

    formulario.addEventListener(
        "change",
        invalidarPagamento
    );

    /* GERAR COBRANÇA */

    botaoGerar.addEventListener("click", async () => {

        const recebimento = formulario.querySelector(
            'input[name="recebimento"]:checked'
        )?.value;


        const revisao = formulario.querySelector(
            "section.finalizacao-painel"
        );

        if (!revisao) {
            mensagem.textContent =
                "Revise o pedido antes de gerar o Pix.";
            return;
        }

        const total = obterTotal();

        if (total === null) {
            mensagem.textContent =
                "Não foi possível calcular o valor.";
            return;
        }

        try {

            
const itens = JSON.parse(
    localStorage.getItem("casaDoGraoCarrinho") || "[]"
);

const cliente = {
    nome: document.getElementById("cliente-nome").value,
    telefone: document.getElementById("cliente-telefone").value,
    rua: document.getElementById("entrega-rua").value,
    bairro: document.getElementById("entrega-bairro").value,
    cidade: document.getElementById("entrega-cidade").value,
    complemento: document.getElementById(
        "entrega-complemento"
    ).value
};

botaoGerar.disabled = true;

const resposta = await fetch("/api/pedidos", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        itens,
        recebimento,
        cliente,
        totalEsperadoCentavos: Math.round(total * 100)
    })
});

const registro = await resposta.json();

if (!resposta.ok) {
    botaoGerar.disabled = false;
    throw new Error(
        registro.erro || "Erro ao registrar pedido."
    );
}

// Código Pix calculado pelo servidor
const codigo = registro.pixCopiaCola;

// Link exclusivo de acompanhamento do pedido
const linkAcompanhamento = areaPix.querySelector(
    ".pix-acompanhar"
);

if (linkAcompanhamento) {
    linkAcompanhamento.href =
        "acompanhar-pedido.html?token=" +
        encodeURIComponent(registro.token);
}


            campoCodigo.value = codigo;

            valorNaTela.textContent =
                total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                });

            qrContainer.replaceChildren();

            if (typeof window.QRCode === "function") {

                new window.QRCode(qrContainer, {
                    text: codigo,
                    width: 200,
                    height: 200,
                    colorDark: "#000000",
                    colorLight: "#FFFFFF",
                    correctLevel: window.QRCode.CorrectLevel.M
                });

            } else {
                qrContainer.textContent =
                    "QR Code indisponível. " +
                    "Utilize o Pix Copia e Cola.";
            }

            resultado.hidden = false;

            mensagem.textContent =
                "Confira o nome do recebedor " +
                "e o valor no aplicativo do banco.";

        } catch (erro) {

            mensagem.textContent = erro.message;
            console.error(erro);

        }
    });

    /* COPIAR CÓDIGO */

    botaoCopiar.addEventListener("click", async () => {

        try {

            await navigator.clipboard.writeText(
                campoCodigo.value
            );

            mensagem.textContent =
                "Código Pix copiado!";

        } catch (erro) {

            campoCodigo.focus();
            campoCodigo.select();

            mensagem.textContent =
                "Selecione e copie o código manualmente.";

        }
    });

})();
