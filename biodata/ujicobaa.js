// === GLOBAL VARIABLES ===
const introVideo = document.getElementById('introVideo');
const mainContent = document.getElementById('mainContent');
const wrap = document.getElementById('contentWrap');

// === INTRO VIDEO HANDLER ===
introVideo.addEventListener('ended', () => {
  introVideo.style.display = 'none';
  mainContent.style.display = 'block';
  
  // Fade in effect untuk hero text
  setTimeout(() => {
    const heroText = document.querySelector('.hero-text');
    if (heroText) {
      heroText.style.opacity = '0';
      heroText.style.transform = 'translateY(40px)';
      heroText.style.transition = 'all 1.2s ease';
      setTimeout(() => {
        heroText.style.opacity = '1';
        heroText.style.transform = 'translateY(0)';
      }, 100);
    }
  }, 100);

  // Fade in effect untuk main content
  setTimeout(() => {
    wrap.style.opacity = '1';
    wrap.style.transform = 'translateY(0)';
  }, 300);

  startBirthdayFeature();
  initializeScrollAnimations();
});

// === CONVERT FRIEND CARDS TO FLIPPABLE ===
function makeCardsFlippable() {
  document.querySelectorAll('.friend').forEach(friend => {
    const avatar = friend.querySelector('.avatar');
    const name = friend.querySelector('.name');
    const info = friend.querySelector('.info');

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const front = document.createElement('div');
    front.className = 'card-front';
    front.appendChild(avatar);
    front.appendChild(name);

    const back = document.createElement('div');
    back.className = 'card-back';
    
    // Add biodata title to back
    const biodataTitle = document.createElement('div');
    biodataTitle.className = 'biodata-title';
    biodataTitle.textContent = '🧑BIODATA';
    back.appendChild(biodataTitle);
    back.appendChild(info);

    inner.appendChild(front);
    inner.appendChild(back);

    friend.innerHTML = '';
    friend.appendChild(inner);

    // Desktop: Flip on hover
    friend.addEventListener('mouseenter', () => {
      friend.classList.add('flipped');
    });

    friend.addEventListener('mouseleave', () => {
      friend.classList.remove('flipped');
    });

    // Mobile: Flip on click/tap
    friend.addEventListener('click', (e) => {
      e.stopPropagation();
      friend.classList.toggle('flipped');
    });

    // 3D tilt effect on mouse move (only when not flipped)
    friend.addEventListener('mousemove', (e) => {
      if (friend.classList.contains('flipped')) return;
      
      const rect = friend.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -15;
      const rotateY = ((x / rect.width) - 0.5) * 15;
      friend.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px)`;
    });

    friend.addEventListener('mouseleave', () => {
      if (!friend.classList.contains('flipped')) {
        friend.style.transform = '';
      }
    });
  });

  // Close cards when clicking outside (mobile)
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.friend')) {
      document.querySelectorAll('.friend.flipped').forEach(x => x.classList.remove('flipped'));
    }
  });
}

// === BIRTHDAY FEATURE ===
function startBirthdayFeature() {
  const today = stripTime(new Date());
  const upcomingDays = 7; // jangka pantau
  const birthdayList = [];

  // Sumber data dari markup lama: data-birth="DD-MM"
  document.querySelectorAll('.friend').forEach(f => {
    const birth = f.dataset.birth;
    if (!birth) return;

    const [d, m] = birth.split('-').map(Number);
    const name = f.querySelector('.name')?.textContent?.trim() || 'Tanpa Nama';
    const imgEl = f.querySelector('.card-front img') || f.querySelector('img');
    const img = imgEl ? imgEl.src : '';

    // hitung H-n
    const thisYear = new Date(today.getFullYear(), m - 1, d);
    let diff = Math.floor((stripTime(thisYear) - today) / 86400000);
    if (diff < 0) {
      const nextYear = new Date(today.getFullYear() + 1, m - 1, d);
      diff = Math.floor((stripTime(nextYear) - today) / 86400000);
    }

    if (diff >= 0 && diff <= upcomingDays) {
      birthdayList.push({ name, img, diff, d, m });
    }
  });

  const container = document.getElementById('birthday-container');
  container.innerHTML = '';

  if (!birthdayList.length) {
    container.innerHTML = `<div class="birthday-none">Tidak ada yang ultah dalam ${upcomingDays} hari ke depan.</div>`;
    return;
  }

  // Urutkan: hari ini dulu, lalu paling dekat, lalu nama
  birthdayList.sort((a, b) => a.diff - b.diff || a.name.localeCompare(b.name, 'id'));

  // Pisah: hari ini vs 7 hari ke depan
  const todayList = birthdayList.filter(b => b.diff === 0);
  const nextList  = birthdayList.filter(b => b.diff > 0);

  // ====== HARI INI: 1 banner gabungan ======
  if (todayList.length) {
    const todayBanner = document.createElement('section');
    todayBanner.className = 'today-banner';
    todayBanner.innerHTML = `
      <h3>🎂 Hari Ini</h3>
      <div class="today-list">
        ${todayList.map(b => `
          <div class="today-person">
            <img src="${b.img || ''}" alt="${b.name}">
            <div class="bname">${b.name}</div>
          </div>
        `).join('')}
      </div>
      <div class="today-msg">Selamat Ulang Tahun! 🎉🎂 Panjang umur dan sehat selalu.</div>
    `;
    container.appendChild(todayBanner);

    // efek bunga cukup sekali di banner
    startFlowerEffect(todayBanner);
  }

  // ====== H-1 s.d. H-7: kartu terpisah (grid) ======
  if (nextList.length) {
    const secNext = document.createElement('section');
    secNext.className = 'birthday-section';
    secNext.innerHTML = `<h3>🎈 7 Hari ke Depan</h3><div class="birthday-grid"></div>`;
    container.appendChild(secNext);

    const grid = secNext.querySelector('.birthday-grid');
    nextList.forEach(b => {
      const card = document.createElement('article');
      card.className = 'birthday-card';
      card.innerHTML = `
        <div class="bavatar"><img src="${b.img || ''}" alt="${b.name}"></div>
        <div class="bmeta">
          <div class="bname">${b.name}</div>
          <div class="bmsg">H-<strong>${b.diff}</strong> hari</div>
          <div class="bdate">Tanggal: ${String(b.d).padStart(2,'0')}-${String(b.m).padStart(2,'0')}</div>
        </div>
      `;
      grid.appendChild(card);
    });
  }
}

// util kecil: buang jam-menit supaya perhitungan hari akurat
function stripTime(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Efek bunga (tetap sama dengan punyamu, boleh pakai ini)
function startFlowerEffect(target) {
  const flowers = ['🌸','🌼','🌺','💐','🌷','🌹','🌻','🏵️','🎉','🎊','🥳'];
  const count = 18;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'flower';
    el.textContent = flowers[Math.floor(Math.random() * flowers.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.animationDuration = (Math.random() * 2 + 3) + 's';
    el.style.animationDelay = (Math.random() * 1.5) + 's';
    el.style.fontSize = (Math.random() * 10 + 18) + 'px';
    target.appendChild(el);
    setTimeout(() => el.remove(), 20000);
  }
}



// === SCROLL ANIMATIONS ===
function initializeScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const index = Array.from(el.parentNode.children).indexOf(el);
        const pos = index % 3;
        
        const delay = Math.random() * 0.4;
        el.style.animationDelay = `${delay}s`;

        if (pos === 0) el.classList.add('animate-left');
        else if (pos === 1) el.classList.add('animate-center');
        else el.classList.add('animate-right');

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.friend').forEach(el => observer.observe(el));
}

// === GSAP INFINITE SLIDER ===
function initializeGSAPSlider() {
  const slidesContainer = document.querySelector('#slides');
  if (!slidesContainer) return;

  const originalSlides = Array.from(slidesContainer.children);
  if (originalSlides.length === 0) return;

  // Duplicate slides for seamless loop
  slidesContainer.innerHTML += slidesContainer.innerHTML;
  const slides = Array.from(slidesContainer.children);

  let xPos = 0;
  const speed = 1.2;
  let isPaused = false;

  function loop() {
    if (!isPaused) {
      xPos += speed;
      const totalWidth = slides[0].offsetWidth * slides.length;
      
      if (xPos >= totalWidth / 2) {
        xPos = 0;
      }
      
      gsap.set(slidesContainer, { x: -xPos });
    }
    requestAnimationFrame(loop);
  }

  loop();

  // Draggable functionality
  Draggable.create(slidesContainer, {
    type: 'x',
    inertia: true,
    onDragStart: () => (isPaused = true),
    onDrag: function () {
      xPos = -this.x;
    },
    onDragEnd: () => (isPaused = false),
  });

  // Popup zoom functionality
  const popup = document.getElementById('popup');
  const popupImg = popup.querySelector('img');
  
  slides.forEach(slide => {
    const img = slide.querySelector('img');
    slide.style.cursor = 'pointer';
    
    slide.addEventListener('click', () => {
      popupImg.src = img.src;
      popup.style.display = 'flex';
      requestAnimationFrame(() => popup.classList.add('show'));
      isPaused = true;
    });
  });

  popup.addEventListener('click', () => {
    popup.classList.remove('show');
    setTimeout(() => {
      popup.style.display = 'none';
      isPaused = false;
    }, 500);
  });
}

// === INITIALIZE ON LOAD ===
window.addEventListener('load', () => {
  makeCardsFlippable();
  initializeGSAPSlider();
});

// === PARALLAX EFFECT FOR HERO ===
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const heroBlur = document.querySelector('.hero-blur .blur-bg');
  
  if (heroBlur) {
    heroBlur.style.transform = `scale(1.1) translateY(${scrolled * 0.5}px)`;
  }
});

// === RANDOM PARTICLE EFFECT ON HOVER ===
document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.querySelector('.gallery');
  
  if (gallery) {
    gallery.addEventListener('mousemove', (e) => {
      if (Math.random() < 0.5) {
        createParticle(e.clientX, e.clientY);
      }
    });
  }
});

function createParticle(x, y) {
  const particle = document.createElement('div');
  particle.style.position = 'fixed';
  particle.style.left = x + 'px';
  particle.style.top = y + 'px';
  particle.style.width = '6px';
  particle.style.height = '6px';
  particle.style.borderRadius = '50%';
  particle.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
  particle.style.pointerEvents = 'none';
  particle.style.zIndex = '9999';
  particle.style.animation = 'particleFade 1s ease-out forwards';
  
  document.body.appendChild(particle);
  
  setTimeout(() => particle.remove(), 1000);
}

// Add particle animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes particleFade {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// === KONAMI CODE EASTER EGG ===
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
  konamiCode.push(e.key);
  konamiCode = konamiCode.slice(-10);
  
  if (konamiCode.join('') === konamiSequence.join('')) {
    activateEasterEgg();
  }
});

function activateEasterEgg() {
  const message = document.createElement('div');
  message.style.position = 'fixed';
  message.style.top = '50%';
  message.style.left = '50%';
  message.style.transform = 'translate(-50%, -50%)';
  message.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  message.style.color = 'white';
  message.style.padding = '30px 50px';
  message.style.borderRadius = '20px';
  message.style.fontSize = '2rem';
  message.style.fontWeight = '700';
  message.style.zIndex = '99999';
  message.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5)';
  message.textContent = '🎉 UNNUR FIKI 2025 TERBAIK! 🎉';
  
  document.body.appendChild(message);
  
  // Create confetti
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.textContent = ['🎊', '🎉', '✨', '⭐', '🌟'][Math.floor(Math.random() * 5)];
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-50px';
      confetti.style.fontSize = '30px';
      confetti.style.animation = 'fall 3s linear forwards';
      confetti.style.zIndex = '99998';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }, i * 30);
  }
  
  setTimeout(() => message.remove(), 5000);
}

console.log('🎓 UNNUR FIKI 2025 Website Loaded Successfully! 🎓');


/* ================= GALERI KEGIATAN ================= */

// 1) Data foto (contoh). Ganti src sesuai file kamu di /images/galeri/...
const GALLERY = [
  // PKKMB
  { src: "images/galeri/pkkmb-1.jpg", category: "PKKMB", caption: "Pembukaan PKKMB 2025" },
  { src: "images/galeri/pkkmb-2.jpg", category: "PKKMB", caption: "Sesi materi & diskusi" },
  // OSJUR
  { src: "images/galeri/osjur-1.jpg", category: "OSJUR", caption: "OSJUR: pengenalan prodi" },
  { src: "images/galeri/osjur-2.jpg", category: "OSJUR", caption: "Tour lab & studio" },
  // OUTBOND
  { src: "images/galeri/outbond-1.jpg", category: "OUTBOND", caption: "Outbond: team building" },
  { src: "images/galeri/outbond-2.jpg", category: "OUTBOND", caption: "Games di lapangan" }
];

// 2) Inisialisasi saat DOM siap
document.addEventListener("DOMContentLoaded", () => {
  initGallery();
});

function initGallery() {
  const grid = document.getElementById("gallery-grid");
  const empty = document.getElementById("gallery-empty");
  const filters = document.querySelectorAll("#gallery-filters .gfilter");
  if (!grid) return;

  // render awal
  renderGallery("ALL");

  // klik filter
  filters.forEach(btn => {
    btn.addEventListener("click", () => {
      filters.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderGallery(btn.dataset.filter);
    });
  });

  function renderGallery(category) {
    const list = category === "ALL" ? GALLERY : GALLERY.filter(i => i.category === category);
    grid.innerHTML = "";
    empty.hidden = list.length > 0;

    list.forEach(item => grid.appendChild(makeGalleryItem(item)));
  }

  function makeGalleryItem(item) {
    const card = document.createElement("div");
    card.className = "galeri-item";
    card.innerHTML = `
      <figure>
        <img 
          src="${item.src}" 
          alt="${item.caption || item.category}" 
          loading="lazy"
        >
      </figure>
      <div class="galeri-tag">${item.category}</div>
      ${item.caption ? `<figcaption class="galeri-cap">${item.caption}</figcaption>` : ""}
    `;

    // klik untuk zoom (pakai popup global yang sudah ada)
    const img = card.querySelector("img");
    img.addEventListener("click", () => openGalleryPopup(item.src, item.caption));
    return card;
  }
}

// 3) Lightbox: pakai popup global (#popup) yang sudah ada dari slider
function openGalleryPopup(src, caption = "") {
  const popup = document.getElementById("popup"); 
  const img = popup?.querySelector("img");
  if (!popup || !img) return;
  img.src = src;
  img.alt = caption || "Preview";
  popup.classList.add("show");
  popup.setAttribute("aria-hidden", "false");
}
