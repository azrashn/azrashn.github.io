// ---- Sekme / dosya geçişleri ----
const files = document.querySelectorAll('.file');
const tabs = document.querySelectorAll('.tab');
const panes = document.querySelectorAll('.pane');

function activate(target) {
  files.forEach(f => f.classList.toggle('active', f.dataset.target === target));
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === target));
  panes.forEach(p => p.classList.toggle('active', p.id === target));
}

files.forEach(f => f.addEventListener('click', () => activate(f.dataset.target)));
tabs.forEach(t => t.addEventListener('click', () => activate(t.dataset.tab)));

// ---- Hero yazı yazma efekti ----
const typedEl = document.getElementById('typed');
const text = "azrashn"; // buraya kendi isim / unvanını yaz
let i = 0;

function typeWriter() {
  if (i < text.length) {
    typedEl.textContent += text.charAt(i);
    i++;
    setTimeout(typeWriter, 90);
  }
}

typeWriter();
