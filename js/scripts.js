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
    db.ref("pedidos").on("value", (snapshot) => {
        const orders = [];
        snapshot.forEach((childSnapshot) => {
            const order = childSnapshot.val();
            order.id = childSnapshot.key;
            orders.push(order);
        });
        console.log("Pedidos recebidos do Firebase:", orders); // Log para verificar os dados
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
        console.log("Renderizando pedido:", order); // Log para verificar cada pedido
        const orderEl = document.createElement("div");
        orderEl.classList.add("order-item");
        orderEl.innerHTML = `
            <strong>Cliente ID: ${order.clienteId}</strong><br>
            Pedido #${order.id}<br>
            Total: R$ ${order.total}<br>
            Itens: <ul>${order.itens.map(item => `<li>${item.name} x${item.quantity}</li>`).join('')}</ul><br>
            Status: ${order.status}<br>
            📍 Endereço de entrega: ${order.enderecoEntrega}<br>
        `;

        const button = document.createElement("button");
        button.classList.add("btn", "btn-sm", "mt-2");

        if (order.status === "Pendente") {
            button.textContent = "Preparando";
            button.classList.add("btn-warning");
            button.onclick = () => updateOrderStatus(order.id, "Preparando");
            document.getElementById("received-orders").querySelector(".card-body").appendChild(orderEl);
        } else if (order.status === "Preparando") {
            button.textContent = "Concluído";
            button.classList.add("btn-success");
            button.onclick = () => updateOrderStatus(order.id, "Concluído");
            document.getElementById("preparing-orders").querySelector(".card-body").appendChild(orderEl);
        } else if (order.status === "Concluído") {
            const button = document.createElement("button");
            // Adicione o botão "Saiu para a Entrega"
            button.textContent = "Saiu para a Entrega";
            button.classList.add("btn", "btn-info");
            button.onclick = () => {
                updateOrderStatus(order.id, "Saiu para a Entrega");
                notificarClienteWhatsApp(order.telefoneCliente, `Seu pedido #${order.id} saiu para entrega!`);
            };
            document.getElementById("completed-orders").querySelector(".card-body").appendChild(orderEl);
            orderEl.appendChild(button);
        }

        orderEl.appendChild(button);
    });
}


// Função para atualizar o status do pedido no Realtime Database
function updateOrderStatus(id, newStatus) {
    db.ref("pedidos/" + id).update({
        status: newStatus
    });
}

// Chama a função para buscar os pedidos em tempo real
document.addEventListener("DOMContentLoaded", function () {
    fetchOrders();
});

