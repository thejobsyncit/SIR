import { performance } from 'perf_hooks';

const BASE_URL = 'http://localhost:5000';

async function measureEndpoint(name, url, options = {}) {
  const times = [];
  let status = 0;
  let sizeBytes = 0;

  // Run 5 iterations to get min, avg, max
  for (let i = 0; i < 5; i++) {
    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}${url}`, options);
    const text = await res.text();
    const t1 = performance.now();
    times.push(t1 - t0);
    status = res.status;
    sizeBytes = Buffer.byteLength(text, 'utf8');
  }

  const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2);
  const min = Math.min(...times).toFixed(2);
  const max = Math.max(...times).toFixed(2);

  return { name, url, status, sizeKb: (sizeBytes / 1024).toFixed(2), minMs: min, avgMs: avg, maxMs: max };
}

async function runBenchmark() {
  console.log('================================================================');
  console.log('   REVIVAL INTERNATIONAL — ACTUAL RUNTIME PERFORMANCE BENCHMARK');
  console.log('================================================================\n');

  const benchmarks = [
    { name: 'Root SPA HTML (index.html)', url: '/' },
    { name: 'Health Check API', url: '/api/health' },
    { name: 'Jobs Mandates API', url: '/api/jobs' },
    { name: 'Global Visa Matrix (18 Countries)', url: '/api/visa/countries-matrix' },
    { name: 'Organizations / Clients Directory', url: '/api/clients' },
    { name: 'CRM Consulting Live Metrics (SQLite)', url: '/api/crm/consulting/metrics' },
    { name: 'Visa Eligibility Calculator (POST)', url: '/api/visa/check', options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country: 'UAE', qualification: "Bachelor's Degree", experience: 4, age: 28, language: 'IELTS 7.0' })
    }},
    { name: 'ATS Resume Parsing & Scoring (POST)', url: '/api/resume/analyze', options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: 'Director of Civil Engineering with 10 years experience.', targetRole: 'Director' })
    }},
    { name: 'AI Contextual Assistant (POST)', url: '/api/ai/chat', options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What education consulting options do you offer?' })
    }}
  ];

  console.log('| Endpoint / Asset | Status | Size (KB) | Min Latency | Avg Latency | Max Latency |');
  console.log('|---|:---:|:---:|:---:|:---:|:---:|');

  for (const b of benchmarks) {
    const res = await measureEndpoint(b.name, b.url, b.options);
    console.log(`| ${res.name} | ${res.status} | ${res.sizeKb} KB | ${res.minMs} ms | **${res.avgMs} ms** | ${res.maxMs} ms |`);
  }

  console.log('\n================================================================');
  console.log('   BENCHMARK COMPLETE');
  console.log('================================================================');
}

runBenchmark().catch(console.error);
