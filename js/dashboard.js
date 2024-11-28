// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA-PoA257z0eYL5v25lCWZw5hT_8wmlJXw",
    authDomain: "painel-pedidos-333c2.firebaseapp.com",
    databaseURL: "https://painel-pedidos-333c2-default-rtdb.firebaseio.com",
    projectId: "painel-pedidos-333c2",
    storageBucket: "painel-pedidos-333c2.appspot.com",
    messagingSenderId: "238028322720",
    appId: "1:238028322720:web:b5c760be014a7fac33d6c5",
    measurementId: "G-W7J5P3MDCZ"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Busca dados de pedidos entregues
function fetchDeliveredOrders() {
    return db.ref("pedidos").once("value").then(snapshot => {
        const deliveredOrders = [];
        snapshot.forEach(childSnapshot => {
            const order = childSnapshot.val();
            if (order.status === "Entregue") {
                deliveredOrders.push(order);
            }
        });
        return deliveredOrders;
    });
}

// Função para analisar a data do pedido
function parseOrderDate(dateString) {
    const [datePart] = dateString.split(", "); // Ignora o horário
    const [today, month, year] = datePart.split("/").map(Number);
    return new Date(year, month - 1, today);
}

// Variáveis globais para armazenar instâncias dos gráficos
let ordersChart, salesChart, topItemsChart, paymentMethodsChart;

// Renderiza gráficos
async function renderCharts(filteredOrders) {
    const orders = filteredOrders || await fetchDeliveredOrders();

    const ordersByDate = groupOrdersByDate(orders);
    const totalSales = orders.reduce((acc, order) => acc + parseFloat(order.total || 0), 0);
    const topItems = calculateTopItems(orders);
    const paymentMethods = calculatePaymentMethods(orders);

    // Destroi gráficos existentes, se necessário
    if (ordersChart) ordersChart.destroy();
    if (salesChart) salesChart.destroy();
    if (topItemsChart) topItemsChart.destroy();
    if (paymentMethodsChart) paymentMethodsChart.destroy();

    // Gráfico de Pedidos por Data
    const ordersChartCtx = document.getElementById("ordersChart").getContext("2d");
    ordersChart = new Chart(ordersChartCtx, {
        type: "bar",
        data: {
            labels: Object.keys(ordersByDate),
            datasets: [{
                label: "Pedidos por Data",
                data: Object.values(ordersByDate),
                backgroundColor: "#007bff"
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Gráfico de Total de Vendas
    const salesChartCtx = document.getElementById("salesChart").getContext("2d");
    salesChart = new Chart(salesChartCtx, {
        type: "line",
        data: {
            labels: Object.keys(ordersByDate),
            datasets: [{
                label: "Total de Vendas (R$)",
                data: Object.values(ordersByDate).map(date => totalSales),
                borderColor: "#28a745",
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Gráfico de Produtos Mais Vendidos
    const topItemsChartCtx = document.getElementById("topItemsChart").getContext("2d");
    topItemsChart = new Chart(topItemsChartCtx, {
        type: "pie",
        data: {
            labels: Object.keys(topItems),
            datasets: [{
                label: "Lanches Mais Vendidos",
                data: Object.values(topItems),
                backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "bottom" }
            }
        }
    });

    // Gráfico de Métodos de Pagamento
    const paymentMethodsChartCtx = document.getElementById("paymentMethodsChart").getContext("2d");
    paymentMethodsChart = new Chart(paymentMethodsChartCtx, {
        type: "pie",
        data: {
            labels: Object.keys(paymentMethods),
            datasets: [{
                label: "Métodos de Pagamento",
                data: Object.values(paymentMethods),
                backgroundColor: ["#007bff", "#ffc107", "#28a745"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom" }
            }
        }
    });
}

// Função para calcular métodos de pagamento
function calculatePaymentMethods(orders) {
    return orders.reduce((acc, order) => {
        const method = order.metodoPagamento || "Outro";
        acc[method] = (acc[method] || 0) + 1;
        return acc;
    }, {});
}

// Filtra pedidos por período
function filterOrdersByPeriod(orders, period) {
    const now = new Date();
    return orders.filter(order => {
        const orderDate = parseOrderDate(order.dataPedido);
        if (period === "today") {
            return orderDate.toDateString() === now.toDateString();
        } else if (period === "week") {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            return orderDate >= startOfWeek && orderDate <= now;
        } else if (period === "month") {
            return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        } else if (period === "year") {
            return orderDate.getFullYear() === now.getFullYear();
        }
        return true;
    });
}


// Atualiza os gráficos e tabelas
async function updateChartsAndTables(period) {
    const orders = await fetchDeliveredOrders();
    const filteredOrders = filterOrdersByPeriod(orders, period);

    if (!ordersChart || !salesChart || !topItemsChart || !paymentMethodsChart) {
        await renderCharts(filteredOrders);
        return;
    }

    const ordersByDate = groupOrdersByDate(filteredOrders);
    const salesByDate = {};
    filteredOrders.forEach(order => {
        const date = parseOrderDate(order.dataPedido);
        salesByDate[date] = (salesByDate[date] || 0) + parseFloat(order.total || 0);
    });

    const topItems = calculateTopItems(filteredOrders);
    const paymentMethods = calculatePaymentMethods(filteredOrders);

    ordersChart.data.labels = Object.keys(ordersByDate);
    ordersChart.data.datasets[0].data = Object.values(ordersByDate);
    ordersChart.update();

    salesChart.data.labels = Object.keys(salesByDate);
    salesChart.data.datasets[0].data = Object.values(salesByDate);
    salesChart.update();

    topItemsChart.data.labels = Object.keys(topItems);
    topItemsChart.data.datasets[0].data = Object.values(topItems);
    topItemsChart.update();

    paymentMethodsChart.data.labels = Object.keys(paymentMethods);
    paymentMethodsChart.data.datasets[0].data = Object.values(paymentMethods);
    paymentMethodsChart.update();

    document.getElementById("totalSales").textContent = `R$ ${Object.values(salesByDate).reduce((a, b) => a + b, 0).toFixed(2)}`;
    document.getElementById("totalOrders").textContent = filteredOrders.length;
}


// Atualiza os gráficos e tabelas com dados filtrados
async function updateChartsAndTables(period) {
    const orders = await fetchDeliveredOrders();
    const filteredOrders = filterOrdersByPeriod(orders, period);

    const totalSales = filteredOrders.reduce((acc, order) => acc + parseFloat(order.total), 0);
    const ordersByDate = groupOrdersByDate(filteredOrders);
    const topItems = calculateTopItems(filteredOrders);
    const paymentMethods = calculatePaymentMethods(filteredOrders);

    // Atualiza gráfico de Pedidos por Data
    ordersChart.data.labels = Object.keys(ordersByDate);
    ordersChart.data.datasets[0].data = Object.values(ordersByDate);
    ordersChart.update();

    // Atualiza gráfico de Total de Vendas
    salesChart.data.labels = Object.keys(ordersByDate);
    const salesByDate = {};
    filteredOrders.forEach(order => {
        const date = parseOrderDate(order.dataPedido);
        salesByDate[date] = (salesByDate[date] || 0) + parseFloat(order.total || 0);
    });
    salesChart.data.datasets[0].data = Object.values(salesByDate);

    salesChart.update();

    // Atualiza gráfico de Lanches Mais Vendidos
    topItemsChart.data.labels = Object.keys(topItems);
    topItemsChart.data.datasets[0].data = Object.values(topItems);
    topItemsChart.update();

    // Atualiza gráfico de Métodos de Pagamento
    paymentMethodsChart.data.labels = Object.keys(paymentMethods);
    paymentMethodsChart.data.datasets[0].data = Object.values(paymentMethods);
    paymentMethodsChart.update();

    // Atualiza tabela de resumo (se necessário)
    document.getElementById("totalSales").textContent = `R$ ${totalSales.toFixed(2)}`;
    document.getElementById("totalOrders").textContent = filteredOrders.length;
}

// Funções auxiliares
function groupOrdersByDate(orders) {
    return orders.reduce((acc, order) => {
        const date = parseOrderDate(order.dataPedido).toLocaleDateString("pt-BR");
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});
}

function calculateTopItems(orders) {
    const itemsCount = {};
    orders.forEach(order => {
        order.itens.forEach(item => {
            itemsCount[item.name] = (itemsCount[item.name] || 0) + item.quantity;
        });
    });
    return itemsCount;
}

// Inicializa os gráficos ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
    const orders = await fetchDeliveredOrders();
    await renderCharts(orders); // Renderiza os gráficos inicialmente com todos os dados

    // Atualiza os gráficos para o período "Hoje" ao carregar a página
    updateChartsAndTables("today");

    // Configura eventos de clique nos botões de filtro
    document.querySelectorAll(".filter-btn").forEach(button => {
        button.addEventListener("click", () => {
            const period = button.getAttribute("data-period");
            updateChartsAndTables(period);
        });
    });
});