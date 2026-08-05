/* ============================================================
   WishAura — script.js
   ============================================================ */
(() => {
  "use strict";

  // ------- Utilities -------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const toast = (msg) => {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("show"), 2400);
  };

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ------- Year -------
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ------- Reveal on scroll -------
  const revealTargets = $$(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          e.target.style.transitionDelay = `${Math.min(i, 6) * 90}ms`;
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.14 }
  );
  revealTargets.forEach((el) => io.observe(el));
  // Reveal hero on load without waiting for intersection
  requestAnimationFrame(() => {
    $$(".hero .reveal").forEach((el, i) => {
      el.style.transitionDelay = `${i * 90}ms`;
      el.classList.add("in");
    });
  });

  // ------- Counter animation -------
  const counters = $$("[data-count]");
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const dur = 1400;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.floor(target * eased);
        el.textContent = val >= 1000 ? val.toLocaleString() : val;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach((c) => counterIO.observe(c));

  // ------- Ripple -------
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-primary, .btn-ghost, .btn-share, .chip, .theme-card");
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const r = document.createElement("span");
    r.className = "ripple";
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = size + "px";
    r.style.left = e.clientX - rect.left - size / 2 + "px";
    r.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(r);
    setTimeout(() => r.remove(), 700);
  });

  // ------- Tilt (3D) -------
  const initTilt = (el) => {
    if (!el) return;
    const wrap = el.closest(".hero-card-wrap") || el.parentElement;
    const strength = 8;
    let raf = 0;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `rotateY(${x * strength}deg) rotateX(${-y * strength}deg) translateZ(0)`;
      });
    };
    const reset = () => (el.style.transform = "");
    (wrap || el).addEventListener("mousemove", onMove);
    (wrap || el).addEventListener("mouseleave", reset);
  };
  initTilt($("#heroTilt"));
  initTilt($("#cardTilt"));

  // ------- Particles (soft firefly field) -------
  (() => {
    const canvas = $("#particles");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, dots = [];
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      W = canvas.width = window.innerWidth * DPR;
      H = canvas.height = window.innerHeight * DPR;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      const count = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 32000));
      dots = new Array(count).fill(0).map(() => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: (Math.random() * 1.6 + 0.4) * DPR,
        vx: (Math.random() - 0.5) * 0.2 * DPR,
        vy: (Math.random() - 0.5) * 0.2 * DPR,
        a: Math.random() * 0.6 + 0.2,
        p: Math.random() * Math.PI * 2,
      }));
    };
    resize();
    window.addEventListener("resize", resize);

    const tick = (t) => {
      ctx.clearRect(0, 0, W, H);
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > W) d.vx *= -1;
        if (d.y < 0 || d.y > H) d.vy *= -1;
        const pulse = 0.6 + Math.sin(t / 800 + d.p) * 0.4;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 214, 165, ${d.a * pulse})`;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  })();

  // ------- Confetti burst -------
  const confetti = (() => {
    const canvas = $("#confetti");
    if (!canvas) return () => {};
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, parts = [], running = false;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      W = canvas.width = window.innerWidth * DPR;
      H = canvas.height = window.innerHeight * DPR;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    const palette = ["#ffd6a5", "#ff8fb1", "#9a8cff", "#7ee1ff", "#a3f7bf", "#ffea7a"];

    const spawn = (n = 160) => {
      for (let i = 0; i < n; i++) {
        parts.push({
          x: W / 2 + (Math.random() - 0.5) * 200 * DPR,
          y: H * 0.35,
          vx: (Math.random() - 0.5) * 10 * DPR,
          vy: (Math.random() * -14 - 4) * DPR,
          g: 0.35 * DPR,
          size: (Math.random() * 6 + 4) * DPR,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.3,
          color: palette[(Math.random() * palette.length) | 0],
          life: 220 + Math.random() * 80,
        });
      }
    };

    const tick = () => {
      running = true;
      ctx.clearRect(0, 0, W, H);
      parts = parts.filter((p) => p.life > 0);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.vy += p.g; p.rot += p.vr; p.life--;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 60));
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (parts.length) requestAnimationFrame(tick); else running = false;
    };

    return (n) => { spawn(n); if (!running) requestAnimationFrame(tick); };
  })();

  // ------- Theme switching -------
  const applyTheme = (theme) => {
    document.body.dataset.theme = theme;
    const live = $("#liveCard"); if (live) live.dataset.theme = theme;
    $$(".chip").forEach((c) => c.classList.toggle("is-active", c.dataset.theme === theme));
    localStorage.setItem("wa-theme", theme);
  };
  $$(".chip[data-theme], .theme-card[data-theme]").forEach((el) =>
    el.addEventListener("click", () => applyTheme(el.dataset.theme))
  );
  const savedTheme = localStorage.getItem("wa-theme");
  if (savedTheme) applyTheme(savedTheme);

  // ------- Form: live preview -------
  const nameInput = $("#name");
  const msgInput = $("#message");
  const msgCount = $("#msgCount");
  const liveName = $("#liveName");
  const liveMsg = $("#liveMsg");
  const photoInput = $("#photo");
  const livePhoto = $("#livePhoto");
  const drop = $("#drop");
   

  const updatePreview = () => {
    const n = (nameInput?.value || "").trim();
    const m = (msgInput?.value || "").trim();
    if (liveName) liveName.textContent = n || "Your name";
    if (liveMsg) liveMsg.textContent = m || "Your message will appear right here, live as you type.";
    if (msgCount) msgCount.textContent = m.length;
  };
  nameInput?.addEventListener("input", updatePreview);
  msgInput?.addEventListener("input", updatePreview);

// ===== Load card from shared URL =====

let uploadedPhoto = "";

const params = new URLSearchParams(window.location.search);

const sharedName = params.get("name");
const sharedMsg = params.get("msg");
const sharedTheme = params.get("theme");
const sharedPhoto = params.get("photo");

if (sharedName) nameInput.value = sharedName;
if (sharedMsg) msgInput.value = sharedMsg;

updatePreview();

if (sharedTheme) {
    applyTheme(sharedTheme);
}

if (sharedPhoto) {

    uploadedPhoto = sharedPhoto;

    livePhoto.innerHTML = `
        <img
            src="${sharedPhoto}"
            alt="Birthday Photo"
            crossorigin="anonymous"
        >
    `;

}

if (params.has("name")) {

    document.body.classList.add("shared-mode");

    setTimeout(() => {

        const clone = document
            .getElementById("liveCard")
            .cloneNode(true);

        document
            .querySelector(".shared-card-holder")
            .appendChild(clone);

    },300);

}

  // Photo upload
 const setPhoto = async (file) => {

    if (!file || !file.type.startsWith("image/")) {
        toast("Please choose an image");
        return;
    }

    if (file.size > 8 * 1024 * 1024) {
        toast("Image must be under 8MB");
        return;
    }

    try {

        toast("Uploading photo...");

        const formData = new FormData();

        formData.append("file", file);
        formData.append("upload_preset", "wishaura");

        const response = await fetch(
            "https://api.cloudinary.com/v1_1/fa7k4nrn/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (!data.secure_url) {
            throw new Error("Upload Failed");
        }

        uploadedPhoto = data.secure_url;

        livePhoto.innerHTML = `
            <img
                src="${uploadedPhoto}"
                alt="Birthday Photo"
                crossorigin="anonymous"
            >
        `;

        toast("Photo uploaded successfully 🎉");

    } catch (err) {

        console.error(err);
        toast("Photo upload failed");

    }

};
  drop?.addEventListener("click", () => {
  photoInput?.click();
});

drop?.addEventListener("touchend", (e) => {
  e.preventDefault();
  photoInput?.click();
});

photoInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if(file){
    setPhoto(file);
  }
});

  // Reset
  $("#resetForm")?.addEventListener("click", () => {
    $("#wishForm").reset();
    livePhoto.innerHTML = `<svg viewBox="0 0 200 200" width="100%" height="100%"><defs><linearGradient id="lp2" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#ffd6a5"/><stop offset="1" stop-color="#ff8fb1"/></linearGradient></defs><rect width="200" height="200" fill="url(#lp2)"/><circle cx="100" cy="82" r="34" fill="#fff" opacity=".9"/><path d="M40 180c8-38 40-56 60-56s52 18 60 56z" fill="#fff" opacity=".9"/></svg>`;
    updatePreview();
    toast("Cleared");
  });

  // Generate
  $("#wishForm")?.addEventListener("submit", async (e) => {

e.preventDefault();

if (!nameInput.value.trim()) {
    nameInput.focus();
    toast("Add a name first");
    return;
}

const btn = $("#wishForm button[type='submit']");

const oldText = btn.innerHTML;

btn.disabled = true;

btn.innerHTML = "✨ Creating Magic...";

await new Promise(r=>setTimeout(r,1200));

updatePreview();

const card=$("#liveCard");

card.animate([
{
opacity:0,
transform:"translateY(40px) scale(.85)"
},
{
opacity:1,
transform:"translateY(0) scale(1)"
}
],{

duration:900,

easing:"cubic-bezier(.18,.9,.25,1)"

});

confetti(260);

toast("🎉 Birthday Wish Created!");

 btn.innerHTML = oldText;
    btn.disabled = false;

    document.getElementById("downloadPng")?.classList.add("highlight");
    document.getElementById("shareNative")?.classList.add("highlight");

    setTimeout(() => {
        document.getElementById("downloadPng")?.classList.remove("highlight");
        document.getElementById("shareNative")?.classList.remove("highlight");
    }, 3000);

    document.getElementById("downloadJpg")?.classList.add("highlight");
    document.getElementById("shareNative")?.classList.add("highlight");

    setTimeout(() => {
        document.getElementById("downloadJpg")?.classList.remove("highlight");
        document.getElementById("shareNative")?.classList.remove("highlight");
    }, 3000);

});

function buildShareURL(){

    const url=new URL(location.origin+location.pathname);

    url.searchParams.set("name",nameInput.value.trim());

    url.searchParams.set("msg",msgInput.value.trim());

    url.searchParams.set("theme",document.getElementById("liveCard").dataset.theme);

    if(uploadedPhoto){

        url.searchParams.set("photo",uploadedPhoto);

    }

    return url.toString();

}
  // ------- Share -------

const buildShareText = () => {
    const n = nameInput?.value.trim() || "someone amazing";
    const m = msgInput?.value.trim() || "Wishing you the happiest birthday!";

    return `🎂 Happy Birthday, ${n}! ${m}`;
};

$("#shareWhatsapp")?.addEventListener("click", () => {

    window.open(
        "https://wa.me/?text=" +
        encodeURIComponent(buildShareText() + "\n\n" + buildShareURL()),
        "_blank"
    );

});

$("#shareCopy")?.addEventListener("click", async () => {

    try {

        await navigator.clipboard.writeText(buildShareURL());

        toast("Link copied!");

    } catch {

        toast("Couldn't copy");

    }

});

$("#shareNative")?.addEventListener("click", async () => {

    if (navigator.share) {

        try {

            await navigator.share({

                title: "WishAura",

                text: buildShareText(),

                url: buildShareURL()

            });

        } catch {}

    } else {

        try {

            await navigator.clipboard.writeText(buildShareURL());

            toast("Link copied!");

        } catch {

            toast("Sharing not supported");

        }

    }

});

  // ------- Download PNG / JPG -------
const downloadCard = async (type = "png") => {

    const card = document.getElementById("liveCard");
   await document.fonts.ready;

const img=card.querySelector("img");

if(img){

await img.decode().catch(()=>{});

}

    try {

        // Button Glow
        const btn = type === "png"
            ? document.getElementById("downloadPng")
            : document.getElementById("downloadJpg");

        btn.classList.add("glow");

        const dataUrl =
            type === "jpg"
                ? await htmlToImage.toJpeg(card, {
                    quality: 0.95,
                    pixelRatio: 3,
                    cacheBust: true
                })
                : await htmlToImage.toPng(card, {
                    pixelRatio: 3,
                    cacheBust: true
                });

        const a = document.createElement("a");
        a.href = dataUrl;

        a.download =
            `wishaura-${(nameInput?.value.trim() || "card")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")}.${type}`;

        document.body.appendChild(a);
        a.click();
        a.remove();

        toast("Downloaded Successfully 🎉");

        // Created Popup
        document.getElementById("createdPopup")?.classList.add("show");

        setTimeout(() => {
            document.getElementById("createdPopup")?.classList.remove("show");
            btn.classList.remove("glow");
        }, 2500);

    } catch (e) {

        console.error(e);
        toast("Download Failed ❌");

    }

};

document.getElementById("downloadPng").onclick = () => downloadCard("png");
document.getElementById("downloadJpg").onclick = () => downloadCard("jpg");

  // ------- Music (WebAudio ambient) -------
  const music = (() => {
    let ctx, master, timers = [], on = false;
    const notes = [523.25, 659.25, 783.99, 987.77, 1174.66]; // C5 E5 G5 B5 D6 pentatonic bells
    const play = (freq, when, dur = 1.6) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.value = 0;
      g.gain.linearRampToValueAtTime(0.11, when + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      o.connect(g).connect(master);
      o.start(when);
      o.stop(when + dur + 0.1);
    };
    const loop = () => {
      if (!on) return;
      const now = ctx.currentTime;
      for (let i = 0; i < 6; i++) {
        const n = notes[(Math.random() * notes.length) | 0];
        play(n, now + i * 0.6 + Math.random() * 0.2, 1.8);
      }
      timers.push(setTimeout(loop, 3600));
    };
    const start = async () => {
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = 0.35; master.connect(ctx.destination);
      }
      if (ctx.state === "suspended") await ctx.resume();
      on = true; loop();
    };
    const stop = () => {
      on = false; timers.forEach(clearTimeout); timers = [];
      if (ctx) ctx.suspend?.();
    };
    return { start, stop, isOn: () => on };
  })();

  const musicBtn = $("#musicToggle");
  const savedMusic = localStorage.getItem("wa-music") === "on";
  const setMusic = (state) => {
    if (state) { music.start(); musicBtn?.classList.add("is-on"); musicBtn?.setAttribute("aria-pressed", "true"); }
    else { music.stop(); musicBtn?.classList.remove("is-on"); musicBtn?.setAttribute("aria-pressed", "false"); }
    localStorage.setItem("wa-music", state ? "on" : "off");
  };
  musicBtn?.addEventListener("click", () => setMusic(!music.isOn()));
  // Never autoplay — respect saved preference but still require user gesture
  if (savedMusic) {
    const once = () => { setMusic(true); window.removeEventListener("pointerdown", once); };
    window.addEventListener("pointerdown", once, { once: true });
  }

  // ------- Small delight: confetti on nav CTA on first click -------
  document.addEventListener("click", (e) => {
    if (e.target.closest(".btn-primary")) confetti(80);
  });
})();

window.addEventListener("load",()=>{

const loader=document.getElementById("loader");
const hero=document.querySelector(".hero");

loader.classList.add("hide");

requestAnimationFrame(()=>{
    hero.classList.add("show");
});

});


if(window.innerWidth > 768){

const hero=document.querySelector(".hero");

document.addEventListener("mousemove",(e)=>{

if(!hero)return;

const x=(e.clientX/window.innerWidth-.5)*20;
const y=(e.clientY/window.innerHeight-.5)*20;

hero.style.transform=`translate(${x}px,${y}px)`;

});

}



document.querySelectorAll("button,.btn").forEach(btn=>{

btn.addEventListener("mousedown",()=>{

btn.style.transform="scale(.96)";

});

btn.addEventListener("mouseup",()=>{

btn.style.transform="";

});

btn.addEventListener("mouseleave",()=>{

btn.style.transform="";

});

});


