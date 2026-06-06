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

// --- ULTRA-BASE DE DONNÉES DU COMPLÈTE (VERSION FINALE) ---
const database = 
 maths: {
        title: "📐 Mathématiques",
        fiches: `
            <style>
                .maths-app-container { color: #1e293b !important; font-family: system-ui, -apple-system, sans-serif; padding: 5px; }
                .maths-app-container h3 { color: #0f172a !important; margin-top: 25px; margin-bottom: 12px; font-size: 1.35em; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; }
                .maths-app-container p, .maths-app-container li { color: #334155 !important; line-height: 1.6; font-size: 1rem; }
                .maths-app-container strong { color: #0f172a !important; }
                
                /* Boutons de la page d'accueil */
                .btn-chapitre { width: 100%; padding: 16px; color: white !important; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.05rem; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 4px; transition: transform 0.1s; display: block; }
                .btn-chapitre:active { transform: scale(0.99); }
                
                /* Bouton de retour en arrière */
                .btn-retour { display: inline-flex; align-items: center; margin-bottom: 20px; padding: 12px 20px; background: #475569; color: white !important; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .btn-retour:active { transform: scale(0.97); }
                
                /* Conteneurs de cours (masqués par défaut via inline style, gérés au clic) */
                .maths-ecran-cours { background: #ffffff !important; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                
                /* Listes */
                .maths-app-container ul, .maths-app-container ol { padding-left: 20px; margin-bottom: 15px; }
                .maths-app-container li { margin-bottom: 6px; }
            </style>

            <div class="maths-app-container">
                
                <div id="maths-menu-principal" style="display: block;">
                    <p style="text-align: center; font-weight: bold; margin-bottom: 22px; color: #475569;">Sélectionnez une sous-partie pour ouvrir le cours :</p>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        
                        <button class="btn-chapitre" style="background: #3b82f6;" 
                                onclick="document.getElementById('maths-menu-principal').style.display='none'; document.getElementById('cours-partie1').style.display='block'; window.scrollTo(0,0);">
                            📐 PARTIE 1 : GÉOMÉTRIE
                        </button>
                        
                        <button class="btn-chapitre" style="background: #10b981;" 
                                onclick="document.getElementById('maths-menu-principal').style.display='none'; document.getElementById('cours-partie2').style.display='block'; window.scrollTo(0,0);">
                            ✏️ PARTIE 2 : CALCUL LITTÉRAL
                        </button>
                        
                        <button class="btn-chapitre" style="background: #f59e0b;" 
                                onclick="document.getElementById('maths-menu-principal').style.display='none'; document.getElementById('cours-partie3').style.display='block'; window.scrollTo(0,0);">
                            📈 PARTIE 3 : FONCTIONS
                        </button>
                        
                        <button class="btn-chapitre" style="background: #8b5cf6;" 
                                onclick="document.getElementById('maths-menu-principal').style.display='none'; document.getElementById('cours-partie4').style.display='block'; window.scrollTo(0,0);">
                            🔢 PARTIE 4 : FRACTIONS, PUISSANCES & ARITHMÉTIQUE
                        </button>
                        
                        <button class="btn-chapitre" style="background: #ec4899;" 
                                onclick="document.getElementById('maths-menu-principal').style.display='none'; document.getElementById('cours-partie5').style.display='block'; window.scrollTo(0,0);">
                            📊 PARTIE 5 : STATS & PROBABILITÉS
                        </button>
                        
                        <button class="btn-chapitre" style="background: #ef4444;" 
                                onclick="document.getElementById('maths-menu-principal').style.display='none'; document.getElementById('cours-partie6').style.display='block'; window.scrollTo(0,0);">
                            🏆 10 FORMULES INDISPENSABLES
                        </button>
                        
                    </div>
                </div>


                <div id="cours-partie1" class="maths-ecran-cours" style="display: none; border-top: 6px solid #3b82f6;">
                    <button class="btn-retour" onclick="document.getElementById('cours-partie1').style.display='none'; document.getElementById('maths-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux chapitres</button>
                    <div style="background: #3b82f6; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 20px;">PARTIE 1 : GÉOMÉTRIE</div>
                    
                    <h3>LE THÉORÈME DE PYTHAGORE</h3>
                    <p><strong>Définition :</strong><br>Le théorème de Pythagore est un théorème qui s'applique uniquement dans un triangle rectangle.<br>Il permet de calculer la longueur d'un côté lorsque les deux autres sont connues.</p>
                    <p>Dans un triangle rectangle, le carré de la longueur de l'hypoténuse est égal à la somme des carrés des longueurs des deux autres côtés.</p>
                    <p><strong>Formule :</strong></p>
                    <div style="background: #f8fafc; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center; font-weight: bold; font-size: 1.25em; color: #1e3a8a; margin: 10px 0;">c² = a² + b²</div>
                    <p>où :<br>• <strong>c</strong> représente l'hypoténuse ;<br>• <strong>a</strong> et <strong>b</strong> représentent les deux autres côtés.</p>
                    
                    <p><strong>Qu'est-ce que l'hypoténuse ?</strong><br>L'hypoténuse is :<br>• le côté opposé à l'angle droit ;<br>• le plus long côté du triangle.<br>Cette propriété est très importante car une erreur fréquente consiste à choisir le mauvais côté comme hypoténuse.</p>
                    
                    <p><strong>Quand utiliser le théorème de Pythagore ?</strong><br>On l'utilise lorsqu'un énoncé indique :<br>• que le triangle est rectangle ;<br>• ou qu'un angle mesure 90°.<br>Si le triangle n'est pas rectangle, le théorème ne peut pas être utilisé.</p>
                    
                    <p><strong>Méthode complète :</strong><br>1. Vérifier que le triangle est rectangle.<br>2. Identifier l'hypoténuse.<br>3. Écrire la formule adaptée.<br>4. Remplacer les lettres par les valeurs.<br>5. Effectuer les calculs.<br>6. Donner le résultat avec son unité.</p>
                    
                    <p style="background: #fef2f2; color: #b91c1c !important; padding: 12px; border-radius: 6px; border: 1px solid #fca5a5; margin-top: 15px;">
                        <strong>Pièges fréquents :</strong><br>• Confondre l'hypoténuse avec un autre côté.<br>• Oublier de prendre la racine carrée à la fin.<br>• Utiliser le théorème dans un triangle qui n'est pas rectangle.
                    </p>

                    <h3>LA RÉCIPROQUE DU THÉORÈME DE PYTHAGORE</h3>
                    <p><strong>Définition :</strong><br>La réciproque permet de démontrer qu'un triangle est rectangle.<br>Contrairement au théorème de Pythagore, on connaît ici les trois longueurs du triangle.</p>
                    <p><strong>Principe :</strong><br>Si le carré du plus grand côté est égal à la somme des carrés des deux autres côtés, alors le triangle est rectangle.</p>
                    <p><strong>Méthode complète :</strong><br>1. Identifier le plus grand côté.<br>2. Calculer son carré.<br>3. Calculer la somme des carrés des deux autres côtés.<br>4. Comparer les résultats.<br>5. Conclure.</p>
                    <p style="background: #eff6ff; padding: 12px; border-left: 4px solid #3b82f6; border-radius: 0 6px 6px 0; color: #1e40af; font-style: italic;">
                        <strong>Conclusion type :</strong><br>"Comme le carré du plus grand côté est égal à la somme des carrés des deux autres côtés, d'après la réciproque du théorème de Pythagore, le triangle est rectangle."
                    </p>
                    <p style="background: #fef2f2; color: #b91c1c !important; padding: 12px; border-radius: 6px; border: 1px solid #fca5a5;">
                        <strong>Erreurs fréquentes :</strong><br>• Ne pas prendre le plus grand côté.<br>• Comparer les longueurs au lieu des carrés.
                    </p>

                    <h3>LE THÉORÈME DE THALÈS</h3>
                    <p><strong>Définition :</strong><br>Le théorème de Thalès permet de calculer des longueurs dans des figures comportant des droites parallèles. Il repose sur la proportionnalité.</p>
                    <p><strong>Conditions d'application :</strong><br>Avant d'utiliser Thalès, il faut toujours vérifier :<br>• que certains points sont alignés ;<br>• que deux droites sont parallèles.<br>Sans ces conditions, le théorème est impossible à utiliser.</p>
                    <p><strong>Formule :</strong></p>
                    <div style="background: #f8fafc; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center; font-weight: bold; color: #1e3a8a; font-family: monospace; margin: 10px 0;">AM / AB = AN / AC = MN / BC</div>
                    <p><strong>Utilité :</strong><br>Le théorème de Thalès sert principalement à :<br>• calculer une longueur ;<br>• montrer que certaines longueurs sont proportionnelles.</p>
                    <p><strong>Méthode complète :</strong><br>1. Vérifier les alignements.<br>2. Vérifier le parallélisme.<br>3. Écrire le théorème.<br>4. Remplacer les données.<br>5. Résoudre grâce au produit en croix.</p>
                    <p style="background: #fef2f2; color: #b91c1c !important; padding: 12px; border-radius: 6px; border: 1px solid #fca5a5;">
                        <strong>Pièges fréquents :</strong><br>• Mélanger l'ordre des longueurs.<br>• Oublier les conditions d'application.<br>• Faire un mauvais produit en croix.
                    </p>

                    <h3>LA RÉCIPROQUE DU THÉORÈME DE THALÈS</h3>
                    <p><strong>Définition :</strong><br>Elle permet de démontrer que deux droites sont parallèles.</p>
                    <p><strong>Principe :</strong><br>Si les rapports des longueurs correspondantes sont égaux, alors les droites sont parallèles.</p>
                    <p><strong>Méthode :</strong><br>1. Vérifier les alignements.<br>2. Calculer les rapports.<br>3. Vérifier qu'ils sont égaux.<br>4. Conclure que les droites sont parallèles.</p>

                    <h3>LA TRIGONOMÉTRIE</h3>
                    <p><strong>Définition :</strong><br>La trigonométrie est une méthode utilisée dans les triangles rectangles pour calculer une longueur ou un angle. Elle repose sur trois rapports fondamentaux :</p>
                    <ul>
                        <li><strong>Le sinus :</strong> <span style="font-family: monospace; font-weight: bold;">sin(angle) = côté opposé / hypoténuse</span>. Le sinus relie le côté opposé et l'hypoténuse.</li>
                        <li><strong>Le cosinus :</strong> <span style="font-family: monospace; font-weight: bold;">cos(angle) = côté adjacent / hypoténuse</span>. Le cosinus relie le côté adjacent et l'hypoténuse.</li>
                        <li><strong>La tangente :</strong> <span style="font-family: monospace; font-weight: bold;">tan(angle) = côté opposé / côté adjacent</span>. La tangente relie le côté opposé et le côté adjacent.</li>
                    </ul>
                    <p><strong>Comment reconnaître les côtés ?</strong><br>Pour l'angle étudié :<br>• le côté opposé est en face de l'angle ;<br>• le côté adjacent touche l'angle ;<br>• l'hypoténuse est opposée à l'angle droit.</p>
                    <div style="background: #fffbeb; padding: 12px; border: 1px dashed #f59e0b; border-radius: 6px; color: #b45309; text-align: center; font-weight: bold; margin: 15px 0;">
                        Astuce à retenir : SOH CAH TOA<br>
                        • SOH : Sinus = Opposé / Hypoténuse<br>
                        • CAH : Cosinus = Adjacent / Hypoténuse<br>
                        • TOA : Tangente = Opposé / Adjacent
                    </div>
                    <p style="background: #fef2f2; color: #b91c1c !important; padding: 12px; border-radius: 6px; border: 1px solid #fca5a5;">
                        <strong>Erreurs fréquentes :</strong><br>• Se tromper d'angle.<br>• Confondre adjacent et opposé.<br>• Utiliser la mauvaise formule.
                    </p>

                    <h3>LES TRANSFORMATIONS</h3>
                    <p><strong>LA SYMÉTRIE AXIALE :</strong><br>• <strong>Définition :</strong> Une symétrie axiale est une réflexion par rapport à une droite appelée axe de symétrie. C'est l'équivalent d'une image dans un miroir.<br>• <strong>Propriétés :</strong> La symétrie conserve les longueurs, les angles et les aires.<br>• <strong>Particularité :</strong> L'axe est toujours la médiatrice du segment reliant un point et son image.</p>
                    <hr style="border:0; border-top: 1px solid #e2e8f0; margin:15px 0;">
                    <p><strong>LA SYMÉTRIE CENTRALE :</strong><br>• <strong>Définition :</strong> Une symétrie centrale est une transformation réalisée par rapport à un point appelé centre.<br>• <strong>Propriétés :</strong> Les longueurs sont conservées. Les angles sont conservés. Le centre est le milieu entre un point et son image.<br>• <strong>Remarque :</strong> Une symétrie centrale correspond à une rotation de 180°.</p>
                    <hr style="border:0; border-top: 1px solid #e2e8f0; margin:15px 0;">
                    <p><strong>LA TRANSLATION :</strong><br>• <strong>Définition :</strong> Une translation déplace une figure sans la tourner. Tous les points effectuent exactement le même déplacement.<br>• <strong>Caractéristiques :</strong> Le déplacement possède une direction, un sens et une longueur.<br>• <strong>Propriétés :</strong> La figure conserve sa forme, sa taille et son orientation.</p>
                    <hr style="border:0; border-top: 1px solid #e2e8f0; margin:15px 0;">
                    <p><strong>LA ROTATION :</strong><br>• <strong>Définition :</strong> Une rotation consiste à faire tourner une figure autour d'un point.<br>• <strong>Éléments nécessaires :</strong> Pour définir une rotation, il faut un centre, un angle et un sens.<br>• <strong>Propriétés :</strong> Les longueurs sont conservées. Les angles sont conservés. La forme reste identique.</p>
                    <hr style="border:0; border-top: 1px solid #e2e8f0; margin:15px 0;">
                    <p><strong>L'HOMOTHÉTIE :</strong><br>• <strong>Définition :</strong> L'homothétie est une transformation qui agrandit ou réduit une figure.<br>• <strong>Coefficient :</strong> On utilise un coefficient appelé rapport d'homothétie.<br>
                    &nbsp;&nbsp;- Si le coefficient est supérieur à 1 : la figure est agrandie.<br>
                    &nbsp;&nbsp;- Si le coefficient est compris entre 0 et 1 : la figure est réduite.<br>
                    &nbsp;&nbsp;- Si le coefficient est négatif : l'image se trouve de l'autre côté du centre.<br>
                    • <strong>Propriétés :</strong> Les angles sont conservés. Les côtés homologues restent parallèles. Les longueurs sont multipliées par le coefficient.</p>
                </div>


                <div id="cours-partie2" class="maths-ecran-cours" style="display: none; border-top: 6px solid #10b981;">
                    <button class="btn-retour" onclick="document.getElementById('cours-partie2').style.display='none'; document.getElementById('maths-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux chapitres</button>
                    <div style="background: #10b981; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 20px;">PARTIE 2 : CALCUL LITTÉRAL</div>
                    
                    <h3>RÉDUIRE UNE EXPRESSION LITTÉRALE</h3>
                    <p>Réduire une expression consiste à regrouper les termes semblables. On ne peut additionner que les termes ayant exactement la même partie littérale.</p>
                    <p><strong>Exemple :</strong><br><span style="font-family: monospace; font-weight: bold;">3x + 5x = 8x</span><br>mais <span style="font-family: monospace; font-weight: bold;">3x + 5y</span> ne peut pas être réduit.</p>
                    <p><strong>Objectif :</strong><br>Obtenir l'écriture la plus simple possible.</p>

                    <h3>DÉVELOPPER UNE EXPRESSION</h3>
                    <p>Développer consiste à supprimer les parenthèses. La distributivité est la règle fondamentale :</p>
                    <div style="background: #f8fafc; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center; font-family: monospace; font-weight: bold; color: #047857; margin: 10px 0;">a(b + c) = ab + ac</div>
                    <p><strong>Double distributivité :</strong><br><span style="font-family: monospace; font-weight: bold;">(a + b)(c + d)</span><br>Chaque terme du premier facteur doit être multiplié par chaque terme du second facteur.</p>

                    <h3>FACTORISER UNE EXPRESSION</h3>
                    <p>Factoriser est l'opération inverse du développement.</p>
                    <p><strong>Objectif :</strong><br>Faire apparaître un facteur commun. Cette méthode simplifie souvent les calculs et la résolution d'équations.</p>

                    <h3>IDENTITÉS REMARQUABLES</h3>
                    <p>Elles permettent de développer ou de factoriser rapidement certaines expressions. À connaître parfaitement :</p>
                    <div style="background: #f8fafc; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-family: monospace; font-weight: bold; color: #047857; line-height: 2;">
                        • (a + b)² = a² + 2ab + b²<br>
                        • (a - b)² = a² - 2ab + b²<br>
                        • (a - b)(a + b) = a² - b²
                    </div>
                    <p>Ces trois formules sont parmi les plus importantes du calcul littéral.</p>

                    <h3>ÉQUATIONS</h3>
                    <p>Une équation est une égalité contenant une inconnue. Résoudre une équation consiste à trouver toutes les valeurs possibles de cette inconnue.</p>
                    <p><strong>Principe fondamental :</strong><br>Tout ce que l'on fait d'un côté de l'égalité doit être fait de l'autre côté.</p>
                    <p><strong>Objectif :</strong><br>Isoler l'inconnue.</p>
                </div>


                <div id="cours-partie3" class="maths-ecran-cours" style="display: none; border-top: 6px solid #f59e0b;">
                    <button class="btn-retour" onclick="document.getElementById('cours-partie3').style.display='none'; document.getElementById('maths-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux chapitres</button>
                    <div style="background: #f59e0b; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 20px;">PARTIE 3 : FONCTIONS</div>
                    
                    <h3>LES FONCTIONS</h3>
                    <p>Une fonction associe à chaque nombre une image. On note généralement : <span style="font-family: monospace; font-weight: bold;">f(x)</span></p>
                    <p><strong>Vocabulaire :</strong><br>• <strong>x</strong> est l'antécédent ;<br>• <strong>f(x)</strong> est l'image.</p>
                    <p><strong>Représentations :</strong><br>Une fonction peut être représentée :<br>• par une formule ;<br>• par un tableau ;<br>• par une courbe.</p>

                    <h3>LES FONCTIONS AFFINES</h3>
                    <p>Une fonction affine s'écrit :</p>
                    <div style="background: #f8fafc; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center; font-family: monospace; font-weight: bold; color: #b45309; font-size: 1.1em; margin: 10px 0;">f(x) = ax + b</div>
                    <p>• <strong>Coefficient directeur :</strong> Le nombre <strong>a</strong> indique l'inclinaison de la droite.<br>
                    • <strong>Ordonnée à l'origine :</strong> Le nombre <strong>b</strong> indique l'endroit où la droite coupe l'axe vertical.</p>
                    <p><strong>Variations :</strong><br>• Si <strong>a</strong> est positif : fonction croissante.<br>• Si <strong>a</strong> est négatif : fonction décroissante.<br>• Si <strong>a</strong> est nul : fonction constante.</p>
                </div>


                <div id="cours-partie4" class="maths-ecran-cours" style="display: none; border-top: 6px solid #8b5cf6;">
                    <button class="btn-retour" onclick="document.getElementById('cours-partie4').style.display='none'; document.getElementById('maths-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux chapitres</button>
                    <div style="background: #8b5cf6; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 20px;">PARTIE 4 : FRACTIONS, PUISSANCES ET ARITHMÉTIQUE</div>
                    
                    <h3>LES FRACTIONS</h3>
                    <p>Une fraction représente un quotient.<br>• <strong>Numérateur :</strong> nombre du haut.<br>• <strong>Dénominateur :</strong> nombre du bas.</p>
                    <p><strong>Opérations :</strong><br>
                    • <strong>Addition et soustraction :</strong> Même dénominateur obligatoire.<br>
                    • <strong>Multiplication :</strong> Numérateur × numérateur et Dénominateur × dénominateur.<br>
                    • <strong>Division :</strong> Multiplier par l'inverse.<br>
                    • <strong>Simplification :</strong> Diviser le numérateur et le dénominateur par le même nombre.</p>

                    <h3>LES PUISSANCES</h3>
                    <p>Une puissance représente une multiplication répétée.<br><strong>Exemple :</strong> <span style="font-family: monospace;">2³ = 2 × 2 × 2</span></p>
                    <p><strong>Règles :</strong><br>• <strong>Même base :</strong> on additionne les exposants lors d'une multiplication. On les soustrait lors d'une division.<br>• <strong>Pour une puissance de puissance :</strong> on multiplie les exposants.</p>

                    <h3>L'ARITHMÉTIQUE</h3>
                    <p><strong>Divisibilité :</strong> Permet de savoir rapidement si un nombre possède un diviseur.</p>
                    <p><strong>Nombres premiers :</strong> Un nombre premier possède exactement deux diviseurs : 1 et lui-même.</p>
                    <p><strong>Décomposition en facteurs premiers :</strong> Elle consiste à écrire un nombre comme produit de nombres premiers. Cette notion est très importante pour simplifier les fractions et résoudre certains problèmes.</p>
                </div>


                <div id="cours-partie5" class="maths-ecran-cours" style="display: none; border-top: 6px solid #ec4899;">
                    <button class="btn-retour" onclick="document.getElementById('cours-partie5').style.display='none'; document.getElementById('maths-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux chapitres</button>
                    <div style="background: #ec4899; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 20px;">PARTIE 5 : PROBABILITÉS, PROPORTIONNALITÉ, POURCENTAGES ET STATISTIQUES</div>
                    
                    <h3>LES PROBABILITÉS</h3>
                    <p>Une probabilité mesure les chances qu'un événement se produise. Une probabilité est toujours comprise entre 0 et 1.</p>
                    <p>• <strong>0</strong> signifie impossible.<br>• <strong>1</strong> signifie certain.<br>Plus la probabilité est proche de 1, plus l'événement a de chances de se produire.</p>

                    <h3>LA PROPORTIONNALITÉ</h3>
                    <p>Deux grandeur sont proportionnelles lorsque l'on passe de l'une à l'autre en multipliant toujours par le même nombre. Ce nombre est appelé coefficient de proportionnalité.</p>
                    <p>La proportionnalité apparaît très souvent dans : les recettes, les vitesses, les cartes, les pourcentages.</p>

                    <h3>LES POURCENTAGES</h3>
                    <p>Un pourcentage représente une proportion sur 100.<br>• 50 % signifie 50 sur 100.<br>• 25 % signifie 25 sur 100.</p>
                    <p><strong>Augmentations et diminutions :</strong><br>• Pour augmenter de t %, on multiplie par : <span style="font-family: monospace; font-weight: bold;">1 + t/100</span><br>• Pour diminuer de t %, on multiplie par : <span style="font-family: monospace; font-weight: bold;">1 - t/100</span></p>

                    <h3>LES STATISTIQUES</h3>
                    <p>Les statistiques permettent d'étudier et d'interpréter des données.</p>
                    <ul>
                        <li><strong>Effectif :</strong> Nombre d'apparitions d'une valeur.</li>
                        <li><strong>Fréquence :</strong> Part de cette valeur dans l'ensemble de la série.</li>
                        <li><strong>Moyenne :</strong> Valeur moyenne obtenue en partageant équitablement toutes les données.</li>
                        <li><strong>Médiane :</strong> Valeur qui coupe la série ordonnée en deux groupes de même effectif.</li>
                        <li><strong>Mode :</strong> Valeur la plus fréquente.</li>
                        <li><strong>Étendue :</strong> Différence entre la plus grande valeur et la plus petite valeur.</li>
                    </ul>
                </div>


                <div id="cours-partie6" class="maths-ecran-cours" style="display: none; border-top: 6px solid #ef4444; background: #fffefe !important;">
                    <button class="btn-retour" onclick="document.getElementById('cours-partie6').style.display='none'; document.getElementById('maths-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux chapitres</button>
                    <div style="background: #ef4444; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 20px;">LES 10 FORMULES ABSOLUMENT INDISPENSABLES</div>
                    
                    <ol style="line-height: 2.2; font-weight: bold; font-size: 1.05rem; padding-left: 22px; color: #1e293b !important;">
                        <li>Pythagore : c² = a² + b²</li>
                        <li>Thalès : AM/AB = AN/AC = MN/BC</li>
                        <li>Sinus : opposé / hypoténuse</li>
                        <li>Cosinus : adjacent / hypoténuse</li>
                        <li>Tangente : opposé / adjacent</li>
                        <li>Fonction affine : f(x) = ax + b</li>
                        <li>Distributivité : a(b + c) = ab + ac</li>
                        <li>Identité remarquable : (a + b)² = a² + 2ab + b²</li>
                        <li>Probabilité = cas favorables / cas possibles</li>
                        <li>Moyenne = somme des valeurs / effectif total</li>
                    </ol>
                </div>

            </div>
        `,
        quiz: [
            // GÉOMÉTRIE : PYTHAGORE & THALÈS (Questions 1 à 12)
            { q: "Quelle est la formule du théorème de Pythagore dans un triangle rectangle d'hypoténuse c ?", options: ["a² = b² + c²", "c² = a² + b²", "c = a + b"], answer: 1 },
            { q: "Que permet de calculer le théorème de Pythagore direct ?", options: ["La longueur d'un côté", "La mesure d'un angle", "Le parallélisme de deux droites"], answer: 0 },
            { q: "Que cherche-t-on à prouver avec la réciproque de Pythagore ?", options: ["Qu'un triangle est rectangle", "Qu'un triangle est équilatéral", "Qu'un côté est très long"], answer: 0 },
            { q: "Dans un triangle rectangle, quel est le nom du côté opposé à l'angle droit ?", options: ["Le côté adjacent", "L'hypoténuse", "Le côté vertical"], answer: 1 },
            { q: "Si un triangle ABC a pour plus grand côté AB, quelle égalité vérifie qu'il est rectangle en C ?", options: ["AB² = AC² + BC²", "AC² = AB² + BC²", "BC² = AB² + AC²"], answer: 0 },
            { q: "Si AB² vaut 25, combien vaut la longueur AB ?", options: ["5", "12.5", "50"], answer: 0 },
            { q: "Quelle condition géométrique indispensable faut-il pour utiliser le théorème de Thalès ?", options: ["Un angle droit", "Deux droites parallèles", "Un cercle circonscrit"], answer: 1 },
            { q: "Complète le rapport de Thalès : AM/AB = AN/AC = ...", options: ["MN/BC", "BC/MN", "AM/AN"], answer: 0 },
            { q: "À quoi sert la réciproque du théorème de Thalès ?", options: ["Calculer une longueur", "Prouver que deux droites sont parallèles", "Calculer un angle"], answer: 1 },
            { q: "Si les rapports de Thalès ne sont pas égaux, quelle est la conclusion ?", options: ["Les droites sont parallèles", "Les droites ne sont pas parallèles", "Le triangle est rectangle"], answer: 1 },
            { q: "Quelle méthode utilise-t-on pour trouver une longueur inconnue dans une égalité de fractions de Thalès ?", options: ["Le théorème de Pythagore", "Le produit en croix", "La soustraction"], answer: 1 },
            { q: "Dans un triangle rectangle, quel côté est toujours le plus long ?", options: ["Le côté opposé", "Le côté adjacent", "L'hypoténuse"], answer: 2 },

            // TRIGONOMÉTRIE & TRANSFORMATIONS (Questions 13 à 22)
            { q: "Que signifie le 'C' dans le mot mnémotechnique SOH CAH TOA ?", options: ["Côté opposé", "Cosinus", "Côté adjacent"], answer: 1 },
            { q: "Quelle est la formule exacte du Sinus d'un angle ?", options: ["Opposé / Hypoténuse", "Adjacent / Hypoténuse", "Opposé / Adjacent"], answer: 0 },
            { q: "Quelle formule trigonométrique ne fait jamais intervenir l'hypoténuse ?", options: ["Le cosinus", "Le sinus", "La tangente"], answer: 2 },
            { q: "Dans la formule CAH, comment calcule-t-on le cosinus ?", options: ["Adjacent / Hypoténuse", "Hypoténuse / Adjacent", "Opposé / Adjacent"], answer: 0 },
            { q: "Quelle transformation correspond à un effet miroir par rapport à une droite ?", options: ["La symétrie centrale", "La symétrie axiale", "La translation"], answer: 1 },
            { q: "Quelle transformation est l'équivalent d'un demi-tour complet (180 degrés) ?", options: ["La rotation", "La translation", "La symétrie centrale"], answer: 2 },
            { q: "Une translation déplace une figure géométrique sans modifier quoi ?", options: ["Son orientation", "Sa position", "Ses coordonnées"], answer: 0 },
            { q: "Quels éléments définissent complètement une rotation ?", options: ["Une droite et une distance", "Un centre, un angle et un sens", "Un vecteur de glissement"], answer: 1 },
            { q: "Dans une homothétie, si le rapport k vaut 3, la figure est...", options: ["Agrandie", "Réduite", "Identique"], answer: 0 },
            { q: "Si le rapport d'une homothétie est égal à 0.5, la figure finale est...", options: ["Agrandie", "Réduite", "Retournée de l'autre côté"], answer: 1 },

            // CALCUL LITTÉRAL & ÉQUATIONS (Questions 23 à 32)
            { q: "Réduis l'expression suivante : 4x + 3x - x", options: ["7x", "6x", "6x²"], answer: 1 },
            { q: "Peut-on additionner 2x et 5 pour donner 7x ?", options: ["Oui, c'est tout à fait correct", "Non, ils ne sont pas de la même famille", "Seulement si x vaut 1"], answer: 1 },
            { q: "Développe l'expression : 3(x + 2)", options: ["3x + 2", "3x + 6", "5x"], answer: 1 },
            { q: "Développe l'expression : (x + 2)(x + 3)", options: ["x² + 5x + 6", "x² + 6", "2x + 5"], answer: 0 },
            { q: "Quelle opération consiste à transformer une somme en un produit ?", options: ["Le développement", "La factorisation", "La réduction"], answer: 1 },
            { q: "Dans l'expression 5x + 15, quel est le facteur commun évident ?", options: ["x", "5", "15"], answer: 1 },
            { q: "Quelle est l'identité remarquable exacte pour (a + b)² ?", options: ["a² + b²", "a² + 2ab + b²", "a² - 2ab + b²"], answer: 1 },
            { q: "Développe (x - 3)(x + 3) en utilisant une identité remarquable.", options: ["x² - 9", "x² + 9", "x² - 6x + 9"], answer: 0 },
            { q: "Résous l'équation suivante : x + 5 = 12. Combien vaut x ?", options: ["17", "7", "2.4"], answer: 1 },
            { q: "Résous l'équation produit : 3x = 15. Combien vaut x ?", options: ["12", "5", "45"], answer: 1 },

            // FONCTIONS (Questions 33 à 38)
            { q: "Dans la notation f(5) = 10, quel nombre est l'antécédent ?", options: ["5", "10", "f"], answer: 0 },
            { q: "Dans la notation f(4) = 8, quel nombre est l'image ?", options: ["4", "8", "x"], answer: 1 },
            { q: "Quelle est la forme générale d'une fonction affine ?", options: ["f(x) = ax + b", "f(x) = ax²", "f(x) = a / x"], answer: 0 },
            { q: "Que représente graphiquement une fonction affine ?", options: ["Une parabole", "Une droite", "Une courbe quelconque"], answer: 1 },
            { q: "Si une fonction affine s'écrit f(x) = -3x + 2, son sens de variation est...", options: ["Croissant", "Décroissant", "Constant"], answer: 1 },
            { q: "Dans la fonction f(x) = 4x + 7, que vaut l'ordonnée à l'origine ?", options: ["4", "7", "x"], answer: 1 },

            // NUMÉRIQUE : FRACTIONS, PUISSANCES, ARITHMÉTIQUE (Questions 39 à 44)
            { q: "Calcule la multiplication de fractions : (2/3) x (4/5)", options: ["6/8", "8/15", "10/12"], answer: 1 },
            { q: "Que donne le calcul de puissance suivant : 2 puissance 3 ?", options: ["6", "8", "9"], answer: 1 },
            { q: "Combien de diviseurs possède exactement un nombre premier ?", options: ["Un seul", "Exactement deux", "Plus de trois"], answer: 1 },
            { q: "Parmi ces nombres, lequel est un nombre premier ?", options: ["9", "12", "13"], answer: 2 },
            { q: "Pour diviser une fraction par une autre, que doit-on faire ?", options: ["Les soustraire", "Multiplier par l'inverse de la deuxième", "Tout mettre sur 100"], answer: 1 },
            { q: "Que fait-on des exposants quand on multiplie deux puissances de même base (ex: 10² x 10³) ?", options: ["On les multiplie", "On les additionne", "On les soustrait"], answer: 1 },

            // PROBABILITÉS & STATISTIQUES (Questions 45 à 50)
            { q: "Quelle est la probabilité d'un événement totalement impossible ?", options: ["0", "0.5", "1"], answer: 0 },
            { q: "Une probabilité peut-elle être égale à 1.5 ?", options: ["Oui, si l'événement est très certain", "Non, elle est strictement comprise entre 0 et 1", "Seulement dans les grands calculs"], answer: 1 },
            { q: "Comment s'appelle la valeur qui est la plus fréquente dans une série statistique ?", options: ["La moyenne", "La médiane", "Le mode"], answer: 2 },
            { q: "Comment calcule-t-on l'étendue d'une série de notes ?", options: ["Note maximale + Note minimale", "Note maximale - Note minimale", "Somme de toutes les notes"], answer: 1 },
            { q: "Pour une hausse de 20%, par quel coefficient multiplie-t-on la valeur ?", options: ["0.2", "1.2", "20"], answer: 1 },
            { q: "Une pièce de monnaie équilibrée est lancée. Quelle est la probabilité de faire Pile ?", options: ["1", "0.5", "0.25"], answer: 1 }
        ]
    },
 histoire: {
        title: "📜 Histoire",
        fiches: `
            <!-- STYLE DE SÉCURITÉ CONTRE LE TEXTE BLANC ET MISE EN PAGE -->
            <style>
                .hist-app-container { color: #1e293b !important; font-family: system-ui, -apple-system, sans-serif; padding: 5px; }
                .hist-app-container h3 { color: #0f172a !important; margin-top: 25px; margin-bottom: 12px; font-size: 1.35em; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; }
                .hist-app-container h4 { color: #1e293b !important; margin-top: 18px; margin-bottom: 8px; font-size: 1.1em; font-weight: bold; }
                .hist-app-container p, .hist-app-container li { color: #334155 !important; line-height: 1.6; font-size: 1rem; }
                .hist-app-container strong { color: #0f172a !important; }
                
                /* Boutons de la page d'accueil */
                .btn-chapitre-hist { width: 100%; padding: 16px; color: white !important; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.05rem; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 4px; transition: transform 0.1s; display: block; }
                .btn-chapitre-hist:active { transform: scale(0.99); }
                
                /* Bouton de retour en arrière */
                .btn-retour-hist { display: inline-flex; align-items: center; margin-bottom: 20px; padding: 12px 20px; background: #475569; color: white !important; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .btn-retour-hist:active { transform: scale(0.97); }
                
                /* Conteneurs de cours (masqués par défaut via inline style) */
                .hist-ecran-cours { background: #ffffff !important; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                
                /* Listes */
                .hist-app-container ul, .hist-app-container ol { padding-left: 20px; margin-bottom: 15px; }
                .hist-app-container li { margin-bottom: 6px; }
            </style>

            <div class="hist-app-container">
                
                <!-- ================= ÉCRAN 1 : PAGE D'ACCUEIL (MENU DES CHAPITRES) ================= -->
                <div id="hist-menu-principal" style="display: block;">
                    <p style="text-align: center; font-weight: bold; margin-bottom: 22px; color: #475569;">Sélectionnez une sous-partie pour ouvrir le cours :</p>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        
                        <button class="btn-chapitre-hist" style="background: #9a3412;" 
                                onclick="document.getElementById('hist-menu-principal').style.display='none'; document.getElementById('hist-cours-partie1').style.display='block'; window.scrollTo(0,0);">
                            ⚔️ PARTIE 1 : UNE GUERRE D'UNE VIOLENCE INÉDITE
                        </button>
                        
                        <button class="btn-chapitre-hist" style="background: #065f46;" 
                                onclick="document.getElementById('hist-menu-principal').style.display='none'; document.getElementById('hist-cours-partie2').style.display='block'; window.scrollTo(0,0);">
                            🪖 PARTIE 2 : L'EXPÉRIENCE COMBATTANTE DES SOLDATS
                        </button>
                        
                        <button class="btn-chapitre-hist" style="background: #1e3a8a;" 
                                onclick="document.getElementById('hist-menu-principal').style.display='none'; document.getElementById('hist-cours-partie3').style.display='block'; window.scrollTo(0,0);">
                            👪 PARTIE 3 : LES CIVILS DANS LA GUERRE
                        </button>
                        
                        <button class="btn-chapitre-hist" style="background: #374151;" 
                                onclick="document.getElementById('hist-menu-principal').style.display='none'; document.getElementById('hist-cours-partie4').style.display='block'; window.scrollTo(0,0);">
                            🏁 PARTIE 4 : LA FIN DE LA GUERRE ET SES CONSÉQUENCES
                        </button>
                        
                    </div>
                </div>


                <!-- ================= ÉCRAN 2 : CONTENU DE LA PARTIE 1 ================= -->
                <div id="hist-cours-partie1" class="hist-ecran-cours" style="display: none; border-top: 6px solid #9a3412;">
                    <button class="btn-retour-hist" onclick="document.getElementById('hist-cours-partie1').style.display='none'; document.getElementById('hist-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux chapitres</button>
                    <div style="background: #9a3412; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 20px;">PARTIE 1 : UNE GUERRE D'UNE VIOLENCE INÉDITE</div>
                    
                    <h3>A. Les origines du conflit</h3>
                    <p>Au début du XXe siècle, l'Europe est divisée par de nombreuses rivalités politiques, économiques et coloniales.<br>Deux systèmes d'alliances se forment :</p>
                    
                    <p><strong>La Triple-Entente :</strong></p>
                    <ul>
                        <li>France</li>
                        <li>Royaume-Uni</li>
                        <li>Russie</li>
                    </ul>
                    
                    <p><strong>La Triple-Alliance :</strong></p>
                    <ul>
                        <li>Allemagne</li>
                        <li>Autriche-Hongrie</li>
                        <li>Italie</li>
                    </ul>
                    
                    <p>Le <strong>28 juin 1914</strong>, l'archiduc François-Ferdinand est assassiné à Sarajevo.<br>Cet événement déclenche une crise diplomatique qui conduit à la guerre.<br>Le <strong>28 juillet 1914</strong>, l'Autriche-Hongrie déclare la guerre à la Serbie.</p>
                    
                    <h3>B. Une guerre de mouvement puis une guerre de position</h3>
                    <h4>La guerre de mouvement (1914)</h4>
                    <p>Au début du conflit, chaque camp espère une victoire rapide.<br>Les armées se déplacent rapidement.<br>Les Allemands avancent vers Paris mais sont arrêtés lors de la <strong>bataille de la Marne</strong>.</p>
                    
                    <h4>La guerre de position (1915-1917)</h4>
                    <p>Les soldats creusent des tranchées.<br>Le front se stabilise.<br>Les armées restent face à face pendant plusieurs années.<br>Cette situation provoque une guerre extrêmement meurtrière.</p>
                    
                    <h3>C. Une violence de masse</h3>
                    <p>La guerre mobilise les progrès de l'industrie.<br>De nouvelles armes apparaissent :</p>
                    <ul>
                        <li>mitrailleuses ;</li>
                        <li>canons ;</li>
                        <li>grenades ;</li>
                        <li>gaz de combat ;</li>
                        <li>chars ;</li>
                        <li>avions.</li>
                    </ul>
                    <p>Les pertes humaines atteignent un niveau jamais vu auparavant.</p>
                </div>


                <!-- ================= ÉCRAN 3 : CONTENU DE LA PARTIE 2 ================= -->
                <div id="hist-cours-partie2" class="hist-ecran-cours" style="display: none; border-top: 6px solid #065f46;">
                    <button class="btn-retour-hist" onclick="document.getElementById('hist-cours-partie2').style.display='none'; document.getElementById('hist-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux chapitres</button>
                    <div style="background: #065f46; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 20px;">PARTIE 2 : L'EXPÉRIENCE COMBATTANTE DES SOLDATS</div>
                    
                    <h3>A. Les conditions de vie dans les tranchées</h3>
                    <p>Les soldats vivent dans des conditions très difficiles :</p>
                    <ul>
                        <li>froid ;</li>
                        <li>boue ;</li>
                        <li>humidité ;</li>
                        <li>rats ;</li>
                        <li>poux ;</li>
                        <li>manque d'hygiène.</li>
                    </ul>
                    <p>Ils subissent un stress permanent.<br>La peur de mourir est omniprésente.</p>

                    <h3>B. L'exemple de Verdun</h3>
                    <h4>Une bataille symbolique</h4>
                    <p>La <strong>bataille de Verdun</strong> se déroule de <strong>février à décembre 1916</strong>.<br>Elle devient le symbole de la violence de la guerre.</p>
                    
                    <h4>Des combats extrêmement meurtriers</h4>
                    <p>Les bombardements sont incessants.<br>Les soldats vivent un véritable enfer.<br>Le bilan est terrible :</p>
                    <ul>
                        <li>environ <strong>300 000 morts</strong> ;</li>
                        <li>plus de <strong>400 000 blessés</strong>.</li>
                    </ul>

                    <h3>C. Les mutineries de 1917</h3>
                    <p>Après plusieurs années de guerre, de nombreux soldats sont épuisés.<br>Des mutineries éclatent.<br>Les soldats réclament :</p>
                    <ul>
                        <li>davantage de repos ;</li>
                        <li>de meilleures conditions de vie ;</li>
                        <li>l'arrêt des offensives inutiles.</li>
                    </ul>
                    <p>Le général Pétain rétablit progressivement la situation.</p>
                </div>


                <!-- ================= ÉCRAN 4 : CONTENU DE LA PARTIE 3 ================= -->
                <div id="hist-cours-partie3" class="hist-ecran-cours" style="display: none; border-top: 6px solid #1e3a8a;">
                    <button class="btn-retour-hist" onclick="document.getElementById('hist-cours-partie3').style.display='none'; document.getElementById('hist-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux chapitres</button>
                    <div style="background: #1e3a8a; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 20px;">PARTIE 3 : LES CIVILS DANS LA GUERRE</div>
                    
                    <h3>A. Une mobilisation générale</h3>
                    <p>La guerre concerne toute la société.<br>Les États mobilisent :</p>
                    <ul>
                        <li>les ouvriers ;</li>
                        <li>les paysans ;</li>
                        <li>les administrations ;</li>
                        <li>les entreprises.</li>
                    </ul>
                    <p>Toute l'économie est tournée vers la guerre.</p>

                    <h3>B. Le rôle des femmes</h3>
                    <p>Les femmes remplacent les hommes partis au front.<br>Elles travaillent :</p>
                    <ul>
                        <li>dans les usines ;</li>
                        <li>dans les transports ;</li>
                        <li>dans les champs ;</li>
                        <li>dans les services publics.</li>
                    </ul>
                    <p>Leur rôle devient essentiel.</p>

                    <h3>C. Propagande et censure</h3>
                    <p>Les gouvernements cherchent à maintenir le moral de la population.<br>Ils utilisent :</p>
                    <p><strong>La propagande :</strong><br>Affiches, journaux et discours patriotiques.</p>
                    <p><strong>La censure :</strong><br>Contrôle des informations diffusées.<br>Les mauvaises nouvelles sont souvent dissimulées.</p>

                    <h3>D. Le génocide des Arméniens</h3>
                    <p>En <strong>1915</strong>, l'Empire ottoman organise la déportation et l'extermination des Arméniens.<br>Entre <strong>1 et 1,5 million de personnes</strong> meurent.<br>Ce massacre est considéré comme le premier génocide du XXe siècle.</p>
                </div>


                <!-- ================= ÉCRAN 5 : CONTENU DE LA PARTIE 4 ================= -->
                <div id="hist-cours-partie4" class="hist-ecran-cours" style="display: none; border-top: 6px solid #374151;">
                    <button class="btn-retour-hist" onclick="document.getElementById('hist-cours-partie4').style.display='none'; document.getElementById('hist-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux chapitres</button>
                    <div style="background: #374151; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 20px;">PARTIE 4 : LA FIN DE LA GUERRE ET SES CONSÉQUENCES</div>
                    
                    <h3>A. L'année 1917, un tournant</h3>
                    <p>Deux événements changent le cours de la guerre :</p>
                    <ul>
                        <li>la Révolution russe ;</li>
                        <li>l'entrée en guerre des États-Unis.</li>
                    </ul>

                    <h3>B. La victoire des Alliés</h3>
                    <p>En 1918, l'Allemagne est affaiblie.<br>Le <strong>11 novembre 1918</strong>, l'armistice est signé.<br>Les combats prennent fin.</p>

                    <h3>C. Un bilan humain et matériel catastrophique</h3>
                    <p><strong>Bilan humain :</strong></p>
                    <ul>
                        <li>environ <strong>10 millions de morts</strong> ;</li>
                        <li>environ <strong>20 millions de blessés</strong>.</li>
                    </ul>
                    <p><strong>Bilan matériel :</strong><br>Des villes et des régions entières sont détruites.</p>
                    <p><strong>Bilan moral :</strong><br>Les populations sont profondément traumatisées.</p>
                </div>

            </div>
        `,
        quiz: [
            // PARTIE 1 : ORIGINES ET ENTRÉE EN GUERRE (Questions 1 à 13)
            { q: "Au début du XXe siècle, comment est l'Europe ?", options: ["Unie et pacifique", "Divisée par de nombreuses rivalités", "Entièrement sous domination russe"], answer: 1 },
            { q: "Quels pays composent la Triple-Entente ?", options: ["France, Royaume-Uni, Russie", "Allemagne, Autriche-Hongrie, Italie", "France, Italie, États-Unis"], answer: 0 },
            { q: "Quels pays composent la Triple-Alliance ?", options: ["France, Royaume-Uni, Russie", "Allemagne, Autriche-Hongrie, Italie", "Allemagne, Empire Ottoman, Bulgarie"], answer: 1 },
            { q: "Que se passe-t-il le 28 juin 1914 ?", options: ["L'armistice est signé", "L'archiduc François-Ferdinand est assassiné", "La bataille de la Marne commence"], answer: 1 },
            { q: "Où l'archiduc François-Ferdinand a-t-il été assassiné ?", options: ["À Paris", "À Berlin", "À Sarajevo"], answer: 2 },
            { q: "Quel événement déclenche directement la crise diplomatique menant à la guerre ?", options: ["L'assassinat de Sarajevo", "La construction des tranchées", "La révolution russe"], answer: 0 },
            { q: "À quelle date l'Autriche-Hongrie déclare-t-elle la guerre à la Serbie ?", options: ["28 juin 1914", "28 juillet 1914", "11 novembre 1914"], answer: 1 },
            { q: "Qui déclare la guerre à la Serbie le 28 juillet 1914 ?", options: ["L'Allemagne", "La France", "L'Autriche-Hongrie"], answer: 2 },
            { q: "Comment s'appelle la première phase de la guerre en 1914 ?", options: ["La guerre de position", "La guerre de mouvement", "La guerre des tranchées"], answer: 1 },
            { q: "Qu'espère chaque camp au tout début du conflit ?", options: ["Une victoire rapide", "Une guerre de position de plusieurs années", "Négocier immédiatement la paix"], answer: 0 },
            { q: "Vers quelle ville les Allemands avancent-ils en 1914 ?", options: ["Vers Moscou", "Vers Paris", "Vers Londres"], answer: 1 },
            { q: "Lors de quelle bataille les Allemands sont-ils arrêtés en 1914 ?", options: ["La bataille de Verdun", "La bataille de la Marne", "La bataille de la Somme"], answer: 1 },
            { q: "Entre quelles années se déroule la guerre de position ?", options: ["1914-1918", "1915-1917", "1916-1918"], answer: 1 },

            // PARTIE 1 SUITE & PARTIE 2 : GUERRE DE POSITION, TRANCHÉES (Questions 14 à 25)
            { q: "Que font les soldats pendant la guerre de position ?", options: ["Ils se déplacent en chars d'assaut", "Ils creusent des tranchées", "Ils reculent jusqu'à Paris"], answer: 1 },
            { q: "Qu'arrive-t-il au front durant la guerre de position ?", options: ["Il avance très rapidement", "Il se stabilise", "Il disparaît complètement"], answer: 1 },
            { q: "La stabilisation du front face à face pendant des années provoque...", options: ["Une paix temporaire", "Une guerre extrêmement meurtrière", "Une intervention des États-Unis dès 1915"], answer: 1 },
            { q: "Qu'est-ce que la guerre a mobilisé en se développant ?", options: ["Les progrès de l'industrie", "Uniquement des volontaires", "Des armes médiévales"], answer: 0 },
            { q: "Laquelle de ces armes apparaît à cause du progrès industriel de la guerre ?", options: ["L'épée en acier", "Les gaz de combat", "Le canon en bronze"], answer: 1 },
            { q: "Parmi cette liste, quelles armes modernes apparaissent durant ce conflit ?", options: ["Mitrailleuses, canons, grenades, gaz, chars, avions", "Catapultes, fusils, arcs", "Uniquement les navires de guerre"], answer: 0 },
            { q: "Quel niveau atteignent les pertes humaines à cause des nouvelles armes ?", options: ["Un niveau faible", "Un niveau jamais vu auparavant", "Le même niveau que les guerres précédentes"], answer: 1 },
            { q: "Dans quelles conditions vivent les soldats dans les tranchées ?", options: ["Des conditions confortables", "Des conditions très difficiles", "Des abris chauffés"], answer: 1 },
            { q: "Quels fléaux biologiques subissent les poilus dans les tranchées ?", options: ["Des scorpions", "Des rats et des poux", "Des serpents"], answer: 1 },
            { q: "Quels éléments climatiques et d'hygiène compliquent la vie dans les tranchées ?", options: ["Le froid, la boue, l'humidité, le manque d'hygiène", "La sécheresse extrême", "L'excès d'eau potable"], answer: 0 },
            { q: "Quel sentiment psychologique est permanent chez les soldats ?", options: ["L'ennui total", "Un stress permanent et la peur de mourir", "L'excitation du combat"], answer: 1 },
            { q: "Quels mois encadrent la bataille de Verdun ?", options: ["Janvier à août 1914", "Février à décembre 1916", "Mars à novembre 1917"], answer: 1 },

            // PARTIE 2 SUITE & PARTIE 3 : VERDUN, MUTINERIES, CIVILS (Questions 26 à 38)
            { q: "De quoi la bataille de Verdun devient-elle le symbole ?", options: ["De la fin de la guerre", "De la violence de la guerre", "De la supériorité de la cavalerie"], answer: 1 },
            { q: "Comment qualifier les combats de la bataille de Verdun ?", options: ["Stratégiques mais peu mortels", "Extrêmement meurtriers", "Principalement aériens"], answer: 1 },
            { q: "Quel type d'attaques subissent les soldats de Verdun de manière incessante ?", options: ["Des charges de cavalerie", "Des bombardements", "Des embuscades nocturnes"], answer: 1 },
            { q: "Quel est le bilan humain approximatif de la seule bataille de Verdun ?", options: ["30 000 morts et 40 000 blessés", "Environ 300 000 morts et plus de 400 000 blessés", "1 million de morts"], answer: 1 },
            { q: "Que se passe-t-il chez les soldats en 1917 après plusieurs années de guerre ?", options: ["Ils fêtent la victoire", "Des mutineries éclatent car ils sont épuisés", "Ils désertent tous pour aller en Amérique"], answer: 1 },
            { q: "Que réclament les soldats lors des mutineries de 1917 ?", options: ["Plus d'armes lourdes", "Du repos, de meilleures conditions et l'arrêt des offensives inutiles", "Une augmentation de salaire uniquement"], answer: 1 },
            { q: "Quel général rétablit progressivement la situation lors des mutineries de 1917 ?", options: ["Le général de Gaulle", "Le général Pétain", "Le général Joffre"], answer: 1 },
            { q: "Qui est concerné par la mobilisation générale lors de ce conflit ?", options: ["Uniquement les militaires", "Toute la société", "Seulement les habitants de Paris"], answer: 1 },
            { q: "Quelles catégories de civils l'État mobilise-t-il pour l'effort de guerre ?", options: ["Les ouvriers, les paysans, les administrations, les entreprises", "Uniquement les enfants", "Seulement les prisonniers"], answer: 0 },
            { q: "Vers quoi est entièrement tournée l'économie des pays en guerre ?", options: ["Vers le commerce international", "Vers la guerre", "Vers l'agriculture de loisir"], answer: 1 },
            { q: "Qui remplace les hommes partis combattre au front ?", options: ["Les personnes âgées", "Les femmes", "Les soldats étrangers uniquement"], answer: 1 },
            { q: "Où les femmes travaillent-elles activement pendant la guerre ?", options: ["Dans les usines, les transports, les champs, les services publics", "Uniquement à la maison", "Dans les états-majors au front"], answer: 0 },
            { q: "Comment devient le rôle des femmes durant la Première Guerre mondiale ?", options: ["Secondaire", "Essentiel", "Inexistant"], answer: 1 },

            // PARTIE 3 SUITE & PARTIE 4 : PROPAGANDE, GÉNOCIDE, FIN DE LA GUERRE (Questions 39 à 50)
            { q: "Pourquoi les gouvernements utilisent-ils la propagande et la censure ?", options: ["Pour faire peur à la population", "Pour maintenir le moral de la population", "Pour gagner de l'argent"], answer: 1 },
            { q: "Quels supports utilise l'État pour faire de la propagande ?", options: ["Les affiches, les journaux et les discours patriotiques", "Les livres d'histoire uniquement", "Les réseaux de communication"], answer: 0 },
            { q: "En quoi consiste la censure mise en place par les États ?", options: ["À distribuer des journaux gratuits", "Au contrôle des informations diffusées", "À couper l'électricité"], answer: 1 },
            { q: "Que fait-on des mauvaises nouvelles sous le régime de la censure ?", options: ["Elles sont exagérées", "Elles sont souvent dissimulées", "Elles sont lues à la radio"], answer: 1 },
            { q: "Quel événement tragique se produit en 1915 dans l'Empire ottoman ?", options: ["L'entrée en guerre des États-Unis", "Le génocide des Arméniens", "La fin des mutineries"], answer: 1 },
            { q: "Qui organise la déportation et l'extermination des Arméniens en 1915 ?", options: ["L'Empire ottoman", "L'Allemagne", "L'Empire russe"], answer: 0 },
            { q: "Combien d'Arméniens meurent durant le génocide de 1915 ?", options: ["Entre 10 000 et 50 000", "Entre 1 et 1,5 million", "Plus de 5 millions"], answer: 1 },
            { q: "Quelle place occupe le massacre des Arméniens dans l'histoire du XXe siècle ?", options: ["C'est une révolte classique", "Il est considéré comme le premier génocide du XXe siècle", "C'est un fait divers"], answer: 1 },
            { q: "Quels sont les deux événements majeurs qui font de 1917 un tournant ?", options: ["La bataille de Verdun et l'utilisation des gaz", "La Révolution russe et l'entrée en guerre des États-Unis", "La mort de l'archiduc et la bataille de la Marne"], answer: 1 },
            { q: "Quelle est la situation de l'Allemagne en 1918 ?", options: ["Elle est plus puissante que jamais", "Elle est affaiblie", "Elle a envahi la Russie"], answer: 1 },
            { q: "Que se passe-t-il le 11 novembre 1918 ?", options: ["Le traité de Versailles est signé", "L'armistice est signé et les combats prennent fin", "La guerre de position commence"], answer: 1 },
            { q: "Quel est le bilan humain et moral global de la Première Guerre mondiale ?", options: ["1 million de morts et populations indifférentes", "Environ 10 millions de morts, 20 millions de blessés et un traumatisme profond", "Aucun mort civil, uniquement des destructions matérielles"], answer: 1 }
        ]
    },
   francais: {
        title: "✍️ Français",
        fiches: `
            <!-- STYLE DE SÉCURITÉ CONTRE LE TEXTE BLANC ET MISE EN PAGE -->
            <style>
                .fr-app-container { color: #1e293b !important; font-family: system-ui, -apple-system, sans-serif; padding: 5px; }
                .fr-app-container h3 { color: #0f172a !important; margin-top: 25px; margin-bottom: 12px; font-size: 1.35em; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; }
                .fr-app-container h4 { color: #1e293b !important; margin-top: 18px; margin-bottom: 8px; font-size: 1.1em; font-weight: bold; }
                .fr-app-container p, .fr-app-container li { color: #334155 !important; line-height: 1.6; font-size: 1rem; }
                .fr-app-container strong { color: #0f172a !important; }
                
                /* Boutons de la page d'accueil */
                .btn-chapitre-fr { width: 100%; padding: 16px; color: white !important; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.05rem; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 4px; transition: transform 0.1s; display: block; }
                .btn-chapitre-fr:active { transform: scale(0.99); }
                
                /* Bouton de retour en arrière */
                .btn-retour-fr { display: inline-flex; align-items: center; margin-bottom: 20px; padding: 12px 20px; background: #475569; color: white !important; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .btn-retour-fr:active { transform: scale(0.97); }
                
                /* Conteneurs de cours (masqués par défaut) */
                .fr-ecran-cours { background: #ffffff !important; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                
                /* Listes */
                .fr-app-container ul, .fr-app-container ol { padding-left: 20px; margin-bottom: 15px; }
                .fr-app-container li { margin-bottom: 6px; }
                
                /* Encadrés figures */
                .figure-box { background: #f8fafc; padding: 12px; border-left: 4px solid #0d9488; margin-bottom: 15px; border-radius: 0 6px 6px 0; }
            </style>

            <div class="fr-app-container">
                
                <!-- ================= ÉCRAN 1 : PAGE D'ACCUEIL (MENU DES CHAPITRES) ================= -->
                <div id="fr-menu-principal" style="display: block;">
                    <p style="text-align: center; font-weight: bold; margin-bottom: 22px; color: #475569;">Sélectionnez une sous-partie pour ouvrir le cours :</p>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        
                        <button class="btn-chapitre-fr" style="background: #4f46e5;" 
                                onclick="document.getElementById('fr-menu-principal').style.display='none'; document.getElementById('fr-cours-partie1').style.display='block'; window.scrollTo(0,0);">
                            🎭 PARTIE 1 : LES REGISTRES LITTÉRAIRES
                        </button>
                        
                        <button class="btn-chapitre-fr" style="background: #0ea5e9;" 
                                onclick="document.getElementById('fr-menu-principal').style.display='none'; document.getElementById('fr-cours-partie2').style.display='block'; window.scrollTo(0,0);">
                            📖 PARTIE 2 : LE TEXTE NARRATIF
                        </button>
                        
                        <button class="btn-chapitre-fr" style="background: #e11d48;" 
                                onclick="document.getElementById('fr-menu-principal').style.display='none'; document.getElementById('fr-cours-partie3').style.display='block'; window.scrollTo(0,0);">
                            ⏳ PARTIE 3 : LES TEMPS DU RÉCIT
                        </button>
                        
                        <button class="btn-chapitre-fr" style="background: #0d9488;" 
                                onclick="document.getElementById('fr-menu-principal').style.display='none'; document.getElementById('fr-cours-partie4').style.display='block'; window.scrollTo(0,0);">
                            ✨ PARTIE 4 : LES FIGURES DE STYLE (COURS COMPLÈT)
                        </button>
                        
                    </div>
                </div>


                <!-- ================= ÉCRAN 2 : CONTENU DE LA PARTIE 1 ================= -->
                <div id="fr-cours-partie1" class="fr-ecran-cours" style="display: none; border-top: 6px solid #4f46e5;">
                    <button class="btn-retour-fr" onclick="document.getElementById('fr-cours-partie1').style.display='none'; document.getElementById('fr-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux chapitres</button>
                    <div style="background: #4f46e5; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 20px;">PARTIE 1 : LES REGISTRES LITTÉRAIRES</div>
                    
                    <h3>A. Le registre lyrique</h3>
                    <h4>Définition :</h4>
                    <p>Le registre lyrique est utilisé lorsqu'un auteur souhaite exprimer ses sentiments personnels, ses émotions ou son état d'esprit.<br>Le mot « lyrique » vient de la lyre, un instrument de musique utilisé dans l'Antiquité pour accompagner les poèmes chantés.<br>Dans un texte lyrique, l'auteur parle souvent de lui-même et partage ce qu'il ressent profondément.</p>
                    
                    <h4>À quoi sert le registre lyrique ?</h4>
                    <p>Le registre lyrique sert à :</p>
                    <ul>
                        <li>exprimer des émotions ;</li>
                        <li>faire partager des sentiments au lecteur ;</li>
                        <li>évoquer des souvenirs ;</li>
                        <li>montrer les états d'âme d'un personnage ou d'un auteur.</li>
                    </ul>
                    <p>Le but est souvent de créer une émotion chez le lecteur afin qu'il ressente ce que ressent l'auteur.</p>
                    
                    <h4>Les thèmes fréquents :</h4>
                    <p>Le registre lyrique aborde souvent : l'amour, la tristesse, la nostalgie, le bonheur, la solitude, le temps qui passe, la mort, les souvenirs.</p>
                    
                    <h4>Comment le reconnaître ?</h4>
                    <p>On observe souvent : le pronom « je », le vocabulaire des sentiments, des phrases exclamatives, des figures de style, un ton personnel.</p>
                    
                    <h4>Les figures de style fréquentes :</h4>
                    <p>Les auteurs utilisent souvent : la comparaison, la métaphore, l'anaphore, la personnification, l'hyperbole. Ces procédés permettent de rendre les émotions plus fortes.</p>
                    
                    <h4>Effet produit sur le lecteur :</h4>
                    <p>Le lecteur peut : être ému, ressentir de la compassion, partager les émotions du narrateur.</p>
                    
                    <h4>Exemple d'analyse :</h4>
                    <p style="background: #f1f5f9; padding: 10px; border-radius: 6px; font-style: italic;">Si un poète évoque la perte d'un être cher et décrit sa tristesse, on peut dire : « Le registre lyrique est utilisé pour exprimer la douleur et la nostalgie ressenties par le poète. »</p>

                    <h3>B. Le registre tragique</h3>
                    <h4>Définition :</h4>
                    <p>Le registre tragique montre un personnage confronté à un destin qu'il ne peut pas éviter. Même lorsqu'il essaie d'agir, il ne peut pas échapper à sa situation.</p>
                    
                    <h4>À quoi sert-il ?</h4>
                    <p>Il sert à montrer : l'impuissance humaine, la fatalité, le destin, les souffrances des personnages.</p>
                    
                    <h4>Les thèmes fréquents :</h4>
                    <p>La mort, le destin, le sacrifice, la guerre, les conflits familiaux.</p>
                    
                    <h4>Comment le reconnaître ?</h4>
                    <p>On trouve souvent : un vocabulaire de la souffrance, des références au destin, des situations sans issue, des personnages condamnés.</p>
                    
                    <h4>Effet produit :</h4>
                    <p>Le lecteur ressent : de la pitié, de la peur, de la compassion.</p>
                </div>


                <!-- ================= ÉCRAN 3 : CONTENU DE LA PARTIE 2 ================= -->
                <div id="fr-cours-partie2" class="fr-ecran-cours" style="display: none; border-top: 6px solid #0ea5e9;">
                    <button class="btn-retour-fr" onclick="document.getElementById('fr-cours-partie2').style.display='none'; document.getElementById('fr-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux chapitres</button>
                    <div style="background: #0ea5e9; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 20px;">PARTIE 2 : LE TEXTE NARRATIF</div>
                    
                    <h3>A. Qu'est-ce qu'un texte narratif ?</h3>
                    <h4>Définition :</h4>
                    <p>Un texte narratif est un texte qui raconte une histoire. Cette histoire peut être réelle, inspirée de faits réels, ou totalement imaginaire.<br>On retrouve le texte narratif dans : les romans, les nouvelles, les contes, les légendes, les récits autobiographiques.</p>
                    
                    <h4>À quoi sert un texte narratif ?</h4>
                    <p>Le texte narratif sert à : raconter des événements, divertir, transmettre un message, faire réfléchir, dénoncer certaines situations.</p>

                    <h3>B. Les éléments essentiels du récit</h3>
                    <p><strong>Le narrateur :</strong> Le narrateur est celui qui raconte l'histoire. <em>Attention : Le narrateur n'est pas forcément l'auteur.</em></p>
                    
                    <h4>Les différents types de narrateurs :</h4>
                    <p>• <strong>Narrateur interne :</strong> Le narrateur participe à l'histoire. Il utilise souvent : <em>je, nous</em>. Le lecteur découvre les événements à travers son regard.<br>
                    • <strong>Narrateur externe :</strong> Le narrateur ne participe pas à l'histoire. Il raconte ce qu'il voit de l'extérieur. Il utilise généralement : <em>il, elle, ils</em>.<br>
                    • <strong>Narrateur omniscient :</strong> Le narrateur sait tout. Il connaît les pensées, les sentiments, le passé, l'avenir des personnages.</p>
                    
                    <h4>Pourquoi est-ce important ?</h4>
                    <p>Le type de narrateur influence les informations reçues par le lecteur.</p>

                    <h3>C. Les étapes du récit (Schéma actanciel/narratif)</h3>
                    <p>1. <strong>Situation initiale :</strong> Elle présente les personnages, le lieu, l'époque, la situation de départ. C'est un moment d'équilibre.<br>
                    2. <strong>Élément perturbateur :</strong> C'est l'événement qui bouleverse l'équilibre. Il déclenche l'histoire.<br>
                    3. <strong>Péripéties :</strong> Ce sont toutes les aventures vécues par les personnages. Elles constituent la plus grande partie du récit.<br>
                    4. <strong>Dénouement :</strong> C'est le moment où le problème principal est résolu.<br>
                    5. <strong>Situation finale :</strong> Le récit retrouve un nouvel équilibre.</p>
                </div>


                <!-- ================= ÉCRAN 4 : CONTENU DE LA PARTIE 3 ================= -->
                <div id="fr-cours-partie3" class="fr-ecran-cours" style="display: none; border-top: 6px solid #e11d48;">
                    <button class="btn-retour-fr" onclick="document.getElementById('fr-cours-partie3').style.display='none'; document.getElementById('fr-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux chapitres</button>
                    <div style="background: #e11d48; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 20px;">PARTIE 3 : LES TEMPS DU RÉCIT</div>
                    
                    <h3>A. Le passé simple</h3>
                    <h4>Définition :</h4>
                    <p>Le passé simple est un temps du passé principalement utilisé dans les récits écrits. On le rencontre surtout dans : les romans, les contes, les nouvelles. Il est très peu utilisé à l'oral.</p>
                    
                    <h4>À quoi sert-il ?</h4>
                    <p>Le passé simple sert à raconter : une action brève, une action précise, une action terminée. Il fait avancer l'histoire.</p>
                    <p><strong>Exemple :</strong> <em>« Il ouvrit la porte et entra dans la maison. »</em> Les actions sont rapides et successives.</p>
                    
                    <h4>Effet produit :</h4>
                    <p>Le récit progresse rapidement. Le lecteur suit les événements importants.</p>

                    <h3>B. L'imparfait</h3>
                    <h4>Définition :</h4>
                    <p>L'imparfait est un temps du passé utilisé pour décrire.</p>
                    
                    <h4>À quoi sert-il ?</h4>
                    <p>Il sert à : décrire un personnage, décrire un lieu, évoquer une habitude, présenter une action longue.</p>
                    <p><strong>Exemple :</strong> <em>« La maison était grande et les arbres entouraient le jardin. »</em> Ici, rien ne fait avancer l'histoire. Le texte décrit simplement le décor.</p>
                    
                    <h4>Effet produit :</h4>
                    <p>Le lecteur peut imaginer la scène.</p>

                    <h3>C. Différence entre imparfait et passé simple</h3>
                    <p>• <strong>Imparfait :</strong> description ; habitude ; action longue.<br>
                    • <strong>Passé simple :</strong> action brève ; événement important ; progression du récit.</p>
                    <p><strong>Exemple global :</strong> <em>« Il marchait dans la forêt lorsque soudain il aperçut un loup. »</em><br>
                    • <code>marchait</code> = imparfait (action longue / arrière-plan)<br>
                    • <code>aperçut</code> = passé simple (action soudaine / premier plan)</p>
                </div>


                <!-- ================= ÉCRAN 5 : CONTENU DE LA PARTIE 4 ================= -->
                <div id="fr-cours-partie4" class="fr-ecran-cours" style="display: none; border-top: 6px solid #0d9488;">
                    <button class="btn-retour-fr" onclick="document.getElementById('fr-cours-partie4').style.display='none'; document.getElementById('fr-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux chapitres</button>
                    <div style="background: #0d9488; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 20px;">PARTIE 4 : LES FIGURES DE STYLE (COURS COMPLET)</div>
                    
                    <div class="figure-box">
                        <h4>1. L’ASSONANCE</h4>
                        <p><strong>Définition :</strong> Répétition d’un même son de voyelle dans une phrase ou un vers.<br>
                        <strong>Utilité & Effet :</strong> Créer une musicalité, insister sur une ambiance poétique ou inquiétante.<br>
                        <strong>Exemple :</strong> <em>« Les serpents glissants sifflent dans la nuit. »</em></p>
                    </div>

                    <div class="figure-box">
                        <h4>2. L’ALLITÉRATION</h4>
                        <p><strong>Définition :</strong> Répétition d’un même son de consonne.<br>
                        <strong>Utilité & Effet :</strong> Créer un effet sonore, imiter un bruit (sifflement, choc) et renforcer une idée.<br>
                        <strong>Exemple :</strong> <em>« Pour qui sont ces serpents qui sifflent sur vos têtes ? »</em></p>
                    </div>

                    <div class="figure-box">
                        <h4>3. L’ANAPHORE</h4>
                        <p><strong>Définition :</strong> Répétition d’un mot ou groupe de mots en début de phrase ou de vers.<br>
                        <strong>Utilité & Effet :</strong> Insister sur une idée, créer un rythme, renseigner ou renforcer l’émotion.<br>
                        <strong>Exemple :</strong> <em>« J’ai rêvé de toi, / J’ai pensé à toi, / J’ai attendu ton retour. »</em></p>
                    </div>

                    <div class="figure-box">
                        <h4>4. LA RÉPÉTITION</h4>
                        <p><strong>Définition :</strong> Répéter un mot ou une expression dans un texte.<br>
                        <strong>Utilité & Effet :</strong> Insister sur une idée importante, créer un effet dramatique fort.<br>
                        <strong>Exemple :</strong> <em>« C’est fini, fini, fini. »</em></p>
                    </div>

                    <div class="figure-box">
                        <h4>5. LA MÉTONYMIE</h4>
                        <p><strong>Définition :</strong> Remplacer un mot par un autre avec lequel il a un lien logique.<br>
                        <strong>Utilité & Effet :</strong> Rendre le langage plus rapide et imagé, simplifier l’expression.<br>
                        <strong>Exemple :</strong> <em>« Boire un verre »</em> (au lieu du contenu du verre).</p>
                    </div>

                    <div class="figure-box">
                        <h4>6. LA PÉRIPHRASE</h4>
                        <p><strong>Définition :</strong> Dire quelque chose en plusieurs mots au lieu d’un seul.<br>
                        <strong>Utilité & Effet :</strong> Créer un effet poétique, donner une image plus riche ou éviter la répétition.<br>
                        <strong>Exemple :</strong> <em>« La ville lumière »</em> pour Paris.</p>
                    </div>

                    <div class="figure-box">
                        <h4>7. LA COMPARAISON</h4>
                        <p><strong>Définition :</strong> Comparer deux éléments avec un outil comparatif (comme, tel, pareil à, semblable à).<br>
                        <strong>Utilité & Effet :</strong> Aide à visualiser une scène ou une idée.<br>
                        <strong>Exemple :</strong> <em>« Il est rapide comme le vent. »</em></p>
                    </div>

                    <div class="figure-box">
                        <h4>8. LA MÉTAPHORE</h4>
                        <p><strong>Définition :</strong> Comparaison directe sans outil comparatif.<br>
                        <strong>Utilité & Effet :</strong> Créer une image plus forte, plus directe et poétique.<br>
                        <strong>Exemple :</strong> <em>« Cet homme est un lion. »</em></p>
                    </div>

                    <div class="figure-box">
                        <h4>9. LA PERSONNIFICATION</h4>
                        <p><strong>Définition :</strong> Donner des caractéristiques humaines à un objet ou un animal.<br>
                        <strong>Utilité & Effet :</strong> Rend le texte plus vivant et expressif.<br>
                        <strong>Exemple :</strong> <em>« Le vent hurle dans la nuit. »</em></p>
                    </div>

                    <div class="figure-box">
                        <h4>10. L’ALLÉGORIE</h4>
                        <p><strong>Définition :</strong> Représentation concrète d’une idée abstraite.<br>
                        <strong>Utilité & Effet :</strong> Permet de matérialiser ou symboliser un concept général.<br>
                        <strong>Exemple :</strong> Une femme avec une balance = la Justice.</p>
                    </div>

                    <div class="figure-box">
                        <h4>11. LE CHIASME</h4>
                        <p><strong>Définition :</strong> Construction symétrique en miroir suivant l'ordre AB / BA.<br>
                        <strong>Utilité & Effet :</strong> Renforce l’opposition, crée un rythme marquant et invite à la réflexion.<br>
                        <strong>Exemple :</strong> <em>« Il faut manger pour vivre et non vivre pour manger. »</em></p>
                    </div>

                    <div class="figure-box">
                        <h4>12. L’ANTIPHRASE</h4>
                        <p><strong>Définition :</strong> Dire le contraire de ce qu’on pense réellement.<br>
                        <strong>Utilité & Effet :</strong> Créer de l’ironie ou une moquerie évidente.<br>
                        <strong>Exemple :</strong> <em>« Quel temps magnifique ! »</em> (en pleine tempête).</p>
                    </div>

                    <div class="figure-box">
                        <h4>13. L’OXYMORE</h4>
                        <p><strong>Définition :</strong> Associer deux mots de sens opposés côte à côte.<br>
                        <strong>Utilité & Effet :</strong> Crée un effet poétique saisissant ou surprenant.<br>
                        <strong>Exemple :</strong> <em>« Une obscure clarté »</em>.</p>
                    </div>

                    <div class="figure-box">
                        <h4>14. L’ANTITHÈSE</h4>
                        <p><strong>Définition :</strong> Opposer deux idées ou deux expressions contrastées dans une même phrase.<br>
                        <strong>Utilité & Effet :</strong> Mettre puissamment en valeur le contraste entre deux notions.<br>
                        <strong>Exemple :</strong> <em>« Je vis, je meurs. »</em></p>
                    </div>

                    <div class="figure-box">
                        <h4>15. L’HYPERBOLE</h4>
                        <p><strong>Définition :</strong> Exagération volontaire des termes.<br>
                        <strong>Utilité & Effet :</strong> Renforce une émotion, met en valeur une situation dramatique ou comique.<br>
                        <strong>Exemple :</strong> <em>« Je meurs de faim. »</em></p>
                    </div>

                    <div class="figure-box">
                        <h4>16. LA GRADATION</h4>
                        <p><strong>Définition :</strong> Suite de mots ordonnés allant du moins fort au plus fort (croissante) ou inversement.<br>
                        <strong>Utilité & Effet :</strong> Augmente ou diminue l’intensité dramatique de manière progressive.<br>
                        <strong>Exemple :</strong> <em>« Je suis fatigué, épuisé, mort. »</em></p>
                    </div>

                    <div class="figure-box">
                        <h4>17. L’ÉNUMÉRATION</h4>
                        <p><strong>Définition :</strong> Liste de plusieurs éléments de même nature.<br>
                        <strong>Utilité & Effet :</strong> Donne du détail, clarifie une description.<br>
                        <strong>Exemple :</strong> <em>« J’aime le foot, le basket, le tennis et la natation. »</em></p>
                    </div>

                    <div class="figure-box">
                        <h4>18. L’ACCUMULATION</h4>
                        <p><strong>Définition :</strong> Énumération très longue qui crée un effet de profusion ou d'excès.<br>
                        <strong>Utilité & Effet :</strong> Crée un effet de surcharge, d'oppression ou d'insistance forte.<br>
                        <strong>Exemple :</strong> <em>« Il avait faim, soif, froid, peur, fatigue… »</em></p>
                    </div>

                    <div class="figure-box">
                        <h4>19. LA LITOTE</h4>
                        <p><strong>Définition :</strong> Dire moins pour en faire entendre et exprimer plus (souvent par une négation).<br>
                        <strong>Utilité & Effet :</strong> Atténue en apparence mais renforce l’idée sous-jacente.<br>
                        <strong>Exemple :</strong> <em>« Ce n’est pas mauvais »</em> (pour dire que c’est excellent).</p>
                    </div>

                    <div class="figure-box">
                        <h4>20. L’EUPHÉMISME</h4>
                        <p><strong>Définition :</strong> Atténuer une réalité choquante, violente ou triste.<br>
                        <strong>Utilité & Effet :</strong> Rend une idée plus douce, respectueuse ou supportable.<br>
                        <strong>Exemple :</strong> <em>« Il nous a quittés »</em> (pour dire qu’il est mort).</p>
                    </div>
                </div>

            </div>
        `,
        quiz: [
            // PARTIE 1 : REGISTRES LITTÉRAIRES (Questions 1 à 12)
            { q: "Quel registre utilise-t-on pour exprimer des sentiments personnels et des émotions ?", options: ["Le registre tragique", "Le registre lyrique", "Le registre comique"], answer: 1 },
            { q: "D'où vient historiquement le mot « lyrique » ?", options: ["D'un type de livre ancien", "De la lyre, un instrument de musique antique", "D'une divinité romaine"], answer: 1 },
            { q: "Dans un texte lyrique, de qui l'auteur parle-t-il le plus souvent ?", options: ["De l'histoire de son pays", "De lui-même", "D'un ennemi imaginaire"], answer: 1 },
            { q: "Quel est le but principal recherché par le registre lyrique chez le lecteur ?", options: ["Le faire rire", "Créer une émotion afin qu'il partage ce que ressent l'auteur", "Le faire douter"], answer: 1 },
            { q: "Lequel de ces thèmes appartient fréquemment au registre lyrique ?", options: ["Les tactiques de guerre", "L'amour, la tristesse et le temps qui passe", "Les lois de la physique"], answer: 1 },
            { q: "Quel pronom personnel trouve-t-on le plus fréquemment dans un texte lyrique ?", options: ["Il / Elle", "Je", "Ils / Elles"], answer: 1 },
            { q: "Parmi ces indices, lequel permet de reconnaître le registre lyrique ?", options: ["Un vocabulaire scientifique", "Des phrases exclamatives et le vocabulaire des sentiments", "Des dates précises"], answer: 1 },
            { q: "Pourquoi les auteurs lyriques utilisent-ils des figures de style ?", options: ["Pour cacher des messages secrets", "Pour rendre les émotions plus fortes", "Pour réduire la longueur du texte"], answer: 1 },
            { q: "Que montre fondamentalement le registre tragique ?", options: ["Un personnage qui fait des blagues", "Un personnage confronté à un destin inévitable", "Une description de paysage"], answer: 1 },
            { q: "À quoi sert le registre tragique ?", options: ["À divertir le lecteur", "À montrer l'impuissance humaine et la fatalité", "À expliquer des faits historiques"], answer: 1 },
            { q: "Lequel de ces thèmes est récurrent dans le registre tragique ?", options: ["La joie de vivre", "La mort, le destin et le sacrifice", "Le voyage humoristique"], answer: 1 },
            { q: "Quels sentiments le registre tragique produit-il chez le lecteur ?", options: ["De la pitié, de la peur et de la compassion", "Du rire et de la gaieté", "De l'indifférence totale"], answer: 0 },

            // PARTIE 2 : LE TEXTE NARRATIF (Questions 13 à 25)
            { q: "Quelle est la définition exacte d'un texte narratif ?", options: ["Un texte qui donne des ordres", "Un texte qui raconte une histoire", "Un texte qui donne des définitions"], answer: 1 },
            { q: "Une histoire racontée dans un texte narratif peut être...", options: ["Uniquement réelle", "Uniquement imaginaire", "Réelle, inspirée de faits réels ou totalement imaginaire"], answer: 2 },
            { q: "Dans quel type d'ouvrage rencontre-t-on le texte narratif ?", options: ["Dans un dictionnaire", "Dans les romans, nouvelles, contes et récits autobiographiques", "Dans un manuel de mathématiques"], answer: 1 },
            { q: "Qui est le narrateur dans un récit ?", options: ["L'éditeur du livre", "Celui qui raconte l'histoire", "L'imprimeur"], answer: 1 },
            { q: "Le narrateur d'une histoire est-il forcément l'auteur du livre ?", options: ["Oui, c'est toujours la même personne", "Non, le narrateur n'est pas forcément l'auteur", "Seulement dans les contes"], answer: 1 },
            { q: "Qu'est-ce qu'un narrateur interne ?", options: ["Un narrateur qui ne sait rien", "Un narrateur qui participe à l'histoire", "Un narrateur extérieur au livre"], answer: 1 },
            { q: "Quels pronoms utilise principalement un narrateur interne ?", options: ["Il ou Elle", "Je ou Nous", "Tu ou Vous"], answer: 1 },
            { q: "Qu'est-ce qu'un narrateur externe ?", options: ["Un personnage principal", "Un narrateur qui ne participe pas à l'histoire et raconte de l'extérieur", "Un narrateur qui connaît le futur"], answer: 1 },
            { q: "Qu'est-ce qu'un narrateur omniscient ?", options: ["Un narrateur qui se trompe souvent", "Un narrateur qui sait tout (pensées, sentiments, passé, avenir)", "Un narrateur interne"], answer: 1 },
            { q: "Quelle est la première étape du schéma narratif ?", options: ["L'élément perturbateur", "La situation initiale", "Le dénouement"], answer: 1 },
            { q: "Comment définit-on la situation initiale ?", options: ["Une bataille géante", "Un moment d'équilibre présentant les personnages, le lieu et l'époque", "La fin de l'histoire"], answer: 1 },
            { q: "Quel élément vient rompre l'équilibre de la situation initiale ?", options: ["Les péripéties", "L'élément perturbateur", "La situation finale"], answer: 1 },
            { q: "Que représentent les péripéties dans un récit ?", options: ["La première phrase du texte", "Toutes les aventures vécues par les personnages", "La résolution du problème"], answer: 1 },

            // PARTIE 2 SUITE & PARTIE 3 : SCHÉMA ET TEMPS DU RÉCIT (Questions 26 à 35)
            { q: "Qu'est-ce que le dénouement ?", options: ["Le début du problème", "Le moment où le problème principal est résolu", "L'apparition du narrateur"], answer: 1 },
            { q: "Que retrouve le récit lors de la situation finale ?", options: ["Un nouvel équilibre", "Le même problème qu'au début", "Une absence de personnages"], answer: 0 },
            { q: "Où rencontre-t-on principalement le passé simple ?", options: ["Dans les conversations orales quotidiennes", "Dans les récits écrits (romans, contes, nouvelles)", "Dans les articles scientifiques contemporains"], answer: 1 },
            { q: "À quoi sert principalement le passé simple de l'indicatif ?", options: ["À faire des descriptions de paysages", "À raconter une action brève, précise et terminée", "À exprimer une habitude"], answer: 1 },
            { q: "Quel est l'effet du passé simple sur le récit ?", options: ["Il ralentit l'action", "Il fait progresser le récit rapidement", "Il empêche de comprendre la fin"], answer: 1 },
            { q: "Quelle est la fonction principale de l'imparfait dans un récit ?", options: ["Faire progresser l'histoire de façon urgente", "Servir à décrire (personnage, lieu, habitude, action longue)", "Clore le récit"], answer: 1 },
            { q: "Dans 'La maison était grande', quel est le rôle de l'imparfait ?", options: ["Il décrit simplement le décor sans faire avancer l'histoire", "Il indique une action soudaine", "Il résout l'intrigue"], answer: 0 },
            { q: "Pour une action longue ou d'arrière-plan dans le passé, on utilise...", options: ["Le passé simple", "L'imparfait", "Le présent"], answer: 1 },
            { q: "Pour un événement soudain qui fait progresser l'histoire, on utilise...", options: ["L'imparfait", "Le passé simple", "Le plus-que-parfait"], answer: 1 },
            { q: "Dans 'Il marchait quand soudain il aperçut un loup', pourquoi 'aperçut' est au passé simple ?", options: ["Parce que c'est une habitude", "Parce que c'est une action soudaine", "Parce que c'est une description longue"], answer: 1 },

            // PARTIE 4 : FIGURES DE STYLE (Questions 36 à 50)
            { q: "Qu'est-ce qu'une assonance ?", options: ["La répétition d'un son de consonne", "La répétition d'un même son de voyelle", "Une liste de mots"], answer: 1 },
            { q: "Qu'est-ce qu'une allitération ?", options: ["La répétition d'un même son de consonne", "La répétition d'une voyelle", "Une comparaison sans outil"], answer: 0 },
            { q: "Comment appelle-t-on la répétition d'un mot en début de phrase ou de vers ?", options: ["L'anaphore", "Le chiasme", "L'oxymore"], answer: 0 },
            { q: "Quelle figure remplace un mot par un autre relié par un lien logique (ex: 'Boire un verre') ?", options: ["La métaphore", "La métonymie", "La périphrase"], answer: 1 },
            { q: "Dire 'La ville lumière' pour désigner Paris est une...", options: ["Comparaison", "Périphrase", "Litote"], answer: 1 },
            { q: "Quelle est la condition obligatoire pour avoir une comparaison ?", options: ["Avoir deux mots identiques", "Utiliser un outil comparatif (comme, tel, pareil à...)", "Avoir une exagération"], answer: 1 },
            { q: "Qu'est-ce qu'une métaphore ?", options: ["Une liste de verbes", "Une comparaison directe sans outil comparatif", "Une atténuation"], answer: 1 },
            { q: "Dire 'Le vent hurle dans la nuit' est une...", options: ["Personnification", "Allégorie", "Antiphrase"], answer: 0 },
            { q: "Qu'est-ce qu'une allégorie ?", options: ["Une exagération forte", "La représentation concrète d'une idée abstraite", "Une construction en miroir"], answer: 1 },
            { q: "Quelle figure utilise une structure de construction en miroir AB / BA ?", options: ["L'antithèse", "Le chiasme", "La gradation"], answer: 1 },
            { q: "Dire 'Quel temps magnifique !' sous une tempête relève de...", options: ["L'oxymore", "L'antiphrase (ironie)", "L'euphémisme"], answer: 1 },
            { q: "Comment appelle-t-on l'association de deux mots opposés côte à côte (ex: 'Une obscure clarté') ?", options: ["L'antithèse", "L'oxymore", "La litote"], answer: 1 },
            { q: "Qu'est-ce qu'une hyperbole ?", options: ["Une atténuation polie", "Une exagération volontaire", "Une liste très longue"], answer: 1 },
            { q: "Quelle figure organise une suite de mots allant du moins fort au plus fort ?", options: ["L'accumulation", "La gradation", "La métonymie"], answer: 1 },
            { q: "Quelle est la différence entre une litote et un euphémisme ?", options: ["La litote dit moins pour exprimer plus ; l'euphémisme atténue une réalité choquante ou triste", "C'est la même chose", "La litote est uniquement pour la mort"], answer: 0 }
        ]
    },
    geographie: {
        title: "🌍 Géographie",
        fiches: `
            <style>
                .geo-app-container { color: #1e293b !important; font-family: system-ui, -apple-system, sans-serif; padding: 5px; }
                .geo-app-container h3 { color: #0f172a !important; margin-top: 25px; margin-bottom: 12px; font-size: 1.35em; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; }
                .geo-app-container p, .geo-app-container li { color: #334155 !important; line-height: 1.6; font-size: 1rem; }
                .geo-app-container strong { color: #0f172a !important; }
                
                /* Boutons de la page d'accueil et des sous-parties */
                .btn-chapitre-geo { width: 100%; padding: 16px; color: white !important; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.05rem; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 4px; transition: transform 0.1s; display: block; }
                .btn-chapitre-geo:active { transform: scale(0.99); }
                
                /* Bouton de retour en arrière */
                .btn-retour-geo { display: inline-flex; align-items: center; margin-bottom: 20px; padding: 12px 20px; background: #475569; color: white !important; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .btn-retour-geo:active { transform: scale(0.97); }
                
                /* Conteneurs de cours */
                .geo-ecran-cours { background: #ffffff !important; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                
                /* Listes et alertes */
                .geo-app-container ul, .geo-app-container ol { padding-left: 20px; margin-bottom: 15px; }
                .geo-app-container li { margin-bottom: 6px; }
                .geo-alerte { background: #fef2f2; color: #b91c1c !important; padding: 14px; border-radius: 6px; border: 1px solid #fca5a5; margin: 15px 0; }
                .geo-notion { background: #f0fdf4; color: #166534 !important; padding: 14px; border-radius: 6px; border: 1px solid #bbf7d0; margin: 15px 0; }
            </style>

            <div class="geo-app-container">
                
                <div id="geo-menu-principal" style="display: block;">
                    <p style="text-align: center; font-weight: bold; margin-bottom: 22px; color: #475569;">Sélectionnez un thème du programme complet :</p>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        
                        <button class="btn-chapitre-geo" style="background: #0284c7;" 
                                onclick="document.getElementById('geo-menu-principal').style.display='none'; document.getElementById('geo-theme1').style.display='block'; window.scrollTo(0,0);">
                            🏙️ THÈME 1 : DYNAMIQUES TERRITORIALES DE LA FRANCE CONTEMPORAINE
                        </button>
                        
                        <button class="btn-chapitre-geo" style="background: #0d9488;" 
                                onclick="document.getElementById('geo-menu-principal').style.display='none'; document.getElementById('geo-theme2').style.display='block'; window.scrollTo(0,0);">
                            🛠️ THÈME 2 : POURQUOI ET COMMENT AMÉNAGER LE TERRITOIRE ?
                        </button>
                        
                        <button class="btn-chapitre-geo" style="background: #4f46e5;" 
                                onclick="document.getElementById('geo-menu-principal').style.display='none'; document.getElementById('geo-theme3').style.display='block'; window.scrollTo(0,0);">
                            🇪🇺 THÈME 3 : LA FRANCE ET L'UNION EUROPÉENNE DANS LE MONDE
                        </button>
                        
                        <button class="btn-chapitre-geo" style="background: #db2777;" 
                                onclick="document.getElementById('geo-menu-principal').style.display='none'; document.getElementById('geo-bilan').style.display='block'; window.scrollTo(0,0);">
                            🎯 REPARES ET SYNTHÈSE COMPLÈTE POUR LE BREVET
                        </button>
                        
                    </div>
                </div>

                <div id="geo-theme1" class="geo-ecran-cours" style="display: none; border-top: 6px solid #0284c7;">
                    <button class="btn-retour-geo" onclick="document.getElementById('geo-theme1').style.display='none'; document.getElementById('geo-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux thèmes</button>
                    <div style="background: #0284c7; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.1em; margin-bottom: 20px;">THÈME 1 : DYNAMIQUES TERRITORIALES DE LA FRANCE CONTEMPORAINE</div>
                    
                    <h3>CHAPITRE 1 : LES AIRES URBAINES</h3>
                    <p><strong>PARTIE 1 : UNE FRANCE TRÈS URBANISÉE</strong></p>
                    <p><strong>A. Définition :</strong> Une <strong>aire urbaine</strong> est un espace géographique continu formé par un pôle urbain (ville-centre et ses banlieues) et par une couronne périurbaine. C'est un territoire caractérisé et organisé autour d'une ville principale qui influence directement les espaces environnants. Aujourd'hui, environ 85 % de la population française vit dans une aire urbaine.</p>
                    <p><strong>B. Organisation spatiale :</strong> L'aire urbaine se structure en trois sous-ensembles interdépendants :</p>
                    <ul>
                        <li><strong>La ville-centre :</strong> Noyau historique de l'aire urbaine. Elle concentre les fonctions de commandement, les emplois administratifs et financiers, les grands commerces, ainsi que les services de haut niveau (universités, hôpitaux, musées).</li>
                        <li><strong>La banlieue :</strong> Ceinture entourant la ville-centre. Elle s'est développée principalement au XXe siècle et regroupe de manière contrastée des grands ensembles résidentiels, des zones industrielles, des centres commerciaux, mais aussi des quartiers de maisons individuelles. Elle concentre les logements et les activités secondaires.</li>
                        <li><strong>La couronne périurbaine :</strong> Constituée de communes initialement rurales dont au moins 40 % de la population résidente active travaille dans le pôle urbain ou dans d'autres communes de l'aire urbaine. Les habitants y vivent plus loin, souvent à la recherche d'un cadre de vie plus naturel et de prix immobiliers plus abordables.</li>
                    </ul>
                    
                    <p><strong>PARTIE 2 : L’ÉTALEMENT URBAIN</strong></p>
                    <p><strong>A. Définition :</strong> L’<strong>étalement urbain</strong> désigne l’extension progressive de la surface construite des villes vers les campagnes environnantes. Cela engendre une dilatation continue des périphéries urbaines.</p>
                    <p><strong>B. Causes de l'étalement :</strong> Plusieurs facteurs structurent ce phénomène :</p>
                    <ul>
                        <li><strong>Le prix élevé du logement :</strong> Le coût de l'immobilier et des loyers en centre-ville pousse les ménages, notamment les familles, à s'éloigner pour devenir propriétaires.</li>
                        <li><strong>La recherche d’espace :</strong> Une forte aspiration démocratique à vivre dans une maison individuelle avec jardin.</li>
                        <li><strong>Le développement des infrastructures de transport :</strong> La démocratisation de l'automobile, le réseau autoroutier et les lignes de transports en commun rapides (RER, TER) permettent de vivre loin de son lieu de travail.</li>
                    </ul>
                    <div class="geo-alerte">
                        <strong>⚠️ Conséquences majeures (Sujet fréquent de développement construit) :</strong> 
                        L'étalement urbain provoque la disparition massive des terres agricoles et des espaces naturels. Il entraîne une hausse de la pollution atmosphérique à cause des <strong>migrations pendulaires</strong> (trajets quotidiens domicile-travail). Enfin, il crée une dépendance critique à la voiture individuelle et un allongement important des budgets de transport pour les familles périurbaines.
                    </div>

                    <p><strong>PARTIE 3 : UNE FRANCE MÉTROPOLISÉE</strong></p>
                    <p><strong>A. La métropolisation :</strong> Il s'agit du processus mondial de concentration des populations, des richesses, des activités d'innovation et des fonctions supérieures de commandement (politique, économique, culturel) dans un nombre restreint de très grandes villes : les métropoles (comme Paris, Lyon, Marseille, Lille, Toulouse). Paris reste la seule métropole de rang mondial en France.</p>
                    <p><strong>B. Des inégalités territoriales accrues :</strong> La métropolisation renforce les fractures spatiales :</p>
                    <ul>
                        <li>Des <strong>centres-villes dynamiques</strong>, attractifs et gentrifiés, qui captent les investissements mondiaux.</li>
                        <li>Des <strong>banlieues contrastées</strong>, opposant des secteurs pavillonnaires aisés à des grands ensembles touchés par le chômage et la précarité sociale.</li>
                        <li>Des <strong>périphéries dépendantes</strong>, soumises aux flux imposés par les pôles de décision urbains.</li>
                    </ul>

                    <h3>CHAPITRE 2 : ESPACES PRODUCTIFS ET LEUR ÉVOLUTION</h3>
                    <p><strong>PARTIE 1 : LES ESPACES PRODUCTIFS</strong></p>
                    <p><strong>A. Définition :</strong> Un <strong>espace productif</strong> est une portion de territoire aménagée et mise en valeur par l’Homme pour développer des activités économiques, produire des biens matériels ou des services, et générer de la richesse économique.</p>
                    <p><strong>B. Typologie sectorielle :</strong></p>
                    <ul>
                        <li><strong>Espaces agricoles :</strong> La France est la première puissance agricole de l'Union européenne. Ses espaces se sont spécialisés (grande culture céréalière dans le Bassin parisien, viticulture de prestige à Bordeaux ou en Champagne, élevage intensif en Bretagne). Ils sont caractérisés par une mécanisation poussée et une intégration forte à l'industrie agroalimentaire.</li>
                        <li><strong>Espaces industriels :</strong> Mutation profonde marquée par le déclin des vieux bassins industriels du Nord et de l'Est (mines, textile, sidérurgie) au profit des régions de haute technologie. L'innovation se concentre désormais dans les métropoles au sein de <strong>pôles de compétitivité</strong> (comme l'aéronautique à Toulouse).</li>
                        <li><strong>Espaces de services et de tourisme :</strong> Le secteur tertiaire est aujourd'hui ultra-majoritaire en France. Le tourisme constitue un moteur économique essentiel (littoraux aménagés, stations de haute montagne dans les Alpes, parcs de loisirs, patrimoine culturel et historique de Paris).</li>
                    </ul>
                    
                    <p><strong>PARTIE 2 : L'IMPACT DE LA MONDIALISATION</strong></p>
                    <p><strong>A. Définition :</strong> La mondialisation est l'intensification et la multiplication des flux et des échanges (de marchandises, d'informations, de capitaux et de personnes) à l'échelle planétaire, mettant en relation et en concurrence les différents espaces du monde.</p>
                    <p><strong>B. Effets sur le territoire national :</strong> Elle génère une sélection des espaces. Les territoires qui ne sont pas assez compétitifs subissent la concurrence internationale et des <strong>délocalisations</strong> (fermetures d'usines transférées vers des pays à faible coût de main-d'œuvre). À l'inverse, elle provoque une forte concentration des activités d'innovation dans les nœuds les mieux connectés au reste du globe.</p>
                    <p><strong>C. Les espaces connectés et dynamiques :</strong> Trois types d'espaces tirent profit de la mondialisation :</p>
                    <ul>
                        <li>Les <strong>grandes métropoles</strong> qui abritent les sièges sociaux des multinationales et les centres de recherche de pointe.</li>
                        <li>Les <strong>Zones Industrialo-Portuaires (ZIP)</strong> comme Le Havre ou Marseille-Fos, véritables portes d'entrée maritimes connectées aux routes maritimes mondiales pour l'import-export.</li>
                        <li>Les <strong>espaces touristiques majeurs</strong> qui captent les flux de voyageurs internationaux.</li>
                    </ul>

                    <p><strong>PARTIE 3 : LES GRANDES TRANSFORMATIONS</strong></p>
                    <p>Les espaces de production se modernisent en permanence par la <strong>robotisation</strong> des chaînes de production, l'injection massive de technologies numériques et d'<strong>innovation</strong>, conduisant à une spécialisation territoriale accrue où chaque région tente de valoriser ses avantages comparatifs exclusifs.</p>

                    <h3>CHAPITRE 3 : LES ESPACES DE FAIBLE DENSITÉ</h3>
                    <p><strong>PARTIE 1 : UN TERRITOIRE PEU PEUPLÉ</strong></p>
                    <p><strong>A. Définition :</strong> En France, un espace de faible densité correspond à un territoire comptant <strong>moins de 30 habitants par kilomètre carré (hab./km²)</strong>. Ils couvrent près de la moitié du territoire national mais ne regroupent qu'une faible part de la population.</p>
                    <p><strong>B. Localisation géographique :</strong> On les retrouve principalement le long de la "diagonale du vide" (qui s'étire des Ardennes jusqu'aux Pyrénées en passant par le Massif central) ainsi que dans les massifs montagneux (Alpes, Pyrénées, Jura, Vosges) et certaines campagnes isolées loin des grands axes de communication.</p>
                    
                    <p><strong>PARTIE 2 : DES ACTIVITÉS ÉCONOMIQUES DIVERSES</strong></p>
                    <p>Malgré la faiblesse démographique, ces espaces ne sont pas morts et accueillent des activités clés :</p>
                    <ul>
                        <li><strong>L'agriculture dynamique :</strong> Des exploitations de grande taille (élevage extensif en montagne, sylviculture dans les Landes).</li>
                        <li><strong>Le tourisme vert et blanc :</strong> Randonnées, parcs naturels nationaux ou régionaux, et stations de ski en haute montagne.</li>
                        <li><strong>La filière bois et la production d'énergie :</strong> Installation de parcs éoliens, de barrages hydroélectriques et de centrales de biomasse.</li>
                    </ul>

                    <p><strong>PARTIE 3 : UNE RECOMPOSITION ET UN RENOUVEAU</strong></p>
                    <p>On assiste aujourd'hui à une renaissance de certains de ces territoires ruraux grâce au retour de nouvelles populations, appelées les <strong>néo-ruraux</strong> (citadins s'installant à la campagne à la recherche d'une meilleure qualité de vie). Ce mouvement est porté par l'essor du <strong>télétravail</strong> et soutenu par des politiques publiques visant l'amélioration des infrastructures de communication (déploiement de la fibre optique, maintien des services publics de proximité).</p>
                </div>

                <div id="geo-theme2" class="geo-ecran-cours" style="display: none; border-top: 6px solid #0d9488;">
                    <button class="btn-retour-geo" onclick="document.getElementById('geo-theme2').style.display='none'; document.getElementById('geo-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux thèmes</button>
                    <div style="background: #0d9488; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.1em; margin-bottom: 20px;">THÈME 2 : POURQUOI ET COMMENT AMÉNAGER LE TERRITOIRE ?</div>
                    
                    <h3>CHAPITRE 4 : AMÉNAGER POUR RÉDUIRE LES INÉGALITÉS</h3>
                    <p><strong>PARTIE 1 : LES INÉGALITÉS TERRITORIALES</strong></p>
                    <p><strong>A. Définition :</strong> Les inégalités territoriales désignent les disparités économiques, sociales, de développement et d'accès aux services publics constatées entre les différentes régions ou espaces du territoire français.</p>
                    <p><strong>B. Exemples concrets de déséquilibres :</strong> Le principal déséquilibre oppose la région Île-de-France et les grandes métropoles mondialisées (qui concentrent l'essentiel du PIB et des emplois qualifiés) aux campagnes isolées frappées par la déprise démographique et la désertification médicale, ainsi qu'aux quartiers urbains sensibles en difficulté sociale (pauvreté, fort chômage).</p>
                    
                    <p><strong>PARTIE 2 : LE RÔLE DE L’ÉTAT ET DES ACTEURS PUBLICS</strong></p>
                    <p>L'<strong>aménagement du territoire</strong> est mené par différents acteurs publics. Si l'État (via l'ANCT) conserve une impulsion stratégique, la <strong>décentralisation</strong> a transféré de nombreuses compétences aux collectivités territoriales (Régions, Départements, Communes). L'Union européenne participe également via des aides financières substantielles. L'objectif est double : assurer une plus grande équité sociale entre les citoyens et renforcer l'attractivité économique globale du pays.</p>
                    
                    <p><strong>PARTIE 3 : LES GRANDS AMÉNAGEMENTS ET POLITIQUES</strong></p>
                    <ul>
                        <li><strong>Les infrastructures de transport :</strong> Lignes de Trains à Grande Vitesse (TGV), autoroutes et liaisons interrégionales pour désenclaver les territoires isolés.</li>
                        <li><strong>Les zones industrielles et d'activités :</strong> Aménagement de parcs d'activités en périphérie ou à proximité des grands noeuds de transport pour attirer les investisseurs.</li>
                        <li><strong>La politique de la ville :</strong> Mesures spécifiques de l'État pour rénover les infrastructures des quartiers prioritaires en difficulté (rénovation des logements collectifs, aides à l'emploi, renforcement de la sécurité).</li>
                    </ul>

                    <h3>CHAPITRE 5 : LES TERRITOIRES ULTRAMARINS</h3>
                    <p><strong>PARTIE 1 : DÉFINITION ET DIVERSITÉ</strong></p>
                    <p>Les territoires ultramarins (ou France d'outre-mer) désignent l'ensemble des terres sous souveraineté française situées en dehors du continent européen. Ils ont des statuts juridiques différents : les <strong>DROM</strong> (Départements et Régions d’Outre-Mer comme la Guadeloupe, la Martinique, la Guyane, La Réunion et Mayotte) qui ont les mêmes lois qu'en métropole, et les <strong>COM</strong> (Collectivités d’Outre-Mer comme la Polynésie française, Saint-Pierre-et-Miquelon, etc.) qui possèdent une autonomie législative plus large.</p>
                    
                    <p><strong>PARTIE 2 : LES ATOUTS POUR LA PUISSANCE FRANÇAISE</strong></p>
                    <p>Ces territoires procurent à la France des avantages exceptionnels :</p>
                    <ul>
                        <li><strong>Une puissance maritime immense :</strong> Grâce à leur éparpillement sur tous les océans (Atlantique, Pacifique, Indien), ils offrent à la France la 2e plus grande <strong>Zone Économique Exclusive (ZEE)</strong> maritime au monde, riche en ressources halieutiques et énergétiques sous-marines.</li>
                        <li><strong>Une biodiversité mondiale unique :</strong> Ils abritent l'essentiel des récifs coralliens et des forêts tropicales françaises (notamment la forêt amazonienne en Guyane).</li>
                        <li><strong>Une position géostratégique et scientifique majeure :</strong> Présence de bases militaires stratégiques et du Centre Spatial Guyanais à Kourou, idéalement placé près de l'équateur pour le lancement de fusées.</li>
                    </ul>
                    
                    <div class="geo-alerte">
                        <strong>⚠️ Les difficultés structurelles majeures (À retenir par cœur) :</strong> 
                        Ces territoires souffrent de l'<strong>éloignement géographique</strong> important par rapport à la métropole européenne. Ils font face à des marchés intérieurs étroits, un coût de la vie très élevé (les biens de consommation courante étant importés), un taux de chômage structurellement très supérieur à la moyenne nationale (surtout chez les jeunes) et une forte dépendance financière vis-à-vis des subventions d'État et de l'Union européenne.
                    </div>

                    <h3>CHAPITRE 6 : L’UNION EUROPÉENNE</h3>
                    <p><strong>PARTIE 1 : LA CONSTRUCTION DE L'ESPACE COMMUN</strong></p>
                    <p><strong>A. Définition :</strong> L’Union européenne (UE) est une organisation politique et économique supranationale regroupant plusieurs pays d'Europe qui ont choisi de déléguer une partie de leur souveraineté pour mener des politiques communes.</p>
                    <p><strong>B. Objectifs fondamentaux :</strong> Garantir une <strong>paix durable</strong> entre les États membres après les drames de la Seconde Guerre mondiale, promouvoir la démocratie, encourager la coopération et stimuler la croissance économique commune.</p>
                    
                    <p><strong>PARTIE 2 : LE FONCTIONNEMENT DES INSTITUTIONS</strong></p>
                    <p>L'UE s'organise autour de trois institutions phares :</p>
                    <ul>
                        <li><strong>La Commission européenne :</strong> Basée à Bruxelles, elle représente l'intérêt général de l'UE. Elle propose les lois et veille à leur bonne exécution.</li>
                        <li><strong>Le Parlement européen :</strong> Composé de députés élus directement par les citoyens au suffrage universel. Il vote les lois européennes et le budget en collaboration avec le Conseil.</li>
                        <li><strong>Le Conseil européen :</strong> Réunit les chefs d'État ou de gouvernement des pays membres pour fixer les grandes orientations politiques de l'Union.</li>
                    </ul>
                    
                    <p><strong>PARTIE 3 : LES ACTIONS CONCRÈTES AU QUOTIDIEN</strong></p>
                    <p>L'action européenne se matérialise par :</p>
                    <ul>
                        <li>La monnaie unique (l'<strong>euro</strong>) partagée par les membres de la zone euro.</li>
                        <li>La <strong>libre circulation</strong> des biens, des capitaux, des services et des personnes, renforcée à l'intérieur de l'<strong>Espace Schengen</strong> (suppression des contrôles aux frontières intérieures).</li>
                        <li>Le versement d'<strong>aides régionales</strong> via des fonds de cohésion (FEDER) pour financer les infrastructures dans les territoires les moins développés.</li>
                    </ul>
                </div>

                <div id="geo-theme3" class="geo-ecran-cours" style="display: none; border-top: 6px solid #4f46e5;">
                    <button class="btn-retour-geo" onclick="document.getElementById('geo-theme3').style.display='none'; document.getElementById('geo-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux thèmes</button>
                    <div style="background: #4f46e5; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.1em; margin-bottom: 20px;">THÈME 3 : LA FRANCE ET L’UNION EUROPÉENNE DANS LE MONDE</div>
                    
                    <h3>CHAPITRE 7 : LA FRANCE ET L’EUROPE DANS LE MONDE</h3>
                    <p><strong>PARTIE 1 : LA FRANCE, UNE PUISSANCE MONDIALE</strong></p>
                    <p>La France conserve un rayonnement mondial multidimensionnel reposant sur plusieurs piliers :</p>
                    <ul>
                        <li><strong>Puissance économique :</strong> Membre du G7, elle fait partie des dix premières puissances économiques mondiales, portée par de grandes firmes multinationales (luxe, pharmacie, automobile, aéronautique).</li>
                        <li><strong>Puissance militaire :</strong> Elle dispose d'une armée moderne, d'une capacité de projection mondiale et possède l'arme de dissuasion nucléaire.</li>
                        <li><strong>Puissance diplomatique :</strong> Elle est membre permanent du Conseil de sécurité de l'ONU et dispose du deuxième plus grand réseau d'ambassades au monde.</li>
                        <li><strong>Puissance culturelle :</strong> Rayonnement mondial assuré par la langue française partagée au sein de l'espace de la <strong>Francophonie</strong>, sa gastronomie, sa mode et son statut de première destination touristique mondiale.</li>
                    </ul>
                    
                    <p><strong>PARTIE 2 : LE POIDS DE L’UNION EUROPÉENNE</strong></p>
                    <p>L’Union européenne s'affirme comme une puissance économique, commerciale et financière majeure à l'échelle de la planète. L'intégration au sein de ce grand bloc continental procure à la France des avantages décisifs : des échanges commerciaux facilités et sans barrière douanière avec ses voisins directs, et un poids géopolitique démultiplié face aux géants économiques mondiaux (États-Unis, Chine).</p>
                    
                    <p><strong>PARTIE 3 : LES LIMITES ET DÉPENDANCES</strong></p>
                    <p>Malgré ces atouts, le modèle européen et français se heurte à de réelles limites :</p>
                    <ul>
                        <li>Une <strong>concurrence internationale féroce</strong> des pays émergents sur les coûts de production industriels.</li>
                        <li>De vives <strong>inégalités internes de développement</strong> entre les pays d'Europe de l'Ouest historiquement riches et certains États intégrés plus récemment à l'Est.</li>
                        <li>Une <strong>dépendance économique et stratégique</strong> marquée vis-à-vis des marchés extérieurs pour l'approvisionnement en matières premières, hydrocarbures énergétiques et technologies électroniques de pointe (semi-conducteurs).</li>
                    </ul>
                </div>

                <div id="geo-bilan" class="geo-ecran-cours" style="display: none; border-top: 6px solid #db2777; background: #fffefe !important;">
                    <button class="btn-retour-geo" onclick="document.getElementById('geo-bilan').style.display='none'; document.getElementById('geo-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux thèmes</button>
                    <div style="background: #db2777; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 20px;">🎯 REPARES ESSENTIELS DU BREVET</div>
                    
                    <div class="geo-notion">
                        <strong>🔍 BILAN GÉNÉRAL DU COURS :</strong> 
                        La France contemporaine se présente comme un territoire très largement <strong>urbanisé</strong> et profondément façonné par la <strong>métropolisation</strong>. C'est un espace économique ouvert et fortement <strong>intégré aux réseaux mondiaux de la mondialisation</strong>. Toutefois, cette dynamique d'ouverture engendre des <strong>inégalités territoriales majeures</strong> que l'aménagement du territoire tente de corriger, dans un cadre d'action de plus en plus influencé par les directives de l'<strong>Union européenne</strong>.
                    </div>

                    <p><strong>Les 7 grandes thèses à retenir pour ton développement construit :</strong></p>
                    <ol style="line-height: 2; font-weight: bold; padding-left: 22px;">
                        <li><span style="color: #0284c7;">Aires urbaines :</span> Elles constituent la forme principale d'organisation du territoire national contemporain.</li>
                        <li><span style="color: #0284c7;">Mondialisation :</span> Elle transforme, spécialise et trie les espaces productifs en éliminant les moins compétitifs.</li>
                        <li><span style="color: #0d9488;">Espaces de faible densité :</span> Ils couvrent de vastes surfaces, mais se réorganisent grâce à de nouvelles activités.</li>
                        <li><span style="color: #0d9488;">Aménagement du territoire :</span> Il vise en priorité la réduction des fractures territoriales.</li>
                        <li><span style="color: #4f46e5;">Outre-mer :</span> Il apporte d'immenses avantages géostratégiques à la France mais cumule de lourdes contraintes socio-économiques.</li>
                        <li><span style="color: #4f46e5;">Union européenne :</span> C'est un espace d’intégration économique majeur qui redéfinit les frontières et les lois nationales.</li>
                        <li><span style="color: #db2777;">France :</span> Une puissance internationale influente sur les plans diplomatique et culturel, mais économiquement dépendante.</li>
                    </ol>
                </div>
            </div>
        `,
        quiz: [
            // --- CHAPITRE 1 : LES AIRES URBAINES (Questions 1 à 10) ---
            {
                question: "Qu'est-ce qu'une aire urbaine en géographie ?",
                answers: [
                    "Un espace formé d'un pôle urbain (ville-centre et banlieues) et d'une couronne périurbaine",
                    "Un centre historique uniquement composé de monuments anciens",
                    "Un regroupement exclusif de grandes usines en dehors des villes",
                    "Une grande région agricole faiblement peuplée"
                ],
                correct: 0
            },
            {
                question: "Quels sont les trois espaces géographiques distincts qui composent une aire urbaine ?",
                answers: [
                    "La ville-centre, la banlieue et la couronne périurbaine",
                    "La mairie, la préfecture et le conseil régional",
                    "Le centre-ville, la zone industrielle et le village lointain",
                    "Le quartier d'affaires, le port de commerce et la gare TGV"
                ],
                correct: 0
            },
            {
                question: "Quelle fonction socio-économique caractérise prioritairement une ville-centre ?",
                answers: [
                    "Elle concentre les emplois, les commerces et les services supérieurs de commandement",
                    "Elle sert uniquement de lieu de stockage pour la production agricole",
                    "Elle regroupe principalement des maisons individuelles dotées de grands terrains",
                    "Elle accueille uniquement les activités industrielles polluantes"
                ],
                correct: 0
            },
            {
                question: "Qu'est-ce que la couronne périurbaine d'une aire urbaine ?",
                answers: [
                    "Des communes rurales sous l'influence directe de la ville où vivent des actifs travaillant dans le pôle urbain",
                    "La barrière de sécurité construite tout autour du centre-ville historique",
                    "La zone industrielle historique située uniquement le long des anciennes voies ferrées",
                    "Le grand boulevard périphérique routier qui encercle le centre-ville"
                ],
                correct: 0
            },
            {
                question: "Comment définit-on précisément le phénomène d'étalement urbain ?",
                answers: [
                    "L'extension continue de la surface construite des villes au détriment des espaces ruraux et naturels",
                    "L'augmentation progressive de la hauteur moyenne des immeubles en centre-ville",
                    "Le déplacement massif de l'ensemble des usines vers les pays en développement",
                    "La baisse globale et continue de la population totale dans les grandes métropoles"
                ],
                correct: 0
            },
            {
                question: "Quelle est une cause économique majeure du développement de l'étalement urbain ?",
                answers: [
                    "Le coût élevé du logement en centre-ville poussant les familles à s'éloigner pour devenir propriétaires",
                    "La fermeture généralisée de l'ensemble des réseaux de transports en commun nationaux",
                    "L'obligation légale stricte d'implanter tous les nouveaux logements à la campagne",
                    "La baisse globale du nombre de véhicules individuels en circulation en France"
                ],
                correct: 0
            },
            {
                question: "Quelle est une conséquence environnementale critique induite par l'étalement urbain ?",
                answers: [
                    "La disparition des terres agricoles fertiles et l'augmentation de la pollution par les transports",
                    "L'augmentation globale des espaces de forêts sauvages protégées",
                    "La baisse spectaculaire des émissions globales de dioxyde de carbone (CO2)",
                    "La réduction drastique du temps de trajet quotidien pour l'ensemble des salariés"
                ],
                correct: 0
            },
            {
                question: "Comment appelle-t-on les flux quotidiens des travailleurs entre leur domicile et leur lieu de travail ?",
                answers: [
                    "Les migrations pendulaires",
                    "L'exode rural massif",
                    "Les flux migratoires internationaux",
                    "La mondialisation des services"
                ],
                correct: 0
            },
            {
                question: "Qu'est-ce que le processus de métropolisation ?",
                answers: [
                    "La concentration des populations, des richesses et des fonctions de commandement dans les très grandes villes",
                    "La transformation progressive des grandes métropoles en espaces agricoles",
                    "L'abandon total des centres-villes par l'ensemble des entreprises nationales",
                    "La fusion administrative de tous les villages de France en une seule commune"
                ],
                correct: 0
            },
            {
                question: "Quelles inégalités spatiales majeures la métropolisation engendre-t-elle ?",
                answers: [
                    "Des centres-villes dynamiques face à des banlieues contrastées et des périphéries dépendantes",
                    "Une égalité budgétaire parfaite entre l'ensemble des communes françaises",
                    "La disparition complète des quartiers d'affaires au profit des petites communes",
                    "Le regroupement exclusif des richesses financières dans les villages de haute montagne"
                ],
                correct: 0
            },

            // --- CHAPITRE 2 : ESPACES PRODUCTIFS (Questions 11 à 19) ---
            {
                question: "Qu'est-ce qu'un espace productif ?",
                answers: [
                    "Un espace aménagé et mis en valeur pour développer une activité économique et produire de la richesse",
                    "Un territoire laissé totalement à l'état sauvage sans aucune modification par l'Homme",
                    "Un espace uniquement dédié au logement des populations sans aucune entreprise",
                    "Une zone historique protégée où toute activité commerciale est interdite par la loi"
                ],
                correct: 0
            },
            {
                question: "Quels sont les trois grands types d'espaces productifs étudiés au collège ?",
                answers: [
                    "Les espaces agricoles, industriels et de services (tertiaires)",
                    "Les espaces scolaires, administratifs et sportifs",
                    "Les espaces maritimes, forestiers et désertiques",
                    "Les espaces urbains, périurbains et ruraux isolés"
                ],
                correct: 0
            },
            {
                question: "Quelle grande mutation caractérise les espaces agricoles français modernes ?",
                answers: [
                    "Une spécialisation forte des régions, une mécanisation poussée et une intégration à l'agroalimentaire",
                    "Un retour généralisé à une agriculture manuelle sans aucun produit ni machine",
                    "La disparition totale de toutes les exportations de produits agricoles vers l'étranger",
                    "La transformation de l'intégralité du territoire français en champs de céréales"
                ],
                correct: 0
            },
            {
                question: "Comment définit-on le processus économique de mondialisation ?",
                answers: [
                    "L'intensification et la multiplication des flux d'échanges de biens, services et capitaux à l'échelle mondiale",
                    "La réduction progressive des transports maritimes à travers les différents océans",
                    "La fermeture totale des frontières commerciales entre tous les continents",
                    "Le développement exclusif des petits commerces de quartier de manière isolée"
                ],
                correct: 0
            },
            {
                question: "Quel est l'effet de la mondialisation sur la géographie des usines en France ?",
                answers: [
                    "Elle entraîne la spécialisation des régions compétitives et provoque des délocalisations industrielles",
                    "Elle interdit l'utilisation des robots sur l'ensemble des chaînes de montage",
                    "Elle répartit de façon parfaitement équitable les usines de haute technologie dans chaque village",
                    "Elle stoppe définitivement l'ensemble des échanges commerciaux avec les pays d'Asie"
                ],
                correct: 0
            },
            {
                question: "Qu'est-ce qu'une délocalisation industrielle ?",
                answers: [
                    "Le transfert d'une usine vers un pays étranger où les coûts de production sont plus bas",
                    "L'agrandissement d'une usine au sein de sa région d'origine en métropole",
                    "Le passage juridique d'une entreprise industrielle du secteur privé au secteur public",
                    "L'embauche massive de nouveaux salariés au sein d'une entreprise locale de transport"
                ],
                correct: 0
            },
            {
                question: "Quels espaces productifs s'avèrent les plus insérés et dynamiques dans la mondialisation ?",
                answers: [
                    "Les grandes métropoles, les zones industrialo-portuaires (ZIP) et les espaces touristiques majeurs",
                    "Les campagnes enclavées et totalement coupées des réseaux modernes de communication",
                    "Les anciens bassins miniers du Nord de la France en crise structurelle profonde",
                    "Les petites communes purement résidentielles éloignées de tous les axes de transport"
                ],
                correct: 0
            },
            {
                question: "Qu'est-ce qu'une ZIP (Zone Industrialo-Portuaire) ?",
                answers: [
                    "Un espace littoral associant des fonctions industrielles et des fonctions de transport portuaire",
                    "Une zone réservée uniquement aux activités de loisirs de plage et de thalassothérapie",
                    "Un grand parc naturel régional protégé situé en haute montagne",
                    "Une gare ferroviaire spécialisée dans le transport exclusif des voyageurs à grande vitesse"
                ],
                correct: 0
            },
            {
                question: "Quel secteur d'activité économique domine largement les emplois en France aujourd'hui ?",
                answers: [
                    "Le secteur tertiaire (services, administration, commerces, tourisme)",
                    "Le secteur primaire (uniquement l'agriculture et la pêche en mer)",
                    "Le secteur secondaire (l'industrie lourde et l'exploitation des mines)",
                    "La construction navale militaire et civile de manière exclusive"
                ],
                correct: 0
            },

            // --- CHAPITRE 3 : LES ESPACES DE FAIBLE DENSITÉ (Questions 20 à 27) ---
            {
                question: "Quel est le seuil de densité de population définissant un espace de faible densité en France ?",
                answers: [
                    "Moins de 30 habitants par kilomètre carré (hab./km²)",
                    "Moins de 100 habitants par kilomètre carré (hab./km²)",
                    "Moins de 10 habitants par kilomètre carré (hab./km²)",
                    "Moins de 150 habitants par kilomètre carré (hab./km²)"
                ],
                correct: 0
            },
            {
                question: "Où se localisent principalement les territoires de faible densité sur la carte de France ?",
                answers: [
                    "Dans les montagnes et les campagnes isolées (notamment le long de la 'diagonale du vide')",
                    "Autour de la banlieue parisienne et sur l'ensemble du littoral méditerranéen",
                    "Dans les grandes vallées fluviales navigables comme la Seine et le Rhône",
                    "Exclusivement au coeur des dix plus grandes métropoles régionales françaises"
                ],
                correct: 0
            },
            {
                question: "Quelles activités économiques dynamisent les territoires de faible densité ?",
                answers: [
                    "L'agriculture, le tourisme vert ou blanc, l'exploitation du bois et la production d'énergie",
                    "Les entreprises de haute technologie informatique et les sièges sociaux bancaires",
                    "L'industrie lourde automobile et les terminaux de conteneurs maritimes",
                    "Les commerces de luxe international et la mode de haute couture"
                ],
                correct: 0
            },
            {
                question: "Qu'est-ce que le 'tourisme vert' développé dans les campagnes de faible densité ?",
                answers: [
                    "Un tourisme centré sur la nature, la randonnée, le calme et la préservation de l'environnement",
                    "Des séjours touristiques organisés uniquement pour acheter des plantes d'appartement",
                    "Les voyages scolaires de loisirs réalisés exclusivement dans des parcs d'attractions urbains",
                    "Le transport maritime de marchandises par des navires à propulsion écologique"
                ],
                correct: 0
            },
            {
                question: "Comment se manifeste le renouveau démographique de certains espaces ruraux isolés ?",
                answers: [
                    "Par l'installation de nouvelles populations (néo-ruraux) et le développement du télétravail",
                    "Par le départ massif et définitif des derniers habitants vers les pays d'Asie",
                    "Par l'interdiction préfectorale d'installer les réseaux d'internet et d'électricité",
                    "Par la destruction planifiée des villages pour étendre les zones de forêts vierges"
                ],
                correct: 0
            },
            {
                question: "Qu'est-ce qu'un habitant qualifié de 'néo-rural' ?",
                answers: [
                    "Un citadin d'origine urbaine qui fait le choix de s'installer durablement à la campagne",
                    "Un nouvel outil technologique automatisé utilisé pour moissonner les champs de blé",
                    "Un diplôme universitaire agricole d'État délivré par le ministère de l'Éducation",
                    "Un habitant de banlieue travaillant exclusivement dans un hypermarché périphérique"
                ],
                correct: 0
            },
            {
                question: "Quel atout des espaces de faible densité favorise la transition énergétique en France ?",
                answers: [
                    "L'espace disponible pour implanter des éoliennes, des barrages ou des panneaux solaires",
                    "La forte concentration de gisements de pétrole exploitables dans les plaines",
                    "La présence de grandes usines de fabrication de réacteurs nucléaires de commandement",
                    "La consommation d'énergie totalement nulle de la part des habitants de ces espaces"
                ],
                correct: 0
            },
            {
                question: "Quel massif montagneux français constitue un espace de faible densité hivernale dynamique ?",
                answers: [
                    "Les Alpes, grâce à l'économie du tourisme blanc (stations de ski)",
                    "Le Bassin aquitain, grâce à ses pistes de bobsleigh artificielles",
                    "L'agglomération de Lille, grâce à ses parcs naturels de haute montagne",
                    "La plaine de la Beauce, pour ses compétitions de luge d'été"
                ],
                correct: 0
            },

            // --- CHAPITRE 4 : AMÉNAGER POUR RÉDUIRE LES INÉGALITÉS (Questions 28 à 34) ---
            {
                question: "En géographie, qu'est-ce que l'aménagement du territoire ?",
                answers: [
                    "L'action publique qui organise l'espace pour réduire les inégalités et stimuler le développement économique",
                    "La vente de terrains publics à des entreprises privées d'origine étrangère",
                    "Le nettoyage des rues et la collecte des déchets dans les grandes villes uniquement",
                    "L'interdiction de construire des axes routiers pour laisser la nature intacte"
                ],
                correct: 0
            },
            {
                question: "Quel est un exemple majeur de déséquilibre territorial constaté en France ?",
                answers: [
                    "La concentration des richesses en Île-de-France et dans les métropoles face au déclin de certaines campagnes",
                    "Le fait que chaque région de France possède au millimètre près les mêmes équipements publics",
                    "Le regroupement de l'intégralité des citoyens français sur la seule île de Corse",
                    "La disparition totale de la pauvreté au sein de l'intégralité des espaces ruraux"
                ],
                correct: 0
            },
            {
                question: "Quel est l'objectif premier de l'État en matière d'aménagement du territoire ?",
                answers: [
                    "Réduire les inégalités entre les régions et venir en aide aux territoires fragiles ou enclavés",
                    "Favoriser de manière exclusive l'hyper-développement de la seule capitale parisienne",
                    "Supprimer toutes les aides financières nationales destinées aux collectivités territoriales",
                    "Fixer de manière autoritaire le prix de vente de chaque maison individuelle privée"
                ],
                correct: 0
            },
            {
                question: "Quelle infrastructure de transport illustre une politique d'aménagement pour connecter les territoires ?",
                answers: [
                    "Le réseau de lignes ferroviaires à grande vitesse (TGV) reliant les métropoles régionales",
                    "La fermeture définitive des lignes de trains de proximité et de banlieue",
                    "La construction de murs physiques de séparation étanches entre les différentes régions",
                    "L'interdiction des connexions internet à haut débit en dehors de la ville de Paris"
                ],
                correct: 0
            },
            {
                question: "Qu'est-ce que la 'politique de la ville' menée par les acteurs publics ?",
                answers: [
                    "Des actions ciblées pour revaloriser les quartiers urbains sensibles en difficulté socio-économique",
                    "Le règlement édicté par la mairie concernant la tarification des parkings urbains",
                    "L'élection démocratique du conseil municipal lors des scrutins locaux",
                    "Le plan départemental de tracé des pistes cyclables en milieu purement rural"
                ],
                correct: 0
            },
            {
                question: "Quel processus politique a donné plus de pouvoir aux régions pour aménager leur propre territoire ?",
                answers: [
                    "La décentralisation, transférant des compétences de l'État vers les collectivités locales",
                    "La mondialisation des échanges financiers transfrontaliers",
                    "La centralisation absolue de tous les ministères au sein de la ville de Paris",
                    "La suppression pure et simple de l'ensemble des conseils départementaux"
                ],
                correct: 0
            },
            {
                question: "Quel organisme ou institution internationale cofinance les projets d'aménagement régionaux en France ?",
                answers: [
                    "L'Union européenne, par le biais de fonds de cohésion comme le FEDER",
                    "L'Organisation des Nations Unies (ONU) de manière exclusive et directe",
                    "Le gouvernement fédéral des États-Unis d'Amérique via des prêts bancaires",
                    "L'Unesco, uniquement pour la construction d'autoroutes de contournement urbain"
                ],
                correct: 0
            },

            // --- CHAPITRE 5 : LES TERRITOIRES ULTRAMARINS (Questions 35 à 41) ---
            {
                question: "Qu'est-ce qu'un territoire ultramarin pour la République française ?",
                answers: [
                    "Un territoire sous souveraineté française situé en dehors du continent européen",
                    "Une région frontalière terrestre située juste à côté de l'Allemagne ou de l'Italie",
                    "Un pays étranger souverain et indépendant qui fait le choix d'utiliser le français",
                    "Une ancienne colonie d'Afrique qui n'entretient plus aucun rapport avec Paris"
                ],
                correct: 0
            },
            {
                question: "Que signifient les acronymes DROM et COM pour l'Outre-mer ?",
                answers: [
                    "Départements et Régions d'Outre-Mer / Collectivités d'Outre-Mer",
                    "Districts Ruraux d'Outre-Manche / Communes d'Outre-Mer",
                    "Domaines Résidentiels d'Occupation Maritime / Comptoirs d'Outre-Mer",
                    "Directions Régionales d'Orientation Métropolitaine / Comités d'Outre-Mer"
                ],
                correct: 0
            },
            {
                question: "Quel atout maritime majeur les territoires d'outre-mer procurent-ils à la France ?",
                answers: [
                    "La deuxième plus vaste Zone Économique Exclusive (ZEE) maritime mondiale pour exploiter les océans",
                    "Le contrôle absolu et exclusif de la production mondiale de pétrole brut",
                    "La suppression totale du besoin d'entretenir une marine militaire nationale",
                    "La fourniture de l'intégralité du blé et du maïs consommés en France métropolitaine"
                ],
                correct: 0
            },
            {
                question: "Quels sont deux atouts économiques et environnementaux majeurs des DROM-COM ?",
                answers: [
                    "Une biodiversité exceptionnelle et une attractivité pour le tourisme international",
                    "Une industrie de construction d'automobiles géante et des gisements de charbon",
                    "L'absence totale d'impôts sur le revenu et des salaires de misère",
                    "Une proximité géographique immédiate avec les villes de Paris et de Berlin"
                ],
                correct: 0
            },
            {
                question: "Quelle difficulté ou contrainte structurelle caractérise les territoires ultramarins ?",
                answers: [
                    "L'éloignement géographique, un chômage élevé et une dépendance économique envers la métropole",
                    "L'absence absolue d'accès à une mer ou à un espace océanique",
                    "La baisse de la biodiversité tropicale provoquée par des vagues de gel polaire",
                    "L'interdiction stricte imposée par l'État de commercer avec les pays voisins de leur zone"
                ],
                correct: 0
            },
            {
                question: "Quel aménagement scientifique mondial majeur se situe sur le territoire ultramarin de la Guyane ?",
                answers: [
                    "Le Centre Spatial Guyanais de Kourou pour le lancement des fusées européennes",
                    "Le plus grand accélérateur de particules nucléaires de la planète",
                    "Le centre de commandement informatique d'internet pour l'ensemble du globe",
                    "Le laboratoire central de fabrication des vaccins contre les maladies de l'hiver"
                ],
                correct: 0
            },
            {
                question: "Pourquoi le coût de la vie est-il généralement plus élevé dans les DROM-COM qu'en métropole ?",
                answers: [
                    "À cause de l'étroitesse des marchés et de la nécessité d'importer de nombreux produits par avion ou bateau",
                    "Parce que la monnaie utilisée là-bas possède une valeur trois fois supérieure à l'euro",
                    "En raison d'une interdiction légale de produire de la nourriture sur place",
                    "Parce que l'ensemble des commerces appartient de manière exclusive à l'État français"
                ],
                correct: 0
            },

            // --- CHAPITRE 6 : L’UNION EUROPÉENNE (Questions 42 à 46) ---
            {
                question: "Qu'est-ce que l'Union européenne sur le plan politique et économique ?",
                answers: [
                    "Une association d'États démocratiques européens qui coopèrent et mènent des politiques communes",
                    "Une alliance militaire secrète dirigée uniquement par les forces armées françaises",
                    "Un pays unique doté d'un président unique gouvernant depuis Paris",
                    "Une association caritative chargée de distribuer de l'eau potable dans le monde"
                ],
                correct: 0
            },
            {
                question: "Quel était l'objectif historique prioritaire des pères fondateurs de l'Europe ?",
                answers: [
                    "Assurer une paix durable entre les pays membres après les ravages de la Seconde Guerre mondiale",
                    "Conquérir de vastes empires coloniaux en dehors du continent européen",
                    "Imposer de force l'usage d'une seule et unique religion à tous les citoyens",
                    "Supprimer toutes les langues régionales et nationales au profit de l'espéranto"
                ],
                correct: 0
            },
            {
                question: "Quelle institution européenne vote les lois et est élue directement par les citoyens ?",
                answers: [
                    "Le Parlement européen",
                    "La Commission européenne",
                    "Le Conseil européen des chefs d'État",
                    "La Cour de justice de l'Union européenne"
                ],
                correct: 0
            },
            {
                question: "Qu'est-ce que l'Espace Schengen ?",
                answers: [
                    "Une zone de libre circulation où les contrôles aux frontières intérieures sont abolis pour les personnes",
                    "Le nom du palais officiel où réside le président permanent de l'Europe",
                    "La monnaie unique en circulation au sein de l'intégralité des 27 pays membres",
                    "La zone industrielle européenne dédiée à la construction des satellites"
                ],
                correct: 0
            },
            {
                question: "Comment l'UE aide-t-elle financièrement à l'aménagement des territoires en retard de développement ?",
                answers: [
                    "En distribuant des subventions régionales via des fonds de cohésion économique (comme le FEDER)",
                    "En forçant les habitants des régions pauvres à migrer vers les capitales d'Europe du Nord",
                    "En supprimant toutes les barrières douanières uniquement sur l'importation du pétrole",
                    "En construisant des lignes de chemins de fer privées interdites d'accès au grand public"
                ],
                correct: 0
            },

            // --- CHAPITRE 7 : LA FRANCE ET L’EUROPE DANS LE MONDE (Questions 47 à 51) ---
            {
                question: "Quels facteurs font de la France une puissance d'influence mondiale ?",
                answers: [
                    "Son économie développée, son armée (dissuasion nucléaire), sa diplomatie (ONU) et sa culture",
                    "Le fait que sa population totale soit la plus nombreuse de la Terre entière",
                    "Sa production exclusive de l'ensemble des serveurs internet de la planète",
                    "Le choix stratégique de n'appartenir à aucune alliance ou organisation internationale"
                ],
                correct: 0
            },
            {
                question: "Qu'est-ce que l'organisation de la Francophonie ?",
                answers: [
                    "L'ensemble des pays et communautés partageant l'usage de la langue française dans le monde",
                    "Le syndicat national regroupant les enseignants de géographie du secondaire",
                    "Le parti politique qui détient actuellement la majorité au Parlement européen",
                    "L'obligation internationale faite à tous les élèves du monde d'apprendre le français"
                ],
                correct: 0
            },
            {
                question: "Quelle place économique occupe l'Union européenne dans le commerce mondialisé ?",
                answers: [
                    "C'est un pôle de puissance économique, commercial et financier majeur à l'échelle planétaire",
                    "C'est un marché totalement fermé autarcique qui refuse de commercer avec l'extérieur",
                    "C'est la zone géographique la plus pauvre de la planète en termes de PIB par habitant",
                    "C'est un espace vivant uniquement d'agriculture traditionnelle sans aucune industrie moderne"
                ],
                correct: 0
            },
            {
                question: "Quelle est une limite interne visible au sein de l'organisation de l'Union européenne ?",
                answers: [
                    "De fortes disparités de richesse et de développement économique entre les pays de l'Ouest et de l'Est",
                    "L'obligation pour l'ensemble des voitures d'avoir exactement le même constructeur d'origine",
                    "L'interdiction totale de traverser la frontière entre deux pays de l'Union sans visa d'État",
                    "Le manque absolu d'accès à des côtes ou façades maritimes pour la totalité des membres"
                ],
                correct: 0
            },
            {
                question: "De quelle fragilité majeure l'économie européenne souffre-t-elle face à ses concurrents ?",
                answers: [
                    "Une forte dépendance énergétique (gaz, pétrole) et pour certains composants technologiques critiques",
                    "Un manque total d'écoles supérieures, d'universités et de main-d'œuvre qualifiée",
                    "L'absence complète de monnaies d'échange stables ou de systèmes bancaires de régulation",
                    "Une surproduction agricole chronique qui détruit l'ensemble des marchés financiers urbains"
                ],
                correct: 0
            }
        ]
    }
   emc: {
        title: "⚖️ EMC",
        fiches: `
            <style>
                .emc-app-container { color: #1e293b !important; font-family: system-ui, -apple-system, sans-serif; padding: 5px; }
                .emc-app-container h3 { color: #0f172a !important; margin-top: 25px; margin-bottom: 12px; font-size: 1.35em; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; }
                .emc-app-container p, .emc-app-container li { color: #334155 !important; line-height: 1.6; font-size: 1rem; }
                .emc-app-container strong { color: #0f172a !important; }
                
                /* Boutons de navigation */
                .btn-chapitre-emc { width: 100%; padding: 16px; color: white !important; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.05rem; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 4px; transition: transform 0.1s; display: block; }
                .btn-chapitre-emc:active { transform: scale(0.99); }
                
                .btn-retour-emc { display: inline-flex; align-items: center; margin-bottom: 20px; padding: 12px 20px; background: #475569; color: white !important; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .btn-retour-emc:active { transform: scale(0.97); }
                
                /* Écrans de cours */
                .emc-ecran-cours { background: #ffffff !important; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                
                .emc-app-container ul, .emc-app-container ol { padding-left: 20px; margin-bottom: 15px; }
                .emc-app-container li { margin-bottom: 6px; }
                .emc-alerte { background: #fef2f2; color: #b91c1c !important; padding: 14px; border-radius: 6px; border: 1px solid #fca5a5; margin: 15px 0; }
                .emc-notion { background: #f0fdf4; color: #166534 !important; padding: 14px; border-radius: 6px; border: 1px solid #bbf7d0; margin: 15px 0; }
            </style>

            <div class="emc-app-container">
                
                <div id="emc-menu-principal" style="display: block;">
                    <p style="text-align: center; font-weight: bold; margin-bottom: 22px; color: #475569;">Sélectionnez un thème du programme complet d'EMC :</p>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        
                        <button class="btn-chapitre-emc" style="background: #0ea5e9;" 
                                onclick="document.getElementById('emc-menu-principal').style.display='none'; document.getElementById('emc-theme1').style.display='block'; window.scrollTo(0,0);">
                            🇫🇷 THÈME 1 : ACQUÉRIR ET PARTAGER LES VALEURS DE LA RÉPUBLIQUE
                        </button>
                        
                        <button class="btn-chapitre-emc" style="background: #10b981;" 
                                onclick="document.getElementById('emc-menu-principal').style.display='none'; document.getElementById('emc-theme2').style.display='block'; window.scrollTo(0,0);">
                            🏛️ THÈME 2 : CONSTRUIRE UNE CULTURE CIVIQUE
                        </button>
                        
                        <button class="btn-chapitre-emc" style="background: #ec4899;" 
                                onclick="document.getElementById('emc-menu-principal').style.display='none'; document.getElementById('emc-bilan').style.display='block'; window.scrollTo(0,0);">
                            🎯 SYNTHÈSE COMPLÈTE & CONCLUSION
                        </button>
                        
                    </div>
                </div>

                <div id="emc-theme1" class="emc-ecran-cours" style="display: none; border-top: 6px solid #0ea5e9;">
                    <button class="btn-retour-emc" onclick="document.getElementById('emc-theme1').style.display='none'; document.getElementById('emc-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux thèmes</button>
                    <div style="background: #0ea5e9; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.1em; margin-bottom: 20px;">THÈME 1 : ACQUÉRIR ET PARTAGER LES VALEURS DE LA RÉPUBLIQUE</div>
                    
                    <h3>CHAPITRE 1 : ÊTRE CITOYEN FRANÇAIS, DROITS ET DEVOIRS</h3>
                    <p><strong>PARTIE 1 : CE QU’EST UN CITOYEN FRANÇAIS</strong></p>
                    <p>Être citoyen français signifie appartenir à la communauté nationale et disposer de droits politiques qui permettent de participer à la vie démocratique du pays. Cette citoyenneté repose sur la nationalité, qui peut être obtenue par la naissance, par la filiation ou encore par la naturalisation lorsqu’une personne étrangère devient française.</p>
                    <p>Ainsi, la citoyenneté ne se limite pas à un statut administratif, mais elle implique également une appartenance à une communauté politique dans laquelle chaque individu peut exercer un rôle actif.</p>
                    
                    <p><strong>PARTIE 2 : LES DROITS DU CITOYEN</strong></p>
                    <p>Les citoyens français disposent de plusieurs catégories de droits qui garantissent leur liberté et leur protection :</p>
                    <ul>
                        <li><strong>Les droits civils :</strong> Ils assurent les libertés fondamentales, comme la liberté d’expression, la liberté de circulation ou encore le droit à la justice. Ces droits permettent à chaque individu de vivre librement dans le respect des lois.</li>
                        <li><strong>Les droits politiques :</strong> Ils donnent aux citoyens la possibilité de participer à la vie démocratique, notamment grâce au droit de vote et au droit d’être élu. Ces droits sont essentiels car ils permettent aux citoyens d’influencer les décisions politiques.</li>
                        <li><strong>Les droits sociaux :</strong> Ils garantissent un certain niveau de protection et d’égalité, notamment à travers l’accès à l’éducation, à la santé et à la protection sociale. Ils contribuent à réduire les inégalités entre les citoyens.</li>
                    </ul>
                    
                    <p><strong>PARTIE 3 : LES DEVOIRS DU CITOYEN</strong></p>
                    <p>Cependant, la citoyenneté ne repose pas uniquement sur des droits, car elle implique également des devoirs envers la société. Chaque citoyen doit respecter les lois de la République, puisque celles-ci assurent le bon fonctionnement de la vie collective.</p>
                    <p>De plus, il est attendu des citoyens qu’ils participent à la solidarité nationale, notamment en payant leurs impôts ou en respectant les autres membres de la société. Enfin, être citoyen signifie également accepter de défendre son pays si cela est nécessaire, tout en respectant les principes démocratiques.</p>

                    <h3>CHAPITRE 2 : L’ÉGALITÉ FEMMES-HOMMES</h3>
                    <p><strong>PARTIE 1 : UN PRINCIPE FONDAMENTAL DE LA RÉPUBLIQUE</strong></p>
                    <p>L’égalité entre les femmes et les hommes constitue un principe essentiel de la République française, inscrit dans la Constitution. Cela signifie que les femmes et les hommes doivent bénéficier des mêmes droits dans tous les domaines de la vie sociale, politique et économique.</p>
                    <p>Ce principe vise à garantir une société plus juste, dans laquelle aucune discrimination fondée sur le sexe ne peut être acceptée.</p>
                    
                    <p><strong>PARTIE 2 : DES INÉGALITÉS QUI PERSISTENT</strong></p>
                    <div class="emc-alerte">
                        <strong>⚠️ Constats sur le terrain :</strong> Malgré ce principe d’égalité, des inégalités persistent encore dans la société. Dans le monde du travail, par exemple, les femmes peuvent être moins bien rémunérées que les hommes pour des postes équivalents, ou avoir plus de difficultés à accéder à des postes à responsabilités. De plus, certaines représentations sociales et stéréotypes continuent d’influencer les comportements, ce qui peut limiter les choix professionnels ou personnels. Enfin, les violences sexistes rappellent que cette égalité n’est pas encore totalement atteinte.
                    </div>
                    
                    <p><strong>PARTIE 3 : LES ACTIONS POUR RÉDUIRE LES INÉGALITÉS</strong></p>
                    <p>Face à ces constats, l’État et les institutions mettent en place des politiques visant à renforcer l’égalité entre les femmes et les hommes. Cela passe notamment par :</p>
                    <ul>
                        <li>Des lois contre les discriminations.</li>
                        <li>La promotion de la parité en politique.</li>
                        <li>Des actions éducatives à l’école pour lutter contre les stéréotypes.</li>
                    </ul>
                    <p>Ainsi, l’égalité femmes-hommes est à la fois un principe fondamental et un objectif à construire continuellement.</p>

                    <h3>CHAPITRE 3 : LA LAÏCITÉ</h3>
                    <p><strong>PARTIE 1 : UNE VALEUR FONDAMENTALE DE LA RÉPUBLIQUE</strong></p>
                    <p>La laïcité est un principe fondamental de la République française qui garantit à la fois la liberté de conscience et la neutralité de l’État. Cela signifie que chaque individu est libre de croire ou de ne pas croire, sans subir de pression ou de discrimination. Ce principe assure également que l’État ne favorise aucune religion, afin de garantir l’égalité entre tous les citoyens, quelles que soient leurs convictions.</p>
                    
                    <p><strong>PARTIE 2 : UN ÉQUILIBRE ENTRE LIBERTÉ ET RESPECT</strong></p>
                    <p>La laïcité repose sur un équilibre entre la liberté individuelle et le respect de la vie collective. Chaque citoyen peut exprimer ses convictions religieuses dans le respect des lois, mais les institutions publiques, comme l’école ou les administrations, doivent rester neutres afin de garantir l’égalité de traitement. Ainsi, la laïcité ne signifie pas l’absence de religion, mais l’organisation d’une coexistence pacifique entre toutes les croyances.</p>
                    
                    <p><strong>PARTIE 3 : UNE APPLICATION DANS LA SOCIÉTÉ</strong></p>
                    <p>Dans la pratique, la laïcité se manifeste notamment :</p>
                    <ul>
                        <li><strong>Dans les écoles publiques :</strong> où les enseignants et les élèves doivent respecter la neutralité religieuse dans le cadre scolaire.</li>
                        <li><strong>Dans les services publics :</strong> où les agents de l’État ne doivent pas afficher de signes religieux dans l’exercice de leurs fonctions.</li>
                    </ul>
                </div>

                <div id="emc-theme2" class="emc-ecran-cours" style="display: none; border-top: 6px solid #10b981;">
                    <button class="btn-retour-emc" onclick="document.getElementById('emc-theme2').style.display='none'; document.getElementById('emc-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux thèmes</button>
                    <div style="background: #10b981; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.1em; margin-bottom: 20px;">THÈME 2 : CONSTRUIRE UNE CULTURE CIVIQUE</div>
                    
                    <h3>CHAPITRE 4 : LES INSTITUTIONS DE LA VÈME RÉPUBLIQUE</h3>
                    <p><strong>PARTIE 1 : LE PRÉSIDENT DE LA RÉPUBLIQUE</strong></p>
                    <p>Le président de la République est le chef de l’État. Il est élu par les citoyens au suffrage universel direct et représente l’autorité suprême dans les institutions françaises. Il dispose de pouvoirs importants, comme la nomination du Premier ministre, la direction de la politique étrangère ou encore la possibilité de dissoudre l’Assemblée nationale.</p>
                    
                    <p><strong>PARTIE 2 : LE GOUVERNEMENT</strong></p>
                    <p>Le gouvernement, dirigé par le Premier ministre, est chargé de mettre en œuvre la politique de la nation. Il prépare les lois et dirige l’action de l’administration. Il doit cependant travailler en collaboration avec le Parlement, qui contrôle son action.</p>
                    
                    <p><strong>PARTIE 3 : LE PARLEMENT</strong></p>
                    <p>Le Parlement est composé de deux chambres : <strong>l’Assemblée nationale</strong> et <strong>le Sénat</strong>. Son rôle principal est de voter les lois et de contrôler le gouvernement. Ainsi, il représente le pouvoir législatif dans la démocratie française.</p>

                    <h3>CHAPITRE 5 : LE VOTE ET L’ÉLECTION</h3>
                    <p><strong>PARTIE 1 : UN DROIT FONDAMENTAL</strong></p>
                    <p>Le vote est un droit essentiel dans une démocratie, car il permet aux citoyens de participer directement aux décisions politiques en choisissant leurs représentants.</p>
                    
                    <p><strong>PARTIE 2 : LES PRINCIPES DU VOTE</strong></p>
                    <p>Le système électoral repose sur plusieurs principes fondamentaux :</p>
                    <ul>
                        <li><strong>L'universalité :</strong> car tous les citoyens majeurs peuvent voter.</li>
                        <li><strong>La liberté :</strong> puisque chacun vote sans contrainte.</li>
                        <li><strong>Le secret du vote :</strong> qui garantit la protection de l’opinion de chacun.</li>
                    </ul>
                    
                    <p><strong>PARTIE 3 : LES DIFFÉRENTS SCRUTINS</strong></p>
                    <p>Les citoyens participent à plusieurs types d’élections, comme les élections présidentielles, législatives, municipales ou européennes, chacune ayant un rôle spécifique dans le fonctionnement de la démocratie.</p>

                    <h3>CHAPITRE 6 : VALEURS ET SYMBOLES DE LA CITOYENNETÉ</h3>
                    <p><strong>PARTIE 1 : LES VALEURS DE LA RÉPUBLIQUE</strong></p>
                    <p>La République française repose sur trois grandes valeurs fondamentales :</p>
                    <ul>
                        <li><strong>La liberté :</strong> qui permet à chacun d’agir dans le respect des lois.</li>
                        <li><strong>L'égalité :</strong> qui garantit les mêmes droits à tous les citoyens.</li>
                        <li><strong>La fraternité :</strong> qui exprime l’idée de solidarité entre les membres de la société.</li>
                    </ul>
                    
                    <p><strong>PARTIE 2 : LES SYMBOLES DE LA RÉPUBLIQUE</strong></p>
                    <p>Ces valeurs sont représentées par différents symboles, comme le drapeau tricolore, la Marseillaise, la figure de Marianne ou encore la devise « Liberté, Égalité, Fraternité », qui rappellent les fondements de la République française.</p>
                    
                    <p><strong>PARTIE 3 : LA CITOYENNETÉ EUROPÉENNE</strong></p>
                    <p>En plus de la citoyenneté française, les citoyens disposent également d’une citoyenneté européenne qui leur permet de circuler librement dans l’Union européenne, de voter aux élections européennes et de bénéficier de droits communs dans les États membres.</p>

                    <h3>CHAPITRE 7 : LA DÉFENSE ET LA SÉCURITÉ</h3>
                    <p><strong>PARTIE 1 : LA PROTECTION DU TERRITOIRE</strong></p>
                    <p>La défense nationale a pour objectif de protéger le territoire, la population et les intérêts de la France contre les menaces extérieures ou intérieures.</p>
                    
                    <p><strong>PARTIE 2 : LES ACTEURS DE LA SÉCURITÉ</strong></p>
                    <p>Cette mission est assurée par plusieurs acteurs, notamment <strong>l’armée, la police et la gendarmerie</strong>, qui travaillent ensemble pour garantir la sécurité des citoyens.</p>
                    
                    <p><strong>PARTIE 3 : LES NOUVELLES MENACES</strong></p>
                    <p>Aujourd’hui, la sécurité doit aussi faire face à de nouvelles menaces, comme le terrorisme, les cyberattaques ou encore les conflits internationaux, ce qui nécessite une coopération internationale renforcée.</p>
                </div>

                <div id="emc-bilan" class="emc-ecran-cours" style="display: none; border-top: 6px solid #ec4899;">
                    <button class="btn-retour-emc" onclick="document.getElementById('emc-bilan').style.display='none'; document.getElementById('emc-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux thèmes</button>
                    <div style="background: #ec4899; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 20px;">🎯 CONCLUSION GÉNÉRALE DU COURS</div>
                    
                    <div class="emc-notion">
                        <strong>📌 Résumé à retenir :</strong> 
                        L’EMC montre que la citoyenneté repose sur un équilibre entre droits et devoirs, mais aussi sur des valeurs fondamentales comme la liberté, l’égalité et la fraternité. Elle s’exerce à travers des institutions démocratiques, des élections et une participation active à la vie collective, tout en garantissant la protection et la sécurité de tous.
                    </div>
                </div>
            </div>
        `,
        quiz: [
            // --- CHAPITRE 1 : ÊTRE CITOYEN FRANÇAIS (1 à 9) ---
            {
                question: "Que signifie être citoyen français d'un point de vue politique ?",
                answers: [
                    "Appartenir à la communauté nationale et disposer de droits politiques pour participer à la vie démocratique",
                    "Avoir uniquement le droit de posséder une carte d'identité administrative sans voter",
                    "Habiter obligatoirement dans la ville de Paris de manière permanente",
                    "Être exempté de respecter les règlements administratifs locaux"
                ],
                correct: 0
            },
            {
                question: "Par quels moyens une personne peut-elle obtenir la nationalité française ?",
                answers: [
                    "Par la naissance, par la filiation ou encore par la naturalisation",
                    "Uniquement en achetant un bien immobilier sur le sol français",
                    "En parlant couramment n'importe quelle langue européenne",
                    "En envoyant une simple lettre d'adhésion au Parlement"
                ],
                correct: 0
            },
            {
                question: "Qu'assurent précisément les droits civils du citoyen français ?",
                answers: [
                    "Les libertés fondamentales, comme la liberté d’expression, de circulation ou le droit à la justice",
                    "Le versement automatique d'un salaire mensuel par le gouvernement",
                    "L'accès gratuit et illimité à l'intégralité des commerces privés",
                    "Le droit exclusif de ne jamais payer d'impôts nationaux"
                ],
                correct: 0
            },
            {
                question: "Quels droits permettent directement aux citoyens d’influencer les décisions politiques ?",
                answers: [
                    "Les droits politiques, notamment grâce au droit de vote et au droit d’être élu",
                    "Les droits civils liés uniquement à la liberté de circulation",
                    "Les droits sociaux concernant l'accès aux soins médicaux",
                    "Les droits professionnels régissant les horaires de travail"
                ],
                correct: 0
            },
            {
                question: "Quels sont des exemples concrets de droits sociaux garantis au citoyen ?",
                answers: [
                    "L’accès à l’éducation, à la santé et à la protection sociale",
                    "Le droit de vote et la possibilité de se présenter à une élection",
                    "La liberté d'expression et le droit de circuler librement",
                    "La possibilité de modifier les lois de la Constitution tout seul"
                ],
                correct: 0
            },
            {
                question: "Quel est le but principal des droits sociaux au sein de la République ?",
                answers: [
                    "Ils contribuent à réduire les inégalités entre les citoyens",
                    "Ils permettent de dissoudre l'Assemblée nationale",
                    "Ils interdisent l'affichage des symboles républicains",
                    "Ils suppriment la nécessité d'élire un président"
                ],
                correct: 0
            },
            {
                question: "Pourquoi chaque citoyen a-t-il le devoir de respecter les lois de la République ?",
                answers: [
                    "Puisque celles-ci assurent le bon fonctionnement de la vie collective",
                    "Parce que les lois changent automatiquement chaque semaine",
                    "Uniquement pour éviter d'avoir à voter aux élections régionales",
                    "Parce que c'est une règle réservée exclusivement aux personnes étrangères"
                ],
                correct: 0
            },
            {
                question: "Comment un citoyen participe-t-il activement à la solidarité nationale ?",
                answers: [
                    "Notamment en payant ses impôts ou en respectant les autres membres de la société",
                    "En choisissant lui-même quelles lois il souhaite appliquer au quotidien",
                    "En refusant de participer aux débats et aux scrutins publics",
                    "Uniquement en travaillant au sein de l'administration du gouvernement"
                ],
                correct: 0
            },
            {
                question: "Quel engagement militaire ou civique fait partie des devoirs potentiels du citoyen ?",
                answers: [
                    "Accepter de défendre son pays si cela est nécessaire",
                    "Devenir obligatoirement soldat professionnel pendant 10 ans",
                    "Créer une armée privée indépendante dans sa commune",
                    "Refuser toute forme de coopération internationale de défense"
                ],
                correct: 0
            },

            // --- CHAPITRE 2 : L'ÉGALITÉ FEMMES-HOMMES (10 à 16) ---
            {
                question: "Où est inscrit le principe fondamental de l'égalité femmes-hommes en France ?",
                answers: [
                    "Dans la Constitution",
                    "Uniquement dans le règlement intérieur des écoles",
                    "Dans un simple livret d'accueil municipal",
                    "Sur les pièces de monnaie en euros"
                ],
                correct: 0
            },
            {
                question: "Que signifie concrètement le principe constitutionnel d'égalité femmes-hommes ?",
                answers: [
                    "Les femmes et les hommes doivent bénéficier des mêmes droits dans tous les domaines (social, politique, économique)",
                    "Les hommes doivent avoir plus de droits économiques que les femmes",
                    "Les femmes n'ont accès qu'aux fonctions politiques locales",
                    "Le sexe d'un individu détermine entièrement son salaire légal"
                ],
                correct: 0
            },
            {
                question: "Quel objectif social poursuit le principe d'égalité entre les sexes ?",
                answers: [
                    "Garantir une société plus juste, dans laquelle aucune discrimination fondée sur le sexe ne peut être acceptée",
                    "Supprimer toutes les distinctions de diplômes dans le monde professionnel",
                    "Forcer tous les citoyens à exercer exactement le même métier",
                    "Rendre les choix personnels et professionnels totalement impossibles"
                ],
                correct: 0
            },
            {
                question: "Quel exemple d'inégalité persistante constate-t-on dans le monde du travail ?",
                answers: [
                    "Les femmes peuvent être moins bien rémunérées pour des postes équivalents ou accéder plus difficilement aux responsabilités",
                    "Les femmes ont l'interdiction légale absolue de signer un contrat de travail",
                    "Les hommes subissent une baisse de salaire s'ils obtiennent un diplôme supérieur",
                    "Il n'existe plus aucune différence de traitement ni de salaire depuis 1950"
                ],
                correct: 0
            },
            {
                question: "Qu'est-ce qui continue d’influencer négativement les comportements et de limiter les choix professionnels ?",
                answers: [
                    "Certaines représentations sociales et stéréotypes",
                    "L'absence totale de lois écrites dans la Constitution",
                    "Le code de la route et les règles de circulation urbaine",
                    "Le Parlement européen de manière délibérée"
                ],
                correct: 0
            },
            {
                question: "Quel fait tragique rappelle que l'égalité femmes-hommes n'est pas encore totalement atteinte ?",
                answers: [
                    "Les violences sexistes",
                    "L'élection d'un Premier ministre",
                    "La création de cours d'EMC à l'école",
                    "Le droit de vote accordé aux femmes"
                ],
                correct: 0
            },
            {
                question: "Par quelles actions concrètes l'État tente-t-il de réduire les inégalités entre les sexes ?",
                answers: [
                    "Par des lois contre les discriminations, la parité en politique et des actions éducatives à l'école",
                    "En interdisant aux hommes de se présenter aux élections législatives",
                    "En fermant l'accès des universités aux personnes véhiculant des stéréotypes",
                    "En instaurant un salaire unique identique pour tous les métiers de France"
                ],
                correct: 0
            },

            // --- CHAPITRE 3 : LA LAÏCITÉ (17 à 23) ---
            {
                question: "Qu'est-ce que le principe fondamental de la laïcité garantit à chaque citoyen ?",
                answers: [
                    "La liberté de conscience (libre de croire ou de ne pas croire) et la neutralité de l’État",
                    "L'obligation de choisir une religion officielle dès l'âge de 18 ans",
                    "La gratuité totale de l'ensemble des lieux de culte construits en France",
                    "Le financement des fêtes religieuses privées par le budget de la mairie"
                ],
                correct: 0
            },
            {
                question: "Que fait l'État laïque vis-à-vis des différentes religions pour assurer l'égalité ?",
                answers: [
                    "Il ne favorise aucune religion, afin de garantir l’égalité entre tous les citoyens",
                    "Il choisit chaque année une religion principale qu'il finance en priorité",
                    "Il interdit l'existence de toute croyance sur l'ensemble du territoire",
                    "Il délègue l'écriture des lois nationales aux autorités religieuses"
                ],
                correct: 0
            },
            {
                question: "Sur quel équilibre repose le principe républicain de la laïcité ?",
                answers: [
                    "Un équilibre entre la liberté individuelle et le respect de la vie collective",
                    "Une séparation stricte entre le pouvoir législatif et le pouvoir judiciaire",
                    "L'égalité parfaite des salaires entre les fonctionnaires et le secteur privé",
                    "L'absence totale de lois concernant l'expression publique des opinions"
                ],
                correct: 0
            },
            {
                question: "La laïcité signifie-t-elle l'absence ou la suppression des religions ?",
                answers: [
                    "Non, elle signifie l'organisation d'une coexistence pacifique entre toutes les croyances",
                    "Oui, elle vise à faire disparaître la foi de l'espace privé des individus",
                    "Oui, c'est l'interdiction de parler de spiritualité au sein des familles",
                    "Non, elle impose au contraire d'étudier obligatoirement tous les textes sacrés"
                ],
                correct: 0
            },
            {
                question: "Comment se manifeste la laïcité au sein des écoles publiques françaises ?",
                answers: [
                    "Les enseignants et les élèves doivent respecter la neutralité religieuse dans le cadre scolaire",
                    "Les élèves ont l'obligation de porter un uniforme affichant la devise de la République",
                    "Il est interdit d'évoquer l'existence des faits religieux dans les cours d'histoire",
                    "L'école sélectionne les élèves en fonction des convictions de leurs parents"
                ],
                correct: 0
            },
            {
                question: "Quelle règle de laïcité s'applique aux agents de l'État dans les services publics ?",
                answers: [
                    "Ils ne doivent pas afficher de signes religieux dans l’exercice de leurs fonctions",
                    "Ils ont l'obligation d'appartenir à la religion choisie par le Premier ministre",
                    "Ils doivent enseigner leurs propres convictions philosophiques aux usagers",
                    "Ils sont dispensés de respecter la neutralité s'ils travaillent dans une mairie"
                ],
                correct: 0
            },
            {
                question: "Pourquoi les institutions publiques et administrations doivent-elles impérativement rester neutres ?",
                answers: [
                    "Afin de garantir l’égalité de traitement entre tous les citoyens",
                    "Pour permettre au gouvernement de modifier les lois plus rapidement",
                    "Parce que cela réduit automatiquement le coût de fonctionnement des services",
                    "Pour inciter les citoyens à ne plus participer aux élections politiques"
                ],
                correct: 0
            },

            // --- CHAPITRE 4 : LES INSTITUTIONS DE LA VÈME RÉPUBLIQUE (24 à 31) ---
            {
                question: "Quel est le statut officiel du président de la République en France ?",
                answers: [
                    "Il est le chef de l’État et représente l’autorité suprême dans les institutions",
                    "Il est le dirigeant unique du pouvoir législatif et écrit toutes les lois",
                    "Il est élu uniquement par les députés et les sénateurs réunis en Congrès",
                    "Il possède un mandat à vie qui ne dépend pas du vote des citoyens"
                ],
                correct: 0
            },
            {
                question: "Comment le président de la République est-il élu sous la Vème République ?",
                answers: [
                    "Par les citoyens au suffrage universel direct",
                    "Par un tirage au sort parmi l'ensemble des maires de France",
                    "Par le Conseil constitutionnel sur proposition du Sénat",
                    "Par les députés siégeant à l'Assemblée nationale"
                ],
                correct: 0
            },
            {
                question: "Citez un pouvoir constitutionnel important détenu par le président de la République.",
                answers: [
                    "La nomination du Premier ministre et la possibilité de dissoudre l’Assemblée nationale",
                    "Le droit de modifier les impôts tout seul sans l'accord du Parlement",
                    "La direction exclusive des tribunaux et la nomination de tous les juges",
                    "La rédaction des manuels scolaires d'Enseignement Moral et Civique"
                ],
                correct: 0
            },
            {
                question: "Qui dirige le gouvernement sous la Vème République ?",
                answers: [
                    "Le Premier ministre",
                    "Le président de l'Assemblée nationale",
                    "Le plus ancien des sénateurs",
                    "Le ministre de l'Intérieur"
                ],
                correct: 0
            },
            {
                question: "Quelle est la mission principale du gouvernement ?",
                answers: [
                    "Mettre en œuvre la politique de la nation, préparer les lois et diriger l’action de l’administration",
                    "Voter définitivement les lois de manière indépendante sans le Parlement",
                    "Contrôler la validité des votes lors de l'élection présidentielle",
                    "Remplacer le chef de l'État en cas de déplacement à l'étranger"
                ],
                correct: 0
            },
            {
                question: "Avec quelle institution essentielle le gouvernement doit-il collaborer au quotidien ?",
                answers: [
                    "Le Parlement, qui contrôle son action",
                    "L'armée nationale de manière exclusive",
                    "Les syndicats d'enseignants uniquement",
                    "Le gouvernement des autres pays du G7"
                ],
                correct: 0
            },
            {
                question: "Quelles sont les deux chambres qui composent le Parlement français ?",
                answers: [
                    "L’Assemblée nationale et le Sénat",
                    "La Commission européenne et le Conseil d'État",
                    "La Cour de cassation et le Conseil constitutionnel",
                    "La mairie et la préfecture de région"
                ],
                correct: 0
            },
            {
                question: "Quel pouvoir le Parlement représente-t-il dans la démocratie française ?",
                answers: [
                    "Le pouvoir législatif (voter les lois et contrôler le gouvernement)",
                    "Le pouvoir exécutif supérieur de commandement",
                    "Le pouvoir judiciaire de condamnation pénale",
                    "Le pouvoir médiatique et d'information publique"
                ],
                correct: 0
            },

            // --- CHAPITRE 5 : LE VOTE ET L'ÉLECTION (32 à 38) ---
            {
                question: "Pourquoi le vote est-il considéré comme un droit essentiel dans une démocratie ?",
                answers: [
                    "Il permet aux citoyens de participer directement aux décisions en choisissant leurs représentants",
                    "Il s'agit d'une obligation qui donne droit à une rémunération financière",
                    "Il permet de remplacer l'ensemble des lois écrites par des avis populaires",
                    "C'est le seul moyen d'obtenir une carte nationale d'identité"
                ],
                correct: 0
            },
            {
                question: "Que signifie le principe d'universalité du système électoral français ?",
                answers: [
                    "Tous les citoyens majeurs disposant de leurs droits peuvent voter",
                    "Le vote est ouvert à l'intégralité des habitants de la planète Terre",
                    "Les résultats d'une élection s'appliquent à l'univers entier",
                    "Chaque citoyen doit voter pour le même candidat en même temps"
                ],
                correct: 0
            },
            {
                question: "Que garantit le principe de liberté du vote lors d'un scrutin ?",
                answers: [
                    "Chaque citoyen exprime son choix et vote sans subir de contrainte",
                    "Les citoyens sont libres de falsifier les bulletins s'ils ne sont pas d'accord",
                    "On est libre de voter plusieurs fois dans la même journée",
                    "Le candidat élu est libre d'ignorer la Constitution après l'élection"
                ],
                correct: 0
            },
            {
                question: "Quel dispositif ou principe protège l'opinion de chacun lors du vote ?",
                answers: [
                    "Le secret du vote (notamment grâce à l'utilisation de l'isoloir)",
                    "L'affichage public de la liste de tous les choix des électeurs",
                    "La surveillance du choix de l'électeur par les forces de police",
                    "L'obligation de dire à haute voix pour qui l'on vote dans le bureau"
                ],
                correct: 0
            },
            {
                question: "Quelles élections permettent de désigner les députés siégeant à l’Assemblée nationale ?",
                answers: [
                    "Les élections législatives",
                    "Les élections présidentielles",
                    "Les élections municipales",
                    "Les élections européennes"
                ],
                correct: 0
            },
            {
                question: "Quel scrutin permet aux citoyens de choisir les conseillers et le maire de leur commune ?",
                answers: [
                    "Les élections municipales",
                    "Les élections européennes",
                    "Les élections législatives",
                    "Les scrutins régionaux uniquement"
                ],
                correct: 0
            },
            {
                question: "À quel type d'élection participe un citoyen pour désigner ses représentants au Parlement de Strasbourg ?",
                answers: [
                    "Les élections européennes",
                    "Les élections présidentielles",
                    "Les scrutins départementaux",
                    "Les élections législatives nationales"
                ],
                correct: 0
            },

            // --- CHAPITRE 6 : VALEURS, SYMBOLES ET EUROPE (39 à 45) ---
            {
                question: "Quelles sont les trois grandes valeurs fondamentales de la République française ?",
                answers: [
                    "La liberté, l’égalité et la fraternité",
                    "La justice, la richesse et la puissance",
                    "La laïcité, la sécurité et la défense",
                    "L'autorité, le travail et la propriété"
                ],
                correct: 0
            },
            {
                question: "Que permet la valeur de liberté au citoyen au sein de la République ?",
                answers: [
                    "Elle permet à chacun d’agir dans le respect des lois",
                    "Elle donne le droit de faire tout ce qu'on veut, même enfreindre la loi",
                    "Elle supprime l'obligation de respecter les droits des autres citoyens",
                    "Elle permet de refuser de payer ses impôts ou d'aller à l'école"
                ],
                correct: 0
            },
            {
                question: "Que garantit précisément la valeur d'égalité à l'ensemble de la population ?",
                answers: [
                    "Elle garantit les mêmes droits à tous les citoyens",
                    "Elle impose que tout le monde possède exactement la même somme d'argent",
                    "Elle oblige tous les Français à habiter dans le même type de logement",
                    "Elle assure que personne ne peut être puni par la justice"
                ],
                correct: 0
            },
            {
                question: "Quelle idée exprime la valeur de fraternité inscrite dans la devise nationale ?",
                answers: [
                    "L’idée de solidarité entre les membres de la société",
                    "L'obligation d'avoir le même avis politique que sa famille",
                    "Le refus de collaborer avec les citoyens des pays étrangers",
                    "La compétition économique permanente entre tous les individus"
                ],
                correct: 0
            },
            {
                question: "Citez trois symboles officiels qui représentent la République française.",
                answers: [
                    "Le drapeau tricolore, la Marseillaise et la figure de Marianne",
                    "Le TGV, la fusée Ariane et le Centre Spatial de Kourou",
                    "L'arc de triomphe, le palais de l'Élysée et le billet d'euro",
                    "Le pôle de compétitivité, l'isoloir et la couronne périurbaine"
                ],
                correct: 0
            },
            {
                question: "Qu'est-ce que la citoyenneté européenne acquise par les Français ?",
                answers: [
                    "Une citoyenneté supplémentaire qui s'ajoute à la citoyenneté française",
                    "Un statut qui remplace définitivement la nationalité française",
                    "Le droit d'élire le président des États-Unis d'Amérique",
                    "Une autorisation réservée uniquement aux députés du Parlement"
                ],
                correct: 0
            },
            {
                question: "Quels droits concrets la citoyenneté européenne confère-t-elle ?",
                answers: [
                    "Circuler librement dans l'UE, y voter aux élections européennes et bénéficier de droits communs",
                    "L'absence de taxes sur l'ensemble des marchandises achetées dans le monde",
                    "Le droit de modifier les frontières terrestres de l'Espace Schengen",
                    "Le versement automatique d'une bourse d'étude par la Commission européenne"
                ],
                correct: 0
            },

            // --- CHAPITRE 7 : LA DÉFENSE ET LA SÉCURITÉ (46 à 51) ---
            {
                question: "Quel est l'objectif fondamental de la défense nationale en France ?",
                answers: [
                    "Protéger le territoire, la population et les intérêts de la France contre les menaces",
                    "Conquérir de nouveaux territoires en dehors de l'Union européenne",
                    "Remplacer l'action de la police et des tribunaux au quotidien",
                    "Surveiller l'expression des opinions politiques lors des votes"
                ],
                correct: 0
            },
            {
                question: "Quels acteurs travaillent ensemble pour garantir la sécurité des citoyens face aux menaces ?",
                answers: [
                    "L’armée, la police et la gendarmerie",
                    "Les députés, les sénateurs et les maires uniquement",
                    "Les enseignants, les agents administratifs et les néo-ruraux",
                    "La Commission européenne et le Conseil constitutionnel"
                ],
                correct: 0
            },
            {
                question: "À quelles nouvelles menaces contemporaines la sécurité nationale doit-elle faire face ?",
                answers: [
                    "Le terrorisme, les cyberattaques ou encore les conflits internationaux",
                    "L'étalement urbain et le développement des migrations pendulaires",
                    "Le retour des néo-ruraux et l'utilisation massive du télétravail",
                    "La parité en politique et l'application stricte de la laïcité"
                ],
                correct: 0
            },
            {
                question: "Que nécessite la gestion des nouvelles menaces mondiales comme les cyberattaques ?",
                answers: [
                    "Une coopération internationale renforcée",
                    "La suppression totale de l'usage d'internet à l'école",
                    "La fermeture définitive de l'ensemble des ambassades de France",
                    "Le monopole exclusif de l'armée sans la gendarmerie"
                ],
                correct: 0
            },
            {
                question: "Sur quel équilibre repose globalement la citoyenneté selon la conclusion du cours ?",
                answers: [
                    "Un équilibre permanent entre les droits et les devoirs",
                    "Une domination du pouvoir exécutif sur le pouvoir législatif",
                    "L'effacement des symboles nationaux au profit des symboles européens",
                    "La suppression des impôts pour les citoyens participant aux votes"
                ],
                correct: 0
            },
            {
                question: "À travers quels éléments majeurs s'exerce concrètement la citoyenneté au quotidien ?",
                answers: [
                    "Les institutions démocratiques, les élections et une participation active à la vie collective",
                    "Le paiement des commerces privés et l'utilisation des transports en commun",
                    "La naturalisation obligatoire de l'intégralité des résidents européens",
                    "Le choix unilatéral des règlements de justice par chaque individu"
                ],
                correct: 0
            }
        ]
    }
    svt: {
        title: "🌱 SVT",
        fiches: `
            <style>
                .svt-app-container { color: #1e293b !important; font-family: system-ui, -apple-system, sans-serif; padding: 5px; }
                .svt-app-container h3 { color: #0f172a !important; margin-top: 25px; margin-bottom: 12px; font-size: 1.35em; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; }
                .svt-app-container p, .svt-app-container li { color: #334155 !important; line-height: 1.6; font-size: 1rem; }
                .svt-app-container strong { color: #0f172a !important; }
                
                /* Boutons de navigation */
                .btn-chapitre-svt { width: 100%; padding: 16px; color: white !important; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.05rem; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 4px; transition: transform 0.1s; display: block; }
                .btn-chapitre-svt:active { transform: scale(0.99); }
                
                .btn-retour-svt { display: inline-flex; align-items: center; margin-bottom: 20px; padding: 12px 20px; background: #475569; color: white !important; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .btn-retour-svt:active { transform: scale(0.97); }
                
                /* Écrans de cours */
                .svt-ecran-cours { background: #ffffff !important; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                
                .svt-app-container ul, .svt-app-container ol { padding-left: 20px; margin-bottom: 15px; }
                .svt-app-container li { margin-bottom: 6px; }
                .svt-alerte { background: #fff7ed; color: #c2410c !important; padding: 14px; border-radius: 6px; border: 1px solid #fed7aa; margin: 15px 0; }
                .svt-notion { background: #f0fdf4; color: #166534 !important; padding: 14px; border-radius: 6px; border: 1px solid #bbf7d0; margin: 15px 0; }
            </style>

            <div class="svt-app-container">
                
                <div id="svt-menu-principal" style="display: block;">
                    <p style="text-align: center; font-weight: bold; margin-bottom: 22px; color: #475569;">Sélectionnez un thème du programme de SVT :</p>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        
                        <button class="btn-chapitre-svt" style="background: #0284c7;" 
                                onclick="document.getElementById('svt-menu-principal').style.display='none'; document.getElementById('svt-theme1').style.display='block'; window.scrollTo(0,0);">
                            🌍 THÈME 1 : LA PLANÈTE TERRE, L’ENVIRONNEMENT ET L’ACTION HUMAINE
                        </button>
                        
                        <button class="btn-chapitre-svt" style="background: #16a34a;" 
                                onclick="document.getElementById('svt-menu-principal').style.display='none'; document.getElementById('svt-theme2').style.display='block'; window.scrollTo(0,0);">
                            🧬 THÈME 2 : LE VIVANT ET SON ÉVOLUTION
                        </button>
                        
                        <button class="btn-chapitre-svt" style="background: #dc2626;" 
                                onclick="document.getElementById('svt-menu-principal').style.display='none'; document.getElementById('svt-theme3').style.display='block'; window.scrollTo(0,0);">
                            🫁 THÈME 3 : LE CORPS HUMAIN ET LA SANTÉ
                        </button>
                        
                        <button class="btn-chapitre-svt" style="background: #4f46e5;" 
                                onclick="document.getElementById('svt-menu-principal').style.display='none'; document.getElementById('svt-bilan').style.display='block'; window.scrollTo(0,0);">
                            🎯 SYNTHÈSE COMPLÈTE & CONCLUSION
                        </button>
                        
                    </div>
                </div>

                <div id="svt-theme1" class="svt-ecran-cours" style="display: none; border-top: 6px solid #0284c7;">
                    <button class="btn-retour-svt" onclick="document.getElementById('svt-theme1').style.display='none'; document.getElementById('svt-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux thèmes</button>
                    <div style="background: #0284c7; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.1em; margin-bottom: 20px;">THÈME 1 : LA PLANÈTE TERRE, L’ENVIRONNEMENT ET L’ACTION HUMAINE</div>
                    
                    <h3>CHAPITRE 1 : LES DYNAMIQUES DE LA TERRE ET LES RISQUES ASSOCIÉS</h3>
                    <p>La Terre est une planète en mouvement permanent, car son intérieur est animé par une chaleur importante qui provient de la formation initiale du globe et de la désintégration d’éléments radioactifs. Cette énergie interne provoque des déplacements lents mais continus des plaques tectoniques, qui sont de grands blocs rigides formant la surface de la Terre.</p>
                    <p>Ces plaques peuvent s’écarter, se rapprocher ou glisser les unes contre les autres. Lorsque ces mouvements se produisent, ils entraînent des tensions dans les roches situées à la surface. Ces tensions s’accumulent progressivement jusqu’à atteindre un point de rupture, ce qui provoque alors un séisme. De la même manière, dans certaines zones, le magma présent en profondeur peut remonter vers la surface et créer des volcans actifs.</p>
                    <div class="svt-alerte">
                        <strong>⚠️ Notion de Risque :</strong> Ces phénomènes naturels deviennent des risques lorsqu’ils touchent des zones habitées. Un même séisme peut donc être sans conséquence s’il se produit dans une zone vide, ou devenir une catastrophe s’il touche une ville.
                    </div>

                    <h3>CHAPITRE 2 : MÉTÉOROLOGIE ET CLIMATOLOGIE</h3>
                    <p>La <strong>météorologie</strong> est la science qui étudie l’état de l’atmosphère à court terme, c’est-à-dire le temps qu’il fait sur quelques jours. Elle permet de prévoir la pluie, le vent ou les températures. La <strong>climatologie</strong>, en revanche, étudie les conditions moyennes sur de longues périodes, généralement plusieurs décennies, afin de comprendre les grands types de climats.</p>
                    <p>Le climat dépend de nombreux facteurs comme la latitude, l’altitude, la proximité de la mer ou encore les courants marins. Par exemple, les régions proches de l’équateur reçoivent davantage d’énergie solaire, ce qui explique des températures plus élevées. À l’inverse, les régions polaires sont beaucoup plus froides.</p>
                    <p>Depuis plusieurs décennies, les activités humaines augmentent la quantité de gaz à effet de serre dans l’atmosphère, ce qui retient davantage la chaleur du Soleil et provoque un réchauffement global du climat terrestre. Ce changement entraîne des conséquences importantes comme la montée du niveau des océans, la fonte des glaces et l’intensification des phénomènes météorologiques extrêmes.</p>

                    <h3>CHAPITRE 3 : RESSOURCES NATURELLES ET ENJEUX ENVIRONNEMENTAUX</h3>
                    <p>Les ressources naturelles regroupent tous les éléments que l’être humain prélève dans son environnement pour satisfaire ses besoins. Cela inclut l’eau, les sols, les forêts, les minerais ou encore les sources d’énergie.</p>
                    <ul>
                        <li><strong>Ressources renouvelables :</strong> qui peuvent se régénérer naturellement, comme l’eau ou la biomasse.</li>
                        <li><strong>Ressources non renouvelables :</strong> comme le pétrole ou le charbon, qui se forment sur des millions d’années et peuvent donc s’épuiser.</li>
                    </ul>
                    <p>L’exploitation intensive de ces ressources permet le développement des sociétés humaines, mais elle entraîne aussi des problèmes importants, comme la pollution, la destruction des écosystèmes et la raréfaction de certaines ressources. C’est pour répondre à ces enjeux qu’a été développé le concept de <strong>développement durable</strong>, qui vise à concilier les besoins économiques, la protection de l’environnement et les besoins des générations futures.</p>
                </div>

                <div id="svt-theme2" class="svt-ecran-cours" style="display: none; border-top: 6px solid #16a34a;">
                    <button class="btn-retour-svt" onclick="document.getElementById('svt-theme2').style.display='none'; document.getElementById('svt-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux thèmes</button>
                    <div style="background: #16a34a; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.1em; margin-bottom: 20px;">THÈME 2 : LE VIVANT ET SON ÉVOLUTION</div>
                    
                    <h3>CHAPITRE 4 : LA NUTRITION CHEZ LES PLANTES</h3>
                    <p>Les plantes sont des êtres vivants <strong>autotrophes</strong>, ce qui signifie qu’elles sont capables de produire leur propre matière organique. Elles réalisent pour cela la <strong>photosynthèse</strong>, un processus biologique qui utilise la lumière du Soleil, le dioxyde de carbone de l’air et l’eau du sol.</p>
                    <p>Grâce à ce mécanisme, les plantes fabriquent du glucose, qui leur sert de source d’énergie et de matière pour leur croissance, tout en rejetant de l’oxygène dans l’atmosphère. Ce rôle est essentiel, car les plantes constituent la base des chaînes alimentaires et permettent la vie des autres êtres vivants.</p>

                    <h3>CHAPITRE 5 : LES ÉCHANGES NUTRITIFS CHEZ LES ANIMAUX</h3>
                    <p>Les animaux sont des êtres vivants <strong>hétérotrophes</strong>, ce qui signifie qu’ils doivent se nourrir d’autres organismes pour survivre. Les aliments qu’ils consomment sont transformés lors de la digestion en nutriments simples.</p>
                    <p>Ces nutriments sont ensuite absorbés par l’intestin grêle et passent dans le sang, qui les transporte vers les organes. Les cellules utilisent ces nutriments pour produire de l’énergie nécessaire au fonctionnement du corps. Ainsi, le système digestif et le système circulatoire travaillent ensemble pour assurer les besoins énergétiques de l’organisme.</p>

                    <h3>CHAPITRE 6 : ÉVOLUTION ET CLASSIFICATION DU VIVANT</h3>
                    <p>Les êtres vivants présentent des caractéristiques communes qui permettent de les classer en groupes selon leurs liens de parenté. Cette classification repose sur l’idée que toutes les espèces actuelles proviennent d’ancêtres communs.</p>
                    <p>L’évolution des espèces s’explique par la <strong>sélection naturelle</strong>, un mécanisme selon lequel les individus les mieux adaptés à leur environnement ont plus de chances de survivre et de se reproduire. Au fil du temps, cela peut conduire à l’apparition de nouvelles espèces.</p>

                    <h3>CHAPITRE 7 : LA BIODIVERSITÉ</h3>
                    <p>La biodiversité correspond à l’ensemble des êtres vivants présents sur Terre, ainsi que leurs interactions entre eux et avec leur environnement. Elle se manifeste à trois niveaux :</p>
                    <ul>
                        <li>La diversité des espèces.</li>
                        <li>La diversité des individus au sein d’une même espèce.</li>
                        <li>La diversité des écosystèmes.</li>
                    </ul>
                    <p>Cette biodiversité est essentielle au bon fonctionnement des milieux naturels, mais elle est aujourd’hui menacée par les activités humaines comme la déforestation, la pollution ou la destruction des habitats.</p>

                    <h3>CHAPITRE 8 : STABILITÉ ET DIVERSITÉ AU SEIN DES ESPÈCES</h3>
                    <p>Au sein d’une même espèce, les individus présentent des différences génétiques qui constituent la <strong>diversité génétique</strong>. Cette diversité est fondamentale car elle permet aux populations de mieux s’adapter aux changements de leur environnement.</p>
                    <p>Plus une espèce possède de diversité génétique, plus elle a de chances de survivre face aux maladies ou aux changements climatiques.</p>
                </div>

                <div id="svt-theme3" class="svt-ecran-cours" style="display: none; border-top: 6px solid #dc2626;">
                    <button class="btn-retour-svt" onclick="document.getElementById('svt-theme3').style.display='none'; document.getElementById('svt-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux thèmes</button>
                    <div style="background: #dc2626; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.1em; margin-bottom: 20px;">THÈME 3 : LE CORPS HUMAIN ET LA SANTÉ</div>
                    
                    <h3>CHAPITRE 9 : L’EFFORT PHYSIQUE</h3>
                    <p>Lors d’un effort physique, les muscles ont besoin de plus d’énergie pour fonctionner. Cela entraîne une augmentation de la consommation de dioxygène et de nutriments. Pour répondre à cette demande, le rythme cardiaque et la respiration s’accélèrent afin d’apporter plus rapidement ces éléments aux cellules musculaires.</p>

                    <h3>CHAPITRE 10 : LES DÉFENSES DE L’ORGANISME</h3>
                    <p>Le corps humain possède un <strong>système immunitaire</strong> qui permet de se défendre contre les agents pathogènes comme les bactéries et les virus. Lorsqu’un microbe pénètre dans l’organisme, les globules blancs interviennent pour l’identifier et le détruire.</p>

                    <h3>CHAPITRE 11 : LE SYSTÈME NERVEUX</h3>
                    <p>Le système nerveux assure la communication entre les différentes parties du corps grâce aux nerfs et au cerveau. Il permet de recevoir des informations, de les analyser et de déclencher des réponses adaptées, souvent très rapidement.</p>

                    <h3>CHAPITRE 12 : L’ALIMENTATION ET LA SANTÉ</h3>
                    <p>Une alimentation équilibrée est essentielle pour maintenir le bon fonctionnement de l’organisme. Elle doit apporter les nutriments nécessaires en quantités adaptées. Un déséquilibre alimentaire peut entraîner des carences ou des maladies.</p>

                    <h3>CHAPITRE 13 : LA REPRODUCTION HUMAINE</h3>
                    <p>La reproduction humaine permet la transmission de la vie. Elle repose sur la rencontre entre un spermatozoïde et un ovule lors de la <strong>fécondation</strong>, ce qui donne naissance à un nouvel individu.</p>
                </div>

                <div id="svt-bilan" class="svt-ecran-cours" style="display: none; border-top: 6px solid #4f46e5;">
                    <button class="btn-retour-svt" onclick="document.getElementById('svt-bilan').style.display='none'; document.getElementById('svt-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour aux thèmes</button>
                    <div style="background: #4f46e5; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; font-size: 1.2em; margin-bottom: 20px;">🎯 CONCLUSION GÉNÉRALE DU COURS</div>
                    
                    <div class="svt-notion">
                        <strong>📌 Synthèse globale :</strong> 
                        L’étude des SVT permet de comprendre que la Terre est une planète dynamique, que le vivant est organisé et évolue, et que le corps humain fonctionne grâce à des systèmes complexes et coordonnés. Elle montre également que les activités humaines ont un impact important sur l’environnement et la biodiversité, ce qui rend nécessaire une gestion responsable des ressources.
                    </div>
                </div>
            </div>
        `,
        quiz: [
            // --- CHAPITRE 1 : LES DYNAMIQUES DE LA TERRE (1 à 6) ---
            {
                question: "D'où provient la chaleur interne importante qui anime l'intérieur de la Terre ?",
                answers: [
                    "De la formation initiale du globe et de la désintégration d’éléments radioactifs",
                    "Uniquement des rayons ultraviolets envoyés en continu par le Soleil",
                    "Du réchauffement climatique causé par les gaz à effet de serre industriels",
                    "De la friction permanente entre l'eau de mer et la croûte sous-marine"
                ],
                correct: 0
            },
            {
                question: "Que sont les plaques tectoniques ?",
                answers: [
                    "De grands blocs rigides qui forment la surface de la Terre et se déplacent lentement",
                    "Des couches de magma liquide situées uniquement au centre exact du globe",
                    "Des sédiments volcaniques meubles accumulés au fond de l'intestin grêle",
                    "Des structures atmosphériques qui prévoient la pluie et les tempêtes"
                ],
                correct: 0
            },
            {
                question: "Comment se déclenche un séisme à la surface de la Terre ?",
                answers: [
                    "Les tensions accumulées par le mouvement des plaques atteignent un point de rupture dans les roches",
                    "Le niveau moyen des océans monte brusquement sous l'effet de la fonte des glaces",
                    "La biomasse forestière se raréfie sous l'action d'une exploitation intensive",
                    "Les globules blancs détruisent un agent pathogène accumulé dans la croûte"
                ],
                correct: 0
            },
            {
                question: "Quel phénomène géologique se produit lorsque le magma en profondeur remonte vers la surface ?",
                answers: [
                    "La création de volcans actifs",
                    "La formation instantanée de charbon fossile",
                    "Le déclenchement d'un courant marin polaire",
                    "L'apparition immédiate de nouvelles espèces autotrophes"
                ],
                correct: 0
            },
            {
                question: "Quand un phénomène naturel comme un séisme ou une éruption devient-il un 'risque' ?",
                answers: [
                    "Lorsqu'il touche des zones habitées",
                    "Dès qu'il se produit dans une zone totalement vide",
                    "Uniquement s'il se déroule sur une période de plusieurs décennies",
                    "Quand il se produit au fond d'un océan sans aucune île aux alentours"
                ],
                correct: 0
            },
            {
                question: "Pourquoi un même séisme peut-il être qualifié soit de sans conséquence, soit de catastrophe ?",
                answers: [
                    "Il est sans conséquence en zone vide et devient une catastrophe s'il touche une ville",
                    "Cela dépend uniquement de la quantité d'éléments radioactifs présents dans l'air",
                    "Parce que les scientifiques changent la définition selon la météo du jour",
                    "Selon que le séisme se déroule à proximité de l'équateur ou des pôles"
                ],
                correct: 0
            },

            // --- CHAPITRE 2 : MÉTÉOROLOGIE ET CLIMATOLOGIE (7 à 12) ---
            {
                question: "Quelle est la définition exacte de la météorologie ?",
                answers: [
                    "La science qui étudie l’état de l’atmosphère à court terme (sur quelques jours)",
                    "L'étude des conditions atmosphériques moyennes sur plusieurs décennies",
                    "La science qui analyse la sélection naturelle et la déforestation",
                    "L'étude exclusive des mouvements et de la rupture des plaques tectoniques"
                ],
                correct: 0
            },
            {
                question: "Quelle est la différence majeure entre la météo et la climatologie ?",
                answers: [
                    "La météo étudie le court terme (jours) alors que la climatologie étudie de longues périodes (décennies)",
                    "La météo s'intéresse uniquement aux pôles et la climatologie étudie l'équateur",
                    "La climatologie prévoit le vent pour le lendemain et la météo explique le passé",
                    "Il n'y a aucune différence, ce sont deux mots pour définir la même science"
                ],
                correct: 0
            },
            {
                question: "Pourquoi les régions proches de l’équateur ont-elles des températures plus élevées ?",
                answers: [
                    "Parce qu'elles reçoivent davantage d’énergie solaire",
                    "En raison d'une déforestation intensive propre à cette zone géographique",
                    "Parce que l'intérieur de la Terre y est dix fois plus radioactif qu'ailleurs",
                    "À cause d'un manque total d'interactions entre les écosystèmes locaux"
                ],
                correct: 0
            },
            {
                question: "Quel impact l'activité humaine a-t-elle sur l'atmosphère depuis plusieurs décennies ?",
                answers: [
                    "Elle augmente la quantité de gaz à effet de serre, retenant davantage la chaleur du Soleil",
                    "Elle refroidit globalement le climat terrestre en bloquant l'énergie solaire",
                    "Elle accélère directement la vitesse de rotation des plaques tectoniques",
                    "Elle élimine totalement les virus et les agents pathogènes de l'air"
                ],
                correct: 0
            },
            {
                question: "Quelle est une conséquence directe du réchauffement global du climat terrestre ?",
                answers: [
                    "La montée du niveau des océans, la fonte des glaces et l’intensification des phénomènes extrêmes",
                    "La transformation instantanée de toutes les plantes hétérotrophes en autotrophes",
                    "L'arrêt complet de la remontée du magma profond et des séismes",
                    "Une augmentation majeure de la diversité génétique des animaux polaires"
                ],
                correct: 0
            },
            {
                question: "Parmi ces propositions, lequel est un facteur influençant le climat d'une région ?",
                answers: [
                    "La latitude, l’altitude, la proximité de la mer ou les courants marins",
                    "Le nombre de globules blancs présents dans les organismes locaux",
                    "La vitesse de digestion des aliments à l'intérieur de l'intestin grêle",
                    "Le taux de fécondation des espèces animales marines"
                ],
                correct: 0
            },

            // --- CHAPITRE 3 : RESSOURCES NATURELLES (13 à 18) ---
            {
                question: "Qu'englobe la définition des ressources naturelles ?",
                answers: [
                    "Tous les éléments prélevés dans l'environnement pour satisfaire les besoins humains",
                    "Uniquement le pétrole et le charbon fossile fabriqués en usine",
                    "La matière organique produite exclusivement par les cellules musculaires",
                    "Les réponses nerveuses déclenchées très rapidement par le cerveau"
                ],
                correct: 0
            },
            {
                question: "Qu'est-ce qu'une ressource naturelle renouvelable ?",
                answers: [
                    "Une ressource qui peut se régénérer naturellement, comme l’eau ou la biomasse",
                    "Une source d'énergie fossile qui met des millions d'années à se constituer",
                    "Un minerai rare qui s'épuise définitivement dès sa première utilisation",
                    "Un élément créé artificiellement par l'être humain en laboratoire"
                ],
                correct: 0
            },
            {
                question: "Pourquoi le pétrole et le charbon sont-ils qualifiés de ressources non renouvelables ?",
                answers: [
                    "Parce qu'ils se forment sur des millions d'années et peuvent donc s'épuiser",
                    "Parce qu'ils se régénèrent en quelques jours grâce à l'énergie solaire",
                    "Parce qu'ils ne polluent jamais l'environnement lors de leur prélèvement",
                    "Parce que les animaux les produisent en continu au cours de leur nutrition"
                ],
                correct: 0
            },
            {
                question: "Quels problèmes majeurs sont engendrés par l’exploitation intensive des ressources ?",
                answers: [
                    "La pollution, la destruction des écosystèmes et la raréfaction de certaines ressources",
                    "L'accélération bénéfique du rythme cardiaque et de la respiration des plantes",
                    "La stabilisation définitive de la température globale de toutes les décennies",
                    "La disparition totale des risques liés aux séismes et aux volcans"
                ],
                correct: 0
            },
            {
                question: "Quel est l'objectif du concept de développement durable ?",
                answers: [
                    "Concilier les besoins économiques, la protection de l’environnement et les besoins des générations futures",
                    "Augmenter le rythme d'extraction des énergies fossiles pour enrichir les pays",
                    "Interdire définitivement toute forme de consommation de nourriture chez les animaux",
                    "Favoriser la déforestation massive pour accélérer la sélection naturelle"
                ],
                correct: 0
            },
            {
                question: "L'eau et la biomasse appartiennent à quelle catégorie de ressources ?",
                answers: [
                    "Les ressources renouvelables",
                    "Les ressources non renouvelables",
                    "Les ressources d'origine minérale épuisables à court terme",
                    "Les éléments radioactifs internes de la Terre"
                ],
                correct: 0
            },

            // --- CHAPITRE 4 : LA NUTRITION CHEZ LES PLANTES (19 à 24) ---
            {
                question: "Que signifie le terme 'autotrophe' pour une plante ?",
                answers: [
                    "Elle est capable de produire sa propre matière organique",
                    "Elle doit obligatoirement se nourrir d’autres organismes vivants pour survivre",
                    "Elle se déplace de manière autonome pour chercher de l'eau dans le sol",
                    "Elle ne possède pas de cellules et ne réalise aucun échange gazeux"
                ],
                correct: 0
            },
            {
                question: "Quels éléments sont indispensables à la plante pour réaliser la photosynthèse ?",
                answers: [
                    "La lumière du Soleil, le dioxyde de carbone de l’air et l’eau du sol",
                    "Des nutriments simples apportés exclusivement par le sang d'un animal",
                    "Du pétrole fossile, de la biomasse et de l'oxygène pur du sol",
                    "Des globules blancs et des nerfs connectés aux racines profondes"
                ],
                correct: 0
            },
            {
                question: "Quelle molécule organique d'énergie les plantes fabriquent-elles lors de la photosynthèse ?",
                answers: [
                    "Le glucose",
                    "Le carbone radioactif",
                    "Le sang circulant",
                    "Le suc digestif"
                ],
                correct: 0
            },
            {
                question: "Quel gaz essentiel à la vie les plantes rejettent-elles dans l’atmosphère ?",
                answers: [
                    "L’oxygène (dioxygène)",
                    "Le dioxyde de carbone",
                    "L'azote radioactif",
                    "Le monoxyde de carbone"
                ],
                correct: 0
            },
            {
                question: "À quoi sert principalement le glucose fabriqué par les végétaux ?",
                answers: [
                    "De source d’énergie et de matière pour leur croissance",
                    "À provoquer des tensions et des ruptures dans les roches de surface",
                    "À détruire les bactéries pathogènes présentes dans l'atmosphère",
                    "À réguler les courants marins et les climats de l'équateur"
                ],
                correct: 0
            },
            {
                question: "Pourquoi le rôle des plantes est-il qualifié d'essentiel pour les autres êtres vivants ?",
                answers: [
                    "Car elles constituent la base des chaînes alimentaires et permettent la vie",
                    "Parce qu'elles empêchent les plaques tectoniques de bouger",
                    "Car elles produisent la radioactivité interne de la planète",
                    "Parce qu'elles transforment les animaux hétérotrophes en minerais"
                ],
                correct: 0
            },

            // --- CHAPITRE 5 : LES ÉCHANGES NUTRITIFS CHEZ LES ANIMAUX (25 à 29) ---
            {
                question: "Que signifie le terme 'hétérotrophe' pour un animal ?",
                answers: [
                    "Il doit se nourrir d’autres organismes pour survivre",
                    "Il fabrique sa propre matière organique uniquement avec de la lumière",
                    "Il rejette du dioxyde de carbone par ses racines superficielles",
                    "Il produit du glucose sans consommer aucun aliment extérieur"
                ],
                correct: 0
            },
            {
                question: "En quoi les aliments consommés par les animaux sont-ils transformés lors de la digestion ?",
                answers: [
                    "En nutriments simples",
                    "En éléments radioactifs lourds",
                    "En gaz à effet de serre",
                    "En plaques rigides et épaisses"
                ],
                correct: 0
            },
            {
                question: "Quel organe est chargé d'absorber les nutriments pour les faire passer dans le sang ?",
                answers: [
                    "L’intestin grêle",
                    "Le cerveau supérieur",
                    "L'appareil respiratoire",
                    "Le système immunitaire"
                ],
                correct: 0
            },
            {
                question: "Comment les nutriments absorbés sont-ils transportés vers les différents organes de l'animal ?",
                answers: [
                    "Par le sang (le système circulatoire)",
                    "Par les nerfs du système nerveux",
                    "Par l'air expiré lors de la respiration",
                    "Par la sève descendante autotrophe"
                ],
                correct: 0
            },
            {
                question: "Quels systèmes travaillent ensemble pour assurer les besoins énergétiques de l'organisme animal ?",
                answers: [
                    "Le système digestif et le système circulatoire",
                    "La photosynthèse et la tectonique des plaques",
                    "Le système climatique et la sélection naturelle",
                    "L'intestin grêle et la reproduction par fécondation"
                ],
                correct: 0
            },

            // --- CHAPITRE 6 : ÉVOLUTION ET CLASSIFICATION (30 à 33) ---
            {
                question: "Sur quelle idée scientifique repose la classification des êtres vivants en groupes ?",
                answers: [
                    "Sur l’idée que toutes les espèces actuelles proviennent d’ancêtres communs",
                    "Sur la quantité de ressources non renouvelables consommées par espèce",
                    "Sur la capacité des individus à modifier le climat à court terme",
                    "Sur la ressemblance unique de leur rythme cardiaque lors d'un effort"
                ],
                correct: 0
            },
            {
                question: "Quel mécanisme explique l’évolution et l'adaptation des espèces au cours du temps ?",
                answers: [
                    "La sélection naturelle",
                    "Le développement durable",
                    "L'effet de serre anthropique",
                    "L'absorption intestinale"
                ],
                correct: 0
            },
            {
                question: "Qu'est-ce que la sélection naturelle ?",
                answers: [
                    "Les individus les mieux adaptés à leur environnement ont plus de chances de survivre et de se reproduire",
                    "L'élimination automatique de toutes les plantes autotrophes par les animaux",
                    "Le choix artificiel effectué par l'être humain pour créer de nouveaux minerais",
                    "La destruction systématique des écosystèmes fragiles par des phénomènes météo"
                ],
                correct: 0
            },
            {
                question: "À quoi peut conduire le mécanisme de la sélection naturelle au fil de longues périodes ?",
                answers: [
                    "À l’apparition de nouvelles espèces",
                    "À l'arrêt définitif de l'évolution biologique",
                    "À la transformation des virus en nutriments simples",
                    "Au refroidissement du noyau radioactif de la Terre"
                ],
                correct: 0
            },

            // --- CHAPITRE 7 ET 8 : BIODIVERSITÉ ET GÉNÉTIQUE (34 à 39) ---
            {
                question: "Quels sont les trois niveaux d'expression de la biodiversité sur Terre ?",
                answers: [
                    "La diversité des espèces, la diversité des individus au sein d'une espèce, et la diversité des écosystèmes",
                    "La diversité des climats, la diversité des météos, et la diversité des températures",
                    "La diversité des plaques tectoniques, des volcans actifs, et des séismes urbains",
                    "La diversité des nutriments, des globules blancs, et des connexions nerveuses"
                ],
                correct: 0
            },
            {
                question: "Quelles activités humaines menacent directement la biodiversité aujourd'hui ?",
                answers: [
                    "La déforestation, la pollution ou la destruction des habitats",
                    "La pratique régulière d'un effort physique adapté",
                    "L'étude de la climatologie sur plusieurs décennies",
                    "La classification des groupes d'êtres vivants"
                ],
                correct: 0
            },
            {
                question: "Qu'est-ce que la diversité génétique au sein d'une même espèce ?",
                answers: [
                    "Les différences génétiques présentes entre les individus d’une même population",
                    "La capacité d'un être vivant à digérer le glucose et le pétrole en même temps",
                    "Le nombre total d'espèces différentes vivant dans un même écosystème forestier",
                    "La transformation des caractères physiques sous l'action directe d'un séisme"
                ],
                correct: 0
            },
            {
                question: "Pourquoi la diversité génétique est-elle jugée fondamentale pour une population ?",
                answers: [
                    "Car elle permet aux populations de mieux s’adapter aux changements de leur environnement",
                    "Parce qu'elle force tous les membres d'une espèce à rester rigoureusement identiques",
                    "Car elle empêche l'apparition de nouvelles maladies transmissibles",
                    "Parce qu'elle réduit le besoin en dioxygène lors d'un effort musculaire"
                ],
                correct: 0
            },
            {
                question: "Face à quoi une espèce a-t-elle plus de chances de survivre si elle possède une grande diversité génétique ?",
                answers: [
                    "Face aux maladies ou aux changements climatiques",
                    "Face à l'épuisement total de l'énergie solaire équatoriale",
                    "Face aux ruptures mécaniques des plaques rocheuses de surface",
                    "Face à l'absence complète de système nerveux central"
                ],
                correct: 0
            },
            {
                question: "Qu'est-ce qu'un écosystème dans le cadre de la biodiversité ?",
                answers: [
                    "Un milieu de vie incluant l'ensemble des êtres vivants et leurs interactions avec l'environnement",
                    "Une usine de transformation des ressources non renouvelables en énergie propre",
                    "Une catégorie d'animaux capables de réaliser la photosynthèse",
                    "Le réseau de nerfs reliant le cerveau aux muscles de l'effort"
                ],
                correct: 0
            },

            // --- CHAPITRE 9 À 13 : LE CORPS HUMAIN ET LA SANTÉ (40 à 50) ---
            {
                question: "De quoi les muscles ont-ils besoin en plus grande quantité lors d’un effort physique ?",
                answers: [
                    "De dioxygène et de nutriments",
                    "De dioxyde de carbone et de sève",
                    "De globules blancs et d'anticorps",
                    "De magma et d'éléments radioactifs"
                ],
                correct: 0
            },
            {
                question: "Comment le corps répond-il immédiatement pour apporter plus d'éléments aux cellules musculaires ?",
                answers: [
                    "Le rythme cardiaque et la respiration s’accélèrent",
                    "La digestion s'arrête et l'intestin grêle rétrécit",
                    "Le système immunitaire détruit des bactéries pathogènes",
                    "Le cerveau stoppe la transmission des messages par les nerfs"
                ],
                correct: 0
            },
            {
                question: "Quel est le rôle principal du système immunitaire ?",
                answers: [
                    "Se défendre contre les agents pathogènes comme les bactéries et les virus",
                    "Transporter le glucose issu de la photosynthèse vers les cellules musculaires",
                    "Mesurer les variations de température atmosphérique à long terme",
                    "Déclencher la fécondation lors de la rencontre des gamètes"
                ],
                correct: 0
            },
            {
                question: "Quelles cellules du système immunitaire interviennent pour identifier et détruire les microbes ?",
                answers: [
                    "Les globules blancs",
                    "Les cellules musculaires",
                    "Les nutriments digestifs",
                    "Les neurones cervicaux"
                ],
                correct: 0
            },
            {
                question: "Comment le système nerveux assure-t-il la communication entre les différentes parties du corps ?",
                answers: [
                    "Grâce aux nerfs et au cerveau",
                    "Par le passage des nutriments dans l'intestin grêle",
                    "Par l'accélération continue de la respiration et du cœur",
                    "Via la libération d'oxygène dans l'appareil circulatoire"
                ],
                correct: 0
            },
            {
                question: "Quelle est la fonction globale du système nerveux face aux informations reçues ?",
                answers: [
                    "Il permet de recevoir des informations, de les analyser et de déclencher des réponses adaptées",
                    "Il produit la matière organique nécessaire à l'effort physique intense",
                    "Il stocke les ressources renouvelables pour les générations futures",
                    "Il combat directement les infections bactériennes par sélection naturelle"
                ],
                correct: 0
            },
            {
                question: "Pourquoi une alimentation équilibrée est-elle essentielle pour la santé ?",
                answers: [
                    "Elle apporte les nutriments nécessaires en quantités adaptées à l'organisme",
                    "Elle permet de doubler instantanément la diversité génétique des cellules",
                    "Elle empêche le réchauffement global et la fonte des glaces polaires",
                    "Elle remplace l'action du cerveau dans la transmission des réponses nerveuses"
                ],
                correct: 0
            },
            {
                question: "Quelle peut être la conséquence directe d'un déséquilibre alimentaire prolongé ?",
                answers: [
                    "Des carences ou des maladies",
                    "Une immunité totale contre tous les virus de la planète",
                    "L'arrêt du mouvement lent des plaques tectoniques",
                    "Une transformation des besoins hétérotrophes du corps"
                ],
                correct: 0
            },
            {
                question: "Sur quel événement biologique repose la reproduction humaine pour transmettre la vie ?",
                answers: [
                    "La rencontre entre un spermatozoïde et un ovule lors de la fécondation",
                    "L'absorption des nutriments au niveau des parois de l'intestin grêle",
                    "La communication à court terme entre le cerveau et les muscles de soutien",
                    "La sélection naturelle des individus les mieux adaptés à l'effort"
                ],
                correct: 0
            },
            {
                question: "Quel est le résultat direct du processus de fécondation chez l'être humain ?",
                answers: [
                    "La naissance d'un nouvel individu",
                    "La production d'anticorps par les globules blancs",
                    "L'accélération définitive du rythme de la respiration",
                    "La création d'une barrière contre les gaz à effet de serre"
                ],
                correct: 0
            },
            {
                question: "Quelle grande conclusion tire-t-on de la gestion humaine de l'environnement en SVT ?",
                answers: [
                    "Les activités humaines ayant un impact important, une gestion responsable des ressources est nécessaire",
                    "L'être humain ne possède aucune influence sur la stabilité des écosystèmes",
                    "Les ressources non renouvelables se reforment assez vite pour ne jamais s'épuiser",
                    "Seul le système nerveux contrôle la biodiversité et l'évolution globale"
                ],
                correct: 0
            }
        ]
    }
    physique: {
        title: "🧪 Physique-Chimie",
        fiches: `
            <div class="fiche-card">
                <h3>⚛️ 1. Organisation de la matière, Molécules & Descriptif du pH</h3>
                <p><strong>• Structure de l'atome :</strong> Un atome est constitué d'un noyau central (composé de <strong>protons</strong> chargés positivement et de <strong>neutrons</strong> électriquement neutres) autour duquel gravite un nuage d'<strong>électrons</strong> chargés négativement. Un atome est globalement neutre car il possède exactement autant de protons que d'électrons.</p>
                
                <p><strong>• Les Ions :</strong> Si un atome perd ou gagne un ou plusieurs électrons, l'équilibre des charges est rompu et il devient un ion :
                    <br>- Un atome qui <strong>perd</strong> des électrons (-) se retrouve avec un excès de protons (+) : il devient un ion positif ou <strong>cation</strong> (ex: l'ion cuivre Cu2+).
                    <br>- Un atome qui <strong>gagne</strong> des électrons (-) se retrouve en excès d'électrons : il devient un ion négatif ou <strong>anion</strong> (ex: l'ion chlorure Cl-).
                </p>

                <p><strong>• Le pH (Potentiel Hydrogène) :</strong> Mesure l'acidité ou la basicité d'une solution aqueuse. Il se mesure avec du papier pH ou un pH-mètre et s'étend sur une échelle de <strong>0 à 14</strong> :
                    <br>- <em>pH inférieur à 7 :</em> Solution <strong>acide</strong>. Elle contient une majorité d'ions hydrogène H+.
                    <br>- <em>pH égal à 7 :</em> Solution <strong>neutre</strong> (ex: l'eau pure).
                    <br>- <em>pH supérieur à 7 :</em> Solution <strong>basique</strong>. Elle contient une majorité d'ions hydroxyde HO-.
                    <br>⚠️ <em>Sécurité :</em> Diluer un acide consiste à y ajouter de l'eau. Son pH va augmenter pour se rapprocher de 7 (la solution devient moins dangereuse). Toujours verser l'acide dans l'eau, jamais l'inverse !
                </p>
            </div>

            <div class="fiche-card">
                <h3>🌌 2. Mécanique, Gravitation, Masse & Poids</h3>
                <p><strong>• La gravitation universelle :</strong> Interaction attractive à distance qui s'exerce entre deux objets ayant une masse (théorisée par Isaac Newton). Plus les objets ont une masse élevée, plus ils s'attirent. Plus ils sont éloignés, moins ils s'attirent.</p>
                
                <p><strong>• Masse vs Poids : Ne confonds jamais les deux au Brevet !</strong></p>
                <table>
                    <tr>
                        <th>Caractéristique</th>
                        <th>La Masse</th>
                        <th>Le Poids</th>
                    </tr>
                    <tr>
                        <td><strong>Définition</strong></td>
                        <td>Quantité de matière contenue dans un objet.</td>
                        <td>Force d'attraction gravitationnelle exercée par une planète sur cet objet.</td>
                    </tr>
                    <tr>
                        <td><strong>Unité officielle</strong></td>
                        <td>Le Kilogramme (kg)</td>
                        <td>Le Newton (N)</td>
                    </tr>
                    <tr>
                        <td><strong>Appareil de mesure</strong></td>
                        <td>Une balance</td>
                        <td>Un dynamomètre</td>
                    </tr>
                    <tr>
                        <td><strong>Variation</strong></td>
                        <td>Invariable (ne change jamais, que l'on soit sur Terre, sur la Lune ou dans le vide).</td>
                        <td>Variable (change selon la planète ou l'altitude car l'intensité de la pesanteur change).</td>
                    </tr>
                </table>
                <p><strong>La Formule fondamentale :</strong> P = m x g (avec P en Newtons, m en kilogrammes et g qui représente l'intensité de la pesanteur. Sur Terre, g est environ égal à 9,81 N/kg ou 10 N/kg).</p>
            </div>

            <div class="fiche-card">
                <h3>⚡ 3. Énergie : Cinétique, Potentielle et Conservation</h3>
                <p>L'énergie ne peut être ni créée ni détruite, elle se transforme d'une forme à une autre. L'énergie mécanique totale d'un objet est la somme de ses énergies cinétique et potentielle (Em = Ec + Ep).</p>
                <ul>
                    <li><strong>L'Énergie Potentielle de position (Ep) :</strong> L'énergie stockée par un objet en raison de sa hauteur par rapport au sol. Plus l'objet est haut et lourd, plus son Ep est grande.</li>
                    <li><strong>L'Énergie Cinétique (Ec) :</strong> L'énergie possédée par un objet en mouvement.
                        <br><strong>Formule :</strong> Ec = 0,5 x m x v² (avec Ec en Joules, m en kilogrammes et v en mètres par seconde).
                        <br>⚠️ <em>Conséquence sécurité routière :</em> Comme la vitesse est au carré (v²), si tu doubles ta vitesse (x2), ton énergie cinétique et ta distance de freinage sont multipliées par <strong>quatre (x4)</strong> ! Si tu triples ta vitesse (x3), elles sont multipliées par **neuf (x9)** !
                    </li>
                    <li><strong>La conservation de l'énergie :</strong> Lors de la chute d'un objet (sans frottements), son altitude diminue donc son Ep diminue, mais sa vitesse augmente donc son Ec augmente : l'énergie potentielle se convertit intégralement en énergie cinétique. L'énergie mécanique globale reste constante.</li>
                </ul>
            </div>
        `,
        quiz: [
            { q: "Quelle est la charge globale d'un atome entier ?", options: ["Positive", "Négative", "Neutre (nulle)"], answer: 2 },
            { q: "Qu'est-il arrivé à un atome de Cuivre pour qu'il devienne l'ion Cu2+ ?", options: ["Il a gagné 2 protons", "Il a perdu 2 électrons", "Il a gagné 2 électrons"], answer: 1 },
            { q: "Une solution aqueuse présente un pH égal à 2. Que peut-on affirmer ?", options: ["Elle est basique et riche en ions HO-", "Elle est acide et riche en ions H+", "Elle est neutre"], answer: 1 },
            { q: "Quelle grandeur mesurée en Kilogrammes ne change jamais, quel que soit le lieu de l'univers ?", options: ["Le poids", "L'intensité de la pesanteur g", "La masse"], answer: 2 },
            { q: "Calcule le poids sur Terre d'un sac de ciment d'une masse de 40 kg (on prend g = 10 N/kg).", options: ["4 Newtons", "400 Newtons", "0,25 Newtons"], answer: 1 },
            { q: "Si un automobiliste triple sa vitesse (x3) sur l'autoroute, par combien est multipliée son énergie cinétique ?", options: ["3", "6", "9"], answer: 2 }
        ]
    },
    brevet_100_notions: {
        title: "🎓 Le Top 100 Notions Clés",
        fiches: `
            <style>
                .brevet-app-container { color: #1e293b !important; font-family: system-ui, -apple-system, sans-serif; padding: 5px; }
                .brevet-app-container h3 { color: #0f172a !important; margin-top: 25px; margin-bottom: 12px; font-size: 1.35em; border-bottom: 2px solid #cbd5e1; padding-bottom: 6px; }
                .brevet-app-container p, .brevet-app-container li { color: #334155 !important; line-height: 1.6; font-size: 1rem; }
                .brevet-app-container strong { color: #0f172a !important; }
                
                /* Navigation */
                .btn-chapitre-brevet { width: 100%; padding: 16px; color: white !important; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.05rem; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 4px; transition: transform 0.1s; display: block; }
                .btn-chapitre-brevet:active { transform: scale(0.99); }
                
                .btn-retour-brevet { display: inline-flex; align-items: center; margin-bottom: 20px; padding: 12px 20px; background: #475569; color: white !important; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .btn-retour-brevet:active { transform: scale(0.97); }
                
                .brevet-ecran-cours { background: #ffffff !important; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                .brevet-app-container ul, .brevet-app-container ol { padding-left: 20px; margin-bottom: 15px; }
                .brevet-app-container li { margin-bottom: 8px; }
                
                .badge-notion { display: inline-block; background: #e2e8f0; color: #475569 !important; font-size: 0.85em; font-weight: bold; padding: 2px 8px; border-radius: 4px; margin-right: 6px; }
                .brevet-conseil { background: #f0fdfa; color: #0d9488 !important; padding: 15px; border-radius: 6px; border: 1px solid #99f6e4; margin: 15px 0; }
                .brevet-important { background: #fff7ed; color: #ea580c !important; padding: 15px; border-radius: 6px; border: 1px solid #ffedd5; margin: 15px 0; }
            </style>

            <div class="brevet-app-container">
                
                <div id="brevet-menu-principal" style="display: block;">
                    <div class="brevet-important" style="margin-top:0; text-align:center;">
                        <strong>🎯 OBJECTIF MENTION :</strong> Cette section regroupe l'intégralité des notions indispensables issues de vos référentiels de révision (Français, Mathématiques, Histoire, Géographie, EMC, SVT et Physique-Chimie) ainsi que les clés méthodologiques de la réussite.
                    </div>
                    <p style="text-align: center; font-weight: bold; margin-bottom: 22px; color: #475569;">Choisissez une catégorie d'essentiels à réviser :</p>
                    
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button class="btn-chapitre-brevet" style="background: #db2777;" onclick="document.getElementById('brevet-menu-principal').style.display='none'; document.getElementById('b-fran').style.display='block'; window.scrollTo(0,0);">✍️ FRANÇAIS — NOTIONS 1 À 25</button>
                        <button class="btn-chapitre-brevet" style="background: #2563eb;" onclick="document.getElementById('brevet-menu-principal').style.display='none'; document.getElementById('b-math').style.display='block'; window.scrollTo(0,0);">➗ MATHÉMATIQUES — NOTIONS 26 À 50</button>
                        <button class="btn-chapitre-brevet" style="background: #059669;" onclick="document.getElementById('brevet-menu-principal').style.display='none'; document.getElementById('b-histgeo').style.display='block'; window.scrollTo(0,0);">🌍 HISTOIRE & GÉOGRAPHIE — NOTIONS 51 À 90</button>
                        <button class="btn-chapitre-brevet" style="background: #ea580c;" onclick="document.getElementById('brevet-menu-principal').style.display='none'; document.getElementById('b-emc').style.display='block'; window.scrollTo(0,0);">🏛️ EMC (ENSEIGNEMENT MORAL & CIVIQUE) — NOTIONS 91 À 105</button>
                        <button class="btn-chapitre-brevet" style="background: #0d9488;" onclick="document.getElementById('brevet-menu-principal').style.display='none'; document.getElementById('b-sciences').style.display='block'; window.scrollTo(0,0);">🔬 SCIENCES (SVT & PHYSIQUE-CHIMIE) — NOTIONS 106 À 145</button>
                        <button class="btn-chapitre-brevet" style="background: #4f46e5;" onclick="document.getElementById('brevet-menu-principal').style.display='none'; document.getElementById('b-methode').style.display='block'; window.scrollTo(0,0);">🧠 LES CLÉS DE LA RÉUSSITE AU BREVET</button>
                    </div>
                </div>

                <div id="b-fran" class="brevet-ecran-cours" style="display: none; border-top: 6px solid #db2777;">
                    <button class="btn-retour-brevet" onclick="document.getElementById('b-fran').style.display='none'; document.getElementById('brevet-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour</button>
                    <div style="background: #db2777; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; margin-bottom: 20px;">✍️ FRANÇAIS : LES ESSENTIELS DE GRAMMAIRE ET LITTÉRATURE</div>
                    
                    <h3>Typologie, Schémas et Registres Littéraires</h3>
                    <ul>
                        <li><span class="badge-notion">1</span><strong>Types de textes :</strong> Identifier si un texte est narratif (raconte une histoire), descriptif (peint un lieu, un personnage), argumentatif (vise à convaincre), poétique (joue sur les sonorités et évocations), théâtral (conçu pour la scène), autobiographique (l'auteur raconte sa propre vie) ou satirique (tourne en dérision).</li>
                        <li><span class="badge-notion">2</span><strong>Récit, description et argumentation :</strong> Le récit fait avancer l'action ; la description suspend le temps pour donner des détails ; l'argumentation s'articule autour d'un raisonnement logique.</li>
                        <li><span class="badge-notion">3</span><strong>Le schéma narratif :</strong> Structure immuable du récit : Situation initiale $\rightarrow$ Élément perturbateur $\rightarrow$ Péripéties $\rightarrow$ Dénouement $\rightarrow$ Situation finale.</li>
                        <li><span class="badge-notion">4</span><strong>Temps du récit :</strong> L'imparfait sert pour le second plan, les descriptions et les actions habituelles ; le passé simple pour les actions de premier plan, soudaines et délimitées ; le présent de narration rend le récit plus vivant.</li>
                        <li><span class="badge-notion">5</span><strong>Registres littéraires :</strong> Le comique fait rire ; le tragique montre l'impuissance face au destin ; le pathétique suscite la pitié ; l'épique amplifie les exploits ; l'ironique dit le contraire de ce qu'on veut faire penser.</li>
                    </ul>

                    <h3>Argumentation, Figures de Style et Syntaxe</h3>
                    <ul>
                        <li><span class="badge-notion">6</span><strong>Thèse :</strong> C'est l'opinion, l'idée principale défendue par l'auteur dans un texte argumentatif.</li>
                        <li><span class="badge-notion">7</span><strong>Arguments et exemples :</strong> Les arguments sont les propositions abstraites prouvant la thèse ; les exemples sont des faits concrets illustrant les arguments.</li>
                        <li><span class="badge-notion">8</span><strong>Figures de style :</strong> La métaphore (comparaison sans outil comparatif), la comparaison (avec outil : comme, tel que), l'hyperbole (exagération), l'antithèse (rapprochement de deux termes opposés).</li>
                        <li><span class="badge-notion">9</span><strong>Anaphore :</strong> Répétition d'un mot ou d'un groupe de mots en début de phrase ou de vers, créant un effet d'insistance ou de rythme.</li>
                        <li><span class="badge-notion">10</span><strong>Valeur des temps :</strong> Le présent peut avoir une valeur d'énonciation, de vérité générale ou de futur proche.</li>
                    </ul>

                    <h3>Grammaire, Orthographe et Genres</h3>
                    <ul>
                        <li><span class="badge-notion">11</span><strong>Classes grammaticales :</strong> Nature fixe du mot (nom, verbe, adjectif, déterminant, pronom, adverbe, préposition).</li>
                        <li><span class="badge-notion">12</span><strong>Fonctions grammaticales :</strong> Rôle du mot dans la phrase (sujet, COD, COI, complément circonstanciel de temps/lieu/cause).</li>
                        <li><span class="badge-notion">13</span><strong>Phrase simple et complexe :</strong> La phrase simple contient un seul verbe conjugué (une proposition) ; la phrase complexe en contient plusieurs.</li>
                        <li><span class="badge-notion">14</span><strong>Propositions subordonnées :</strong> Dépendant d'une proposition principale, elles peuvent être relatives (introduites par un pronom relatif) ou conjonctives (introduites par une conjonction de subordination).</li>
                        <li><span class="badge-notion">15</span><strong>Discours direct et indirect :</strong> Le passage au discours indirect implique la suppression des guillemets, la modification des pronoms, des indicateurs de temps et la concordance des temps verbaux.</li>
                        <li><span class="badge-notion">16</span><strong>Connecteurs logiques :</strong> Mots structurant la pensée (cause : car ; conséquence : donc ; opposition : cependant).</li>
                        <li><span class="badge-notion">17</span><strong>Analyse guidée :</strong> Méthode consistant à s'appuyer sur les indices textuels (procédés d'écriture) pour en dégager le sens profond.</li>
                        <li><span class="badge-notion">18-19</span><strong>Rédaction structurée :</strong> Construire un paragraphe argumenté avec des paragraphes distincts, une introduction et une conclusion claires.</li>
                        <li><span class="badge-notion">20-21</span><strong>Accords orthographiques :</strong> Maîtriser l'accord impératif du verbe avec son sujet et les accords en genre et en nombre au sein du groupe nominal.</li>
                        <li><span class="badge-notion">22</span><strong>Homophones :</strong> Distinguer a (verbe) / à (préposition), et (conjonction) / est (verbe), son (déterminant) / sont (verbe).</li>
                        <li><span class="badge-notion">23</span><strong>Points de vue (focalisation) :</strong> Interne (à travers les yeux du personnage), externe (observateur neutre extérieur), omniscient (le narrateur sait tout de tout le monde).</li>
                        <li><span class="badge-notion">24</span><strong>Poésie :</strong> Reconnaître la versification, les strophes (quatrain, tercet) et l'agencement des rimes (croisées ABAB, suivies AABB, embrassées ABBA).</li>
                        <li><span class="badge-notion">25</span><strong>Théâtre :</strong> Repérer les répliques, les tirades, les monologues et les didascalies (indications de mise en scène en italique).</li>
                    </ul>
                </div>

                <div id="b-math" class="brevet-ecran-cours" style="display: none; border-top: 6px solid #2563eb;">
                    <button class="btn-retour-brevet" onclick="document.getElementById('b-math').style.display='none'; document.getElementById('brevet-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour</button>
                    <div style="background: #2563eb; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; margin-bottom: 20px;">➗ MATHÉMATIQUES : LES THÉORÈMES ET OUTILS INCONTOURNABLES</div>
                    
                    <h3>Géométrie et Trigonométrie</h3>
                    <ul>
                        <li><s2pan class="badge-notion">26</span><strong>Théorème de Pythagore :</strong> Dans un triangle rectangle, le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés ($AC^2 = AB^2 + BC^2$). Sert à calculer une longueur.</li>
                        <li><span class="badge-notion">27</span><strong>Réciproque de Pythagore :</strong> Si l'égalité précédente est vraie, alors le triangle est rectangle. Sert à prouver la perpendicularité.</li>
                        <li><span class="badge-notion">28-29</span><strong>Théorème et Réciproque de Thalès :</strong> Permet de calculer des longueurs dans des configurations de droites parallèles coupées par deux sécantes, ou de prouver que deux droites sont parallèles.</li>
                        <li><span class="badge-notion">30</span><strong>Trigonométrie :</strong> Formules applicables exclusivement dans le triangle rectangle : CAH-SOH-TOA.
                            <br>$\cos(\text{angle}) = \frac{\text{adjacent}}{\text{hypoténuse}}$ | $\sin(\text{angle}) = \frac{\text{opposé}}{\text{hypoténuse}}$ | $\tan(\text{angle}) = \frac{\text{opposé}}{\text{adjacent}}$
                        </li>
                    </ul>

                    <h3>Calcul Littéral, Équations et Arithmétique</h3>
                    <ul>
                        <li><span class="badge-notion">31-32</span><strong>Résolution d'équations :</strong> Isoler l'inconnue $x$. Pour une équation produit nul ($A \times B = 0$), on pose $A = 0$2 ou $B = 0$.</li>
                        <li><span class="badge-notion">33-34</span><strong>Développer et Factoriser :</strong> Développer transforme un produit en somme (via la distributivité). Factoriser fait l'inverse : transforme une somme en produit.</li>
                        <li><span class="badge-notion">35</span><strong>Identités remarquables :</strong> 
                            <br>• $(a+b)^2 = a^2 + 2ab + b^2$
                            <br>• $(a-b)^2 = a^2 - 2ab + b^2$
                            <br>• $(a+b)(a-b) = a^2 - b^2$
                        </li>
                        <li><span class="badge-notion">36-37</span><strong>Fractions et Puissances :</strong> Maîtriser la mise au même dénominateur, la multiplication/division des fractions et les règles des exposants ($10^a \times 10^b = 10^{a+b}$).</li>
                        <li><span class="badge-notion">38-39</span><strong>Proportionnalité et Pourcentages :</strong> Utiliser le produit en croix. Pour appliquer une hausse de $t\%$, multiplier par $(1 + \frac{t}{100})$ ; pour une baisse, multiplier par $(1 - \frac{t}{100})$.</li>
                    </ul>

                    <h3>Fonctions, Statistiques et Espace</h3>
                    <ul>2
                        <li><span class="badge-notion">40-41-42</span><strong>Fonctions :</strong> Processus associant un antécédent $x$ à un unique image $f(x)$. Une fonction affine a pour expression $f(x) = ax + b$ (représentée graphiquement par une droite).</li>
                        <li><span class="badge-notion">43</span><strong>Statistiques :</strong> La <strong>moyenne</strong> est la somme des données divisée par l'effectif total ; la <strong>médiane</strong> partage la série ordonnée en deux groupes d'égal effectif ; l'<strong>étendue</strong> est l'écart entre la plus grande et la plus petite valeur.</li>
                        <li><span class="badge-notion">44-45</span><strong>Probabilités :</strong> Rapport $\frac{\text{nombre d'issues favorables}}{\text{nombre d'issues totales}}$. On s'aide souvent d'un arbre de probabilités simple.</li>
                        <li><span class="badge-notion">46-47-48</span><strong>Géométrie dans l'espace & Volumes :</strong> Visualiser les pavés, cylindres, cônes et pyramides. Connaître les formules de volumes de base (Ex: $\text{Volume Pavé} = L \times l \times h$).</li>
                        <li><span class="badge-notion">49-50</span><strong>Conversions et Problèmes :</strong> Convertir les unités simples, d'aires et de volumes (ex: $1\text{ L} = 1\text{ dm}^3$). Savoir décortiquer un problème complexe en plusieurs étapes de calculs distinctes.</li>
                    </ul>
                </div>

                <div id="b-histgeo" class="brevet-ecran-cours" style="display: none; border-top: 6px solid #059669;">
                    <button class="btn-retour-brevet" onclick="document.getElementById('b-histgeo').style.display='none'; document.getElementById('brevet-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour</button>
                    <div style="background: #059669; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; margin-bottom: 20px;">🌍 HISTOIRE & GÉOGRAPHIE : LES REPERES CHRONOLOGIQUES ET SPATIAUX</div>
                    
                    <h3>Histoire : Les Grands Conflits et Évolutions du XXe siècle</h3>
                    <ul>
                        <li><span class="badge-notion">51-52-53</span><strong>Première Guerre mondiale (1914-1918) :</strong> Une guerre totale mobilisant l'ensemble de la société (civils à l'arrière, militaires au front). C'est le théâtre du génocide des Arméniens (1915).</li>
                        <li><span class="badge-notion">54-55-56</span><strong>Entre-deux-guerres :</strong> Les révolutions russes de 1917 mènent au pouvoir bolchevique. Émergence de régimes totalitaires (Staline en URSS, Hitler en Allemagne) basés sur la terreur, la propagande idéologique et le contrôle absolu de la population.</li>
                        <li><span class="badge-notion">57-58-59-60-61</span><strong>Seconde Guerre mondiale (1939-1945) :</strong> Une guerre d'anéantissement idéologique marquée par la Shoah (génocide des Juifs et des Tziganes). En France, cohabitation entre le régime collaborationniste de Vichy (Pétain) et la Résistance (menée par De Gaulle). Libération en 1944.</li>
                        <li><span class="badge-notion">62-63-64</span><strong>Guerre froide (1947-1989) :</strong> Monde bipolaire caractérisé par l'affrontement idéologique, technologique et indirect entre le bloc de l'Est (URSS) et le bloc de l'Ouest (USA). Effondrement symbolisé par la chute du mur de Berlin (1989).</li>
                        <li><span class="badge-notion">65-66-67-68-69-70</span><strong>Monde contemporain :</strong> Processus de décolonisation menant à l'indépendance des anciennes colonies. Parallèlement, construction européenne (traités de Rome et de Maastricht) pour consolider la paix, s'insérant dans une mondialisation économique dominée par de nouvelles puissances émergentes (Chine, Inde).</li>
                    </ul>

                    <h3>Géographie : Dynamiques Territoriales de la France et de l'UE</h3>
                    <ul>
                        <li><span class="badge-notion">71-72-73</span><strong>Aires urbaines :</strong> Territoire continu formé par un pôle urbain (ville-centre + banlieues) et une couronne périurbaine. Phénomène de métropolisation (concentration des fonctions de commandement) engendrant un étalement urbain.</li>
                        <li><span class="badge-notion">74-75-76</span><strong>Espaces productifs :</strong> Zones dédiées à la création de richesse : agricoles (hautement mécanisées), industrielles ou de services (concentrées dans les technopôles). Ils dépendent de la mondialisation des échanges transitant par de grands hubs logistiques et des zones portuaires.</li>
                        <li><span class="badge-notion">77-78-79-80</span><strong>Espaces de faible densité :</strong> Régions marquées par la déprise agricole ou la désertification rurale, faisant l'objet de politiques d'aménagement du territoire pour réduire les inégalités territoriales.</li>
                        <li><span class="badge-notion">81-82</span><strong>France ultramarine :</strong> Les territoires d'outre-mer (DROM-COM) offrent une présence mondiale et des atouts géostratégiques majeurs à la France, mais souffrent d'un éloignement et de contraintes économiques fortes.</li>
                        <li><span class="badge-notion">83-84-85</span><strong>Union européenne :</strong> Un espace intégré favorisant la libre circulation des hommes et des biens (espace Schengen) consolidé par une monnaie unique (l'Euro).</li>
                        <li><span class="badge-notion">86-87-88-89-90</span><strong>Rayonnement et défis :</strong> La France conserve une influence culturelle, géopolitique et économique mondiale, ancrée sur de puissants flux et des métropoles de premier plan, tout en intégrant des impératifs de développement durable pour ses territoires.</li>
                    </ul>
                </div>

                <div id="b-emc" class="brevet-ecran-cours" style="display: none; border-top: 6px solid #ea580c;">
                    <button class="btn-retour-brevet" onclick="document.getElementById('b-emc').style.display='none'; document.getElementById('brevet-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour</button>
                    <div style="background: #ea580c; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; margin-bottom: 20px;">🏛️ EMC : VALEURS, PRINCIPES ET CITOYENNETÉ</div>
                    
                    <h3>Citoyenneté, Droits, Devoirs et Valeurs Républicaines</h3>
                    <ul>
                        <li><span class="badge-notion">91-92-93</span><strong>La citoyenneté française :</strong> S'acquiert par la nationalité. Elle confère des droits civils (libertés individuelles), politiques (voter, être éligible) et sociaux (sécurité sociale). Elle impose des devoirs constitutionnels : respecter les lois, payer ses impôts et participer à la défense nationale.</li>
                        <li><span class="badge-notion">94-95-96</span><strong>Grands Principes constitutionnels :</strong> L'égalité absolue femmes-hommes dans tous les domaines. La <strong>laïcité</strong>, principe juridique de séparation des Églises et de l'État assurant la liberté de conscience : l'État ne privilégie aucun culte et garantit le libre exercice de chacun dans le respect de l'ordre public.</li>
                        <li><span class="badge-notion">97-98-99-100</span><strong>Les Institutions de la Ve République :</strong> Régime démocratique caractérisé par la séparation des pouvoirs :
                            <br>• Le <strong>Président de la République</strong> (pouvoir exécutif, chef de l'État et des armées).
                            <br>• Le <strong>Gouvernement</strong> (mené par le Premier ministre, exécute les lois).
                            <br>• Le <strong>Parlement</strong> (Assemblée nationale + Sénat : pouvoir législatif, vote la loi et contrôle le gouvernement).
                        </li>
                        <li><span class="badge-notion">101-102-103-104-105</span><strong>Fondements de la République :</strong> La démocratie s'exprime par le droit de vote lors des élections. La République repose sur sa devise (Liberté, Égalité, Fraternité) et ses symboles d'identification (le drapeau tricolore, la Marseillaise, Marianne, la fête nationale du 14 juillet). La défense et la sécurité nationale protègent ce modèle républicain.</li>
                    </ul>
                </div>

                <div id="b-sciences" class="brevet-ecran-cours" style="display: none; border-top: 6px solid #0d9488;">
                    <button class="btn-retour-brevet" onclick="document.getElementById('b-sciences').style.display='none'; document.getElementById('brevet-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour</button>
                    <div style="background: #0d9488; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; margin-bottom: 20px;">🔬 SCIENCES : SYNTHÈSE DES DISCIPLINES SVT & PHYSIQUE-CHIMIE</div>
                    
                    <h3>Sciences de la Vie et de la Terre (SVT)</h3>
                    <ul>
                        <li><span class="badge-notion">106-107-108</span><strong>Géologie externe et interne :</strong> La Terre dissipe son énergie thermique interne en provoquant le mouvement des plaques tectoniques. Leurs frictions créent des séismes (points de rupture dans les roches) et du volcanisme, représentant des risques naturels dès lors qu'ils touchent des zones humaines habitées.</li>
                        <li><span class="badge-notion">109-110-111-112-113</span><strong>Climat, environnement et météo :</strong> La météo étudie l'atmosphère à court terme ; la climatologie étudie les moyennes sur plusieurs décennies. Les émissions anthropiques de gaz à effet de serre piègent le rayonnement infrarouge, provoquant un réchauffement climatique global. Face à l'épuisement des ressources non renouvelables, le développement durable prône une gestion raisonnée.</li>
                        <li><span class="badge-notion">114-115-116-117-118</span><strong>Le vivant et sa nutrition :</strong> Les plantes sont des organismes autotrophes convertissant la lumière, l'eau et le $CO_2$ en glucose et oxygène par la photosynthèse, formant la base des chaînes alimentaires. Les animaux sont hétérotrophes : ils digèrent la matière organique en nutriments absorbés par l'intestin grêle, puis véhiculés par le sang pour fournir de l'énergie.</li>
                        <li><span class="badge-notion">119-120-121-122-123-124-125</span><strong>Immunologie, Évolution et Reproduction :</strong> Le système immunitaire utilise ses globules blancs pour éliminer les microbes pathogènes. Les espèces s'adaptent au cours des générations sous l'effet de la sélection naturelle. La biodiversité et la survie d'une population dépendent directement de sa diversité génétique. La reproduction humaine assure la pérennité de la vie par la fécondation d'un ovule par un spermatozoïde.</li>
                    </ul>

                    <h3>Physique-Chimie</h3>
                    <ul>
                        <li><span class="badge-notion">126-127-128-129</span><strong>États et structure de la matière :</strong> Solide (particules liées), liquide (particules mobiles proches) et gaz (particules espacées). Les changements d'état modifient l'organisation sans altérer l'espèce chimique. La matière est composée d'atomes (unités élémentaires) ou de molécules (assemblages d'atomes).</li>
                        <li><span class="badge-notion">130-131-132-133</span><strong>Transformations de la matière :</strong> Lors d'une réaction chimique, les réactifs se réorganisent pour former des produits (rien ne se perd, rien ne se crée). Les solutions sont classées selon leur pH (Acide < 7, Neutre = 7, Basique > 7). Une réaction entre un acide et une base dégage de l'énergie thermique.</li>
                        <li><span class="badge-notion">134-135-136</span><strong>Mouvements et interactions :</strong> Le mouvement d'un objet se caractérise obligatoirement par rapport à un référentiel d'observation choisi. Les forces (de contact ou à distance comme la gravitation universelle) modifient la trajectoire, la vitesse ou la forme des corps.</li>
                        <li><span class="badge-notion">137-138-139</span><strong>Énergie et conversions :</strong> L'énergie se conserve mais change de forme (cinétique liée à la vitesse, chimique liée aux liaisons, thermique liée à la chaleur).</li>
                        <li><span class="badge-notion">140-141-142-143</span><strong>Électricité :</strong> Un circuit en série offre une seule boucle au courant, tandis qu'un montage en dérivation en comporte plusieurs. La loi d'Ohm lie la tension $U$, la résistance $R$ et l'intensité $I$ par la formule $U = R \times I$. La puissance en watts définit la vitesse de transfert d'énergie.</li>
                        <li><span class="badge-notion">144-145</span><strong>Signaux :</strong> La lumière se propage de manière rectiligne (en ligne droite) y compris dans le vide. Le son est une onde mécanique (vibration) nécessitant impérativement un milieu matériel pour se propager (impossible dans le vide).</li>
                    </ul>
                </div>

                <div id="b-methode" class="brevet-ecran-cours" style="display: none; border-top: 6px solid #4f46e5;">
                    <button class="btn-retour-brevet" onclick="document.getElementById('b-methode').style.display='none'; document.getElementById('brevet-menu-principal').style.display='block'; window.scrollTo(0,0);">⬅️ Retour</button>
                    <div style="background: #4f46e5; color: white; padding: 12px; border-radius: 6px; font-weight: bold; text-align: center; margin-bottom: 20px;">🧠 CE QUI FAIT VRAIMENT RÉUSSIR AU BREVET</div>
                    
                    <div class="brevet-conseil">
                        <strong>✏️ 1. Rédiger des réponses complètes :</strong> Ne répondez jamais par un simple mot ou une ligne télégraphique. Reprenez les termes de la question pour formuler une phrase correcte et élégante.
                    </div>
                    
                    <div class="brevet-conseil">
                        <strong>🔍 2. Justifier avec rigueur :</strong> Pour chaque affirmation (en sciences, en histoire ou en français), apportez des preuves précises. Utilisez la structure : "Je sais d'après le document/le cours que... or... donc j'en conclus que...".
                    </div>
                    
                    <div class="brevet-conseil">
                        <strong>📐 3. Sécuriser les calculs :</strong> En mathématiques et en physique, écrivez toujours la formule littérale avant de remplacer par les valeurs numériques. N'oubliez jamais de mentionner l'unité finale (m, kg, V, W, etc.).
                    </div>
                    
                    <div class="brevet-conseil">
                        <strong>📊 4. Exploiter les documents :</strong> Prenez le temps de lire entièrement les textes, les légendes des cartes et les axes des graphiques avant de commencer à rédiger. Les réponses s'y cachent très souvent.
                    </div>
                    
                    <div class="brevet-important">
                        <strong>⚠️ REGLE D'OR ABSOLUE : N'apprenez jamais par cœur sans comprendre !</strong> Le Brevet évalue votre capacité à réfléchir et à analyser. Une notion apprise mécaniquement sans être comprise ne pourra pas être réutilisée face à un sujet original.
                    </div>
                </div>
            </div>
        `,
        quiz: [
            // --- FRANCAIS (1 à 15) ---
            {
                question: "Quel type de texte s'attache à défendre une opinion précise en vue de convaincre le lecteur ?",
                answers: ["Un texte narratif", "Un texte descriptif", "Un texte argumentatif", "Un texte poétique"],
                correct: 2
            },
            {
                question: "Dans le schéma narratif, quel élément vient rompre l'équilibre de la situation initiale ?",
                answers: ["Les péripéties", "L'élément perturbateur", "Le dénouement", "La situation finale"],
                correct: 1
            },
            {
                question: "Quel temps du récit est majoritairement employé pour les actions de premier plan, soudaines et de durée délimitée ?",
                answers: ["L'imparfait de l'indicatif", "Le passé simple de l'indicatif", "Le plus-que-parfait", "Le subjonctif présent"],
                correct: 1
            },
            {
                question: "Quel registre littéraire cherche à susciter la pitié, la compassion ou les larmes chez le lecteur ?",
                answers: ["Le registre ironique", "Le registre tragique", "Le registre comique", "Le registre pathétique"],
                correct: 3
            },
            {
                question: "Comment appelle-t-on l'idée ou l'opinion principale soutenue par l'auteur d'un texte argumentatif ?",
                answers: ["Un argument", "Une thèse", "Un exemple concret", "Un connecteur de cause"],
                correct: 1
            },
            {
                question: "Quelle figure de style établit une analogie entre deux éléments sans utiliser de mot de comparaison ?",
                answers: ["La comparaison", "L'antithèse", "La métaphore", "L'hyperbole"],
                correct: 2
            },
            {
                question: "Comment se définit l'anaphore en littérature ?",
                answers: ["La répétition d'un mot ou groupe de mots en début de phrase ou de vers", "L'opposition de deux termes de sens contraire", "L'exagération démesurée d'une réalité", "Le fait de dire le contraire de ce que l'on pense"],
                correct: 0
            },
            {
                question: "Quelle est la nature (classe grammaticale) invariable d'un mot servant à modifier le sens d'un verbe ou d'un adjectif ?",
                answers: ["Un adjectif qualificatif", "Un adverbe", "Une préposition", "Un pronom personnel"],
                correct: 1
            },
            {
                question: "Dans la phrase 'Le candidat révise son examen', quelle est la fonction grammaticale du groupe 'son examen' ?",
                answers: ["Sujet", "Complément d'objet direct (COD)", "Complément d'objet indirect (COI)", "Complément circonstanciel"],
                correct: 1
            },
            {
                question: "Quelle proposition est introduite par un pronom relatif (qui, que, quoi, dont, où) et complète un nom ?",
                answers: ["La proposition subordonnée relative", "La proposition subordonnée conjonctive", "La proposition principale", "La proposition coordonnée"],
                correct: 0
            },
            {
                question: "Quel connecteur logique exprime de manière explicite une relation de conséquence ?",
                answers: ["Car", "Cependant", "Donc", "Puisque"],
                correct: 2
            },
            {
                question: "Parmi les homophones suivants, lequel correspond à la préposition ?",
                answers: ["a", "à", "est", "et"],
                correct: 1
            },
            {
                question: "Dans quel point de vue (focalisation) le narrateur sait-il tout des pensées, du passé et de l'avenir de tous les personnages ?",
                answers: ["Le point de vue interne", "Le point de vue externe", "Le point de vue omniscient", "Le point de vue subjectif"],
                correct: 2
            },
            {
                question: "Comment appelle-t-on les indications scéniques en italique donnant des informations sur le jeu des acteurs au théâtre ?",
                answers: ["Les répliques", "Les tirades", "Les monologues", "Les didascalies"],
                correct: 3
            },
            {
                question: "Quelle est la règle d'or pour réussir une analyse guidée de texte au Brevet ?",
                answers: ["Recopier tout le texte sans réfléchir", "S'appuyer sur des procédés précis (lexique, grammaire) pour expliquer le sens", "Donner son avis personnel sans citer le texte", "Inventer une suite à l'histoire"],
                correct: 1
            },

            // --- MATHS (16 à 30) ---
            {
                question: "Dans quel type de triangle peut-on appliquer le théorème de Pythagore ?",
                answers: ["Un triangle isocèle", "Un triangle équilatéral", "Un triangle rectangle", "Un triangle quelconque"],
                correct: 2
            },
            {
                question: "Quelle égalité traduit le théorème de Pythagore dans un triangle ABC rectangle en B ?",
                answers: ["AB² = AC² + BC²", "AC² = AB² + BC²", "BC² = AB² + AC²", "AC = AB + BC"],
                correct: 1
            },
            {
                question: "Que permet de prouver la réciproque du théorème de Thalès ?",
                answers: ["Qu'un triangle est rectangle", "Que deux droites sont parallèles", "Qu'un angle est droit", "La valeur d'une longueur manquante"],
                correct: 1
            },
            {
                question: "Quelle est la formule trigonométrique exacte du sinus d'un angle aigu ?",
                answers: ["Côté adjacent / Hypoténuse", "Côté opposé / Côté adjacent", "Côté opposé / Hypoténuse", "Hypoténuse / Côté opposé"],
                correct: 2
            },
            {
                question: "Quelle est la méthode pour résoudre une équation produit nul de la forme A × B = 0 ?",
                answers: ["Calculer A + B", "Poser que A = 0 OU B = 0", "Diviser A par B", "Développer l'expression totale"],
                correct: 1
            },
            {
                question: "Développez l'identité remarquable suivante : (a + b)².",
                answers: ["a² + b²", "a² - 2ab + b²", "a² + 2ab + b²", "a² - b²"],
                correct: 2
            },
            {
                question: "Quelle expression correspond à la factorisation de a² - b² ?",
                answers: ["(a - b)²", "(a + b)²", "(a + b)(a - b)", "a - b"],
                correct: 2
            },
            {
                question: "Par quel coefficient multiplicateur traduit-on une baisse de 15% ?",
                answers: ["1,15", "0,15", "0,85", "1,5"],
                correct: 2
            },
            {
                question: "Quelle est la forme générale d'une fonction affine ?",
                answers: ["f(x) = ax²", "f(x) = ax + b", "f(x) = a / x", "f(x) = ax³"],
                correct: 1
            },
            {
                question: "En statistiques, qu'est-ce que l'étendue d'une série de données ?",
                answers: ["La valeur située exactement au milieu", "La somme de toutes les valeurs", "La différence entre la plus grande et la plus petite valeur", "L'effectif le plus représenté"],
                correct: 2
            },
            {
                question: "Quelle est la probabilité d'un événement certain ?",
                answers: ["0", "0,5", "1", "100"],
                correct: 2
            },
            {
                question: "Quelle est l'unité équivalente à 1 décimètre cube (1 dm³) ?",
                answers: ["10 Litres", "1 Litre", "100 Litres", "0,1 Litre"],
                correct: 1
            },
            {
                question: "Comment calcule-t-on le volume d'un pavé droit (parallélépipède rectangle) ?",
                answers: ["Longueur + Largeur + Hauteur", "Longueur × Largeur × Hauteur", "Rayon² × Hauteur", "Côté × 4"],
                correct: 1
            },
            {
                question: "Que représente graphiquement une fonction affine ?",
                answers: ["Une parabole", "Une courbe quelconque", "Une droite", "Un cercle"],
                correct: 2
            },
            {
                question: "Quelle est la première étape indispensable lors de la résolution d'un problème complexe de géométrie ?",
                answers: ["Donner la réponse au hasard", "Écrire les formules littérales de cours avant d'introduire les chiffres", "Tracer un cercle au compas", "Rédiger la conclusion directement"],
                correct: 1
            },

            // --- HISTOIRE ET GEOGRAPHIE (31 à 45) ---
            {
                question: "En quelle année s'est déroulé le génocide des Arméniens au cours de la Première Guerre mondiale ?",
                answers: ["1912", "1915", "1917", "1939"],
                correct: 1
            },
            {
                question: "Quel régime politique s'établit en Allemagne en 1933 avec l'arrivée d'Hitler au pouvoir ?",
                answers: ["Une république démocratique", "Un régime totalitaire nazi", "Une monarchie absolue", "Un gouvernement communiste"],
                correct: 1
            },
            {
                question: "Qu'est-ce qui caractérise la Seconde Guerre mondiale comme une guerre d'anéantissement ?",
                answers: ["L'utilisation exclusive de cavalerie", "La volonté de détruire totalement l'adversaire, militaires comme civils (Shoah)", "L'absence totale de propagande", "La courte durée des combats (quelques jours)"],
                correct: 1
            },
            {
                question: "Qui dirige le régime collaborationniste de Vichy en France à partir de 1940 ?",
                answers: ["Charles de Gaulle", "Philippe Pétain", "Jean Moulin", "Georges Clemenceau"],
                correct: 1
            },
            {
                question: "Quel événement symbolise de manière éclatante la fin de la Guerre froide en 1989 ?",
                answers: ["Le traité de Rome", "La chute du mur de Berlin", "Le débarquement de Normandie", "L'indépendance de l'Inde"],
                correct: 1
            },
            {
                question: "Quels traités majeurs ont respectivement fondé la CEE en 1957 et créé l'Union européenne en 1992 ?",
                answers: ["Versailles et Berlin", "Rome et Maastricht", "Paris et Londres", "Yalta et Potsdam"],
                correct: 1
            },
            {
                question: "De quoi se compose une aire urbaine en géographie ?",
                answers: ["Uniquement d'un centre historique", "D'une ville-centre, de banlieues et d'une couronne périurbaine", "De zones agricoles désertiques", "D'espaces productifs industriels éloignés"],
                correct: 1
            },
            {
                question: "Qu'est-ce que le phénomène d'étalement urbain ?",
               2 answers: ["Le regroupement des commerces au centre", "L'extension de la ville sur les espaces ruraux environnants", "La baisse de la population des métropoles", "La verticalité des bâtiments de bureaux"],
                correct: 1
            },
            {
                question: "Qu'est-ce qu'un espace productif ?",
                answers: ["Une zone de protection stricte de la biodiversité", "Un espace aménagé pour développer une activité économique (agricole, industrielle, services)", "Un quartier d'habitation à faible densité", "Un espace de transport maritime exclusif"],
                correct: 1
            },
            {
                2question: "Comment qualifie-t-on les territoires français situés hors de la métropole européenne (DROM-COM) ?",
                answers: ["La France périphérique", "La France ultramarine", "Les espaces de faible densité", "L'espace intégré Schengen"],
                correct: 1
            },
            {
                question: "Quel accord garantit la libre circulation des personnes au sein d'une grande partie de l'Union européenne ?",
                answers: ["Le traité de Maastricht", "L'accord de l'espace Schengen", "La charte du développement durable", "La constitution de la Ve République"],
                correct: 1
            },
            {
                q2uestion: "Qu'est-ce qu'un espace de faible densité en France ?",
                answers: ["Une grande métropole surpeuplée", "Un espace comptant moins de 30 habitants par km² marqué parfois par la déprise", "Une zone industrialo-portuaire internationale", "Une île d'outre-mer ultra-connectée"],
                correct: 1
            },
            {
                question: "Quelle est la tendance mondiale actuelle de la répartition de la richesse et du commandement ?",
                answers: ["La métropolisation (concentration dans les grandes villes mondiales)", "La dispersion totale vers les zones rurales", "L'abandon complet des littoraux et ports", "L'isolement de tous les pays"],
                correct: 0
            },
            {
                question: "Quelle puissance émergente s'est affirmée comme un acteur économique central de la mondialisation après 1990 ?",
                answers: ["La France de Vichy", "La Chine", "L'URSS de Staline", "L'Empire Ottoman"],
                correct: 1
            },
            {
                qu2estion: "Quel est l'objectif majeur des politiques d'aménagement du territoire ?",
                answers: ["Augmenter les impôts des métropoles", "Réduire les inégalités territoriales et rendre les espaces attractifs", "Favoriser uniquement la ville-centre au détriment des campagnes", "Supprimer les frontières de l'espace Schengen"],
                correct: 1
            },

            // --- EMC (46 à 55) ---
            {
                question: "À quelle condition obligatoire est rattachée la citoyenneté française ?",
                answers: ["À la possession de la carte d'électeur", "À la détention de la nationalité française", "Au paiement de l'impôt sur le revenu", "À la majorité civile uniquement"],
                correct: 1
            },
            {
                question: "Parmi ces propositions, laquelle relève des devoirs moraux et républicains du citoyen ?",
                answers: ["Le droit de grève", "Le respect des lois, d'autrui et la participation aux impôts", "L'accès gratuit aux soins", "Le droit à l'éducation"],
                correct: 1
            },
            {
                question: "Qu'est-ce que le principe de laïcité en France ?",
                answers: ["L'obligation de pratiquer la religion de l'État", "La séparation des Églises et de l'État garantissant la liberté de conscience", "L'interdiction totale de pratiquer une religion chez soi", "Le financement public des principaux lieux de culte"],
                correct: 1
            },
            {
                que2stion: "Quel pouvoir détient de manière principale le Parlement (Assemblée nationale et Sénat) ?",
                answers: ["Le pouvoir exécutif", "Le pouvoir judiciaire", "Le pouvoir législatif (voter les lois)", "Le pouvoir militaire direct"],
                correct: 2
            },
            {
                question: "Sous quelle République la France est-elle gouvernée aujourd'hui ?",
                answers: ["La IIIe République", "La IVe République", "La Ve République", "La VIe République"],
                correct: 2
            },
            {
                question: "Quel est le rôle du Président de la République concernant les forces armées ?",
                answers: ["Il n'a aucun droit de regard", "Il en est le Chef suprême", "Il partage le commandement avec le Parlement européen", "Il s'occupe uniquement du budget d'EMC"],
                correct: 1
            },
            {
                question: "Quelles sont les trois valeurs de la devise de la République française ?",
                answers: ["Ordre, Travail, Patrie", "Liberté, Égalité, Fraternité", "Justice, Paix, Progrès", "Laïcité, Solidarité, Civisme"],
                correct: 1
            },
            {
                question: "Qui incarne allégoriquement les valeurs de la République française sur les timbres et dans les mairies ?",
                answers: ["Jeanne d'Arc", "Marianne", "La Fayette", "Marie Curie"],
                correct: 1
            },
            {
                question: "Quel droit politique fondamental matérialise l'exercice direct de la démocratie par les citoyens ?",
                answ2ers: ["Le droit de propriété", "Le droit de vote", "Le droit au logement", "Le droit d'association"],
                correct: 1
            },
            {
                question: "Quelle institution est chargée d'exécuter les lois votées par le Parlement ?",
                answers: ["Le Conseil constitutionnel", "Le Gouvernement", "Le Sénat seul", "La cour de cassation"],
                correct: 1
            },

            // --- SCIENCES (56 à 75) ---
            {
                question: "Quelle enveloppe rigide de la Terre est découpée en plaques tectoniques mobiles ?",
                answers: ["L'atmosphère", "La lithosphère", "Le noyau externe liquide", "L'intestin grêle"],
                correct: 1
            },
            {
                question: "Quand un séisme ou une éruption volcanique se transforme-t-il scientifiquement en risque ?",
                answers: ["Dès qu'il libère du CO2 dans l'espace", "Lorsqu'il affecte une zone habitée présentant des enjeux humains", "Uniquement s'il est d'origine exothermique", "Quand le pH de la lave est inférieur à 7"],
                correct: 1
            },
            {2
                question: "Quelle est la différence fondamentale entre la météo et le climat ?",
                answers: ["La météo étudie le long terme, le climat le court terme", "La météo étudie le court terme (jours), le climat s'établit sur des décennies", "Il n'y a aucune différence scientifique", "Le climat s'occupe uniquement des séismes"],
                correct: 1
            },
            {
                question: "Quel gaz piégé en excès dans l'atmosphère accentue l'effet de serre et le réchauffement climatique ?",
                answers: ["Le dioxygène", "Le dioxyde de carbone (CO₂)", "Le diazote", "L'hélium"],
                correct: 1
            },
            {
                question: "Qu'est-ce qu'une ressource naturelle renouvelable ?",
                answers: ["Une ressource fossile qui s'épuise dès consommation", "Une ressource capable de se régénérer naturellement à l'échelle humaine (ex: eau, biomasse)", "Un alliage créé artificiellement", "Un élément radioactif profond"],
                correct: 1
            },
            {
                question: "Quel processus biologique permet aux plantes autotrophes de fabriquer du glucose à partir de lumière ?",
                answers: ["La respiration cellulaire", "La digestion mécanique", "La photosynthèse", "La sélection naturelle"],
                correct: 2
            },
            {
                question: "Dans quel organe de l'appareil digestif les nutriments traversent-ils la paroi pour rejoindre le sang ?",
                answers: ["L'estomac", "Le gros intestin", "L'intestin grêle", "L'œsophage"],
                correct: 2
            },
            {
                question: "Quelles cellules spécialisées de notre système immunitaire détruisent les agents pathogènes ?",
                answers: ["Les globules rouges", "Les globules blancs (leucocytes)", "Les neurones", "Les plaquettes"],
                correct: 1
            },2
            {
                question: "Comment circule l'information de manière rapide dans le système nerveux ?",
                answers: ["Par le flux sanguin", "Via les nerfs et le cerveau sous forme de messages", "Par absorption osmotique", "Par les muscles lisses"],
                correct: 1
            },
            {
                question: "Quel mécanisme naturel théorisé par Darwin conduit à l'évolution des espèces ?",
                answers: ["Le développement durable", "La sélection naturelle", "La transformation chimique", "La gravitation universelle"],
                correct: 1
            },
            {
                question: "Quels sont les trois états physiques fondamentaux de la matière ?",
                answers: ["Atome, molécule, composé", "Solide, liquide, gaz", "Acide, base, sel", "Cinétique, potentiel, thermique"],
                correct: 1
            },
            {
                question: "Qu'est-ce qu'une molécule par rapport à un atome ?",
                answers: ["Une particule plus petite", "Un assemblage d'atomes liés chimiquement entre eux", "Une onde lumineuse pure", "Un réactif qui disparaît"],
                correct: 1
            },
            {
                question: "Au cours d'une transformation chimique, comment nomme-t-on les substances qui apparaissent ?",
                answers: ["Les réactifs", "Les produits", "Les solvants", "Les catalyseurs"],
                correct: 1
            },
            {
                question: "Quelle est la valeur d'un pH neutre à 25°C ?",
                answers: ["0", "7", "14", "1"],
                correct: 1
            },2
            {
                question: "Quel adjectif qualifie une solution dont le pH est strictement inférieur à 7 ?",
                answers: ["Basique", "Neutre", "Acide", "Alcaline"],
                correct: 2
            },
            {
                question: "Le mouvement d'un corps n'est pas absolu. De quoi dépend-il systématiquement ?",
                answers: ["De sa masse en kg", "Du référentiel d'observation choisi", "De la température ambiante", "De la puissance du générateur"],
                correct: 1
            },
            {
                question: "Quelle force s'exerçant à distance retient les planètes en orbite et nous maintient au sol ?",
                answers: ["La force de frottement", "La force magnétique", "La force de gravitation universelle", "La loi d'Ohm"],
                correct: 2
            },
            {
                question: "Énoncez la formule mathématique de la loi d'Ohm.",
                answers: ["P = U × I", "U = R × I", "E = P × t", "I = U × R"],
                correct: 1
            },
            {
                question: "Où le son ne peut-il absolument pas se propager ?",
                answers: ["Dans l'eau de mer", "Dans l'air", "Dans le vide", "Dans un solide métallique"],
                correct: 2
            },
            {
                question: "Quelle est la trajectoire de propagation de la lumière dans un milieu transparent homogène ?",
                answers: ["Sinusoïdale", "En ligne droite (rectiligne)", "Circulaire", "Aléatoire"],
               2 correct: 1
            }
        ]
    }
// --- SYSTÈME DE NAVIGATION ---
function openSubject(subjectKey) {
    currentSubject = subjectKey;
    currentQuestionIndex = 0; 
    document.getElementById("main-menu").classList.add("hidden");
    const page = document.getElementById("subject-page");
    page.classList.remove("hidden");

    switchTab('cours');

    if(database[subjectKey]) {
        document.getElementById("subject-title").innerText = database[subjectKey].title;
        document.getElementById("cours-placeholder").innerHTML = database[subjectKey].fiches;
        loadQuizQuestion();
    }
}

function showMainMenu() {
    document.getElementById("subject-page").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
}

function switchTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(el => el.classList.add("hidden"));
    document.querySelectorAll(".tab-link").forEach(el => el.classList.remove("active"));
    
    document.get2ElementById(`tab-${tabName}`).classList.remove("hidden");
    
    const clickedTab = document.querySelector(`[onclick="switchTab('${tabName}')"]`);
    if(clickedTab) clickedTab.classList.add("active");
}

// --- SYSTÈME DE QUIZ & XP ---
function loadQuizQuestion() {
    const quizList = database[currentSubject]?.quiz;
    const container = document.getElementById("quiz-container");
    
    if (!quizList || quizList.length <= currentQuestionIndex) {
        container.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <h3>🎉 Quête Accomplie !</h3>
                <p>Tu as terminé le quiz de cette matière et gagné un bonus massif d'XP !</p>
                <button class="btn-back" onclick="resetQuiz()">Recommencer le Quiz 🔄</button>
            </div>`;
        gainXP(40);
        return;
    }

    container.innerHTML = `
        <p id="quiz-question" style="font-size:1.2rem; margin-bottom:20px; font-weight:bold;"></p>
        <div id="quiz-options" class="options-grid"></div>
        <button id="btn-next-quiz" class="hidden" style="margin-top:20px; background:var(--success-color); color:black; font-weight:bold; padding:12px; border:none; border-radius:5px; cursor:pointer;" onclick="nextQuestion()">Question suivante ➡️</button>
    `;

    const qData = quizList[currentQuestionIndex];
    document.getElementById("quiz-question").innerText = qData.q;
    const optionsDiv = document.getElementById("quiz-options");

    qData.options.forEach((opt, index) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(index, qData.answer);
        optionsDiv.appendChild(btn);
    });
}

function checkAnswer(selected, correct) {
    const buttons = document.querySelectorAll(".option-btn");
    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === correct) btn.classList.add("correct");
        if (idx === selected && selected !== correct) btn.classList.add("wrong");
    });
    
    if(selected === correct) {
        gainXP(20);
    }
    document.getElementById("btn-next-quiz").classList.remove("hidden");
}

function nextQuestion() {
    currentQuestionIndex++;
    loadQuizQuestion();
}

function resetQuiz() {
    currentQuestionIndex = 0;
    loadQuizQuestion();
}

// --- GESTION DE L'XP ---
function gainXP(amount) {
    playerState.xp += amount;
    if (playerState.xp >= 100) {
        playerState.xp -= 100;
        playerState.level += 1;
        alert(`⚡ LEVEL UP ! Tu passes Niveau ${playerState.level}. Tu deviens un monstre des révisions !`);
    }
    saveData();
    updateUI();
}

function updateUI() {
    document.getElementById("level").innerText = playerState.level;
    document.getElementById("xp-bar").style.width = `${playerState.xp}%`;
    document.getElementById("xp-text").innerText = `${playerState.xp} / 100 XP`;
    
    let totalSubjects = Object.keys(database).length;
    let prog = Math.min(100, (playerState.level - 1) * 5 + Math.floor(playerState.xp / 20));
    document.getElementById("global-progress").innerText = `${prog}%`;
}

// ... (tes fonctions actuelles comme updateUI, loadData, etc.)

function naviguer(idEcranCible, idMenuActuel) {
    // Masquer le menu actuel
    document.getElementById(idMenuActuel).style.display = 'none';
    
    // Afficher le nouvel écran
    const ecran = document.getElementById(idEcranCible);
    if (ecran) {
        ecran.style.display = 'block';
        window.scrollTo(0, 0); 
    }
}

//

// --- SAUVEGARDE AUTOMATIQUE ---
function saveData() {
    localStorage.setItem("brevetQuestSave", JSON.stringify(playerState));
}

fun2ction loadData() {
    const save = localStorage.getItem("brevetQuestSave");
    if (save) {
        playerState = JSON.parse(save);
        updateUI();
    }
}

window.onload = loadData;2
