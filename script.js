const CONFIG = {
  googleSheetId: "18XKbPRphQ9RmV7lX3XZH4ZJG0GmOv3Pr0KWbx_M0FQw",
  usarDadosDeExemploSeFalhar: true,
  abas: {
    ranking: "Ranking",
    timesSemana: "TimesSemana",
    timesDiaAnterior: "TimesDiaAnterior",
    boss: "Boss",
    ataquesBoss: "AtaquesBoss",
    podio: "Podio",
    lojinha: "Lojinha"
  }
};

const teamColors = {
  "Campeão": "#facc15",
  "Ciano": "#22d3ee",
  "Amarelo": "#fde047",
  "Vermelho": "#ef4444",
  "Verde": "#22c55e"
};

const chartTeamColors = {
  "Campeão": "#123f73",
  "Ciano": "#13bfd7",
  "Amarelo": "#f5bd25",
  "Vermelho": "#c9283d",
  "Verde": "#0fb36c"
};

const teamIcons = {
  "Campeão": "🏆",
  "Ciano": "❄️",
  "Amarelo": "🏆",
  "Vermelho": "⚔️",
  "Verde": "🧭"
};

const podiumColors = {
  "ciano": {
    color: "#22d3ee",
    glow: "rgba(34, 211, 238, 0.28)"
  },
  "dourado": {
    color: "#d4af37",
    glow: "rgba(250, 204, 21, 0.34)"
  },
  "ouro": {
    color: "#d4af37",
    glow: "rgba(250, 204, 21, 0.34)"
  },
  "verde": {
    color: "#22c55e",
    glow: "rgba(34, 197, 94, 0.28)"
  },
  "vermelho": {
    color: "#ef4444",
    glow: "rgba(239, 68, 68, 0.26)"
  },
  "amarelo": {
    color: "#facc15",
    glow: "rgba(250, 204, 21, 0.30)"
  },
  "azul": {
    color: "#2563eb",
    glow: "rgba(37, 99, 235, 0.30)"
  }
};

let rankingData = [];
let weeklyTeamData = [];
let dailyTeamData = [];
let bossAttackData = [];
let podioData = [];
let lojinhaData = [];
let bossData = {
  meta: 0,
  produzido: 0
};

function setStatus(text) {
  const statusText = document.getElementById("statusText");

  if (statusText) {
    statusText.textContent = text;
  }
}

function showAlert(message) {
  const alert = document.getElementById("appAlert");

  if (!alert) return;

  alert.textContent = message;
  alert.hidden = false;
}

function hideAlert() {
  const alert = document.getElementById("appAlert");

  if (!alert) return;

  alert.textContent = "";
  alert.hidden = true;
}

function formatNumber(value) {
  return new Intl.NumberFormat("pt-BR").format(Number(value) || 0);
}

function getPercent(value, total) {
  if (!total || total <= 0) return 0;

  return Math.min(100, Math.round((value / total) * 100));
}

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/%/g, "percentual")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function getValue(row, keys, fallback = "") {
  for (const key of keys) {
    const normalizedKey = normalizeKey(key);

    if (Object.prototype.hasOwnProperty.call(row, normalizedKey)) {
      const value = row[normalizedKey];

      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return value;
      }
    }
  }

  return fallback;
}

function parseNumber(value) {
  if (typeof value === "number") return value;

  let text = String(value || "").trim();

  if (!text) return 0;

  text = text.replace(/[^\d,.-]/g, "");

  if (!text) return 0;

  if (text.includes(",") && text.includes(".")) {
    text = text.replace(/\./g, "").replace(",", ".");
  } else if (text.includes(",")) {
    text = text.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(text)) {
    text = text.replace(/\./g, "");
  } else if ((text.match(/\./g) || []).length > 1) {
    text = text.replace(/\./g, "");
  }

  const parsed = Number(text);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatPercentText(value) {
  const text = String(value || "").trim();

  if (!text) return "0%";

  if (text.includes("%")) return text;

  return `${text}%`;
}

function parseStatus(value) {
  const text = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const positiveValues = ["1", "sim", "s", "ok", "true", "verdadeiro", "check", "✓", "✅", "feito"];
  const negativeValues = ["0", "nao", "n", "false", "falso", "x", "×", "❌", "erro"];

  if (positiveValues.includes(text)) return 1;
  if (negativeValues.includes(text)) return 0;

  return Number(value) === 1 ? 1 : 0;
}

function parseCSV(csvText) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        value += '"';
        i++;
      } else if (char === '"') {
        insideQuotes = false;
      } else {
        value += char;
      }

      continue;
    }

    if (char === '"') {
      insideQuotes = true;
    } else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }

  row.push(value);
  rows.push(row);

  return rows.filter(currentRow => {
    return currentRow.some(cell => String(cell || "").trim() !== "");
  });
}

function csvToObjects(csvText) {
  const rows = parseCSV(csvText);

  if (rows.length < 2) return [];

  const headers = rows[0].map(header => normalizeKey(header));

  return rows.slice(1).map(row => {
    const item = {};

    headers.forEach((header, index) => {
      item[header] = String(row[index] || "").trim();
    });

    return item;
  });
}

async function fetchSheetRows(sheetName) {
  const encodedSheetName = encodeURIComponent(sheetName);
  const cacheBuster = Date.now();

  const url = `https://docs.google.com/spreadsheets/d/${CONFIG.googleSheetId}/gviz/tq?tqx=out:csv&sheet=${encodedSheetName}&cache=${cacheBuster}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Não foi possível carregar a aba "${sheetName}".`);
  }

  const csvText = await response.text();

  if (
    csvText.toLowerCase().includes("<html") ||
    csvText.toLowerCase().includes("não foi possível") ||
    csvText.toLowerCase().includes("could not")
  ) {
    throw new Error(`A aba "${sheetName}" não retornou dados válidos.`);
  }

  return csvToObjects(csvText);
}

function transformRankingRows(rows) {
  return rows
    .map(row => {
      return {
        codigo: getValue(row, ["codigo", "código", "operador", "nome"]),
        dzs: parseNumber(getValue(row, ["dzs", "dzs_acumuladas", "dzs_acumulada", "dezenas", "pontuacao", "pontuação", "valor"])),
        erro: formatPercentText(getValue(row, ["erro", "percentual_acum_erro", "acum_erro", "%_acum_erro", "percentual_erro"])),
        rodadas: parseNumber(getValue(row, ["rodadas", "rodada"])),
        time: getValue(row, ["time", "equipe", "grupo"]),
        ultimos5: [
          parseStatus(getValue(row, ["dia1", "d1", "ultimo1", "último1"])),
          parseStatus(getValue(row, ["dia2", "d2", "ultimo2", "último2"])),
          parseStatus(getValue(row, ["dia3", "d3", "ultimo3", "último3"])),
          parseStatus(getValue(row, ["dia4", "d4", "ultimo4", "último4"])),
          parseStatus(getValue(row, ["dia5", "d5", "ultimo5", "último5"]))
        ]
      };
    })
    .filter(item => item.codigo && item.time);
}

function transformTeamRows(rows) {
  return rows
    .map(row => {
      return {
        time: getValue(row, ["time", "equipe", "grupo"]),
        valor: parseNumber(getValue(row, ["valor", "pontuacao", "pontuação", "total", "produzido", "pontos"]))
      };
    })
    .filter(item => item.time);
}

function transformLineRows(rows) {
  return rows
    .map(row => {
      return {
        label: getValue(row, ["label", "dia", "data", "periodo", "período"]),
        valor: parseNumber(getValue(row, ["valor", "total", "produzido", "pontuacao", "pontuação", "pontos"]))
      };
    })
    .filter(item => item.label);
}

function transformBossRows(rows) {
  const firstRow = rows[0] || {};

  return {
    meta: parseNumber(getValue(firstRow, ["meta", "objetivo"])),
    produzido: parseNumber(getValue(firstRow, ["produzido", "realizado", "valor", "total"]))
  };
}

function normalizePodioPosition(value) {
  const text = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  if (["centro", "meio", "1", "primeiro", "1º", "1o"].includes(text)) return "centro";
  if (["esquerda", "2", "segundo", "2º", "2o"].includes(text)) return "esquerda";
  if (["direita", "3", "terceiro", "3º", "3o"].includes(text)) return "direita";

  return text;
}

function transformPodioRows(rows) {
  return rows
    .map(row => {
      return {
        posicao: normalizePodioPosition(getValue(row, ["posicao", "posição", "lado", "ordem"])),
        nome: getValue(row, ["nome", "codigo", "código", "operador"]),
        titulo: getValue(row, ["titulo", "título", "categoria", "selo"]),
        descricao: getValue(row, ["descricao", "descrição", "texto", "frase"]),
        cor: String(getValue(row, ["cor", "tema"], "dourado")).toLowerCase().trim(),
        icone: getValue(row, ["icone", "ícone", "emoji"], "🏆")
      };
    })
    .filter(item => item.posicao && item.nome);
}

function escapeHTML(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function transformLojinhaRows(rows) {
  return rows
    .map(row => {
      return {
        premio: getValue(row, ["premio", "prêmio", "produto", "nome"]),
        descricao: getValue(row, ["descricao", "descrição", "detalhe", "texto"]),
        preco: parseNumber(getValue(row, ["preco", "preço", "valor", "moepas", "moedas"])),
        imagem: getValue(row, ["imagem", "foto", "img", "url"])
      };
    })
    .filter(item => item.premio);
}

async function loadDataFromGoogleSheets() {
  if (!CONFIG.googleSheetId || CONFIG.googleSheetId.includes("COLE_AQUI")) {
    throw new Error("Informe o ID da planilha no arquivo script.js.");
  }

  const [
  rankingRows,
  timesSemanaRows,
  timesDiaAnteriorRows,
  bossRows,
  ataquesBossRows,
  podioRows,
  lojinhaRows
] = await Promise.all([
  fetchSheetRows(CONFIG.abas.ranking),
  fetchSheetRows(CONFIG.abas.timesSemana),
  fetchSheetRows(CONFIG.abas.timesDiaAnterior),
  fetchSheetRows(CONFIG.abas.boss),
  fetchSheetRows(CONFIG.abas.ataquesBoss),
  fetchSheetRows(CONFIG.abas.podio),
  fetchSheetRows(CONFIG.abas.lojinha)
]);

  rankingData = transformRankingRows(rankingRows);
  weeklyTeamData = transformTeamRows(timesSemanaRows);
  dailyTeamData = transformTeamRows(timesDiaAnteriorRows);
  bossData = transformBossRows(bossRows);
  bossAttackData = transformLineRows(ataquesBossRows);
  podioData = transformPodioRows(podioRows);
  lojinhaData = transformLojinhaRows(lojinhaRows);
}

function loadDemoData() {
  rankingData = [
    { codigo: "Zélia Campos", dzs: 2330, erro: "0,23%", rodadas: 6, time: "Campeão", ultimos5: [1, 1, 1, 1, 1] },
    { codigo: "Thiago Correia", dzs: 2264, erro: "0,29%", rodadas: 6, time: "Campeão", ultimos5: [1, 1, 1, 1, 1] },
    { codigo: "Yasmin Duarte", dzs: 2262, erro: "0,28%", rodadas: 6, time: "Ciano", ultimos5: [1, 1, 1, 1, 1] },
    { codigo: "Paulo Gomes", dzs: 2116, erro: "0,36%", rodadas: 6, time: "Amarelo", ultimos5: [1, 1, 0, 1, 1] },
    { codigo: "Wesley Carvalho", dzs: 2116, erro: "0,17%", rodadas: 6, time: "Campeão", ultimos5: [1, 1, 1, 1, 1] },
    { codigo: "Victor Moreira", dzs: 1930, erro: "0,31%", rodadas: 6, time: "Vermelho", ultimos5: [0, 0, 1, 0, 0] },
    { codigo: "Ursula Batista", dzs: 2026, erro: "0,17%", rodadas: 6, time: "Ciano", ultimos5: [0, 1, 1, 0, 1] },
    { codigo: "Quitéria Araújo", dzs: 2050, erro: "0,19%", rodadas: 6, time: "Vermelho", ultimos5: [1, 1, 0, 1, 1] },
    { codigo: "Sofia Almeida", dzs: 2022, erro: "0,32%", rodadas: 6, time: "Amarelo", ultimos5: [0, 0, 1, 0, 0] },
    { codigo: "Rafael Teixeira", dzs: 1902, erro: "0,23%", rodadas: 6, time: "Campeão", ultimos5: [0, 0, 1, 0, 0] },
    { codigo: "Gabriela Costa", dzs: 1774, erro: "0,23%", rodadas: 6, time: "Amarelo", ultimos5: [0, 0, 0, 0, 0] },
    { codigo: "Nicolas Barbosa", dzs: 1880, erro: "0,20%", rodadas: 6, time: "Vermelho", ultimos5: [0, 0, 0, 0, 0] },
    { codigo: "Olívia Cardoso", dzs: 1728, erro: "0,45%", rodadas: 6, time: "Ciano", ultimos5: [0, 0, 0, 0, 0] },
    { codigo: "Lucas Ferreira", dzs: 1774, erro: "0,18%", rodadas: 6, time: "Vermelho", ultimos5: [0, 0, 0, 0, 0] },
    { codigo: "Henrique Nunes", dzs: 1752, erro: "0,38%", rodadas: 6, time: "Amarelo", ultimos5: [0, 0, 0, 0, 0] },
    { codigo: "Mariana Ribeiro", dzs: 1700, erro: "0,32%", rodadas: 6, time: "Verde", ultimos5: [0, 0, 0, 0, 0] },
    { codigo: "Isabela Martins", dzs: 1742, erro: "0,23%", rodadas: 6, time: "Ciano", ultimos5: [0, 0, 0, 0, 0] },
    { codigo: "Karen Oliveira", dzs: 1664, erro: "0,43%", rodadas: 6, time: "Ciano", ultimos5: [0, 0, 0, 0, 0] },
    { codigo: "João Pereira", dzs: 1612, erro: "0,38%", rodadas: 6, time: "Verde", ultimos5: [0, 0, 0, 0, 0] },
    { codigo: "Bruno Lima", dzs: 1528, erro: "0,35%", rodadas: 6, time: "Campeão", ultimos5: [0, 0, 0, 0, 0] },
    { codigo: "Felipe Alves", dzs: 1352, erro: "0,23%", rodadas: 6, time: "Verde", ultimos5: [0, 0, 0, 0, 0] },
    { codigo: "Elisa Rocha", dzs: 1386, erro: "0,20%", rodadas: 6, time: "Verde", ultimos5: [0, 0, 0, 0, 0] },
    { codigo: "Diego Santos", dzs: 1316, erro: "0,32%", rodadas: 6, time: "Verde", ultimos5: [0, 0, 0, 0, 0] },
    { codigo: "Carla Mendes", dzs: 1388, erro: "0,41%", rodadas: 6, time: "Amarelo", ultimos5: [0, 0, 0, 0, 0] },
    { codigo: "Ana Souza", dzs: 1130, erro: "0,18%", rodadas: 6, time: "Vermelho", ultimos5: [0, 0, 0, 0, 0] }
  ];

  weeklyTeamData = [
    { time: "Campeão", valor: 10140 },
    { time: "Ciano", valor: 9422 },
    { time: "Amarelo", valor: 9052 },
    { time: "Vermelho", valor: 8764 },
    { time: "Verde", valor: 7366 }
  ];

  dailyTeamData = [
    { time: "Verde", valor: 7366 },
    { time: "Ciano", valor: 5418 },
    { time: "Vermelho", valor: 3060 },
    { time: "Amarelo", valor: 2022 },
    { time: "Campeão", valor: 1902 }
  ];

  bossData = {
    meta: 50000,
    produzido: 44744
  };

  bossAttackData = [
    { label: "D1", valor: 5900 },
    { label: "D2", valor: 7300 },
    { label: "D3", valor: 6800 },
    { label: "D4", valor: 8600 },
    { label: "D5", valor: 7400 },
    { label: "D6", valor: 8744 }
  ];

  podioData = [
    {
      posicao: "esquerda",
      nome: "Thiago Correia",
      titulo: "Mestre Coletoria",
      descricao: "A elite da semana ou do mês em consistência produtiva.",
      cor: "ciano",
      icone: "⚙️"
    },
    {
      posicao: "centro",
      nome: "Zélia Campos",
      titulo: "Lenda do Picking",
      descricao: "O MVP absoluto. Título reservado para a maior produção de dúzias.",
      cor: "dourado",
      icone: "👑"
    },
    {
      posicao: "direita",
      nome: "Yasmin Duarte",
      titulo: "Prodígio",
      descricao: "A ascensão fulminante nas métricas de apartação.",
      cor: "verde",
      icone: "🏆"
    }
  ];

  lojinhaData = [
  {
    premio: "1 Dia de Folga",
    descricao: "Uso mediante autorização da liderança e condição operacional do setor.",
    preco: 800,
    imagem: "assets/lojinha/1-dia-de-folga.png"
  },
  {
    premio: "+30 minutos de almoço",
    descricao: "Deve ser combinado previamente com o líder responsável.",
    preco: 180,
    imagem: "assets/lojinha/almoco-30min.png"
  },
  {
    premio: "Chocolate",
    descricao: "Retirada presencial com o líder enquanto durar o estoque.",
    preco: 40,
    imagem: "assets/lojinha/chocolate.png"
  }
];
}

function renderRankingTable() {
  const tableBody = document.getElementById("rankingTableBody");

  if (!rankingData.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">Nenhum dado encontrado na aba Ranking.</div>
        </td>
      </tr>
    `;
    return;
  }

  const sortedData = [...rankingData].sort((a, b) => b.dzs - a.dzs);

  const html = sortedData.map((item, index) => {
    const position = index + 1;
    const topClass = position <= 5 ? "top-five" : "";
    const teamColor = teamColors[item.time] || "#94a3b8";

    const lastDaysHtml = item.ultimos5.map(status => {
      const isOk = Number(status) === 1;
      return `<span class="day-icon ${isOk ? "ok" : "fail"}">${isOk ? "✓" : "×"}</span>`;
    }).join("");

    return `
      <tr class="${topClass}">
        <td><span class="rank-number">${position}</span></td>
        <td class="operator-name">${item.codigo}</td>
        <td><strong>${formatNumber(item.dzs)}</strong></td>
        <td>${item.erro}</td>
        <td>${formatNumber(item.rodadas)}</td>
        <td>
          <span class="team-badge" style="background: ${teamColor};">
            <span class="team-dot"></span>
            ${item.time}
          </span>
        </td>
        <td>
          <div class="last-days">${lastDaysHtml}</div>
        </td>
      </tr>
    `;
  }).join("");

  tableBody.innerHTML = html;
}

function renderHorizontalBars(containerId, data) {
  const container = document.getElementById(containerId);

  if (!data.length) {
    container.innerHTML = `<div class="empty-state">Nenhum dado encontrado para este gráfico.</div>`;
    return;
  }

  const maxValue = Math.max(...data.map(item => item.valor));

  const html = data.map(item => {
    const width = maxValue > 0 ? Math.round((item.valor / maxValue) * 100) : 0;
    const color = teamColors[item.time] || "#94a3b8";

    return `
      <div class="bar-row">
        <div class="bar-name">${item.time}</div>
        <div class="bar-track">
          <div class="bar-fill" style="--bar-color: ${color}; width: ${width}%;"></div>
        </div>
        <div class="bar-value">${formatNumber(item.valor)}</div>
      </div>
    `;
  }).join("");

  container.innerHTML = html;
}

function renderVerticalTeamBars(containerId, data) {
  const container = document.getElementById(containerId);

  if (!data.length) {
    container.innerHTML = `<div class="empty-state">Nenhum dado encontrado para pontuação acumulada.</div>`;
    return;
  }

  const maxValue = Math.max(...data.map(item => item.valor));

  const html = data.map(item => {
    const height = maxValue > 0 ? Math.max(18, Math.round((item.valor / maxValue) * 100)) : 0;
    const color = chartTeamColors[item.time] || teamColors[item.time] || "#94a3b8";
    const icon = teamIcons[item.time] || "●";

    return `
      <div class="vertical-team-item">
        <div class="vertical-team-value">${formatNumber(item.valor)}</div>
        <div class="vertical-team-bar-wrap">
          <div class="vertical-team-bar" style="--bar-color: ${color}; height: ${height}%;">
            <span class="vertical-team-icon">${icon}</span>
          </div>
        </div>
        <div class="vertical-team-label">${item.time}</div>
      </div>
    `;
  }).join("");

  container.innerHTML = html;
}

function renderDailyTeamBars(containerId, data) {
  const container = document.getElementById(containerId);

  if (!data.length) {
    container.innerHTML = `<div class="empty-state">Nenhum dado encontrado para produção diária.</div>`;
    return;
  }

  const maxValue = Math.max(...data.map(item => item.valor));

  const html = data.map(item => {
    const width = maxValue > 0 ? Math.max(12, Math.round((item.valor / maxValue) * 100)) : 0;
    const color = chartTeamColors[item.time] || teamColors[item.time] || "#94a3b8";
    const icon = teamIcons[item.time] || "●";

    return `
      <div class="daily-team-row">
        <div class="daily-team-name">${item.time}</div>
        <div class="daily-team-track">
          <div class="daily-team-fill" style="--bar-color: ${color}; width: ${width}%;">
            <span class="daily-team-icon">${icon}</span>
          </div>
        </div>
        <div class="daily-team-value">${formatNumber(item.valor)}</div>
      </div>
    `;
  }).join("");

  container.innerHTML = html;
}

function renderLineChart(containerId, data) {
  const container = document.getElementById(containerId);

  if (!data.length || data.length < 2) {
    container.innerHTML = `<div class="empty-state">Dados insuficientes para gerar o gráfico.</div>`;
    return;
  }

  const width = 360;
  const height = 220;
  const paddingX = 34;
  const paddingTop = 24;
  const paddingBottom = 34;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;
  const gradientId = `${containerId}Gradient`;

  const maxValue = Math.max(...data.map(item => item.valor));
  const minValue = Math.min(...data.map(item => item.valor));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = paddingX + (index * chartWidth) / (data.length - 1);
    const y = paddingTop + chartHeight - ((item.valor - minValue) / range) * chartHeight;

    return { ...item, x, y };
  });

  const linePath = points.map((point, index) => {
    return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
  }).join(" ");

  const areaPath = `
    ${linePath}
    L ${points[points.length - 1].x} ${height - paddingBottom}
    L ${points[0].x} ${height - paddingBottom}
    Z
  `;

  const gridLines = [0, 1, 2, 3].map(index => {
    const y = paddingTop + (chartHeight / 3) * index;
    return `<line class="chart-grid-line" x1="${paddingX}" y1="${y}" x2="${width - paddingX}" y2="${y}" />`;
  }).join("");

  const labels = points.map(point => `
    <text class="chart-axis-label" x="${point.x}" y="${height - 10}" text-anchor="middle">${point.label}</text>
  `).join("");

  const circles = points.map(point => `
    <circle class="chart-point" cx="${point.x}" cy="${point.y}" r="5"></circle>
    <text class="chart-value-label" x="${point.x}" y="${point.y - 12}" text-anchor="middle">${formatNumber(point.valor)}</text>
  `).join("");

  const html = `
    <svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Gráfico de linha">
      <defs>
        <linearGradient id="${gradientId}" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#22c55e" stop-opacity="0.42" />
          <stop offset="100%" stop-color="#22c55e" stop-opacity="0.03" />
        </linearGradient>
      </defs>

      ${gridLines}
      <path class="chart-area" fill="url(#${gradientId})" d="${areaPath}"></path>
      <path class="chart-line" d="${linePath}"></path>
      ${circles}
      ${labels}
    </svg>
  `;

  container.innerHTML = html;
}

function renderDonutChart() {
  const container = document.getElementById("donutChart");

  if (!weeklyTeamData.length) {
    container.innerHTML = `<div class="empty-state">Nenhum dado encontrado para participação por time.</div>`;
    return;
  }

  const total = weeklyTeamData.reduce((sum, item) => sum + item.valor, 0);
  let startDegree = 0;

  const gradient = weeklyTeamData.map(item => {
    const color = chartTeamColors[item.time] || teamColors[item.time] || "#94a3b8";
    const degrees = total > 0 ? (item.valor / total) * 360 : 0;
    const segment = `${color} ${startDegree}deg ${startDegree + degrees}deg`;

    startDegree += degrees;

    return segment;
  }).join(", ");

  const legendHtml = weeklyTeamData.map(item => {
    const percent = getPercent(item.valor, total);
    const color = chartTeamColors[item.time] || teamColors[item.time] || "#94a3b8";

    return `
      <div class="legend-item">
        <span class="legend-left">
          <span class="legend-dot" style="background: ${color};"></span>
          ${item.time}
        </span>
        <span class="legend-value">${percent}%</span>
      </div>
    `;
  }).join("");

  const html = `
    <div class="donut-ring" style="background: conic-gradient(${gradient});">
      <div class="donut-center">
        <strong>${formatNumber(total)}</strong>
        <span>Total</span>
      </div>
    </div>

    <div class="donut-legend">
      ${legendHtml}
    </div>
  `;

  container.innerHTML = html;
}

function renderBoss() {
  const percent = getPercent(bossData.produzido, bossData.meta);
  const remainingPercent = Math.max(0, 100 - percent);

  document.getElementById("bossPercent").textContent = `${percent}%`;
  document.getElementById("bossProgressFill").style.width = `${percent}%`;
  document.getElementById("bossProgressText").textContent = `${percent}% conquistado`;

  document.getElementById("bossSummaryInline").textContent =
    `Meta: ${formatNumber(bossData.meta)} • Produzido: ${formatNumber(bossData.produzido)} • Falta: ${remainingPercent}%`;

}

function renderPodio() {
  const container = document.getElementById("podioGrid");

  if (!container) return;

  if (!podioData.length) {
    container.innerHTML = `<div class="empty-state">Nenhum dado encontrado na aba Podio.</div>`;
    return;
  }

  const positions = ["esquerda", "centro", "direita"];

  const html = positions.map(position => {
    const item = podioData.find(currentItem => currentItem.posicao === position);

    if (!item) {
      return `
        <article class="podium-card ${position === "centro" ? "center" : ""}">
          <div class="podium-stage" style="--podium-color: #64748b; --podium-glow: rgba(100, 116, 139, 0.25);"></div>
          <div class="podium-info">
            <strong>Aguardando</strong>
            <span>Preencha a posição "${position}" na aba Podio.</span>
          </div>
        </article>
      `;
    }

    const colorConfig = podiumColors[item.cor] || podiumColors.dourado;
    const centerClass = position === "centro" ? "center" : "";

    return `
      <article class="podium-card ${centerClass}">
        <div class="podium-stage" style="--podium-color: ${colorConfig.color}; --podium-glow: ${colorConfig.glow};">
          <div class="podium-medal">
            <span>${item.titulo}</span>
          </div>
          <div class="podium-icon">${item.icone}</div>
        </div>

        <div class="podium-info">
          <strong>${item.nome}</strong>
          <span>${item.descricao}</span>
        </div>
      </article>
    `;
  }).join("");

  container.innerHTML = html;
}

function renderLojinha() {
  const container = document.getElementById("lojinhaGrid");

  if (!container) return;

  if (!lojinhaData.length) {
    container.innerHTML = `<div class="empty-state">Nenhum prêmio encontrado na aba Lojinha.</div>`;
    return;
  }

  const html = lojinhaData.map(item => {
    const premio = escapeHTML(item.premio);
    const descricao = escapeHTML(item.descricao);
    const imagem = escapeHTML(item.imagem);
    const preco = formatNumber(item.preco);

    const imageHTML = imagem
      ? `<img src="${imagem}" alt="${premio}" loading="lazy" onerror="this.closest('.shop-image-wrap').classList.add('image-error'); this.remove();" />`
      : "";

    return `
      <article class="shop-card">
        <div class="shop-image-wrap">
          ${imageHTML}
          <div class="shop-image-placeholder">🎁</div>
        </div>

        <div class="shop-content">
          <h3>${premio}</h3>
          <p>${descricao}</p>

          <div class="shop-footer-row">
            <span class="shop-price">${preco} Moepas</span>
            <span class="shop-tag">Troca presencial</span>
          </div>
        </div>
      </article>
    `;
  }).join("");

  container.innerHTML = html;
}

function setupTabs() {
  const buttons = document.querySelectorAll(".tab-button");
  const tabs = document.querySelectorAll(".tab-content");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const targetTabId = button.dataset.tab;

      buttons.forEach(item => item.classList.remove("active"));
      tabs.forEach(tab => tab.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(targetTabId).classList.add("active");

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  });
}

function renderDashboard() {
  renderRankingTable();
  renderVerticalTeamBars("weeklyBars", weeklyTeamData);
  renderDailyTeamBars("dailyBars", dailyTeamData);
  renderDonutChart();
  renderBoss();
  renderLineChart("bossAttackChart", bossAttackData);
  renderPodio();
  renderLojinha();
}

async function initDashboard() {
  setupTabs();
  setStatus("Carregando dados...");
  hideAlert();

  try {
    await loadDataFromGoogleSheets();
    setStatus("Online");
    hideAlert();
  } catch (error) {
    console.error(error);

    if (CONFIG.usarDadosDeExemploSeFalhar) {
      loadDemoData();
      setStatus("Modo demonstração");
      showAlert("Ainda não foi possível carregar o Google Sheets. O app está exibindo dados de exemplo. Confira o ID da planilha, nomes das abas e permissões de compartilhamento.");
    } else {
      setStatus("Erro nos dados");
      showAlert(error.message);
      return;
    }
  }

  renderDashboard();
}

document.addEventListener("DOMContentLoaded", initDashboard);
