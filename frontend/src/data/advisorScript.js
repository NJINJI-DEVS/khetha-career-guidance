// Extracted from App.jsx (Stage 1 of the App.jsx split — see
// plans/nested-churning-hellman.md). Moved verbatim, no logic changes.

export const GREETING = {
  en: "Heita! I'm Khetha, your career mentor. Ask me about subjects, APS, funding or where to study. No question is a silly one, chommie.",
  zu: "Heita! NginguKhetha, umeluleki wakho. Buza ngezifundo, i-APS, imali yokufunda noma ukuthi ufundephi. Awukho umbuzo oyize.",
  tn: "Heita! Ke nna Khetha, mogakolodi wa gago. Mpotsa ka dithuto, APS, madi a thuto kgotsa kwa o ka ithutang teng.",
  af: "Heita! Ek is Khetha, jou loopbaanmentor. Vra my oor vakke, APS, befondsing of waar om te studeer.",
  xh: "Heita! NdinguKhetha, umcebisi wakho. Ndibuze ngezifundo, i-APS, inkxaso-mali okanye apho ungafunda khona.",
  st: "Heita! Ke nna Khetha, moeletsi wa hao. Mpotse ka dithuto, APS, tjhelete ya thuto kapa moo o ka ithutang teng.",
};

export const SCRIPTS = [
  {
    chip: "Can I study IT with Maths Lit?",
    match: ["maths lit", "maths literacy", "it with maths"],
    replies: {
      en: "Sharp sharp — straight answer. With Maths Literacy you are locked out of BSc Computer Science at Wits and every BEng; those want Pure Maths at 60%+. But the door is not closed. The Diploma in IT at TUT accepts Maths Literacy at 40%, and so does N4 IT at most TVET colleges. Plenty of working developers started exactly there and bridged into a degree afterwards. If you are still in Grade 9 though, take Pure Maths — it keeps everything open.",
      zu: "Sharp sharp — impendulo eqondile. Nge-Maths Literacy awukwazi ukwenza i-BSc Computer Science e-Wits nama-BEng; afuna i-Pure Maths ku-60%+. Kodwa umnyango awuvaliwe. I-Diploma in IT e-TUT yamukela i-Maths Literacy ku-40%. Uma usaku-Grade 9, thatha i-Pure Maths.",
      tn: "Sharp sharp — karabo e e tlhamaletseng. Ka Maths Literacy ga o kgone BSc Computer Science kwa Wits le di-BEng; di batla Pure Maths 60%+. Fela Diploma in IT kwa TUT e amogela Maths Literacy ka 40%. Fa o sa le mo Mophatong wa 9, tsaya Pure Maths.",
      af: "Reguit antwoord: met Wiskundige Geletterdheid is BSc Rekenaarwetenskap by Wits en enige BIng gesluit — dié vra Suiwer Wiskunde op 60%+. Die Diploma in IT by TUT aanvaar egter Wiskundige Geletterdheid op 40%. In graad 9 nog? Neem Suiwer Wiskunde.",
      xh: "Impendulo ethe ngqo: nge-Maths Literacy awukwazi i-BSc Computer Science e-Wits nayiphi na i-BEng. Kodwa i-Diploma in IT e-TUT yamkela i-Maths Literacy nge-40%. Usese kwibanga le-9? Thabatha i-Pure Maths.",
      st: "Karabo e otlolohileng: ka Maths Literacy ha o kgone BSc Computer Science Wits le BEng efe kapa efe. Empa Diploma in IT TUT e amohela Maths Literacy ka 40%. O ntse o le Kereiting ya 9? Nka Pure Maths.",
    },
  },
  {
    chip: "Am I eligible for NSFAS funding?",
    match: ["nsfas", "funding", "bursary", "imali", "madi"],
    replies: {
      en: "NSFAS covers South African citizens whose combined household income is R350 000 a year or less, or R600 000 if you have a disability. It pays tuition, registration, accommodation and a learning-material allowance at public universities and TVET colleges. You apply at nsfas.org.za between September and January, separately from your institution application. Get your ID, your parents' payslips or an affidavit, and your Grade 11 results ready now, bafethu.",
      zu: "I-NSFAS isiza izakhamuzi lapho umholo womndeni ungu-R350 000 ngonyaka noma ngaphansi (R600 000 uma unokukhubazeka). Ikhokhela imfundo, ukubhalisa, indawo yokuhlala nezincwadi. Ufaka isicelo ku-nsfas.org.za phakathi kukaSepthemba noJanuwari.",
      tn: "NSFAS e thusa baagi ba lotseno lwa lelapa le leng R350 000 ka ngwaga kgotsa kwa tlase (R600 000 fa o na le bogole). E duela thuto, kwadiso, bonno le dibuka. O dira kopo kwa nsfas.org.za magareng ga Lwetse le Ferikgong.",
      af: "NSFAS dek Suid-Afrikaanse burgers met 'n gesamentlike huishoudelike inkomste van R350 000 per jaar of minder (R600 000 met 'n gestremdheid). Dit betaal klasgeld, registrasie, verblyf en 'n studiemateriaal-toelae. Aansoeke by nsfas.org.za, September tot Januarie.",
      xh: "I-NSFAS ikhusela abemi abangeniso lwekhaya lungu-R350 000 ngonyaka okanye ngaphantsi (R600 000 ukuba unokhubazeko). Ihlawula imfundo, ubhaliso, indawo yokuhlala nezixhobo zokufunda. Ufaka isicelo kwa-nsfas.org.za.",
      st: "NSFAS e thusa baahi ba lekeno la lelapa le R350 000 ka selemo kapa ka tlase (R600 000 ha o na le bokooa). E lefa thuto, ngodiso, bodulo le dibuka. O etsa kopo ho nsfas.org.za.",
    },
  },
  {
    chip: "Show TVET trade options near me.",
    match: ["tvet", "trade", "artisan", "near me", "n4"],
    replies: {
      en: "In Gauteng you have strong options close to home. Ekurhuleni West TVET in Germiston runs N4–N6 Electrical Infrastructure Construction on rolling intake, NSFAS funded, Maths at 40% and you are in. South West Gauteng TVET in Soweto does N4–N6 Business Management. Tshwane North runs NCV Civil Engineering from Level 2, which you can start straight after Grade 9. A qualified artisan is earning while degree students are still in second year, and the country is short of them.",
      zu: "EGauteng unezinketho ezinhle eduze. I-Ekurhuleni West TVET eGermiston yenza i-N4–N6 Electrical Infrastructure Construction, ixhaswa yi-NSFAS, uMaths ku-40%. I-South West Gauteng TVET eSoweto yenza i-N4–N6 Business Management. I-Tshwane North yenza i-NCV Civil Engineering kusukela ku-Level 2.",
      tn: "Kwa Gauteng o na le ditlhopho gaufi le gae. Ekurhuleni West TVET e na le N4–N6 Electrical Infrastructure Construction, e tshegediwa ke NSFAS, Maths 40%. South West Gauteng TVET kwa Soweto e na le N4–N6 Business Management.",
      af: "In Gauteng is daar sterk opsies naby die huis. Ekurhuleni-Wes TVET in Germiston bied N4–N6 Elektriese Infrastruktuurkonstruksie, NSFAS-befonds, Wiskunde op 40%. Suidwes-Gauteng TVET in Soweto bied N4–N6 Bestuur.",
      xh: "EGauteng kukho ukhetho olulungileyo kufuphi nekhaya. I-Ekurhuleni West TVET eGermiston ineN4–N6 Electrical Infrastructure Construction, ixhaswa yiNSFAS, iMaths kwi-40%.",
      st: "Gauteng o na le dikgetho tse ntle haufi le lehae. Ekurhuleni West TVET Germiston e na le N4–N6 Electrical Infrastructure Construction, e tshehetswa ke NSFAS, Maths 40%.",
    },
  },
  {
    chip: "How is my APS calculated?",
    match: ["aps", "score", "points"],
    replies: {
      en: "Your APS adds the NSC levels of your best six subjects, leaving Life Orientation out. Each mark becomes a level: 80–100% is 7, 70–79% is 6, 60–69% is 5, 50–59% is 4, 40–49% is 3, 30–39% is 2. So 62% in Maths gives you 5 points, not 6 — that one band is often the gap between an offer and a waiting list. Open the APS calculator under Tools and drag a slider to see which qualifications unlock.",
      zu: "I-APS yakho yisamba samaleveli ezifundweni eziyisithupha ezinhle kunazo, ngaphandle kwe-Life Orientation. 80–100% ngu-7, 70–79% ngu-6, 60–69% ngu-5, 50–59% ngu-4, 40–49% ngu-3. Ngakho u-62% kuMaths ukunika amaphuzu angu-5.",
      tn: "APS ya gago e kopanya dikala tsa NSC tsa dithuto tse thataro tse di botoka, ntle le Life Orientation. 80–100% ke 7, 70–79% ke 6, 60–69% ke 5, 50–59% ke 4. Ka jalo 62% mo Maths e go naya dintlha tse 5.",
      af: "Jou APS tel die NSS-vlakke van jou beste ses vakke op, sonder Lewensoriëntering. 80–100% is 7, 70–79% is 6, 60–69% is 5, 50–59% is 4. Dus gee 62% in Wiskunde jou 5 punte, nie 6 nie.",
      xh: "I-APS yakho idibanisa amanqanaba e-NSC ezifundo zakho ezintandathu ezingcono, ngaphandle kwe-Life Orientation. 80–100% yi-7, 70–79% yi-6, 60–69% yi-5, 50–59% yi-4.",
      st: "APS ya hao e kopanya maemo a NSC a dithuto tse tsheletseng tse molemo, ntle le Life Orientation. 80–100% ke 7, 70–79% ke 6, 60–69% ke 5, 50–59% ke 4.",
    },
  },
  {
    chip: "Which subjects should I take in Grade 10?",
    match: ["grade 9", "subject choice", "what subjects", "grade 10"],
    replies: {
      en: "Sho — the biggest decision of your school career, and you make it at fifteen. Rule of thumb: your Grade 9 maths mark is the fork in the road. Above 60% and Pure Maths keeps engineering, computing and accounting open. Between 45% and 60%, be honest about whether you enjoy it — Pure Maths with a 40% in matric helps nobody. Below 45%, a commerce or technical package will serve you far better than a struggle. Run the Subject Chooser under Tools; it does this maths for you.",
      zu: "Sho — yisinqumo esikhulu kunazo zonke esikoleni, usenza useneminyaka engu-15. Imaki lakho lakwa-Maths ku-Grade 9 yilona elikhombisa indlela. Ngaphezu kuka-60%, i-Pure Maths igcina ubunjiniyela ne-accounting kuvulekile. Ngaphansi kuka-45%, iphakheji ye-commerce noma ye-technical izokusiza kakhulu.",
      tn: "Sho — tshwetso e kgolo ya sekolo sa gago. Maduo a gago a Maths mo Mophatong wa 9 ke tsela e e arogang. Godimo ga 60%, Pure Maths e bulela boenjiniere le accounting. Ka fa tlase ga 45%, phakheje ya commerce kgotsa technical e tla go thusa thata.",
      af: "Die grootste besluit van jou skoolloopbaan, op vyftien. Jou graad 9-wiskundepunt is die vurk in die pad. Bo 60% hou Suiwer Wiskunde ingenieurswese en rekeningkunde oop. Onder 45% dien 'n handels- of tegniese pakket jou beter.",
      xh: "Sesona sigqibo sikhulu sekhondo lakho lesikolo. Amanqaku akho eMaths kwibanga le-9 yindlela eyahlukanayo. Ngaphezulu kwe-60%, i-Pure Maths igcina ubunjineli bunikezelwe.",
      st: "Qeto e kgolo ka ho fetisisa ya sekolo sa hao. Matshwao a hao a Maths Kereiting ya 9 ke tsela e arohanang. Ka hodimo ho 60%, Pure Maths e bula boenjiniere le accounting.",
    },
  },
  {
    chip: "I did not qualify anywhere. What now?",
    match: ["did not qualify", "rejected", "failed", "what now", "no offer"],
    replies: {
      en: "First, breathe — this is not the end of the road, and it happens to thousands of learners every January. Three real routes: a second-chance matric programme to improve specific subjects, an NCV or N-course at a TVET college which you can start with what you already have, or a bridging or extended degree programme that adds a foundation year. None of them close a degree later. Call the Khetha helpline on 086 999 0123 and a practitioner will work through your actual results with you.",
      zu: "Okokuqala, phefumula — akupheli lapha, futhi kwenzeka kubafundi abayizinkulungwane njalo ngoJanuwari. Zintathu izindlela: uhlelo lokuphinda umatikuletsheni, i-NCV noma i-N-course e-TVET ongayiqala manje, noma uhlelo lwebhuloho. Shayela i-Khetha ku-086 999 0123.",
      tn: "Sa ntlha, hema — ga se bokhutlo, mme se diragalela baithuti ba dikete ngwaga mongwe le mongwe. Ditsela tse tharo: lenaneo la matriki la tshono ya bobedi, NCV kgotsa N-course kwa TVET, kgotsa lenaneo la borogo. Leletsa Khetha mo 086 999 0123.",
      af: "Eers, haal asem — dit is nie die einde nie. Drie roetes: 'n tweede-kans-matriekprogram, 'n NSV of N-kursus by 'n TVET-kollege, of 'n oorbruggings- of uitgebreide graadprogram. Bel die Khetha-hulplyn by 086 999 0123.",
      xh: "Okokuqala, phefumla — asisiso isiphelo sendlela. Iindlela ezintathu: inkqubo yethuba lesibini lebanga le-12, i-NCV okanye i-N-course e-TVET, okanye inkqubo yokwakha isiseko. Tsalela iKhetha ku-086 999 0123.",
      st: "Pele, hema — hase pheletso ya tsela. Ditsela tse tharo: lenaneo la matriki la monyetla wa bobedi, NCV kapa N-course TVET, kapa lenaneo la borokho. Letsetsa Khetha ho 086 999 0123.",
    },
  },
];

export const FALLBACK = {
  en: "I hear you. I can help most with five things: choosing Grade 10 subjects, working out your APS, finding careers that suit you, finding a course and provider, and NSFAS funding. Tap a chip below, or ask in your own words. If you would rather speak to a person, the Khetha helpline is 086 999 0123.",
  zu: "Ngiyakuzwa. Ngingakusiza ngezinto ezinhlanu: ukukhetha izifundo ze-Grade 10, ukubala i-APS, ukuthola imisebenzi ekufanele, ukuthola isifundo nendawo, kanye ne-NSFAS. Uma ufuna umuntu, shayela u-086 999 0123.",
  tn: "Ke a go utlwa. Ke ka go thusa ka dilo tse tlhano: go tlhopha dithuto tsa Mophato wa 10, go bala APS, go bona ditiro tse di go siametseng, go bona thuto le setheo, le NSFAS. Leletsa 086 999 0123.",
  af: "Ek hoor jou. Ek help die beste met vyf dinge: graad 10-vakke kies, jou APS bereken, loopbane vind wat jou pas, 'n kursus en instelling vind, en NSFAS-befondsing. Bel 086 999 0123.",
  xh: "Ndiyakuva. Ndinganceda ngezinto ezintlanu: ukukhetha izifundo zebanga le-10, ukubala i-APS, ukufumana imisebenzi ekulungeleyo, ukufumana isifundo neziko, kunye ne-NSFAS. Tsalela 086 999 0123.",
  st: "Kea o utlwa. Nka o thusa ka dintho tse hlano: ho kgetha dithuto tsa Kereiti ya 10, ho bala APS, ho fumana mesebetsi e o lokelang, ho fumana thuto le setsi, le NSFAS. Letsetsa 086 999 0123.",
};
