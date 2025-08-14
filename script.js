/* ---------- Data (mock) ---------- */
const PRODUCTS = [
  {
    id: "P1",
    name: "Organic Carrots",
    price: 3.5,
    unit: "per lb",
    category: "vegetables",
    location: "Andhra Pradesh",
    farmerId: "F1",
    img: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200&auto=format&fit=crop",
    badge: "organic",
    rating: 4.6, ratings: 38
  },
  {
    id: "P2",
    name: "New Harvest Apples",
    price: 2.0,
    unit: "per lb",
    category: "fruits",
    location: "Karnataka",
    farmerId: "F2",
    img: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=1200&auto=format&fit=crop",
    badge: "new",
    rating: 4.4, ratings: 22
  },
  {
    id: "P3",
    name: "Heirloom Tomatoes",
    price: 2.5,
    unit: "per lb",
    category: "vegetables",
    location: "Telangana",
    farmerId: "F3",
    img: "https://images.unsplash.com/photo-1582281298059-1a3c3f5a7b6b?q=80&w=1200&auto=format&fit=crop",
    badge: "organic",
    rating: 4.7, ratings: 51
  },
  {
    id: "P4",
    name: "Brown Rice",
    price: 1.8,
    unit: "per kg",
    category: "grains",
    location: "Maharashtra",
    farmerId: "F1",
    img: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=1200&auto=format&fit=crop",
    badge: "",
    rating: 4.2, ratings: 12
  },
  {
    id: "P5",
    name: "Bananas",
    price: 1.5,
    unit: "per lb",
    category: "fruits",
    location: "Telangana",
    farmerId: "F2",
    img: "https://images.unsplash.com/photo-1571772805064-207c8435df79?q=80&w=1200&auto=format&fit=crop",
    badge: "new",
    rating: 4.1, ratings: 18
  }
];

const FARMERS = [
  {
    id: "F1",
    name: "Emily Rao",
    location: "Andhra Pradesh",
    story: "Family-run farm focused on soil health and drip irrigation.",
    avatar: "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=800&auto=format&fit=crop",
    specialties: ["Carrots","Rice","Leafy Greens"]
  },
  {
    id: "F2",
    name: "Kiran & Asha",
    location: "Karnataka",
    story: "Agroforestry and mixed-fruit orchards with zero chemical residues.",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=800&auto=format&fit=crop",
    specialties: ["Apples","Bananas","Guava"]
  },
  {
    id: "F3",
    name: "Sravya Farms",
    location: "Telangana",
    story: "Heritage seeds and greenhouse tomatoes for consistent quality.",
    avatar: "https://images.unsplash.com/photo-1600850056064-00b3d2df9d8b?q=80&w=800&auto=format&fit=crop",
    specialties: ["Tomatoes","Peppers","Herbs"]
  }
];

/* ---------- State ---------- */
let cart = []; // [{id, name, price, qty}]
let order = null; // {id, step, eta}

/* ---------- Utils ---------- */
const $ = (s, scope=document) => scope.querySelector(s);
const $$ = (s, scope=document) => Array.from(scope.querySelectorAll(s));
const currency = n => `$${n.toFixed(2)}`;

/* ---------- Rendering: Products ---------- */
const productsEl = $("#products");

function starRow(avg){
  const rounded = Math.round(avg * 2) / 2; // halves
  let html = "";
  for(let i=1;i<=5;i++){
    const val = i <= Math.floor(rounded) ? "★" : (i - rounded === 0.5 ? "☆" : "☆");
    html += `<span class="star" aria-hidden="true">${val}</span>`;
  }
  return `<div class="stars" title="${avg.toFixed(1)} / 5">${html}</div>`;
}

function productCard(p){
  const farmer = FARMERS.find(f=>f.id===p.farmerId);
  return `
  <article class="product" data-badge="${p.badge||""}" data-cat="${p.category}" data-loc="${p.location}" data-name="${p.name.toLowerCase()}" data-farmer="${farmer.name.toLowerCase()}">
    <img src="${p.img}" alt="${p.name}">
    <div class="content">
      <h3>${p.name}</h3>
      <div class="tags">
        <span class="tag">👨‍🌾 ${farmer.name}</span>
        <span class="tag">📍 ${p.location}</span>
        <span class="tag">🗂 ${p.category}</span>
      </div>

      ${starRow(p.rating)} <small>${p.ratings} reviews</small>

      <div class="price-row">
        <div class="price">${currency(p.price)} <small>/${p.unit}</small></div>
        <div class="qty" aria-label="Quantity selector">
          <button data-action="dec" data-id="${p.id}">-</button>
          <span id="qty-${p.id}">1</span>
          <button data-action="inc" data-id="${p.id}">+</button>
        </div>
      </div>

      <button class="add" data-action="add" data-id="${p.id}">Add to Cart</button>

      <div class="stars" data-rate="${p.id}" aria-label="Rate this product">
        ${[1,2,3,4,5].map(i=>`<span class="star" data-star="${i}" title="${i} star">☆</span>`).join("")}
      </div>
    </div>
  </article>`;
}

function renderProducts(list=PRODUCTS){
  productsEl.innerHTML = list.map(productCard).join("");
}

/* ---------- Filters ---------- */
const catSel = $("#filter-category");
const priceRange = $("#filter-price");
const priceVal = $("#filter-price-value");
const locSel = $("#filter-location");
const search = $("#search");

function applyFilters(){
  const cat = catSel.value;
  const maxPrice = Number(priceRange.value);
  const loc = locSel.value;
  const q = search.value.trim().toLowerCase();

  const filtered = PRODUCTS.filter(p=>{
    const byCat = cat==="all" || p.category===cat;
    const byPrice = p.price <= maxPrice;
    const byLoc = loc==="all" || p.location===loc;
    const byQuery = !q || p.name.toLowerCase().includes(q) || FARMERS.find(f=>f.id===p.farmerId).name.toLowerCase().includes(q);
    return byCat && byPrice && byLoc && byQuery;
  });

  renderProducts(filtered);
}
priceRange.addEventListener("input", e=>{ priceVal.textContent = e.target.value; applyFilters(); });
[catSel, locSel].forEach(el=>el.addEventListener("change", applyFilters));
search.addEventListener("input", applyFilters);

/* ---------- Cart ---------- */
const cartList = $("#cart-list");
const cartTotal = $("#cart-total");
const cartItems = $("#cart-items");

function addToCart(prodId, qty=1){
  const p = PRODUCTS.find(x=>x.id===prodId);
  const existing = cart.find(c=>c.id===prodId);
  if(existing){ existing.qty += qty; }
  else cart.push({ id:p.id, name:p.name, price:p.price, qty });
  flashAdd(prodId);
  renderCart();
}

function updateQty(id, delta){
  const item = cart.find(c=>c.id===id);
  if(!item) return;
  item.qty += delta;
  if(item.qty<=0){ cart = cart.filter(c=>c.id!==id); }
  renderCart();
}

function removeItem(id){
  cart = cart.filter(c=>c.id!==id);
  renderCart();
}

function renderCart(){
  cartList.innerHTML = cart.map(i=>`
    <li class="cart-item">
      <span>${i.name}</span>
      <div class="controls">
        <button data-cmd="dec" data-id="${i.id}">-</button>
        <strong>${i.qty}</strong>
        <button data-cmd="inc" data-id="${i.id}">+</button>
      </div>
      <span>${currency(i.price*i.qty)}</span>
      <button data-cmd="rm" data-id="${i.id}" class="btn-ghost">Remove</button>
    </li>
  `).join("");

  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  cartTotal.textContent = currency(total);
  const count = cart.reduce((s,i)=>s+i.qty,0);
  cartItems.textContent = `${count} item${count!==1?'s':''}`;

  // Delegate events
  cartList.querySelectorAll("button").forEach(btn=>{
    const id = btn.dataset.id;
    const cmd = btn.dataset.cmd;
    btn.onclick = () => {
      if(cmd==="inc") updateQty(id, +1);
      if(cmd==="dec") updateQty(id, -1);
      if(cmd==="rm") removeItem(id);
    };
  });
}

/* Subtle animation when adding to cart */
function flashAdd(prodId){
  const btn = document.querySelector(`.add[data-id="${prodId}"]`);
  if(!btn) return;
  btn.classList.add("added-burst");
  setTimeout(()=>btn.classList.remove("added-burst"), 250);
}

/* ---------- Checkout + Order Tracking ---------- */
const checkoutBtn = $("#checkout");
const noOrder = $("#no-order");
const orderPanel = $("#order-panel");
const orderIdEl = $("#order-id");
const orderEtaEl = $("#order-eta");
const trackerSteps = $$(".tracker li");
const advanceBtn = $("#advance");
const resetBtn = $("#reset");

function checkout(){
  if(cart.length===0){ alert("Your cart is empty!"); return; }
  const id = "F2F-" + Math.random().toString(36).slice(2,7).toUpperCase();
  const eta = new Date(Date.now() + 1000*60*90); // +90m estimate
  order = { id, step:1, eta };
  cart = [];
  renderCart();
  renderOrder();
  alert(`Thanks for your order!\nOrder #${id} created.`);
}
checkoutBtn.addEventListener("click", checkout);

function renderOrder(){
  if(!order){ noOrder.classList.remove("hidden"); orderPanel.classList.add("hidden"); return; }
  noOrder.classList.add("hidden"); orderPanel.classList.remove("hidden");
  orderIdEl.textContent = order.id;
  orderEtaEl.textContent = etaString(order.eta);
  trackerSteps.forEach(li=>{
    const step = Number(li.dataset.step);
    li.classList.toggle("active", step <= order.step);
  });
}
function etaString(d){
  const hh = String(d.getHours()).padStart(2,"0");
  const mm = String(d.getMinutes()).padStart(2,"0");
  return `${d.toDateString()} · ${hh}:${mm}`;
}
advanceBtn.addEventListener("click", ()=>{
  if(!order) return;
  order.step = Math.min(order.step+1, 5);
  renderOrder();
});
resetBtn.addEventListener("click", ()=>{
  order = null; renderOrder();
});

/* ---------- Ratings (hover + submit) ---------- */
function attachRatingHandlers(){
  $$(".stars[data-rate]").forEach(row=>{
    const pid = row.dataset.rate;
    const stars = $$(".star", row);

    stars.forEach(star=>{
      star.addEventListener("mouseenter", ()=>{
        const rating = Number(star.dataset.star);
        stars.forEach(s=>s.textContent = Number(s.dataset.star) <= rating ? "★" : "☆");
      });
      row.addEventListener("mouseleave", ()=>{
        stars.forEach(s=>s.textContent = "☆");
      });
      star.addEventListener("click", ()=>{
        const rating = Number(star.dataset.star);
        const p = PRODUCTS.find(x=>x.id===pid);
        // simple running average
        p.rating = (p.rating*p.ratings + rating) / (p.ratings + 1);
        p.ratings += 1;
        applyFilters(); // re-render to update average row
        alert(`Thanks for rating ${p.name} ${rating}★!`);
      });
    });
  });
}

/* ---------- Farmer Profiles ---------- */
function renderFarmers(){
  const wrap = $("#farmers");
  wrap.innerHTML = FARMERS.map(f=>`
    <article class="card">
      <div style="display:flex; gap:14px; align-items:center;">
        <img src="${f.avatar}" alt="${f.name}" style="width:68px;height:68px;border-radius:14px;object-fit:cover;">
        <div>
          <h3 style="margin:0">${f.name}</h3>
          <div class="tags" style="margin:6px 0 2px">
            <span class="tag">📍 ${f.location}</span>
            ${f.specialties.slice(0,3).map(s=>`<span class="tag">⭐ ${s}</span>`).join("")}
          </div>
        </div>
      </div>
      <p style="margin:.5rem 0 0">${f.story}</p>
    </article>
  `).join("");
}

/* ---------- Global Events ---------- */
// Quantity buttons inside product cards + Add to cart + Ratings
productsEl.addEventListener("click",(e)=>{
  const btn = e.target.closest("button");
  if(!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if(action==="inc"){
    const el = document.getElementById(`qty-${id}`);
    el.textContent = Number(el.textContent) + 1;
  }
  if(action==="dec"){
    const el = document.getElementById(`qty-${id}`);
    el.textContent = Math.max(1, Number(el.textContent) - 1);
  }
  if(action==="add"){
    const qty = Number(document.getElementById(`qty-${id}`).textContent);
    addToCart(id, qty);
  }
});

productsEl.addEventListener("mouseover", (e)=>{
  // attach rating hover handlers once after render
  if(e.target.closest(".stars[data-rate]")) attachRatingHandlers();
}, { once:true });

/* ---------- Init ---------- */
function init(){
  $("#year").textContent = new Date().getFullYear();
  priceVal.textContent = priceRange.value;
  renderProducts(PRODUCTS);
  renderFarmers();
  attachRatingHandlers();
  renderCart();
  renderOrder();
  applyFilters();
}
init();
