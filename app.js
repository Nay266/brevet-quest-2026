// --- CONFIGURATION DU JEU ---
let playerState = {
    xp: 0,         // Points d'XP accumulés dans le palier actuel
    level: 1,      // Palier actuel du joueur (commence au niveau 1)
    badges: [],
    progress: {}
};

// Paramètres de progression dynamique
let pointsParBonneReponse = 20; // Chaque bonne réponse donne toujours 20 points
let scoreSession = 0;           // Compteur de bonnes réponses pour la partie en cours

// Fonction pour savoir combien de points max il faut pour CHANGER de palier
function obtenirXpNautiqueRequis(niveau) {
    // Niveau 1 : 5 réponses = 100 points
    // Niveau 2 : 10 réponses = 200 points
    // Niveau 3 : 15 réponses = 300 points... (On ajoute 5 réponses / 100 pts par niveau)
    return niveau * 5 * 20; 
}
// FONCTION POUR LANCER LE QUIZ (Sélectionne 10 questions au hasard)
function lancerQuiz(matiere) {
    let banqueQuestions = data[matiere].quiz; 
    let questionsMelangees = [...banqueQuestions].sort(() => Math.random() - 0.5);
    
    currentQuestions = questionsMelangees.slice(0, 10);
    currentQuestionIndex = 0;
    scoreSession = 0; 
    
    afficherQuestion();
}

// FONCTION DE GESTION DE L'XP (Appelée à chaque bonne réponse)
function ajouterPoints() {
    playerState.xp += pointsParBonneReponse;
    scoreSession++;

    let xpNecessaire = obtenirXpNautiqueRequis(playerState.level);

    // Si8 l'XP atteint l'objectif du niveau actuel, on monte de palier et on vide la jauge
    if (playerState.xp >= xpNecessaire) {
        playerState.xp = playerState.xp - xpNecessaire; // On remet à zéro en gardant le surplus
        playerState.level += 1; // Passage au palier suivant
        alert("🎉 NIVEAU SUPÉRIEUR ! Tu passes au Palier " + playerState.level + " ! Le prochain niveau demande " + (playerState.level * 5) + " bonnes réponses. Bonne chance !");
    }
}

// FONCTION D'AFFICHAGE DU RÉSULTAT FINAL
function afficherResultatFinal() {
    let zoneResultat = document.getElementById("quiz-container"); 
    let xpNecessairePourSuivant = obtenirXpNautiqueRequis(playerState.level);
    let pourcentageBarre = (playerState.xp / xpNecessairePourSuivant) * 100;
    let reponsesRestantes = (xpNecessairePourSuivant - playerState.xp) / pointsParBonneReponse;

    zoneResultat.innerHTML = `
        <div style="text-align: center; padding: 20px; border-radius: 10px; background: #f8fafc; border: 2px solid #e2e8f0;">
            <h2>🏁 Quiz Terminé !</h2>
            <p style="font-size: 1.2em;">Réponses correctes sur ce quiz : <strong>${scoreSession} / 10</strong></p>
            
            <hr style="margin: 20px 0; border: 1px dashed #cbd5e1;">
            
            <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; border: 1px solid #7dd3fc;">
                <h3 style="margin: 0; color: #0369a1;">🏆 TA PROGRESSION GLOBALE</h3>
                <p style="font-size: 1.4em; margin: 10px 0;">🎯 <strong>Palier Actuel : Niveau ${playerState.level}</strong></p>
                
                <p style="margin: 5px 0; font-size: 0.9em; color: #0284c7;">Progression : ${playerState.xp} / ${xpNecessairePourSuivant} XP</p>
                
                <div style="background: #cbd5e1; border-radius: 10px; width: 100%; height: 20px; margin: 10px auto; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="background: #0ea5e9; width: ${pourcentageBarre}%; height: 100%; transition: width 0.5s ease;"></div>
                </div>
                
               <p style="margin: 0; color: #0c4a6e;">Encore <strong>${reponsesRestantes} bonnes réponses</strong> pour débloquer le Palier ${playerState.level + 1} !</p>
            </div>
            
            <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Revenir à l'accueil</button>
        </div>
    `;
}

// --- COMPTE À REBOURS BREVET 2026 ---
function updateCountdown() {
    const brevetDate = new Date("June 25, 2026 09:00:00").getTime();
    const now = new Date().getTime();
    const diff = brevetDate - now;

    if (diff <= 0) {
        document.getElementById("countdown").innerText = "⚔️ C'est l'heure du Brevet !";
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    document.getElementById("countdown").innerText = `⏳ J-${days} avant le Brevet`;
}
setInterval(updateCountdown, 60000);
updateCountdown();

// --- SYSTÈME DE QUIZ SIMPLIFIÉ ---
let currentQuestions = [];
let currentQuestionIndex = 0;
let currentSubject = null;

function naviguer(pageId, hidePageId, matiere) {
    document.getElementById(hidePageId).classList.add('hidden');
    document.getElementById(pageId).classList.remove('hidden');
    
    currentSubject = matiere;
    let subjectData = database[matiere];
    document.getElementById('subject-title').innerText = subjectData.title;
    document.getElementById('cours-placeholder').innerHTML = subjectData.fiches;
    
    switchTab('cours');
}

function showMainMenu() {
    document.getElementById('subject-page').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
}

function switchTab(tabName) {
    document.getElementById('tab-cours').classList.add('hidden');
    document.getElementById('tab-quiz').classList.add('hidden');
    document.getElementById('tab-' + tabName).classList.remove('hidden');
    
    if (tabName === 'quiz') {
        lancerQuiz(currentSubject);
    }
}

function afficherQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        afficherResultatFinal();
        return;
    }
    
    let q = currentQuestions[currentQuestionIndex];
    document.getElementById('quiz-question').innerText = (currentQuestionIndex + 1) + ". " + q.q;
    
    let optionsHTML = '';
    q.options.forEach((option, idx) => {
        optionsHTML += `<button class="option-btn" onclick="verifierReponse(${idx}, ${q.answer})">${option}</button>`;
    });
    
    document.getElementById('quiz-options').innerHTML = optionsHTML;
    document.getElementById('btn-next-quiz').classList.add('hidden');
}

function verifierReponse(chosen, correct) {
    let buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    if (chosen === correct) {
        buttons[chosen].classList.add('correct');
        ajouterPoints();
    } else {
        buttons[chosen].classList.add('wrong');
        buttons[correct].classList.add('correct');
    }
    
    document.getElementById('btn-next-quiz').classList.remove('hidden');
}

function nextQuestion() {
    currentQuestionIndex++;
    afficherQuestion();
}

// --- BASE DE DONNÉES COMPLÈTE ---
const database = {};