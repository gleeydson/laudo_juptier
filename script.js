// Definir data atual ao carregar a página
window.addEventListener("DOMContentLoaded", () => {
  const dataInput = document.getElementById("data");
  const hoje = new Date().toISOString().split("T")[0];
  dataInput.value = hoje;
});

// Função para coletar dados do formulário
function coletarDados() {
  const mac = document.getElementById("mac").value;
  const data = document.getElementById("data").value;

  if (!mac || !data) {
    alert("Por favor, preencha o MAC e a DATA antes de salvar!");
    return null;
  }

  const dados = {
    mac: mac,
    data: data,
    itens: [],
  };

  // Coletar dados de cada item do checklist (detecta automaticamente a quantidade)
  const totalItens = document.querySelectorAll(".checklist-item").length;

  for (let i = 1; i <= totalItens; i++) {
    const radioSelecionado = document.querySelector(
      `input[name="item${i}"]:checked`
    );
    const obs = document.querySelectorAll(".obs")[i - 1].value;

    const item = {
      numero: i,
      descricao: document.querySelectorAll(".checklist-item label")[i - 1]
        .textContent,
      status: radioSelecionado ? radioSelecionado.value : "NÃO VERIFICADO",
      observacao: obs || "-",
    };

    dados.itens.push(item);
  }

  return dados;
}

// Função para salvar laudo em PDF
function salvarLaudo() {
  const dados = coletarDados();

  if (!dados) return;

  // Salvar no localStorage
  const laudos = JSON.parse(localStorage.getItem("laudos") || "[]");
  dados.id = Date.now();
  dados.dataRegistro = new Date().toLocaleString("pt-BR");
  laudos.push(dados);
  localStorage.setItem("laudos", JSON.stringify(laudos));

  // Mostrar mensagem de processamento
  const resultado = document.getElementById("resultado");
  resultado.innerHTML = `
        <h3 style="color: #4caf50; margin-bottom: 10px;">⏳ Gerando PDF...</h3>
        <p style="margin-bottom: 10px;"><strong>MAC:</strong> ${dados.mac} | <strong>Data:</strong> ${new Date(dados.data).toLocaleDateString("pt-BR")}</p>
        <p style="font-size: 0.9em; color: #666;">
            Aguarde enquanto o PDF está sendo gerado...
        </p>
    `;
  resultado.classList.add("show");

  // Gerar PDF diretamente
  gerarPDF(dados);
}

// Função para gerar PDF otimizado - CAPTURA COMPLETA
function gerarPDF(dados) {
  const mac = dados.mac.replace(/:/g, "");
  const data = dados.data;

  // Adicionar classe temporária para aplicar estilos de impressão
  document.body.classList.add("gerando-pdf");

  // Aguardar para os estilos serem aplicados e layout se ajustar
  setTimeout(() => {
    const elemento = document.querySelector(".container");

    // Configurações para capturar TODO o conteúdo em 1 página
    const opcoes = {
      margin: [5, 5, 5, 5],
      filename: `laudo_${mac}_${data}.pdf`,
      image: {
        type: "jpeg",
        quality: 0.98,
      },
      html2canvas: {
        scale: 3,
        useCORS: true,
        letterRendering: true,
        logging: false,
        scrollY: 0,
        scrollX: 0,
        windowHeight: elemento.scrollHeight,
        height: elemento.scrollHeight,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      },
      pagebreak: {
        mode: ["avoid-all"],
      },
    };

    // Gerar e salvar PDF
    html2pdf()
      .set(opcoes)
      .from(elemento)
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        // Salvar o PDF
        pdf.save(`laudo_${mac}_${data}.pdf`);

        // Remover classe temporária
        document.body.classList.remove("gerando-pdf");

        // Atualizar mensagem de sucesso
        const resultado = document.getElementById("resultado");
        resultado.innerHTML = `
              <h3 style="color: #4caf50; margin-bottom: 10px;">✓ PDF Salvo com Sucesso!</h3>
              <p style="margin-bottom: 10px;"><strong>MAC:</strong> ${
                dados.mac
              } | <strong>Data:</strong> ${new Date(
          dados.data
        ).toLocaleDateString("pt-BR")}</p>
              <p style="font-size: 0.9em; color: #666;">
                  Arquivo: laudo_${mac}_${data}.pdf
              </p>
          `;

        // Esconder mensagem após 5 segundos
        setTimeout(() => {
          resultado.classList.remove("show");
        }, 5000);
      })
      .catch((error) => {
        // Remover classe temporária em caso de erro
        document.body.classList.remove("gerando-pdf");

        // Mostrar mensagem de erro
        const resultado = document.getElementById("resultado");
        resultado.innerHTML = `
              <h3 style="color: #f44336; margin-bottom: 10px;">✗ Erro ao Gerar PDF</h3>
              <p style="font-size: 0.9em; color: #666;">
                  Ocorreu um erro ao gerar o PDF. Tente novamente.
              </p>
          `;

        console.error("Erro ao gerar PDF:", error);

        // Esconder mensagem após 5 segundos
        setTimeout(() => {
          resultado.classList.remove("show");
        }, 5000);
      });
  }, 300); // Aguarda 300ms para garantir que layout esteja completo
}

// Função para imprimir (usa a função nativa do navegador)
function imprimirLaudo() {
  const mac = document.getElementById("mac").value;
  const data = document.getElementById("data").value;

  if (!mac || !data) {
    alert("Por favor, preencha o MAC e a DATA antes de imprimir!");
    return;
  }

  // Usar a função nativa de impressão do navegador
  // Isso usa as regras @media print do CSS
  window.print();
}

// Função para limpar formulário
function limparFormulario() {
  if (confirm("Tem certeza que deseja limpar todo o formulário?")) {
    document.getElementById("checklistForm").reset();
    document.getElementById("mac").value = "";

    // Definir data atual novamente
    const dataInput = document.getElementById("data");
    const hoje = new Date().toISOString().split("T")[0];
    dataInput.value = hoje;

    // Limpar todos os campos de observação
    document.querySelectorAll(".obs").forEach((input) => {
      input.value = "";
    });

    // Esconder resultado se estiver visível
    const resultado = document.getElementById("resultado");
    resultado.classList.remove("show");
  }
}

// Event listeners
document.getElementById("btnSalvar").addEventListener("click", salvarLaudo);
document.getElementById("btnImprimir").addEventListener("click", imprimirLaudo);
document
  .getElementById("btnLimpar")
  .addEventListener("click", limparFormulario);

// Atalhos de teclado
document.addEventListener("keydown", (e) => {
  // Ctrl + S para salvar
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    salvarLaudo();
  }

  // Ctrl + P para imprimir
  if (e.ctrlKey && e.key === "p") {
    e.preventDefault();
    imprimirLaudo();
  }
});

// Auto-save no localStorage a cada 30 segundos (rascunho)
let autoSaveInterval;

function iniciarAutoSave() {
  autoSaveInterval = setInterval(() => {
    const mac = document.getElementById("mac").value;
    if (mac) {
      const dados = coletarDados();
      if (dados) {
        localStorage.setItem("rascunho", JSON.stringify(dados));
        console.log("Rascunho salvo automaticamente");
      }
    }
  }, 30000); // 30 segundos
}

// Carregar rascunho ao iniciar
function carregarRascunho() {
  const rascunho = localStorage.getItem("rascunho");
  if (rascunho) {
    if (confirm("Foi encontrado um rascunho salvo. Deseja carregar?")) {
      const dados = JSON.parse(rascunho);

      // Preencher MAC e DATA
      document.getElementById("mac").value = dados.mac;
      document.getElementById("data").value = dados.data;

      // Preencher itens
      dados.itens.forEach((item, index) => {
        if (item.status !== "NÃO VERIFICADO") {
          const radio = document.querySelector(
            `input[name="item${index + 1}"][value="${item.status}"]`
          );
          if (radio) radio.checked = true;
        }

        if (item.observacao !== "-") {
          document.querySelectorAll(".obs")[index].value = item.observacao;
        }
      });

      // Limpar rascunho
      localStorage.removeItem("rascunho");
    }
  }
}

// Iniciar auto-save
iniciarAutoSave();

// Carregar rascunho ao iniciar
window.addEventListener("load", carregarRascunho);
