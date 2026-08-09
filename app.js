
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const demoPosts = [
  {id:1,user:"maya",caption:"Golden hour ✨",likes:234,img:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"},
  {id:2,user:"arjun",caption:"Weekend frames.",likes:482,img:"https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=900&q=80"},
  {id:3,user:"nina",caption:"City lights.",likes:197,img:"https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80"}
];
let state = JSON.parse(localStorage.getItem("socialhub_state") || "null") || {
  user:null, posts:demoPosts, messages:[
    {me:false,text:"Hey! Welcome to SocialHub 👋"},
    {me:true,text:"Thanks! This looks cool."}
  ]
};
let cameraStream=null, shareStream=null, micEnabled=true, camEnabled=true;

function save(){localStorage.setItem("socialhub_state",JSON.stringify(state))}
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1700)}

function start(){
  if(state.user){$("#authView").classList.add("hidden");$("#appView").classList.remove("hidden");renderAll()}
  else{$("#authView").classList.remove("hidden");$("#appView").classList.add("hidden")}
}
$("#loginBtn").onclick=()=>{
  const name=$("#nameInput").value.trim();
  const email=$("#emailInput").value.trim();
  const pass=$("#passInput").value;
  if(!name||!email||pass.length<4){toast("Enter username, email and 4+ character password");return}
  state.user={name,email};save();start();toast("Welcome @"+name);
};
$("#logoutBtn").onclick=async()=>{await stopMedia();state.user=null;save();start()};

function go(id){
  $$(".page").forEach(p=>p.classList.toggle("active",p.id===id));
  $$(".nav").forEach(n=>n.classList.toggle("active",n.dataset.go===id));
  window.scrollTo({top:0,behavior:"smooth"});
  if(id==="profile") renderProfile();
}
$$("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));

function renderStories(){
  const users=["You","maya","arjun","nina","sam","riya"];
  $("#stories").innerHTML=users.map(u=>`<div class="story"><div class="ring"><div class="avatar">${u[0]}</div></div>${u}</div>`).join("");
}
function postHTML(p){
  return `<article class="post" data-id="${p.id}">
    <div class="post-head"><div class="avatar">${p.user[0].toUpperCase()}</div><b>@${esc(p.user)}</b></div>
    ${p.img?`<img class="post-image" src="${esc(p.img)}" alt="post image" onerror="this.outerHTML='<div class=&quot;placeholder&quot;>📷</div>'">`:`<div class="placeholder">📷</div>`}
    <div class="post-actions"><button class="like" aria-label="Like">♡</button><button aria-label="Comment">◯</button><button aria-label="Share">⌁</button></div>
    <div class="post-body"><div class="likes">${p.likes||0} likes</div><div class="caption"><b>@${esc(p.user)}</b> ${esc(p.caption)}</div></div>
  </article>`;
}
function renderFeed(){
  $("#feed").innerHTML=state.posts.map(postHTML).join("");
  $$(".like").forEach(btn=>btn.onclick=()=>{
    const id=+btn.closest(".post").dataset.id;
    const p=state.posts.find(x=>x.id===id); p.likes=(p.likes||0)+1; btn.textContent="♥";save();renderFeed();
  });
}
$("#publishBtn").onclick=()=>{
  const cap=$("#postCaption").value.trim(), img=$("#postImage").value.trim();
  if(!cap && !img){toast("Add a caption or image");return}
  state.posts.unshift({id:Date.now(),user:state.user.name,caption:cap||"New post",img,likes:0});
  save();$("#postCaption").value="";$("#postImage").value="";renderAll();go("home");toast("Post published");
};
function renderReels(){
  $("#reelList").innerHTML=state.posts.slice(0,6).map(p=>`<div class="reel">
    ${p.img?`<img src="${esc(p.img)}" alt="">`:`<div style="font-size:70px">▶</div>`}
    <div class="reel-info"><b>@${esc(p.user)}</b><br>${esc(p.caption)}</div>
    <div class="reel-side">♡<br>◯<br>⌁</div>
  </div>`).join("");
}
function renderMessages(){
  $("#messagesList").innerHTML=state.messages.map(m=>`<div class="bubble ${m.me?"me":""}">${esc(m.text)}</div>`).join("");
  $("#messagesList").scrollTop=$("#messagesList").scrollHeight;
}
$("#sendMessageBtn").onclick=sendMsg;
$("#messageInput").addEventListener("keydown",e=>{if(e.key==="Enter")sendMsg()});
function sendMsg(){
  const t=$("#messageInput").value.trim();if(!t)return;
  state.messages.push({me:true,text:t});$("#messageInput").value="";save();renderMessages();
}
function renderProfile(){
  if(!state.user)return;
  $("#profileName").textContent="@"+state.user.name;
  $("#avatarBig").textContent=state.user.name[0].toUpperCase();
  const own=state.posts.filter(p=>p.user===state.user.name);
  $("#postCount").textContent=own.length;
  $("#profileGrid").innerHTML=own.map(p=>`<div class="grid-item">${p.img?`<img src="${esc(p.img)}">`:"📷"}</div>`).join("");
}
$("#searchInput").oninput=e=>{
  const q=e.target.value.toLowerCase().trim();
  const arr=!q?state.posts:state.posts.filter(p=>(p.user+" "+p.caption).toLowerCase().includes(q));
  $("#searchResults").innerHTML=arr.map(p=>`<div class="grid-item">${p.img?`<img src="${esc(p.img)}">`:"📷"}</div>`).join("");
};

async function ensureCamera(){
  if(cameraStream) return cameraStream;
  if(!navigator.mediaDevices?.getUserMedia){toast("Camera not supported here");return null}
  try{
    cameraStream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
    $("#localVideo").srcObject=cameraStream; return cameraStream;
  }catch(e){toast("Camera/mic permission denied");return null}
}
$("#cameraBtn").onclick=async()=>{
  const s=await ensureCamera(); if(!s)return;
  camEnabled=!camEnabled;s.getVideoTracks().forEach(t=>t.enabled=camEnabled);
  $("#cameraBtn").textContent=camEnabled?"Camera On":"Camera Off";
};
$("#micBtn").onclick=async()=>{
  const s=await ensureCamera(); if(!s)return;
  micEnabled=!micEnabled;s.getAudioTracks().forEach(t=>t.enabled=micEnabled);
  $("#micBtn").textContent=micEnabled?"Mic On":"Mic Off";
};
$("#shareBtn").onclick=async()=>{
  if(!navigator.mediaDevices?.getDisplayMedia){toast("Screen share is not supported in this browser");return}
  try{
    shareStream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true});
    $("#shareVideo").srcObject=shareStream;
    shareStream.getVideoTracks()[0].addEventListener("ended",()=>{$("#shareVideo").srcObject=null;shareStream=null});
    toast("Screen sharing started");
  }catch(e){toast("Screen share cancelled")}
};
$("#endCallBtn").onclick=async()=>{await stopMedia();go("messages");toast("Call ended")};
async function stopMedia(){
  [cameraStream,shareStream].forEach(s=>s?.getTracks().forEach(t=>t.stop()));
  cameraStream=shareStream=null;$("#localVideo").srcObject=null;$("#shareVideo").srcObject=null;
}
function renderAll(){renderStories();renderFeed();renderReels();renderMessages();renderProfile();$("#searchInput").dispatchEvent(new Event("input"))}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
start();
