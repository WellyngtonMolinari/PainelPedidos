// Configuração do Firebase (substitua com suas credenciais)
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

// Função para buscar pedidos em tempo real
function fetchOrders() {
    db.ref("orders").on("value", (snapshot) => {
        const orders = [];
        snapshot.forEach((childSnapshot) => {
            const order = childSnapshot.val();
            order.id = childSnapshot.key;
            orders.push(order);
        });
        renderOrders(orders);
    });
}

// Função para renderizar pedidos
function renderOrders(orders) {
    // Limpa o conteúdo das colunas de pedidos antes de renderizar
    document.getElementById("received-orders").querySelector(".card-body").innerHTML = "";
    document.getElementById("preparing-orders").querySelector(".card-body").innerHTML = "";
    document.getElementById("completed-orders").querySelector(".card-body").innerHTML = "";

    orders.forEach(order => {
        // Cria o elemento de exibição do pedido
        const orderEl = document.createElement("div");
        orderEl.classList.add("order-item");
        orderEl.innerHTML = `
            <strong>${order.name}</strong><br>
            Pedido #${order.id}<br>
            Cliente: ${order.customerNumber || 'N/A'}<br>
            Detalhes: ${order.message}<br>
            Hora: ${new Date(order.timestamp).toLocaleString()}
        `;

        // Cria o botão para atualizar o status do pedido
        const button = document.createElement("button");
        button.classList.add("btn", "btn-sm", "mt-2");

        // Verifica o status do pedido e adiciona ao respectivo painel com o botão correto
        if (order.status === "received") {
            button.textContent = "Preparando";
            button.classList.add("btn-warning");
            button.onclick = () => updateOrderStatus(order.id, "preparing");
            document.getElementById("received-orders").querySelector(".card-body").appendChild(orderEl);
        } else if (order.status === "preparing") {
            button.textContent = "Concluído";
            button.classList.add("btn-success");
            button.onclick = () => updateOrderStatus(order.id, "completed");
            document.getElementById("preparing-orders").querySelector(".card-body").appendChild(orderEl);
        } else if (order.status === "completed") {
            document.getElementById("completed-orders").querySelector(".card-body").appendChild(orderEl);
        }

        // Adiciona o botão ao elemento do pedido
        orderEl.appendChild(button);
    });
}

// Função para atualizar o status do pedido no Realtime Database
function updateOrderStatus(id, newStatus) {
    db.ref("orders/" + id).update({
        status: newStatus
    });
}

// Chama a função para buscar os pedidos em tempo real
fetchOrders();
