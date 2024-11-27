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

// Corrige e formata datas no formato "DD/MM/YYYY, HH:mm:ss"
function formatOrderDate(dateString) {
    try {
        const [datePart, timePart] = dateString.split(", ");
        const [day, month, year] = datePart.split("/").map(Number);
        const [hours, minutes, seconds] = timePart.split(":").map(Number);

        const formattedDate = new Date(year, month - 1, day, hours, minutes, seconds);

        if (isNaN(formattedDate)) throw new Error("Data inválida");

        return formattedDate.toLocaleDateString("pt-BR");
    } catch (error) {
        console.error("Erro ao processar data:", dateString, error);
        return "Data Inválida";
    }
}

// Renderiza gráficos
async function renderCharts() {
    const orders = await fetchDeliveredOrders();

    // Ajusta o cálculo de total de vendas
    const totalSales = orders.reduce((acc, order) => acc + parseFloat(order.total), 0);
    const ordersByDate = groupOrdersByDate(orders);
    const topItems = calculateTopItems(orders);
    const paymentMethods = calculatePaymentMethods(orders);

    // Gráfico de Pedidos por Data
    const ordersChartCtx = document.getElementById("ordersChart").getContext("2d");
    new Chart(ordersChartCtx, {
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
    new Chart(salesChartCtx, {
        type: "line",
        data: {
            labels: Object.keys(ordersByDate),
            datasets: [{
                label: "Total de Vendas (R$)",
                data: Object.keys(ordersByDate).map(date => ordersByDate[date] * totalSales),
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

    // Gráfico de Lanches Mais Vendidos
    const topItemsChartCtx = document.getElementById("topItemsChart").getContext("2d");
    new Chart(topItemsChartCtx, {
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
    new Chart(paymentMethodsChartCtx, {
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
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "bottom" }
            }
        }
    });
}

// Funções auxiliares
function groupOrdersByDate(orders) {
    return orders.reduce((acc, order) => {
        const date = formatOrderDate(order.dataPedido);
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

function calculatePaymentMethods(orders) {
    return orders.reduce((acc, order) => {
        const method = order.metodoPagamento || "Indefinido";
        acc[method] = (acc[method] || 0) + 1;
        return acc;
    }, {});
}

// Inicia os gráficos ao carregar a página
document.addEventListener("DOMContentLoaded", renderCharts);
