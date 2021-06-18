function newBook(book) {
    const div = document.createElement('div');
    div.className = 'column is-4';
    div.innerHTML = `
        <div class="card is-shady">
            <div class="card-image">
                <figure class="image is-4by3">
                    <img
                        src="${book.photo}"
                        alt="${book.name}"
                        class="modal-button"
                    />
                </figure>
            </div>
            <div class="card-content">
                <div class="content book" data-id="${book.id}">
                    <div class="book-meta">
                        <p class="is-size-4">R$${book.price.toFixed(2)}</p>
                        <p class="is-size-6 quantidade">Disponível em estoque: ${book.quantity}</p>
                        <h4 class="is-size-3 title">${book.name}</h4>
                        <p class="subtitle">${book.author}</p>
                    </div>
                    <div class="field has-addons">
                        <div class="control">
                            <input class="input" type="text" placeholder="Digite o CEP" />
                        </div>
                        <div class="control">
                            <a class="button button-shipping is-info" data-id="${book.id}"> Calcular Frete </a>
                        </div>
                    </div>
                    <button class="button button-buy is-success" data-id="${book.id}" style="width:80%">Comprar</button>
                    <button class="button button-add is-info" data-id="${book.id}">+</button>
                </div>
            </div>
        </div>`;
    return div;
}

function calculateShipping(cep) {
    fetch('http://localhost:3000/shipping/' + cep)
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((data) => {
            swal('Frete', `O frete é: R$${data.value.toFixed(2)}`, 'success');
        })
        .catch((err) => {
            swal('Erro', 'Erro ao consultar frete', 'error');
            console.error(err);
        });
}

function UpdateProductByID(id, isSomar) {
    fetch('http://localhost:3000/books/' + id + '/' + isSomar)
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then(function (data) {
            if (data.quantity >= 0 && data.quantity <= 10){
                let tag = document.querySelectorAll(`.book .quantidade`)[id-1];
                var textNode = document.createTextNode("Disponível em estoque: " + data.quantity);
                tag.replaceChild(textNode, tag.childNodes[0]);
                
            }else if (data.quantity < 0){
                swal('Erro', 'Não há inventário restante!', 'error');
            }else if (data.quantity > 10) {
                swal('Erro', 'Você já restaurou este item!', 'error');

            }
            VerificaEstoqueRestante(data.quantity, id - 1);
        })
        .catch((err) => {
            swal('Erro', 'Erro ao atualizar o inventário', 'error');
            console.error(err);
        });
}

function VerificaEstoqueRestante(quantidade, id){
    if (quantidade == 0){
        $(".button-buy")[id].setAttribute("disabled", "");
    }else if ((quantidade > 0) && (quantidade) < 10) {
        $(".button-buy")[id].removeAttribute("disabled", "");
        $(".button-add")[id].removeAttribute("disabled", "");
    }else if (quantidade >= 10){
        $(".button-add")[id].setAttribute("disabled", "");
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const books = document.querySelector('.books');
    fetch('http://localhost:3000/products')
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((data) => {
            if (data) {
                data.forEach((book) => {
                    books.appendChild(newBook(book));
                    VerificaEstoqueRestante(book.quantity, book.id - 1);
                });

                document.querySelectorAll('.button-shipping').forEach((btn) => {
                    btn.addEventListener('click', (e) => {
                        const id = e.target.getAttribute('data-id');
                        const cep = document.querySelector(`.book[data-id="${id}"] input`).value;
                        calculateShipping(cep);
                    });
                });

                document.querySelectorAll('.button-buy').forEach((btn) => {
                    btn.addEventListener('click', (e) => {                    
                        const id = e.target.getAttribute('data-id');
                        UpdateProductByID(id, 0);
                        swal('Compra de livro', 'Sua compra foi realizada com sucesso', 'success');
                    });
                });

                document.querySelectorAll('.button-add').forEach((btn) => {
                    btn.addEventListener('click', (e) => {                    
                        const id = e.target.getAttribute('data-id');
                        UpdateProductByID(id, 1);
                        swal('Livro Adicionado', 'Item retornado com sucesso', 'success');
                    });
                });
            }
        })
        .catch((err) => {
            swal('Erro', 'Erro ao listar os produtos', 'error');
            console.error(err);
        });
});
