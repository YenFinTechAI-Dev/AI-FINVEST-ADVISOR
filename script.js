const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

function showPage(name) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + name).classList.add('active');
    document.getElementById('nav-' + name).classList.add('active');
}

function dismissAlert(btn) {
    btn.closest('.alert-item').style.transition = 'all 0.3s';
    btn.closest('.alert-item').style.opacity = '0';
    btn.closest('.alert-item').style.transform = 'translateX(20px)';
    setTimeout(() => btn.closest('.alert-item').remove(), 300);
}

function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function sendQuick(text) {
    document.getElementById('chatInput').value = text;
    sendMessage();
}

function addMessage(text, isUser) {
    const container = document.getElementById('chatMessages');
    const time = new Date().toLocaleTimeString('vi', { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div');
    div.className = 'msg' + (isUser ? ' user' : '');
    div.innerHTML = `
    <div class="msg-avatar ${isUser ? 'user' : 'ai'}">${isUser ? '👤' : '🤖'}</div>
    <div>
      <div class="msg-body">${text.replace(/\n/g, '<br>')}</div>
      <div class="msg-time">${time} · ${isUser ? 'Bạn' : 'AI Finvest'}</div>
    </div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
}

function addTyping() {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'msg';
    div.id = 'typingIndicator';
    div.innerHTML = `
    <div class="msg-avatar ai">🤖</div>
    <div>
      <div class="msg-body"><div class="typing"><span></span><span></span><span></span></div></div>
    </div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const btn = document.getElementById('sendBtn');
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, true);
    input.value = '';
    input.style.height = 'auto';
    btn.disabled = true;

    addTyping();
    document.getElementById('loadingBar').style.display = 'block';

    try {
        const systemPrompt = `Bạn là AI-Finvest Advisor, một trợ lý tài chính thông minh chuyên về thị trường chứng khoán Việt Nam (HOSE, HNX, UPCOM). 

Bạn có khả năng:
- Phân tích cổ phiếu Việt Nam (FPT, HPG, MWG, VNM, MSN, VIC, VHM, TCB, VCB, BID...)
- Giải thích các chỉ số tài chính: P/E, ROE, EPS, Debt/Equity, Sharpe Ratio...
- Tư vấn chiến lược đầu tư theo lý thuyết Markowitz
- Phân tích kỹ thuật và xu hướng thị trường
- Quản lý rủi ro danh mục

Phong cách: chuyên nghiệp nhưng thân thiện, dùng tiếng Việt, có thể dùng emoji để làm nổi bật. Luôn nhắc người dùng rằng đây là gợi ý AI, không phải lời khuyên tài chính chính thức.

Thông tin danh mục hiện tại của người dùng: FPT 30%, HPG 15%, MWG 12%, VNM 10%, MSN 8%, ETF VN30 25%. Risk Score: 6.2/10. Vốn: ~1.27 tỷ đồng. YTD: +18.62%.`;

        const response = await fetch(ANTHROPIC_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                system: systemPrompt,
                messages: [{ role: 'user', content: text }]
            })
        });

        const data = await response.json();
        document.getElementById('typingIndicator')?.remove();
        document.getElementById('loadingBar').style.display = 'none';

        if (data.content && data.content[0]) {
            addMessage(data.content[0].text, false);
        } else {
            addMessage('Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.', false);
        }
    } catch (err) {
        document.getElementById('typingIndicator')?.remove();
        document.getElementById('loadingBar').style.display = 'none';
        addMessage('❌ Lỗi kết nối AI. Vui lòng kiểm tra kết nối và thử lại.', false);
    }

    btn.disabled = false;
}

async function runAssessment() {
    const age = document.getElementById('ageRange').value;
    const capital = document.getElementById('capital').value;
    const horizon = document.getElementById('timeHorizon').value;
    const exp = document.getElementById('experience').value;
    const loss = document.getElementById('lossSlider').value;
    const goal = document.getElementById('goal').value;

    document.getElementById('assessPlaceholder').style.display = 'none';
    document.getElementById('assessResult').classList.add('show');
    document.getElementById('loadingBar').style.display = 'block';
    document.getElementById('resultScoreDisplay').innerHTML = `<div style="text-align:center;padding:40px 0;color:var(--text2)"><div class="typing" style="justify-content:center;margin-bottom:12px"><span></span><span></span><span></span></div>AI đang phân tích hồ sơ của bạn...</div>`;

    const prompt = `Hãy phân tích hồ sơ đầu tư sau và đề xuất danh mục tối ưu. Trả lời bằng tiếng Việt, chuyên nghiệp và ngắn gọn.

Thông tin:
- Độ tuổi: ${age}
- Vốn: ${capital}
- Thời gian đầu tư: ${horizon} năm
- Kinh nghiệm: ${exp}
- Chấp nhận thua lỗ tối đa: ${loss}%
- Mục tiêu: ${goal}

Hãy trả về:
1. Risk Score (0-10) và phân loại (Thận trọng/Cân bằng/Tăng trưởng)
2. Nhận xét ngắn về hồ sơ (2-3 câu)
3. Danh mục đề xuất với 4-5 tài sản (mã CK hoặc loại tài sản và tỷ lệ %)
4. Lời khuyên chiến lược (2-3 điểm ngắn)`;

    try {
        const response = await fetch(ANTHROPIC_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                messages: [{ role: 'user', content: prompt }]
            })
        });
        const data = await response.json();
        document.getElementById('loadingBar').style.display = 'none';

        if (data.content && data.content[0]) {
            const text = data.content[0].text;
            document.getElementById('resultScoreDisplay').innerHTML = `
        <div style="background:rgba(0,212,255,0.05);border:1px solid rgba(0,212,255,0.15);border-radius:12px;padding:20px;white-space:pre-wrap;font-size:13.5px;line-height:1.7;color:var(--text)">
          <div style="font-size:12px;color:var(--cyan);font-weight:600;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.5px">🤖 Kết quả phân tích AI</div>
          ${text.replace(/\n/g, '<br>')}
        </div>
        <div style="margin-top:12px;font-size:11.5px;color:var(--text3);text-align:center">⚠️ Đây là gợi ý AI — không phải lời khuyên tài chính chính thức. Hãy tham khảo chuyên gia trước khi đầu tư.</div>`;
        }
    } catch (err) {
        document.getElementById('loadingBar').style.display = 'none';
        document.getElementById('resultScoreDisplay').innerHTML = `<div style="color:var(--red);padding:20px;text-align:center">❌ Lỗi kết nối AI. Vui lòng thử lại.</div>`;
    }
}

// Charts
Chart.defaults.color = '#8BA3CC';
Chart.defaults.borderColor = '#1E3155';

const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
const portfolio = [0, 1.2, 3.5, 5.1, 7.8, 9.2, 11.0, 12.5, 14.1, 15.6, 17.2, 18.6];
const vnindex = [0, 0.5, 1.8, 2.3, 3.1, 4.0, 5.2, 6.1, 7.0, 7.5, 8.1, 8.7];

new Chart(document.getElementById('perfChart'), {
    type: 'line',
    data: {
        labels: months,
        datasets: [
            { label: 'Danh mục', data: portfolio, borderColor: '#00D4FF', backgroundColor: 'rgba(0,212,255,0.05)', tension: 0.4, pointRadius: 2, borderWidth: 2, fill: true },
            { label: 'VN-INDEX', data: vnindex, borderColor: '#4A6488', backgroundColor: 'transparent', tension: 0.4, pointRadius: 2, borderWidth: 1.5, borderDash: [4, 4] }
        ]
    },
    options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { font: { size: 12 }, padding: 16 } } },
        scales: {
            y: { grid: { color: 'rgba(30,49,85,0.5)' }, ticks: { callback: v => v + '%' } },
            x: { grid: { display: false } }
        }
    }
});

new Chart(document.getElementById('donutChart'), {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [40, 25, 20, 10, 5],
            backgroundColor: ['#00D4FF', '#00E5A0', '#7C5CFC', '#FFB800', '#FF4B6B'],
            borderWidth: 0,
            hoverOffset: 6
        }]
    },
    options: {
        responsive: false,
        cutout: '70%',
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ctx.parsed + '%' } } }
    }
});

new Chart(document.getElementById('frontierChart'), {
    type: 'scatter',
    data: {
        datasets: [
            {
                label: 'Efficient Frontier',
                data: [{ x: 5, y: 6 }, { x: 7, y: 9 }, { x: 9, y: 12 }, { x: 11, y: 14 }, { x: 13, y: 16 }, { x: 15, y: 17.5 }, { x: 18, y: 18.5 }, { x: 22, y: 19 }],
                borderColor: '#00D4FF', backgroundColor: 'rgba(0,212,255,0.1)',
                showLine: true, tension: 0.4, pointRadius: 3
            },
            {
                label: 'Danh mục của bạn',
                data: [{ x: 12.3, y: 18.6 }],
                backgroundColor: '#00E5A0', pointRadius: 10, pointHoverRadius: 12
            }
        ]
    },
    options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { font: { size: 12 } } } },
        scales: {
            x: { title: { display: true, text: 'Rủi ro σ (%)', color: '#8BA3CC' }, grid: { color: 'rgba(30,49,85,0.5)' } },
            y: { title: { display: true, text: 'Lợi nhuận (%)', color: '#8BA3CC' }, grid: { color: 'rgba(30,49,85,0.5)' } }
        }
    }
});