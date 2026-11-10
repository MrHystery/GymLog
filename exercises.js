'use strict';
/* ===== Groupes musculaires ===== */
const GROUPS = ['Pectoraux','Dos','Épaules','Biceps','Triceps','Jambes','Fessiers','Abdos','Mollets','Full body'];

/* ===== Pictogrammes (schémas filaires, vue de profil) =====
   Chaque pose : h=tête s=épaule p=bassin k=genou f=pied e=coude w=poignet q=charge (k2,f2 = 2e jambe) */
const PR = (x1,y1,x2,y2)=>`<line class="pr" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
const BENCH = PR(14,72,102,72);
const BAR = PR(30,6,92,6);
const SEAT = PR(26,74,56,74)+PR(34,36,36,74);
const STAND = {h:[60,18],s:[60,30],p:[60,54],k:[61,73],f:[60,90]};
const BENT = {h:[92,40],s:[82,46],p:[46,58],k:[54,76],f:[56,90]};
const LYING = {h:[22,66],s:[36,66],p:[72,66],k:[90,58],f:[94,88]};
const SEATED = {h:[40,32],s:[40,46],p:[40,70],k:[66,68],f:[68,90]};
const PLANK = {h:[96,60],s:[84,66],p:[46,72],k:[30,78],f:[12,84],e:[84,84],w:[100,84]};
const HANG = {h:[62,22],s:[60,32],p:[60,56],k:[62,72],f:[58,86],e:[64,19],w:[60,6]};

const T = {
  squat:{ a:{...STAND,e:[67,38],w:[63,30],q:[60,28]},
          b:{h:[50,38],s:[54,50],p:[40,72],k:[68,70],f:[62,90],e:[62,56],w:[58,48],q:[54,48]} },
  hinge:{ a:{...STAND,e:[63,42],w:[64,56],q:[64,56]},
          b:{...BENT,e:[84,60],w:[84,76],q:[84,76]} },
  bench:{ props:BENCH, a:{...LYING,e:[36,48],w:[36,30],q:[36,30]},
          b:{...LYING,e:[50,58],w:[36,56],q:[36,56]} },
  incline:{ props:PR(40,44,78,72), a:{h:[34,40],s:[44,50],p:[72,66],k:[90,58],f:[94,88],e:[46,36],w:[46,20],q:[46,20]},
            b:{h:[34,40],s:[44,50],p:[72,66],k:[90,58],f:[94,88],e:[58,48],w:[46,44],q:[46,44]} },
  fly:{ props:BENCH, a:{...LYING,e:[36,48],w:[36,30],q:[36,30]},
        b:{...LYING,e:[34,58],w:[24,64],q:[24,64]} },
  skull:{ props:BENCH, a:{...LYING,e:[36,48],w:[36,30],q:[36,30]},
          b:{...LYING,e:[36,48],w:[24,54],q:[24,54]} },
  ohp:{ a:{h:[60,22],s:[60,34],p:[60,58],k:[60,75],f:[60,90],e:[70,44],w:[63,32],q:[63,32]},
        b:{h:[60,22],s:[60,34],p:[60,58],k:[60,75],f:[60,90],e:[68,22],w:[62,6],q:[62,6]} },
  row:{ a:{...BENT,e:[84,62],w:[84,78],q:[84,78]},
        b:{...BENT,e:[66,56],w:[80,60],q:[80,60]} },
  seatrow:{ props:SEAT, a:{h:[40,30],s:[40,44],p:[38,68],k:[70,66],f:[74,90],e:[60,50],w:[82,56],q:[82,56]},
            b:{h:[40,30],s:[40,44],p:[38,68],k:[70,66],f:[74,90],e:[46,56],w:[56,58],q:[56,58]} },
  pullup:{ props:BAR, a:{...HANG},
           b:{h:[62,12],s:[60,24],p:[60,48],k:[62,64],f:[58,78],e:[68,16],w:[60,6]} },
  pulldown:{ props:PR(30,76,56,76)+PR(66,0,66,6), a:{h:[48,30],s:[48,44],p:[46,68],k:[74,66],f:[76,90],e:[58,24],w:[66,6],q:[66,6]},
             b:{h:[48,30],s:[48,44],p:[46,68],k:[74,66],f:[76,90],e:[56,56],w:[68,42],q:[68,42]} },
  curl:{ a:{...STAND,e:[62,46],w:[64,62],q:[64,62]},
         b:{...STAND,e:[62,46],w:[72,34],q:[72,34]} },
  pushdown:{ a:{...STAND,e:[64,46],w:[72,40],q:[72,40]},
             b:{...STAND,e:[62,46],w:[66,62],q:[66,62]} },
  overtri:{ a:{h:[60,22],s:[60,34],p:[60,58],k:[60,75],f:[60,90],e:[64,16],w:[50,26],q:[50,26]},
            b:{h:[60,22],s:[60,34],p:[60,58],k:[60,75],f:[60,90],e:[64,16],w:[64,2],q:[64,2]} },
  kick:{ a:{...BENT,e:[68,54],w:[68,70],q:[68,70]},
         b:{...BENT,e:[68,54],w:[52,56],q:[52,56]} },
  raise:{ a:{...STAND,e:[62,46],w:[62,60],q:[62,60]},
          b:{...STAND,e:[74,34],w:[88,34],q:[88,34]} },
  shrug:{ a:{...STAND,e:[62,46],w:[62,62],q:[62,62]},
          b:{h:[60,15],s:[60,27],p:[60,54],k:[61,73],f:[60,90],e:[62,42],w:[62,58],q:[62,58]} },
  lunge:{ a:{...STAND,k:[62,73],f:[66,90],k2:[58,73],f2:[50,90],e:[62,42],w:[62,56],q:[62,56]},
          b:{h:[60,36],s:[60,48],p:[60,72],k:[82,74],f:[82,90],k2:[48,86],f2:[32,90],e:[62,60],w:[62,74],q:[62,74]} },
  pushup:{ a:{h:[100,50],s:[88,56],p:[50,68],k:[32,78],f:[14,88],e:[88,72],w:[88,88]},
           b:{h:[100,70],s:[88,76],p:[50,80],k:[32,84],f:[14,88],e:[76,82],w:[88,88]} },
  dip:{ props:PR(46,58,72,58), a:{h:[60,22],s:[60,34],p:[56,60],k:[60,76],f:[50,84],e:[62,46],w:[60,58]},
        b:{h:[62,34],s:[60,46],p:[56,70],k:[62,82],f:[50,88],e:[72,54],w:[60,58]} },
  crunch:{ a:{h:[24,80],s:[34,80],p:[64,80],k:[84,62],f:[92,84],e:[32,70],w:[26,74]},
           b:{h:[40,60],s:[46,68],p:[64,80],k:[84,62],f:[92,84],e:[42,56],w:[34,58]} },
  legraise:{ a:{h:[20,82],s:[32,82],p:[60,82],k:[82,82],f:[104,82]},
             b:{h:[20,82],s:[32,82],p:[60,82],k:[62,54],f:[62,26]} },
  hang:{ props:BAR, a:{...HANG}, b:{...HANG,k:[78,56],f:[76,74]} },
  plank:{ static:true, a:PLANK, b:PLANK },
  climber:{ a:{h:[98,54],s:[86,60],p:[48,68],k:[70,64],f:[64,84],k2:[30,78],f2:[12,88],e:[86,76],w:[86,88]},
            b:{h:[98,54],s:[86,60],p:[48,68],k:[30,78],f:[12,88],k2:[70,64],f2:[64,84],e:[86,76],w:[86,88]} },
  calf:{ a:{...STAND},
         b:{h:[60,12],s:[60,24],p:[60,48],k:[60,68],f:[64,86]} },
  bridge:{ a:{h:[16,82],s:[28,80],p:[60,82],k:[80,62],f:[86,88],e:[44,84],w:[58,84]},
           b:{h:[16,82],s:[28,78],p:[60,60],k:[80,58],f:[86,88],e:[44,84],w:[58,84]} },
  thrust:{ props:PR(10,74,38,74), a:{h:[14,64],s:[26,66],p:[58,82],k:[78,64],f:[84,88],q:[58,78]},
           b:{h:[14,62],s:[26,64],p:[58,62],k:[80,60],f:[86,88],q:[58,58]} },
  legext:{ props:PR(24,74,52,74), a:{...SEATED}, b:{...SEATED,f:[96,70]} },
  legcurl:{ props:PR(24,74,52,74), a:{...SEATED,f:[96,70]}, b:{...SEATED,f:[52,90]} },
  legpress:{ props:PR(14,80,40,86), a:{h:[16,62],s:[26,66],p:[44,80],k:[60,58],f:[78,44]},
             b:{h:[16,62],s:[26,66],p:[44,80],k:[72,60],f:[100,46]} },
  seatpress:{ props:SEAT, a:{...SEATED,e:[34,54],w:[48,50],q:[48,50]},
              b:{...SEATED,e:[54,52],w:[70,50],q:[70,50]} },
  swing:{ a:{...BENT,e:[70,62],w:[62,70],q:[62,70]},
          b:{...STAND,e:[74,40],w:[90,38],q:[90,38]} },
  cleanpress:{ a:{...BENT,e:[84,60],w:[84,76],q:[84,76]},
               b:{h:[60,22],s:[60,34],p:[60,58],k:[60,75],f:[60,90],e:[68,22],w:[62,6],q:[62,6]} },
  burpee:{ a:{h:[66,50],s:[58,58],p:[40,74],k:[58,70],f:[50,90],e:[70,72],w:[76,88]},
           b:{h:[60,12],s:[60,24],p:[60,48],k:[60,66],f:[60,82],e:[68,14],w:[66,0]} },
  farmer:{ static:true, a:{...STAND,e:[62,46],w:[62,62],q:[62,62]}, b:{...STAND,e:[62,46],w:[62,62],q:[62,62]} },
};
T.thruster = { a:T.squat.b, b:T.ohp.b };

function figure(p, props){
  const ln=(a,b,c='')=>`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${c}"/>`;
  let s=`<svg viewBox="0 0 120 100" class="pic" aria-hidden="true"><line x1="0" y1="91" x2="120" y2="91" class="fl"/>${props||''}`;
  if(p.k2) s+=ln(p.p,p.k2,'bk')+ln(p.k2,p.f2,'bk');
  s+=ln(p.p,p.k)+ln(p.k,p.f)+ln(p.s,p.p);
  if(p.e) s+=ln(p.s,p.e)+ln(p.e,p.w);
  s+=`<circle cx="${p.h[0]}" cy="${p.h[1]}" r="6" class="hd"/>`;
  if(p.q) s+=`<circle cx="${p.q[0]}" cy="${p.q[1]}" r="6" class="eq"/>`;
  return s+'</svg>';
}

/* ===== Exercices : [id, nom, groupe, matériel, pictogramme, conseils (séparés par |), temps?] ===== */
const RAW = [
 // Pectoraux
 ['dev-couche-barre','Développé couché (barre)','Pectoraux','Barre, banc','bench','Omoplates serrées et collées au banc|Descends la barre au milieu de la poitrine, coudes à ~45° du buste|Pousse en expirant, pieds bien ancrés au sol'],
 ['dev-couche-halt','Développé couché (haltères)','Pectoraux','Haltères, banc','bench','Descends jusqu\'à sentir l\'étirement des pectoraux|Garde les poignets alignés au-dessus des coudes|Rapproche les haltères en haut sans les cogner'],
 ['dev-incline-halt','Développé incliné (haltères)','Pectoraux','Haltères, banc incliné','incline','Banc incliné à 30° environ, pas plus|Pousse vers le haut et légèrement vers l\'intérieur|Contrôle la descente (2 secondes)'],
 ['dev-incline-barre','Développé incliné (barre)','Pectoraux','Barre, banc incliné','incline','La barre descend vers le haut de la poitrine|Épaules basses, omoplates serrées|Ne rebondis pas sur la poitrine'],
 ['ecarte-halt','Écarté couché (haltères)','Pectoraux','Haltères, banc','fly','Coudes légèrement fléchis et fixes pendant tout le mouvement|Ouvre jusqu\'à l\'étirement, sans descendre sous la ligne des épaules|Charge légère : c\'est un exercice d\'isolation'],
 ['pompes','Pompes','Pectoraux','Poids du corps','pushup','Corps gainé en planche, fessiers serrés|Mains un peu plus larges que les épaules, coudes à 45°|Poitrine près du sol ; version sur les genoux pour débuter'],
 ['pompes-inclinees','Pompes mains surélevées','Pectoraux','Banc ou rebord stable','pushup','Plus les mains sont hautes, plus c\'est facile|Garde le corps parfaitement aligné|Descends jusqu\'à frôler le support avec la poitrine'],
 ['dips-pec','Dips (pectoraux)','Pectoraux','Barres parallèles','dip','Penche légèrement le buste vers l\'avant|Descends jusqu\'à ~90° au coude, pas plus bas|Coudes légèrement écartés'],
 ['machine-pec','Presse pectorale (machine)','Pectoraux','Machine','seatpress','Règle le siège : poignées à hauteur de poitrine|Dos plaqué contre le dossier|Pousse sans verrouiller brutalement les coudes'],
 ['pec-deck','Pec deck (papillon)','Pectoraux','Machine','seatpress','Épaules basses, poitrine sortie|Ramène les bras devant toi en serrant les pectoraux|Contrôle le retour, n\'écrase pas la charge'],
 // Dos
 ['tractions','Tractions (pronation)','Dos','Barre de traction','pullup','Départ bras tendus, épaules actives (pas dans les oreilles)|Tire les coudes vers les hanches|Menton au-dessus de la barre ; élastique d\'aide si trop dur'],
 ['chinup','Tractions supination (chin-up)','Dos','Barre de traction','pullup','Paumes vers toi, mains à largeur d\'épaules|Sollicite aussi fortement les biceps|Descends complètement, sans te balancer'],
 ['tirage-vertical','Tirage vertical (poulie haute)','Dos','Poulie','pulldown','Tire la barre vers le haut de la poitrine|Penche-toi très légèrement en arrière, poitrine sortie|Pense « coudes vers le bas » plutôt que « tirer avec les mains »'],
 ['rowing-barre','Rowing barre','Dos','Barre','row','Dos plat, buste incliné à ~45°, genoux souples|Tire la barre vers le nombril|Serre les omoplates en haut, pas d\'élan'],
 ['rowing-halt','Rowing un bras (haltère)','Dos','Haltère, banc','row','Une main et un genou sur le banc, dos plat|Tire le coude vers la hanche, pas vers l\'épaule|Évite de tourner le buste'],
 ['tirage-horizontal','Tirage horizontal (poulie basse)','Dos','Poulie','seatrow','Assis dos droit, genoux légèrement fléchis|Tire la poignée vers le bas du ventre|Buste immobile, serre les omoplates'],
 ['extension-lombaire','Extension lombaire','Dos','Banc à lombaires','hinge','Descends en gardant le dos droit, sans l\'arrondir|Remonte jusqu\'à l\'alignement du corps, pas plus|Mouvement lent pour renforcer le bas du dos'],
 // Épaules
 ['dev-militaire','Développé militaire (barre)','Épaules','Barre','ohp','Fessiers et abdos serrés, ne cambre pas le dos|Pousse la barre en passant près du visage|Verrouille bras tendus au-dessus de la tête'],
 ['dev-epaules-halt','Développé épaules (haltères)','Épaules','Haltères','ohp','Coudes légèrement devant le plan du buste|Pousse sans que les haltères se touchent|Descends jusqu\'à hauteur des oreilles'],
 ['arnold','Développé Arnold','Épaules','Haltères','ohp','Départ paumes vers toi, rotation en poussant|Charge modérée, mouvement fluide|Garde le tronc stable'],
 ['elev-lat','Élévations latérales','Épaules','Haltères','raise','Monte les coudes, pas les mains|Arrête-toi à hauteur d\'épaule|Charge légère, descente lente'],
 ['elev-front','Élévations frontales','Épaules','Haltères','raise','Bras presque tendus, légère flexion du coude|Monte jusqu\'à hauteur des yeux|Pas d\'élan avec le dos'],
 ['oiseau','Oiseau (arrière d\'épaule)','Épaules','Haltères','row','Buste penché, dos plat|Ouvre les bras en rapprochant les omoplates|Très léger : l\'arrière d\'épaule est un petit muscle'],
 ['face-pull','Face pull','Épaules','Poulie + corde','row','Tire la corde vers le visage, coudes hauts|Écarte les mains en fin de mouvement|Excellent pour la posture des épaules'],
 ['shrug','Shrugs (trapèzes)','Épaules','Haltères ou barre','shrug','Hausse les épaules droit vers les oreilles|Pause 1 seconde en haut|Ne roule pas les épaules'],
 // Biceps
 ['curl-barre','Curl barre','Biceps','Barre droite ou EZ','curl','Coudes collés au corps|Pas d\'élan avec le dos|Descends bras presque tendus'],
 ['curl-halt','Curl haltères','Biceps','Haltères','curl','Alterne les bras ou fais les deux ensemble|Tourne la paume vers le haut en montant|Descends lentement'],
 ['curl-marteau','Curl marteau','Biceps','Haltères','curl','Paumes face à face (prise neutre)|Travaille aussi l\'avant-bras|Coudes fixes'],
 ['curl-pupitre','Curl pupitre','Biceps','Barre EZ, pupitre','curl','Bras bien calés sur le pupitre|Amplitude complète sans verrouiller le coude|Charge modérée'],
 ['curl-poulie','Curl poulie basse','Biceps','Poulie','curl','Tension constante sur toute l\'amplitude|Coudes devant les côtes|Contrôle la remontée de la charge'],
 // Triceps
 ['pushdown','Extension triceps à la poulie','Triceps','Poulie haute','pushdown','Coudes collés au corps, ils ne bougent pas|Étends complètement les bras en bas|Remonte jusqu\'à ~90° au coude'],
 ['barre-front','Barre au front','Triceps','Barre EZ, banc','skull','Seuls les avant-bras bougent|Descends la barre vers le front ou derrière la tête|Charge modérée pour protéger les coudes'],
 ['ext-nuque','Extension triceps au-dessus de la tête','Triceps','Haltère ou corde','overtri','Coudes pointés vers le haut, proches des oreilles|Descends derrière la tête avec contrôle|Gaine les abdos pour ne pas cambrer'],
 ['dips-triceps','Dips (triceps)','Triceps','Barres parallèles ou banc','dip','Buste vertical, coudes serrés vers l\'arrière|Descends à ~90° au coude|Version sur banc possible pour débuter'],
 ['kickback','Kickback triceps','Triceps','Haltère','kick','Haut du bras collé au corps, parallèle au sol|Étends l\'avant-bras vers l\'arrière|Léger et propre'],
 ['pompes-diamant','Pompes prise serrée','Triceps','Poids du corps','pushup','Mains sous la poitrine, rapprochées|Coudes près du corps|Corps gainé'],
 // Jambes
 ['squat-barre','Squat (barre)','Jambes','Barre, rack','squat','Barre sur les trapèzes, regard droit devant|Genoux dans l\'axe des orteils|Descends au moins cuisses parallèles, talons au sol'],
 ['goblet','Goblet squat','Jambes','Haltère ou kettlebell','squat','Tiens la charge contre la poitrine|Buste droit, coudes entre les genoux en bas|Idéal pour apprendre le squat'],
 ['presse','Presse à cuisses','Jambes','Machine','legpress','Pieds à largeur d\'épaules, bas du dos plaqué|Descends jusqu\'à ~90° au genou|Ne verrouille pas les genoux en haut'],
 ['fentes','Fentes avant','Jambes','Haltères ou poids du corps','lunge','Grand pas en avant, buste droit|Genou arrière près du sol, genou avant au-dessus de la cheville|Pousse avec la jambe avant pour revenir'],
 ['fentes-bulgares','Fentes bulgares','Jambes','Banc, haltères','lunge','Pied arrière posé sur un banc|Descends à la verticale|Garde le poids sur la jambe avant'],
 ['leg-ext','Leg extension','Jambes','Machine','legext','Dos plaqué, extension complète sans à-coup|Pause 1 s en haut|Charge modérée pour ménager les genoux'],
 ['leg-curl','Leg curl','Jambes','Machine','legcurl','Hanches collées au siège|Ramène les talons vers les fessiers|Retour lent et contrôlé'],
 ['rdl','Soulevé de terre roumain','Jambes','Barre ou haltères','hinge','Jambes quasi tendues, hanches vers l\'arrière|Dos plat, la barre frôle les cuisses|Descends jusqu\'à l\'étirement des ischio-jambiers'],
 ['step-up','Step-up (montée sur banc)','Jambes','Banc, haltères','lunge','Pose tout le pied sur le banc|Monte en poussant sur la jambe d\'appui|Redescends lentement'],
 // Fessiers
 ['hip-thrust','Hip thrust','Fessiers','Barre, banc','thrust','Haut du dos sur le banc, menton rentré|Pousse les hanches jusqu\'à l\'alignement épaules-genoux|Serre fort les fessiers 1 s en haut'],
 ['pont','Pont fessier','Fessiers','Poids du corps','bridge','Pieds à plat, genoux fléchis|Monte les hanches en serrant les fessiers|Ne cambre pas excessivement le bas du dos'],
 ['fente-arriere','Fente arrière','Fessiers','Haltères ou poids du corps','lunge','Recule d\'un grand pas|Penche légèrement le buste vers l\'avant|Pousse avec la jambe avant pour revenir'],
 ['sumo','Soulevé de terre sumo','Fessiers','Barre','hinge','Pieds écartés, pointes vers l\'extérieur|Genoux dans l\'axe des pieds|Dos plat, pousse le sol avec les jambes'],
 ['good-morning','Good morning','Fessiers','Barre légère','hinge','Barre sur les trapèzes, genoux souples|Bascule le bassin vers l\'arrière, dos plat|Charge légère, technique avant tout'],
 // Abdos
 ['crunch','Crunch','Abdos','Poids du corps','crunch','Bas du dos au sol, décolle seulement les omoplates|Expire en montant|Ne tire pas sur la nuque'],
 ['leg-raise','Relevé de jambes','Abdos','Poids du corps','legraise','Dos plaqué au sol|Monte les jambes à la verticale, redescends sans toucher|Genoux fléchis si trop difficile'],
 ['planche','Planche (gainage)','Abdos','Poids du corps','plank','Corps aligné de la tête aux talons|Serre abdos et fessiers|Respire, tiens la durée indiquée',1],
 ['releve-genoux','Relevé de genoux suspendu','Abdos','Barre de traction','hang','Évite de te balancer|Remonte le bassin en t\'enroulant|Descends lentement'],
 ['russian','Russian twist','Abdos','Poids du corps ou disque','crunch','Buste incliné, dos droit|Tourne le buste, pas seulement les bras|Pieds au sol pour débuter'],
 // Mollets
 ['mollets-debout','Mollets debout','Mollets','Machine ou marche','calf','Monte sur la pointe des pieds au maximum|Pause en haut, étirement complet en bas|Mouvements lents'],
 ['mollets-assis','Mollets assis','Mollets','Machine','calf','Genoux à 90°|Amplitude maximale|Séries longues (12 à 20 répétitions)'],
 // Full body
 ['deadlift','Soulevé de terre','Full body','Barre','hinge','Barre près des jambes, dos plat|Pousse le sol avec les jambes puis étends les hanches|Verrouille debout, sans te pencher en arrière'],
 ['thruster','Thruster (squat + développé)','Full body','Haltères ou barre','thruster','Squat complet puis pousse la charge au-dessus de la tête|Utilise l\'élan des jambes|Respire à chaque répétition'],
 ['kb-swing','Kettlebell swing','Full body','Kettlebell','swing','Mouvement de charnière de hanches, pas un squat|Les bras guident, ce sont les hanches qui propulsent|Gaine les abdos en haut'],
 ['burpee','Burpee','Full body','Poids du corps','burpee','Pose les mains, recule les pieds, fais une pompe|Reviens et saute en l\'air|Garde un rythme régulier'],
 ['clean-press','Clean & press (haltères)','Full body','Haltères','cleanpress','Amène les haltères aux épaules en un seul mouvement|Utilise les jambes pour pousser au-dessus de la tête|Charge modérée, technique d\'abord'],
 ['farmer','Marche du fermier','Full body','Haltères lourds','farmer','Épaules basses, dos droit|Pas courts et réguliers|Serre fort les poignées',1],
 ['climber','Mountain climbers','Full body','Poids du corps','climber','Mains sous les épaules, corps gainé|Ramène les genoux en alternance|Garde les hanches basses',1],
];
const EX = RAW.map(r=>({id:r[0],name:r[1],group:r[2],equip:r[3],tpl:r[4],tips:r[5].split('|'),time:!!r[6]}));

/* ===== Séances types (45 à 60 min, objectif : corps fit et athlétique) =====
   [exercice, séries, répétitions (ou secondes), repos en secondes] */
const PROGRAMS = [
 {id:'fb-a',name:'Full body A',desc:'Séance complète, base du programme 3 jours / semaine.',ex:[['goblet',3,'10-12',90],['dev-couche-halt',3,'8-12',90],['rowing-halt',3,'10-12',75],['rdl',3,'10-12',90],['dev-epaules-halt',2,'10-12',60],['planche',3,'40',45]]},
 {id:'fb-b',name:'Full body B',desc:'Variante avec fentes, pompes et tirage vertical.',ex:[['fentes',3,'10-12',90],['pompes',3,'8-15',75],['tirage-vertical',3,'10-12',75],['hip-thrust',3,'10-12',90],['curl-halt',2,'12',60],['pushdown',2,'12',60],['leg-raise',3,'12',45]]},
 {id:'fb-c',name:'Full body C',desc:'Squat barre, développé incliné, tirage horizontal.',ex:[['squat-barre',3,'8-10',120],['dev-incline-halt',3,'8-12',90],['tirage-horizontal',3,'10-12',75],['elev-lat',3,'12-15',60],['leg-curl',3,'12',60],['crunch',3,'15',45]]},
 {id:'haut',name:'Haut du corps',desc:'Pecs, dos, épaules, bras — programme Haut/Bas sur 4 jours.',ex:[['dev-couche-barre',3,'8-10',90],['tirage-vertical',3,'8-12',90],['dev-militaire',3,'8-10',90],['rowing-barre',3,'8-12',90],['curl-halt',2,'10-12',60],['pushdown',2,'10-12',60],['elev-lat',2,'12-15',45]]},
 {id:'bas',name:'Bas du corps',desc:'Jambes, fessiers, mollets et gainage.',ex:[['squat-barre',4,'6-10',120],['rdl',3,'8-10',90],['fentes',3,'10',90],['leg-curl',3,'12',60],['mollets-debout',3,'12-15',45],['planche',3,'40',45]]},
 {id:'push',name:'Push (poussée)',desc:'Pectoraux, épaules, triceps.',ex:[['dev-couche-halt',3,'8-12',90],['dev-epaules-halt',3,'8-12',90],['dev-incline-halt',3,'10-12',75],['elev-lat',3,'12-15',60],['pushdown',3,'10-12',60]]},
 {id:'pull',name:'Pull (tirage)',desc:'Dos, arrière d\'épaule, biceps.',ex:[['tirage-vertical',3,'8-12',90],['rowing-halt',3,'10-12',75],['tirage-horizontal',3,'10-12',75],['face-pull',3,'12-15',60],['curl-barre',3,'10-12',60],['curl-marteau',2,'12',60]]},
 {id:'legs-core',name:'Jambes + abdos',desc:'Cuisses, fessiers, mollets et sangle abdominale.',ex:[['presse',3,'10-12',90],['fentes',3,'10',75],['leg-ext',3,'12',60],['hip-thrust',3,'10',90],['mollets-assis',3,'15',45],['leg-raise',3,'12',45],['planche',3,'40',45]]},
 {id:'circuit',name:'Circuit full body (dynamique)',desc:'Repos courts, cardio + force. Environ 45 min.',ex:[['thruster',3,'10',60],['kb-swing',3,'15',45],['pompes',3,'12',45],['rowing-halt',3,'12',45],['burpee',3,'10',60],['climber',3,'30',45]]},
];
