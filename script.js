:root {
  --bg: #080b12;
  --bg-soft: #111827;
  --card: #151c2c;
  --card-2: #1b2437;
  --text: #f8fafc;
  --muted: #94a3b8;
  --border: rgba(255, 255, 255, 0.09);
  --green: #22c55e;
  --red: #ef4444;
  --yellow: #facc15;
  --cyan: #22d3ee;
  --orange: #fb923c;
  --shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

body {
  min-height: 100vh;
  font-family: Arial, Helvetica, sans-serif;
  background:
    radial-gradient(circle at top left, rgba(34, 197, 94, 0.16), transparent 30%),
    radial-gradient(circle at top right, rgba(34, 211, 238, 0.13), transparent 35%),
    var(--bg);
  color: var(--text);
  padding-bottom: 92px;
}

.app {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 18px 14px 28px;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: 14px 0 12px;
  background: linear-gradient(180deg, #080b12 75%, rgba(8, 11, 18, 0));
  backdrop-filter: blur(12px);
}

.app-title {
  font-size: 1.45rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.1;
}

.app-subtitle {
  color: var(--muted);
  font-size: 0.86rem;
  margin-top: 6px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-top: 12px;
  padding: 8px 11px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.055);
  color: #cbd5e1;
  font-size: 0.78rem;
  font-weight: 700;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 12px var(--green);
}

.app-alert {
  margin-top: 12px;
  padding: 11px 12px;
  border-radius: 14px;
  border: 1px solid rgba(251, 146, 60, 0.35);
  background: rgba(251, 146, 60, 0.12);
  color: #fed7aa;
  font-size: 0.78rem;
  font-weight: 800;
  line-height: 1.35;
}

.tab-content {
  display: none;
  animation: fadeIn 0.28s ease;
}

.tab-content.active {
  display: block;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section {
  margin-top: 18px;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-title h2 {
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.section-title span {
  color: var(--muted);
  font-size: 0.76rem;
  font-weight: 700;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.metric-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 14px;
  background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025));
  box-shadow: var(--shadow);
}

.metric-card::after {
  content: "";
  position: absolute;
  right: -30px;
  top: -30px;
  width: 82px;
  height: 82px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.18;
  filter: blur(2px);
}

.metric-label {
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.metric-value {
  margin-top: 8px;
  font-size: 1.45rem;
  font-weight: 950;
  letter-spacing: -0.05em;
}

.metric-small {
  color: #cbd5e1;
  font-size: 0.75rem;
  margin-top: 5px;
  font-weight: 700;
}

.card {
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 14px;
  background: linear-gradient(145deg, rgba(21, 28, 44, 0.96), rgba(15, 23, 42, 0.92));
  box-shadow: var(--shadow);
}

.table-card {
  padding: 0;
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
  font-size: 0.82rem;
}

thead {
  background: rgba(255, 255, 255, 0.075);
}

th {
  color: #e2e8f0;
  text-align: left;
  padding: 12px 10px;
  white-space: nowrap;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border);
}

td {
  padding: 11px 10px;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
  color: #f8fafc;
  vertical-align: middle;
}

tbody tr {
  background: rgba(255, 255, 255, 0.015);
}

tbody tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.04);
}

tbody tr.top-five {
  background: linear-gradient(90deg, rgba(34, 197, 94, 0.23), rgba(34, 197, 94, 0.035));
}

.rank-number {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: rgba(148, 163, 184, 0.15);
  color: #e2e8f0;
  font-weight: 900;
}

.top-five .rank-number {
  background: rgba(34, 197, 94, 0.22);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.35);
}

.operator-name {
  font-weight: 850;
}

.team-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 9px;
  border-radius: 999px;
  color: #020617;
  font-size: 0.74rem;
  font-weight: 950;
}

.team-dot {
  width: 7px;
  height: 7px;
  background: rgba(0,0,0,0.45);
  border-radius: 50%;
}

.last-days {
  display: flex;
  align-items: center;
  gap: 5px;
}

.day-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 21px;
  height: 21px;
  border-radius: 50%;
  color: white;
  font-size: 0.72rem;
  font-weight: 950;
  line-height: 1;
}

.day-icon.ok {
  background: linear-gradient(145deg, #22c55e, #15803d);
}

.day-icon.fail {
  background: linear-gradient(145deg, #ef4444, #b91c1c);
}

.bar-list {
  display: grid;
  gap: 12px;
}

.bar-row {
  display: grid;
  grid-template-columns: 82px 1fr 56px;
  align-items: center;
  gap: 9px;
}

.bar-name {
  font-size: 0.78rem;
  font-weight: 900;
  color: #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar-track {
  position: relative;
  height: 15px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.09);
}

.bar-fill {
  height: 100%;
  width: 0;
  border-radius: inherit;
  background: var(--bar-color);
  box-shadow: 0 0 18px var(--bar-color);
  transition: width 0.8s ease;
}

.bar-value {
  text-align: right;
  color: #f8fafc;
  font-size: 0.8rem;
  font-weight: 950;
}

.vertical-team-chart {
  display: grid;
  grid-template-columns: repeat(5, minmax(52px, 1fr));
  gap: 10px;
  align-items: end;
  min-height: 230px;
  padding: 10px 2px 2px;
}

.vertical-team-item {
  display: grid;
  align-items: end;
  justify-items: center;
  gap: 7px;
  min-width: 0;
}

.vertical-team-value {
  color: #f8fafc;
  font-size: 0.82rem;
  font-weight: 950;
  line-height: 1;
}

.vertical-team-bar-wrap {
  width: 100%;
  height: 150px;
  display: flex;
  align-items: end;
  justify-content: center;
}

.vertical-team-bar {
  position: relative;
  width: 100%;
  max-width: 58px;
  min-height: 24px;
  border-radius: 14px 14px 3px 3px;
  background: var(--bar-color);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.32);
  transition: height 0.8s ease;
}

.vertical-team-bar::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.02));
}

.vertical-team-icon {
  position: absolute;
  top: 10px;
  left: 50%;
  z-index: 2;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.86);
  font-size: 1rem;
}

.vertical-team-label {
  color: #e2e8f0;
  font-size: 0.72rem;
  font-weight: 900;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.daily-team-chart {
  display: grid;
  gap: 13px;
}

.daily-team-row {
  display: grid;
  grid-template-columns: 78px 1fr 54px;
  align-items: center;
  gap: 9px;
}

.daily-team-name {
  color: #e2e8f0;
  font-size: 0.8rem;
  font-weight: 900;
  text-align: right;
}

.daily-team-track {
  height: 34px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.075);
  overflow: hidden;
}

.daily-team-fill {
  position: relative;
  height: 100%;
  min-width: 36px;
  border-radius: 999px;
  background: var(--bar-color);
  box-shadow: 0 0 18px color-mix(in srgb, var(--bar-color) 55%, transparent);
  transition: width 0.8s ease;
}

.daily-team-fill::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0.02));
}

.daily-team-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  z-index: 2;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.92rem;
}

.daily-team-value {
  color: #f8fafc;
  font-size: 0.86rem;
  font-weight: 950;
}

.line-chart {
  width: 100%;
  min-height: 230px;
}

.chart-svg {
  width: 100%;
  height: auto;
  display: block;
}

.chart-grid-line {
  stroke: rgba(255, 255, 255, 0.08);
  stroke-width: 1;
}

.chart-axis-label {
  fill: #94a3b8;
  font-size: 10px;
  font-weight: 700;
}

.chart-line {
  fill: none;
  stroke: #22c55e;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 8px rgba(34, 197, 94, 0.7));
}

.chart-area {
  opacity: 0.75;
}

.chart-point {
  fill: #86efac;
  stroke: #052e16;
  stroke-width: 3;
}

.chart-value-label {
  fill: #f8fafc;
  font-size: 11px;
  font-weight: 900;
}

.donut-area {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 16px;
  align-items: center;
}

.donut-ring {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.12);
}

.donut-ring::after {
  content: "";
  position: absolute;
  inset: 24px;
  border-radius: 50%;
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.donut-center {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-direction: column;
  font-weight: 950;
}

.donut-center strong {
  font-size: 1.25rem;
  line-height: 1;
}

.donut-center span {
  margin-top: 4px;
  color: var(--muted);
  font-size: 0.68rem;
  text-transform: uppercase;
}

.donut-legend {
  display: grid;
  gap: 9px;
}

.legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #e2e8f0;
  font-size: 0.8rem;
  font-weight: 800;
}

.legend-left {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-value {
  color: #f8fafc;
  font-weight: 950;
}

.boss-hero {
  position: relative;
  overflow: hidden;
  margin-top: 18px;
  border: 1px solid rgba(34, 197, 94, 0.28);
  border-radius: 28px;
  padding: 24px 16px;
  background:
    radial-gradient(circle at 50% 0%, rgba(34, 197, 94, 0.22), transparent 35%),
    linear-gradient(160deg, rgba(21, 128, 61, 0.28), rgba(15, 23, 42, 0.95) 55%);
  box-shadow: 0 24px 55px rgba(0, 0, 0, 0.42);
  text-align: center;
}

.boss-label {
  color: #86efac;
  font-size: 0.78rem;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.boss-title {
  margin-top: 8px;
  font-size: 2.3rem;
  line-height: 0.95;
  font-weight: 1000;
  letter-spacing: -0.08em;
  text-shadow: 0 7px 26px rgba(34, 197, 94, 0.28);
}

.boss-percent {
  margin-top: 18px;
  font-size: 4rem;
  line-height: 1;
  font-weight: 1000;
  letter-spacing: -0.08em;
  color: #dcfce7;
}

.boss-progress-wrap {
  margin-top: 20px;
  padding: 7px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.boss-progress-track {
  position: relative;
  height: 28px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(2, 6, 23, 0.75);
}

.boss-progress-fill {
  width: 0;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #16a34a, #22c55e, #86efac);
  box-shadow: 0 0 26px rgba(34, 197, 94, 0.7);
  transition: width 1s ease;
}

.boss-progress-text {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #052e16;
  font-size: 0.84rem;
  font-weight: 1000;
  mix-blend-mode: screen;
}

.boss-summary-inline {
  margin-top: 18px;
  color: #dcfce7;
  font-size: 0.92rem;
  font-weight: 900;
  line-height: 1.4;
  text-align: center;
}

.podium-section {
  margin-top: 20px;
}

.podium-title-block {
  text-align: center;
  margin-bottom: 18px;
}

.podium-title-block h2 {
  font-size: 1.55rem;
  line-height: 1.05;
  font-weight: 1000;
  letter-spacing: -0.06em;
  color: #f8fafc;
  text-shadow: 0 10px 28px rgba(34, 197, 94, 0.18);
}

.podium-grid {
  display: grid;
  grid-template-columns: 1fr 1.12fr 1fr;
  gap: 8px;
  align-items: end;
  min-height: 340px;
}

.podium-card {
  position: relative;
  display: grid;
  align-content: end;
  min-height: 292px;
}

.podium-card.center {
  min-height: 330px;
}

.podium-stage {
  position: relative;
  min-height: 178px;
  border-radius: 20px 20px 14px 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background:
    radial-gradient(circle at 50% 0%, var(--podium-glow), transparent 42%),
    linear-gradient(180deg, rgba(255,255,255,0.12), rgba(15,23,42,0.92));
  box-shadow: 0 22px 42px rgba(0, 0, 0, 0.38);
  overflow: hidden;
}

.podium-stage::after {
  content: "";
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 0;
  height: 42px;
  border-radius: 18px 18px 0 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.04));
  border: 1px solid rgba(255,255,255,0.08);
  border-bottom: 0;
}

.center .podium-stage {
  min-height: 220px;
}

.podium-medal {
  position: absolute;
  left: 50%;
  top: 38px;
  z-index: 2;
  transform: translateX(-50%) rotate(-8deg);
  width: 94px;
  height: 94px;
  display: grid;
  place-items: center;
  border: 4px solid rgba(255, 255, 255, 0.55);
  border-radius: 50%;
  background:
    repeating-radial-gradient(circle, rgba(255,255,255,0.08) 0 6px, rgba(255,255,255,0.02) 6px 12px),
    var(--podium-color);
  color: white;
  box-shadow: 0 15px 32px rgba(0,0,0,0.35);
}

.center .podium-medal {
  top: 45px;
  width: 110px;
  height: 110px;
}

.podium-medal span {
  padding: 7px 9px;
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.45);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 1000;
  line-height: 1.05;
  text-align: center;
  text-transform: uppercase;
  transform: rotate(8deg);
}

.center .podium-medal span {
  font-size: 0.72rem;
}

.podium-icon {
  position: absolute;
  right: 9px;
  bottom: 48px;
  z-index: 3;
  font-size: 1.05rem;
  opacity: 0.95;
}

.podium-info {
  position: relative;
  z-index: 5;
  margin: -34px 7px 0;
  padding: 11px 8px;
  min-height: 98px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.96);
  color: #020617;
  box-shadow: 0 14px 26px rgba(0,0,0,0.28);
  text-align: center;
}

.podium-info strong {
  display: block;
  font-size: 0.82rem;
  font-weight: 1000;
  line-height: 1.08;
  margin-bottom: 6px;
}

.center .podium-info strong {
  font-size: 0.88rem;
}

.podium-info span {
  display: block;
  font-size: 0.68rem;
  font-weight: 800;
  line-height: 1.18;
}

.podium-footer {
  margin-top: 18px;
  color: #f8fafc;
  font-size: 1.15rem;
  font-weight: 1000;
  line-height: 1.1;
  letter-spacing: -0.04em;
  text-align: center;
}

.bottom-tabs {
  position: fixed;
  z-index: 50;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  width: calc(100% - 28px);
  max-width: 500px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(18px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
}

.tab-button {
  border: 0;
  border-radius: 16px;
  padding: 12px 5px;
  background: transparent;
  color: var(--muted);
  font-size: 0.68rem;
  font-weight: 950;
  cursor: pointer;
}

.tab-button.active {
  color: #052e16;
  background: linear-gradient(135deg, #22c55e, #86efac);
  box-shadow: 0 10px 24px rgba(34, 197, 94, 0.25);
}

.hint {
  margin-top: 9px;
  color: var(--muted);
  font-size: 0.74rem;
  line-height: 1.35;
}

.empty-state {
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.4;
  text-align: center;
  padding: 18px 10px;
}

.shop-section {
  margin-top: 18px;
}

.shop-intro {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
  padding: 14px;
  border: 1px solid rgba(34, 197, 94, 0.22);
  border-radius: 18px;
  background:
    radial-gradient(circle at top left, rgba(34, 197, 94, 0.16), transparent 34%),
    rgba(255, 255, 255, 0.045);
}

.shop-intro strong {
  color: #dcfce7;
  font-size: 0.98rem;
  font-weight: 1000;
}

.shop-intro span {
  color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 750;
  line-height: 1.35;
}

.shop-grid {
  display: grid;
  gap: 14px;
}

.shop-card {
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 24px;
  background:
    linear-gradient(145deg, rgba(21, 28, 44, 0.98), rgba(15, 23, 42, 0.94));
  box-shadow: var(--shadow);
}

.shop-image-wrap {
  position: relative;
  min-height: 185px;
  background:
    radial-gradient(circle at center, rgba(34, 197, 94, 0.15), transparent 45%),
    rgba(255, 255, 255, 0.045);
  display: grid;
  place-items: center;
  overflow: hidden;
}

.shop-image-wrap img {
  width: 100%;
  height: 185px;
  object-fit: cover;
  display: block;
}

.shop-image-placeholder {
  position: absolute;
  inset: 0;
  display: none;
  place-items: center;
  font-size: 3.2rem;
  background:
    radial-gradient(circle at center, rgba(34, 197, 94, 0.18), transparent 38%),
    rgba(15, 23, 42, 0.88);
}

.shop-image-wrap:empty .shop-image-placeholder,
.shop-image-wrap.image-error .shop-image-placeholder {
  display: grid;
}

.shop-content {
  padding: 14px;
}

.shop-content h3 {
  color: #f8fafc;
  font-size: 1.05rem;
  font-weight: 1000;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.shop-content p {
  margin-top: 8px;
  color: #cbd5e1;
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.4;
}

.shop-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 14px;
}

.shop-price {
  display: inline-flex;
  align-items: center;
  padding: 9px 11px;
  border-radius: 999px;
  background: linear-gradient(135deg, #facc15, #fb923c);
  color: #111827;
  font-size: 0.82rem;
  font-weight: 1000;
  white-space: nowrap;
}

.shop-tag {
  color: #86efac;
  font-size: 0.72rem;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  text-align: right;
}

@media (max-width: 380px) {
  .app {
    padding-left: 10px;
    padding-right: 10px;
  }

  .boss-title {
    font-size: 1.95rem;
  }

  .boss-percent {
    font-size: 3.3rem;
  }

  .bar-row {
    grid-template-columns: 72px 1fr 50px;
  }

  .daily-team-row {
    grid-template-columns: 70px 1fr 48px;
  }

  .daily-team-name {
    font-size: 0.72rem;
  }

  .vertical-team-chart {
    gap: 6px;
  }

  .vertical-team-label {
    font-size: 0.64rem;
  }

  .donut-area {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .donut-legend {
    width: 100%;
  }

  .podium-grid {
    gap: 6px;
  }

  .podium-title-block h2 {
    font-size: 1.35rem;
  }

  .podium-card {
    min-height: 270px;
  }

  .podium-card.center {
    min-height: 305px;
  }

  .podium-medal {
    width: 78px;
    height: 78px;
  }

  .center .podium-medal {
    width: 92px;
    height: 92px;
  }

  .podium-medal span {
    font-size: 0.58rem;
  }

  .podium-info {
    margin-left: 3px;
    margin-right: 3px;
    padding: 9px 5px;
  }

  .podium-info strong {
    font-size: 0.68rem;
  }

  .center .podium-info strong {
    font-size: 0.72rem;
  }

  .podium-info span {
    font-size: 0.58rem;
  }

  .podium-footer {
    font-size: 0.98rem;
  }

  .tab-button {
    font-size: 0.7rem;
    padding-left: 5px;
    padding-right: 5px;
  }
}
