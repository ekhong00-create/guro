const KAKAO_APP_KEY = 'b4c8a954ffc56cce7b954de4329634ed';
let kakaoMap = null;

// ==========================================
// 외부 SDK 및 서비스 키 설정 (열쇠 등록)
// ==========================================
// 카카오 개발자 센터(developers.kakao.com)에서 발급받은 'JavaScript 키'를 아래에 입력해 주세요.
// 예: const KAKAO_APP_KEY = '1234567890abcdef...';

// 카카오 SDK 초기화 (공유용)
if (typeof Kakao !== 'undefined' && KAKAO_APP_KEY && KAKAO_APP_KEY !== 'YOUR_KAKAO_APP_KEY') {
  try {
    if (!Kakao.isInitialized()) {
      Kakao.init(KAKAO_APP_KEY);
      console.log("Kakao SDK 초기화 완료");
    }
  } catch (e) {
    console.error("Kakao SDK 초기화 중 에러 발생:", e);
  }
}

// ==========================================
// 카카오 지도 API 연동
// ==========================================

const MAP_COORDS = [
  { name: '구일역 2번 출구', lat: 37.49567, lng: 126.86789 },
  { name: 'STOP 01 서울아트책보고', lat: 37.4979, lng: 126.8671 },
  { name: 'STOP 02 그라운드 고척 (포장)', lat: 37.4994, lng: 126.8672 },
  { name: 'STOP 03 그라운드 고척 (안주)', lat: 37.4994, lng: 126.8672 },
  { name: '고척 스카이돔', lat: 37.4982, lng: 126.8671 },
  { name: 'STOP 04 뒷풀이', lat: 37.4998, lng: 126.8660 }
];

function showStaticMap() {
  const mapDiv = document.getElementById('map');
  const staticMapImg = document.getElementById('static-map');
  if (mapDiv) mapDiv.style.display = 'none';
  if (staticMapImg) staticMapImg.style.display = 'block';
}

// 서로 근접하거나 중복된 마커(STOP 01, 02, 03)가 겹쳐 보이지 않도록 
// 위치 좌표를 인위적으로 미세하게 흩뜨려주는(Offset) 함수
function getAdjustedCoords(pos) {
  let lat = pos.lat;
  let lng = pos.lng;
  
  // STOP 02와 STOP 03이 동일한 그라운드 고척 좌표이므로 중복을 피하기 위해 오프셋을 줍니다.
  if (pos.name.includes("STOP 03")) {
    lat += 0.00015; // 북동쪽 오프셋
    lng += 0.00015;
  }
  return { lat, lng };
}

function initKakaoMap() {
  try {
    if (typeof kakao === 'undefined' || !kakao.maps || !kakao.maps.Map) {
      showStaticMap();
      return;
    }

    const container = document.getElementById('map');
    const options = {
      center: new kakao.maps.LatLng(37.4982, 126.8671),
      level: 4
    };

    const map = new kakao.maps.Map(container, options);
    kakaoMap = map; // 전역 레퍼런스 저장
    const bounds = new kakao.maps.LatLngBounds();
    const linePath = [];

    MAP_COORDS.forEach((pos, idx) => {
      const adj = getAdjustedCoords(pos);
      const latlng = new kakao.maps.LatLng(adj.lat, adj.lng);
      linePath.push(latlng);
      bounds.extend(latlng);

      // Marker
      const marker = new kakao.maps.Marker({
        position: latlng,
        map: map,
        title: pos.name
      });

      // Custom Label Overlay
      // 야구장 감성 오렌지 컬러 매칭 스타일링
      const labelContent = `<div style="background:#F4711A;color:#fff;font-size:10px;font-weight:700;padding:3px 6px;border-radius:4px;border:1px solid rgba(255,255,255,0.7);box-shadow:0 1px 4px rgba(0,0,0,0.4);white-space:nowrap;transform:translateY(-36px);">${pos.name}</div>`;
      const customOverlay = new kakao.maps.CustomOverlay({
        position: latlng,
        content: labelContent,
        yAnchor: 1
      });
      customOverlay.setMap(map);
    });

    map.setBounds(bounds);
  } catch (e) {
    console.error("카카오 지도 초기화 중 에러가 발생하여 약도로 대체합니다:", e);
    showStaticMap();
  }
}

function loadKakaoMapScript() {
  if (!KAKAO_APP_KEY || KAKAO_APP_KEY === 'YOUR_KAKAO_APP_KEY') {
    showStaticMap();
    return;
  }

  try {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`;
    script.async = true;
    script.onload = () => {
      try {
        kakao.maps.load(() => {
          initKakaoMap();
        });
      } catch (err) {
        console.error("kakao.maps.load 콜백 실행 중 에러:", err);
        showStaticMap();
      }
    };
    script.onerror = () => {
      console.warn("카카오 지도 스크립트 로드 실패, 약도로 대체합니다.");
      showStaticMap();
    };
    document.head.appendChild(script);
  } catch (e) {
    console.error("loadKakaoMapScript 실행 중 에러:", e);
    showStaticMap();
  }
}

window.addEventListener('load', loadKakaoMapScript);

// 카카오톡 공유 기능
function shareKakao() {
  if (typeof Kakao !== 'undefined' && Kakao.isInitialized() && KAKAO_APP_KEY && KAKAO_APP_KEY !== 'YOUR_KAKAO_APP_KEY') {
    try {
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '고척돔 최단 동선 맛집 가이드 🍖⚾',
          description: '10년차 키움 팬이 알려주는 완벽 가이드',
          imageUrl: window.location.origin + '/images/extracted_image_2.jpg',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [{
          title: '코스 보러 가기',
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        }],
      });
      return;
    } catch (e) {
      console.error("Kakao Share Error, falling back...", e);
    }
  }
  
  // 카카오 SDK 미설정 시 폴백: 브라우저 기본 공유 기능 또는 링크 복사
  if (navigator.share) {
    navigator.share({
      title: '고척돔 최단 동선 맛집 가이드',
      text: '10년차 키움 팬이 알려주는 완벽 가이드! 고척돔 직관 전 꼭 보세요.',
      url: window.location.href
    }).catch(err => console.log("Share cancelled or failed: ", err));
  } else {
    copyLink();
  }
}

function copyLink() {
  const url = window.location.href;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(showToast);
  } else {
    const el = document.createElement('textarea');
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast();
  }
}

function shareMore() {
  if (navigator.share) {
    navigator.share({
      title: '고척돔 최단 동선 맛집 가이드',
      text: '10년차 키움 팬이 알려주는 완벽 가이드!',
      url: window.location.href
    }).catch(err => console.log("Share failed: ", err));
  } else {
    copyLink();
  }
}

function showToast() {
  const toast = document.getElementById('copy-toast');
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2200);
}

// ───── HERO 슬라이드쇼 ─────
(function() {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length < 2) return;
  let current = 0;

  function activate(el) {
    el.classList.remove('active');
    void el.offsetWidth;
    el.classList.add('active');
  }

  activate(slides[0]);

  setInterval(() => {
    const next = (current + 1) % slides.length;

    slides[next].classList.add('entering');

    setTimeout(() => {
      slides[current].classList.remove('active');
      slides[next].classList.remove('entering');
      activate(slides[next]);
      current = next;
    }, 1300);

  }, 5500);
})();

// ───── SCROLL FADE-IN ─────
(function() {
  const sections = document.querySelectorAll(
    '.timeline-section, .stop-section, .forno-section, .share-section'
  );

  sections.forEach(el => el.classList.add('fade-up'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
})();

// ───── 타임라인 아이템 클릭 시 지도 연동 ─────
(function() {
  const tlItems = document.querySelectorAll('.tl-item');
  tlItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      // 1. 기존 활성 클래스 제거 및 클릭한 아이템 활성화
      tlItems.forEach(el => el.classList.remove('tl-active'));
      item.classList.add('tl-active');

      // 2. 카카오 지도 연동 및 부드러운 중심 이동 (panTo)
      if (kakaoMap && MAP_COORDS[index]) {
        const pos = MAP_COORDS[index];
        const adj = getAdjustedCoords(pos);
        const moveLatLng = new kakao.maps.LatLng(adj.lat, adj.lng);
        
        // 1단계: 먼저 지도를 줌아웃하여 전체 경로맥락을 보여줌 (레벨 5)
        kakaoMap.setLevel(5, { animate: { duration: 250 } });

        // 2단계: 150ms 후에 부드럽게 목표 위치로 이동 (panTo)
        setTimeout(() => {
          if (kakaoMap) {
            kakaoMap.panTo(moveLatLng);
            
            // 3단계: 이동이 완료될 즈음(450ms 후) 상세 줌인 (레벨 3)
            setTimeout(() => {
              if (kakaoMap) {
                kakaoMap.setLevel(3, { 
                  animate: { duration: 250 },
                  anchor: moveLatLng
                });
              }
            }, 450);
          }
        }, 150);
      }
    });
  });
})();
