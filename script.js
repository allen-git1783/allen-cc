// ─── 平滑滚动 ───────────────────────────────────────────────────────────────
// 拦截所有 href="#xxx" 的锚点链接，阻止默认的瞬间跳转，
// 改为平滑滚动到对应的目标元素顶部。
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// ─── 导航栏滚动阴影 ──────────────────────────────────────────────────────────
// 页面向下滚动超过 40px 时，给导航栏加 .scrolled 类；
// CSS 中 .navbar.scrolled 定义了阴影样式，滚回顶部时自动移除。
// { passive: true } 告知浏览器此监听器不会调用 preventDefault，允许滚动优化。
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ─── 明暗主题切换 ────────────────────────────────────────────────────────────
// 主题状态存在 localStorage，刷新页面后恢复上次选择（默认浅色）。
// 通过在 <html> 上设置 data-theme="dark" 来切换 CSS 变量，无需操作具体元素。
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️'; // 深色模式下显示太阳，表示"切换到浅色"
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.textContent = '🌙'; // 浅色模式下显示月亮，表示"切换到深色"
    }
    localStorage.setItem('theme', theme);
}

// 页面加载时立即应用上次保存的主题
applyTheme(localStorage.getItem('theme') || 'light');

// 点击按钮时读取当前主题并切换到另一个
themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    applyTheme(isDark ? 'light' : 'dark');
});

// ─── 滚动入场动画 ────────────────────────────────────────────────────────────
// 用 IntersectionObserver 监视各卡片/区块元素。
// 初始状态：CSS 中 .reveal-ready 将元素设为透明并向下偏移。
// 当元素进入视口 12% 时，加上 .revealed 类触发淡入上移动画。
// unobserve 确保每个元素只触发一次，不重复执行。
const revealEls = document.querySelectorAll(
    '.portfolio-item, .service-card, .stat, .info-item, .about-image-col, .about-text-col'
);

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target); // 动画触发后停止监听，节省性能
        }
    });
}, { threshold: 0.12 }); // 元素露出 12% 时触发

revealEls.forEach(el => {
    el.classList.add('reveal-ready'); // 设置初始隐藏状态
    observer.observe(el);
});

// ─── Lightbox 图片预览 ───────────────────────────────────────────────────────
// 点击作品卡片 → 打开全屏预览弹层，显示高清大图、分类标签和标题。
// 关闭方式：点击 ✕ 按钮、点击背景遮罩、或按 Esc 键。
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTag = document.getElementById('lightboxTag');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxDownload = document.getElementById('lightboxDownload');

function openLightbox(item) {
    const src = item.dataset.src; // 高清图 URL 存在 data-src 属性上
    lightboxImg.src = src;
    lightboxImg.alt = item.dataset.title;
    lightboxTag.textContent = item.dataset.tag;
    lightboxTitle.textContent = item.dataset.title;
    // 把图片地址和文件名暂存到下载按钮的 data 属性，供下载逻辑读取
    lightboxDownload.dataset.src = src;
    lightboxDownload.dataset.filename = item.dataset.title + '.jpg';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden'; // 禁止背景页面滚动
}

function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = ''; // 恢复页面滚动
    lightboxImg.src = ''; // 清空 src，释放内存并中止未完成的图片加载
}

// 给每个有 data-src 的作品卡片绑定点击事件
document.querySelectorAll('.portfolio-item[data-src]').forEach(item => {
    item.style.cursor = 'zoom-in';
    item.addEventListener('click', () => openLightbox(item));
});

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxBackdrop').addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
});

// ─── 图片下载 ────────────────────────────────────────────────────────────────
// 浏览器对跨域 URL 的 <a download> 不生效（会直接在新标签打开）。
// 解决方案：用 fetch 把图片内容拉取到本地，转成 blob URL，
// 再用隐藏的 <a> 元素触发浏览器的"另存为"行为。
lightboxDownload.addEventListener('click', async function(e) {
    e.preventDefault();
    const src = this.dataset.src;
    const filename = this.dataset.filename;
    const span = this.querySelector('span');
    const original = span.textContent;

    // 下载期间禁用按钮，防止重复点击
    span.textContent = '下载中…';
    this.style.pointerEvents = 'none';

    try {
        const res = await fetch(src);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob); // 创建临时的本地 blob URL
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click(); // 触发下载
        URL.revokeObjectURL(url); // 立即释放 blob URL，避免内存泄漏
        span.textContent = '已下载';
        setTimeout(() => { span.textContent = original; }, 2000);
    } catch {
        span.textContent = '下载失败';
        setTimeout(() => { span.textContent = original; }, 2000);
    } finally {
        this.style.pointerEvents = ''; // 无论成功失败都恢复按钮可点击
    }
});
