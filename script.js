const CHAMPION_API = "https://ddragon.leagueoflegends.com/cdn/15.24.1/data/en_US/champion.json";
const ITEM_API = "https://ddragon.leagueoflegends.com/cdn/15.24.1/data/en_US/item.json";
const CHAMPION_IMG = "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/champion/";
const ITEM_IMG = "https://ddragon.leagueoflegends.com/cdn/15.24.1/img/item/";

const gallery = document.getElementById("gallery");
const pagination = document.getElementById("pagination");
const searchInput = document.getElementById("searchInput");
const home = document.getElementById("home");
const content = document.getElementById("content");
const title = document.getElementById("sectionTitle");

let dataList = [];
let filtered = [];
let currentPage = 1;
let currentType = "champion";

const ITEMS_PER_PAGE = 12;

function showHome() {
  home.classList.remove("d-none");
  content.classList.add("d-none");
}

function showContent(name, type) {
  home.classList.add("d-none");
  content.classList.remove("d-none");
  title.textContent = name;
  currentType = type;
  searchInput.value = "";
}

async function loadChampions() {
  showContent("CHAMPIONS", "champion");
  const res = await fetch(CHAMPION_API);
  const data = await res.json();
  dataList = Object.values(data.data);
  filtered = dataList;
  currentPage = 1;
  render();
}

async function loadItems() {
  showContent("ITEMS", "item");
  const res = await fetch(ITEM_API);
  const data = await res.json();

  const seen = new Set();

  dataList = Object.values(data.data)
    .filter(item =>
      item.gold?.purchasable &&
      item.maps?.["11"] &&
      item.image
    )
    .filter(item => {
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  filtered = dataList;
  currentPage = 1;
  render();
}

function render() {
  renderGallery();
  renderPagination();
}

function renderGallery() {
  gallery.innerHTML = "";
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const items = filtered.slice(start, start + ITEMS_PER_PAGE);

  items.forEach(item => {
    const img = currentType === "champion"
      ? CHAMPION_IMG + item.image.full
      : ITEM_IMG + item.image.full;

    gallery.innerHTML += `
      <div class="col-6 col-md-4 col-lg-3">
        <div class="card h-100">
          <img src="${img}">
          <div class="card-body">
            <h6>${item.name}</h6>
          </div>
        </div>
      </div>
    `;
  });
}

function renderPagination() {
  pagination.innerHTML = "";
  const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  if (total <= 1) return;

  pagination.innerHTML += `
    <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
      <button class="page-link" onclick="changePage(${currentPage - 1})">Previous</button>
    </li>
  `;

  let start = Math.max(1, currentPage - 1);
  let end = Math.min(total, start + 2);

  if (start > 1) pagination.innerHTML += `<li class="page-item"><button class="page-link" onclick="changePage(1)">1</button></li>`;
  if (start > 2) pagination.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;

  for (let i = start; i <= end; i++) {
    pagination.innerHTML += `
      <li class="page-item ${i === currentPage ? "active" : ""}">
        <button class="page-link" onclick="changePage(${i})">${i}</button>
      </li>
    `;
  }

  if (end < total - 1) pagination.innerHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
  if (end < total) pagination.innerHTML += `<li class="page-item"><button class="page-link" onclick="changePage(${total})">${total}</button></li>`;

  pagination.innerHTML += `
    <li class="page-item ${currentPage === total ? "disabled" : ""}">
      <button class="page-link" onclick="changePage(${currentPage + 1})">Next</button>
    </li>
  `;
}

function changePage(page) {
  const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  if (page < 1 || page > total) return;
  currentPage = page;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

searchInput.addEventListener("input", e => {
  const q = e.target.value.toLowerCase();
  filtered = dataList.filter(i => i.name.toLowerCase().includes(q));
  currentPage = 1;
  render();
});



