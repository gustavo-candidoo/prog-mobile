document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    cordova.plugin.http.setDataSerializer('json');
    const btnNovo = document.getElementById('btnNovo');
    const btnFoto = document.getElementById('btnFoto');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnExcluir = document.getElementById('btnExcluir');
    const btnCancelar = document.getElementById('btnCancelar');
    const PIZZARIA_ID = '1900';
    const applista = document.getElementById('applista');
    const appcadastro = document.getElementById('appcadastro');
    let listaPizzasCadastradas = [];
    let pizzaEmEdicao = null;

    const pizzaInput = document.getElementById('pizza');
    const precoInput = document.getElementById('preco');
    const imagemDiv = document.getElementById('imagem');
    const listaPizzas = document.getElementById('listaPizzas');

    function exibirTelaCadastro() {
        applista.style.display = 'none';
        appcadastro.style.display = 'flex';
    }

    function exibirTelaLista() {
        applista.style.display = 'flex';
        appcadastro.style.display = 'none';
    }

    function carregarPizzas() {
        cordova.plugin.http.get(`https://pedidos-pizzaria.glitch.me/admin/pizzas/${PIZZARIA_ID}`, {}, {}, 
        function (response) {
            if (response.data) {
                listaPizzasCadastradas = JSON.parse(response.data);
                atualizarListaPizzas();
            }
        }, tratarErro);
    }

    function atualizarListaPizzas() {
        listaPizzas.innerHTML = '';
        listaPizzasCadastradas.forEach((item, idx) => {
            const novo = document.createElement('div');
            novo.classList.add('linha');
            novo.innerHTML = item.pizza;
            novo.id = idx;
            novo.onclick = () => carregarDadosPizza(idx);
            listaPizzas.appendChild(novo);
        });
    }

    function carregarDadosPizza(id) {
        if (id >= 0 && id < listaPizzasCadastradas.length) {
            pizzaEmEdicao = listaPizzasCadastradas[id];
            pizzaInput.value = pizzaEmEdicao.pizza;
            precoInput.value = pizzaEmEdicao.preco;
            imagemDiv.style.backgroundImage = `url(${pizzaEmEdicao.imagem})`;
            exibirTelaCadastro();
        }
    }

    function limparCamposPizza() {
        pizzaInput.value = '';
        precoInput.value = '';
        imagemDiv.style.backgroundImage = '';
    }

    function tratarErro(response) {
        console.error('Erro na requisição:', response.error);
    }

    function tratarSucesso(response) {
        alert(`Status: ${response.status}`);
        carregarPizzas();
        exibirTelaLista();
    }

    btnNovo.addEventListener('click', function () {
        limparCamposPizza();
        pizzaEmEdicao = null;
        exibirTelaCadastro();
    });

    btnCancelar.addEventListener('click', function () {
        exibirTelaLista();
    });

    btnFoto.addEventListener('click', function () {
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL
        });

        function onSuccess(imageData) {
            imagemDiv.style.backgroundImage = `url('data:image/jpeg;base64,${imageData}')`;
        }

        function onFail(message) {
            alert(`Erro na captura da foto: ${message}`);
        }
    });

    btnSalvar.addEventListener('click', function () {
        if (pizzaEmEdicao) {
            editarPizza();
        } else {
            criarPizza();
        }
    });

    function criarPizza() {
        const dadosPizza = {
            pizzaria: PIZZARIA_ID,
            pizza: pizzaInput.value,
            preco: precoInput.value,
            imagem: imagemDiv.style.backgroundImage
        };

        cordova.plugin.http.post('https://pedidos-pizzaria.glitch.me/admin/pizza/', dadosPizza, {}, tratarSucesso, tratarErro);
    }

    function editarPizza() {
        const dadosPizza = {
            pizzaid: pizzaEmEdicao._id,
            pizzaria: PIZZARIA_ID,
            pizza: pizzaInput.value,
            preco: precoInput.value,
            imagem: imagemDiv.style.backgroundImage
        };

        cordova.plugin.http.put('https://pedidos-pizzaria.glitch.me/admin/pizza/', dadosPizza, {}, tratarSucesso, tratarErro);
        pizzaEmEdicao = null;
    }

    btnExcluir.addEventListener('click', function () {
        if (pizzaEmEdicao) {
            cordova.plugin.http.delete(`https://pedidos-pizzaria.glitch.me/admin/pizza/${PIZZARIA_ID}/${pizzaEmEdicao.pizza}`, {}, {}, 
            tratarSucesso, tratarErro);
        }
    });

    carregarPizzas();
    exibirTelaLista();
}
