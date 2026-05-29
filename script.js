const CONFIG = {
  googleSheetId: "18XKbPRphQ9RmV7lX3XZH4ZJG0GmOv3Pr0KWbx_M0FQw",
  usarDadosDeExemploSeFalhar: true,
  abas: {
    ranking: "Ranking",
    timesSemana: "TimesSemana",
    timesDiaAnterior: "TimesDiaAnterior",
    evolucaoSemana: "EvolucaoSemana",
    boss: "Boss",
    ataquesBoss: "AtaquesBoss"
  }
};

const teamColors = {
  "Campeão": "#facc15",
  "Ciano": "#22d3ee",
  "Amarelo": "#fde047",
  "Vermelho": "#ef4444",
  "Verde": "#22c55e"
};

let rankingData = [];
let weeklyTeamData = [];
let dailyTeamData = [];
let weeklyEvolutionData = [];
let bossAttackData = [];
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

function formatPercentNumber(value) {
  const number = Number(value) || 0;

  return `${number.toFixed(2).replace(".", ",")}%`;
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

function parsePercentNumber(value) {
  const text = String(value || "").replace("%", "").trim();

  return parseNumber(text);
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

async function loadDataFromGoogleSheets() {
  if (!CONFIG.googleSheetId || CONFIG.googleSheetId.includes("COLE_AQUI")) {
    throw new Error("Informe o ID da planilha no arquivo script.js.");
  }

  const [
    rankingRows,
    timesSemanaRows,
    timesDiaAnteriorRows,
    evolucaoSemanaRows,
    bossRows,
    ataquesBossRows
  ] = await Promise.all([
    fetchSheetRows(CONFIG.abas.ranking),
    fetchSheetRows(CONFIG.abas.timesSemana),
    fetchSheetRows(CONFIG.abas.timesDiaAnterior),
    fetchSheetRows(CONFIG.abas.evolucaoSemana),
    fetchSheetRows(CONFIG.abas.boss),
    fetchSheetRows(CONFIG.abas.ataquesBoss)
  ]);

  rankingData = transformRankingRows(rankingRows);
  weeklyTeamData = transformTeamRows(timesSemanaRows);
  dailyTeamData = transformTeamRows(timesDiaAnteriorRows);
  weeklyEvolutionData = transformLineRows(evolucaoSemanaRows);
  bossData = transformBossRows(bossRows);
  bossAttackData = transformLineRows(ataquesBossRows);
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

  weeklyEvolutionData = [
    { label: "Seg", valor: 6200 },
    { label: "Ter", valor: 7500 },
    { label: "Qua", valor: 6900 },
    { label: "Qui", valor: 9200 },
    { label: "Sex", valor: 10400 },
    { label: "Sáb", valor: 11800 }
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
}

function getAverageError() {
  const errors = rankingData
    .map(item => parsePercentNumber(item.erro))
    .filter(value => Number.isFinite(value));

  if (!errors.length) return "0%";

  const average = errors.reduce((sum, value) => sum + value, 0) / errors.length;

  return formatPercentNumber(average);
}

function renderSummaryCards() {
  const totalProduzido = weeklyTeamData.reduce((sum, item) => sum + item.valor, 0);
  const mediaErro = getAverageError();

  const cards = [
    { label: "Produzido", value: formatNumber(totalProduzido), small: "acumulado da semana", color: "#22c55e" },
    { label: "Erro médio", value: mediaErro, small: "acumulado geral", color: "#fb923c" }
  ];

  const html = cards.map(card => `
    <article class="metric-card" style="--accent: ${card.color}">
      <div class="metric-label">${card.label}</div>
      <div class="metric-value">${card.value}</div>
      <div class="metric-small">${card.small}</div>
    </article>
  `).join("");

  document.getElementById("summaryCards").innerHTML = html;
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
    const color = teamColors[item.time] || "#94a3b8";
    const degrees = total > 0 ? (item.valor / total) * 360 : 0;
    const segment = `${color} ${startDegree}deg ${startDegree + degrees}deg`;

    startDegree += degrees;

    return segment;
  }).join(", ");

  const legendHtml = weeklyTeamData.map(item => {
    const percent = getPercent(item.valor, total);
    const color = teamColors[item.time] || "#94a3b8";

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
    `Falta: ${remainingPercent}%`;

  renderHorizontalBars("bossTeamBars", weeklyTeamData);
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
  renderSummaryCards();
  renderRankingTable();
  renderHorizontalBars("weeklyBars", weeklyTeamData);
  renderHorizontalBars("dailyBars", dailyTeamData);
  renderLineChart("lineChart", weeklyEvolutionData);
  renderDonutChart();
  renderBoss();
  renderLineChart("bossAttackChart", bossAttackData);
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