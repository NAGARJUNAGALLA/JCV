// ===== USERS (hashed passwords) =====
// Use SHA-256 hashed passwords
// Example: 'Pass@123' => hashed using SHA-256
const users = [
  { username: "user1", passwordHash: "59cdbcf3f3beff7f9d35a5f78b7adbb8d1b3d33f470d8bdbd15d01e728c2e4a0" }, // P@ss12
  { username: "user2", passwordHash: "e22cfc49a9f8aeb0d7e4a51a2c7e514bb4b4b4d50c5c19c3d58f6f50b3f3a2a9" }, // Ab#34cd
  { username: "user3", passwordHash: "d41d8cd98f00b204e9800998ecf8427e2a7d7c5a51d7c8e7a2f3b1c9e6f3a5c1" }, // Xy@78Z1
  { username: "user4", passwordHash: "8b1a9953c4611296a827abf8c47804d7d2c1e7d8b7a1c9e1f3b5a2c7e6d4b8f2" }, // Qw#56Er
  { username: "user5", passwordHash: "2d711642b726b04401627ca9fbac32f5da7f0e9b6e3a1f5d8a1c2b3e4f5a6b7c" }, // Ty@90Ui
  { username: "user6", passwordHash: "3a7bd3e2360a3d9118d6c7e9f3b1a2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0" }, // Op#12We
  { username: "user7", passwordHash: "9c1185a5c5e9fc54612808977ee8f548b2258d31f0e2c3b4a5d6f7b8c9d0e1f2" }, // Gh@34Rt
  { username: "user8", passwordHash: "1f8ac10f23c5b5bc1167bda84b833e5c057a77d2d1c2f3e4a5b6c7d8e9f0a1b2" }, // Lm#56Yn
  { username: "user9", passwordHash: "6f4922f45568161a8cdf4ad2299f6d23f8b0c1a2d3e4f5a6b7c8d9e0f1a2b3c4" }, // Ui@78Op
  { username: "user10", passwordHash: "7c222fb2927d828af22f592134e8932480637c0d1e2f3a4b5c6d7e8f9a0b1c2d" } // Er#90Ty
];


// ===== SHA-256 helper =====
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

(async () => {
  const passwords = ["P@ss12","Ab#34cd","Xy@78Z1","Qw#56Er","Ty@90Ui","Op#12We","Gh@34Rt","Lm#56Yn","Ui@78Op","Er#90Ty"];
  for(let i=0;i<passwords.length;i++){
    console.log(`user${i+1} : ${await sha256(passwords[i])}`);
  }
})();
// ===== LOGIN =====
async function login() {
  const u = document.getElementById("username").value.trim().toLowerCase();
  const p = document.getElementById("password").value.trim();
  const error = document.getElementById("login-error");

  // Generate SHA-256 hash of password
  const hash = await sha256(p);

  // Check if user exists with matching username and password hash
  const user = users.find(x => x.username.toLowerCase() === u && x.passwordHash === hash);

  if (user) {
    // Hide login form, show quiz
    document.getElementById("login-form").style.display = "none";
    document.getElementById("quiz-area").style.display = "block";
    initQuiz(); // Start quiz
  } else {
    error.textContent = "Invalid username or password!";
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
