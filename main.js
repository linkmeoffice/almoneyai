/**
 * ============================================================
 * MONEYMIND AI — main.js v3.0 (Super Canggih + Kepentingan Nyata)
 * Analisis keuangan dengan fokus pada: Sekolah, Kerja, Kuliah, Makan
 * ============================================================
 */

// ============================================================
// 1. KONFIGURASI & STATE
// ============================================================
const CONFIG = {
    loadingSteps: [
        'Menganalisis nominal...',
        'Menghitung prioritas...',
        'Menyusun strategi...',
        'Membuat proyeksi...',
        'Menganalisis risiko...',
        'Menghitung indeks kesehatan...',
        'Menyiapkan rekomendasi...',
        'Analisis selesai.'
    ],
    chartColors: ['#4a6cf7', '#6a8cff', '#8aa8ff', '#aac0ff', '#5a7af7', '#3a5cd7'],
    scoreCategories: [
        { max: 30, label: 'Perlu perhatian', desc: 'Segera evaluasi keuangan' },
        { max: 50, label: 'Mulai tertata', desc: 'Langkah awal sudah baik' },
        { max: 70, label: 'Cukup baik', desc: 'Terus tingkatkan disiplin' },
        { max: 85, label: 'Stabil', desc: 'Keuangan terkendali' },
        { max: 100, label: 'Sangat siap', desc: 'Kondisi keuangan prima' }
    ]
};

// State
let state = {
    nominal: 0,
    level: 0,
    status: '',
    allocation: {},
    percentages: {},
    score: 0,
    fhi: 0,
    emergencyMonths: 0,
    savingsRate: 0,
    riskLevel: '',
    analysis: '',
    priorities: [],
    reasons: [],
    timeline: [],
    projections: [],
    riskAnalysis: {}
};

// Chart instances
let doughnutChartInstance = null;
let barChartInstance = null;
let lineChartInstance = null;

// ============================================================
// 2. DOM REFS
// ============================================================
const $ = (id) => document.getElementById(id);
const moneyInput = $('moneyInput');
const analyzeBtn = $('analyzeBtn');
const resetBtn = $('resetBtn');
const loadingOverlay = $('loadingOverlay');
const loadingText = $('loadingText');
const resultsDashboard = $('resultsDashboard');

const totalDanaEl = $('totalDana');
const statusDanaEl = $('statusDana');
const scoreNumberEl = $('scoreNumber');
const scoreBarEl = $('scoreBar');
const scoreCategoryEl = $('scoreCategory');
const analysisTextEl = $('analysisText');
const allocationGrid = $('allocationGrid');
const prioritiesList = $('prioritiesList');
const reasoningList = $('reasoningList');
const timelineGrid = $('timelineGrid');
const fhiEl = $('fhiDisplay');
const emergencyEl = $('emergencyDisplay');
const savingsRateEl = $('savingsRateDisplay');
const riskEl = $('riskDisplay');

// ============================================================
// 3. UTILITY FUNGSI
// ============================================================
function formatRupiah(angka) {
    if (angka === undefined || angka === null || isNaN(angka)) return 'Rp 0';
    const number = Math.floor(angka);
    const formatted = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp ${formatted}`;
}

function parseMoney(raw) {
    if (!raw) return 0;
    const cleaned = raw.replace(/[^0-9]/g, '');
    return parseInt(cleaned, 10) || 0;
}

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

function animateNumber(element, target, prefix = '', suffix = '', duration = 900) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * ease);
        element.textContent = prefix + current.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + suffix;
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = prefix + target.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + suffix;
        }
    }
    requestAnimationFrame(update);
}

// ============================================================
// 4. LOGIKA ANALISIS — Level & Alokasi Spesifik
// ============================================================

function getLevel(nominal) {
    if (nominal <= 0) return { level: 0, status: 'Belum ada dana' };
    if (nominal <= 500000) return { level: 1, status: 'Dana Terbatas' };
    if (nominal <= 2000000) return { level: 2, status: 'Dana Awal' };
    if (nominal <= 5000000) return { level: 3, status: 'Dana Menengah' };
    if (nominal <= 10000000) return { level: 4, status: 'Dana Stabil' };
    return { level: 5, status: 'Dana Besar' };
}

/**
 * Alokasi dana dengan fokus pada:
 * - Makan (Food)
 * - Transportasi (Transport)
 * - Pendidikan: Sekolah/Kuliah (Education)
 * - Pengembangan Karir / Kerja (Career)
 * - Tabungan & Dana Darurat (Savings)
 * - Fleksibel (Flexible)
 */
function getAllocationPercentages(level, nominal) {
    let p = {};

    switch (level) {
        case 1: // Dana Terbatas (0 - 500k)
            p = {
                makan: 35,
                transportasi: 20,
                pendidikan: 15,
                karir: 5,
                tabungan: 10,
                fleksibel: 15
            };
            break;
        case 2: // Dana Awal (500k - 2M)
            p = {
                makan: 28,
                transportasi: 15,
                pendidikan: 15,
                karir: 10,
                tabungan: 20,
                fleksibel: 12
            };
            break;
        case 3: // Dana Menengah (2M - 5M)
            p = {
                makan: 22,
                transportasi: 12,
                pendidikan: 16,
                karir: 15,
                tabungan: 25,
                fleksibel: 10
            };
            break;
        case 4: // Dana Stabil (5M - 10M)
            p = {
                makan: 18,
                transportasi: 10,
                pendidikan: 15,
                karir: 15,
                tabungan: 30,
                fleksibel: 12
            };
            break;
        case 5: // Dana Besar (>10M)
            p = {
                makan: 14,
                transportasi: 8,
                pendidikan: 15,
                karir: 15,
                tabungan: 35,
                fleksibel: 13
            };
            break;
        default:
            p = {
                makan: 30,
                transportasi: 15,
                pendidikan: 15,
                karir: 10,
                tabungan: 20,
                fleksibel: 10
            };
            break;
    }

    // Penyesuaian halus berdasarkan nominal
    if (nominal > 3000000 && level >= 3) {
        p.tabungan += 3;
        p.makan -= 2;
        p.fleksibel -= 1;
    }

    // Normalize to 100%
    const total = Object.values(p).reduce((a, b) => a + b, 0);
    for (let key in p) {
        p[key] = Math.round((p[key] / total) * 100);
    }
    // Ensure sum is 100
    const sum = Object.values(p).reduce((a, b) => a + b, 0);
    if (sum !== 100) {
        const diff = 100 - sum;
        p.tabungan += diff;
    }
    return p;
}

function calculateScore(nominal, level, percentages) {
    let base = 0;
    switch (level) {
        case 1:
            base = 20;
            break;
        case 2:
            base = 40;
            break;
        case 3:
            base = 60;
            break;
        case 4:
            base = 78;
            break;
        case 5:
            base = 90;
            break;
        default:
            base = 0;
    }

    // Savings & emergency ratio bonus
    const saveRatio = (percentages.tabungan) / 100;
    let bonus = saveRatio * 20;

    // Emergency months
    const emergencyMonths = Math.min(12, Math.floor(nominal / 500000));
    let emergencyBonus = Math.min(10, emergencyMonths * 0.8);

    // Pendidikan dan karir juga memberi bonus
    const eduCareer = (percentages.pendidikan + percentages.karir) / 100;
    let eduBonus = eduCareer * 5;

    const variation = (nominal % 13) / 13 * 3;

    let score = Math.min(100, Math.round(base + bonus + emergencyBonus + eduBonus + variation));
    return score;
}

function calculateFHI(score, level, nominal) {
    let fhi = score * 0.55;
    const nominalFactor = Math.min(20, Math.floor(nominal / 500000) * 0.5);
    fhi += nominalFactor;
    const levelFactor = level * 3;
    fhi += levelFactor;
    fhi += (nominal % 7) * 0.2;
    return Math.min(100, Math.round(fhi));
}

function calculateEmergencyMonths(nominal) {
    const monthlyExpense = Math.max(300000, nominal * 0.15);
    return Math.min(24, Math.floor(nominal / monthlyExpense));
}

function calculateSavingsRate(percentages) {
    return percentages.tabungan + percentages.fleksibel * 0.3;
}

function calculateRiskLevel(level, nominal) {
    if (nominal < 1000000) return 'Rendah (konservatif)';
    if (nominal < 3000000) return 'Sedang (moderat)';
    if (nominal < 7000000) return 'Tinggi (agresif)';
    return 'Sangat Tinggi (ekspansif)';
}

// ============================================================
// 5. GENERATE ANALYSIS (Fokus: Sekolah, Kerja, Kuliah, Makan)
// ============================================================

function generateAnalysis(nominal, level, status, score) {
    const templates = {
        1: [
            `Dengan dana sebesar ${formatRupiah(nominal)}, sistem menilai bahwa prioritas utama adalah memenuhi kebutuhan makan sehari-hari dan transportasi. Untuk pendidikan (sekolah/kuliah), alokasikan secukupnya untuk keperluan dasar seperti alat tulis atau buku. Skor kesiapan Anda adalah ${score}/100 — masih perlu perhatian serius.`,
            `Dana terbatas berarti fokus utama adalah makanan dan transportasi. Untuk keperluan sekolah/kuliah, prioritaskan yang benar-benar diperlukan. Pengembangan karir bisa dimulai dengan belajar mandiri menggunakan sumber gratis.`
        ],
        2: [
            `Dengan dana sebesar ${formatRupiah(nominal)}, Anda sudah bisa mulai mengatur alokasi untuk makanan, transportasi, dan pendidikan. Mulailah menyisihkan untuk tabungan dan sedikit untuk pengembangan karir. Skor ${score}/100 menunjukkan Anda mulai tertata.`,
            `Dana awal ini memungkinkan Anda untuk memenuhi kebutuhan makan dan transportasi dengan lebih nyaman. Alokasi untuk pendidikan (sekolah/kuliah) dan karir mulai bisa diperhatikan. Jangan lupa menabung!`
        ],
        3: [
            `Dengan dana sebesar ${formatRupiah(nominal)}, Anda memiliki ruang untuk menyeimbangkan antara kebutuhan makan, transportasi, pendidikan, karir, dan tabungan. ${score > 70 ? 'Kondisi keuangan Anda cukup sehat.' : 'Perhatikan alokasi untuk memperkuat fondasi.'}`,
            `Dana menengah memberi fleksibilitas. Anda bisa lebih serius dalam mengalokasikan untuk pendidikan (sekolah/kuliah) dan pengembangan karir. Makan dan transportasi tetap prioritas, tapi tabungan mulai mendapat porsi yang lebih baik.`
        ],
        4: [
            `Dengan dana sebesar ${formatRupiah(nominal)}, Anda berada pada posisi stabil. Makan dan transportasi terjamin, pendidikan dan karir dapat dikembangkan dengan lebih baik, dan tabungan Anda cukup solid. Skor ${score}/100 menunjukkan keuangan yang terkendali.`,
            `Stabilitas keuangan memungkinkan Anda untuk berinvestasi pada pendidikan lanjutan, sertifikasi karir, dan membangun tabungan jangka panjang. Jangan lupa untuk tetap menjaga budget makan dan transportasi agar tidak berlebihan.`
        ],
        5: [
            `Dengan dana sebesar ${formatRupiah(nominal)}, Anda memiliki modal yang signifikan. Makan dan transportasi bukan lagi masalah utama. Fokus pada pendidikan berkualitas, pengembangan karir profesional, dan tabungan jangka panjang. Skor ${score}/100 mengindikasikan kondisi keuangan yang sangat baik.`,
            `Dana besar memberi kebebasan untuk memilih pendidikan terbaik, mengikuti pelatihan karir, dan membangun aset. Namun tetap kelola dengan bijak — jangan sampai pengeluaran untuk makanan dan gaya hidup membengkak tidak terkendali.`
        ]
    };

    const list = templates[level] || templates[1];
    const idx = (nominal + score) % list.length;
    return list[idx];
}

// ============================================================
// 6. PRIORITIES (Spesifik)
// ============================================================

function generatePriorities(level, percentages) {
    const labels = {
        makan: 'Makan & Gizi',
        transportasi: 'Transportasi',
        pendidikan: 'Pendidikan (Sekolah/Kuliah)',
        karir: 'Pengembangan Karir / Kerja',
        tabungan: 'Tabungan & Dana Darurat',
        fleksibel: 'Pengeluaran Fleksibel'
    };
    const keys = ['makan', 'transportasi', 'pendidikan', 'karir', 'tabungan', 'fleksibel'];

    const sorted = keys.map((k) => ({ key: k, label: labels[k], value: percentages[k] || 0 }));
    sorted.sort((a, b) => b.value - a.value);

    return sorted.map((item, idx) => ({
        rank: String(idx + 1).padStart(2, '0'),
        label: item.label,
        percent: item.value
    }));
}

// ============================================================
// 7. REASONING (Fokus: Sekolah, Kerja, Kuliah, Makan)
// ============================================================

function generateReasoning(level, nominal, percentages, score) {
    const reasons = {
        1: [
            'Makan adalah kebutuhan paling dasar — alokasi terbesar untuk memastikan gizi tetap terjaga.',
            'Transportasi penting untuk mobilitas sehari-hari, terutama untuk sekolah/kuliah atau kerja.',
            'Pendidikan (sekolah/kuliah) tetap diperhatikan meskipun dengan alokasi kecil.',
            'Pengembangan karir dimulai dari hal kecil, seperti belajar keterampilan baru.',
            'Tabungan kecil tetap diusahakan untuk membangun kebiasaan menabung.'
        ],
        2: [
            'Makan dan gizi menjadi prioritas untuk mendukung aktivitas sehari-hari.',
            'Transportasi yang lancar menunjang produktivitas sekolah dan kerja.',
            'Pendidikan mulai mendapat porsi lebih untuk menunjang masa depan.',
            'Pengembangan karir mulai diperhatikan untuk peningkatan kapasitas.',
            'Tabungan mulai dibangun secara konsisten.'
        ],
        3: [
            'Makan tetap prioritas tetapi dengan porsi yang lebih proporsional.',
            'Transportasi dikelola efisien agar tidak membengkak.',
            'Pendidikan (sekolah/kuliah) menjadi investasi jangka panjang.',
            'Karir dikembangkan melalui pelatihan atau sertifikasi.',
            'Tabungan ditingkatkan untuk menghadapi kebutuhan mendadak.'
        ],
        4: [
            'Makan dan gizi tetap terjaga dengan porsi yang sehat.',
            'Transportasi sudah tidak menjadi beban utama.',
            'Pendidikan berkualitas menjadi fokus untuk peningkatan kapasitas.',
            'Karir dikembangkan secara profesional.',
            'Tabungan mencapai level yang cukup untuk menghadapi risiko.'
        ],
        5: [
            'Makan dan gizi terjamin dengan porsi yang ideal.',
            'Transportasi dikelola dengan efisien dan nyaman.',
            'Pendidikan premium dapat diakses untuk pengembangan maksimal.',
            'Karir dikembangkan dengan pelatihan dan jaringan profesional.',
            'Tabungan jangka panjang menjadi fondasi kemandirian finansial.'
        ]
    };

    const list = reasons[level] || reasons[1];
    if (level >= 4) {
        list.push('Jaga keseimbangan antara konsumsi dan investasi untuk masa depan.');
    }
    if (level <= 2) {
        list.push('Mulailah dengan langkah kecil — konsistensi lebih penting daripada besarnya nominal.');
    }
    return list;
}

// ============================================================
// 8. TIMELINE (Spesifik)
// ============================================================

function generateTimeline(level, nominal, score) {
    const timelines = {
        1: {
            sekarang: 'Catat semua pengeluaran makan dan transportasi. Buat anggaran harian.',
            bulan1: 'Coba sisihkan Rp20.000–Rp50.000 untuk tabungan pendidikan.',
            bulan3: 'Evaluasi pola makan dan transportasi — cari cara lebih hemat.',
            bulan6: 'Jika konsisten, mulai pikirkan pengembangan karir kecil-kecilan.',
            bulan12: 'Rencanakan untuk meningkatkan penghasilan atau mengurangi pengeluaran.'
        },
        2: {
            sekarang: 'Buat anggaran bulanan: makan, transportasi, pendidikan, karir, tabungan.',
            bulan1: 'Mulai rutin menabung minimal 10% dari dana untuk tabungan.',
            bulan3: 'Dana cadangan mulai terkumpul; pertimbangkan untuk kursus singkat.',
            bulan6: 'Evaluasi kemajuan pendidikan dan karir.',
            bulan12: 'Tentukan tujuan pendidikan (sekolah/kuliah) berikutnya.'
        },
        3: {
            sekarang: 'Perkuat dana darurat minimal 3 bulan pengeluaran.',
            bulan1: 'Alokasikan dana untuk pendidikan (kursus, buku, sertifikasi).',
            bulan3: 'Tinjau kembali alokasi karir — apakah ada peluang pengembangan?',
            bulan6: 'Evaluasi pencapaian tujuan pendidikan dan karir.',
            bulan12: 'Rencanakan pendidikan lanjutan atau peningkatan karir.'
        },
        4: {
            sekarang: 'Pastikan dana darurat mencapai 6 bulan pengeluaran.',
            bulan1: 'Mulai investasi pada pendidikan berkualitas (kuliah, pelatihan).',
            bulan3: 'Kembangkan karir dengan sertifikasi profesional.',
            bulan6: 'Evaluasi portofolio pendidikan dan karir.',
            bulan12: 'Tetapkan target karir jangka panjang.'
        },
        5: {
            sekarang: 'Konsolidasikan dana dan pastikan likuiditas yang cukup.',
            bulan1: 'Pilih program pendidikan premium yang sesuai dengan tujuan.',
            bulan3: 'Bangun jaringan profesional dan kembangkan karir.',
            bulan6: 'Evaluasi portofolio dan lakukan rebalancing jika perlu.',
            bulan12: 'Rencanakan tujuan jangka panjang: pendidikan lanjutan, bisnis, atau investasi.'
        }
    };

    const t = timelines[level] || timelines[1];
    return [
        { period: 'SEKARANG', desc: t.sekarang },
        { period: '1 BULAN', desc: t.bulan1 },
        { period: '3 BULAN', desc: t.bulan3 },
        { period: '6 BULAN', desc: t.bulan6 },
        { period: '12 BULAN', desc: t.bulan12 }
    ];
}

// ============================================================
// 9. PROYEKSI
// ============================================================

function generateProjections(nominal, level) {
    const base = nominal;
    const scenarios = [
        { label: 'Pesimis', factor: 0.02 },
        { label: 'Moderat', factor: 0.05 },
        { label: 'Optimis', factor: 0.08 }
    ];
    const periods = [0, 3, 6, 12];
    const data = scenarios.map(scenario => {
        return periods.map(months => {
            const growth = Math.pow(1 + scenario.factor, months / 12);
            return Math.round(base * growth);
        });
    });
    return { scenarios, periods, data };
}

// ============================================================
// 10. RENDER CHARTS
// ============================================================

function renderCharts(allocation, nominal, projectionsData) {
    if (doughnutChartInstance) {
        doughnutChartInstance.destroy();
        doughnutChartInstance = null;
    }
    if (barChartInstance) {
        barChartInstance.destroy();
        barChartInstance = null;
    }

    // Doughnut Chart
    const ctxDoughnut = document.getElementById('doughnutChart').getContext('2d');
    const labels = ['Makan', 'Transportasi', 'Pendidikan', 'Karir', 'Tabungan', 'Fleksibel'];
    const values = [
        allocation.makan,
        allocation.transportasi,
        allocation.pendidikan,
        allocation.karir,
        allocation.tabungan,
        allocation.fleksibel
    ];
    const colors = ['#4a6cf7', '#6a8cff', '#8aa8ff', '#aac0ff', '#5a7af7', '#3a5cd7'];

    doughnutChartInstance = new Chart(ctxDoughnut, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: '#1c1e24',
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#c8d0e0',
                        font: { size: 11, weight: '400' },
                        padding: 12,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 1200
            }
        }
    });

    // Bar Chart — Proyeksi
    const ctxBar = document.getElementById('barChart').getContext('2d');
    const { periods, data, scenarios } = projectionsData;

    barChartInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: periods.map(p => p + ' bln'),
            datasets: [
                {
                    label: 'Pesimis',
                    data: data[0],
                    backgroundColor: '#4a4a6a',
                    borderRadius: 4,
                },
                {
                    label: 'Moderat',
                    data: data[1],
                    backgroundColor: '#5a7a9a',
                    borderRadius: 4,
                },
                {
                    label: 'Optimis',
                    data: data[2],
                    backgroundColor: '#7a9aba',
                    borderRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#c8d0e0',
                        font: { size: 10 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + formatRupiah(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#6a748a',
                        callback: function(value) {
                            return 'Rp ' + value.toLocaleString('id-ID');
                        }
                    },
                    grid: {
                        color: 'rgba(255,255,255,0.04)'
                    }
                },
                x: {
                    ticks: {
                        color: '#8a94aa'
                    },
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000
            }
        }
    });
}

// ============================================================
// 11. FUNGSI UTAMA ANALISIS
// ============================================================

function analyzeMoney(rawInput) {
    const nominal = parseMoney(rawInput);

    if (nominal <= 0) {
        alert('Belum ada dana yang dianalisis. Masukkan nominal terlebih dahulu.');
        return;
    }

    loadingOverlay.classList.add('active');
    resultsDashboard.classList.remove('visible');

    let idx = 0;
    const interval = setInterval(() => {
        loadingText.textContent = CONFIG.loadingSteps[idx % CONFIG.loadingSteps.length];
        idx++;
        if (idx >= CONFIG.loadingSteps.length) {
            clearInterval(interval);
        }
    }, 600);

    setTimeout(() => {
        clearInterval(interval);
        loadingText.textContent = 'Analisis selesai.';
        setTimeout(() => {
            loadingOverlay.classList.remove('active');
            displayResults(nominal);
            resultsDashboard.classList.add('visible');
            resultsDashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
    }, 3200);
}

// ============================================================
// 12. DISPLAY RESULTS
// ============================================================

function displayResults(nominal) {
    const { level, status } = getLevel(nominal);
    const percentages = getAllocationPercentages(level, nominal);
    const allocation = {
        makan: Math.round(nominal * percentages.makan / 100),
        transportasi: Math.round(nominal * percentages.transportasi / 100),
        pendidikan: Math.round(nominal * percentages.pendidikan / 100),
        karir: Math.round(nominal * percentages.karir / 100),
        tabungan: Math.round(nominal * percentages.tabungan / 100),
        fleksibel: Math.round(nominal * percentages.fleksibel / 100)
    };

    const score = calculateScore(nominal, level, percentages);
    const scoreCat = getScoreCategory(score);
    const fhi = calculateFHI(score, level, nominal);
    const emergencyMonths = calculateEmergencyMonths(nominal);
    const savingsRate = calculateSavingsRate(percentages);
    const riskLevel = calculateRiskLevel(level, nominal);

    const analysis = generateAnalysis(nominal, level, status, score);
    const priorities = generatePriorities(level, percentages);
    const reasons = generateReasoning(level, nominal, percentages, score);
    const timeline = generateTimeline(level, nominal, score);
    const projectionsData = generateProjections(nominal, level);

    // Render ke DOM
    animateNumber(totalDanaEl, nominal, 'Rp ', '', 900);
    statusDanaEl.textContent = status;

    animateNumber(scoreNumberEl, score, '', '', 900);
    scoreBarEl.style.width = score + '%';
    scoreCategoryEl.textContent = scoreCat;

    if (fhiEl) fhiEl.textContent = fhi + ' / 100';
    if (emergencyEl) emergencyEl.textContent = emergencyMonths + ' bulan';
    if (savingsRateEl) savingsRateEl.textContent = Math.round(savingsRate) + '%';
    if (riskEl) riskEl.textContent = riskLevel;

    analysisTextEl.textContent = analysis;

    // Alokasi
    allocationGrid.innerHTML = '';
    const allocLabels = {
        makan: 'Makan & Gizi',
        transportasi: 'Transportasi',
        pendidikan: 'Pendidikan (Sekolah/Kuliah)',
        karir: 'Pengembangan Karir / Kerja',
        tabungan: 'Tabungan & Dana Darurat',
        fleksibel: 'Pengeluaran Fleksibel'
    };
    const allocKeys = ['makan', 'transportasi', 'pendidikan', 'karir', 'tabungan', 'fleksibel'];
    const allocColors = ['#4a6cf7', '#6a8cff', '#8aa8ff', '#aac0ff', '#5a7af7', '#3a5cd7'];

    allocKeys.forEach((key, i) => {
        const amount = allocation[key];
        const percent = percentages[key];
        const div = document.createElement('div');
        div.className = 'allocation-item';
        div.style.borderLeft = `3px solid ${allocColors[i]}`;
        div.innerHTML = `
            <span class="allocation-label">${allocLabels[key]}</span>
            <span class="allocation-amount">${formatRupiah(amount)}</span>
            <span class="allocation-percent">${percent}%</span>
        `;
        allocationGrid.appendChild(div);
    });

    // Prioritas
    prioritiesList.innerHTML = '';
    priorities.forEach((p) => {
        const div = document.createElement('div');
        div.className = 'priority-item';
        div.innerHTML = `
            <span class="priority-rank">${p.rank}</span>
            <span class="priority-text">${p.label} (${p.percent}%)</span>
        `;
        prioritiesList.appendChild(div);
    });

    // Reasoning
    reasoningList.innerHTML = '';
    reasons.forEach((r) => {
        const li = document.createElement('li');
        li.textContent = r;
        reasoningList.appendChild(li);
    });

    // Timeline
    timelineGrid.innerHTML = '';
    timeline.forEach((t) => {
        const div = document.createElement('div');
        div.className = 'timeline-item';
        div.innerHTML = `
            <span class="timeline-period">${t.period}</span>
            <span class="timeline-desc">${t.desc}</span>
        `;
        timelineGrid.appendChild(div);
    });

    renderCharts(percentages, nominal, projectionsData);
}

// ============================================================
// 13. GET SCORE CATEGORY
// ============================================================

function getScoreCategory(score) {
    for (let cat of CONFIG.scoreCategories) {
        if (score <= cat.max) {
            return cat.label;
        }
    }
    return 'Sangat siap';
}

// ============================================================
// 14. RESET
// ============================================================

function resetApp() {
    moneyInput.value = 'Rp 0';
    resultsDashboard.classList.remove('visible');

    if (doughnutChartInstance) {
        doughnutChartInstance.destroy();
        doughnutChartInstance = null;
    }
    if (barChartInstance) {
        barChartInstance.destroy();
        barChartInstance = null;
    }

    totalDanaEl.textContent = 'Rp 0';
    statusDanaEl.textContent = '—';
    scoreNumberEl.textContent = '0';
    scoreBarEl.style.width = '0%';
    scoreCategoryEl.textContent = '—';
    analysisTextEl.textContent = 'Sistem siap menganalisis keuangan Anda.';
    allocationGrid.innerHTML = '';
    prioritiesList.innerHTML = '';
    reasoningList.innerHTML = '';
    timelineGrid.innerHTML = '';
    if (fhiEl) fhiEl.textContent = '—';
    if (emergencyEl) emergencyEl.textContent = '—';
    if (savingsRateEl) savingsRateEl.textContent = '—';
    if (riskEl) riskEl.textContent = '—';

    document.querySelector('.app-main').scrollIntoView({ behavior: 'smooth' });
}

// ============================================================
// 15. EVENT LISTENERS
// ============================================================

moneyInput.addEventListener('input', function(e) {
    let raw = this.value;
    if (!raw || raw === '') {
        this.value = 'Rp 0';
        return;
    }
    const digits = raw.replace(/[^0-9]/g, '');
    if (digits === '') {
        this.value = 'Rp 0';
        return;
    }
    const number = parseInt(digits, 10);
    this.value = formatRupiah(number);
});

analyzeBtn.addEventListener('click', function() {
    const raw = moneyInput.value;
    analyzeMoney(raw);
});

resetBtn.addEventListener('click', resetApp);

moneyInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        analyzeBtn.click();
    }
});

// ============================================================
// 16. INISIALISASI
// ============================================================

moneyInput.value = 'Rp 0';
console.log('MoneyMind AI v3.0 (Super Canggih + Kepentingan Nyata) siap digunakan.');
console.log('Fokus: Sekolah, Kerja, Kuliah, Makan, Transportasi, Tabungan');

// ============================================================
// 17. EKSPORT RINGKASAN (Opsional)
// ============================================================

function exportSummary() {
    const summary = `
--- MONEYMIND AI - Ringkasan Analisis ---
Total Dana: ${totalDanaEl.textContent}
Status: ${statusDanaEl.textContent}
Financial Readiness Score: ${scoreNumberEl.textContent}/100
Kategori: ${scoreCategoryEl.textContent}
FHI: ${fhiEl ? fhiEl.textContent : '—'}
Dana Darurat: ${emergencyEl ? emergencyEl.textContent : '—'}
Tingkat Tabungan: ${savingsRateEl ? savingsRateEl.textContent : '—'}
Profil Risiko: ${riskEl ? riskEl.textContent : '—'}

Analisis: ${analysisTextEl.textContent}

Prioritas:
${Array.from(document.querySelectorAll('.priority-item')).map(el => ' - ' + el.textContent.trim()).join('\n')}

Rencana:
${Array.from(document.querySelectorAll('.timeline-item')).map(el => ' - ' + el.textContent.trim()).join('\n')}

Disclaimer: Hasil ini merupakan simulasi edukasi, bukan nasihat keuangan profesional.
    `;

    navigator.clipboard.writeText(summary).then(() => {
        alert('Ringkasan analisis telah disalin ke clipboard!');
    }).catch(() => {
        alert('Gagal menyalin. Silakan salin secara manual.');
    });
}

console.log('Fitur export tersedia: panggil exportSummary()');
