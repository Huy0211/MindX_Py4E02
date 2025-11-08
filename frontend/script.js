class PlayerDashboard {
    constructor() {
        this.players = [];
        this.currentPosition = 'all';
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.renderAllCharts();
    }

    async loadData() {
        try {
            const response = await fetch('/api/players');
            this.players = await response.json();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    setupEventListeners() {
        const positionFilter = document.getElementById('positionFilter');
        positionFilter.addEventListener('change', (e) => {
            this.currentPosition = e.target.value;
            this.renderAllCharts();
        });
    }

    getFilteredPlayers() {
        if (this.currentPosition === 'all') {
            return this.players;
        }
        return this.players.filter(player => player.Position === this.currentPosition);
    }

    renderAllCharts() {
        this.renderWinRateChart();
        this.renderKDAChart();
        this.renderKPChart();
        this.renderDPMChart();
        this.renderPositionDistributionChart();
        this.renderPositionKDAChart();
    }

    renderWinRateChart() {
        const filteredPlayers = this.getFilteredPlayers();
        const topPlayers = [...filteredPlayers]
            .sort((a, b) => b['Win rate'] - a['Win rate'])
            .slice(0, 5);

        Highcharts.chart('winrateChart', {
            chart: { type: 'bar' },
            title: { text: '' },
            xAxis: {
                categories: topPlayers.map(p => p.PlayerName),
                title: { text: null }
            },
            yAxis: {
                min: 0,
                title: { text: 'Tỉ lệ thắng (%)' },
                labels: { format: '{value}%' }
            },
            tooltip: {
                pointFormat: '{point.y:.1f}%'
            },
            series: [{
                name: 'Win Rate',
                data: topPlayers.map(p => (p['Win rate'] * 100)),
                color: '#28a745'
            }],
            credits: { enabled: false }
        });
    }

    renderKDAChart() {
        const filteredPlayers = this.getFilteredPlayers();
        const topPlayers = [...filteredPlayers]
            .sort((a, b) => b.KDA - a.KDA)
            .slice(0, 5);

        Highcharts.chart('kdaChart', {
            chart: { type: 'column' },
            title: { text: '' },
            xAxis: {
                categories: topPlayers.map(p => p.PlayerName),
                title: { text: null }
            },
            yAxis: {
                title: { text: 'KDA Ratio' }
            },
            tooltip: {
                pointFormat: 'KDA: <b>{point.y:.2f}</b>'
            },
            series: [{
                name: 'KDA',
                data: topPlayers.map(p => p.KDA),
                color: '#007bff'
            }],
            credits: { enabled: false }
        });
    }

    renderKPChart() {
        const filteredPlayers = this.getFilteredPlayers();
        const topPlayers = [...filteredPlayers]
            .sort((a, b) => b['KP%'] - a['KP%'])
            .slice(0, 5);

        Highcharts.chart('kpChart', {
            chart: { type: 'bar' },
            title: { text: '' },
            xAxis: {
                categories: topPlayers.map(p => p.PlayerName),
                title: { text: null }
            },
            yAxis: {
                min: 0,
                title: { text: 'Tỉ lệ tham gia giao tranh (%)' },
                labels: { format: '{value}%' }
            },
            tooltip: {
                pointFormat: '{point.y:.1f}%'
            },
            series: [{
                name: 'KP%',
                data: topPlayers.map(p => p['KP%']),
                color: '#ffc107'
            }],
            credits: { enabled: false }
        });
    }

    renderDPMChart() {
        const filteredPlayers = this.getFilteredPlayers();
        const topPlayers = [...filteredPlayers]
            .sort((a, b) => b.DPM - a.DPM)
            .slice(0, 5);

        Highcharts.chart('dpmChart', {
            chart: { type: 'column' },
            title: { text: '' },
            xAxis: {
                categories: topPlayers.map(p => p.PlayerName),
                title: { text: null }
            },
            yAxis: {
                title: { text: 'Sát thương mỗi phút' }
            },
            tooltip: {
                pointFormat: 'DPM: <b>{point.y}</b>'
            },
            series: [{
                name: 'DPM',
                data: topPlayers.map(p => p.DPM),
                color: '#dc3545'
            }],
            credits: { enabled: false }
        });
    }

    renderPositionDistributionChart() {
        const positionCount = {};
        this.players.forEach(player => {
            positionCount[player.Position] = (positionCount[player.Position] || 0) + 1;
        });

        Highcharts.chart('positionChart', {
            chart: { type: 'pie' },
            title: { text: 'Phân bố tuyển thủ theo vị trí' },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.y}'
                    }
                }
            },
            series: [{
                name: 'Số lượng',
                colorByPoint: true,
                data: Object.entries(positionCount).map(([name, y]) => ({ name, y }))
            }],
            credits: { enabled: false }
        });
    }

    renderPositionKDAChart() {
        const positionKDA = {};
        this.players.forEach(player => {
            if (!positionKDA[player.Position]) {
                positionKDA[player.Position] = [];
            }
            positionKDA[player.Position].push(player.KDA);
        });

        const avgKDA = Object.entries(positionKDA).map(([position, kdas]) => ({
            position,
            avg: kdas.reduce((a, b) => a + b, 0) / kdas.length
        }));

        Highcharts.chart('positionKDAChart', {
            chart: { type: 'line' },
            title: { text: 'KDA trung bình theo vị trí' },
            xAxis: {
                categories: avgKDA.map(item => item.position),
                title: { text: 'Vị trí' }
            },
            yAxis: {
                title: { text: 'KDA trung bình' }
            },
            tooltip: {
                pointFormat: 'KDA trung bình: <b>{point.y:.2f}</b>'
            },
            series: [{
                name: 'KDA Trung bình',
                data: avgKDA.map(item => item.avg),
                color: '#6f42c1',
                marker: {
                    symbol: 'circle',
                    radius: 6
                }
            }],
            credits: { enabled: false }
        });
    }
}

// Khởi tạo dashboard khi trang load
document.addEventListener('DOMContentLoaded', () => {
    new PlayerDashboard();
});