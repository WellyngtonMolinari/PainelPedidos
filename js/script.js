// Configuração do Firebase (substitua com suas credenciais)
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function renderOrders(orders) {
    document.getElementById("received-orders").querySelector(".card-body").innerHTML = "";
    document.getElementById("preparing-orders").querySelector(".card-body").innerHTML = "";
    document.getElementById("completed-orders").querySelector(".card-body").innerHTML = "";

    orders.forEach(order => {
        const orderEl = document.createElement("div");
        orderEl.classList.add("order-item");
        orderEl.innerHTML = `<strong>${order.name}</strong><br>Pedido #${order.id}`;

        const button = document.createElement("button");
        button.classList.add("btn", "btn-sm", "mt-2");

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
        orderEl.appendChild(button);
    });
}

// Função para atualizar o status do pedido no Firebase
function updateOrderStatus(id, newStatus) {
    db.collection("orders").doc(id).update({
        status: newStatus
    });
}

// Monitoramento em tempo real dos pedidos
db.collection("orders").onSnapshot(snapshot => {
    const orders = [];
    snapshot.forEach(doc => {
        const data = doc.data();
        orders.push({ id: doc.id, ...data });
    });
    renderOrders(orders);
});
