const API_URL = "http://127.0.0.1:8000/api";
const AI_URL = "http://127.0.0.1:8001/api";

let myChart;


function fmt(n) {
    return Number(n || 0).toLocaleString('vi-VN') + "đ";
}

function setActive(el) {
    document.querySelectorAll('.nav-item')
        .forEach(i => i.classList.remove('active'));

    el.classList.add('active');
}



function updateClock() {
    const now = new Date();

    const el = document.getElementById('updateTime');

    if (el) {
        el.textContent = now.toLocaleTimeString('vi-VN');
    }
}

setInterval(updateClock, 1000);
updateClock();


function renderChart(labels, values) {

    const ctx = document
        .getElementById('expenseChart')
        .getContext('2d');

    if (myChart) myChart.destroy();

    const defaultLabels = [
        'Cổ phiếu',
        'ETF',
        'Trái phiếu',
        'Tiền mặt',
        'Khác'
    ];

    const defaultValues = [40, 25, 20, 10, 5];

    const useLabels =
        labels && labels.length
            ? labels
            : defaultLabels;

    const useValues =
        values && values.length
            ? values
            : defaultValues;

    myChart = new Chart(ctx, {
        type: 'doughnut',

        data: {
            labels: useLabels,

            datasets: [{
                data: useValues,

                backgroundColor: [
                    '#00c6ff',
                    '#00e5a0',
                    '#ffd166',
                    '#ff4d6d',
                    '#7c3aed',
                    '#f97316'
                ],

                borderWidth: 0,
                hoverOffset: 6
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '72%',

            plugins: {
                legend: {
                    position: 'bottom',

                    labels: {
                        padding: 14,

                        font: {
                            size: 12,
                            family: 'Outfit'
                        },

                        color: '#8ba3c7',
                        boxWidth: 10,
                        borderRadius: 3
                    }
                }
            }
        }
    });
}


async function loadDashboard() {

    try {

        const res = await fetch(`${API_URL}/dashboard`);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        const income =
            data.summary?.total_income || 0;

        const expense =
            data.summary?.total_expense || 0;

        const balance = income - expense;



        document.getElementById('mc-income').innerText =
            fmt(income);

        document.getElementById('mc-expense').innerText =
            fmt(expense);

        const mcBal =
            document.getElementById('mc-balance');

        mcBal.innerText = fmt(balance);

        mcBal.style.color =
            balance >= 0
                ? 'var(--cyan)'
                : 'var(--red)';

        const txEl =
            document.getElementById('totalTx');

        if (txEl) {
            txEl.innerText =
                (data.history || []).length;
        }


        if (
            data.chart &&
            data.chart.labels &&
            data.chart.labels.length > 0
        ) {

            renderChart(
                data.chart.labels,
                data.chart.values
            );

        } else {

            renderChart(null, null);
        }



        renderHistory(data.history || []);

        return data;

    } catch (e) {

        console.warn("Backend lỗi:", e.message);

        renderChart(null, null);

        renderHistory([]);

        return null;
    }
}



function renderHistory(history) {

    const el =
        document.getElementById('historyList');

    if (!history.length) {

        el.innerHTML = `
        <p style="
            color:var(--text3);
            text-align:center;
            padding:24px;
            font-size:14px;
        ">
            Chưa có giao dịch nào
        </p>`;

        return;
    }

    const catIcons = {
        'Cổ phiếu': '📈',
        'ETF': '💹',
        'Trái phiếu': '🏦',
        'Tiền mặt': '💵',
        'Khác': '📊'
    };

    el.innerHTML = history.map(tx => {



        const isBuy =
            tx.type === 'Chi' ||
            tx.type === 'buy' ||
            tx.type === 'Mua vào';

        const cls =
            isBuy ? 'thu' : 'chi';

        const sign =
            isBuy ? '+' : '-';

        const label =
            isBuy ? 'Mua vào' : 'Bán ra';


        const icon =
            catIcons[tx.category] || '';

        const date = tx.date
            ? new Date(tx.date)
                .toLocaleDateString('vi-VN')
            : '';

        return `
        <div class="history-item fade-in">

            <div class="history-icon-wrap ${cls}">
                ${icon}
            </div>

            <div class="history-info">

                <div class="history-cat">
                    ${label}
                </div>

                <div class="history-note">
                    ${tx.note || date}
                </div>

            </div>

            <div class="history-amount ${cls}">
                ${sign}${Number(tx.amount)
                .toLocaleString('vi-VN')}đ
            </div>

        </div>`;

    }).join('');
}



function renderMarkdown(text) {

    if (!text) return '';

    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^[•\-]\s+(.+)$/gm, '<li>$1</li>')
        .replace(/\n/g, '<br>')
        .replace(
            /(<li>.*?<\/li>)(<br>(<li>.*?<\/li>))*/g,
            m => '<ul>' + m.replace(/<br>/g, '') + '</ul>'
        );
}



async function processAI() {

    const input =
        document.getElementById('aiInput');

    const status =
        document.getElementById('aiStatus');

    const btn =
        document.getElementById('btnAI');

    const text =
        input.value.trim();

    if (!text) return;

    btn.disabled = true;

    btn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Đang phân tích...';

    status.style.display = 'block';

    status.innerHTML = `
    <div class="ai-status-box loading">

        <div class="ai-thinking">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>

            AI đang phân tích...
        </div>

    </div>`;

    try {

        const aiRes = await fetch(`${AI_URL}/analyze`, {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({ text })
        });

        const aiData = await aiRes.json();

        if (aiData.status === "success") {

            const result = aiData.data;

            if (result.amount > 0) {

                await fetch(`${API_URL}/transactions`, {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify(result)
                });

                await loadDashboard();

                const isBuy =
                    result.type === 'Chi' ||
                    result.type === 'buy' ||
                    result.type === 'Mua vào';

                const color =
                    isBuy
                        ? 'var(--green)'
                        : 'var(--red)';

                const label =
                    isBuy
                        ? 'Mua vào'
                        : 'Bán ra';

                status.innerHTML = `
                <div class="ai-status-box success">

                     Đã ghi
                    <strong style="color:${color}">
                        ${label}
                    </strong>

                    ${fmt(result.amount)}

                </div>`;

            } else {

                status.innerHTML = `
                <div class="ai-status-box analysis">

                    <div class="ai-analysis-header">
                        Phân tích AI
                    </div>

                    <div class="ai-analysis-body">
                        ${renderMarkdown(result.note)}
                    </div>

                </div>`;
            }

            input.value = "";

        } else {

            status.innerHTML = `
            <div class="ai-status-box error">

                ${aiData.message}

            </div>`;
        }

    } catch (err) {

        status.innerHTML = `
        <div class="ai-status-box error">

            Lỗi AI Server

        </div>`;
    }

    btn.disabled = false;

    btn.innerHTML =
        '<i class="fa-solid fa-paper-plane"></i> Gửi AI';
}



document.getElementById('transactionForm')
    .addEventListener('submit', async (e) => {

        e.preventDefault();

        const payload = {

            amount: parseInt(
                document.getElementById('amount').value
            ),

            type:
                document.getElementById('type').value,

            category:
                document.getElementById('category').value,

            note:
                document.getElementById('note').value
        };

        const btn =
            document.getElementById('btnSave');

        btn.disabled = true;

        btn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';

        try {

            const res = await fetch(`${API_URL}/transactions`, {

                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

        } catch (err) {

            console.warn("Lỗi lưu:", err);
        }

        e.target.reset();

        await loadDashboard();

        btn.innerHTML =
            '<i class="fa-solid fa-check"></i> Đã lưu!';

        setTimeout(() => {

            btn.innerHTML =
                '<i class="fa-solid fa-floppy-disk"></i> LƯU GIAO DỊCH';

            btn.disabled = false;

        }, 1500);
    });



document
    .getElementById('aiInput')
    .addEventListener('keydown', e => {

        if (e.key === 'Enter') {
            processAI();
        }
    });



document.addEventListener(
    'DOMContentLoaded',
    loadDashboard
);