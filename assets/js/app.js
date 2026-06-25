const $=(s,n=document)=>n.querySelector(s), $$=(s,n=document)=>[...n.querySelectorAll(s)];
const main=$('#main'), fallbackImage='https://placehold.co/1200x675/252525/ffffff?text=NetraNews';
const API_ORIGIN=location.port==='8080'?location.origin:'http://localhost:8080';
const articleImages={
  'राजनीति':'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
  'देश':'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1200&q=80',
  'खेल':'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
  'टेक्नोलॉजी':'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
  'बिज़नेस':'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
  'दुनिया':'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80',
  'मनोरंजन':'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80'
};
const state={user:JSON.parse(localStorage.getItem('nn_user')||'null'),bookmarks:JSON.parse(localStorage.getItem('nn_bookmarks')||'[]'),interests:JSON.parse(localStorage.getItem('nn_interests')||'[]'),language:localStorage.getItem('nn_language')||'hi'};
// ---- i18n: whole-page UI translation (hi / en / fr / es) -------------------------------------
const LANGS=['hi','en','fr','es'];
const LANG_NAMES={hi:'हिंदी',en:'English',fr:'Français',es:'Español'};
// Category VALUES stay Hindi (they key routing, filtering and article.category); only the label is translated.
const CAT_I18N={'होम':{en:'Home',fr:'Accueil',es:'Inicio'},'ताज़ा':{en:'Latest',fr:'À la une',es:'Última hora'},'राजनीति':{en:'Politics',fr:'Politique',es:'Política'},'देश':{en:'National',fr:'National',es:'Nacional'},'दुनिया':{en:'World',fr:'Monde',es:'Mundo'},'बिज़नेस':{en:'Business',fr:'Économie',es:'Negocios'},'टेक्नोलॉजी':{en:'Technology',fr:'Technologie',es:'Tecnología'},'खेल':{en:'Sports',fr:'Sport',es:'Deportes'},'मनोरंजन':{en:'Entertainment',fr:'Divertissement',es:'Entretenimiento'}};
function categoryLabel(c){if(state.language==='hi')return c;const m=CAT_I18N[c];return m&&m[state.language]?m[state.language]:c}
const I18N={
  skipLink:{hi:'मुख्य सामग्री पर जाएं',en:'Skip to main content',fr:'Aller au contenu principal',es:'Ir al contenido principal'},
  breaking:{hi:'ब्रेकिंग',en:'BREAKING',fr:'URGENT',es:'ÚLTIMA HORA'},
  breakingText:{hi:'संसद का मानसून सत्र आज से, प्रमुख विधेयकों पर रहेगी नज़र',en:"Parliament's monsoon session begins today; key bills in focus",fr:"La session de mousson du Parlement s'ouvre aujourd'hui ; projets de loi clés à suivre",es:'La sesión del monzón del Parlamento comienza hoy; proyectos de ley clave en foco'},
  locate:{hi:'स्थान पता करें',en:'Detect location',fr:'Détecter la position',es:'Detectar ubicación'},
  locationUnavailable:{hi:'स्थान उपलब्ध नहीं',en:'Location unavailable',fr:'Position indisponible',es:'Ubicación no disponible'},
  tagline:{hi:'आपकी नज़र, आपकी खबर',en:'Your view, your news',fr:'Votre regard, votre actualité',es:'Tu mirada, tu noticia'},
  menu:{hi:'मेन्यू',en:'Menu',fr:'Menu',es:'Menú'},
  search:{hi:'खोजें',en:'Search',fr:'Rechercher',es:'Buscar'},
  searchPlaceholder:{hi:'खबर, विषय या कीवर्ड खोजें…',en:'Search news, topics or keywords…',fr:'Rechercher actualités, sujets ou mots-clés…',es:'Buscar noticias, temas o palabras clave…'},
  bookmarks:{hi:'बुकमार्क',en:'Bookmarks',fr:'Favoris',es:'Guardados'},
  myProfile:{hi:'मेरी प्रोफ़ाइल',en:'My profile',fr:'Mon profil',es:'Mi perfil'},
  adminDashboard:{hi:'एडमिन डैशबोर्ड',en:'Admin dashboard',fr:'Tableau admin',es:'Panel de administración'},
  footerTagline:{hi:'विश्वसनीय खबरें, आपकी पसंद के अनुसार। AI के साथ तेज़, सरल और सुलभ समाचार अनुभव।',en:'Trusted news, tailored to you. A fast, simple and accessible news experience powered by AI.',fr:"Une information fiable, adaptée à vous. Une expérience d'actualité rapide, simple et accessible grâce à l'IA.",es:'Noticias confiables, a tu medida. Una experiencia informativa rápida, simple y accesible con IA.'},
  newsHeading:{hi:'समाचार',en:'News',fr:'Actualités',es:'Noticias'},
  about:{hi:'हमारे बारे में',en:'About us',fr:'À propos',es:'Acerca de'},
  interests:{hi:'रुचियां',en:'Interests',fr:"Centres d'intérêt",es:'Intereses'},
  savedNews:{hi:'सेव की गई खबरें',en:'Saved news',fr:'Actualités enregistrées',es:'Noticias guardadas'},
  admin:{hi:'एडमिन',en:'Admin',fr:'Admin',es:'Admin'},
  newsletter:{hi:'न्यूज़लेटर',en:'Newsletter',fr:'Newsletter',es:'Boletín'},
  newsletterText:{hi:'सुबह की जरूरी खबरें सीधे अपने इनबॉक्स में।',en:"The morning's essential news, straight to your inbox.",fr:"L'essentiel de l'actualité du matin, directement dans votre boîte mail.",es:'Las noticias esenciales de la mañana, directo a tu bandeja.'},
  yourEmail:{hi:'आपका ईमेल',en:'Your email',fr:'Votre e-mail',es:'Tu correo'},
  copyright:{hi:'© 2026 NetraNews. सर्वाधिकार सुरक्षित।',en:'© 2026 NetraNews. All rights reserved.',fr:'© 2026 NetraNews. Tous droits réservés.',es:'© 2026 NetraNews. Todos los derechos reservados.'},
  legalLinks:{hi:'गोपनीयता · नियम · संपर्क',en:'Privacy · Terms · Contact',fr:'Confidentialité · Conditions · Contact',es:'Privacidad · Términos · Contacto'},
  login:{hi:'लॉग इन',en:'Log in',fr:'Connexion',es:'Iniciar sesión'},
  logout:{hi:'लॉग आउट',en:'Log out',fr:'Déconnexion',es:'Cerrar sesión'},
  register:{hi:'रजिस्टर',en:'Register',fr:"S'inscrire",es:'Registrarse'},
  chatGreeting:{hi:'नमस्ते! ताज़ा खबरों के बारे में पूछें।',en:'Hello! Ask me about the latest news.',fr:"Bonjour ! Posez-moi des questions sur l'actualité.",es:'¡Hola! Pregúntame sobre las últimas noticias.'},
  chatPlaceholder:{hi:'खबर के बारे में पूछें…',en:'Ask about the news…',fr:"Posez une question sur l'actualité…",es:'Pregunta sobre las noticias…'},
  send:{hi:'भेजें',en:'Send',fr:'Envoyer',es:'Enviar'},
  close:{hi:'बंद करें',en:'Close',fr:'Fermer',es:'Cerrar'},
  summaryTitle:{hi:'इस खबर का सारांश',en:'Summary of this story',fr:'Résumé de cet article',es:'Resumen de esta noticia'},
  translationReady:{hi:'अनुवाद तैयार है',en:'Translation ready',fr:'Traduction prête',es:'Traducción lista'},
  locationNotSupported:{hi:'स्थान समर्थित नहीं',en:'Location not supported',fr:'Position non prise en charge',es:'Ubicación no compatible'},
  locating:{hi:'स्थान खोज रहे हैं…',en:'Finding location…',fr:'Recherche de la position…',es:'Buscando ubicación…'},
  locationDenied:{hi:'स्थान अनुमति नहीं मिली',en:'Location permission denied',fr:'Autorisation de localisation refusée',es:'Permiso de ubicación denegado'},
  allNews:{hi:'सभी खबरें →',en:'All news →',fr:'Toutes les actualités →',es:'Todas las noticias →'},
  basedOnInterests:{hi:'आपकी रुचियों के आधार पर: ',en:'Based on your interests: ',fr:"Selon vos centres d'intérêt : ",es:'Según tus intereses: '},
  latestNews:{hi:'ताज़ा खबरें',en:'Latest news',fr:'Dernières actualités',es:'Últimas noticias'},
  forYou:{hi:'आपके लिए',en:'For you',fr:'Pour vous',es:'Para ti'},
  perYourChoice:{hi:'आपकी पसंद के अनुसार',en:'Tailored to your taste',fr:'Selon vos préférences',es:'Según tus preferencias'},
  noNews:{hi:'अभी कोई समाचार उपलब्ध नहीं है',en:'No news available right now',fr:'Aucune actualité disponible pour le moment',es:'No hay noticias disponibles ahora'},
  home:{hi:'होम',en:'Home',fr:'Accueil',es:'Inicio'},
  articleNotFound:{hi:'लेख नहीं मिला',en:'Article not found',fr:'Article introuvable',es:'Artículo no encontrado'},
  saved:{hi:'★ सेव किया',en:'★ Saved',fr:'★ Enregistré',es:'★ Guardado'},
  bookmark:{hi:'☆ बुकमार्क',en:'☆ Bookmark',fr:'☆ Enregistrer',es:'☆ Guardar'},
  listen:{hi:'🔊 लेख सुनें',en:'🔊 Listen',fr:'🔊 Écouter',es:'🔊 Escuchar'},
  stop:{hi:'■ रोकें',en:'■ Stop',fr:'■ Arrêter',es:'■ Detener'},
  translate:{hi:'अनुवाद करें',en:'Translate',fr:'Traduire',es:'Traducir'},
  understandQuickly:{hi:'इस खबर को जल्दी समझें',en:'Understand this story quickly',fr:'Comprenez cet article rapidement',es:'Entiende esta noticia rápidamente'},
  makeSummary:{hi:'सारांश बनाएं',en:'Generate summary',fr:'Générer le résumé',es:'Generar resumen'},
  summaryLoading:{hi:'सारांश तैयार किया जा रहा है…',en:'Generating summary…',fr:'Génération du résumé…',es:'Generando resumen…'},
  comments:{hi:'टिप्पणियां',en:'Comments',fr:'Commentaires',es:'Comentarios'},
  commentPlaceholder:{hi:'अपनी राय लिखें…',en:'Write your comment…',fr:'Écrivez votre avis…',es:'Escribe tu opinión…'},
  postComment:{hi:'टिप्पणी करें',en:'Post comment',fr:'Publier',es:'Comentar'},
  commentPosted:{hi:'टिप्पणी प्रकाशित हुई',en:'Comment posted',fr:'Commentaire publié',es:'Comentario publicado'},
  mostRead:{hi:'सबसे ज्यादा पढ़ी गई',en:'Most read',fr:'Les plus lus',es:'Lo más leído'},
  resultsFor:{hi:'“{0}” के परिणाम',en:'Results for “{0}”',fr:'Résultats pour « {0} »',es:'Resultados de «{0}»'},
  topStories:{hi:'प्रमुख खबरें',en:'Top stories',fr:'À la une',es:'Titulares'},
  resultsCount:{hi:'{0} परिणाम',en:'{0} results',fr:'{0} résultats',es:'{0} resultados'},
  noBookmarks:{hi:'कोई बुकमार्क नहीं है।',en:'No bookmarks yet.',fr:'Aucun favori.',es:'Sin guardados.'},
  profile:{hi:'प्रोफ़ाइल',en:'Profile',fr:'Profil',es:'Perfil'},
  newsInterests:{hi:'समाचार रुचियां',en:'News interests',fr:"Centres d'intérêt",es:'Intereses de noticias'},
  totalArticles:{hi:'कुल लेख',en:'Total articles',fr:'Articles au total',es:'Artículos totales'},
  categoriesStat:{hi:'श्रेणियां',en:'Categories',fr:'Catégories',es:'Categorías'},
  loginHeading:{hi:'अपने अकाउंट में जाएं',en:'Sign in to your account',fr:'Connectez-vous à votre compte',es:'Accede a tu cuenta'},
  email:{hi:'ईमेल',en:'Email',fr:'E-mail',es:'Correo'},
  password:{hi:'पासवर्ड',en:'Password',fr:'Mot de passe',es:'Contraseña'},
  registerHeading:{hi:'नया अकाउंट बनाएं',en:'Create a new account',fr:'Créer un nouveau compte',es:'Crea una cuenta nueva'},
  fullName:{hi:'पूरा नाम',en:'Full name',fr:'Nom complet',es:'Nombre completo'},
  registerBtn:{hi:'रजिस्टर करें',en:'Create account',fr:'Créer le compte',es:'Crear cuenta'},
  loggedOut:{hi:'लॉग आउट हो गया',en:'Logged out',fr:'Déconnecté',es:'Sesión cerrada'},
  interestNotSaved:{hi:'रुचि सर्वर पर सेव नहीं हुई',en:'Interest not saved to server',fr:'Intérêt non enregistré sur le serveur',es:'Interés no guardado en el servidor'},
  translating:{hi:'अनुवाद हो रहा है…',en:'Translating…',fr:'Traduction en cours…',es:'Traduciendo…'},
  loginSuccess:{hi:'लॉग इन सफल',en:'Login successful',fr:'Connexion réussie',es:'Inicio de sesión exitoso'},
  registerSuccess:{hi:'रजिस्ट्रेशन सफल',en:'Registration successful',fr:'Inscription réussie',es:'Registro exitoso'},
  offlineLogin:{hi:'ऑफ़लाइन मोड में लॉग इन',en:'Logged in (offline mode)',fr:'Connecté (mode hors ligne)',es:'Conectado (modo sin conexión)'},
  offlineRegister:{hi:'ऑफ़लाइन मोड में रजिस्टर्ड',en:'Registered (offline mode)',fr:'Inscrit (mode hors ligne)',es:'Registrado (modo sin conexión)'},
  backendUnavailable:{hi:'बैकएंड उपलब्ध नहीं; नमूना खबरें दिखाई गई हैं',en:'Backend unavailable; showing sample news',fr:"Backend indisponible ; actualités d'exemple affichées",es:'Backend no disponible; mostrando noticias de muestra'},
  emailExists:{hi:'यह ईमेल पहले से रजिस्टर्ड है',en:'This email is already registered',fr:'Cet e-mail est déjà enregistré',es:'Este correo ya está registrado'},
  invalidCreds:{hi:'ईमेल या पासवर्ड गलत है',en:'Invalid email or password',fr:'E-mail ou mot de passe invalide',es:'Correo o contraseña inválidos'},
  chatSearching:{hi:'netrabot खबरें खोज रहा है…',en:'netrabot is searching the news…',fr:'netrabot recherche les actualités…',es:'netrabot está buscando noticias…'},
  adminOnly:{hi:'यह पेज केवल एडमिन के लिए है। कृपया एडमिन के रूप में लॉग इन करें।',en:'This page is for admins only. Please log in as an admin.',fr:"Cette page est réservée aux administrateurs. Veuillez vous connecter en tant qu'administrateur.",es:'Esta página es solo para administradores. Inicia sesión como administrador.'},
  addArticle:{hi:'नया लेख जोड़ें',en:'Add article',fr:'Ajouter un article',es:'Añadir artículo'},
  editArticle:{hi:'लेख संपादित करें',en:'Edit article',fr:"Modifier l'article",es:'Editar artículo'},
  manageArticles:{hi:'लेख प्रबंधन',en:'Manage articles',fr:'Gérer les articles',es:'Gestionar artículos'},
  fieldTitle:{hi:'शीर्षक',en:'Title',fr:'Titre',es:'Título'},
  fieldCategory:{hi:'श्रेणी',en:'Category',fr:'Catégorie',es:'Categoría'},
  fieldSummary:{hi:'सारांश',en:'Summary',fr:'Résumé',es:'Resumen'},
  fieldContent:{hi:'सामग्री',en:'Content',fr:'Contenu',es:'Contenido'},
  fieldImage:{hi:'इमेज URL',en:'Image URL',fr:"URL de l'image",es:'URL de imagen'},
  fieldAuthor:{hi:'लेखक',en:'Author',fr:'Auteur',es:'Autor'},
  fieldTags:{hi:'टैग (कॉमा से अलग)',en:'Tags (comma separated)',fr:'Tags (séparés par des virgules)',es:'Etiquetas (separadas por comas)'},
  save:{hi:'सेव करें',en:'Save',fr:'Enregistrer',es:'Guardar'},
  cancel:{hi:'रद्द करें',en:'Cancel',fr:'Annuler',es:'Cancelar'},
  edit:{hi:'संपादित करें',en:'Edit',fr:'Modifier',es:'Editar'},
  del:{hi:'हटाएं',en:'Delete',fr:'Supprimer',es:'Eliminar'},
  articleSaved:{hi:'लेख सेव हो गया',en:'Article saved',fr:'Article enregistré',es:'Artículo guardado'},
  articleDeleted:{hi:'लेख हटा दिया गया',en:'Article deleted',fr:'Article supprimé',es:'Artículo eliminado'},
  confirmDelete:{hi:'क्या आप वाकई इस लेख को हटाना चाहते हैं?',en:'Are you sure you want to delete this article?',fr:'Voulez-vous vraiment supprimer cet article ?',es:'¿Seguro que quieres eliminar este artículo?'}
};
function t(key,...args){const e=I18N[key];let s=e?(e[state.language]||e.hi):key;args.forEach((a,i)=>{s=s.replace('{'+i+'}',a)});return s}
function applyStaticI18n(){document.documentElement.lang=state.language;$$('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));$$('[data-i18n-ph]').forEach(el=>el.setAttribute('placeholder',t(el.dataset.i18nPh)));$$('[data-i18n-aria]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.i18nAria)));$$('[data-i18n-cat]').forEach(el=>el.textContent=categoryLabel(el.dataset.i18nCat));const sw=$('#langSwitcher');if(sw)sw.value=state.language}
function renderNav(){const links=CATEGORIES.map(c=>`<a href="${c==='होम'?'#/home':`#/category/${encodeURIComponent(c)}`}">${categoryLabel(c)}</a>`).join('');const n=$('#navLinks');if(n)n.innerHTML=links;const d=$('#drawerLinks');if(d)d.innerHTML=links}
function setLanguage(lang){if(!LANGS.includes(lang))return;state.language=lang;localStorage.setItem('nn_language',lang);applyStaticI18n();renderNav();renderAuth();route()}
const categoryPhotoUrls=[
  null,
  null,
  'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80'
];
const API={
  async request(path,{timeout=3000,...options}={}){const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);try{const response=await fetch(`${API_ORIGIN}/api${path}`,{headers:{'Content-Type':'application/json'},signal:controller.signal,...options});if(!response.ok){const body=await response.json().catch(()=>({}));throw new Error(body.error||`Request failed (${response.status})`)}return response.status===204?null:response.json()}finally{clearTimeout(timer)}},
  news(params=''){return this.request(`/news${params}`)}, login(body){return this.request('/auth/login',{method:'POST',body:JSON.stringify(body)})}, register(body){return this.request('/auth/register',{method:'POST',body:JSON.stringify(body)})},
  createNews(body){return this.request('/news',{method:'POST',body:JSON.stringify(body)})}, updateNews(id,body){return this.request(`/news/${id}`,{method:'PUT',body:JSON.stringify(body)})}, deleteNews(id){return this.request(`/news/${id}`,{method:'DELETE'})},
  interests(email,interests){return this.request(`/auth/users/${encodeURIComponent(email)}/interests`,{method:'PUT',body:JSON.stringify({interests})})},
  bookmarks(email){return this.request(`/bookmarks/${encodeURIComponent(email)}`)}, addBookmark(email,id){return this.request(`/bookmarks/${encodeURIComponent(email)}/${id}`,{method:'POST'})}, removeBookmark(email,id){return this.request(`/bookmarks/${encodeURIComponent(email)}/${id}`,{method:'DELETE'})}, comments(id){return this.request(`/news/${id}/comments`)}, comment(id,body){return this.request(`/news/${id}/comments`,{method:'POST',body:JSON.stringify(body)})},
  summarize(body){return this.request('/ai/summarize',{method:'POST',body:JSON.stringify(body),timeout:25000})},
  translate(id,language){return this.request(`/ai/translate/${id}/${encodeURIComponent(language)}`,{timeout:25000})},
  chat(message,language){return this.request('/ai/chat',{method:'POST',body:JSON.stringify({message,language}),timeout:25000})}
};
const localArticles=[...ARTICLES];
let articles=localArticles;
function normalize(a,i){return {...a,id:String(a.id),summary:a.summary||'',content:a.content||a.summary||'',author:a.author||'NetraNews',date:a.date||(a.publishedAt?new Intl.DateTimeFormat('hi-IN',{dateStyle:'medium'}).format(new Date(a.publishedAt)):'आज'),time:a.time||'हाल ही में',tone:a.tone||['red','blue','green','violet','amber','cyan'][i%6]}}
function toast(message){const t=$('#toast');t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}
function escapeHtml(v=''){const d=document.createElement('div');d.textContent=v;return d.innerHTML}
function isPlaceholderImage(url=''){return /placehold|placeholder|dummyimage|via\.placeholder|fakeimg|text=|\/image\/|dummy/i.test(url)}
function categoryImage(a){const index=CATEGORIES.indexOf(a.category);return categoryPhotoUrls[index]||articleImages[a.category]||fallbackImage}
function imageFor(a){return a.imageUrl&&!isPlaceholderImage(a.imageUrl)?a.imageUrl:categoryImage(a)}
function hasHindi(text=''){return /[\u0900-\u097F]/.test(text)}
function needsLocalTranslation(result,lang){if(!result||lang==='hi')return false;return hasHindi(`${result.title||''} ${result.summary||''} ${result.content||''}`)}
function visual(a,small=''){const src=imageFor(a);return `<div class="visual has-image tone-${a.tone} ${small}"><img src="${escapeHtml(src)}" alt="${escapeHtml(a.title)}" loading="lazy" onerror="this.onerror=null;this.src='${escapeHtml(categoryImage(a))}'"></div>`}
function mergeArticles(remote=[]){const seen=new Set(remote.map(a=>String(a.id)));return [...remote,...localArticles.filter(a=>!seen.has(String(a.id)))]}
function localSummary(a,lang='hi'){const cat=categoryLabel(a.category);const T={
  hi:{summary:`${a.summary} लेख उपलब्ध जानकारी, संभावित प्रभाव और आगे की प्रक्रिया को संक्षेप में समझाता है।`,points:[`${a.category} से जुड़ी यह एक महत्वपूर्ण खबर है।`,a.summary,'इस घटनाक्रम का असर संबंधित क्षेत्र पर पड़ सकता है।','आगे के आधिकारिक अपडेट पर NetraNews की नज़र रहेगी।']},
  en:{summary:`This ${cat} report outlines the key facts, the likely impact and what happens next.`,points:[`This is an important ${cat} story.`,'It covers the main facts available so far.','The development may affect the related sector.','NetraNews will track official updates.']},
  fr:{summary:`Cet article (${cat}) présente les faits essentiels, l'impact probable et la suite des événements.`,points:[`Une actualité importante dans la rubrique ${cat}.`,'Il résume les principaux faits connus à ce jour.','Cet événement pourrait affecter le secteur concerné.','NetraNews suivra les mises à jour officielles.']},
  es:{summary:`Este informe de ${cat} resume los datos clave, el impacto probable y lo que sigue.`,points:[`Una noticia importante de ${cat}.`,'Resume los principales hechos disponibles hasta ahora.','El acontecimiento podría afectar al sector relacionado.','NetraNews seguirá las actualizaciones oficiales.']}
};const x=T[lang]||T.hi;return {summary:x.summary,keyPoints:x.points}}
function localChat(message,lang='hi'){const q=(message||'').toLowerCase();const matches=q.includes('खेल')||q.includes('sport')||q.includes('ipl')?articles.filter(a=>a.category==='खेल'):q.includes('tech')||q.includes('तकनीक')||q.includes('टेक')?articles.filter(a=>a.category==='टेक्नोलॉजी'):q.includes('राजनीति')||q.includes('politic')?articles.filter(a=>a.category==='राजनीति'):articles.slice(0,3);const titles=matches.slice(0,3).map(a=>a.title).join(' | ');const L={hi:{hit:`संबंधित प्रमुख खबरें: ${titles}`,miss:'इस विषय पर अभी कोई खबर उपलब्ध नहीं है।'},en:{hit:`Related top stories: ${titles}`,miss:'No news is available on this topic right now.'},fr:{hit:`Actualités liées : ${titles}`,miss:'Aucune actualité disponible sur ce sujet pour le moment.'},es:{hit:`Noticias relacionadas: ${titles}`,miss:'No hay noticias disponibles sobre este tema en este momento.'}};const t=L[lang]||L.hi;return matches.length?t.hit:t.miss}
function localTranslation(a,lang){const enCategory={'राजनीति':'Politics','देश':'National','दुनिया':'World','बिज़नेस':'Business','टेक्नोलॉजी':'Technology','खेल':'Sports','मनोरंजन':'Entertainment'}[a.category]||'Current affairs';const text={en:{title:`Latest ${enCategory} news update`,summary:'This report explains the latest development, the available facts and its likely impact.',content:'This is the English edition of the article. The development is being closely monitored by the relevant authorities. More verified information will be shared as the situation develops.'},fr:{title:`Dernières nouvelles : ${enCategory}`,summary:'Ce rapport présente les derniers développements, les faits disponibles et leur impact possible.',content:`Ceci est l'édition française de l'article. Les autorités suivent la situation de près et communiqueront de nouvelles informations vérifiées.`},es:{title:`Últimas noticias: ${enCategory}`,summary:'Este informe explica los últimos acontecimientos, los datos disponibles y su posible impacto.',content:'Esta es la edición en español del artículo. Las autoridades siguen de cerca la situación y compartirán más información verificada.'},hi:{title:a.title,summary:a.summary,content:a.content}};return text[lang]||text.hi}
function renderSummary(box,r){if(!box)return;const points=(r.keyPoints||[]).filter(Boolean);box.innerHTML=`<span class="eyebrow">netrabot</span><h3>${t('summaryTitle')}</h3><p>${escapeHtml(r.summary||'')}</p>${points.length?`<ul>${points.map(p=>`<li>${escapeHtml(p)}</li>`).join('')}</ul>`:''}`}
function applyTranslation(r){if(!r)return;const t2=$('.article-title');if(t2&&r.title)t2.textContent=r.title;const d=$('.article-deck');if(d&&r.summary)d.textContent=r.summary;const b=$('.article-body');if(b&&r.content)b.innerHTML=r.content.split('\n').filter(Boolean).map(p=>`<p>${escapeHtml(p)}</p>`).join('');toast(t('translationReady'))}
function openChat(){let panel=$('.chat-panel');if(!panel){panel=document.createElement('div');panel.className='chat-panel';panel.innerHTML=`<div class="chat-head"><b>netrabot</b><button class="icon-btn" data-action="close-chat" aria-label="${t('close')}">×</button></div><div class="chat-log"><div class="bubble">${t('chatGreeting')}</div></div><form id="chatForm" class="chat-form"><input type="text" placeholder="${t('chatPlaceholder')}" required autocomplete="off"><button class="primary-btn">${t('send')}</button></form>`;document.body.appendChild(panel)}panel.classList.add('open');const inp=$('input',panel);if(inp)inp.focus()}
function renderAuth(){const root=$('#authActions');if(state.user)root.innerHTML=`<div class="auth-user"><a class="profile-link" href="#/profile">${escapeHtml(state.user.fullName)}</a><button class="text-btn" data-action="logout">${t('logout')}</button></div>`;else root.innerHTML=`<div class="auth-guest"><button class="account-btn" data-action="login">${t('login')}</button><button class="register-btn" data-action="register">${t('register')}</button></div>`;applyAdminVisibility()}
const DATE_LOCALE={hi:'hi-IN',en:'en-IN',fr:'fr-FR',es:'es-ES'};
function updateClock(){const now=new Date();$('#today').textContent=new Intl.DateTimeFormat(DATE_LOCALE[state.language]||'hi-IN',{dateStyle:'full',timeStyle:'medium'}).format(now)}
function locateUser(){const label=$('#locationLabel');if(!navigator.geolocation){label.textContent=t('locationNotSupported');return}label.textContent=t('locating');navigator.geolocation.getCurrentPosition(async({coords})=>{try{const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`,{headers:{Accept:'application/json'}});const d=await r.json();label.textContent=d.address?.city||d.address?.town||d.address?.state||`${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`}catch{label.textContent=`${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`}},()=>label.textContent=t('locationDenied'),{timeout:10000,maximumAge:300000})}
function story(a,lead=false){return `<article class="story ${lead?'lead':''}" data-open="${a.id}">${visual(a)}<span class="eyebrow">${categoryLabel(a.category)}</span><${lead?'h1':'h2'}>${a.title}</${lead?'h1':'h2'}>${lead?`<p>${a.summary}</p>`:''}<div class="meta">${a.time}</div></article>`}
function section(title,items,catKey){return `<section><div class="section-head"><h2>${title}</h2><a href="#/category/${encodeURIComponent(catKey||title)}">${t('allNews')}</a></div><div class="category-grid">${items.map(a=>story(a)).join('')}</div></section>`}
function home(){if(!articles.length){main.innerHTML=`<div class="page shell empty"><h2>${t('noNews')}</h2></div>`;return}const ranked=[...articles].sort((a,b)=>Number(state.interests.includes(b.category))-Number(state.interests.includes(a.category))),[lead,...rest]=ranked;main.innerHTML=`<div class="page shell">${state.user&&state.interests.length?`<p class="page-intro">${t('basedOnInterests')}<b>${state.interests.map(categoryLabel).join(', ')}</b></p>`:''}<div class="hero-grid">${story(lead,true)}<div class="side-stack">${rest.slice(0,2).map(a=>story(a)).join('')}</div><div class="side-stack">${rest.slice(2,5).map(a=>`<article class="story" data-open="${a.id}"><span class="eyebrow">${categoryLabel(a.category)}</span><h3>${a.title}</h3><div class="meta">${a.time}</div></article>`).join('')}</div></div>${section(t('latestNews'),ranked.slice(3,9),'ताज़ा')}<section class="recommend"><div class="section-head"><h2>${t('forYou')}</h2><span>${t('perYourChoice')}</span></div><div class="category-grid">${ranked.slice(0,4).map(a=>story(a)).join('')}</div></section></div>`}
async function article(id){const a=articles.find(x=>String(x.id)===String(id));if(!a){main.innerHTML=`<div class="page shell empty"><h2>${t('articleNotFound')}</h2></div>`;return}main.innerHTML=`<div class="page shell article-layout"><article data-article-id="${a.id}"><div class="breadcrumbs"><a href="#/home">${t('home')}</a> / ${categoryLabel(a.category)}</div><span class="eyebrow">${categoryLabel(a.category)}</span><h1 class="article-title">${a.title}</h1><p class="article-deck">${a.summary}</p><div class="byline"><b>${a.author}</b><span>${a.date}</span></div>${visual(a)}<div class="article-tools"><button class="tool-btn" data-action="bookmark" data-id="${a.id}">${state.bookmarks.includes(String(a.id))?t('saved'):t('bookmark')}</button><button class="tool-btn" data-action="audio">${t('listen')}</button><button class="tool-btn" data-action="stop-audio">${t('stop')}</button><select class="tool-btn" id="translationLanguage"><option value="en">English</option><option value="hi">हिंदी</option><option value="fr">Français</option><option value="es">Español</option></select><button class="tool-btn" data-action="translate">${t('translate')}</button></div><div class="ai-summary" id="aiSummary"><span class="eyebrow">netrabot</span><h3>${t('understandQuickly')}</h3><button class="primary-btn" data-action="summary">${t('makeSummary')}</button></div><div class="article-body">${a.content.split('\n').filter(Boolean).map(p=>`<p>${escapeHtml(p)}</p>`).join('')||`<p>${a.summary}</p>`}</div><section><div class="section-head"><h2>${t('comments')}</h2></div><form class="auth-form" id="commentForm"><textarea rows="3" placeholder="${t('commentPlaceholder')}" required></textarea><button class="primary-btn">${t('postComment')}</button></form><div id="comments"></div></section></article><aside class="sidebar"><h3>${t('mostRead')}</h3>${articles.filter(x=>x.id!==a.id).slice(0,5).map(x=>`<article class="story" data-open="${x.id}"><span class="eyebrow">${categoryLabel(x.category)}</span><h3>${x.title}</h3></article>`).join('')}</aside></div>`;try{renderComments(await API.comments(a.id))}catch{renderComments([])}}
function renderComments(items){$('#comments').innerHTML=items.map(c=>`<div class="ai-summary"><b>${escapeHtml(c.userName)}</b><p>${escapeHtml(c.text)}</p></div>`).join('')}
function listing(category,query=''){let items=query?articles.filter(a=>(a.title+a.summary+a.category).toLowerCase().includes(query.toLowerCase())):category==='ताज़ा'?articles:articles.filter(a=>a.category===category);main.innerHTML=`<div class="page shell"><h1 class="page-title">${query?t('resultsFor',escapeHtml(query)):categoryLabel(category)}</h1><div class="section-head"><h2>${t('topStories')}</h2><span>${t('resultsCount',items.length)}</span></div><div class="listing">${items.map(a=>`<article class="list-card story" data-open="${a.id}">${visual(a)}<div><span class="eyebrow">${categoryLabel(a.category)}</span><h2>${a.title}</h2><p>${a.summary}</p><span class="meta">${a.author}</span></div></article>`).join('')}</div></div>`}
function bookmarks(){const items=articles.filter(a=>state.bookmarks.includes(String(a.id)));main.innerHTML=`<div class="page shell"><h1 class="page-title">${t('savedNews')}</h1>${items.length?`<div class="listing">${items.map(a=>`<article class="list-card story" data-open="${a.id}">${visual(a)}<div><h2>${a.title}</h2><p>${a.summary}</p></div></article>`).join('')}</div>`:`<div class="empty">${t('noBookmarks')}</div>`}</div>`}
function profile(){if(!state.user){loginModal();location.hash='#/home';return}main.innerHTML=`<div class="page shell profile-grid"><nav class="profile-nav"><a>${t('profile')}</a><a href="#/bookmarks">${t('bookmarks')}</a><a data-action="logout">${t('logout')}</a></nav><section><h1 class="page-title">${escapeHtml(state.user.fullName)}</h1><p>${escapeHtml(state.user.email)}</p><div class="section-head"><h2>${t('newsInterests')}</h2></div><div class="interest-chips">${CATEGORIES.slice(2).map(c=>`<button class="chip ${state.interests.includes(c)?'selected':''}" data-action="interest" data-interest="${c}">${categoryLabel(c)}</button>`).join('')}</div></section></div>`}
let adminList=[];
async function refreshArticles(){try{const remote=await API.news();articles=remote.length?mergeArticles(remote).map(normalize):localArticles.map(normalize)}catch{}}
function fillNewsForm(a){$('#newsId').value=a.id||'';$('#newsTitle').value=a.title||'';$('#newsCategory').value=a.category||'';$('#newsSummary').value=a.summary||'';$('#newsContent').value=a.content||'';$('#newsImage').value=a.imageUrl||'';$('#newsAuthor').value=a.author||'';$('#newsTags').value=(a.tags||[]).join(', ');$('#newsFormTitle').textContent=t('editArticle');$('#newsForm').scrollIntoView({behavior:'smooth'})}
function resetNewsForm(){const f=$('#newsForm');if(f)f.reset();const idf=$('#newsId');if(idf)idf.value='';const h=$('#newsFormTitle');if(h)h.textContent=t('addArticle')}
function applyAdminVisibility(){const show=!!(state.user&&state.user.role==='ADMIN');$$('.admin-only').forEach(el=>el.style.display=show?'':'none')}
async function admin(){if(!state.user||state.user.role!=='ADMIN'){main.innerHTML=`<div class="page shell empty"><h2>${t('adminOnly')}</h2></div>`;return}try{adminList=await API.news()}catch{adminList=[]}const cats=CATEGORIES.slice(2);main.innerHTML=`<div class="page shell admin-page"><h1 class="page-title">${t('adminDashboard')}</h1><div class="stats"><div class="stat"><b>${adminList.length}</b>${t('totalArticles')}</div><div class="stat"><b>${new Set(adminList.map(a=>a.category)).size}</b>${t('categoriesStat')}</div></div><section class="admin-form-wrap"><h2 id="newsFormTitle">${t('addArticle')}</h2><form id="newsForm" class="auth-form admin-form"><input type="hidden" id="newsId" name="id"><label>${t('fieldTitle')}</label><input id="newsTitle" name="title" required><label>${t('fieldCategory')}</label><select id="newsCategory" name="category" required>${cats.map(c=>`<option value="${c}">${categoryLabel(c)}</option>`).join('')}</select><label>${t('fieldSummary')}</label><textarea id="newsSummary" name="summary" rows="2"></textarea><label>${t('fieldContent')}</label><textarea id="newsContent" name="content" rows="5" required></textarea><label>${t('fieldImage')}</label><input id="newsImage" name="imageUrl" type="url"><label>${t('fieldAuthor')}</label><input id="newsAuthor" name="author"><label>${t('fieldTags')}</label><input id="newsTags" name="tags"><div class="admin-form-actions"><button class="primary-btn" type="submit">${t('save')}</button><button class="text-btn" type="button" data-action="news-cancel">${t('cancel')}</button></div></form></section><section><div class="section-head"><h2>${t('manageArticles')}</h2><span>${t('resultsCount',adminList.length)}</span></div><div class="admin-list">${adminList.map(a=>`<div class="admin-row"><div class="admin-row-main"><span class="eyebrow">${categoryLabel(a.category)}</span><b>${escapeHtml(a.title)}</b></div><div class="admin-row-actions"><button class="tool-btn" data-action="news-edit" data-id="${a.id}">${t('edit')}</button><button class="tool-btn danger" data-action="news-delete" data-id="${a.id}">${t('del')}</button></div></div>`).join('')||`<div class="empty">${t('noNews')}</div>`}</div></section></div>`}
function closeOverlays(){['.drawer','.scrim','.search-panel'].forEach(s=>{const el=$(s);if(el)el.classList.remove('open')})}
function route(){closeOverlays();const parts=location.hash.slice(2).split('/'),r=parts[0]||'home';if(r==='home')home();else if(r==='article')article(parts[1]);else if(r==='category')listing(decodeURIComponent(parts[1]||'ताज़ा'));else if(r==='search')listing('',decodeURIComponent(parts.slice(1).join('/')));else if(r==='bookmarks')bookmarks();else if(r==='profile')profile();else if(r==='admin')admin();else home();scrollTo(0,0)}
function openModal(html){$('#modalContent').innerHTML=html;$('#modal').showModal()}
function loginModal(){openModal(`<span class="eyebrow">${t('login')}</span><h2>${t('loginHeading')}</h2><form class="auth-form" id="loginForm"><label>${t('email')}</label><input name="email" type="email" required><label>${t('password')}</label><input name="password" type="password" required><button class="primary-btn">${t('login')}</button></form>`)}
function registerModal(){openModal(`<span class="eyebrow">${t('register')}</span><h2>${t('registerHeading')}</h2><form class="auth-form" id="registerForm"><label>${t('fullName')}</label><input name="fullName" required><label>${t('email')}</label><input name="email" type="email" required><label>${t('password')}</label><input name="password" type="password" minlength="8" required><label>${t('interests')}</label><div class="interest-chips">${CATEGORIES.slice(2).map(c=>`<label class="chip"><input type="checkbox" name="interests" value="${c}"> ${categoryLabel(c)}</label>`).join('')}</div><button class="primary-btn">${t('registerBtn')}</button></form>`)}

document.addEventListener('click',async e=>{const open=e.target.closest('[data-open]');if(open){location.hash=`#/article/${open.dataset.open}`;return}const el=e.target.closest('[data-action]');if(!el)return;const action=el.dataset.action;if(action==='login')loginModal();if(action==='register')registerModal();if(action==='close-modal')$('#modal').close();if(action==='location')locateUser();if(action==='logout'){state.user=null;state.interests=[];state.bookmarks=[];localStorage.removeItem('nn_user');localStorage.removeItem('nn_interests');localStorage.removeItem('nn_bookmarks');renderAuth();location.hash='#/home';toast(t('loggedOut'))}if(action==='interest'){const c=el.dataset.interest;state.interests=state.interests.includes(c)?state.interests.filter(x=>x!==c):[...state.interests,c];localStorage.setItem('nn_interests',JSON.stringify(state.interests));el.classList.toggle('selected');if(state.user)API.interests(state.user.email,state.interests).catch(()=>toast(t('interestNotSaved')))}if(action==='bookmark'){if(!state.user){loginModal();return}const id=String(el.dataset.id),saved=state.bookmarks.includes(id);try{saved?await API.removeBookmark(state.user.email,id):await API.addBookmark(state.user.email,id);state.bookmarks=saved?state.bookmarks.filter(x=>x!==id):[...state.bookmarks,id];localStorage.setItem('nn_bookmarks',JSON.stringify(state.bookmarks));article(id)}catch(err){toast(err.message)}}if(action==='audio'){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(`${$('.article-title').textContent}. ${$('.article-body').innerText}`);u.lang={hi:'hi-IN',en:'en-US',fr:'fr-FR',es:'es-ES'}[state.language]||'hi-IN';speechSynthesis.speak(u)}if(action==='stop-audio')speechSynthesis.cancel();if(action==='summary'){const a=articles.find(x=>String(x.id)===String($('[data-article-id]').dataset.articleId)),box=$('#aiSummary');box.innerHTML=`<span class="eyebrow">netrabot</span><h3>${t('summaryLoading')}</h3>`;try{renderSummary(box,await API.summarize({content:`${a.title}\n${a.content||a.summary}`,language:state.language}))}catch{renderSummary(box,localSummary(a,state.language))}}if(action==='translate'){const a=articles.find(x=>String(x.id)===String($('[data-article-id]').dataset.articleId)),lang=$('#translationLanguage').value;state.language=lang;localStorage.setItem('nn_language',lang);if(lang==='hi'){article(a.id);return}toast(t('translating'));let r;try{r=await API.translate(a.id,lang);if(needsLocalTranslation(r,lang))r=localTranslation(a,lang)}catch{r=localTranslation(a,lang)}applyTranslation(r)}if(action==='chat')openChat();if(action==='close-chat'){const p=$('.chat-panel');if(p)p.classList.remove('open')}if(action==='news-edit'){const a=adminList.find(x=>String(x.id)===el.dataset.id);if(a)fillNewsForm(a)}if(action==='news-cancel')resetNewsForm();if(action==='news-delete'){if(!confirm(t('confirmDelete')))return;try{await API.deleteNews(el.dataset.id);toast(t('articleDeleted'));await refreshArticles();admin()}catch(err){toast(err.message)}}});
// Offline auth fallback: when the backend is unreachable the app still lets you register/login
// against a localStorage user store (front-end auth is a mock anyway). A live backend always wins;
// we only fall back on network/timeout errors, never on a real 4xx (e.g. wrong password) from the API.
function isOfflineError(err){return err&&(err.name==='AbortError'||err.name==='TypeError'||/failed to fetch|networkerror|load failed|request failed \(0\)/i.test(err.message||''))}
function localUsers(){return JSON.parse(localStorage.getItem('nn_localusers')||'{}')}
function saveLocalUsers(u){localStorage.setItem('nn_localusers',JSON.stringify(u))}
function finishAuth(user){state.user=user;state.interests=user.interests||[];localStorage.setItem('nn_user',JSON.stringify(user));localStorage.setItem('nn_interests',JSON.stringify(state.interests))}
function localRegister(d){const users=localUsers();const key=(d.email||'').toLowerCase();if(users[key])throw new Error(t('emailExists'));const user={id:'local-'+key,fullName:d.fullName,email:d.email,role:'USER',interests:d.interests||[]};users[key]={...user,password:d.password};saveLocalUsers(users);return user}
function localLogin(d){const rec=localUsers()[(d.email||'').toLowerCase()];if(!rec||rec.password!==d.password)throw new Error(t('invalidCreds'));const{password,...user}=rec;return user}
document.addEventListener('submit',async e=>{e.preventDefault();const form=e.target,data=new FormData(form);if(form.id==='searchForm'){location.hash=`#/search/${encodeURIComponent($('#searchInput').value)}`;$('.search-panel').classList.remove('open')}if(form.id==='loginForm'){const creds={email:data.get('email'),password:data.get('password')};let user,offline=false;try{user=await API.login(creds)}catch(err){if(isOfflineError(err)){try{user=localLogin(creds);offline=true}catch(e){return toast(e.message)}}else return toast(err.message)}finishAuth(user);try{state.bookmarks=(await API.bookmarks(user.email)).map(a=>String(a.id));localStorage.setItem('nn_bookmarks',JSON.stringify(state.bookmarks))}catch{}$('#modal').close();renderAuth();route();toast(offline?t('offlineLogin'):t('loginSuccess'))}if(form.id==='registerForm'){const d={fullName:data.get('fullName'),email:data.get('email'),password:data.get('password'),interests:data.getAll('interests')};let user,offline=false;try{user=await API.register(d)}catch(err){if(isOfflineError(err)){try{user=localRegister(d);offline=true}catch(e){return toast(e.message)}}else return toast(err.message)}finishAuth(user);$('#modal').close();renderAuth();route();toast(offline?t('offlineRegister'):t('registerSuccess'))}if(form.id==='commentForm'){if(!state.user){loginModal();return}const id=$('[data-article-id]').dataset.articleId;try{await API.comment(id,{userEmail:state.user.email,userName:state.user.fullName,text:$('textarea',form).value});form.reset();renderComments(await API.comments(id));toast(t('commentPosted'))}catch(err){toast(err.message)}}if(form.id==='chatForm'){const input=$('input',form),message=input.value,log=$('.chat-log');log.innerHTML+=`<div class="bubble user">${escapeHtml(message)}</div><div class="bubble" id="pending">${t('chatSearching')}</div>`;input.value='';try{const r=await API.chat(message,state.language);const a=r&&r.answer&&r.answer.trim();$('#pending').textContent=a||localChat(message,state.language)}catch{$('#pending').textContent=localChat(message,state.language)}$('#pending').removeAttribute('id')}if(form.id==='newsForm'){if(!state.user||state.user.role!=='ADMIN')return toast(t('adminOnly'));const id=data.get('id'),body={title:data.get('title'),category:data.get('category'),summary:data.get('summary'),content:data.get('content'),imageUrl:data.get('imageUrl'),author:data.get('author')||'NetraNews',tags:(data.get('tags')||'').split(',').map(s=>s.trim()).filter(Boolean)};try{id?await API.updateNews(id,{...body,id}):await API.createNews(body);toast(t('articleSaved'));await refreshArticles();admin()}catch(err){toast(err.message)}}});
$$('.menu-trigger').forEach(b=>b.onclick=()=>{$('.drawer').classList.toggle('open');$('.scrim').classList.toggle('open')});$('.scrim').onclick=()=>{$('.drawer').classList.remove('open');$('.scrim').classList.remove('open')};$$('.search-trigger').forEach(b=>b.onclick=()=>$('.search-panel').classList.toggle('open'));const langSel=$('#langSwitcher');if(langSel)langSel.addEventListener('change',e=>setLanguage(e.target.value));window.addEventListener('hashchange',route);
(async function init(){
  renderAuth();
  updateClock();
  setInterval(updateClock,1000);
  applyStaticI18n();
  renderNav();
  // Render bundled content first; a slow or offline backend must never leave the page blank.
  articles=localArticles.map(normalize);
  route();
  try{
    const remote=await API.news();
    if(remote.length){articles=mergeArticles(remote).map(normalize);route()}
  }catch{
    toast(t('backendUnavailable'));
  }
})();
