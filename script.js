document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('#gnb a');
    const sections = document.querySelectorAll('.content-section');

    // 지정한 탭만 활성화 (내비 링크 + 섹션 동기화)
    function activateTab(targetId) {
        const target = document.getElementById(targetId);
        if (!target) return; // 잘못된 해시는 무시
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('data-target') === targetId));
        sections.forEach(s => s.classList.toggle('active', s.id === targetId));
    }

    // 탭 클릭 시 URL 해시만 갱신 → 딥링크/뒤로가기 지원
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            location.hash = link.getAttribute('data-target');
        });
    });

    // 해시 변경(뒤로/앞으로 가기 포함)에 따라 탭 전환
    window.addEventListener('hashchange', () => {
        activateTab(location.hash.replace('#', '') || 'home');
    });

    // 최초 진입 시 해시 반영 (딥링크로 특정 탭 바로 열기)
    activateTab(location.hash.replace('#', '') || 'home');

    // 다크/라이트 모드 토글 (테마는 <head>에서 미리 복원됨)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rootEl = document.documentElement;

    themeToggleBtn.addEventListener('click', () => {
        if (rootEl.getAttribute('data-theme') === 'light') {
            rootEl.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            rootEl.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    // Contact 폼 처리
    // TODO: 컨택트 서브 메일 발급 후 아래 CONTACT_ENDPOINT에 수신 주소(mailto: 또는 Formspree URL) 연결 예정
    const CONTACT_ENDPOINT = ''; // 비워두면 '준비 중' 안내만 표시
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!CONTACT_ENDPOINT) {
                alert('컨택 메일 시스템은 준비 중입니다. 차후 서브 메일이 연결됩니다.');
                return;
            }
            // 엔드포인트가 연결되면 이 지점에서 전송 로직 실행
            contactForm.action = CONTACT_ENDPOINT;
            contactForm.method = 'POST';
            contactForm.submit();
        });
    }
});
