// ===== Ambil elemen dari HTML =====
const $ = (id) => document.getElementById(id);

const inputHarga  = $('harga');
const inputPersen = $('persen');
const inputQty    = $('qty');

// Format angka menjadi rupiah, contoh: 350000 -> "Rp 350.000"
const rupiah = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

// Animasi angka naik/turun pelan-pelan
let tampilSebelumnya = 0;
function animasiAngka(elemen, dari, ke) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || dari === ke) { elemen.textContent = rupiah(ke); return; }
  const durasi = 400;
  const mulai = performance.now();
  function langkah(sekarang) {
    const t = Math.min((sekarang - mulai) / durasi, 1);
    const nilai = dari + (ke - dari) * (1 - Math.pow(1 - t, 3));
    elemen.textContent = rupiah(nilai);
    if (t < 1) requestAnimationFrame(langkah);
  }
  requestAnimationFrame(langkah);
}

// ===== Fungsi utama: menghitung diskon =====
function hitung() {
  const harga  = parseFloat(inputHarga.value);
  const persen = parseFloat(inputPersen.value);
  const qty    = Math.max(1, parseInt(inputQty.value) || 1);

  // Belum lengkap diisi -> tampilkan nol
  if (isNaN(harga) || isNaN(persen)) {
    $('err').textContent = '';
    tampilkan(0, 0, 0);
    return;
  }

  // Validasi input
  if (harga < 0 || persen < 0 || persen > 100) {
    $('err').textContent = 'Harga tidak boleh negatif dan diskon harus 0–100%.';
    return;
  }
  $('err').textContent = '';

  // Rumus diskon
  const hargaNormal = harga * qty;               // harga sebelum diskon
  const potongan    = hargaNormal * persen / 100; // nilai diskon
  tampilkan(hargaNormal, potongan, persen);
}

// ===== Menampilkan hasil ke layar =====
function tampilkan(normal, potongan, persen) {
  const bayar = normal - potongan;

  animasiAngka($('bayar'), tampilSebelumnya, bayar);
  tampilSebelumnya = bayar;

  $('normal').textContent  = rupiah(normal);
  $('normal2').textContent = rupiah(normal);
  $('hemat').textContent   = rupiah(potongan);
  $('badge').textContent   = 'Hemat ' + persen + '%';

  // Bar: bagian gelap = yang dibayar, bagian hijau = yang dihemat
  $('barFill').style.width = (100 - persen) + '%';
  $('pBayar').textContent  = +(100 - persen).toFixed(1);
  $('pHemat').textContent  = +persen.toFixed(1);

  // Efek kecil saat ada diskon
  if (persen > 0) {
    $('receipt').classList.remove('pop');
    void $('receipt').offsetWidth; // restart animasi
    $('receipt').classList.add('pop');
  }
}

// ===== Event: hitung otomatis saat mengetik =====
[inputHarga, inputPersen, inputQty].forEach((el) =>
  el.addEventListener('input', hitung)
);

// Tombol diskon cepat
$('chips').addEventListener('click', (e) => {
  if (e.target.dataset.v) {
    inputPersen.value = e.target.dataset.v;
    hitung();
  }
});

// Tombol hitung ulang
$('reset').addEventListener('click', () => {
  inputHarga.value = '';
  inputPersen.value = '';
  inputQty.value = 1;
  hitung();
  inputHarga.focus();
});
