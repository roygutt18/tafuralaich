const items1 = document.querySelectorAll(".timeline-item");
const line = document.querySelector(".timeline-line");
const circles = document.querySelectorAll(".timeline-circle");

function updateTimeline() {
  const viewportHeight = window.innerHeight;
  const firstRect = items1[0].getBoundingClientRect();
  let maxHeight = 0;

  items1.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const reached = rect.top < viewportHeight * 0.7;

    if (reached) {
      circles[index].classList.add("filled");
      const distance = rect.bottom - firstRect.top;
      if (distance > maxHeight) maxHeight = distance;
    } else {
      circles[index].classList.remove("filled");
    }
  });

  const lastRect = items1[items1.length - 1].getBoundingClientRect();
  if (lastRect.top < viewportHeight * 0.6) {
    const distanceToLast = lastRect.bottom - firstRect.top;
    if (distanceToLast > maxHeight) maxHeight = distanceToLast;
  }

  if (firstRect.top > viewportHeight * 0.6) {
    line.style.height = "0px";
    return;
  }

  line.style.height = maxHeight + "px";
}

window.addEventListener("scroll", updateTimeline);
updateTimeline();



const cartBtn = document.getElementById('cart-btn');
const cartDiv = document.querySelector('.cart');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');

let cart = [];

cartBtn.addEventListener('click', () => {
  cartDiv.style.display = cartDiv.style.display === 'flex' ? 'none' : 'flex';
});

closeCart.addEventListener('click', () => {
  cartDiv.style.display = 'none';
});

/* דוגמה להוספת מוצר לעגלה */
document.querySelectorAll('.details-btn').forEach((btn, index) => {
  btn.addEventListener('click', () => {
    const productCard = btn.parentElement;
    const name = productCard.querySelector('h2').textContent;
    const priceText = productCard.querySelector('.price').textContent.replace('₪','');
    const price = parseFloat(priceText);
    cart.push({name, price});
    updateCart();
    alert(`${name} נוסף לעגלה`);
  });
});

function updateCart() {
  cartItems.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${item.name}</span><span>₪${item.price.toFixed(2)}</span>`;
    cartItems.appendChild(li);
    total += item.price;
  });
  cartTotalPrice.textContent = `₪${total.toFixed(2)}`;
}


const hamburger = document.getElementById('hamburger');
const overlay = document.getElementById('menuOverlay');
const menuLinks = document.querySelectorAll('.side-menu a');

hamburger.addEventListener('click', () => {
  document.body.classList.toggle('menu-open');
});

overlay.addEventListener('click', () => {
  document.body.classList.remove('menu-open');
});

menuLinks.forEach(link => {
  link.addEventListener('click', () => {
    document.body.classList.remove('menu-open');
  });
});

