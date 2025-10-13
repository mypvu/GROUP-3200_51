import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

// ---------- Matching Logic ----------
function calculateMatch(unknown, standard) {
  if (!unknown || !standard || !unknown.length || !standard.length) {
    return { percentage: 0, peakWithinRange: false };
  }

  // Peak comparison (±2%)
  const peakStd = standard.reduce((a, b) => (b.y > a.y ? b : a), standard[0]);
  const peakUnk = unknown.reduce((a, b) => (b.y > a.y ? b : a), unknown[0]);
  const peakDiff = Math.abs(peakStd.x - peakUnk.x) / peakStd.x;
  const peakWithinRange = peakDiff <= 0.02;

  let matchCount = 0;
  let totalCount = 0;

  for (const std of standard) {
    const unk = unknown.find((u) => Math.abs(u.x - std.x) < 0.5);
    if (unk) {
      const lower = std.y * 0.75;
      const upper = std.y * 1.25;
      totalCount++;
      if (unk.y >= lower && unk.y <= upper) matchCount++;
    }
  }

  const percentage = totalCount ? ((matchCount / totalCount) * 100).toFixed(1) : 0;
  return { percentage: parseFloat(percentage), peakWithinRange };
}

// ---------- Grouping ----------
function groupByCompound(spectra) {
  const groups = {};
  for (const s of spectra) {
    const compound = s.name.split("_")[0];
    if (!groups[compound]) groups[compound] = [];
    groups[compound].push(s);
  }
  return groups;
}

// ---------- Plotting ----------
export function plotSpectrum(spectra, stage = "general") {
  const canvas = document.getElementById("spectrumChart");
  if (!canvas) {
    console.warn("Canvas with id 'spectrumChart' not found.");
    return;
  }

  const ctx = canvas.getContext("2d");
  const datasets = [];
  let chartTitle = "Spectral Overlay Comparison";

  if (stage === "general") {
    const grouped = groupByCompound(spectra);
    const summary = [];

    for (const [compound, files] of Object.entries(grouped)) {
      if (files.length < 2) continue;

      const standard = files[0];
      const matches = [];

      for (let i = 1; i < files.length; i++) {
        const unknown = files[i];
        const { percentage, peakWithinRange } = calculateMatch(
          unknown.plot,
          standard.plot
        );

        matches.push(percentage);

        datasets.push({
          label: `${compound} – ${unknown.name} (${percentage}% match ${
            peakWithinRange ? "✓" : "⚠️"
          })`,
          data: unknown.plot,
          borderColor: getColor(i),
          fill: false,
          tension: 0,
          pointRadius: 0,
        });
      }

      datasets.push({
        label: `${compound} – Standard`,
        data: standard.plot,
        borderColor: "#000000",
        borderWidth: 2,
        tension: 0,
        pointRadius: 0,
      });

      const avg =
        matches.length > 0
          ? (matches.reduce((a, b) => a + b, 0) / matches.length).toFixed(1)
          : 0;
      summary.push(`${compound}: Avg ${avg}%`);
    }

    if (summary.length > 0)
      chartTitle = "Overlay Results — " + summary.join(" | ");
  }

  const config = {
    type: "line",
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: chartTitle },
        legend: { position: "top", labels: { usePointStyle: true } },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const label = ctx.dataset.label || "";
              const x = ctx.parsed.x.toFixed(2);
              const y = ctx.parsed.y.toFixed(3);
              return `${label}: (${x}, ${y})`;
            },
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          title: { display: true, text: "Wavelength (nm)" },
        },
        y: {
          title: { display: true, text: "Normalized Absorbance" },
        },
      },
      elements: { line: { borderWidth: 2 }, point: { radius: 0 } },
    },
  };

  if (ctx.chart) ctx.chart.destroy();
  ctx.chart = new Chart(ctx, config);
  return ctx.chart;
}

// ---------- Color Palette ----------
function getColor(i) {
  const palette = [
    "#1f77b4",
    "#ff7f0e",
    "#2ca02c",
    "#9467bd",
    "#8c564b",
    "#e377c2",
    "#7f7f7f",
    "#bcbd22",
    "#17becf",
  ];
  return palette[i % palette.length];
}
