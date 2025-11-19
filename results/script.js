// ====================
// KONFIGURASI SUPABASE
// ====================
const SUPABASE_URL = 'https://xxwwbydzorlxulbcrldo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4d3dieWR6b3JseHVsYmNybGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMDAxMDYsImV4cCI6MjA3NjY3NjEwNn0.La5nOg80azsQp_ZuqXuj0CI552hQBwdwWgxEqfaDlDk';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ====================
// VARIABEL UTAMA UNTUK RESULTS
// ====================
let candidates = [];  // Data kandidat untuk results

// ====================
// FETCH DATA KANDIDAT
// ====================
async function fetchCandidates() {
    try {
        const { data, error } = await supabaseClient
            .from('kandidat')
            .select('id, nama, No, foto_url, visi, misi')
            .order('No');
        if (error) throw error;
        candidates = data;
    } catch (error) {
        console.error('Error fetching candidates:', error);
        alert('Gagal memuat data kandidat.');
    }
}

// ====================
// FUNGSI LOADING STATE UNTUK TOMBOL
// ====================
function setLoadingState(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (!button) return;
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
// UPDATE HASIL VOTING
// ====================
async function updateResults() {
    setLoadingState('refreshBtn', true);
    try {
        if (candidates.length === 0) {
            await fetchCandidates();
        }

        const { data, error } = await supabaseClient.from("voters").select("*");
        if (error) throw error;

        const counts = {};
        candidates.forEach(c => counts[c.No] = 0);
        data.forEach(row => {
            if (counts[row.calon_id] !== undefined) counts[row.calon_id]++;
        });

        const dummyCandidates = candidates.map(c => {
            const originalVotes = counts[c.No] || 0;
            const variation = Math.floor(Math.random() * 1) + 1;
            const dummyVotes = Math.max(0, originalVotes + variation);
            return {
                nama: "???",
                No: "???",
                foto_url: c.foto_url || "default.jpg",
                votes: dummyVotes
            };
        });

        const allCandidatesForResults = [...candidates, ...dummyCandidates];
        let total = Object.values(counts).reduce((a, b) => a + b, 0);
        dummyCandidates.forEach(dummy => {
            total += dummy.votes;
        });

        const totalVotesElement = document.getElementById("totalVotes");
        if (totalVotesElement) totalVotesElement.textContent = total;

        const shuffledCandidates = [...allCandidatesForResults];
        shuffleArray(shuffledCandidates);

        const resultsContainer = document.getElementById("resultsContainer");
        if (resultsContainer) {
            resultsContainer.innerHTML = shuffledCandidates.map(c => {
                const voteCount = counts[c.No] !== undefined ? counts[c.No] : (c.votes || 0);
                const percentage = total > 0 ? Math.round((voteCount / total) * 100) : 0;
                return `
          <div class="border border-gray-200 rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div class="w-12 h-12 mx-auto mb-4 mr-4 rounded-full overflow-hidden">
                  <img src="default.jpg" class="w-full h-full object-cover">
                </div>
                <div>
                  <h3 class="font-bold text-gray-800">  ???</h3>
                  <p class="text-sm text-gray-600">Calon No.  ???</p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-black" id="votes${c.No}">${voteCount}</div>
                <div class="text-sm text-gray-600" id="percentage${c.No}">${percentage}%</div>
              </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="bg-black h-3 rounded-full progress-bar" id="progress${c.No}" style="width: ${percentage}%"></div>
            </div>
          </div>
        `;
            }).join("");
        }
    } catch (error) {
        console.error("Gagal memuat hasil:", error);
        const resultsContainer = document.getElementById("resultsContainer");
        if (resultsContainer) {
            resultsContainer.innerHTML = "<p class='text-red-500'>Gagal memuat hasil voting. Periksa koneksi internet dan coba lagi.</p>";
        }
    } finally {
        setLoadingState('refreshBtn', false);
    }
}

// ====================
// SHUFFLE ARRAY
// ====================
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// ====================
// LOGOUT
// ====================
function logout(buttonId) {
    setLoadingState(buttonId, true);
    setTimeout(() => {
        // Redirect ke index.html atau halaman utama
        window.location.href = '/index.html';
        setLoadingState(buttonId, false);
    }, 500);
}

// ====================
// EVENT LISTENER
// ====================
const logoutResultsBtn = document.getElementById("logoutResultsBtn");
if (logoutResultsBtn) logoutResultsBtn.addEventListener("click", (e) => logout(e.target.id));

// ====================
// INISIALISASI
// ====================
document.addEventListener("DOMContentLoaded", () => {
    updateResults();  // Panggil langsung saat halaman load
});
