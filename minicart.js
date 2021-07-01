const miniCartFunctions = {

    defaultSelectors: {
        cartIcon: '.header .cart-icon',
        cartIconMobile: '.header .cart-icon-mob',
        productPageBuyButton: '.product-page .buy-buton'
    },

    close: function() {
        document.getElementsByClassName('mini-cart-wrapper')[0].classList.remove('active');
        document.getElementsByClassName('mini-cart-close-overlay')[0].style.display = 'none';
    },

    open: function() {
        document.getElementsByClassName('mini-cart-wrapper')[0].classList.add('active');
        document.getElementsByClassName('mini-cart-close-overlay')[0].style.display = 'block';
    },

    start: function() {
        vtexjs.checkout.getOrderForm().done(function(orderForm) {
            miniCartFunctions.update(orderForm);
        });
    },

    appendToBody: function() {
        document.getElementsByTagName('body')[0].insertAdjacentHTML('beforeend',
            '<div class="mini-cart-wrapper">' +
            '<div class="mini-cart-close-overlay"></div>' +

            '<div class="mini-cart-sidebar-container">' +
            '<div class="mini-cart-content">' +

            '<div class="mini-cart-title"><div class="mini-cart-close"></div><span>SACOLA</span><span id="mini-cart-removeall" style="width: auto;text-transform: uppercase;font-weight: 600;text-decoration: underline;font-size: 10px;cursor: pointer;color: #737373;position: absolute;right: 5px;">Limpar sacola</span></div>' +
            '<div class="mini-cart-products">' +

            '</div>' +
            '<div class="mini-cart-bottom">' +
            '<p class="mini-cart-bottom-total">TOTAL<span></span></p>' +
            //'<p class="mini-cart-bottom-frete" style="padding-top: 7px;">FRETE<span style="color: #4AAE51;"></span></p>' +
            '<p class="mini-cart-bottom-msg"></p>' +

            '<a class="mini-cart-bottom-checkout" href="/checkout/#/cart">REVISAR A COMPRA</a>' +
            '</div>' +

            '<div class="msg-empty">' +
            '<p>Sua sacola está vazia.</p>' +
            '<a class="btn-choose-more" href="/">' +
            '<span>Escolher produtos</span>' +
            '</a>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>')
    },

    update: function(orderForm) {
        items = orderForm.items;
        numItemsInCart = 0;
        if (items.length > 0) {
            numItemsInCart = items.length;
            document.getElementsByClassName('mini-cart-wrapper')[0].classList.remove('empty');
            document.getElementsByClassName('mini-cart-products')[0].innerHTML = '';
            document.getElementsByClassName('mini-cart-products')[0].insertAdjacentHTML('beforeend', '<ul class="products-list"></ul>');

            items.forEach(function(item, i) {
                sku = item.id;
                skuName = item.skuName;
                price = item.price;
                sellingPrice = item.sellingPrice;
                url = item.detailUrl;
                imgUrl = item.imageUrl;
                qtd = item.quantity;

                document.getElementsByClassName('products-list')[0].insertAdjacentHTML('beforebegin',
                    '<li class="products-list-item" data-sku-id="' + sku + '" data-product-index="' + i + '">' +
                    '<div class="products-list-item-wrap">' +
                    '<div class="product-image">' +
                    '<a class="product-link" href="' + url + '">' +
                    '<img src="' + imgUrl + '">' +
                    '</a>' +
                    '</div>' +
                    '<div class="product-info">' +

                    '<div class="product-name">' +
                    '<a class="product-link" href="' + url + '">' + skuName + '</a>' +
                    '</div>' +

                    '<div class="product-qtd-price">' +
                    '<span class="product-qtd">Qtd: ' + qtd + '</span>' +
                    '<span class="product-price">' + miniCartFunctions.fixPrice(sellingPrice) + '</span>' +
                    '</div>' +
                    '<a data-product-index="' + i + '" class="product-remove">Remover</a>' +
                    '</div>' +
                    '</div>' +
                    '</li>');
            });
            document.querySelector('.mini-cart-bottom-total span').innerHTML = miniCartFunctions.fixPrice(orderForm.value);

        } else {
            document.getElementsByClassName('mini-cart-wrapper')[0].classList.add('empty');
        }
        document.getElementsByClassName('mini-cart-icon-mob-qtd').innerHTML = numItemsInCart;
        document.getElementsByClassName('mini-cart-products')[0].insertAdjacentHTML('beforeend', '<span class="updated" style="display:none"></span>');
    },

    addToCartProductPage: function(t) {
        console.log(t)
        const href = t.target.href;
        if (href.indexOf("Por favor, selecione o modelo desejado.") === -1) {
            document.querySelector(miniCartFunctions.defaultSelectors.productPageBuyButton).classList.add('ldng-active');
            var sku = href.substring(href.indexOf('sku=') + 4, href.indexOf('&qty'));
            var qtd = document.getElementById('productQty').value;
        } else {
            alert('Por favor, selecione o modelo desejado.');
        }
        
            
        const item = {
            id: sku,
            quantity: qtd,
            seller: '1'
        };
        try {
            vtexjs.checkout.addToCart([item], null).done(function(orderForm) {
                try {
                    miniCartFunctions.update(orderForm);
                    miniCartFunctions.open();
                    document.querySelector(miniCartFunctions.defaultSelectors.productPageBuyButton).classList.remove('ldng-active');
                } catch (e) {
                    console.log('error addToCartProductPage, redirecting to cart...');
                    window.location.href = href;
                }
            });
        } catch (e) {
            console.log('error addToCartProductPage, redirecting to cart...');
            window.location.href = href;
        }

    },

    removeItem: function(t) {
        t.preventDefault();
        const i = t.srcElement.attributes['data-product-index'].value;
        document.querySelector("li[data-product-index='" + i + "']").style.opacity = '.5';
        const removeBtns = document.getElementsByClassName('product-remove');
        for (let btn = 0; btn < removeBtns.length; btn++) {
            removeBtns[btn].style.display = 'none';
        }
        vtexjs.checkout.getOrderForm().then(function(orderForm) {
            const itemIndex = i
            const item = orderForm.items[itemIndex];
            const qtd = item.quantity;
            const itemsToRemove = [{ "index": itemIndex, "quantity": qtd, }]
            return vtexjs.checkout.removeItems(itemsToRemove);
        }).done(function(orderForm) {
            miniCartFunctions.update(orderForm);
        });
    },


    init: function() {
        miniCartFunctions.appendToBody(), miniCartFunctions.start(), miniCartFunctions.events();
    },

    events: function() {
        let el = document.querySelector(miniCartFunctions.defaultSelectors.cartIconMobile);
        if (el) {
            el.addEventListener('click', function(t) {
                if (document.querySelectorAll('.mini-cart-wrapper span.updated').length > 0) {
                    t.preventDefault();
                    miniCartFunctions.open();
                }
            });
        }

        el = document.querySelector(miniCartFunctions.defaultSelectors.cartIcon)
        if (el) {
            el.addEventListener('click', function(t) {
                if (document.querySelectorAll('.mini-cart-wrapper span.updated').length > 0) {
                    t.preventDefault();
                    miniCartFunctions.open();
                }
            });
        }

        document.getElementsByClassName('mini-cart-close-overlay')[0].addEventListener('click', function(t) {
            miniCartFunctions.close();
        });

        document.getElementsByClassName('mini-cart-close')[0].addEventListener('click', function(t) {
            miniCartFunctions.close();
        });
		
        document.getElementById('mini-cart-removeall').addEventListener('click', function(t) {
			vtexjs.checkout.removeAllItems().done(function(orderForm) {
				miniCartFunctions.update(orderForm);
			});        	
		});

        document.body.addEventListener('click', function (t) {
            if(t.target.className == 'product-remove') {
                t.preventDefault();
                miniCartFunctions.removeItem(t);            
            }
        });
        
        el = document.querySelector(miniCartFunctions.defaultSelectors.productPageBuyButton)
        if (el) {
            el.addEventListener('click', function(t) {
                t.preventDefault();
                miniCartFunctions.addToCartProductPage(t);
            });
        }

    },

    fixPrice: function(price) {
        let np = '';
        const p = (price * .01).toFixed(2).replace('.', ',');
        if (p.split(',')[0].length == 4) {
            np = 'R$ ' + p[0] + '.' + p.substring(1, p.length);
        } else if (p.split(',')[0].length == 5) {
            np = 'R$ ' + p.substring(0, 2) + '.' + p.substring(2, p.length)
        } else {
            np = 'R$ ' + p;
        }
        return np;
    },
}

miniCartFunctions.init()