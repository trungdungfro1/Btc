let priceChart;
let historicalData = [];
let currentPrice = 0;
let updateInterval;

// Khởi tạo biểu đồ
function initChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Giá Bitcoin (USD)',
                data: [],
                borderColor: '#f7931a',
                backgroundColor: 'rgba(247, 147, 26, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 2,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    }
                },
                y: {
                    display: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

// Lấy dữ liệu Bitcoin
async function fetchBitcoinData() {
    const statusDot = document.getElementById('statusDot');
    const connectionStatus = document.getElementById('connectionStatus');
    
    try {
        statusDot.className = 'status-indicator loading';
        connectionStatus.textContent = '🔄 Đang tải dữ liệu...';
        
        // Sử dụng CORS Anywhere proxy
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        
        // Lấy dữ liệu lịch sử
        const historyUrl = encodeURIComponent('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=0.25&interval=minute');
        const historyResponse = await fetch(corsProxy + historyUrl);
        const historyData = await historyResponse.json();
        
        // Lấy thông tin 24h
        const statsUrl = encodeURIComponent('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_24hr_high_low=true');
        const statsResponse = await fetch(corsProxy + statsUrl);
        const statsData = await statsResponse.json();
        
        // Xử lý dữ liệu
        historicalData = historyData.prices.map(item => ({
            time: new Date(item[0]),
            price: item[1]
        }));
        
        // Giữ 60 điểm gần nhất
        if (historicalData.length > 60) {
            historicalData = historicalData.slice(-60);
        }
        
        currentPrice = historicalData[historicalData.length - 1].price;
        
        // Cập nhật giá hiện tại
        document.getElementById('currentPrice').textContent = 
            '$' + currentPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        
        // Cập nhật thay đổi
        const change24h = statsData.bitcoin.usd_24h_change || 0;
        const changeElement = document.getElementById('priceChange');
        changeElement.textContent = (change24h >= 0 ? '+' : '') + change24h.toFixed(2) + '%';
        changeElement.className = 'price-change ' + (change24h >= 0 ? 'up' : 'down');
        
        // Thông tin 24h
        document.getElementById('high24').textContent = 
            '$' + (statsData.bitcoin.usd_24h_high || 0).toLocaleString('en-US', {maximumFractionDigits: 2});
        document.getElementById('low24').textContent = 
            '$' + (statsData.bitcoin.usd_24h_low || 0).toLocaleString('en-US', {maximumFractionDigits: 2});
        document.getElementById('volume24').textContent = 
            ((statsData.bitcoin.usd_24h_vol || 0) / currentPrice).toLocaleString('en-US', {maximumFractionDigits: 2});
        document.getElementById('change24').textContent = 
            (change24h >= 0 ? '+' : '') + change24h.toFixed(2) + '%';
        
        // Cập nhật biểu đồ
        updateChart();
        
        // Phân tích
        analyzeTrend();
        
        // Cập nhật trạng thái
        statusDot.className = 'status-indicator active';
        connectionStatus.textContent = '✅ Kết nối thành công - Tự động cập nhật mỗi 30s';
        document.getElementById('updateTime').textContent = 
            'Cập nhật: ' + new Date().toLocaleTimeString('vi-VN');
        
    } catch (error) {
        console.error('Lỗi:', error);
        statusDot.className = 'status-indicator loading';
        connectionStatus.textContent = '⚠️ Đang thử kết nối lại...';
        setTimeout(fetchBitcoinData, 5000);
    }
}

// Cập nhật biểu đồ
function updateChart() {
    priceChart.data.labels = historicalData.map(d => 
        d.time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    );
    priceChart.data.datasets[0].data = historicalData.map(d => d.price);
    priceChart.update('none');
}

// Tính RSI
function calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = prices.length - period; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) gains += change;
        else losses += Math.abs(change);
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

// Tính MA
function calculateMA(prices, period) {
    if (prices.length < period) return prices[prices.length - 1];
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
}

// Tính EMA
function calculateEMA(prices, period) {
    if (prices.length < period) return prices[prices.length - 1];
    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < prices.length; i++) {
        ema = (prices[i] - ema) * multiplier + ema;
    }
    return ema;
}

// Tính MACD
function calculateMACD(prices) {
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    return ema12 - ema26;
}

// Tính Bollinger Bands
function calculateBollingerBands(prices, period = 20) {
    const ma = calculateMA(prices, Math.min(period, prices.length));
    const slice = prices.slice(-Math.min(period, prices.length));
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - ma, 2), 0) / slice.length;
    const stdDev = Math.sqrt(variance);
    
    return {
        upper: ma + (2 * stdDev),
        middle: ma,
        lower: ma - (2 * stdDev)
    };
}

// Phân tích xu hướng
function analyzeTrend() {
    const prices = historicalData.map(d => d.price);
    const currentPrice = prices[prices.length - 1];
    
    const rsi = calculateRSI(prices);
    const ma20 = calculateMA(prices, Math.min(20, prices.length));
    const ma50 = calculateMA(prices, Math.min(50, prices.length));
    const ema12 = calculateEMA(prices, Math.min(12, prices.length));
    const macd = calculateMACD(prices);
    const bb = calculateBollingerBands(prices);
    
    // Cập nhật chỉ số
    document.getElementById('rsi').textContent = rsi.toFixed(2);
    document.getElementById('ma20').textContent = '$' + ma20.toFixed(2);
    document.getElementById('ma50').textContent = '$' + ma50.toFixed(2);
    document.getElementById('ema12').textContent = '$' + ema12.toFixed(2);
    document.getElementById('macd').textContent = macd.toFixed(2);
    document.getElementById('bb').textContent = `$${bb.lower.toFixed(0)} - $${bb.upper.toFixed(0)}`;
    
    // Tính điểm
    let bullishScore = 0;
    let bearishScore = 0;
    
    // RSI
    if (rsi < 30) bullishScore += 3;
    else if (rsi > 70) bearishScore += 3;
    else if (rsi < 40) bullishScore += 1.5;
    else if (rsi > 60) bearishScore += 1.5;
    
    // MA
    if (currentPrice > ma20) bullishScore += 2;
    else bearishScore += 2;
    
    if (currentPrice > ma50) bullishScore += 2;
    else bearishScore += 2;
    
    if (ma20 > ma50) bullishScore += 1.5;
    else bearishScore += 1.5;
    
    // MACD
    if (macd > 0) bullishScore += 1.5;
    else bearishScore += 1.5;
    
    // Bollinger Bands
    if (currentPrice < bb.lower) bullishScore += 2.5;
    else if (currentPrice > bb.upper) bearishScore += 2.5;
    
    // Momentum
    const recentPrices = prices.slice(-10);
    const upMoves = recentPrices.filter((p, i) => i > 0 && p > recentPrices[i-1]).length;
    if (upMoves >= 7) bullishScore += 2;
    else if (upMoves <= 3) bearishScore += 2;
    
    // Xác suất
    const total = bullishScore + bearishScore;
    const upProbability = (bullishScore / total * 100).toFixed(1);
    const downProbability = (bearishScore / total * 100).toFixed(1);
    
    document.getElementById('upProbability').textContent = upProbability + '%';
    document.getElementById('downProbability').textContent = downProbability + '%';
    
    // Tín hiệu
    const signalElement = document.getElementById('signal');
    if (bullishScore > bearishScore * 1.4) {
        signalElement.textContent = '📈 MUA (BUY)';
        signalElement.className = 'signal buy';
    } else if (bearishScore > bullishScore * 1.4) {
        signalElement.textContent = '📉 BÁN (SELL)';
        signalElement.className = 'signal sell';
    } else {
        signalElement.textContent = '⏸️ GIỮ (HOLD)';
        signalElement.className = 'signal hold';
    }
}

// Khởi động
initChart();
fetchBitcoinData();

// Auto update mỗi 30 giây
updateInterval = setInterval(fetchBitcoinData, 30000);
