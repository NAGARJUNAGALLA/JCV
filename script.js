// ===== USERS (hashed passwords) =====
// Use SHA-256 hashed passwords
// Example: 'Pass@123' => hashed using SHA-256
const users = [
  {username:"user1", passwordHash:"008c70392e3abfbd0fa47bbc2ed96aa99bd49e159727fcba0f2e6abeb3a9d601"},
  {username:"user2", passwordHash:"d7a4e8e00f9ae70628dfe93a7aed7dd7e9fdb853e0d7d5f11d4c3a2a1ad9d4a1"},
  {username:"admin", passwordHash:"c8fed00eb2e87f1cee8e90ebbe870c190ac3848c49d92a9f4f7a1f42c75c2345"}
];

// ===== SHA-256 helper =====
async function sha256(message){
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
  return hashHex;
}

// ===== LOGIN =====
function login() {
  const u = document.getElementById("username").value.trim().toLowerCase();
  const p = document.getElementById("password").value.trim();

  // Direct username & password match for testing
  if (u === "user1" && p === "Pass@123") {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("quiz-area").style.display = "block";
    initQuiz(); // Start quiz
  } else {
    document.getElementById("login-error").textContent = "Invalid username or password!";
  }
}


// ===== QUIZ DATA =====
const QUIZ_TITLE = "APTET ENGLISH Paper 1 : Model Paper 1";
const questions = [
  {q:"Synonym of ‘hectic’", options:["curious","sensation","fault","busy"], answerId:3},
  {q:"Antonym of ‘brave’", options:["Courageous","Coward","Fearless","Bold"], answerId:1},
  {q:"Clause that cannot form sentence alone", options:["Compound clause","Dependent clause","Independent clause","Complex clause"], answerId:1},
  {q:"Complex → compound: Since it was his birthday, he received many gifts.", options:["It was his birthday, and he received many gifts.","He received many gifts, but it was his birthday.","It was his birthday as he received many gifts.","He received many gifts because it was his birthday."], answerId:0},
  {q:"Person who focuses on practical approaches", options:["Realist","Pragmatist","Quixotic","Pessimist"], answerId:1},
  {q:"Least formal modal verb to ask permission", options:["may","could","might","can"], answerId:3}
  // Add remaining questions
];

// ===== QUIZ LOGIC =====
let current=0, answers=Array(questions.length).fill(null), submitted=false;
let timeLeft=questions.length*60, timerInterval;

function initQuiz(){ renderNav(); renderQuestion(); startTimer(); }
function toggleNav(){document.getElementById("question-nav").classList.toggle("hidden");}
function renderNav(){ const nav=document.getElementById("question-nav"); nav.innerHTML=""; questions.forEach((_,i)=>{ const b=document.createElement("button"); b.textContent=i+1; b.className=(i===current?"active ":"")+(answers[i]!=null?"answered":""); b.onclick=()=>{current=i;renderQuestion()}; nav.appendChild(b); }); updateStats();}
function renderQuestion(){ const q=questions[current]; const c=document.getElementById("question-container"); let h=`<h4>Question ${current+1} of ${questions.length}</h4><p>${q.q}</p><div class="options">`; q.options.forEach((o,i)=>{ let cls=""; if(submitted){ if(i===q.answerId) cls="correct"; else if(answers[current]===i && i!==q.answerId) cls="wrong"; } h+=`<label class="${cls}"><input type="radio" name="opt" value="${i}" ${answers[current]===i?'checked':''} ${submitted?'disabled':''} onchange="selectOpt(${i})">${o}</label>`; }); h+="</div>"; c.innerHTML=h; renderNav(); if(window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([c]); }
function selectOpt(i){ if(submitted) return; answers[current]=i; renderNav();}
function nextQuestion(){if(current<questions.length-1){current++; renderQuestion();}}
function prevQuestion(){if(current>0){current--; renderQuestion();}}
function updateStats(){ const a=answers.filter(x=>x!==null).length; document.getElementById("answered").textContent="Answered: "+a; document.getElementById("not-answered").textContent="Not answered: "+(questions.length-a);}
function startTimer(){ updateTimer(); timerInterval=setInterval(()=>{timeLeft--;updateTimer(); if(timeLeft<=0){clearInterval(timerInterval); submitQuiz();}},1000);}
function updateTimer(){ const m=Math.floor(timeLeft/60), s=timeLeft%60; document.getElementById("timer").textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
function submitQuiz(){ if(submitted) return; submitted=true; clearInterval(timerInterval); let correct=0, wrong=0; questions.forEach((q,i)=>{if(answers[i]!=null){if(answers[i]===q.answerId) correct++; else wrong++;}}); const skipped = questions.length-(correct+wrong); const total = questions.length; const score = Math.round((correct/total)*100); const name = document.getElementById("username").value; const html=`<h3>Result Summary</h3><p><b>Name:</b> ${name}</p><p><b>Total Questions:</b> ${total}</p><p><b>Correct:</b> ${correct}</p><p><b>Wrong:</b> ${wrong}</p><p><b>Skipped:</b> ${skipped}</p><p><b>Score:</b> ${score}%</p>`; document.getElementById("result-section").innerHTML=html; document.getElementById("result-section").classList.remove("hidden"); renderQuestion(); }
function toggleFullscreen(){ if(!document.fullscreenElement){document.documentElement.requestFullscreen().catch(err=>alert(err.message));} else {document.exitFullscreen();} }
