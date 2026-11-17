
/* =================================
   1. BUSCA DE DOAÇÕES
================================= */

const button = document.getElementById("buscarDoacao");

if (button) {
    button.addEventListener("click", () => {

        const choice = document.getElementById("tipoDoacao").value;
        const box = document.getElementById("resultadoDoacao");

        const messages = {
            roupas:
                "Separe peças limpas e em bom estado. Confirme com a instituição se ela está recebendo roupas neste momento.",

            agasalhos:
                "Procure campanhas de agasalhos e confirme as datas, os itens aceitos e o local de entrega.",

            textil:
                "Para peças danificadas, procure iniciativas que aceitem resíduos têxteis. Nem toda campanha recebe roupas sem condição de uso."
        };

        box.textContent = messages[choice] || "Selecione uma opção.";
        box.style.display = "block";
    });
}


/* =================================
   2. BUSCA DE DICAS
================================= */

const search = document.getElementById("buscaDica");

if (search) {

    search.addEventListener("input", () => {

        const term = search.value.trim().toLocaleLowerCase("pt-BR");

        const items = [
            ...document.querySelectorAll("#listaDicas .tip")
        ];

        let visible = 0;

        items.forEach((item) => {

            const words = (
                (item.dataset.words || "") + " " + item.textContent
            ).toLocaleLowerCase("pt-BR");

            const match = words.includes(term);

            item.style.display = match ? "block" : "none";

            if (match) {
                visible++;
            }
        });

        const noResult = document.getElementById("semResultado");

        if (noResult) {
            noResult.hidden = visible > 0;
        }
    });
}


/* =================================
   3. BUSCA DE BRECHÓS
================================= */

const buscarBrechos = document.getElementById("buscarBrechos");
const localBrecho = document.getElementById("localBrecho");
const resultadoBrechos = document.getElementById("resultadoBrechos");
const mapaBrechos = document.getElementById("mapaBrechos");


/* =================================
   4. CALCULAR DISTÂNCIA
================================= */

function calcularDistancia(lat1, lon1, lat2, lon2) {

    const raio = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );

    return raio * c;
}


/* =================================
   5. ATUALIZAR GOOGLE MAPS
================================= */

function atualizarMapa(pesquisa) {

    if (!mapaBrechos) return;

    const url = new URL("https://www.google.com/maps");

    url.searchParams.set("q", pesquisa);
    url.searchParams.set("output", "embed");

    mapaBrechos.src = url.toString();
}


/* =================================
   6. MOSTRAR MENSAGENS
================================= */

function mostrarMensagem(mensagem) {

    if (!resultadoBrechos) return;

    resultadoBrechos.innerHTML = "";

    const texto = document.createElement("p");

    texto.className = "note";
    texto.textContent = mensagem;

    resultadoBrechos.appendChild(texto);
}


/* =================================
   7. MOSTRAR RESULTADOS DOS BRECHÓS
================================= */

function mostrarBrechos(lugares, latitude, longitude) {

    if (!resultadoBrechos) return;

    resultadoBrechos.innerHTML = "";

    if (lugares.length === 0) {

        mostrarMensagem(
            "Não encontramos brechós cadastrados nessa região. Tente outro bairro ou confira a pesquisa no Google Maps."
        );

        return;
    }

    // Organizar pela distância
    lugares.sort((a, b) => a.distancia - b.distancia);

    lugares.forEach((lugar) => {

        const tags = lugar.tags || {};

        // Nome
        const nome = tags.name || "Brechó sem nome informado";

        // Endereço
        const rua = tags["addr:street"] || "";
        const numero = tags["addr:housenumber"] || "";
        const bairro = tags["addr:suburb"] || "";
        const cidade = tags["addr:city"] || "";

        const endereco = [
            rua,
            numero,
            bairro,
            cidade
        ].filter(Boolean).join(", ");

        const enderecoFinal = endereco || "Endereço não informado";

        // Distância
        const distancia = lugar.distancia.toFixed(1);

        // Telefone cadastrado
        const telefone =
            tags.phone ||
            tags["contact:phone"] ||
            tags["phone:mobile"] ||
            "";

        // Link para o Google Maps
        const pesquisaMaps = `${nome}, ${enderecoFinal}`;

        const linkMaps = new URL(
            "https://www.google.com/maps/search/"
        );

        linkMaps.searchParams.set("api", "1");
        linkMaps.searchParams.set("query", pesquisaMaps);

        // Criar cartão
        const card = document.createElement("article");

        card.className = "brecho-item";

        // Título
        const titulo = document.createElement("h4");

        titulo.textContent = nome;

        // Endereço
        const enderecoTexto = document.createElement("p");

        enderecoTexto.textContent = `Endereço: ${enderecoFinal}`;

        // Distância
        const distanciaTexto = document.createElement("p");

        distanciaTexto.textContent =
            `Aproximadamente ${distancia} km da localização pesquisada.`;

        // Telefone
        const telefoneTexto = document.createElement("p");

        if (telefone) {

            telefoneTexto.textContent = "Telefone: ";

            const telefoneLink = document.createElement("a");

            telefoneLink.textContent = telefone;

            telefoneLink.href =
                `tel:${telefone.replace(/[^\d+]/g, "")}`;

            telefoneTexto.appendChild(telefoneLink);

        } else {

            telefoneTexto.textContent = "Telefone não informado.";

        }

        // Link do Maps
        const link = document.createElement("a");

        link.href = linkMaps.toString();
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "VER NO GOOGLE MAPS →";

        link.addEventListener("click", () => {
            atualizarMapa(pesquisaMaps);
        });

        // Adicionar elementos ao cartão
        card.appendChild(titulo);
        card.appendChild(enderecoTexto);
        card.appendChild(distanciaTexto);
        card.appendChild(telefoneTexto);
        card.appendChild(link);

        resultadoBrechos.appendChild(card);
    });
}


/* =================================
   8. LOCALIZAR CIDADE OU BAIRRO
================================= */

async function localizarRegiao(local) {

    const geocodeURL = new URL(
        "https://photon.komoot.io/api/"
    );

    geocodeURL.searchParams.set("q", `${local}, Brasil`);
    geocodeURL.searchParams.set("limit", "1");

    const resposta = await fetch(geocodeURL.toString());

    if (!resposta.ok) {
        throw new Error(
            `Erro ao localizar região: ${resposta.status}`
        );
    }

    const dados = await resposta.json();

    if (!dados.features || dados.features.length === 0) {
        throw new Error("Localização não encontrada.");
    }

    const coordenadas = dados.features[0].geometry.coordinates;

    return {
        longitude: coordenadas[0],
        latitude: coordenadas[1]
    };
}


/* =================================
   9. BUSCAR BRECHÓS NOS SERVIDORES
================================= */

async function consultarOverpass(consulta) {

    const servidores = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
        "https://overpass.nchc.org.tw/api/interpreter"
    ];

    let ultimoErro = null;

    for (const servidor of servidores) {

        try {

            console.log("Tentando servidor:", servidor);

            const resposta = await fetch(servidor, {

                method: "POST",

                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },

                body: new URLSearchParams({
                    data: consulta
                })

            });

            if (!resposta.ok) {

                throw new Error(
                    `Servidor respondeu com erro ${resposta.status}`
                );

            }

            const dados = await resposta.json();

            console.log("Busca realizada com sucesso!");

            return dados;

        } catch (erro) {

            console.warn(
                "Falha no servidor:",
                servidor,
                erro.message
            );

            ultimoErro = erro;
        }
    }

    throw new Error(
        "Todos os servidores de busca estão indisponíveis. " +
        (ultimoErro?.message || "")
    );
}


/* =================================
   10. PESQUISAR BRECHÓS
================================= */

async function pesquisarBrechos() {

    const local = localBrecho.value.trim();

    if (!local) {

        mostrarMensagem(
            "Digite uma cidade ou bairro para pesquisar."
        );

        localBrecho.focus();

        return;
    }

    buscarBrechos.disabled = true;
    buscarBrechos.textContent = "PESQUISANDO...";

    mostrarMensagem("Procurando brechós próximos...");

    atualizarMapa(`brechós ${local}`);

    try {

        // 1. Localizar a região

        const coordenadas = await localizarRegiao(local);

        const latitude = coordenadas.latitude;
        const longitude = coordenadas.longitude;


        // 2. Preparar consulta ao OpenStreetMap

        const consulta = `
            [out:json][timeout:25];

            (
                nwr(around:10000,${latitude},${longitude})["shop"="second_hand"];

                nwr(around:10000,${latitude},${longitude})["second_hand"="yes"];
            );

            out center tags;
        `;


        // 3. Consultar os servidores alternativos

        const dadosBrechos = await consultarOverpass(consulta);


        // 4. Organizar os resultados

        const lugares = dadosBrechos.elements.map((item) => {

            const lat = item.lat ?? item.center?.lat;
            const lon = item.lon ?? item.center?.lon;

            if (lat == null || lon == null) {
                return null;
            }

            return {

                tags: item.tags || {},

                distancia: calcularDistancia(
                    latitude,
                    longitude,
                    lat,
                    lon
                )

            };

        }).filter(Boolean);


        // 5. Mostrar os resultados

        mostrarBrechos(
            lugares,
            latitude,
            longitude
        );

    } catch (erro) {

        console.error("Erro na busca de brechós:", erro);

        mostrarMensagem(
            erro.message === "Localização não encontrada."
                ? "Localização não encontrada. Confira o nome da cidade ou bairro."
                : "Não foi possível realizar a pesquisa agora. Tente novamente ou pesquise diretamente no Google Maps."
        );

    } finally {

        buscarBrechos.disabled = false;
        buscarBrechos.textContent = "BUSCAR BRECHÓS";

    }
}


/* =================================
   11. EVENTOS DA BUSCA
================================= */

if (buscarBrechos && localBrecho && resultadoBrechos) {

    buscarBrechos.addEventListener(
        "click",
        pesquisarBrechos
    );

    localBrecho.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            pesquisarBrechos();

        }

    });

}
