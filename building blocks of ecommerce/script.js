
const cart_items = document.querySelector('#cart .cart-items');

const parentContainer = document.getElementById('EcommerceContainer');
parentContainer.addEventListener('click',addToCart);
pagination(1);
cartPagination(1);
function addToCart(e){
    if (e.target.className=='shop-item-button'){
        const id = e.target.parentNode.parentNode.id;
        const name = document.querySelector(`#${id} h3`).innerText;
        const img_src = document.querySelector(`$${id} img`).src;
        const price = e.target.parentNode.firstElementChild.firstElementChild.innerText;
        let total_cart_price = document.querySelector('#total-value').innerText;
        if (document.querySelector(`#in-cart-${id}`)){
            alert('This item is already added to the cart');
            return
        } 
        document.querySelector('.cart-number').innerText = parseInt(document.querySelector('.cart-number').innerText)+1
        const cart_item = document.createElement('div');
        cart_item.classList.add('cart-row');
        cart_item.setAttribute('id',`in-cart-${id}`);
        total_cart_price = parseFloat(total_cart_price) + parseFloat(price)
        total_cart_price = total_cart_price.toFixed(2)
        document.querySelector('#total-value').innerText = `${total_cart_price}`;
        cart_item.innerHTML = `
        <span class='cart-item cart-column'>
        <img class='cart-img' src="${img_src}" alt="">
            <span>${name}</span>
    </span>
    <span class='cart-price cart-column'>${price}</span>
    <span class='cart-quantity cart-column'>
        <input type="text" value="1">
        <button>REMOVE</button>
    </span>`
        cart_items.appendChild(cart_item)

        const container = document.getElementById('container');
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.innerHTML = `<h4>Your Product : <span>${name}</span> is added to the cart<h4>`;
        container.appendChild(notification);
        setTimeout(()=>{
            notification.remove();
        },2500)
    }
    if (e.target.className=='cart-btn-bottom' || e.target.className=='cart-bottom' || e.target.className=='cart-holder'){
        document.querySelector('#cart').style = "display:block;"
    }
    if (e.target.className=='cancel'){
        document.querySelector('#cart').style = "display:none;"
    }
    if (e.target.className=='order-btn-bottom'){
        document.querySelector('#cart').style = "display:none;"
    }


    if (e.target.className=='order-btn'){
        if (parseInt(document.querySelector('.cart-number').innerText) === 0){
            alert('You have Nothing in Cart , Add some products to order !');
            return 
        }
        axios.get(`http://localhost:3000/carts`).then(cartData=>{
            data = JSON.parse(JSON.stringify(cartData));
            console.log("carts",data)
            axios.post(`http://localhost:3000/create-order`,data)
            .then(result=>{
                data1 = JSON.parse(JSON.stringify(result));
                console.log("ordercarts",data1)
                const container = document.getElementById('container');
                const notification = document.createElement('div');
                notification.classList.add('notification');
                notification.innerHTML = `<h4>Order sucessfully placed with order id = : <span>${data1.data}</span><h4>`;
                container.appendChild(notification);
                setTimeout(()=>{
                    notification.remove();
                },2500)
                return (`{ ${data1.data} , sucess : true }`);
            })
        }         
        )
        .catch(err => {
            console.log(err);
        });
        
        alert('Thanks for the purchase')
        cart_items.innerHTML = ""
        const parentNodeCart=document.getElementById('cartPagination');
        parentNodeCart.innerHTML="";
        document.querySelector('.cart-number').innerText = 0
        document.querySelector('#total-value').innerText = `0`;
    }

    if (e.target.innerText=='REMOVE'){
        let total_cart_price = document.querySelector('#total-value').innerText;
        total_cart_price = parseFloat(total_cart_price).toFixed(2) - parseFloat(document.querySelector(`#${e.target.parentNode.parentNode.id} .cart-price`).innerText).toFixed(2) ;
        document.querySelector('.cart-number').innerText = parseInt(document.querySelector('.cart-number').innerText)-1
        document.querySelector('#total-value').innerText = `${total_cart_price.toFixed(2)}`
        e.target.parentNode.parentNode.remove()
    }
}
window.addEventListener('DOMContentLoaded',()=>{
    // axios.get('http://localhost:3000/admin/products')
    // axios.get(`http://localhost:3000/?page=1`)
    // .then(products => {
    // //   console.log(products);
    //   const productNode=document.getElementById('products-content');
    //   productNode.innerHTML="";
    //   data = JSON.parse(JSON.stringify(products));
    //   console.log("hi",data);
    //   data.data.prods.forEach(product=>{
    //     const childele=document.createElement('div');
    //     childele.setAttribute("id", `${product.id}`);
       
    //     childele.innerHTML=`<h3>${product.title}</h3>
    //     <div class="image-container"> 
    //         <img class="prod-images" src="${product.imageUrl}" alt="">
    //     </div>
    //     <div class="prod-details">
    //         <p>Rs.<span>${product.price}</span></p>
    //         <button class="shop-item-button" type='submit'>ADD TO CART</button>
    //     </div>`;
    //     productNode.appendChild(childele);
    //   })
    // })
    // .then(
        axios.get('http://localhost:3000/')
        .then(products => {
        const parentNode=document.getElementById('pagination');
        parentNode.innerHTML="";
        data = JSON.parse(JSON.stringify(products));
        data=data.data;
        if (data.currentPage != 1){
            const a = document.createElement('button');
            a.innerHTML = "1"; 
            a.onclick= () => {
                pagination(a.innerHTML);
            };
            parentNode.appendChild(a);
        }
        const a1 = document.createElement('button');
        a1.innerHTML = `${data.currentPage}`; 
        a1.onclick= () => {
            pagination(a1.innerHTML);
        };
        // a1.setAttribute('class','active');
        parentNode.appendChild(a1);
        if (data.hasPreviousPage){
            const a2 = document.createElement('button');
            a2.innerHTML = `${data.previousPage}`; 
            a2.onclick= () => {
                pagination(a2.innerHTML);
            };
            parentNode.appendChild(a2);
        }
        if (data.hasNextPage){
            const a3 = document.createElement('button');
            a3.innerHTML = `${data.nextPage}`; 
            a3.onclick= () => {
                pagination(a3.innerHTML);
            };
            parentNode.appendChild(a3);
        }
        if (data.lastPage!==data.currentPage && data.nextPage !== data.lastPage ){
            const a4 = document.createElement('button');
            a4.innerHTML = `${data.lastPage}`; 
            a4.onclick= () => {
                pagination(a4.innerHTML);
            };
            parentNode.appendChild(a4);
        }
        })
        .then(
            axios.get('http://localhost:3000/cart')
                .then(products => {
                const parentNodeCart=document.getElementById('cartPagination');
                parentNodeCart.innerHTML="";
                data = JSON.parse(JSON.stringify(products));
                data=data.data;
                if (data.currentPage != 1){
                    const a = document.createElement('button');
                    a.innerHTML = "1"; 
                    a.onclick= () => {
                        cartPagination(a.innerHTML);
                    };
                    parentNodeCart.appendChild(a);
                }
                const a1 = document.createElement('button');
                a1.innerHTML = `${data.currentPage}`; 
                a1.onclick= () => {
                    cartPagination(a1.innerHTML);
                };
                // a1.setAttribute('class','active');
                parentNodeCart.appendChild(a1);
                if (data.hasPreviousPage){
                    const a2 = document.createElement('button');
                    a2.innerHTML = `${data.previousPage}`; 
                    a2.onclick= () => {
                        cartPagination(a2.innerHTML);
                    };
                    parentNodeCart.appendChild(a2);
                }
                if (data.hasNextPage){
                    const a3 = document.createElement('button');
                    a3.innerHTML = `${data.nextPage}`; 
                    a3.onclick= () => {
                        cartPagination(a3.innerHTML);
                    };
                    parentNodeCart.appendChild(a3);
                }
                if (data.lastPage!==data.currentPage && data.nextPage !== data.lastPage ){
                    const a4 = document.createElement('button');
                    a4.innerHTML = `${data.lastPage}`; 
                    a4.onclick= () => {
                        cartPagination(a4.innerHTML);
                    };
                    parentNodeCart.appendChild(a4);
                }
                })
                )
            .catch(err => {
            console.log(err);
            });
})
function pagination(title){
        axios.get(`http://localhost:3000/?page=${title}`)
        .then(products => {
        const productNode=document.getElementById('products-content');
        productNode.innerHTML="";
        data = JSON.parse(JSON.stringify(products));
        data.data.prods.forEach(product=>{
            const childele=document.createElement('div');
            childele.setAttribute("id", `${product.id}`);

            childele.innerHTML=`<h3>${product.title}</h3>
            <div class="image-container"> 
                <img class="prod-images" src="${product.imageUrl}" alt="">
            </div>
            <div class="prod-details">
                <p>Rs.<span>${product.price}</span></p>
                <button class="shop-item-button" type='submit'>ADD TO CART</button>
            </div>`;
            productNode.appendChild(childele);
        })
        })
}
function cartPagination(title){
    axios.get(`http://localhost:3000/cart/?page=${title}`)
        .then(carts => {
        data = JSON.parse(JSON.stringify(carts));
        total_cart_price=0;
        cart_items.innerHTML="";
        data.data.prods.forEach(cart=>{
        document.querySelector('.cart-number').innerText = parseInt(document.querySelector('.cart-number').innerText)+1
        const cart_item = document.createElement('div');
        cart_item.innerHTML="";
        cart_item.classList.add('cart-row');
        cart_item.setAttribute('id',`in-cart-${cart.productId}`);
        axios.get(`http://localhost:3000/products/${cart.productId}`)
        .then(products => {
            data = JSON.parse(JSON.stringify(products))
            product=data.data;
            const price=`${product.price}`;
            const quantity=`${cart.quantity}`;
            total_cart_price = parseFloat(total_cart_price) + parseFloat(price*quantity);
            total_cart_price = total_cart_price.toFixed(2);
            document.querySelector('#total-value').innerText = `${total_cart_price}`;

            cart_item.innerHTML = `
            <span class='cart-item cart-column'>
            <img class='cart-img' src="${product.imageUrl}" alt="">
                <span>${product.title}</span>
            </span>
            <span class='cart-price cart-column'>${product.price}</span>
            <span class='cart-quantity cart-column'>
                <input type="text" value=${cart.quantity}>
                <button>REMOVE</button>
            </span>`
            cart_items.appendChild(cart_item);
        })
        });
        })
}

