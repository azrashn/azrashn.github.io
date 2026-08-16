const translations = {
  tr: {
    // Navbar
    nav_about: "Hakkımda",
    nav_career: "Kariyer",
    nav_projects: "Projeler",
    nav_games: "Oyunlar",
    nav_contact: "İletişim",

    // Hero
    hero_eyebrow: "merhaba, ben",
    hero_bio: "Ankara Bilim Üniversitesi Yazılım Mühendisliği son sınıf ve İstanbul Üniversitesi Grafik Tasarım bölümü öğrencisiyim. Nesne Yönelimli Programlama (OOP) prensiplerine hakim olup, C# ve Python dillerinde güçlü bir teknik altyapıya sahibim. Ryse Soft bünyesindeki stajım ve bugüne kadarki akademik projelerim kapsamında; simülasyon sistemleri, veri yönetimi ve kullanıcı arayüzü tasarımı alanlarında pratik deneyim kazandım. Kurucu başkanlığını üstlendiğim öğrenci topluluğu ile liderlik, organizasyon ve takım çalışması becerilerimi pekiştirdim. Yazılım geliştirme alanında edindiğim bu teknik birikimi, yenilikçi projelerde kullanarak değer üretmeyi ve kariyerimde kendimi sürekli geliştirmeyi hedefliyorum.",
    hero_btn_projects: "Projeleri Gör",
    hero_btn_contact: "İletişim",
    hero_btn_cv: "CV İndir",
    hero_scroll: "aşağı kaydır",

    // Kariyer
    career_eyebrow: "kariyer yolculuğum",
    career_title: "Deneyim & Yolculuk",
    career_desc: "Durağa tıkla veya fareyi üzerine getir",

    // Kariyer Kartları - Journey
    journey_node_1: "Ankara Bilim Üni.",
    journey_title_1: "Ankara Bilim Üniversitesi",
    journey_role_1: "Yazılım Mühendisliği — Son sınıf",
    journey_desc_1: "OOP, C++, C#, Python, veri yapıları ve algoritma derslerinde güçlü bir teknik altyapı edinmekteyim.",

    journey_node_2: "Kariyer Top.",
    journey_title_2: "Kariyer Topluluğu Başkanı",
    journey_role_2: "Yönetim Kurulu Başkanı — 10/2023 – 10/2024",
    journey_desc_2: "Kurucu üyesi olduğum Kariyer Topluluğunda liderlik ve organizasyon yönetimi deneyimi kazandım. Kariyer etkinlikleri planlayıp iş birlikleri kurdum.",

    journey_node_3: "Freelance",
    journey_title_3: "Freelance Grafik Tasarım",
    journey_role_3: "Grafik Tasarımcı",
    journey_desc_3: "Markalaşma, dijital medya, sosyal medya projeleri; poster, kartvizit, logo tasarımları yürüttüm.",

    journey_node_4: "Unity & C#",
    journey_title_4: "Unity & C# Geliştirme",
    journey_role_4: "Oyun Geliştirme — Devam ediyor",
    journey_desc_4: "Unity game engine ile 2D/3D oyun geliştirme, OOP tasarım kalıpları ve performans optimizasyonu. Oyun fikirleri üretme. Yeni oyun mekanikleri deneme.",

    journey_node_5: "Ryse Soft",
    journey_title_5: "Ryse Soft — Stajyer",
    journey_role_5: "Oyun Geliştirme Stajyeri — 07/2025 – 09/2025",
    journey_desc_5: "C# ve Unity ile yeni oyun özellikleri geliştirdim, oyun tasarımı becerilerimi geliştirdim ve test süreçlerine katkı sağladım.",

    journey_node_ist: "İstanbul Üni.",
    journey_title_ist: "İstanbul Üniversitesi",
    journey_role_ist: "Grafik Tasarım",
    journey_desc_ist: "İstanbul Üniversitesi Grafik Tasarım bölümünde eğitime başladım.",

    journey_node_staj: "Uzun Dönem Staj",
    journey_title_staj: "Uzun Dönem Staj",
    journey_role_staj: "Staj — 2027",
    journey_desc_staj: "Mezuniyet öncesi uzun dönem stajı.",

    journey_node_mezun: "Mezuniyet",
    journey_title_mezun: "Mezuniyet 🎓",
    journey_role_mezun: "Lisans ve Ön Lisans Mezuniyeti — 2027",
    journey_desc_mezun: "Ankara Bilim Üniversitesi Yazılım Mühendisliği ve İstanbul Üniversitesi Grafik Tasarım bölümlerinden mezuniyet.",

    // Kariyer Kartları - Experience
    exp_role_1: "Oyun Geliştirme Stajyeri",
    exp_date_1: "07/2025 – 09/2025",
    exp_company_1: "Ryse Soft",
    exp_desc_1: "C# ve Unity kullanarak yeni oyun özellikleri geliştirdim ve oyun tasarımı öğrendim. Oyun mekaniklerinin tasarım, kodlama, test ve hata giderme süreçlerine katkı sağladım. Oyun kurgusu yapmayı ve döküman hazırlamayı öğrendim.",

    exp_role_2: "Yönetim Kurulu Başkanı",
    exp_date_2: "10/2023 – 10/2024",
    exp_company_2: "Kariyer Topluluğu",
    exp_desc_2: "Liderlik ve operasyon yönetimi deneyimi kazandım. Kariyer geliştirme etkinlikleri planlayıp yürüttüm, yeni projeler oluşturdum. Topluluk üyeleriyle etkileşimi artırma ve şirket/organizasyonlarla iş birlikleri kurma konularında deneyim edindim.",

    exp_role_3: "Grafik Tasarımcı",
    exp_company_3: "Freelance",
    exp_desc_3: "İstanbul Üniversitesi Grafik Tasarım bölümünde öğrenim görmekteyim. Dijital medya tasarımı alanında markalaşma, pazarlama materyalleri ve sosyal medya içerikleri geliştirdim. Kupa, defter, davetiye, dergi, kartvizit ve topluluk etkinlikleri için poster ve sosyal medya grafikleri tasarladım.",

    // Projeler
    projects_eyebrow: "projeler",
    projects_title: "Projeler",
    project_status_done: "tamamlandı",
    project_btn_details: "detayları incele",
    project_btn_video: "videoyu izle",
    project_btn_code: "kaynak kod",
    project_1_title: "Akıllı Öğrenci Bilgi Sistemi (OBS) & AI Yönetim Paneli",
    project_1_desc: "Ankara Bilim Üniversitesi Engineering Design dersi kapsamında 6 kişilik bir ekiple, aktif versiyon kontrol (Git) süreçlerini yürüterek geliştirdiğimiz Full-Stack yazılım projesi. Yapay zeka destekli müfredat yönetimi ve gelişmiş ders çakışma algoritmaları içeren kapsamlı bir altyapı kurguladık.",
    project_2_title: "Gerçek Zamanlı Yüz İşleme & Deepfake AR Sistemi",
    project_2_desc: "6 kişilik geliştirici ekibiyle birlikte, kameradan alınan canlı görüntüler üzerinde fotogerçekçi yüz manipülasyonu ve Deepfake tabanlı AR filtreleri uygulayan yüksek performanslı bir sistem mimarisi geliştirdik. MediaPipe Face Mesh, Delaunay Üçgenlemesi ve ileri seviye görüntü işleme algoritmalarından (FFT, EMA) yararlandık.",
    project_3_title: "Bank Queue Management System",
    project_3_desc: "Web tasarımı dersi kapsamında 3 kişilik bir ekiple hayata geçirilen bu proje, banka şubelerindeki müşteri yoğunluğunu yönetmek için tasarlanmış dinamik bir web uygulamasıdır. Kullanıcıların dijital olarak sıra numarası alabildiği, gişe durumlarının gerçek zamanlı izlenebildiği ve kullanıcı dostu bir arayüz ile bekleme sürelerini minimize etmeyi amaçlayan bir sistem mimarisine sahiptir.",
    project_4_title: "Automated Feedback & Assessment System",
    project_4_desc: "Öğrencilerin konuşma, yazma ve test aktivitelerindeki performanslarını NLP ve ses tanıma algoritmalarıyla anlık analiz eden yapay zeka destekli eğitim teknolojisi platformu. Kişiselleştirilmiş geri bildirimler sunarak öğrenci gelişimini otomatize eder.",

    // Modal İçerikleri
    obs_modal_list: `
          <li><strong>Yapay Zeka Güdümlü Reaktif Arayüz (AI-Driven UI):</strong> Akademik personelin müfredatları yönetebildiği "Müfredat Zekası" modülünü geliştirdik. Groq LLM yapılandırılmış verilerini Zustand ile merkezi state'te yakalayarak, değişiklik tablolarının (Diff/Timeline) asistan komutlarıyla gerçek zamanlı ve çift yönlü (two-way sync) güncellenmesini sağladık.</li>
          <li><strong>Ders Çakışma ve Doğrulama Algoritması (Conflict Detection):</strong> Öğrenci ders kayıt modülünde, seçilen derslerin DERS_PROGRAMI ve DERSLIK verilerini çapraz kontrol eden algoritmayı tasarladık. Olası saat çakışmalarını asenkron tespit edip kaydı anında bloklayan güvenlik duvarını backend'e entegre ettik.</li>
          <li><strong>Dinamik Şubelendirme ve Transaction Yönetimi:</strong> Yüzlerce öğrencinin tek seferde derse kaydedildiği "Toplu İşlemler" modülünde, kapasiteye göre açılması gereken şube sayısını hesaplayan ve öğrencileri homojen dağıtan altyapıyı kurduk. Veri bütünlüğü için tüm işlemleri Prisma Transaction yapılarıyla güvence altına aldık.</li>
          <li><strong>Büyük Veri ve Transkript Entegrasyonu:</strong> Sistemin tam veritabanı entegrasyonuna geçişini sağladık. Toplu ders kayıtlarında TRANSKRIPT geçmişini analiz ederek öğrencinin geçme/kalma durumuna göre akıllı filtreleme yapan iş mantığını (Business Logic) kurguladık.</li>
          <li><strong>Güvenlik ve Hata Yönetimi:</strong> API uç noktalarında yetkisiz erişimleri (403 Forbidden) önlemek adına Role-Based Access Control (RBAC) yapılarını düzenledik. Veritabanı seviyesinde IP_BLACKLIST ve Brute-Force koruması ile güvenli bir mimari sunduk.</li>
    `,
    facial_modal_list: `
          <li><strong>Gerçek Zamanlı Deepfake ve AR Altyapısı:</strong> Kameradan alınan canlı görüntüler üzerinde fotogerçekçi yüz manipülasyonu ve Deepfake tabanlı AR (Artırılmış Gerçeklik) filtreleri uygulayan yüksek performanslı bir sistem mimarisi tasarladık.</li>
          <li><strong>Geometrik Warping ve Delaunay Üçgenlemesi:</strong> 2D varlıkların (sakal, bıyık vb.) yüze kusursuz giydirilmesi için MediaPipe Face Mesh (468 nokta) ve Delaunay Üçgenlemesi (Piecewise Affine Transform) kullanarak dinamik yüz deformasyonu (warping) algoritmaları geliştirdik. Ağız/dudak hareketlerine tam uyumlu, iç boşluk (exclusion) hesaplamaları yaptık.</li>
          <li><strong>Algoritmik Stabilizasyon (EMA):</strong> Canlı video akışındaki yüz referans noktalarında (landmark) oluşan mikro titremeleri (jitter) engellemek adına Üstel Hareketli Ortalama (EMA) filtreleri koda entegre ederek, gecikmesiz ve pürüzsüz bir yüz takibi sağladık.</li>
          <li><strong>3D Perspektif ve Uzamsal Hesaplama:</strong> AR objelerinin (gözlük vb.) kafa dönüşlerinde (yaw/pitch) perspektiften kaynaklı küçülme hatalarını çözmek için, Z eksenini (derinlik) kapsayan 3D Öklid Uzaklığı hesaplamalarını sisteme dahil ettik.</li>
          <li><strong>Dinamik Renk Eşleştirme ve Harmanlama:</strong> Kullanıcının doğal kıl/cilt rengini anlık olarak analiz edip maskelere uygulayan (Dynamic Color Tinting) ve kenar yumuşatma (Gaussian Feathering) ile objeleri ciltle bütünleştiren Alpha Blending algoritmaları yazdık.</li>
          <li><strong>Frekans Etki Alanı Analizi (FFT):</strong> Görüntülerin Faz (Phase) ve Genlik (Magnitude) bileşenlerini ayrıştırarak frekans tabanlı filtreleme yapmak için sisteme Hızlı Fourier Dönüşümü (FFT) modülü ekledik.</li>
    `,
    feedback_modal_list: `
          <li><strong>Kapsamlı Performans Analizi:</strong> Öğrencilerin konuşma, yazma ve quiz aktivitelerindeki performanslarını anlık ve nesnel olarak analiz eden modern bir eğitim teknolojisi platformu tasarlandı.</li>
          <li><strong>Yapay Zeka ve NLP Entegrasyonu:</strong> Doğal Dil İşleme (NLP) ve ses tanıma algoritmaları harmanlayarak telaffuz, gramer, akıcılık ve anlamsal doğruluğu eşzamanlı değerlendiren sistem mimarisi kurgulandı.</li>
          <li><strong>Kişiselleştirilmiş İlerleme Takibi:</strong> Tespit edilen eksikleri kişiselleştirilmiş geri bildirimlerle sunan ve zaman serisi verileri üzerinden oluşturulan haftalık ilerleme raporlarıyla öğrencinin gelişim takibini otomatize eden yapı entegre edildi.</li>
          <li><strong>Agile Geliştirme Kültürü:</strong> Altı kişilik yazılım ekibiyle, Agile/Scrum prensipleri benimsenerek yapay zeka modelleri, güvenli arka yüz mimarisi ve kullanıcı dostu arayüzleri başarıyla hayata geçirildi.</li>
    `,
    tower_modal_list: `
          <li><strong>Gelişmiş 2D Rendering:</strong> 2D derinlik algısını sağlayan "Y-Sorting" algoritması ve çok yönlü boss sprite'ları için dinamik animasyon render sistemi tasarlandı.</li>
          <li><strong>Yapay Zeka ve Pathfinding:</strong> Harita matrisi (grid) üzerinden çalışan optimize edilmiş mantıksal yol bulma (pathfinding) mekanikleri geliştirildi.</li>
          <li><strong>Stratejik Oynanış Mekanikleri:</strong> Geleneksel can barı yerine savunmayı daha stratejik hale getiren 3 aşamalı (3-Target) kademeli üs sistemi, kaynak yönetimi ve dinamik dalga (wave) sistemi kodlandı.</li>
          <li><strong>Yazılım Mimarisi ve Ekip Çalışması:</strong> 4 kişilik geliştirici ekibiyle, oyun durumları (State Machine) arasındaki geçişlerde müzik ve ses çakışmalarını önleyen merkezi bir AudioManager sınıfı inşa edildi.</li>
    `,
    shooter_modal_list: `
          <li><strong>Yapay Zeka ve Yol Bulma:</strong> NavMesh ve çalışma zamanı hedef çözümleme (Tag/Transform) kullanarak oyuncuyu dinamik olarak takip eden ve menzil kontrolüyle saldırı gerçekleştiren düşman AI mimarisi geliştirildi.</li>
          <li><strong>Algoritmik Zorluk Ölçeklendirmesi:</strong> Düşmanın her yeniden doğuşunda hasar çarpanını eksponansiyel olarak artıran ($2^n$) oyun mekaniği kodlandı.</li>
          <li><strong>Prosedürel Doğma ve Yaşam Döngüsü:</strong> Sahne sınırları (AABB Collider) içinde rastgele koordinat üreten ve nesne yaşam döngüsünü (Instantiate/Destroy) yöneten modüler EnemySpawner sistemi kuruldu.</li>
          <li><strong>UI/UX Entegrasyonu:</strong> TextMeshPro (TMP) ve Slider bileşenleri kullanılarak oyuncu ve düşman için gerçek zamanlı sağlık takip arayüzü uygulandı.</li>
    `,

    // Oyunlar
    games_eyebrow: "oyunlar",
    games_title: "Oyunlar",
    game_1_title: "Flower Shop Simulator",
    game_1_desc: "Oyun geliştirme ve grafik tasarım becerilerini birleştiren bir proje; oyuncuların kendi çiçek dükkanlarını yönettiği bir simülasyon oyunu. Dükkan içi envanter yönetimi, müşteri siparişlerinin zamanında hazırlanması ve estetik çiçek aranjmanlarının tasarlanması gibi oyun içi mekaniklerin yanı sıra, oyunun görsel dünyasını oluşturan özgün dijital sanat varlıklarının üretimini de kapsıyor.",
    game_2_title: "Tower Defense Game",
    game_2_desc: "C++ ve Raylib kütüphanesi kullanılarak geliştirilen orta çağ fantezi temalı 2D kule savunma oyunu. Gelişmiş yol bulma (pathfinding), dinamik dalga sistemi ve stratejik üs mekanikleri içerir.",
    game_3_title: "Shooter Game",
    game_3_desc: "Unity ve C# kullanılarak geliştirilen arena tipi hayatta kalma oyunu. NavMesh tabanlı akıllı düşman yapay zekası, prosedürel üretim (spawning) ve dinamik zorluk algoritmaları içerir.",
    game_4_title: "Balance Duck",
    game_4_desc: "Unity ile geliştirilmiş kule inşa etme oyunu. Blokları doğru zamanda bırakarak en yüksek kuleyi inşa etmeye dayalı refleks ve strateji oyunu.",

    // Araçlar
    tools_eyebrow: "araçlar & yetenekler",
    tools_title: "Araçlarım",
    tools_what_i_do: "Neyle uğraşıyorum",
    tools_what_i_do_desc: "Oyun geliştirme ve yazılım mühendisliği odaklı çalışıyor, temel olarak karmaşık algoritmalar, problem çözme ve backend mimarileri kurgulama üzerine yoğunlaşıyorum.<br><br>Oyun mekanikleri tasarımı, nesne yönelimli programlama (OOP) ve sistem mimarileri geliştirirken projelerin hem teknik mantık hem de tasarım süreçlerini bir arada yürütüyorum.",
    tools_current: "Şu an üzerinde çalıştığım",
    tools_current_desc: "<strong>Yeni Oyun Projesi:</strong> Mekanikleri ve tasarımı üzerinde aktif olarak çalıştığım yeni bir oyun fikri.<br><br><strong>Akademik & Proje Süreçleri:</strong> Yazılım Mühendisliği 4. sınıfa geçiş dönemimde, servis mimarileri, çakışma algoritmaları ve eşzamanlı veri işleme araçları geliştirmeye devam ediyorum.",
    tools_tech: "Teknolojiler",
    tools_lang: "Diller & Motorlar:",
    tools_arch: "Mimari & Yaklaşımlar:",
    tools_data: "Veri & Kütüphaneler:",

    // Sertifikalar
    certs_title: "Sertifikalar",
    cert_1: "Dijital Oyunlarda Kullanılan Yapay Zeka Algoritmaları",
    cert_2: "Sayısal Çip Tasarımına Giriş",
    cert_3: "Unity ile Oyun Geliştirme",
    cert_4: "Süreç İyileştirme ve Problem Çözme Teknikleri",
    cert_5: "İleri Teknolojilerde Siber Güvenlik",
    cert_6: "Flutter Sertifikası",
    cert_7: "Geleceğin Hackerleri",
    cert_8: "Eclipse Java Eğitimi",

    // İletişim & Footer
    contact_eyebrow: "iletişim",
    contact_title: "Bana Ulaşın",
    contact_email: "e-posta",
    contact_location: "konum",
    contact_location_val: "Ankara, Türkiye",

    // Maskot
    mascot_speech: "Merhaba! 👋",
    mascot_speech_projects: "Burası Projelerim! 👉",
    mascot_speech_games: "Burası Oyunlarım! 🎮",

    // Typewriter
    typewriter_1: "Yazılım Mühendisliği Öğrencisi",
    typewriter_2: "Grafik Tasarım Öğrencisi",
    typewriter_3: "Oyun Geliştirici (Unity)"
  },
  en: {
    // Navbar
    nav_about: "About",
    nav_career: "Career",
    nav_projects: "Projects",
    nav_games: "Games",
    nav_contact: "Contact",

    // Hero
    hero_eyebrow: "hello, ıS am",
    hero_bio: "I am a senior Software Engineering student at Ankara Bilim University and a Graphic Design student at Istanbul University. Proficient in Object-Oriented Programming (OOP) principles, I possess a strong technical foundation in C# and Python. Through my internship at Ryse Soft and my academic projects so far, I have gained practical experience in simulation systems, data management, and UI design. As the founding president of a student community, I reinforced my leadership, organization, and teamwork skills. I aim to use this technical background in software development to create value in innovative projects and continuously improve myself in my career.",
    hero_btn_projects: "See Projects",
    hero_btn_contact: "Contact Me",
    hero_btn_cv: "Download CV",
    hero_scroll: "scroll down",

    // Kariyer
    career_eyebrow: "my career journey",
    career_title: "Experience & Journey",
    career_desc: "Click or hover over a stop",

    // Kariyer Kartları - Journey
    journey_node_1: "Ankara Bilim Uni.",
    journey_title_1: "Ankara Bilim University",
    journey_role_1: "Software Engineering — Senior Year",
    journey_desc_1: "Gaining a strong technical foundation in OOP, C++, C#, Python, data structures, and algorithms.",

    journey_node_2: "Career Comm.",
    journey_title_2: "Career Community President",
    journey_role_2: "Chairman of the Board — 10/2023 – 10/2024",
    journey_desc_2: "Gained leadership and organizational management experience as a founding member of the Career Community. Planned career events and established partnerships.",

    journey_node_3: "Freelance",
    journey_title_3: "Freelance Graphic Design",
    journey_role_3: "Graphic Designer",
    journey_desc_3: "Managed branding, digital media, and social media projects; designed posters, business cards, and logos.",

    journey_node_4: "Unity & C#",
    journey_title_4: "Unity & C# Development",
    journey_role_4: "Game Development — Ongoing",
    journey_desc_4: "2D/3D game development with Unity engine, OOP design patterns, and performance optimization. Generating game ideas and testing new mechanics.",

    journey_node_5: "Ryse Soft",
    journey_title_5: "Ryse Soft — Intern",
    journey_role_5: "Game Development Intern — 07/2025 – 09/2025",
    journey_desc_5: "Developed new game features using C# and Unity, improved game design skills, and contributed to testing processes.",

    journey_node_ist: "Istanbul Uni.",
    journey_title_ist: "Istanbul University",
    journey_role_ist: "Graphic Design",
    journey_desc_ist: "Started education at Istanbul University Graphic Design department.",

    journey_node_staj: "Long-Term Internship",
    journey_title_staj: "Long-Term Internship",
    journey_role_staj: "Internship — 2027",
    journey_desc_staj: "Pre-graduation long-term internship.",

    journey_node_mezun: "Graduation",
    journey_title_mezun: "Graduation 🎓",
    journey_role_mezun: "Bachelor's and Associate Degree Graduation — 2027",
    journey_desc_mezun: "Graduation from Ankara Bilim University Software Engineering and Istanbul University Graphic Design departments.",

    // Kariyer Kartları - Experience
    exp_role_1: "Game Development Intern",
    exp_date_1: "07/2025 – 09/2025",
    exp_company_1: "Ryse Soft",
    exp_desc_1: "Developed new game features and learned game design using C# and Unity. Contributed to the design, coding, testing, and debugging processes of game mechanics. Learned to create game scenarios and prepare documentation.",

    exp_role_2: "Chairman of the Board",
    exp_date_2: "10/2023 – 10/2024",
    exp_company_2: "Career Community",
    exp_desc_2: "Gained leadership and operations management experience. Planned and conducted career development events, created new projects. Gained experience in increasing interaction with community members and establishing collaborations with companies/organizations.",

    exp_role_3: "Graphic Designer",
    exp_company_3: "Freelance",
    exp_desc_3: "Currently studying at Istanbul University Graphic Design department. Developed branding, marketing materials, and social media content in the field of digital media design. Designed posters and social media graphics for mugs, notebooks, invitations, magazines, business cards, and community events.",

    // Projeler
    projects_eyebrow: "projects",
    projects_title: "Projects",
    project_status_done: "completed",
    project_btn_details: "view details",
    project_btn_video: "watch video",
    project_btn_code: "source code",
    project_1_title: "Smart Student Information System (OBS) & AI Management Panel",
    project_1_desc: "A Full-Stack software project developed with a team of 6 for the Engineering Design course at Ankara Bilim University, managing active version control (Git) processes. We built a comprehensive infrastructure featuring AI-supported curriculum management and advanced course conflict algorithms.",
    project_2_title: "Real-Time Face Processing & Deepfake AR System",
    project_2_desc: "Together with a team of 6 developers, we developed a high-performance system architecture that applies photorealistic face manipulation and Deepfake-based AR filters on live camera feeds. We utilized MediaPipe Face Mesh, Delaunay Triangulation, and advanced image processing algorithms (FFT, EMA).",
    project_3_title: "Bank Queue Management System",
    project_3_desc: "Implemented by a team of 3 as part of a Web Design course, this project is a dynamic web application designed to manage customer traffic in bank branches. It features a system architecture where users can get digital queue numbers, counter statuses can be monitored in real-time, and waiting times are minimized with a user-friendly interface.",
    project_4_title: "Automated Feedback & Assessment System",
    project_4_desc: "An AI-supported educational technology platform that instantly analyzes students' performance in speaking, writing, and testing activities using NLP and voice recognition algorithms. It automates student development by providing personalized feedback.",

    // Modal İçerikleri
    obs_modal_list: `
          <li><strong>AI-Driven Reactive Interface (AI-Driven UI):</strong> We developed a "Curriculum Intelligence" module where academic staff can manage curriculums. By capturing Groq LLM structured data in the central state with Zustand, we ensured real-time and two-way sync updating of change tables (Diff/Timeline) with assistant commands.</li>
          <li><strong>Course Conflict and Validation Algorithm (Conflict Detection):</strong> In the student course registration module, we designed an algorithm that cross-checks the COURSE_SCHEDULE and CLASSROOM data of selected courses. We integrated a firewall into the backend that asynchronously detects potential time conflicts and instantly blocks registration.</li>
          <li><strong>Dynamic Branching and Transaction Management:</strong> In the "Batch Operations" module, where hundreds of students are registered for a course at once, we established the infrastructure that calculates the number of branches that need to be opened according to capacity and distributes students homogeneously. For data integrity, we secured all operations with Prisma Transaction structures.</li>
          <li><strong>Big Data and Transcript Integration:</strong> We ensured the system's transition to full database integration. In bulk course registrations, we constructed the business logic that analyzes the TRANSCRIPT history and performs smart filtering based on the student's pass/fail status.</li>
          <li><strong>Security and Error Management:</strong> We organized Role-Based Access Control (RBAC) structures to prevent unauthorized access (403 Forbidden) at API endpoints. We provided a secure architecture with IP_BLACKLIST and Brute-Force protection at the database level.</li>
    `,
    facial_modal_list: `
          <li><strong>Real-Time Deepfake and AR Infrastructure:</strong> We designed a high-performance system architecture that applies photorealistic face manipulation and Deepfake-based AR (Augmented Reality) filters on live images taken from the camera.</li>
          <li><strong>Geometric Warping and Delaunay Triangulation:</strong> We developed dynamic face deformation (warping) algorithms using MediaPipe Face Mesh (468 points) and Delaunay Triangulation (Piecewise Affine Transform) to seamlessly fit 2D assets (beard, mustache, etc.) onto the face. We performed internal space (exclusion) calculations fully compatible with mouth/lip movements.</li>
          <li><strong>Algorithmic Stabilization (EMA):</strong> To prevent micro tremors (jitter) occurring at facial reference points (landmarks) in the live video stream, we integrated Exponential Moving Average (EMA) filters into the code, providing lag-free and smooth face tracking.</li>
          <li><strong>3D Perspective and Spatial Calculation:</strong> To solve the shrinkage errors caused by perspective in head rotations (yaw/pitch) of AR objects (glasses, etc.), we included 3D Euclidean Distance calculations covering the Z axis (depth) into the system.</li>
          <li><strong>Dynamic Color Matching and Blending:</strong> We wrote Alpha Blending algorithms that instantly analyze the user's natural hair/skin color and apply it to the masks (Dynamic Color Tinting) and integrate the objects with the skin using edge smoothing (Gaussian Feathering).</li>
          <li><strong>Frequency Domain Analysis (FFT):</strong> We added a Fast Fourier Transform (FFT) module to the system to perform frequency-based filtering by separating the Phase and Magnitude components of the images.</li>
    `,
    feedback_modal_list: `
          <li><strong>Comprehensive Performance Analysis:</strong> A modern educational technology platform was designed that instantly and objectively analyzes students' performance in speaking, writing, and quiz activities.</li>
          <li><strong>AI and NLP Integration:</strong> A system architecture was built that simultaneously evaluates pronunciation, grammar, fluency, and semantic accuracy by blending Natural Language Processing (NLP) and voice recognition algorithms.</li>
          <li><strong>Personalized Progress Tracking:</strong> A structure was integrated that presents identified deficiencies with personalized feedback and automates student development tracking with weekly progress reports created over time series data.</li>
          <li><strong>Agile Development Culture:</strong> With a software team of six, AI models, secure backend architecture, and user-friendly interfaces were successfully implemented by adopting Agile/Scrum principles.</li>
    `,
    tower_modal_list: `
          <li><strong>Advanced 2D Rendering:</strong> A dynamic animation render system was designed for multi-directional boss sprites and the "Y-Sorting" algorithm that provides 2D depth perception.</li>
          <li><strong>AI and Pathfinding:</strong> Optimized logical pathfinding mechanics working on a map matrix (grid) were developed.</li>
          <li><strong>Strategic Gameplay Mechanics:</strong> Instead of a traditional health bar, a 3-stage (3-Target) progressive base system, resource management, and a dynamic wave system that make defense more strategic were coded.</li>
          <li><strong>Software Architecture and Teamwork:</strong> With a 4-person developer team, a central AudioManager class was built to prevent music and sound conflicts during transitions between game states (State Machine).</li>
    `,
    shooter_modal_list: `
          <li><strong>AI and Pathfinding:</strong> An enemy AI architecture was developed that dynamically tracks the player using NavMesh and runtime target resolution (Tag/Transform) and attacks with range control.</li>
          <li><strong>Algorithmic Difficulty Scaling:</strong> A game mechanic that exponentially increases the damage multiplier ($2^n$) with each respawn of the enemy was coded.</li>
          <li><strong>Procedural Spawning and Life Cycle:</strong> A modular EnemySpawner system was established that generates random coordinates within scene boundaries (AABB Collider) and manages the object life cycle (Instantiate/Destroy).</li>
          <li><strong>UI/UX Integration:</strong> A real-time health tracking interface was applied for the player and enemies using TextMeshPro (TMP) and Slider components.</li>
    `,

    // Oyunlar
    games_eyebrow: "games",
    games_title: "Games",
    game_1_title: "Flower Shop Simulator",
    game_1_desc: "A project combining game development and graphic design skills; a simulation game where players manage their own flower shop. In addition to in-game mechanics such as in-store inventory management, timely preparation of customer orders, and designing aesthetic flower arrangements, it also includes the production of original digital art assets that make up the visual world of the game.",
    game_2_title: "Tower Defense Game",
    game_2_desc: "A medieval fantasy-themed 2D tower defense game developed using C++ and the Raylib library. It features advanced pathfinding, a dynamic wave system, and strategic base mechanics.",
    game_3_title: "Shooter Game",
    game_3_desc: "An arena-style survival game developed using Unity and C#. It includes NavMesh-based smart enemy AI, procedural spawning, and dynamic difficulty algorithms.",
    game_4_title: "Balance Duck",
    game_4_desc: "A tower building game developed with Unity. A reflex and strategy game based on building the highest tower by dropping blocks at the right time.",

    // Araçlar
    tools_eyebrow: "tools & skills",
    tools_title: "My Tools",
    tools_what_i_do: "What I do",
    tools_what_i_do_desc: "Focusing on game development and software engineering, I mainly concentrate on complex algorithms, problem-solving, and building backend architectures.<br><br>While developing game mechanics, OOP, and system architectures, I carry out both the technical logic and design processes of projects together.",
    tools_current: "Currently working on",
    tools_current_desc: "<strong>New Game Project:</strong> A new game idea I am actively working on its mechanics and design.<br><br><strong>Academic & Project Processes:</strong> In my transition to the 4th year of Software Eng., I continue to develop service architectures, conflict algorithms, and concurrent data processing tools.",
    tools_tech: "Technologies",
    tools_lang: "Languages & Engines:",
    tools_arch: "Architecture & Approaches:",
    tools_data: "Data & Libraries:",
    
    // Sertifikalar
    certs_title: "Certificates",
    cert_1: "AI Algorithms Used in Digital Games",
    cert_2: "Introduction to Digital Chip Design",
    cert_3: "Game Development with Unity",
    cert_4: "Process Improvement and Problem Solving Techniques",
    cert_5: "Cybersecurity in Advanced Technologies",
    cert_6: "Flutter Certificate",
    cert_7: "Hackers of the Future",
    cert_8: "Eclipse Java Training",

    // İletişim & Footer
    contact_eyebrow: "contact",
    contact_title: "Get in Touch",
    contact_email: "e-mail",
    contact_location: "location",
    contact_location_val: "Ankara, Turkey",

    // Maskot
    mascot_speech: "Hello! 👋",
    mascot_speech_projects: "Here are my Projects! 👉",
    mascot_speech_games: "Here are my Games! 🎮",

    // Typewriter
    typewriter_1: "Software Engineering Student",
    typewriter_2: "Graphic Design Student",
    typewriter_3: "Game Developer (Unity)"
  }
};
