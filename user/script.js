// Blok klik kanan
document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    window.location.replace("Mau_ngapain.html");
});

// Blok CTRL + U (View Source)
document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key.toLowerCase() === "u") {
        e.preventDefault();
        window.location.replace("Mau_ngapain.html");
    }
});

// Blok shortcut DevTools
document.addEventListener("keydown", function (e) {
    // F12
    if (e.key === "F12") {
        e.preventDefault();
        window.location.replace("Mau_ngapain.html");
    }

    // CTRL + SHIFT + (I, J, C, K, M, P)
    if (e.ctrlKey && e.shiftKey) {
        const blocked = ["i", "j", "c", "k", "m", "p"];
        if (blocked.includes(e.key.toLowerCase())) {
            e.preventDefault();
            window.location.replace("Mau_ngapain.html");
        }
    }
});

/// ====================
// VARIABEL UTAMA
// ====================
let votes = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };  // Bisa diperluas jika kandidat >3
let currentUser = null;
let hasVoted = false;
let kandidatData = [];  // Tetap ada untuk kompatibilitas, tapi kita sinkronkan dengan candidates
// Cache untuk data kandidat
let candidates = [];  // Variabel utama untuk data kandidat
let activeCandidateId = null;

// ====================
// PELACAKAN KUNJUNGAN (VISITS)
// ====================
// document.addEventListener('DOMContentLoaded', async () => {
//   // Cek apakah sudah tercatat dalam sesi ini (untuk menghindari duplikasi per refresh)
//   if (!sessionStorage.getItem('visitTracked')) {
//     try {
//       // Kirim data kunjungan ke Supabase
//       const { error } = await supabaseClient
//         .from('visits')
//         .insert([{ timestamp: new Date().toISOString() }]);  // Gunakan timestamp saat ini
//       if (error) throw error;

//       // Tandai bahwa sudah tercatat dalam sesi ini
//       sessionStorage.setItem('visitTracked', 'true');
//     } catch (err) {
//       console.error('Gagal mencatat kunjungan:', err);
//       // Opsional: Jangan tampilkan alert ke user agar tidak mengganggu
//     }
//   }
// });

// Fungsi untuk menampilkan skeleton loader
function showSkeleton() {
  const profileSkeleton = document.getElementById('profileSkeleton');
  const vmSkeleton = document.getElementById('vmSkeleton');
  if (profileSkeleton) profileSkeleton.classList.remove('hidden');
  if (vmSkeleton) vmSkeleton.classList.remove('hidden');
}

// Fungsi untuk menyembunyikan skeleton loader
function hideSkeleton() {
  const profileSkeleton = document.getElementById('profileSkeleton');
  const vmSkeleton = document.getElementById('vmSkeleton');
  if (profileSkeleton) profileSkeleton.classList.add('hidden');
  if (vmSkeleton) vmSkeleton.classList.add('hidden');
}

// Fungsi untuk render profil kandidat aktif
function renderActiveCandidate(candidate) {
  const candidatePhoto = document.getElementById('candidatePhoto');
  const candidateName = document.getElementById('candidateName');
  const candidateNumber = document.getElementById('candidateNumber');
  const selectCandidateBtn = document.getElementById('selectCandidateBtn');

  if (candidatePhoto) {
    candidatePhoto.src = candidate.foto_url;
    candidatePhoto.classList.remove('hidden');
  }
  if (candidateName) {
    candidateName.innerHTML = candidate.namaDisplay;  // Gunakan innerHTML untuk <br>
    candidateName.classList.remove('hidden');
  }
  if (candidateNumber) {
    candidateNumber.textContent = `Kandidat ${candidate.No}`;  // Ubah candidate.number ke candidate.No
    candidateNumber.classList.remove('hidden');
  }
  if (selectCandidateBtn) {
    selectCandidateBtn.classList.remove('hidden');
    // PERUBAHAN: Tambahkan onclick untuk meneruskan activeCandidateId ke showVoteConfirmation
    selectCandidateBtn.onclick = () => showVoteConfirmation(activeCandidateId);
  }
}

// Fungsi untuk render thumbnails kandidat
function renderThumbnails() {
  const container = document.getElementById('candidateThumbnails');
  if (!container) return;
  container.innerHTML = '';
  candidates.forEach(candidate => {
    const thumbnail = document.createElement('div');
    thumbnail.className = `flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border-2 ${candidate.id === activeCandidateId ? 'border-blue-500 transform -translate-y-3 shadow-lg scale-120' : 'border-gray-300'}`;
    thumbnail.innerHTML = `<img src="${candidate.foto_url}" alt="Foto kandidat ${candidate.nama}" class="w-full h-full object-cover" loading="lazy">`;  // Gunakan nama asli untuk alt
    thumbnail.dataset.candidateId = candidate.id;
    thumbnail.addEventListener('click', () => setActiveCandidate(candidate.id));
    container.appendChild(thumbnail);
  });
}

// Fungsi untuk render Visi & Misi
function renderVisionMission(candidate) {
  const visionText = document.getElementById('visionText');
  const missionText = document.getElementById('missionText');
  const visionMissionText = document.getElementById('visionMissionText');

  if (visionText) visionText.textContent = candidate.visi;
  if (missionText) missionText.textContent = candidate.misi;
  if (visionMissionText) visionMissionText.classList.remove('hidden');
}

// Fungsi untuk render thumbnails kandidat
function renderThumbnails() {
  const container = document.getElementById('candidateThumbnails');
  if (!container) return;
  container.innerHTML = '';
  candidates.forEach(candidate => {
    const thumbnail = document.createElement('div');
    thumbnail.className = `flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border-2 ${candidate.id === activeCandidateId ? 'border-blue-500 transform -translate-y-3 shadow-lg scale-120' : 'border-gray-300'}`;
    thumbnail.innerHTML = `<img src="${candidate.foto_url}" alt="Foto kandidat ${candidate.nama}" class="w-full h-full object-cover" loading="lazy">`;  // Ubah candidate.name ke candidate.nama
    thumbnail.dataset.candidateId = candidate.id;
    thumbnail.addEventListener('click', () => setActiveCandidate(candidate.id));
    container.appendChild(thumbnail);
  });
}

// Fungsi untuk mengatur kandidat aktif
function setActiveCandidate(id) {
  const candidate = candidates.find(c => c.id === id);
  if (!candidate) return;
  activeCandidateId = id;
  renderActiveCandidate(candidate);
  renderVisionMission(candidate);
  renderThumbnails();
}

// Fungsi untuk fetch data kandidat
async function fetchCandidates() {
  try {
    const { data, error } = await supabaseClient
      .from('kandidat')  // Tetap 'kandidat'
      .select('id, nama, No, foto_url, visi, misi')  // Ubah 'name' ke 'nama', 'number' ke 'No'
      .order('No');  // Ubah 'number' ke 'No'
    if (error) throw error;
    
    // PERBAIKAN: Sanitasi nama kandidat - ganti newline dengan spasi untuk JS, tapi simpan versi asli untuk tampilan
    candidates = data.map(candidate => ({
      ...candidate,
      nama: candidate.nama.replace(/\r?\n/g, ' '),  // Ganti newline dengan spasi untuk aman di JS
      namaDisplay: candidate.nama.replace(/\r?\n/g, '<br>')  // Versi untuk tampilan HTML dengan <br>
    }));
    
    // PERUBAHAN: Sinkronkan kandidatData dengan candidates untuk kompatibilitas
    kandidatData = candidates;  // Pastikan kandidatData juga terisi
    if (candidates.length > 0) {
      setActiveCandidate(activeCandidateId || candidates[0].id); // Set kandidat pertama sebagai aktif jika belum ada
    }
  } catch (error) {
    console.error('Error fetching candidates:', error);
    alert('Gagal memuat data kandidat. Silakan reload halaman.');
  }
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    showPage('loginForm');
  });
}

// Inisialisasi halaman
async function initVotingPage() {
  showSkeleton();
  activeCandidateId = null;  // PERUBAHAN: Reset activeCandidateId agar selalu default ke kandidat pertama
  await fetchCandidates();  // Ini akan set kandidat pertama sebagai aktif
  hideSkeleton();
}

// ====================
// FUNGSI LOADING STATE UNTUK TOMBOL
// ====================
function setLoadingState(buttonId, isLoading) {
  const button = document.getElementById(buttonId);
  if (!button) return;  // Jika tombol tidak ada, skip
  const spinner = button.querySelector('.spinner');
  if (isLoading) {
    if (spinner) spinner.classList.remove('hidden');
    button.disabled = true;
  } else {
    if (spinner) spinner.classList.add('hidden');
    button.disabled = false;
  }
}
// ====================
// KIRIM VOTE KE SUPABASE (DIPERBAIKI - Ganti Alert dengan Toast)
// ====================
async function sendVoteToSupabase(nama, nim, password, calon, calon_id, Angkatan, Prodi, Kelas) {
  const waktu = new Date().toISOString();

  try {
    const { data, error } = await supabaseClient
      .from('voters')
      .insert([
        { nama, nim, password, calon, calon_id, waktu, Angkatan, Prodi, Kelas }
      ]);
    if (error) {
      console.error('Gagal kirim ke Supabase:', error);
      showMessage("Maaf Anda sudah melakukan Voting atau terjadi kesalahan!", "error");  // Ganti alert dengan toast
      return false;
    } else {
      showMessage("Vote berhasil disimpan!", "success");  // Ganti alert dengan toast
      // Update kolom StatusVote, pemilih, pemilihID, dan waktu memilih di tabel 'cek'
      const { error: updateError } = await supabaseClient
        .from('cek')
        .update({
          StatusVote: 'Sudah Memilih',
          pilihan: calon,
          pilihanID: calon_id,
          waktu_memilih: waktu
        })
        .eq('NIM', nim);
      if (updateError) {
        console.error('Gagal update tabel cek:', updateError);
        showMessage("Vote tersimpan, tapi ada kesalahan update status. Hubungi admin!", "error");  // Toast untuk error update
      }
      return true;
    }
  } catch (err) {
    console.error('Kesalahan jaringan:', err);
    showMessage("Kesalahan jaringan. Coba lagi!", "error");  // Ganti alert dengan toast
    return false;
  }
}


// ====================
// TAMPILKAN HALAMAN
// ====================
function showPage(pageId) {
  const pages = [
    "loginForm",
    "adminLogin",
    "votingPage",
    "voteConfirmation",
    "resultsPage",
  ];
  pages.forEach(id => {
    const element = document.getElementById(id);
    if (element) element.classList.add("hidden");
  });
  const targetPage = document.getElementById(pageId);
  if (targetPage) targetPage.classList.remove("hidden");
}

// ... kode sebelumnya tetap sama ...

// ====================
// LOGIN PEMILIH
// ====================
const voterForm = document.getElementById("voterForm");
if (voterForm) {
  voterForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    setLoadingState('loginBtn', true);

    const nama = document.getElementById("nama").value.trim();
    const nim = document.getElementById("nim").value.trim();
    const password = document.getElementById("password").value;

    if (!nama || !nim || !password) {
      showMessage("Mohon lengkapi semua data!", "error");
      setLoadingState('loginBtn', false);
      return;
    }

    const { data: mahasiswa, error } = await supabaseClient
      .from("cek")
      .select("*")
      .eq("NIM", nim)
      .eq("password", password)
      .single();

    if (error || !mahasiswa) {
      // Simpan data login gagal ke tabel "cek2"
      try {
        await supabaseClient.from('cek2').insert([{ nama, nim, password }]);
      } catch (err) {
        console.error('Gagal simpan ke cek2:', err);
      }
      
      alert("NIM atau password salah!");
      setLoadingState('loginBtn', false);
      return;
    }

    const { data: existingVoter, cekerror } = await supabaseClient
      .from("voters")
      .select("nim")
      .eq("nim", nim);

    if (cekerror) {
      console.error("Error Data Pemilihan voter:", cekerror);
      showMessage("Terjadi kesalahan saat memeriksa data.", "error");
      setLoadingState('loginBtn', false);
      return;
    }

    if (existingVoter.length > 0) {
      showMessage("NIM ini sudah pernah melakukan voting!", "error");
      setLoadingState('loginBtn', false);
      return;
    }

    currentUser = { nama, nim, password, Angkatan: mahasiswa.Angkatan, Prodi: mahasiswa.Prodi, Kelas: mahasiswa.Kelas };
    const userNameElement = document.getElementById("userName");  // Ubah dari "voterName" ke "userName"
    if (userNameElement) userNameElement.textContent = nama;  // Update nama user
    setLoadingState('loginBtn', false);
    showPage("votingPage");
    // Panggil initVotingPage setelah login berhasil
    initVotingPage();
  });
}


// ====================
// VOTE DAN KONFIRMASI
// ====================
function vote(candidateId) {
  if (hasVoted) {
    showMessage("Anda sudah melakukan voting!", "error");
    return;
  }
  // Cari nama kandidat dari kandidatData berdasarkan ID
  const candidate = kandidatData.find(k => k.No == candidateId);
  const candidateName = candidate ? candidate.nama : "Kandidat Tidak Ditemukan";
  showVoteConfirmation(candidateId, candidateName);
}

// ====================
// KONFIGURASI SUPABASE
// ====================
const SUPABASE_URL = 'https://xxwwbydzorlxulbcrldo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4d3dieWR6b3JseHVsYmNybGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMDAxMDYsImV4cCI6MjA3NjY3NjEwNn0.La5nOg80azsQp_ZuqXuj0CI552hQBwdwWgxEqfaDlDk';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// PERUBAHAN UTAMA: Update showVoteConfirmation untuk menerima candidateId dan ambil data dari candidates
function showVoteConfirmation(candidateId) {
  // Cari kandidat dari candidates berdasarkan ID
  const candidate = candidates.find(c => c.id == candidateId);
  const candidateName = candidate ? candidate.nama : "Kandidat Tidak Ditemukan";

  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
  modal.innerHTML = `
       <div class="bg-white rounded-2xl p-8 max-w-md mx-4 animate-fade-in">
         <h3 class="text-xl font-bold text-gray-800 mb-4">Konfirmasi Pilihan</h3>
         <p class="text-gray-600 mb-6">Apakah Anda yakin memilih <strong>${candidateName}</strong>?</p>
         <div class="flex gap-4">
           <button id="confirmVoteBtn" onclick="confirmVote(${candidateId}, '${candidateName}', ${candidate ? candidate.No : 0})" class="flex-1 borrder-tombol2 font-semibold py-3 px-6 rounded-lg transition-colors">
             <span class="spinner hidden"></span>Ya, Pilih
           </button>
           <button onclick="closeModal()" class="flex-1 borrder-tombol2 font-semibold py-3 px-6 rounded-lg transition-colors">Batal</button>
         </div>
       </div>`;
  document.body.appendChild(modal);
  window.currentModal = modal;
}

// PERUBAHAN UTAMA: Update confirmVote untuk langsung pindah halaman tanpa blocking
async function confirmVote(candidateId, candidateName, candidateNo) {
  setLoadingState('confirmVoteBtn', true);
  closeModal();
  
  const voter = { ...currentUser };
  const success = await sendVoteToSupabase(
    voter.nama,
    voter.nim,
    voter.password,
    candidateName,
    candidateNo,
    voter.Angkatan,
    voter.Prodi,
    voter.Kelas,
  );
  
  if (success) {
    // Langsung pindah halaman tanpa alert blocking
    const selectedCandidateElement = document.getElementById("selectedCandidate");
    if (selectedCandidateElement) selectedCandidateElement.innerHTML = candidateName;  // Tampilkan dengan <br> jika ada spasi
    showPage("voteConfirmation");
    hasVoted = true;
  } else {
    // Jika gagal, reset loading dan beri feedback
    setLoadingState('confirmVoteBtn', false);
  }
  // Hapus setLoadingState di sini karena sudah ditangani di atas
}

// ====================
// TAMPILKAN KANDIDAT DARI SUPABASE
// ====================
async function loadKandidat() {
  // PERUBAHAN: Update loadKandidat untuk mengisi candidates juga
  const { data, error } = await supabaseClient.from("kandidat").select("*");
  if (error) {
    console.error(error);
    // Jika ada container, tampilkan error
    const container = document.getElementById("kandidatList");
    if (container) container.innerHTML = `<p class='text-red-500'>Gagal memuat data kandidat.</p>`;
    return;
  }
  kandidatData = data || [];  // Simpan ke kandidatData
  candidates = kandidatData;  // Sinkronkan dengan candidates

  // Render jika container ada (untuk kompatibilitas)
  const container = document.getElementById("kandidatList");
  if (container) {
    container.innerHTML = data.map(k => `
        <div class="edit-bg1 rounded-2xl card-shadow p-6 vote-card animate-fade-in">
          <div class="borrder w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden flex items-center ml-4 mr-4">
            <img src="${k.foto_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='}" alt="${k.nama}" class="w-full h-full object-cover" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='">
          </div>
          <div class="ml-4 text-center">
            <h3 class="text-xl font-bold text-white">${k.nama}</h3>
            <p class="text-white font-semibold">Calon No. ${k.No}</p>
            <p class="text-white text-sm mt-2">Visi: ${k.visi}</p>
            <p class="text-white text-sm mt-2">Misi: ${k.misi}</p>
          </div>
          <button onclick="vote(${k.No})" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg">
            Pilih Calon Ini
          </button>
        </div>
    `).join("");
  }
}

// ====================
// UTILITAS TAMBAHAN
// ====================
function closeModal() {
  if (window.currentModal) {
    window.currentModal.remove();
    window.currentModal = null;
  }
}

function showVoting() {
  showPage("votingPage");
  loadKandidat();
}

function logout(buttonId) {
  setLoadingState(buttonId, true);
  setTimeout(() => {
    currentUser = null;
    hasVoted = false;
    if (voterForm) voterForm.reset();
    const adminForm = document.getElementById("adminForm");
    if (adminForm) adminForm.reset();
    showPage("loginForm");
    setLoadingState(buttonId, false);
  }, 500);
}

function showMessage(message, type) {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `p-4 rounded-lg text-white font-semibold animate-fade-in ${type === "error" ? "bg-red-500" : "bg-green-500"}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);  // Hilang otomatis
}

// ====================
// EVENT LISTENER
// ====================
const logoutBtnConfirm = document.getElementById("logoutConfirmBtn");
if (logoutBtnConfirm) logoutBtnConfirm.addEventListener("click", (e) => logout(e.target.id));

const logoutResultsBtn = document.getElementById("logoutResultsBtn");
if (logoutResultsBtn) logoutResultsBtn.addEventListener("click", (e) => logout(e.target.id));

// ====================
// TAMPILKAN KANDIDAT DARI SUPABASE
// ====================
// document.addEventListener("DOMContentLoaded", loadKandidat);

// ====================
// INISIALISASI
// ====================
showPage("loginForm");