// ==========================================
// 네이버 지도 초기화
// ==========================================
const STOP_COORDS = {
  start:  { name: '구일역 2번 출구',  lat: 37.4961, lng: 126.8477 },
  stop01: { name: '서울아트책보고',   lat: 37.4982, lng: 126.8659 },
  ground: { name: '그라운드 고척',    lat: 37.4966, lng: 126.8487 },
  dome:   { name: '고척 스카이돔',    lat: 37.4982, lng: 126.8659 },
};

function initNaverMap() {
  if (typeof naver === 'undefined' || !naver.maps) return;

  const map = new naver.maps.Map('naver-map', {
    center: new naver.maps.LatLng(37.4972, 126.8570),
    zoom: 15,
    mapTypeControl: false,
    zoomControl: false,
    scaleControl: false,
  });

  const markerIcon = (active) => ({
    content: `<div style="width:12px;height:12px;background:${active ? '#fff' : '#F4711A'};border-radius:50%;border:2px solid #F4711A;box-shadow:0 0 0 2px rgba(244,113,26,0.3);"></div>`,
    anchor: new naver.maps.Point(6, 6),
  });

  const markers = {};
  Object.entries(STOP_COORDS).forEach(([id, data]) => {
    markers[id] = new naver.maps.Marker({
      position: new naver.maps.LatLng(data.lat, data.lng),
      map: map,
      title: data.name,
      icon: markerIcon(false),
    });
  });

  function activateStop(stopId) {
    Object.entries(markers).forEach(([id, marker]) => {
      marker.setIcon(markerIcon(id === stopId));
    });
    const coords = STOP_COORDS[stopId];
    if (coords) map.panTo(new naver.maps.LatLng(coords.lat, coords.lng));
  }

  document.querySelectorAll('.tl-item[data-stop]').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.tl-item').forEach(el => el.classList.remove('tl-active'));
      item.classList.add('tl-active');
      activateStop(item.dataset.stop);
    });
  });
}

window.addEventListener('load', initNaverMap);

// ==========================================
// 외부 SDK 설정 (열쇠 등록)
// ==========================================
// 카카오 개발자 센터(developers.kakao.com)에서 발급받은 'JavaScript 키'를 아래에 입력해 주세요.
// 예: const KAKAO_APP_KEY = '1234567890abcdef...';
const KAKAO_APP_KEY = 'YOUR_KAKAO_APP_KEY';

// 카카오 SDK 초기화
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

// 카카오톡 공유 기능
function shareKakao() {
  if (typeof Kakao !== 'undefined' && Kakao.isInitialized() && KAKAO_APP_KEY && KAKAO_APP_KEY !== 'YOUR_KAKAO_APP_KEY') {
    try {
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: '고척돔 먹킷리스트 🍖⚾',
          description: '줄 없이, 맛있게, 경기 1시간 전 완벽 코스',
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
      title: '고척돔 먹킷리스트',
      text: '줄 없이, 맛있게, 경기 1시간 전 완벽 코스! 고척돔 직관 전 꼭 보세요.',
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
      title: '고척돔 먹킷리스트',
      text: '줄 없이, 맛있게, 경기 1시간 전 완벽 코스!',
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
