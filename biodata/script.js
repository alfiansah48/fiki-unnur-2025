
// === INTRO VIDEO ===
const introVideo = document.getElementById('introVideo');
const mainContent = document.getElementById('mainContent');
const wrap = document.getElementById('contentWrap');

introVideo.addEventListener('ended', () => {
  introVideo.style.display = 'none';
  mainContent.style.display = 'block';
  setTimeout(() => wrap.style.opacity = '1', 100);
  startBirthdayFeature();
});

// === KARTU BIODATA (buka/tutup) ===
document.querySelectorAll('.friend').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.friend.open').forEach(x => {
      if (x !== card) x.classList.remove('open');
    });
    card.classList.toggle('open');
  });
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.friend')) {
    document.querySelectorAll('.friend.open').forEach(x => x.classList.remove('open'));
  }
});

// === FITUR ULANG TAHUN ===
function startBirthdayFeature() {
  const today = new Date();
  const upcomingDays = 2;
  const birthdayList = [];

  document.querySelectorAll('.friend').forEach(f => {
    const birth = f.dataset.birth;
    if (!birth) return;

    const [d, m] = birth.split('-').map(Number);
    const friendName = f.querySelector('.name').textContent;
    const imgSrc = f.querySelector('img').src;

    const thisYear = new Date(today.getFullYear(), m - 1, d);
    let diffDays = Math.floor((thisYear - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      const nextYear = new Date(today.getFullYear() + 1, m - 1, d);
      diffDays = Math.floor((nextYear - today) / (1000 * 60 * 60 * 24));
    }

    if (diffDays >= 0 && diffDays <= upcomingDays) {
      birthdayList.push({ name: friendName, img: imgSrc, diff: diffDays });
    }
  });

  const container = document.getElementById('birthday-container');
  container.innerHTML = ''; // bersihkan sebelumnya

  if (birthdayList.length > 0) {
    const banner = document.createElement('div');
    banner.className = 'birthday-banner';
    banner.innerHTML = `
      <div class="birthday-top">
        ${birthdayList.map(b => `
          <div class="birthday-friend">
            <img src="${b.img}" alt="${b.name}">
            <div class="bname">${b.name}</div>
            <div class="bmsg">${
              b.diff === 0
                ? `🎉 Selamat Ulang Tahun ${b.name}! 🎂`
                : `🎈 Sebentar lagi ulang tahun ${b.name}! (${b.diff} hari lagi) 🎁`
            }</div>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(banner);

    // Jika ada yang ulang tahun hari ini → munculkan bunga di atas banner
    if (birthdayList.some(b => b.diff === 0)) startFlowerEffect(banner.querySelector('.birthday-top'));
  }
}

// === EFEK BUNGA DI ATAS BANNER ===
function startFlowerEffect(target) {
  const flowers = ['🌸', '🌼', '🌺', '💐', '🌷', '🌹'];
  for (let i = 0; i < 25; i++) {
    const f = document.createElement('div');
    f.className = 'flower';
    f.textContent = flowers[Math.floor(Math.random() * flowers.length)];
    f.style.position = 'absolute';
    f.style.left = Math.random() * 100 + '%';
    f.style.top = '-10px';
    f.style.animation = `fall ${Math.random() * 2 + 3}s linear ${Math.random() * 3}s forwards`;
    f.style.fontSize = (Math.random() * 16 + 16) + 'px';
    target.appendChild(f);
    setTimeout(() => f.remove(), 6000);
  }
}

// === ANIMASI SCROLL (KIRI-TENGAH-KANAN) ===
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const index = Array.from(el.parentNode.children).indexOf(el);
      const pos = index % 3; // 0 = kiri, 1 = tengah, 2 = kanan

      const delay = Math.random() * 0.3; // sedikit delay acak biar alami
      el.style.animationDelay = `${delay}s`;

      if (pos === 0) el.classList.add('animate-left');
      else if (pos === 1) el.classList.add('animate-center');
      else el.classList.add('animate-right');

      observer.unobserve(el);
    }
  });
}, { threshold: 0.2 });

// pantau semua elemen .friend
document.querySelectorAll('.friend').forEach(el => observer.observe(el));

// === EFEK GERAK KARTU SAAT KURSOR DIARAHKAN ===
document.querySelectorAll('.friend').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y / rect.height) - 0.5) * -10;
    const rotateY = ((x / rect.width) - 0.5) * 10;
    card.style.setProperty('--rx', `${rotateX}deg`);
    card.style.setProperty('--ry', `${rotateY}deg`);
  });

  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--rx', `0deg`);
    card.style.setProperty('--ry', `0deg`);
  });
});
