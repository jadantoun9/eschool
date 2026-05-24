const QB = [
  /* 1 */ {
    skill:'congruence_def', section:'A',
    fr:{text:'1. Deux triangles sont <strong>congruents</strong> lorsque :',
      opts:['Ils ont la même forme mais des tailles différentes','Tous leurs côtés et angles correspondants sont égaux','Ils ont au moins un angle égal','Leurs périmètres sont égaux'],
      correct:1,
      remed:{
        title:'❌ Définition de la congruence',
        explain:'<strong>Congruent ≠ semblable.</strong> Deux triangles congruents sont exactement superposables : même forme ET même taille. Tous les côtés correspondants sont égaux ET tous les angles correspondants sont égaux.',
        video:{label:'Vidéo de votre enseignant — Sens de la congruence',url:'https://www.youtube.com/watch?v=R0GCA2y6PDU'},
        video2:{label:'Khan Academy — Introduction aux triangles congruents',url:'https://www.youtube.com/watch?v=CJrVOf_3dN0'},
        followups:[
          {text:'Parmi ces affirmations, laquelle est vraie pour des triangles congruents ?',
           opts:['Mêmes angles mais côtés différents','Superposables exactement','Même périmètre suffit','Même aire suffit'],correct:1},
          {text:'△ABC ≅ △DEF signifie que :',
           opts:['Les triangles ont la même aire','AB=DE, BC=EF, CA=FD ET ∠A=∠D, ∠B=∠E, ∠C=∠F','Ils ont le même périmètre','Ils partagent un côté'],correct:1}
        ],
        retry:{text:'Pour prouver que deux triangles sont congruents, il faut :',
          opts:['Même forme seulement','Même taille seulement','Même forme ET même taille (superposables)','Même périmètre et même aire'],correct:2}
      }},
    en:{text:'1. Two triangles are <strong>congruent</strong> when:',
      opts:['Same shape but different sizes','All corresponding sides and angles are equal','They share at least one equal angle','Their perimeters are equal'],
      remed:{
        title:'❌ Definition of congruence',
        explain:'<strong>Congruent ≠ similar.</strong> Congruent triangles are exactly superimposable: same shape AND same size. All corresponding sides are equal AND all corresponding angles are equal.',
        video:{label:'Congruent triangles — full lesson',url:'https://www.youtube.com/watch?v=CJrVOf_3dN0'},
        followups:[
          {text:'Which statement is true for congruent triangles?',
           opts:['Same angles but different sides','Exactly superimposable','Same perimeter is enough','Same area is enough'],correct:1},
          {text:'△ABC ≅ △DEF means:',
           opts:['The triangles have the same area','AB=DE, BC=EF, CA=FD AND ∠A=∠D, ∠B=∠E, ∠C=∠F','They have the same perimeter','They share a side'],correct:1}
        ],
        retry:{text:'To prove two triangles are congruent you need:',
          opts:['Same shape only','Same size only','Same shape AND size (superimposable)','Same perimeter and area'],correct:2}
      }}
  },
  /* 2 */ {
    skill:'cote_inclus', section:'A',
    diagram:true,
    fr:{text:'2. Dans le triangle ABC, quel côté est <em>inclus</em> entre ∠B et ∠C ?',
      hint:'Le côté inclus relie les deux sommets dont on parle.',
      opts:['AB','AC','BC','Aucun'],
      correct:2,
      remed:{
        title:'❌ Côté inclus entre deux angles',
        explain:'Le <strong>côté inclus</strong> entre deux angles est le segment qui <em>relie directement</em> les deux sommets. Entre ∠B et ∠C, le côté inclus est BC car il va de B à C.',
        video:{label:'Vidéo de votre enseignant — La règle SAS',url:'https://www.youtube.com/watch?v=KykndAFAoe0'},
        video2:{label:'SAS Congruence Theorem — Explained clearly',url:'https://www.youtube.com/watch?v=frgapr9QYME'},
        followups:[
          {text:'Dans △PQR, quel côté est inclus entre ∠P et ∠Q ?',opts:['QR','PR','PQ','PQR'],correct:2},
          {text:'Entre ∠A et ∠C dans △ABC, le côté inclus est :',opts:['AB','AC','BC','Il n\'y en a pas'],correct:1}
        ],
        retry:{text:'Dans △XYZ, quel côté est inclus entre ∠X et ∠Z ?',
          opts:['XY','YZ','XZ','Aucun'],correct:2}
      }},
    en:{text:'2. In triangle ABC, which side is <em>included</em> between ∠B and ∠C?',
      hint:'The included side directly connects the two vertices mentioned.',
      opts:['AB','AC','BC','None'],
      remed:{
        title:'❌ Included side between two angles',
        explain:'The <strong>included side</strong> between two angles is the segment that <em>directly connects</em> the two vertices. Between ∠B and ∠C, the included side is BC.',
        video:{label:'Included side and included angle explained',url:'https://www.youtube.com/watch?v=frgapr9QYME'},
        followups:[
          {text:'In △PQR, which side is included between ∠P and ∠Q?',opts:['QR','PR','PQ','PQR'],correct:2},
          {text:'Between ∠A and ∠C in △ABC, the included side is:',opts:['AB','AC','BC','None'],correct:1}
        ],
        retry:{text:'In △XYZ, which side is included between ∠X and ∠Z?',
          opts:['XY','YZ','XZ','None'],correct:2}
      }}
  },
  /* 3 */ {
    skill:'angle_inclus', section:'A',
    fr:{text:'3. Quel angle est <em>inclus</em> entre les côtés PQ et PR dans △PQR ?',
      opts:['∠Q','∠R','∠P','∠PQR'],
      correct:2,
      remed:{
        title:'❌ Angle inclus entre deux côtés',
        explain:'L\'<strong>angle inclus</strong> entre deux côtés est l\'angle situé au sommet <em>commun</em> aux deux côtés. PQ et PR partagent le sommet P, donc l\'angle inclus est ∠P.',
        video:{label:'Vidéo de votre enseignant — La règle SAS',url:'https://www.youtube.com/watch?v=KykndAFAoe0'},
        video2:{label:'SAS Congruence Theorem — Explained clearly',url:'https://www.youtube.com/watch?v=frgapr9QYME'},
        followups:[
          {text:'Quel angle est inclus entre AB et AC dans △ABC ?',opts:['∠B','∠C','∠A','∠ABC'],correct:2},
          {text:'Dans △MNP, l\'angle inclus entre MN et MP est :',opts:['∠N','∠M','∠P','∠MNP'],correct:1}
        ],
        retry:{text:'Dans △DEF, quel angle est inclus entre DE et DF ?',
          opts:['∠E','∠F','∠D','∠EDF'],correct:2}
      }},
    en:{text:'3. Which angle is <em>included</em> between sides PQ and PR in △PQR?',
      opts:['∠Q','∠R','∠P','∠PQR'],
      remed:{
        title:'❌ Included angle between two sides',
        explain:'The <strong>included angle</strong> is at the <em>common vertex</em> of the two sides. PQ and PR share vertex P, so the included angle is ∠P.',
        video:{label:'Included angle SAS congruence explained',url:'https://www.youtube.com/watch?v=frgapr9QYME'},
        followups:[
          {text:'Which angle is included between AB and AC in △ABC?',opts:['∠B','∠C','∠A','∠ABC'],correct:2},
          {text:'In △MNP, the angle included between MN and MP is:',opts:['∠N','∠M','∠P','∠MNP'],correct:1}
        ],
        retry:{text:'In △DEF, which angle is included between DE and DF?',
          opts:['∠E','∠F','∠D','∠EDF'],correct:2}
      }}
  },
  /* 4 */ {
    skill:'angles_triangle', section:'A',
    fr:{text:'4. La somme des angles d\'un triangle est toujours égale à :',
      opts:['90°','180°','270°','360°'],
      correct:1,
      remed:{
        title:'❌ Somme des angles d\'un triangle',
        explain:'Dans tout triangle, la somme des trois angles intérieurs vaut <strong>180°</strong>. C\'est une propriété fondamentale de la géométrie euclidienne.',
        video:{label:'Khan Academy - Somme des angles triangle = 180 deg',url:'https://www.youtube.com/watch?v=6s1CI3uuhko'},
        followups:[
          {text:'Dans un triangle, ∠A=60° et ∠B=80°. Que vaut ∠C ?',opts:['30°','40°','50°','60°'],correct:1},
          {text:'Un triangle peut-il avoir deux angles obtus (>90°) ?',opts:['Oui toujours','Non jamais','Parfois','Seulement si isocèle'],correct:1}
        ],
        retry:{text:'Dans un triangle rectangle, les deux angles aigus totalisent :',
          opts:['90°','180°','45°','135°'],correct:0}
      }},
    en:{text:'4. The sum of angles in any triangle always equals:',
      opts:['90°','180°','270°','360°'],
      remed:{
        title:'❌ Triangle angle sum',
        explain:'In every triangle, the three interior angles always sum to <strong>180°</strong>. This is a fundamental property of Euclidean geometry.',
        video:{label:'Triangle angle sum 180 degrees proof',url:'https://www.youtube.com/watch?v=6s1CI3uuhko'},
        followups:[
          {text:'In a triangle, ∠A=60° and ∠B=80°. What is ∠C?',opts:['30°','40°','50°','60°'],correct:1},
          {text:'Can a triangle have two obtuse angles (>90°)?',opts:['Yes always','Never','Sometimes','Only if isosceles'],correct:1}
        ],
        retry:{text:'In a right triangle, the two acute angles together total:',
          opts:['90°','180°','45°','135°'],correct:0}
      }}
  },
  /* 5 */ {
    skill:'sas_def', section:'B',
    fr:{text:'5. Le postulat SAS (Côté–Angle–Côté) stipule que deux triangles sont congruents si :',
      opts:['Deux côtés et l\'angle <em>opposé</em> à l\'un d\'eux sont égaux','Deux côtés et l\'angle <em>inclus</em> entre eux sont égaux','Les trois côtés sont égaux deux à deux','Deux angles et un côté quelconque sont égaux'],
      correct:1,
      remed:{
        title:'❌ Définition du postulat SAS',
        explain:'SAS (Côté–Angle–Côté) exige que <strong>l\'angle soit inclus</strong> entre les deux côtés — c\'est-à-dire l\'angle formé par ces deux côtés au sommet commun. Un angle opposé ne suffit PAS (c\'est le piège SSA qui n\'est pas un critère valide).',
        video:{label:'Vidéo de votre enseignant — La règle SAS',url:'https://www.youtube.com/watch?v=KykndAFAoe0'},
        video2:{label:'CK12 — SAS Triangle Congruence Lesson',url:'https://www.youtube.com/watch?v=BXRwbhU4BL8'},
        followups:[
          {text:'SAS signifie que l\'angle doit être :',opts:['Opposé à l\'un des côtés','N\'importe où dans le triangle','Inclus entre les deux côtés donnés','Le plus grand angle'],correct:2},
          {text:'Quel critère correspond à : "deux côtés et l\'angle entre eux" ?',opts:['SSS','ASA','SAS','AAS'],correct:2}
        ],
        retry:{text:'Pour appliquer SAS, l\'angle égal doit être :',
          opts:['Le plus petit angle du triangle','Inclus (entre les deux côtés)','Opposé au plus grand côté','N\'importe quel angle'],correct:1}
      }},
    en:{text:'5. The SAS (Side–Angle–Side) postulate states that two triangles are congruent if:',
      opts:['Two sides and the angle <em>opposite</em> one of them are equal','Two sides and the angle <em>included</em> between them are equal','All three sides are pairwise equal','Two angles and any side are equal'],
      remed:{
        title:'❌ SAS postulate definition',
        explain:'SAS requires that the <strong>angle is included</strong> between the two sides — the angle formed by those two sides at their common vertex. An opposite angle does NOT suffice (SSA is not a valid congruence criterion).',
        video:{label:'SAS congruence postulate explained',url:'https://www.youtube.com/watch?v=BXRwbhU4BL8'},
        followups:[
          {text:'In SAS, the angle must be:',opts:['Opposite one of the sides','Anywhere in the triangle','Included between the two given sides','The largest angle'],correct:2},
          {text:'Which criterion matches "two sides and the angle between them"?',opts:['SSS','ASA','SAS','AAS'],correct:2}
        ],
        retry:{text:'To apply SAS, the equal angle must be:',
          opts:['The smallest angle','Included (between the two sides)','Opposite the longest side','Any angle'],correct:1}
      }}
  },
  /* 6 */ {
    skill:'sas_identify', section:'B',
    fr:{text:'6. Dans △ABC et △DEF : AB=DE, ∠B=∠E, BC=EF. Peut-on conclure △ABC ≅ △DEF par SAS ?',
      opts:['Oui — deux côtés et l\'angle inclus sont égaux','Non — il faut les trois côtés','Oui — mais seulement par SSS','Pas assez d\'informations'],
      correct:0,
      remed:{
        title:'❌ Reconnaître SAS',
        explain:'Vérifions : AB=DE (côté), ∠B=∠E (angle), BC=EF (côté). ∠B est-il inclus entre AB et BC ? Oui — c\'est l\'angle au sommet B entre les côtés BA et BC. <strong>C\'est bien SAS</strong>',
        video:{label:'Vidéo de votre enseignant — La règle SAS',url:'https://www.youtube.com/watch?v=KykndAFAoe0'},
        video2:{label:'SAS Congruence Theorem — Explained clearly',url:'https://www.youtube.com/watch?v=frgapr9QYME'},
        followups:[
          {text:'PQ=XY, ∠Q=∠Y, QR=YZ. Quel critère ?',opts:['SSS','SAS oui — ∠Q entre PQ et QR','SSA — invalide','ASA'],correct:1},
          {text:'Dans SAS, les deux côtés doivent :',opts:['Être les plus longs','Former l\'angle inclus (partager un sommet)','Être parallèles','Être égaux au troisième côté'],correct:1}
        ],
        retry:{text:'MN=PQ, ∠N=∠Q, NO=QR. Y a-t-il congruence SAS ?',
          opts:['Non — il faut un troisième côté','Oui — ∠N est inclus entre MN et NO','Non — ce serait ASA','Pas assez d\'informations'],correct:1}
      }},
    en:{text:'6. In △ABC and △DEF: AB=DE, ∠B=∠E, BC=EF. Can we say △ABC ≅ △DEF by SAS?',
      opts:['Yes — two sides and the included angle are equal','No — we need all three sides','Yes — but only by SSS','Not enough information'],
      remed:{
        title:'❌ Recognising SAS',
        explain:'Check: AB=DE (side), ∠B=∠E (angle), BC=EF (side). Is ∠B included between AB and BC? Yes — it is the angle at vertex B between sides BA and BC. <strong>This is SAS</strong>',
        video:{label:'Recognise SAS congruence practice',url:'https://www.youtube.com/watch?v=frgapr9QYME'},
        followups:[
          {text:'PQ=XY, ∠Q=∠Y, QR=YZ. Which criterion?',opts:['SSS','SAS — ∠Q is between PQ and QR','SSA — invalid','ASA'],correct:1},
          {text:'In SAS, the two sides must:',opts:['Be the longest','Form the included angle (share a vertex)','Be parallel','Equal the third side'],correct:1}
        ],
        retry:{text:'MN=PQ, ∠N=∠Q, NO=QR. Is there SAS congruence?',
          opts:['No — need a third side','Yes — ∠N is included between MN and NO','No — would be ASA','Not enough information'],correct:1}
      }}
  },
  /* 7 */ {
    skill:'sas_trap', section:'C',
    fr:{text:'7. Dans △PQR et △XYZ : PQ=XY, QR=YZ, ∠P=∠X. Est-ce SAS valide ?',
      hint:'Identifie soigneusement l\'angle inclus entre PQ et QR.',
      opts:['Oui — ∠P est inclus entre PQ et QR','Non — l\'angle inclus est ∠Q, pas ∠P','Oui — tout angle égal suffit','Non — il faut les 3 côtés'],
      correct:1,
      remed:{
        title:'❌ Piège classique SAS — angle non inclus',
        explain:'<strong>Attention !</strong> PQ et QR partagent le sommet Q, donc l\'angle inclus entre eux est <strong>∠Q</strong>, pas ∠P. Donner ∠P = ∠X correspond au critère SSA (côté–côté–angle opposé), qui n\'est PAS un critère valide de congruence.',
        video:{label:'Mario\'s Math Tutoring — SSS, SAS, ASA, AAS comparaison',url:'https://www.youtube.com/watch?v=tTTtSueRnu0'},
        video2:{label:'Vidéo de votre enseignant — La règle SAS',url:'https://www.youtube.com/watch?v=KykndAFAoe0'},
        followups:[
          {text:'AB=DE, BC=EF, ∠A=∠D. Est-ce SAS valide ?',opts:['Oui — deux côtés et un angle','Non — ∠A n\'est pas entre AB et BC ∠B l\'est','Oui — peu importe l\'angle','Oui si les triangles se ressemblent'],correct:1},
          {text:'Pour SAS avec les côtés RS et ST, l\'angle inclus est :',opts:['∠R','∠S','∠T','N\'importe lequel'],correct:1}
        ],
        retry:{text:'AC=DF, CB=FE, ∠B=∠E. Est-ce SAS ?',
          opts:['Oui — ∠B entre AC et CB','Non — l\'angle inclus entre CB et CA serait ∠C, pas ∠B','Oui toujours','Non — SSS seulement'],correct:1}
      }},
    en:{text:'7. In △PQR and △XYZ: PQ=XY, QR=YZ, ∠P=∠X. Is this valid SAS?',
      hint:'Carefully identify the included angle between PQ and QR.',
      opts:['Yes — ∠P is included between PQ and QR','No — the included angle is ∠Q, not ∠P','Yes — any equal angle works','No — need all 3 sides'],
      remed:{
        title:'❌ Classic SAS trap — non-included angle',
        explain:'<strong>Watch out!</strong> PQ and QR share vertex Q, so the included angle between them is <strong>∠Q</strong>, not ∠P. Giving ∠P = ∠X is the SSA pattern (side–side–opposite angle) which is NOT a valid congruence criterion.',
        video:{label:'SAS vs SSA trap congruence triangles',url:'https://www.youtube.com/watch?v=tTTtSueRnu0'},
        followups:[
          {text:'AB=DE, BC=EF, ∠A=∠D. Valid SAS?',opts:['Yes — two sides and an angle','No — ∠A is not between AB and BC ∠B is','Yes — angle position doesn\'t matter','Yes if triangles look alike'],correct:1},
          {text:'For SAS with sides RS and ST, the included angle is:',opts:['∠R','∠S','∠T','Any angle'],correct:1}
        ],
        retry:{text:'AC=DF, CB=FE, ∠B=∠E. Is this SAS?',
          opts:['Yes — ∠B between AC and CB','No — included angle between CB and CA is ∠C, not ∠B','Yes always','No — SSS only'],correct:1}
      }}
  },
  /* 8 */ {
    skill:'sas_apply_numbers', section:'C',
    fr:{text:'8. △ABC et △DEF : AC=DF=5 cm, ∠A=∠D=40°, AB=DE=7 cm. Ces triangles sont-ils congruents par SAS ?',
      opts:['Oui — ∠A inclus entre AC et AB','Non — il faut aussi BC=EF','Non — ∠C serait l\'angle inclus','Pas assez d\'informations'],
      correct:0,
      remed:{
        title:'❌ Application numérique SAS',
        explain:'AC=DF (côté), ∠A=∠D (angle au sommet A, entre AC et AB), AB=DE (côté). ∠A est bien l\'angle formé par les côtés AC et AB partant du sommet A → <strong>SAS est vérifié</strong>. Connaître BC=EF n\'est pas nécessaire.',
        video:{label:'Vidéo de votre enseignant — La règle SAS',url:'https://www.youtube.com/watch?v=KykndAFAoe0'},
        video2:{label:'CK12 — SAS Triangle Congruence Lesson',url:'https://www.youtube.com/watch?v=BXRwbhU4BL8'},
        followups:[
          {text:'GH=JK=4cm, ∠H=∠K=55°, HI=KL=6cm. SAS ?',opts:['Oui — ∠H entre GH et HI','Non — angles pas inclus','Oui — SSS aussi','Non — données insuffisantes'],correct:0},
          {text:'Dans SAS, une fois les 3 conditions vérifiées, peut-on déduire l\'égalité du 3ème côté ?',opts:['Non jamais','Oui — par SAS les triangles sont congruents donc tous leurs éléments sont égaux','Seulement si rectangle','Seulement par mesure'],correct:1}
        ],
        retry:{text:'△MNO et △PQR : MN=PQ=3cm, ∠N=∠Q=70°, NO=QR=5cm. Congruents par SAS ?',
          opts:['Oui — ∠N inclus entre MN et NO','Non — manque le 3ème côté','Non — SSA invalide','Pas d\'infos suffisantes'],correct:0}
      }},
    en:{text:'8. △ABC and △DEF: AC=DF=5 cm, ∠A=∠D=40°, AB=DE=7 cm. Congruent by SAS?',
      opts:['Yes — ∠A included between AC and AB','No — also need BC=EF','No — ∠C would be the included angle','Not enough information'],
      remed:{
        title:'❌ Numerical SAS application',
        explain:'AC=DF (side), ∠A=∠D (angle at vertex A, between AC and AB), AB=DE (side). ∠A is exactly the angle formed by sides AC and AB → <strong>SAS is satisfied</strong>.',
        video:{label:'SAS congruence numerical example worked',url:'https://www.youtube.com/watch?v=BXRwbhU4BL8'},
        followups:[
          {text:'GH=JK=4cm, ∠H=∠K=55°, HI=KL=6cm. SAS?',opts:['Yes — ∠H between GH and HI','No — angles not included','Yes — SSS too','No — insufficient data'],correct:0},
          {text:'Once SAS conditions are met, can we deduce the third side is also equal?',opts:['No never','Yes — congruent triangles have all elements equal','Only if right-angled','Only by measuring'],correct:1}
        ],
        retry:{text:'△MNO and △PQR: MN=PQ=3cm, ∠N=∠Q=70°, NO=QR=5cm. Congruent by SAS?',
          opts:['Yes — ∠N included between MN and NO','No — need third side','No — SSA invalid','Insufficient data'],correct:0}
      }}
  },
  /* 9 */ {
    skill:'sas_vs_other', section:'C',
    fr:{text:'9. On donne AB=DE, BC=EF, CA=FD. Quel critère utiliser ?',
      opts:['SAS','SSS','ASA','Aucun critère valide'],
      correct:1,
      remed:{
        title:'❌ Distinguer SSS de SAS',
        explain:'Quand les <strong>trois côtés</strong> sont donnés deux à deux, le critère est <strong>SSS</strong> (Côté–Côté–Côté), pas SAS. SAS nécessite deux côtés ET l\'angle inclus entre eux. Ici aucun angle n\'est mentionné.',
        video:{label:'Mario\'s Math Tutoring — SSS, SAS, ASA, AAS comparaison',url:'https://www.youtube.com/watch?v=tTTtSueRnu0'},
        video2:{label:'Vidéo de votre enseignant — La règle SAS',url:'https://www.youtube.com/watch?v=KykndAFAoe0'},
        followups:[
          {text:'Deux côtés et l\'angle inclus → quel critère ?',opts:['SSS','SAS','ASA','AAS'],correct:1},
          {text:'Trois paires de côtés égaux → quel critère ?',opts:['SAS','SSS','ASA','RHS'],correct:1}
        ],
        retry:{text:'On connaît ∠A=∠D, AB=DE, ∠B=∠E. Quel critère ?',
          opts:['SSS','SAS','ASA','AAS'],correct:2}
      }},
    en:{text:'9. Given AB=DE, BC=EF, CA=FD. Which criterion applies?',
      opts:['SAS','SSS','ASA','No valid criterion'],
      remed:{
        title:'❌ Distinguishing SSS from SAS',
        explain:'When <strong>all three sides</strong> are given pairwise, the criterion is <strong>SSS</strong> (Side–Side–Side), not SAS. SAS needs two sides AND the included angle. No angle is mentioned here.',
        video:{label:'SSS vs SAS vs ASA congruence comparison',url:'https://www.youtube.com/watch?v=KykndAFAoe0'},
        followups:[
          {text:'Two sides and the included angle → which criterion?',opts:['SSS','SAS','ASA','AAS'],correct:1},
          {text:'Three pairs of equal sides → which criterion?',opts:['SAS','SSS','ASA','RHS'],correct:1}
        ],
        retry:{text:'Known: ∠A=∠D, AB=DE, ∠B=∠E. Which criterion?',
          opts:['SSS','SAS','ASA','AAS'],correct:2}
      }}
  },
  /* 10 */ {
    skill:'sas_midpoint', section:'C',
    fr:{text:'10. M est le milieu de AC et de BD. Quelle paire peut être prouvée congruente par SAS ?',
      opts:['△ABM ≅ △CDM','△ABD ≅ △CBD','△ABC ≅ △BCD','Aucune des précédentes'],
      correct:0,
      remed:{
        title:'❌ SAS avec un point milieu',
        explain:'M milieu de AC → AM=MC. M milieu de BD → BM=MD. De plus, ∠AMB=∠CMD (angles opposés par le sommet = égaux). On a donc BM=MD, ∠AMB=∠CMD, AM=MC → <strong>△ABM ≅ △CDM par SAS</strong>',
        video:{label:'Geometry — SSS and SAS Proofs with midpoints',url:'https://www.youtube.com/watch?v=I5Ni6brMjnQ'},
        video2:{label:'Vidéo de votre enseignant — La règle SAS',url:'https://www.youtube.com/watch?v=KykndAFAoe0'},
        followups:[
          {text:'Pourquoi ∠AMB = ∠CMD ?',opts:['Angles correspondants','Angles alternes','Angles opposés par le sommet','Angles supplémentaires'],correct:2},
          {text:'M milieu de AC donne :',opts:['AC=MC','AM=MC','AM=2MC','AC=AM'],correct:1}
        ],
        retry:{text:'M milieu de EG et de FH. Quelle paire est congruente par SAS ?',
          opts:['△EFM ≅ △GHM','△EGH ≅ △GEF','△FGM ≅ △EHM','Aucune'],correct:0}
      }},
    en:{text:'10. M is the midpoint of AC and BD. Which pair can be proved congruent by SAS?',
      opts:['△ABM ≅ △CDM','△ABD ≅ △CBD','△ABC ≅ △BCD','None of the above'],
      remed:{
        title:'❌ SAS with a midpoint',
        explain:'M midpoint of AC → AM=MC. M midpoint of BD → BM=MD. Also ∠AMB=∠CMD (vertically opposite angles). So BM=MD, ∠AMB=∠CMD, AM=MC → <strong>△ABM ≅ △CDM by SAS</strong>',
        video:{label:'SAS congruence midpoint diagonals proof',url:'https://www.youtube.com/watch?v=I5Ni6brMjnQ'},
        followups:[
          {text:'Why is ∠AMB = ∠CMD?',opts:['Corresponding angles','Alternate angles','Vertically opposite angles','Supplementary angles'],correct:2},
          {text:'M midpoint of AC gives:',opts:['AC=MC','AM=MC','AM=2MC','AC=AM'],correct:1}
        ],
        retry:{text:'M midpoint of EG and FH. Which pair is congruent by SAS?',
          opts:['△EFM ≅ △GHM','△EGH ≅ △GEF','△FGM ≅ △EHM','None'],correct:0}
      }}
  },
  /* 11 */ {
    skill:'sas_parallel', section:'C',
    fr:{text:'11. AB ∥ CD et AB=CD. E est l\'intersection de AC et BD. Quel est le premier argument SAS pour △ABE ≅ △DCE ?',
      opts:['AB=DC (donné)','AE=CE (milieu)','∠A=∠D (alternes)','BE=DE (milieu)'],
      correct:0,
      remed:{
        title:'❌ SAS avec droites parallèles',
        explain:'Avec AB ∥ CD : les angles alternes-internes sont égaux ∠ABE=∠DCE et ∠BAE=∠CDE. De plus AB=DC est donné. Ces éléments permettent de construire la preuve SAS : <strong>AB=DC</strong>, <strong>∠ABE=∠DCE</strong>, puis montrer BE=CE ou utiliser un 2ème angle.',
        video:{label:'Geometry — SSS and SAS Proofs',url:'https://www.youtube.com/watch?v=I5Ni6brMjnQ'},
        video2:{label:'Vidéo de votre enseignant — La règle SAS',url:'https://www.youtube.com/watch?v=KykndAFAoe0'},
        followups:[
          {text:'Si AB ∥ CD, alors ∠BAE et ∠DCE sont :',opts:['Correspondants','Alternes-internes','Supplémentaires','Opposés par le sommet'],correct:1},
          {text:'AB=CD est utilisé dans la preuve SAS comme :',opts:['Un angle','Un côté','Une droite parallèle','Une propriété du milieu'],correct:1}
        ],
        retry:{text:'Dans la preuve de △ABE ≅ △DCE par SAS, le rôle de AB=DC est :',
          opts:['Premier côté de la paire SAS','L\'angle inclus','Le troisième côté','Rien'],correct:0}
      }},
    en:{text:'11. AB ∥ CD and AB=CD. E is the intersection of AC and BD. What is the first SAS argument for △ABE ≅ △DCE?',
      opts:['AB=DC (given)','AE=CE (midpoint)','∠A=∠D (alternate)','BE=DE (midpoint)'],
      remed:{
        title:'❌ SAS with parallel lines',
        explain:'With AB ∥ CD: alternate interior angles are equal ∠ABE=∠DCE and ∠BAE=∠CDE. Also AB=DC is given. These build the SAS proof: <strong>AB=DC</strong>, <strong>∠ABE=∠DCE</strong>, plus showing BE=CE.',
        video:{label:'Congruent triangles parallel lines proof SAS',url:'https://www.youtube.com/watch?v=I5Ni6brMjnQ'},
        followups:[
          {text:'If AB ∥ CD, then ∠BAE and ∠DCE are:',opts:['Corresponding','Alternate interior','Supplementary','Vertically opposite'],correct:1},
          {text:'AB=CD is used in the SAS proof as:',opts:['An angle','A side','A parallel line','A midpoint property'],correct:1}
        ],
        retry:{text:'In the proof △ABE ≅ △DCE by SAS, AB=DC serves as:',
          opts:['First side of the SAS pair','The included angle','The third side','Nothing'],correct:0}
      }}
  },
  /* 12 */ {
    skill:'sas_isocele', section:'C',
    fr:{text:'12. Dans le triangle isocèle △ABC avec AB=AC, H est le milieu de BC. Par SAS, on peut prouver :',
      opts:['△ABH ≅ △ACH','△ABH ≅ △BCH','△ABC ≅ △ACB','Aucune des précédentes'],
      correct:0,
      remed:{
        title:'❌ SAS dans un triangle isocèle',
        explain:'AB=AC (isocèle), BH=HC (H milieu de BC), AH est commun aux deux triangles. On a : AB=AC, BH=HC, AH=AH. C\'est SSS ! Pour SAS : AH=AH, ∠AHB=∠AHC=90° (médiatrice), BH=HC → <strong>△ABH ≅ △ACH par SAS</strong>',
        video:{label:'Khan Academy — Proving Triangle Congruence',url:'https://www.youtube.com/watch?v=Q8EtrFIHJuc'},
        video2:{label:'Vidéo de votre enseignant — La règle SAS',url:'https://www.youtube.com/watch?v=KykndAFAoe0'},
        followups:[
          {text:'Dans un triangle isocèle, la médiane du sommet principal est aussi :',opts:['Une hauteur seulement','La médiatrice de la base et une hauteur','Un côté','Un angle'],correct:1},
          {text:'BH=HC parce que H est :',opts:['Le centre du triangle','Le milieu de BC','Le pied de la hauteur','Le milieu de AB'],correct:1}
        ],
        retry:{text:'Dans △PQR isocèle PQ=PR, M milieu de QR. Par SAS, on prouve :',
          opts:['△PQM ≅ △PRM','△PQR ≅ △PRQ','△QMR ≅ △RMQ','Aucune'],correct:0}
      }},
    en:{text:'12. In isosceles △ABC with AB=AC, H is the midpoint of BC. By SAS we can prove:',
      opts:['△ABH ≅ △ACH','△ABH ≅ △BCH','△ABC ≅ △ACB','None of the above'],
      remed:{
        title:'❌ SAS in an isosceles triangle',
        explain:'AB=AC (isosceles), BH=HC (H midpoint of BC), AH is common. For SAS: AH=AH (shared side), ∠AHB=∠AHC=90° (perpendicular bisector property), BH=HC → <strong>△ABH ≅ △ACH by SAS</strong>',
        video:{label:'Isosceles triangle perpendicular bisector SAS proof',url:'https://www.youtube.com/watch?v=Q8EtrFIHJuc'},
        followups:[
          {text:'In an isosceles triangle, the median from the apex is also:',opts:['A height only','The perpendicular bisector and altitude','A side','An angle'],correct:1},
          {text:'BH=HC because H is:',opts:['The centroid','The midpoint of BC','The foot of altitude','The midpoint of AB'],correct:1}
        ],
        retry:{text:'In isosceles △PQR PQ=PR, M midpoint of QR. By SAS we prove:',
          opts:['△PQM ≅ △PRM','△PQR ≅ △PRQ','△QMR ≅ △RMQ','None'],correct:0}
      }}
  },
  /* 13 */ {
    skill:'sas_why', section:'C',
    fr:{text:'13. Pourquoi SAS <em>garantit</em>-il la congruence ? Parce que si l\'on fixe deux côtés et l\'angle entre eux :',
      opts:['On peut construire plusieurs triangles différents','On ne peut construire qu\'un seul triangle (aux déplacements près)','On peut agrandir le triangle librement','Les angles restants peuvent varier'],
      correct:1,
      remed:{
        title:'❌ Pourquoi SAS fonctionne',
        explain:'Si tu fixes deux côtés d\'une longueur donnée avec un angle précis entre eux, le troisième sommet est <strong>uniquement déterminé</strong> — il n\'y a qu\'une seule façon de fermer le triangle. C\'est pourquoi SAS garantit la congruence.',
        video:{label:'Khan Academy — Proving SAS using transformations',url:'https://www.youtube.com/watch?v=CMTeCNILzwU'},
        video2:{label:'Vidéo de votre enseignant — La règle SAS',url:'https://www.youtube.com/watch?v=KykndAFAoe0'},
        followups:[
          {text:'Si on fixe AB=5cm, ∠A=60°, AC=7cm, combien de triangles ABC différents peut-on construire ?',opts:['Plusieurs selon ∠B','Un seul','Infiniment','Cela dépend de BC'],correct:1},
          {text:'Le critère SSA (deux côtés et l\'angle opposé) ne garantit pas la congruence car :',opts:['Les côtés peuvent être inégaux','Deux triangles différents peuvent satisfaire ces conditions','L\'angle peut être obtus','Les triangles seront toujours isocèles'],correct:1}
        ],
        retry:{text:'SAS garantit l\'unicité du triangle car une fois deux côtés et l\'angle inclus fixés :',
          opts:['Le troisième côté est libre','Les autres angles peuvent varier','L\'ensemble du triangle est déterminé de façon unique','On peut modifier la forme'],correct:2}
      }},
    en:{text:'13. Why does SAS <em>guarantee</em> congruence? Because if you fix two sides and the included angle:',
      opts:['You can build several different triangles','Only one triangle can be constructed (up to rigid motions)','The triangle can be freely enlarged','The remaining angles can vary'],
      remed:{
        title:'❌ Why SAS works',
        explain:'If you fix two sides of given length with a precise angle between them, the third vertex is <strong>uniquely determined</strong> — there is only one way to close the triangle. That is why SAS guarantees congruence.',
        video:{label:'Why SAS guarantees congruence intuitive explanation',url:'https://www.youtube.com/watch?v=CMTeCNILzwU'},
        followups:[
          {text:'If AB=5cm, ∠A=60°, AC=7cm, how many different triangles ABC exist?',opts:['Several depending on ∠B','Exactly one','Infinitely many','Depends on BC'],correct:1},
          {text:'SSA (two sides and the opposite angle) doesn\'t guarantee congruence because:',opts:['Sides may be unequal','Two different triangles can satisfy these conditions','The angle can be obtuse','Triangles will always be isosceles'],correct:1}
        ],
        retry:{text:'SAS guarantees triangle uniqueness because once two sides and the included angle are fixed:',
          opts:['The third side is free','Other angles can vary','The entire triangle is uniquely determined','The shape can be modified'],correct:2}
      }}
  },
  /* 14 */ {
    skill:'congruence_consequences', section:'C',
    fr:{text:'14. Si △ABC ≅ △DEF par SAS, que peut-on déduire sur BC et EF ?',
      opts:['Rien — on n\'a que deux côtés','BC = EF (triangles congruents → tous éléments égaux)','BC ∥ EF','BC = DE'],
      correct:1,
      remed:{
        title:'❌ Conséquences de la congruence',
        explain:'La congruence est une relation totale : si △ABC ≅ △DEF, alors <strong>TOUS</strong> les côtés et angles correspondants sont égaux. On déduit donc AB=DE, BC=EF, CA=FD, ∠A=∠D, ∠B=∠E, ∠C=∠F.',
        video:{label:'Vidéo de votre enseignant — Sens de la congruence',url:'https://www.youtube.com/watch?v=R0GCA2y6PDU'},
        video2:{label:'Organic Chemistry Tutor — CPCTC Proofs',url:'https://www.youtube.com/watch?v=eq1frp_ZyP8'},
        followups:[
          {text:'△PQR ≅ △XYZ. Que vaut ∠R ?',opts:['Inconnu','∠R = ∠Z','∠R = ∠X','∠R = 60°'],correct:1},
          {text:'CPCTC signifie :',opts:['Tous les côtés sont égaux','Corresponding Parts of Congruent Triangles are Congruent','Seuls les angles sont égaux','Côté-Périmètre-Côté-Triangle-Côté'],correct:1}
        ],
        retry:{text:'△ABC ≅ △PQR avec A↔P, B↔Q, C↔R. Que peut-on affirmer ?',
          opts:['AB=PQ et ∠B=∠Q et CA=RP (et tous autres éléments)','Seulement AB=PQ','Seulement les angles','Rien de plus que SAS'],correct:0}
      }},
    en:{text:'14. If △ABC ≅ △DEF by SAS, what can we deduce about BC and EF?',
      opts:['Nothing — we only have two sides','BC = EF (congruent triangles → all parts equal)','BC ∥ EF','BC = DE'],
      remed:{
        title:'❌ Consequences of congruence',
        explain:'Congruence is total: if △ABC ≅ △DEF, then <strong>ALL</strong> corresponding sides and angles are equal: AB=DE, BC=EF, CA=FD, ∠A=∠D, ∠B=∠E, ∠C=∠F.',
        video:{label:'Congruence consequences CPCTC corresponding parts',url:'https://www.youtube.com/watch?v=eq1frp_ZyP8'},
        followups:[
          {text:'△PQR ≅ △XYZ. What is ∠R?',opts:['Unknown','∠R = ∠Z','∠R = ∠X','∠R = 60°'],correct:1},
          {text:'CPCTC stands for:',opts:['All sides are equal','Corresponding Parts of Congruent Triangles are Congruent','Only angles are equal','Congruent Perimeter Theorem'],correct:1}
        ],
        retry:{text:'△ABC ≅ △PQR with A↔P, B↔Q, C↔R. What can be stated?',
          opts:['AB=PQ and ∠B=∠Q and CA=RP (and all other elements)','Only AB=PQ','Only angles','Nothing beyond SAS'],correct:0}
      }}
  },
  /* 15 */ {
    skill:'sas_proof_step', section:'D',
    fr:{text:'15. Pour démontrer △ABM ≅ △CDM (M milieu de AC et BD), quelle est la bonne séquence SAS ?',
      opts:['AM=CM, ∠AMB=∠CMD, BM=DM','AB=CD, ∠A=∠C, AM=CM','BM=DM, AB=CD, ∠B=∠D','∠A=∠C, AM=CM, ∠M=∠M'],
      correct:0,
      remed:{
        title:'❌ Séquence de preuve SAS',
        explain:'La séquence SAS doit présenter : <strong>côté, angle inclus, côté</strong> — dans cet ordre, et l\'angle doit être <em>entre</em> les deux côtés. AM=CM (M milieu de AC), ∠AMB=∠CMD (angles OPS = opposés par sommet), BM=DM (M milieu de BD) → SAS',
        video:{label:'Geometry — SSS and SAS Proofs',url:'https://www.youtube.com/watch?v=I5Ni6brMjnQ'},
        video2:{label:'Vidéo de votre enseignant — La règle SAS',url:'https://www.youtube.com/watch?v=KykndAFAoe0'},
        followups:[
          {text:'Dans la séquence SAS, l\'angle doit apparaître :',opts:['En premier','En dernier','Entre les deux côtés','N\'importe où'],correct:2},
          {text:'Angles opposés par le sommet sont :',opts:['Complémentaires','Supplémentaires','Égaux','Perpendiculaires'],correct:2}
        ],
        retry:{text:'Pour une démonstration SAS, parmi ces séquences, laquelle est correcte ?',
          opts:['côté, côté, angle','angle, côté, côté','côté, angle inclus, côté','angle, angle, côté'],correct:2}
      }},
    en:{text:'15. To prove △ABM ≅ △CDM (M midpoint of AC and BD), what is the correct SAS sequence?',
      opts:['AM=CM, ∠AMB=∠CMD, BM=DM','AB=CD, ∠A=∠C, AM=CM','BM=DM, AB=CD, ∠B=∠D','∠A=∠C, AM=CM, ∠M=∠M'],
      remed:{
        title:'❌ SAS proof sequence',
        explain:'The SAS sequence must show: <strong>side, included angle, side</strong> — in order, with the angle between the two sides. AM=CM (M midpoint of AC), ∠AMB=∠CMD (vertically opposite angles), BM=DM (M midpoint of BD) → SAS',
        video:{label:'Writing a SAS proof step by step method',url:'https://www.youtube.com/watch?v=I5Ni6brMjnQ'},
        followups:[
          {text:'In the SAS sequence, the angle must appear:',opts:['First','Last','Between the two sides','Anywhere'],correct:2},
          {text:'Vertically opposite angles are:',opts:['Complementary','Supplementary','Equal','Perpendicular'],correct:2}
        ],
        retry:{text:'For a SAS proof, which sequence is correct?',
          opts:['side, side, angle','angle, side, side','side, included angle, side','angle, angle, side'],correct:2}
      }}
  },
  /* 16 */ {
    skill:'sas_notation', section:'D',
    fr:{text:'16. On écrit △ABC ≅ △DEF. Qu\'implique l\'ordre des lettres ?',
      opts:['Rien — c\'est juste une convention','A correspond à D, B à E, C à F — et les côtés/angles correspondants sont égaux','Les triangles ont le même sens de rotation','Les sommets sont dans l\'ordre alphabétique'],
      correct:1,
      remed:{
        title:'❌ Notation de la congruence — ordre des sommets',
        explain:'L\'ordre des lettres dans △ABC ≅ △DEF est <strong>crucial</strong> : il indique la correspondance des sommets. A↔D, B↔E, C↔F. Donc AB=DE, BC=EF, CA=FD, ∠A=∠D, ∠B=∠E, ∠C=∠F.',
        video:{label:'Vidéo de votre enseignant — Sens de la congruence',url:'https://www.youtube.com/watch?v=R0GCA2y6PDU'},
        video2:{label:'Khan Academy — Introduction aux triangles congruents',url:'https://www.youtube.com/watch?v=CJrVOf_3dN0'},
        followups:[
          {text:'△PQR ≅ △MNO. Quel côté correspond à PQ ?',opts:['NO','MN','MO','QR'],correct:1},
          {text:'△ABC ≅ △DEF. Quel angle correspond à ∠C ?',opts:['∠D','∠E','∠F','∠B'],correct:2}
        ],
        retry:{text:'Dans △RST ≅ △UVW, à quoi correspond le côté ST ?',
          opts:['UV','UW','VW','RS'],correct:2}
      }},
    en:{text:'16. Writing △ABC ≅ △DEF implies what about the letter order?',
      opts:['Nothing — just a convention','A corresponds to D, B to E, C to F — corresponding sides/angles are equal','Triangles have the same orientation','Vertices are in alphabetical order'],
      remed:{
        title:'❌ Congruence notation — vertex order',
        explain:'The letter order in △ABC ≅ △DEF is <strong>crucial</strong>: it indicates vertex correspondence. A↔D, B↔E, C↔F. So AB=DE, BC=EF, CA=FD, ∠A=∠D, ∠B=∠E, ∠C=∠F.',
        video:{label:'Congruence notation vertex order correspondence',url:'https://www.youtube.com/watch?v=CJrVOf_3dN0'},
        followups:[
          {text:'△PQR ≅ △MNO. Which side corresponds to PQ?',opts:['NO','MN','MO','QR'],correct:1},
          {text:'△ABC ≅ △DEF. Which angle corresponds to ∠C?',opts:['∠D','∠E','∠F','∠B'],correct:2}
        ],
        retry:{text:'In △RST ≅ △UVW, what corresponds to side ST?',
          opts:['UV','UW','VW','RS'],correct:2}
      }}
  },
  /* 17 */ {
    skill:'sas_coordinate', section:'D',
    fr:{text:'17. A(0,0), B(4,0), C(4,3) et D(0,0), E(4,0), F(4,3). Ces triangles sont-ils congruents ?',
      opts:['Non — points différents','Oui — mêmes coordonnées donc identiques','Non — il faut vérifier SAS','Impossible à déterminer sans mesure'],
      correct:1,
      remed:{
        title:'❌ Congruence en géométrie analytique',
        explain:'Les triangles ABC et DEF ont exactement les mêmes sommets A=D, B=E, C=F → ils sont <strong>identiques</strong>, donc évidemment congruents. En général, pour prouver la congruence par SAS en coord., on calcule les longueurs des côtés (formule distance) et les angles.',
        video:{label:'Khan Academy — Proving Triangle Congruence',url:'https://www.youtube.com/watch?v=Q8EtrFIHJuc'},
        video2:{label:'Vidéo de votre enseignant — La règle SAS',url:'https://www.youtube.com/watch?v=KykndAFAoe0'},
        followups:[
          {text:'Formule de la distance entre A(x₁,y₁) et B(x₂,y₂) :',opts:['(x₂-x₁)+(y₂-y₁)','√((x₂-x₁)²+(y₂-y₁)²)','(x₂-x₁)²+(y₂-y₁)²','|x₂-x₁|×|y₂-y₁|'],correct:1},
          {text:'P(1,2), Q(4,6). Longueur PQ ?',opts:['3','4','5','7'],correct:2}
        ],
        retry:{text:'A(0,0), B(3,0), C(0,4) et D(1,1), E(4,1), F(1,5). Sont-ils congruents ?',
          opts:['Non — positions différentes','Oui — mêmes dimensions AB=DE=3, AC=DF=4','Non — il faut les angles','Impossible à dire'],correct:1}
      }},
    en:{text:'17. A(0,0), B(4,0), C(4,3) and D(0,0), E(4,0), F(4,3). Are these triangles congruent?',
      opts:['No — different points','Yes — same coordinates so identical','No — need to check SAS','Impossible without measuring'],
      remed:{
        title:'❌ Congruence in coordinate geometry',
        explain:'Triangles ABC and DEF have exactly the same vertices A=D, B=E, C=F → they are <strong>identical</strong>, hence congruent. In general, to prove SAS in coordinates, compute side lengths (distance formula) and angles.',
        video:{label:'Congruent triangles coordinate geometry proof',url:'https://www.youtube.com/watch?v=Q8EtrFIHJuc'},
        followups:[
          {text:'Distance formula between A(x₁,y₁) and B(x₂,y₂):',opts:['(x₂-x₁)+(y₂-y₁)','√((x₂-x₁)²+(y₂-y₁)²)','(x₂-x₁)²+(y₂-y₁)²','|x₂-x₁|×|y₂-y₁|'],correct:1},
          {text:'P(1,2), Q(4,6). Length PQ?',opts:['3','4','5','7'],correct:2}
        ],
        retry:{text:'A(0,0),B(3,0),C(0,4) and D(1,1),E(4,1),F(1,5). Congruent?',
          opts:['No — different positions','Yes — same dimensions AB=DE=3, AC=DF=4','No — need angles','Cannot say'],correct:1}
      }}
  },
  /* 18 */ {
    skill:'sas_real_world', section:'D',
    fr:{text:'18. Un ébéniste coupe deux pièces de bois : chacune mesure 30 cm, 50 cm avec un angle de 45° entre elles. Les pièces sont-elles interchangeables (congruentes) ?',
      opts:['Non — le bois peut varier','Oui — par SAS : même deux côtés et angle inclus','Peut-être — selon le troisième côté','Non — il faut les trois mesures'],
      correct:1,
      remed:{
        title:'❌ SAS dans la vie réelle',
        explain:'SAS s\'applique directement : deux pièces avec les <strong>mêmes deux longueurs et le même angle entre elles</strong> produisent des triangles identiques. C\'est pourquoi SAS a une importance pratique en menuiserie, architecture et ingénierie.',
        video:{label:'Vidéo de votre enseignant — La règle SAS',url:'https://www.youtube.com/watch?v=KykndAFAoe0'},
        video2:{label:'SAS Congruence Theorem — Explained clearly',url:'https://www.youtube.com/watch?v=frgapr9QYME'},
        followups:[
          {text:'Un architecte dessine deux fermes de toit : même deux poutres et même angle d\'inclinaison. Sont-elles congruentes ?',opts:['Non — tout dépend de la troisième poutre','Oui — par SAS','Peut-être','Seulement si même matériau'],correct:1},
          {text:'Dans quel domaine SAS est-il particulièrement utile ?',opts:['Chimie','Musique','Construction et ingénierie','Biologie'],correct:2}
        ],
        retry:{text:'Deux triangles métalliques : côtés 20cm et 35cm avec 60° entre eux (identiques pour les deux). Sont-ils congruents ?',
          opts:['Non — métal différent','Oui — SAS garantit la congruence','Peut-être — selon le poids','Non — mesurer le 3ème côté'],correct:1}
      }},
    en:{text:'18. A carpenter cuts two pieces: each 30cm and 50cm with a 45° angle between them. Are the pieces interchangeable (congruent)?',
      opts:['No — wood can vary','Yes — by SAS: same two sides and included angle','Maybe — depends on the third side','No — need all three measurements'],
      remed:{
        title:'❌ SAS in real life',
        explain:'SAS applies directly: two pieces with the <strong>same two lengths and same angle between them</strong> produce identical triangles. This is why SAS matters in carpentry, architecture and engineering.',
        video:{label:'SAS congruence real world applications geometry',url:'https://www.youtube.com/watch?v=frgapr9QYME'},
        followups:[
          {text:'An architect draws two roof trusses: same two beams and same angle. Are they congruent?',opts:['No — depends on third beam','Yes — by SAS','Maybe','Only if same material'],correct:1},
          {text:'In which field is SAS particularly useful?',opts:['Chemistry','Music','Construction and engineering','Biology'],correct:2}
        ],
        retry:{text:'Two metal triangles: sides 20cm and 35cm with 60° between (identical for both). Congruent?',
          opts:['No — different metal','Yes — SAS guarantees congruence','Maybe — depends on weight','No — measure third side'],correct:1}
      }}
  },
  /* 19 */ {
    skill:'sas_choose_criterion', section:'D',
    fr:{text:'19. Tu connais ∠A=∠D, AB=DE, ∠B=∠E dans deux triangles. Quel est le bon critère ?',
      opts:['SAS','SSS','ASA','AAS'],
      correct:2,
      remed:{
        title:'❌ Choisir le bon critère de congruence',
        explain:'∠A=∠D (angle), AB=DE (côté entre les deux angles), ∠B=∠E (angle) → c\'est <strong>Angle–Côté–Angle ASA</strong>, pas SAS. Pour SAS il faudrait : côté, <em>angle inclus</em>, côté.',
        video:{label:'Mario\'s Math Tutoring — SSS, SAS, ASA, AAS comparaison',url:'https://www.youtube.com/watch?v=tTTtSueRnu0'},
        video2:{label:'Vidéo de votre enseignant — La règle SAS',url:'https://www.youtube.com/watch?v=KykndAFAoe0'},
        followups:[
          {text:'Deux côtés et l\'angle entre eux → ?',opts:['ASA','SAS','SSS','AAS'],correct:1},
          {text:'Deux angles et le côté entre eux → ?',opts:['SAS','SSS','ASA','AAS'],correct:2}
        ],
        retry:{text:'AB=DE, BC=EF, ∠B=∠E ∠B est entre AB et BC. Quel critère ?',
          opts:['ASA','SSS','SAS','AAS'],correct:2}
      }},
    en:{text:'19. You know ∠A=∠D, AB=DE, ∠B=∠E in two triangles. Which criterion applies?',
      opts:['SAS','SSS','ASA','AAS'],
      remed:{
        title:'❌ Choosing the right congruence criterion',
        explain:'∠A=∠D (angle), AB=DE (side between the two angles), ∠B=∠E (angle) → this is <strong>Angle–Side–Angle ASA</strong>, not SAS. For SAS you need: side, <em>included angle</em>, side.',
        video:{label:'Choosing congruence criterion SSS SAS ASA AAS comparison',url:'https://www.youtube.com/watch?v=tTTtSueRnu0'},
        followups:[
          {text:'Two sides and the angle between them → ?',opts:['ASA','SAS','SSS','AAS'],correct:1},
          {text:'Two angles and the side between them → ?',opts:['SAS','SSS','ASA','AAS'],correct:2}
        ],
        retry:{text:'AB=DE, BC=EF, ∠B=∠E ∠B is between AB and BC. Which criterion?',
          opts:['ASA','SSS','SAS','AAS'],correct:2}
      }}
  },
  /* 20 */ {
    skill:'sas_advanced_proof', section:'D',
    fr:{text:'20. Dans un parallélogramme ABCD, la diagonale AC est tracée. Par SAS ou un autre critère, △ABC et △CDA sont-ils congruents ?',
      opts:['Non — les diagonales ne suffisent pas','Oui — par SSS : AB=CD, BC=DA, AC=CA','Oui — par SAS uniquement','On ne peut pas conclure'],
      correct:1,
      remed:{
        title:'❌ Congruence dans un parallélogramme',
        explain:'Dans un parallélogramme : AB=CD et BC=DA (côtés opposés égaux) et AC=CA (côté commun). Donc <strong>△ABC ≅ △CDA par SSS</strong>. On pourrait aussi utiliser SAS en utilisant les angles formés par la diagonale avec les côtés (angles alternes).',
        video:{label:'Geometry — SSS and SAS Proofs',url:'https://www.youtube.com/watch?v=I5Ni6brMjnQ'},
        video2:{label:'Vidéo de votre enseignant — La règle SAS',url:'https://www.youtube.com/watch?v=KykndAFAoe0'},
        followups:[
          {text:'Dans un parallélogramme, les côtés opposés sont :',opts:['Perpendiculaires','Égaux et parallèles','Inégaux','Seulement parallèles'],correct:1},
          {text:'AC=CA est justifié par :',opts:['SAS','Côté commun (réflexivité)','SSS','Parallélisme'],correct:1}
        ],
        retry:{text:'Dans le parallélogramme PQRS, la diagonale PR est tracée. △PQR ≅ △RSP par :',
          opts:['AAS','SAS','SSS — PQ=RS, QR=SP, PR=PR','ASA'],correct:2}
      }},
    en:{text:'20. In parallelogram ABCD, diagonal AC is drawn. Are △ABC and △CDA congruent?',
      opts:['No — diagonals are not enough','Yes — by SSS: AB=CD, BC=DA, AC=CA','Yes — by SAS only','Cannot conclude'],
      remed:{
        title:'❌ Congruence in a parallelogram',
        explain:'In a parallelogram: AB=CD and BC=DA (opposite sides equal) and AC=CA (shared side). So <strong>△ABC ≅ △CDA by SSS</strong>. SAS could also be used with alternate angles formed by the diagonal.',
        video:{label:'Congruence triangles parallelogram diagonal proof SSS SAS',url:'https://www.youtube.com/watch?v=I5Ni6brMjnQ'},
        followups:[
          {text:'In a parallelogram, opposite sides are:',opts:['Perpendicular','Equal and parallel','Unequal','Only parallel'],correct:1},
          {text:'AC=CA is justified by:',opts:['SAS','Shared side (reflexive property)','SSS','Parallelism'],correct:1}
        ],
        retry:{text:'In parallelogram PQRS, diagonal PR is drawn. △PQR ≅ △RSP by:',
          opts:['AAS','SAS','SSS — PQ=RS, QR=SP, PR=PR','ASA'],correct:2}
      }}
  }
];
export default QB;
