// chatbotAI dengan n8n
const chatBubble = document.getElementById("chatBubble");
const chatBox = document.getElementById("chatBox");
const chatContent = document.getElementById("chatContent");
const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const chatSpinner = document.getElementById("chatSpinner");

// Cek apakah greeting sudah dikirim dalam sesi ini (gunakan sessionStorage untuk persist selama tab aktif)
let greetingSent = sessionStorage.getItem('chatGreetingSent') === 'true';

// Toggle chat box
chatBubble.addEventListener("click", () => {
    const isOpening = chatBox.style.display === "none" || chatBox.style.display === "";
    chatBox.style.display = isOpening ? "flex" : "none";

    // Jika pertama kali membuka chat dalam sesi ini dan belum pernah dikirim greeting
    if (isOpening && !greetingSent) {
        setTimeout(() => {
            addMessage("haii apakah ada yang bisa saya bantu? silahkan ketik atau salin kata 'LIST' maka akan saya kirim list pertanyaan yang sudah disiapkan", "bot");
            greetingSent = true;
            sessionStorage.setItem('chatGreetingSent', 'true');
        }, 500); // Delay sedikit untuk efek
    }
});

// Fungsi untuk menambah pesan ke chat
function addMessage(text, sender) {
    const div = document.createElement("div");
    div.classList.add("msg", sender);

    // newline → <br>
    div.innerHTML = text.replace(/\n/g, "<br>");

    chatContent.appendChild(div);
    chatContent.scrollTop = chatContent.scrollHeight;
}

// Fungsi untuk mengirim pesan ke n8n
async function sendToN8n(message) {
    try {
        const response = await fetch('https://samfoxs.app.n8n.cloud/webhook-test/chatbot', {  // Ganti dengan URL webhook n8n Anda
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })  // Sesuaikan dengan format yang diharapkan n8n
        });
        const text = await response.text();
        return text || "Aduh error";  // Asumsi respons dari n8n adalah { "response": "teks" }
    } catch (error) {
        console.error('Error:', error);
        return "Maaf, chatbot sedang offline.";
    }
}

// Event kirim pesan
sendBtn.addEventListener("click", async () => {
    const text = input.value.trim();
    if (!text) return;

    // Pesan user
    addMessage(text, "user");

    // Tampilkan spinner loading
    chatSpinner.classList.remove('hidden');
    input.disabled = true;
    sendBtn.disabled = true;

    // Kirim ke n8n dan tunggu respons
    const botResponse = await sendToN8n(text);
    addMessage(botResponse, "bot");

    // Sembunyikan spinner
    chatSpinner.classList.add('hidden');
    input.disabled = false;
    sendBtn.disabled = false;

    input.value = "";
});

// Tambahkan event Enter untuk input
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendBtn.click();
    }
});

function setLoadingState(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (!button) return;
    const spinner = button.querySelector('.spinner');
    if (isLoading) {
        spinner.classList.remove('hidden');
        button.disabled = true;
    } else {
        spinner.classList.add('hidden');
        button.disabled = false;
    }
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('navbar-solid');
    } else {
        navbar.classList.remove('navbar-solid');
    }
});

// Smooth scroll for navbar links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        // Close mobile menu if open
        document.getElementById('mobile-menu').classList.add('hidden');
    });
});

// Hamburger menu toggle
document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
});

// Countdown timer to December 1, 2025
function updateCountdown() {
    const targetDate = new Date('2025-12-01T07:00:00').getTime();
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').innerText = days.toString().padStart(2, '0');
        document.getElementById('hours').innerText = hours.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = seconds.toString().padStart(2, '0');
    } else {
        document.getElementById('countdown').innerHTML = '<div class="text-xl">Pemilihan Telah Dimulai!</div>';
    }
}
setInterval(updateCountdown, 1000);
updateCountdown();

// Explore button scroll
document.getElementById('explore-btn').addEventListener('click', () => {
    document.getElementById('explore').scrollIntoView({ behavior: 'smooth' });
});

// Fade-in animation with IntersectionObserver
const observerOptions = {
    threshold: 0.1
};
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Panitia slider - Infinite loop to the right, showing 5 cards, center card highlighted
// const slider = document.getElementById('slider');
// const cards = slider.children;
// const cardWidth = 208; // w-48 + space-x-4 approx
// const totalOriginalCards = 21;
// const visibleCards = 3;

// Function to update center card (position 3 in visible 5 cards)
// function updateCenterCard() {
//     const scrollIndex = Math.floor(slider.scrollLeft / cardWidth);
//     const centerIndex = (scrollIndex + 3) % cards.length; // Center is offset by 3 for 5 visible
//     Array.from(cards).forEach((card, index) => {
//         card.classList.remove('center');
//         if (index === centerIndex) {
//             card.classList.add('center');
//         }
//     });
// }

// Auto-scroll every 3 seconds, infinite to the right
// setInterval(() => {
//     slider.scrollLeft += cardWidth;
//     // When reaching the end of duplicated cards, reset to start smoothly
//     if (slider.scrollLeft >= (totalOriginalCards * 3) * cardWidth) {
//         slider.scrollLeft = 0;
//     }
//     updateCenterCard();
// }, 3000);

// Navigation buttons
// document.getElementById('prev-btn').addEventListener('click', () => {
//     slider.scrollLeft -= cardWidth;
//     if (slider.scrollLeft < 0) {
//         slider.scrollLeft = (totalOriginalCards * 3 - 1) * cardWidth;
//     }
//     updateCenterCard();
// });

// document.getElementById('next-btn').addEventListener('click', () => {
//     slider.scrollLeft += cardWidth;
//     if (slider.scrollLeft >= (totalOriginalCards * 3) * cardWidth) {
//         slider.scrollLeft = 0;
//     }
//     updateCenterCard();
// });

// // Initial center update
// updateCenterCard();

// Contact form submission to Supabase
// Note: Replace with your actual Supabase URL and anon key
const SUPABASE_URL = 'https://xxwwbydzorlxulbcrldo.supabase.co'; // Placeholder: Ganti dengan URL Supabase Anda
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4d3dieWR6b3JseHVsYmNybGRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMDAxMDYsImV4cCI6MjA3NjY3NjEwNn0.La5nOg80azsQp_ZuqXuj0CI552hQBwdwWgxEqfaDlDk'; // Placeholder: Ganti dengan Anon Key Supabase Anda
const supabase = {
    from: (table) => ({
        insert: (data) => fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(data)
        }).then(res => res.json())
    })
};

document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoadingState('kirim', true);
    const nama = document.getElementById('nama').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const pesan = document.getElementById('pesan').value.trim();

    if (!nama || !subject || !pesan) {
        alert('Semua field harus diisi!');
        setLoadingState('kirim', false);
        return;
    }

    try {
        const { data, error } = await supabase.from('masukan').insert([{ Nama: nama, Subject: subject, Pesan: pesan }]);
        if (error) throw error;
        setLoadingState('kirim', false);
        alert('Pesan berhasil dikirim!');
        document.getElementById('contact-form').reset();
    }
    catch (error) {
        setLoadingState('kirim', false);
        alert('Pesan berhasil dikirim!');
        document.getElementById('contact-form').reset();
        // alert('Terjadi kesalahan: ' + error.message);
    }
});
