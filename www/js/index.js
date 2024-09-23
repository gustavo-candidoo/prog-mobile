document.addEventListener('deviceready', onDeviceReady, false);

const PIZZARIA_ID = 'Pizzaria_Luiz_Gustavo';

let listaPizzasCadastradas = [];

function onDeviceReady() {
    cordova.plugin.http.setDataSerializer('json');
    carregarPizzas();
}

// Carregar as pizzas cadastradas
function carregarPizzas() {
    const url = 'https://pedidos-pizzaria.glitch.me/admin/pizzas/' + PIZZARIA_ID;

    cordova.plugin.http.get(url, {}, {}, function(response) {
        if (response.data !== "") {
            listaPizzasCadastradas = JSON.parse(response.data);
            const listaPizzasElement = document.getElementById('listaPizzas');
            listaPizzasElement.innerHTML = '';
            listaPizzasCadastradas.forEach(function(item, idx) {
                const novo = document.createElement('div');
                novo.classList.add('linha');
                novo.innerHTML = item.pizza;
                novo.id = idx;
                novo.onclick = function() {
                    carregarDadosPizza(novo.id);
                };
                listaPizzasElement.appendChild(novo);
            });
        }
    }, function(response) {
        console.error('Erro ao carregar as pizzas: ' + response.error);
    });
}

// Carregar os dados da pizza
function carregarDadosPizza(id) {
    const pizzaSelecionada = listaPizzasCadastradas[id];
    document.getElementById('id').value = pizzaSelecionada._id;
    document.getElementById('pizza').value = pizzaSelecionada.pizza;
    document.getElementById('preco').value = pizzaSelecionada.preco;

    const imageData = pizzaSelecionada.imagem ? pizzaSelecionada.imagem.split(',')[1] : '';

    document.getElementById('imagem').style.backgroundImage = `url('data:image/jpeg;base64,${imageData}')`;
    document.getElementById('imagem').dataset.imageData = imageData;
    
    document.getElementById('btnSalvar').style.display = 'block';
    document.getElementById('btnExcluir').style.display = 'block';
    document.getElementById('applista').style.display = 'none';
    document.getElementById('appcadastro').style.display = 'flex';
    document.getElementById('appcadastro').dataset.id = id;
}

// Abrir a tela de cadastro
function abrirCadastroNovaPizza() {
    document.getElementById('id').value = '';
    document.getElementById('pizza').value = '';
    document.getElementById('preco').value = '';
    document.getElementById('imagem').style.backgroundImage = 'none';
    delete document.getElementById('imagem').dataset.imageData;

    document.getElementById('btnSalvar').style.display = 'block';
    document.getElementById('btnExcluir').style.display = 'none';
    document.getElementById('applista').style.display = 'none';
    document.getElementById('appcadastro').style.display = 'flex';
}

// Evento para alternar entre as telas
document.getElementById('btnCancelar').addEventListener('click', function() {
    document.getElementById('applista').style.display = 'flex';
    document.getElementById('appcadastro').style.display = 'none';
});

// Adiciona evento de click no botão de nova pizza
document.getElementById('btnNovo').addEventListener('click', abrirCadastroNovaPizza);

// Função para tirar uma foto da pizza
document.getElementById('btnFoto').addEventListener('click', function() {
    const options = {
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
    };

    navigator.camera.getPicture(function(imageData) {
        compressImage(`data:image/jpeg;base64,${imageData}`, 0.5, function(compressedImageData) {
            document.getElementById('imagem').style.backgroundImage = `url('${compressedImageData}')`;
            document.getElementById('imagem').dataset.imageData = compressedImageData.split(',')[1];
        });
    }, function(message) {
        console.error('Erro ao tirar foto: ' + message);
    }, options);
});

// Comprimir a imagem
function compressImage(dataUrl, quality, callback) {
    const img = new Image();
    img.src = dataUrl;
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const newDataUrl = canvas.toDataURL('image/jpeg', quality);
        callback(newDataUrl);
    };
}

// Salvar pizza
document.getElementById('btnSalvar').addEventListener('click', function() {
    const pizza = document.getElementById('pizza').value;
    const preco = document.getElementById('preco').value;
    const imageData = document.getElementById('imagem').dataset.imageData || '';

    if (!pizza || !preco || !imageData) {
        alert('Todos os campos devem ser preenchidos!');
        return;
    }

    const formData = {
        pizzaria: PIZZARIA_ID,
        pizza: pizza,
        preco: preco,
        imagem: `data:image/jpeg;base64,${imageData}`
    };

    const url = 'https://pedidos-pizzaria.glitch.me/admin/pizza/';

    cordova.plugin.http.post(url, formData, {}, function(response) {
        console.log('Pizza atualizada com sucesso:', response.data);
        alert('Pizza atualizada com sucesso!');
        carregarPizzas();

        document.getElementById('applista').style.display = 'flex';
        document.getElementById('appcadastro').style.display = 'none';
    }, function(response) {
        console.error('Erro ao atualizar a pizza:', response.error);
        alert('Erro ao atualizar a pizza: ' + response.error);
    });
});


// Excluir pizza
document.getElementById('btnExcluir').addEventListener('click', function() {
    const idPizza = document.getElementById('appcadastro').dataset.id;
    const pizzaSelecionada = listaPizzasCadastradas[idPizza];
    const url = 'https://pedidos-pizzaria.glitch.me/admin/pizza/' + PIZZARIA_ID + '/' + pizzaSelecionada.pizza;

    cordova.plugin.http.delete(url, {}, {}, function(response) {
        console.log('Pizza excluída com sucesso:', response.data);
        alert('Pizza excluída com sucesso!');
        carregarPizzas();

        document.getElementById('applista').style.display = 'flex';
        document.getElementById('appcadastro').style.display = 'none';
    }, function(response) {
        console.error('Erro ao excluir a pizza:', response.error);
    });
});