document.documentElement.classList.add("js");

// Прайс из открытых данных салона: цены [барбер, старший, ведущий], null = нет у уровня.
// t: время визита по уровням (null = не указано), n: примечание по уровням.
const SERVICES = [
  { name: "Стрижка", p: [5000, 7000, 6000], t: ["1 ч", "1 ч", "1 ч"], img: "master", sit: ["simple"] },
  { name: "Студенческая стрижка", p: [4500, 6000, 5500], n: [null, "пн–пт", null], img: "master", sit: ["student"] },
  { name: "Детская стрижка (6–12 лет)", p: [4000, 5000, 4500], img: "client", sit: ["father"] },
  { name: "Удлинённая стрижка", p: [6000, 8000, 7000], n: [null, "только ножницы, бока от 4–5 см", null], img: "master", sit: ["simple"] },
  { name: "Стрижка под машинку", p: [null, null, 5000], t: [null, null, "45 мин"], img: "tools", sit: ["simple"] },
  { name: "Стрижка + борода", p: [8000, 10000, 9000], t: ["2 ч", "2 ч", "2 ч"], img: "towel", sit: ["beard"] },
  { name: "Стрижка + борода + тонировка бороды", p: [10000, 12000, 11000], t: ["2 ч", "2 ч", "2 ч"], img: "towel", sit: ["beard"] },
  { name: "Стрижка + борода + чистка лица", p: [10000, 12000, 11000], t: ["2 ч", "2 ч", "2 ч"], img: "towel", sit: ["beard"] },
  { name: "Стрижка + чистка лица", p: [8000, 10000, 9000], t: ["1 ч 45 мин", "1 ч 30 мин", "1 ч 45 мин"], img: "client", sit: [] },
  { name: "Стрижка + тонировка головы", p: [null, 11000, 10000], t: [null, "1 ч 30 мин", "1 ч 30 мин"], img: "master", sit: [] },
  { name: "Отец и сын (6–12 лет)", p: [8000, 10000, 9000], t: ["2 ч", "2 ч", "2 ч"], img: "client", sit: ["father"] },
  { name: "Отец и сын + борода", p: [11000, 13000, 12000], t: ["2 ч 30 мин", "2 ч 30 мин", "2 ч 30 мин"], img: "client", sit: ["father", "beard"] },
  { name: "Отец и 2 сына", p: [null, 12000, 11000], t: [null, "2 ч 30 мин", "2 ч 30 мин"], img: "client", sit: ["father"] },
  { name: "Тонировка головы", p: [5000, 5000, 5000], t: ["1 ч", null, "45 мин"], img: "tools", sit: [] },
  { name: "Тонировка бороды", p: [2500, null, null], t: ["30 мин", null, null], img: "towel", sit: ["beard"] },
  { name: "Корректировка бороды", p: [3500, 4500, 4000], t: ["1 ч", "1 ч", "1 ч"], img: "towel", sit: ["beard"] },
  { name: "Мытьё и укладка", p: [1500, 2000, 1500], t: ["15 мин", "15 мин", "15 мин"], img: "master", sit: ["simple"] },
  { name: "Чистка лица", p: [null, 4000, 3500], t: [null, "45 мин", "45 мин"], n: [null, "скраб и чёрная маска", null], img: "towel", sit: [] },
  { name: "Экспресс-бритьё", p: [null, 4000, null], t: [null, "30 мин", null], img: "towel", sit: ["beard"] },
  { name: "Окантовка краевой линии", p: [null, 3000, null], t: [null, "30 мин", null], img: "tools", sit: ["simple"] },
  { name: "Удаление воском (нос и уши)", p: [null, 1000, 1000], img: "tools", sit: [] },
  { name: "Химическая завивка (кудри)", p: ["14000–16000", null, null], t: ["1 ч 30 мин", null, null], img: "master", sit: [] }
];

const fmt = (v) => String(v).replace(/\d+/g, (d) => Number(d).toLocaleString("ru-RU").replace(/ /g, " ")) + " ₸";

// Категории вкладок: какие услуги в какой вкладке и какое фото рядом
const CATS = [
  { name: "Стрижки", img: "master", items: ["Стрижка", "Студенческая стрижка", "Детская стрижка (6–12 лет)", "Удлинённая стрижка", "Стрижка под машинку", "Мытьё и укладка", "Окантовка краевой линии"] },
  { name: "Борода", img: "towel", items: ["Корректировка бороды", "Тонировка бороды", "Экспресс-бритьё"] },
  { name: "Стрижка + уход", img: "client", items: ["Стрижка + борода", "Стрижка + борода + тонировка бороды", "Стрижка + борода + чистка лица", "Стрижка + чистка лица", "Стрижка + тонировка головы"] },
  { name: "Отец и сын", img: "interior", items: ["Отец и сын (6–12 лет)", "Отец и сын + борода", "Отец и 2 сына"] },
  { name: "Уход", img: "tools", items: ["Чистка лица", "Тонировка головы", "Удаление воском (нос и уши)", "Химическая завивка (кудри)"] }
];

let level = 0;
let cat = 0;
const picked = new Set(); // номера услуг из SERVICES в чеке

const tabsEl = document.getElementById("tabs");
const rowsEl = document.getElementById("rows");
const pickImg = document.getElementById("pickImg");
const checkItems = document.getElementById("checkItems");
const checkEmpty = document.getElementById("checkEmpty");
const checkSum = document.getElementById("checkSum");
const checkClear = document.getElementById("checkClear");
const checkNote = document.getElementById("checkNote");

function metaText(s, lv) {
  const parts = [];
  if (s.t && s.t[lv]) parts.push(s.t[lv]);
  if (s.n && s.n[lv]) parts.push(s.n[lv]);
  return parts.join(" · ");
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

// Вкладки категорий
const tabBtns = CATS.map((c, i) => {
  const b = el("button", "chip", c.name);
  b.type = "button";
  b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
  b.addEventListener("click", () => { cat = i; renderTabs(); renderRows(true); swapPhoto(c.img); });
  tabsEl.append(b);
  return b;
});
function renderTabs() {
  tabBtns.forEach((b, i) => b.setAttribute("aria-pressed", i === cat ? "true" : "false"));
}

let swapTimer = null;
function swapPhoto(name) {
  const src = "img/" + name + ".jpg";
  if (pickImg.getAttribute("src").endsWith(src)) return;
  pickImg.classList.add("is-swap");
  clearTimeout(swapTimer);
  swapTimer = setTimeout(() => {
    pickImg.src = src;
    const show = () => pickImg.classList.remove("is-swap");
    if (pickImg.complete) requestAnimationFrame(show);
    else pickImg.onload = show;
  }, 300);
}

// Строки текущей вкладки (только те, что есть у выбранного мастера)
function renderRows(animate) {
  rowsEl.replaceChildren();
  CATS[cat].items.forEach((name) => {
    const i = SERVICES.findIndex((s) => s.name === name);
    const s = SERVICES[i];
    if (!s || s.p[level] === null) return;
    const li = el("li");
    const btn = el("button", "row");
    btn.type = "button";
    btn.setAttribute("aria-pressed", picked.has(i) ? "true" : "false");
    btn.classList.toggle("is-sel", picked.has(i));
    const mark = el("span", "row-mark", "✓");
    mark.setAttribute("aria-hidden", "true");
    const left = el("span");
    left.append(el("span", "row-name", s.name));
    const m = metaText(s, level);
    if (m) left.append(el("span", "row-meta", m));
    btn.append(mark, left, el("span", "row-price", fmt(s.p[level])));
    btn.addEventListener("click", () => {
      if (picked.has(i)) picked.delete(i); else picked.add(i);
      checkNote.hidden = true;
      btn.classList.toggle("is-sel", picked.has(i));
      btn.setAttribute("aria-pressed", picked.has(i) ? "true" : "false");
      renderCheck();
    });
    li.append(btn);
    rowsEl.append(li);
  });
  if (animate) {
    rowsEl.classList.remove("is-in");
    void rowsEl.offsetWidth;
    rowsEl.classList.add("is-in");
  }
}

// Чек
function priceValue(v) {
  return typeof v === "number" ? v : Number(String(v).split("–")[0]);
}
function renderCheck() {
  checkItems.replaceChildren();
  let sum = 0;
  let approx = false;
  picked.forEach((i) => {
    const s = SERVICES[i];
    const v = s.p[level];
    sum += priceValue(v);
    if (typeof v !== "number") approx = true;
    const li = el("li", "check-item");
    li.append(el("span", "", s.name), el("b", "", fmt(v)));
    const x = el("button", "check-x", "×");
    x.type = "button";
    x.setAttribute("aria-label", "Убрать из чека: " + s.name);
    x.addEventListener("click", () => { picked.delete(i); checkNote.hidden = true; renderRows(false); renderCheck(); });
    li.append(x);
    checkItems.append(li);
  });
  checkEmpty.hidden = picked.size > 0;
  checkClear.hidden = picked.size === 0;
  checkSum.textContent = (approx ? "от " : "") + fmt(sum);
}
checkClear.addEventListener("click", () => { picked.clear(); checkNote.hidden = true; renderRows(false); renderCheck(); });

// Переключатель уровня мастера: цены в списке и в чеке пересчитываются
document.querySelectorAll(".level").forEach((b) => {
  b.addEventListener("click", () => {
    level = Number(b.dataset.level);
    document.querySelectorAll(".level").forEach((x) => {
      const on = x === b;
      x.classList.toggle("is-on", on);
      x.setAttribute("aria-pressed", on ? "true" : "false");
    });
    let dropped = 0;
    [...picked].forEach((i) => { if (SERVICES[i].p[level] === null) { picked.delete(i); dropped++; } });
    checkNote.hidden = dropped === 0;
    if (dropped) checkNote.textContent = "У этого мастера нет " + (dropped === 1 ? "одной услуги из чека, мы её убрали." : "некоторых услуг из чека, мы их убрали.");
    renderRows(true);
    renderCheck();
  });
});

renderRows(false);
renderCheck();

// Окошко демо вместо WhatsApp
const toast = document.getElementById("toast");
let toastTimer = null;
let lastFocus = null;
function hideToast() {
  toast.classList.remove("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 300);
  if (lastFocus) lastFocus.focus({ preventScroll: true });
}
document.querySelectorAll(".js-book").forEach((b) => {
  b.addEventListener("click", () => {
    lastFocus = b;
    clearTimeout(toastTimer);
    toast.hidden = false;
    void toast.offsetWidth; // перерисовка, чтобы сработал плавный переход
    toast.classList.add("is-on");
    document.getElementById("toastClose").focus({ preventScroll: true });
    toastTimer = setTimeout(hideToast, 4000);
  });
});
document.getElementById("toastClose").addEventListener("click", hideToast);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !toast.hidden) hideToast(); });

// Шапка при прокрутке
const header = document.querySelector(".header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Счётчик цифр
function countUp(el) {
  const to = parseFloat(el.dataset.count);
  const dec = Number(el.dataset.dec || 0);
  const start = performance.now();
  const dur = 1200;
  const step = (now) => {
    const k = Math.min(1, (now - start) / dur);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = (to * e).toFixed(dec);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Появление блоков при прокрутке
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      const num = en.target.querySelector("[data-count]");
      if (num) countUp(num);
      io.unobserve(en.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
}
