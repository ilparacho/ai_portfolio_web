document.addEventListener('DOMContentLoaded', () => {
    // 탭 전환 로직
    const navLinks = document.querySelectorAll('#gnb a');
    const sections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 모든 탭 비활성화
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // 클릭한 탭 활성화
            link.classList.add('active');
            const targetId = link.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 다크/라이트 모드 토글 로직
    const themeToggleBtn = document.getElementById('theme-toggle');
    const rootEl = document.documentElement;

    themeToggleBtn.addEventListener('click', () => {
        if (rootEl.getAttribute('data-theme') === 'light') {
            rootEl.removeAttribute('data-theme');
        } else {
            rootEl.setAttribute('data-theme', 'light');
        }
    });
});