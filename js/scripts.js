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
    document.getElementById("delivery-orders").querySelector(".card-body").innerHTML = ""; // Nova seção

    orders.forEach(order => {
        const orderEl = document.createElement("div");
        orderEl.classList.add("order-item");
        orderEl.innerHTML = `
            Cliente: <strong>${order.clienteId}</strong><br>
            #${order.id}<br><br>
            <strong> ${order.itens.map(item => ` x${item.quantity} ${item.name} `).join('')} </strong><br>
            Total: R$ ${order.total}<br>
            Método de Pagamento: ${order.metodoPagamento}<br>
            ${order.metodoPagamento === 'Dinheiro' ? `${order.precisaTroco || 'Não precisa de troco'}` : ''}<br>
            Status: ${order.status}<br>
            Criado em: ${order.dataPedido}<br>
            📍 Endereço de entrega: ${order.enderecoEntrega}<br>
        `;

        const button = document.createElement("button");
        button.classList.add("btn", "btn-sm", "mt-2");

        if (order.status === "Pendente") {
            button.textContent = "Preparando";
            button.classList.add("btn-warning");
            button.onclick = () => updateOrderStatus(order.id, "Preparando", order.telefoneCliente);
            document.getElementById("received-orders").querySelector(".card-body").appendChild(orderEl);
        } else if (order.status === "Preparando") {
            button.textContent = "Concluído";
            button.classList.add("btn-success");
            button.onclick = () => updateOrderStatus(order.id, "Concluído", order.telefoneCliente);
            document.getElementById("preparing-orders").querySelector(".card-body").appendChild(orderEl);
        } else if (order.status === "Concluído") {
            button.textContent = "Saiu para a Entrega";
            button.classList.add("btn-info");
            button.onclick = () => updateOrderStatus(order.id, "Saiu para a Entrega", order.telefoneCliente);
            document.getElementById("completed-orders").querySelector(".card-body").appendChild(orderEl);
        } else if (order.status === "Saiu para a Entrega") {
            button.textContent = "Entregue";
            button.classList.add("btn-primary");
            button.onclick = () => updateOrderStatus(order.id, "Entregue", order.telefoneCliente);
            document.getElementById("delivery-orders").querySelector(".card-body").appendChild(orderEl);
        }

        orderEl.appendChild(button);
    });
}

// Função para atualizar o status do pedido no Realtime Database e enviar notificação
async function updateOrderStatus(orderId, newStatus, telefoneCliente) {
    // Atualiza o status no Firebase
    await db.ref("pedidos/" + orderId).update({ status: newStatus });

    // Define a mensagem com base no novo status
    let mensagem;
    if (newStatus === "Preparando") {
        mensagem = `Seu pedido #${orderId} está sendo preparado!`;
    } else if (newStatus === "Concluído") {
        mensagem = `Seu pedido #${orderId} foi concluído!`;
    } else if (newStatus === "Saiu para a Entrega") {
        mensagem = `Seu pedido #${orderId} saiu para entrega!`;
    }

    // Envia a notificação via API
    try {
        const response = await fetch('http://127.0.0.1:3000/update-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, status: newStatus, telefoneCliente, mensagem })
        });
        const data = await response.json();
        console.log('Status atualizado e notificação enviada:', data);
    } catch (error) {
        console.error('Erro ao enviar notificação:', error);
    }
}

// Chama a função para buscar os pedidos em tempo real
document.addEventListener("DOMContentLoaded", function () {
    fetchOrders();
});
