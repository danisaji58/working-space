'use client';

import React, { useState, useEffect } from 'react';
import {
  Code,
  CheckCircle2,
  AlertCircle,
  Play,
  Key,
  ShieldCheck,
  Server,
  Database,
  Search,
  ExternalLink,
  Users,
  BarChart3,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { ALL_50_UKK_ENDPOINTS } from '@/lib/api/endpoints-registry';
import { ApiEndpointDefinition } from '@/types/api';
import {
  apiClient,
  getApiBaseUrl,
  getMakerKey,
  getAuthToken,
  setExplicitDemoMode,
  isExplicitDemoMode,
} from '@/lib/api/client';
import {
  getRootInfo,
  getHealthCheck,
  registerMaker,
  loginMaker,
  getMakerMe,
  getMakerStats,
  getMakerList,
} from '@/lib/api/maker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

export default function ApiHubPage() {
  const [activeTab, setActiveTab] = useState<'endpoints' | 'maker'>('endpoints');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpointDefinition>(
    ALL_50_UKK_ENDPOINTS[0]
  );

  // Execution state
  const [requestUrl, setRequestUrl] = useState('');
  const [requestMethod, setRequestMethod] = useState('GET');
  const [requestBody, setRequestBody] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResponse, setExecutionResponse] = useState<unknown>(null);
  const [executionStatus, setExecutionStatus] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // App Maker quick action state
  const [makerName, setMakerName] = useState('Peserta UKK 2026');
  const [makerUsername, setMakerUsername] = useState('peserta_ukk');
  const [makerEmail, setMakerEmail] = useState('peserta@smk.sch.id');
  const [makerPassword, setMakerPassword] = useState('Password123!');
  const [makerResult, setMakerResult] = useState<string | null>(null);
  const [makerStats, setMakerStats] = useState<unknown>(null);
  const [makerList, setMakerList] = useState<unknown>(null);
  const [serverHealth, setServerHealth] = useState<unknown>(null);

  const baseUrl = getApiBaseUrl();
  const currentMakerKey = getMakerKey();
  const hasToken = !!getAuthToken();

  useEffect(() => {
    // Set default request based on selected endpoint
    const cleanPath = selectedEndpoint.endpoint.replace('{id}', '1');
    setRequestUrl(cleanPath);
    setRequestMethod(selectedEndpoint.method);
    if (selectedEndpoint.sampleBody) {
      setRequestBody(JSON.stringify(selectedEndpoint.sampleBody, null, 2));
    } else {
      setRequestBody('');
    }
  }, [selectedEndpoint]);

  const categories = ['all', ...Array.from(new Set(ALL_50_UKK_ENDPOINTS.map((e) => e.category)))];

  const filteredEndpoints = ALL_50_UKK_ENDPOINTS.filter((item) => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch =
      item.endpoint.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      String(item.no).includes(searchFilter);
    return matchCat && matchSearch;
  });

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionResponse(null);
    setExecutionStatus(null);

    try {
      const options: {
        method: string;
        body?: string;
        headers?: Record<string, string>;
      } = {
        method: requestMethod,
      };

      if (['POST', 'PUT', 'PATCH'].includes(requestMethod) && requestBody.trim()) {
        options.body = requestBody.trim();
      }

      const res = await apiClient<unknown>(requestUrl, options);
      setExecutionStatus(res.statusCode);
      setExecutionResponse(res);
    } catch (err: unknown) {
      const error = err as Error;
      setExecutionStatus(500);
      setExecutionResponse({ error: error.message });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyJson = () => {
    if (!executionResponse) return;
    navigator.clipboard.writeText(JSON.stringify(executionResponse, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Maker handlers
  const handleRegisterMaker = async () => {
    setMakerResult('Mendaftarkan akun Siswa (App Maker)...');
    const res = await registerMaker({
      name: makerName,
      username: makerUsername,
      email: makerEmail,
      password: makerPassword,
    });
    if (res.status && res.data) {
      setMakerResult(
        `Registrasi Berhasil!\nApp Key unik: ${res.data.app_key}\nAkun telah otomatis disetel di browser.`
      );
    } else {
      setMakerResult(`Registrasi Gagal: ${res.message || res.error}`);
    }
  };

  const handleFetchHealth = async () => {
    const [h, r] = await Promise.all([getHealthCheck(), getRootInfo()]);
    setServerHealth({ health: h, root: r });
  };

  const handleFetchStats = async () => {
    const res = await getMakerStats();
    setMakerStats(res);
  };

  const handleFetchMakerList = async () => {
    const res = await getMakerList();
    setMakerList(res);
  };

  const getMethodBadge = (m: string) => {
    switch (m) {
      case 'GET':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-sky-950 text-sky-300 border border-sky-800/60">GET</span>;
      case 'POST':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">POST</span>;
      case 'PUT':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/60">PUT</span>;
      case 'PATCH':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800/60">PATCH</span>;
      case 'DELETE':
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/60">DELETE</span>;
      default:
        return <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-zinc-800 text-zinc-300">{m}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#c5a880] uppercase tracking-wider">
            <Database className="w-3.5 h-3.5" />
            <span>Katalog Lengkap 50 Endpoint API UKK 2026/2027</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            API Explorer & Multi-Tenancy Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Seluruh 50 endpoint REST API resmi SMK Telkom Malang siap diuji secara interaktif langsung dari Frontend.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'endpoints'
                ? 'bg-[#c5a880] text-zinc-950 font-semibold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            50 Endpoints (Live Console)
          </button>
          <button
            onClick={() => setActiveTab('maker')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'maker'
                ? 'bg-[#c5a880] text-zinc-950 font-semibold shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Multi-Tenancy & Health
          </button>
        </div>
      </div>

      {/* API Context Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs flex items-center gap-2.5">
          <Server className="w-4 h-4 text-[#c5a880] shrink-0" />
          <div className="truncate">
            <span className="text-zinc-400 block text-[10px]">Base API Server:</span>
            <span className="font-mono text-zinc-200 truncate">{baseUrl}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs flex items-center gap-2.5">
          <Key className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="truncate">
            <span className="text-zinc-400 block text-[10px]">Header x-maker-key:</span>
            <span className="font-mono text-emerald-300 truncate">
              {currentMakerKey || 'Belum Terpasang (Gunakan Tab Maker)'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
          <div className="truncate">
            <span className="text-zinc-400 block text-[10px]">Bearer JWT Auth:</span>
            <span className="font-mono text-sky-300">
              {hasToken ? 'Token JWT Aktif' : 'Belum Login User'}
            </span>
          </div>
        </div>
      </div>

      {activeTab === 'endpoints' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Endpoint List */}
          <div className="lg:col-span-5 space-y-3">
            {/* Filter Bar */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari endpoint, method, atau nomor..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 px-3 py-2 focus:outline-none cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-zinc-900 text-white">
                    {c === 'all' ? 'Semua Kategori (1-13)' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* List */}
            <div className="max-h-[640px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {filteredEndpoints.map((ep) => {
                const isSelected = selectedEndpoint.no === ep.no;
                return (
                  <div
                    key={ep.no}
                    onClick={() => setSelectedEndpoint(ep)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer text-xs space-y-1 ${
                      isSelected
                        ? 'bg-zinc-900 border-[#c5a880] shadow-md'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-zinc-400 w-5">
                          #{ep.no}
                        </span>
                        {getMethodBadge(ep.method)}
                        <span className="font-mono text-[11px] font-medium text-white truncate max-w-[190px]">
                          {ep.endpoint}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 truncate font-mono">
                        {ep.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">
                      {ep.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Live Request & Response Inspector */}
          <div className="lg:col-span-7 space-y-4">
            <div className="card-luxury p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#c5a880] font-bold">
                      Endpoint #{selectedEndpoint.no}
                    </span>
                    <span className="text-xs text-zinc-400">
                      ({selectedEndpoint.category})
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold text-white">
                    {selectedEndpoint.description}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Role: <span className="text-zinc-200">{selectedEndpoint.role}</span>
                  </span>
                </div>
              </div>

              {/* Request URL Input */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono text-zinc-400 uppercase">
                  Target Endpoint URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="shrink-0">{getMethodBadge(requestMethod)}</div>
                  <input
                    type="text"
                    value={requestUrl}
                    onChange={(e) => setRequestUrl(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-white px-3 py-2 focus:outline-none focus:border-zinc-500"
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleExecute}
                    isLoading={isExecuting}
                    leftIcon={<Play className="w-3.5 h-3.5" />}
                  >
                    Kirim Request
                  </Button>
                </div>
              </div>

              {/* Request Body Editor (for POST/PUT/PATCH) */}
              {['POST', 'PUT', 'PATCH'].includes(requestMethod) && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase">
                    Request Payload (JSON Body)
                  </label>
                  <textarea
                    rows={6}
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-zinc-500"
                  />
                </div>
              )}

              {/* Live Response Viewer */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-mono text-zinc-400 uppercase">
                      Server Response JSON
                    </label>
                    {executionStatus !== null && (
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                          executionStatus >= 200 && executionStatus < 300
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        HTTP {executionStatus}
                      </span>
                    )}
                  </div>
                  {executionResponse ? (
                    <button
                      onClick={handleCopyJson}
                      className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer font-mono"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin JSON</span>
                        </>
                      )}
                    </button>
                  ) : null}
                </div>

                <div className="rounded-xl bg-zinc-950 border border-zinc-800/90 p-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {isExecuting ? (
                    <div className="text-zinc-400 font-mono text-xs flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#c5a880]" />
                      <span>Mengirim request ke API server...</span>
                    </div>
                  ) : executionResponse ? (
                    <pre className="font-mono text-[11px] text-emerald-400 leading-relaxed overflow-x-auto">
                      {JSON.stringify(executionResponse, null, 2)}
                    </pre>
                  ) : (
                    <span className="font-mono text-[11px] text-zinc-400">
                      Klik &quot;Kirim Request&quot; untuk menjalankan endpoint #{selectedEndpoint.no} secara langsung.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Multi-Tenancy Siswa & Health Tab */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section A: App Maker Registration */}
          <div className="card-luxury p-6 rounded-2xl space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#c5a880]">Endpoint 3 & 4</span>
              <h3 className="text-base font-semibold text-white">
                Registrasi & Generate App Key (x-maker-key)
              </h3>
              <p className="text-xs text-zinc-400">
                Pendaftaran identitas siswa pengembang Frontend untuk mengisolasi data reservasi, ruang, dan diskon secara aman.
              </p>
            </div>

            <div className="space-y-3">
              <Input
                label="Nama Lengkap Siswa"
                value={makerName}
                onChange={(e) => setMakerName(e.target.value)}
              />
              <Input
                label="Username Unik"
                value={makerUsername}
                onChange={(e) => setMakerUsername(e.target.value)}
              />
              <Input
                label="Email Siswa"
                type="email"
                value={makerEmail}
                onChange={(e) => setMakerEmail(e.target.value)}
              />
              <Input
                label="Password Akun Maker"
                type="password"
                value={makerPassword}
                onChange={(e) => setMakerPassword(e.target.value)}
              />

              <Button
                variant="primary"
                size="sm"
                onClick={handleRegisterMaker}
                leftIcon={<Key className="w-4 h-4" />}
              >
                Daftarkan Maker & Simpan App Key
              </Button>

              {makerResult && (
                <pre className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-400 whitespace-pre-wrap">
                  {makerResult}
                </pre>
              )}
            </div>
          </div>

          {/* Section B: System Health & Maker Inspection */}
          <div className="card-luxury p-6 rounded-2xl space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#c5a880]">Endpoints 1, 2, 6, 7</span>
              <h3 className="text-base font-semibold text-white">
                Server Health & Maker Verification
              </h3>
              <p className="text-xs text-zinc-400">
                Alat bantu pengujian untuk guru/penguji dan siswa guna memverifikasi integritas backend.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchHealth}
                leftIcon={<Server className="w-3.5 h-3.5" />}
              >
                Cek Health & Root (1-2)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchStats}
                leftIcon={<BarChart3 className="w-3.5 h-3.5" />}
              >
                Lihat Maker Stats (6)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFetchMakerList}
                leftIcon={<Users className="w-3.5 h-3.5" />}
              >
                Daftar Semua Maker (7)
              </Button>
            </div>

            {/* Display results */}
            <div className="space-y-3">
              {serverHealth ? (
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-zinc-400">Hasil Root & Health Check:</span>
                  <pre className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-sky-300 max-h-[160px] overflow-y-auto">
                    {JSON.stringify(serverHealth, null, 2)}
                  </pre>
                </div>
              ) : null}

              {makerStats ? (
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-zinc-400">Statistik Siswa (Maker Stats):</span>
                  <pre className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-amber-300 max-h-[160px] overflow-y-auto">
                    {JSON.stringify(makerStats, null, 2)}
                  </pre>
                </div>
              ) : null}

              {makerList ? (
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-zinc-400">Daftar Maker Terdaftar (Guru/Penguji):</span>
                  <pre className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-purple-300 max-h-[160px] overflow-y-auto">
                    {JSON.stringify(makerList, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
