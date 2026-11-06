const button = document.getElementById("buscarDoacao");

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

  box.textContent = messages[choice];
  box.style.display = "block";
});

const search = document.getElementById("buscaDica");

search.addEventListener("input", () => {
  const term = search.value.trim().toLocaleLowerCase("pt-BR");

  const items = [
    ...document.querySelectorAll("#listaDicas .tip")
  ];

  let visible = 0;

  items.forEach((item) => {
    const words = (
      item.dataset.words + " " + item.textContent
    ).toLocaleLowerCase("pt-BR");

    const match = words.includes(term);

    item.style.display = match ? "block" : "none";

    if (match) {
      visible++;
    }
  });

  document.getElementById("semResultado").hidden = visible > 0;
});
