const audio = document.getElementById("audio");
const trackList = document.getElementById("trackList");
const releaseGrid = document.getElementById("releaseGrid");
const nowCover = document.getElementById("nowCover");
const nowTitle = document.getElementById("nowTitle");
const nowArtist = document.getElementById("nowArtist");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const playPause = document.getElementById("playPause");
let current = -1;

const fallback = "covers/default.svg";

function fmt(sec){
  if(!Number.isFinite(sec)) return "0:00";
  return `${Math.floor(sec/60)}:${String(Math.floor(sec%60)).padStart(2,"0")}`;
}
function render(){
  trackList.innerHTML = "";
  TRACKS.forEach((t,i)=>{
    const row=document.createElement("div");
    row.className="track";
    row.innerHTML=`
      <div class="track-num">${i+1}</div>
      <img class="thumb" src="${t.cover}" onerror="this.src='${fallback}'" alt="">
      <div><div class="track-title">${t.title}</div><div class="track-artist">${t.artist}</div></div>
      <div class="track-duration">${t.duration||""}</div>
      <button class="track-play">▶</button>`;
    row.addEventListener("click",()=>load(i,true));
    trackList.appendChild(row);
  });

  releaseGrid.innerHTML="";
  TRACKS.slice(0,4).forEach((t,i)=>{
    const card=document.createElement("article");
    card.className="release";
    card.innerHTML=`<img class="cover" src="${t.cover}" onerror="this.src='${fallback}'" alt=""><h3>${t.title}</h3><p>${t.type} · ${t.year}</p>`;
    card.onclick=()=>load(i,true);
    releaseGrid.appendChild(card);
  });
}
function load(i,autoplay=false){
  if(!TRACKS[i]) return;
  current=i;
  const t=TRACKS[i];
  audio.src=t.file;
  audio.load();
  nowCover.src=t.cover; nowCover.onerror=()=>nowCover.src=fallback;
  nowTitle.textContent=t.title; nowArtist.textContent=t.artist;
  document.querySelectorAll(".track").forEach((x,n)=>x.classList.toggle("active",n===i));
  if(autoplay) audio.play().catch(()=>{});
}
function updatePlay(){
  playPause.textContent=audio.paused ? "▶" : "Ⅱ";
}
playPause.onclick=()=>{ if(current<0) load(0); audio.paused?audio.play():audio.pause(); };
document.getElementById("prev").onclick=()=>load((current-1+TRACKS.length)%TRACKS.length,true);
document.getElementById("next").onclick=()=>load((current+1)%TRACKS.length,true);
document.getElementById("playAll").onclick=()=>load(0,true);
audio.addEventListener("play",updatePlay); audio.addEventListener("pause",updatePlay);
audio.addEventListener("timeupdate",()=>{
  if(audio.duration) progress.value=(audio.currentTime/audio.duration)*100;
  currentTime.textContent=fmt(audio.currentTime); duration.textContent=fmt(audio.duration);
});
progress.oninput=()=>{if(audio.duration) audio.currentTime=(progress.value/100)*audio.duration};
volume.oninput=()=>audio.volume=volume.value;
audio.volume=.8;
audio.addEventListener("ended",()=>{if(current+1<TRACKS.length) load(current+1,true)});
document.getElementById("localMusic").addEventListener("change",e=>{
  // Это временное добавление только на вашем устройстве.
  // Для публикации песни добавьте файл в music/ и запись в tracks.js.
  [...e.target.files].forEach(file=>{
    const url=URL.createObjectURL(file);
    TRACKS.push({title:file.name.replace(/\.[^/.]+$/,""),artist:"Ваш трек",year:"2026",type:"Local",duration:"",file:url,cover:fallback});
  });
  render();
});
document.getElementById("themeBtn").onclick=()=>{
  document.body.classList.toggle("light");
  document.getElementById("themeBtn").textContent=document.body.classList.contains("light")?"☀":"☾";
};
render();
