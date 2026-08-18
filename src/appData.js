// [정적 데이터 상수 강제 매핑 - API/DB 의존성 제거]
const PORTFOLIO_DATA = [
    { id: 'dEPkxRTjsy8', title: '한양대 토크콘서트 인트로 영상', cat: 'production', tag: '한양대', label: '모션그래픽' },
    { id: 'nzSjVbxNrnc', title: 'NE능률 나는쌤이다 웹예능 콘텐츠', cat: 'edu', tag: 'NE능률', label: '교육 콘텐츠' },
    { id: 'PAvJORGcUTU', title: '에듀팡 일본어 모션그래픽 인트로', cat: 'production', tag: '에듀팡', label: '모션그래픽' },
    { id: '4cnYAzIvagw', title: '동아출판 AI 디지털 교과서 교사 인터뷰', cat: 'edu', tag: '동아출판', label: 'AI 디지털 교과서' },
    { id: 'DIdduzeub5U', title: '후미디어 뉴미디어 채널 브랜딩 인트로', cat: 'production', tag: 'WHOMEDIA', label: '채널 인트로' },
    { id: '0kHSItVXKOU', title: '능률 고등 영어 교재 연계 스마트 강좌', cat: 'edu', tag: 'NE능률', label: '이러닝 콘텐츠 개발' },
    { id: '6xb2GYInARg', title: '능률 중등 영어 맞춤형 학습 영상', cat: 'edu', tag: 'NE능률', label: '교육 콘텐츠' },
    { id: 'rJ2U9T27WwU', title: '태진옥 브랜드 시네마틱 홍보영상', cat: 'press', tag: '태진옥', label: '홍보 영상 제작' },
    { id: 'PTqpVR-yIKg', title: '경희사이버대학교 가상 크로마키 강좌', cat: 'production', tag: '경희사이버대', label: '크로마키 스튜디오' },
    { id: 'AbeWeusmjws', title: '86인치 전자칠판 스마트 강의 스튜디오', cat: 'production', tag: '전자칠판', label: '영상 프로덕션' },
    { id: 'PVVdU-CYowA', title: '웅진 스마트학습 연계 디지털 교재 강의', cat: 'edu', tag: '웅진씽크빅', label: '전자칠판' },
    { id: 'PxAZYrpdowU', title: '웅진 스마트 학습 특수 무반사 블랙보드 강의', cat: 'edu', tag: '웅진씽크빅', label: '블랙보드' },
    { id: 'x4Cb5At6Z_M', title: 'CG 인터랙티브 스마트 모션 강의', cat: 'production', tag: 'WHOMEDIA', label: 'CG/인터랙티브' },
    { id: 'JwCrB4dKgDU', title: '후캠퍼스 모바일 태블릿 에듀 강좌', cat: 'hucampus', tag: 'WHOMEDIA', label: '태블릿 강의' },
    { id: '54m2LENAo68', title: '스튜디오 대형 크로마키 강좌 연출', cat: 'production', tag: 'WHOMEDIA', label: '크로마키' },
    { id: 'WaxhtAZLLV8', title: '교수진 맞춤형 크로마키 촬영', cat: 'production', tag: 'WHOMEDIA', label: '크로마키 촬영' },
    { id: 'paYW3d0MRqk', title: 'EBS 올쏘 핵심강좌 오프닝 모션그래픽', cat: 'production', tag: 'EBS', label: '모션그래픽' },
    { id: 'komXGh3TGSo', title: 'EBS 천일문 메인 타이틀 연출', cat: 'production', tag: 'EBS', label: '타이틀 연출' },
    { id: 'cF7i6m9apsE', title: 'EBS 포텐시리즈 모션 오프닝', cat: 'production', tag: 'EBS', label: '모션그래픽' },
    { id: '-Is7q7qD9Rc', title: '한국AI교육신문 & 뉴미디어 PR 브랜딩', cat: 'press', tag: '유튜브PR', label: '디지털 언론 PR' }
];

// GitHub 신규 이미지 저장소 연동 설정 (whomedia01/who-new809/img/)
const GITHUB_USER = 'whomedia01';   // GitHub 사용자 계정
const GITHUB_REPO = 'who-new809';   // 신규 GitHub 저장소
const GITHUB_BRANCH = 'main';

// GitHub / jsDelivr 글로벌 CDN 및 raw 이미지 URL 생성 유틸리티 (who-new809/img/ 전용 매핑)
const getStudioCdnUrl = (fileName) => `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${GITHUB_BRANCH}/img/${encodeURIComponent(fileName)}`;
const getGithubRawUrl = (fileName) => `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}/img/${encodeURIComponent(fileName)}`;

// https://github.com/whomedia01/who-new809/tree/main/img 폴더 내 실제 이미지 파일 32종 전수 매핑
const STUDIO_PHOTO_FILES = [
    'DSCF0043.JPG',
    'DSCF0045.JPG',
    'DSCF0046.JPG',
    'DSCF0048.JPG',
    'DSCF0049.JPG',
    'DSCF0050.JPG',
    'DSCF0058.JPG',
    'DSCF0060.JPG',
    'DSCF0090.JPG',
    'DSCF0100.JPG',
    'DSCF0103.JPG',
    'DSCF0104.JPG',
    'DSCF0105.JPG',
    'DSCF0106.JPG',
    'DSCF0107.JPG',
    'DSCF0129.JPG',
    'DSCF0142.JPG',
    'DSCF0169.JPG',
    'DSCF0173.JPG',
    'DSCF0183.JPG',
    'DSCF0191.JPG',
    'DSCF0196.JPG',
    'DSCF0219.JPG',
    'DSCF0233.JPG',
    'DSCF0240.JPG',
    'DSCF0254.JPG',
    'DSCF0257.JPG',
    'KakaoTalk_20240124_151422660_01.jpg',
    'KakaoTalk_20240125_151732483_01.jpg',
    'KakaoTalk_20240126_151923014_05.jpg',
    'KakaoTalk_20240523_150928871.jpg',
    'KakaoTalk_20240523_150928871_02.jpg'
];

const STUDIO_IMAGES = STUDIO_PHOTO_FILES.map(fileName => getStudioCdnUrl(fileName));

const ORGANIZATION_DATA = [
    { id: 'div-rd', code: 'R&D CENTER', name: '기업부설연구소', desc: 'AI 기반 교육 및 미디어 융합 기술 연구' },
    { id: 'div-1', code: 'DIVISION 01', name: '콘텐츠미디어본부', desc: '이러닝 교수설계, 맞춤형 콘텐츠 개발, 전문 스튜디오 운영, 멀티캠 제작' },
    { id: 'div-2', code: 'DIVISION 02', name: '교육사업본부', desc: 'AI·직무기술 특화 교육, 한국AI교육일보 발행, 후캠퍼스 평생교육원 운영' },
    { id: 'div-4', code: 'STAFF / SUPPORT', name: '경영지원팀', desc: '경영 기획, 재무, 인사 총괄' }
];

document.addEventListener('alpine:init', () => {
    Alpine.data('whomediaApp', () => ({
        scrolled: false, 
        mobileMenuOpen: false, 
        refTab: 'all',
        portfolioLimit: 12,
        videoModalOpen: false,
        activeVideoId: '',
        activeVideoTitle: '',
        imageModalOpen: false,
        activeStudioImg: '',
        activeStudioTitle: '',
        keywords: ['지식을 성과로 만드는 맞춤형 교육 솔루션', '맞춤형 이러닝 콘텐츠 개발', '160평 전문 스튜디오 & 고품질 영상 연출', '오프라인 기반 블렌디드 러닝 & 전문 특강', '지속가능한 성장을 이끄는 조직 체계'],
        currentKeywordIndex: 0,
        heroKeywords: ['이러닝 콘텐츠 개발', '하이엔드 영상 제작', '블렌디드 러닝'],
        heroKeywordIndex: 0,
        heroTypedText: '이러닝 콘텐츠 개발',
        isDeletingHeroText: false,
        heroCharIndex: 0,

        // [전체 포트폴리오 목록 - PORTFOLIO_DATA 상수로 100% 보장]
        portfolioItems: PORTFOLIO_DATA,
        studioImagesList: STUDIO_IMAGES,
        organizationDataList: ORGANIZATION_DATA,

        get filteredPortfolio() {
            if (this.refTab === 'all') return this.portfolioItems;
            return this.portfolioItems.filter(item => item.cat === this.refTab);
        },

        openModal(videoId, videoTitle) {
            this.activeVideoId = videoId;
            this.activeVideoTitle = videoTitle;
            this.videoModalOpen = true;
        },
        closeModal() {
            this.videoModalOpen = false;
            this.activeVideoId = '';
            this.activeVideoTitle = '';
        },
        openImageModal(imgUrl, title) {
            this.activeStudioImg = imgUrl;
            this.activeStudioTitle = title;
            this.imageModalOpen = true;
        },
        closeImageModal() {
            this.imageModalOpen = false;
            this.activeStudioImg = '';
            this.activeStudioTitle = '';
        },
        naverMapUrl: 'https://map.naver.com/p/search/%ED%9B%84%EB%AF%B8%EB%94%94%EC%96%B4/place/13314547',
        showMobileOrgModal: false,
        inquirySuccessModal: false,
        inquirySuccessMessage: '',
        inquirySubmitting: false,
        inquiryForm: {
            company: '',
            name: '',
            phone: '',
            category: '',
            message: '',
            consent: false
        },

        init() {
            try {
                setInterval(() => { this.currentKeywordIndex = (this.currentKeywordIndex + 1) % this.keywords.length; }, 2800);
                this.startHeroTyping();
                this.startServiceAutoPlay();
                this.startAboutAutoPlay();
                this.startStudioAutoPlay();
                this.loadStudioImagesFromGithub();

                // Periodic sync (every 60s) to reflect any additions/replacements/deletions on GitHub
                setInterval(() => {
                    this.loadStudioImagesFromGithub();
                }, 60000);
            } catch(e) {
                console.warn('Init non-blocking exception handled:', e);
            }
        },

        startHeroTyping() {
            const words = this.heroKeywords;
            let wordIdx = 0;
            let charIdx = words[0].length;
            let isDeleting = false;
            this.heroTypedText = words[0];

            const tick = () => {
                const currentWord = words[wordIdx];
                if (isDeleting) {
                    charIdx--;
                    this.heroTypedText = currentWord.substring(0, charIdx);
                } else {
                    charIdx++;
                    this.heroTypedText = currentWord.substring(0, charIdx);
                }

                let delay = isDeleting ? 40 : 85;

                if (!isDeleting && charIdx === currentWord.length) {
                    delay = 2300; // Pause on completed word (2.3s)
                    isDeleting = true;
                } else if (isDeleting && charIdx === 0) {
                    isDeleting = false;
                    wordIdx = (wordIdx + 1) % words.length;
                    this.heroKeywordIndex = wordIdx;
                    delay = 350; // Pause before typing next word
                }

                setTimeout(tick, delay);
            };

            setTimeout(() => {
                isDeleting = true;
                setTimeout(tick, 2000);
            }, 1800);
        },

        async submitInquiry() {
            if (!this.inquiryForm.company || !this.inquiryForm.name || !this.inquiryForm.phone || !this.inquiryForm.category || !this.inquiryForm.message) {
                alert('필수 문의 항목을 모두 작성해 주세요.');
                return;
            }
            if (!this.inquiryForm.consent) {
                alert('개인정보 수집 및 이용 동의에 체크해 주세요.');
                return;
            }
            this.inquirySubmitting = true;

            const createdAt = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

            // Dispatch to Express Backend (/api/inquiry)
            try {
                await fetch('/api/inquiry', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.inquiryForm)
                });
            } catch (err) {
                console.warn('Inquiry API dispatch fallback:', err);
            }

            // Direct client-side dispatch to FormSubmit API for target email list
            const targetEmails = ['whomedia03@gmail.com', 'james5183@naver.com', 'apark12321@gmail.com'];
            
            for (const email of targetEmails) {
                try {
                    await fetch('https://formsubmit.co/ajax/' + email, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json' 
                        },
                        body: JSON.stringify({
                            _subject: '[WHOMEDIA 신규 프로젝트 문의] ' + this.inquiryForm.company + ' - ' + this.inquiryForm.name + '님',
                            _template: 'table',
                            _captcha: 'false',
                            '기관/회사명': this.inquiryForm.company,
                            '담당자': this.inquiryForm.name,
                            '연락처': this.inquiryForm.phone,
                            '문의유형': this.inquiryForm.category,
                            '상세내용': this.inquiryForm.message,
                            '접수시각': createdAt
                        })
                    });
                } catch(e) {
                    console.warn('Client direct email dispatch exception for ' + email + ':', e);
                }
            }

            this.inquirySuccessMessage = '작성해주신 프로젝트/임대 문의가 담당자에게 성공적으로 접수되었습니다.';
            this.inquirySuccessModal = true;
            this.inquiryForm = { company: '', name: '', phone: '', category: '', message: '', consent: false };
            this.inquirySubmitting = false;
        },
        activeServiceIndex: 0,
        serviceAutoTimer: null,
        startServiceAutoPlay() {
            if (this.serviceAutoTimer) clearInterval(this.serviceAutoTimer);
            this.serviceAutoTimer = setInterval(() => {
                this.nextServiceCard();
            }, 3500);
        },
        stopServiceAutoPlay() {
            if (this.serviceAutoTimer) {
                clearInterval(this.serviceAutoTimer);
                this.serviceAutoTimer = null;
            }
        },
        restartServiceAutoPlay(delay = 6000) {
            this.stopServiceAutoPlay();
            setTimeout(() => {
                this.startServiceAutoPlay();
            }, delay);
        },
        nextServiceCard() {
            this.activeServiceIndex = (this.activeServiceIndex + 1) % 3;
            this.scrollToServiceCard();
        },
        prevServiceCard() {
            this.activeServiceIndex = (this.activeServiceIndex + 2) % 3;
            this.scrollToServiceCard();
        },
        selectServiceCard(index) {
            this.activeServiceIndex = index;
            this.scrollToServiceCard();
        },
        scrollToServiceCard() {
            const container = document.getElementById('service-cards-container') || document.getElementById('services-cards-container');
            const targetCard = document.getElementById('service-card-' + this.activeServiceIndex);
            if (container && targetCard) {
                const scrollLeft = targetCard.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (targetCard.clientWidth / 2);
                container.scrollTo({
                    left: Math.max(0, scrollLeft),
                    behavior: 'smooth'
                });
            }
        },
        aboutActiveIndex: 0,
        aboutAutoTimer: null,

        // [스튜디오 & 제작 환경 확장형 데이터 베이스 & 슬라이더 관리 - who-new809/img 전용]
        activeStudioIndex: 0,
        studioAutoTimer: null,
        studioTouchStartX: 0,
        studioTouchEndX: 0,

        // https://github.com/whomedia01/who-new809/tree/main/img 내 실제 파일 32종으로만 100% 구성
        studioInfrastructure: STUDIO_PHOTO_FILES.map((fileName, idx) => ({
            id: `studio_img_${idx + 1}`,
            index: idx + 1,
            title: `후미디어 전문 스튜디오 전경 #${String(idx + 1).padStart(2, '0')}`,
            fileName: fileName,
            imageUrl: getStudioCdnUrl(fileName),
            rawUrl: getGithubRawUrl(fileName),
            thumbUrl: getStudioCdnUrl(fileName)
        })),

        startStudioAutoPlay() {
            if (this.studioAutoTimer) clearInterval(this.studioAutoTimer);
            this.studioAutoTimer = setInterval(() => {
                this.nextStudioSlide();
            }, 2700);
        },
        stopStudioAutoPlay() {
            if (this.studioAutoTimer) {
                clearInterval(this.studioAutoTimer);
                this.studioAutoTimer = null;
            }
        },
        nextStudioSlide() {
            if (!this.studioInfrastructure || this.studioInfrastructure.length === 0) return;
            this.activeStudioIndex = (this.activeStudioIndex + 1) % this.studioInfrastructure.length;
            this.scrollStudioThumbnail();
        },
        prevStudioSlide() {
            if (!this.studioInfrastructure || this.studioInfrastructure.length === 0) return;
            this.activeStudioIndex = (this.activeStudioIndex + this.studioInfrastructure.length - 1) % this.studioInfrastructure.length;
            this.scrollStudioThumbnail();
        },
        selectStudioSlide(index) {
            this.activeStudioIndex = index;
            this.scrollStudioThumbnail();
        },
        scrollStudioThumbnail() {
            const container = document.getElementById('studio-thumbs-container');
            const target = document.getElementById('studio-thumb-' + this.activeStudioIndex);
            if (container && target) {
                container.scrollTo({
                    left: target.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (target.clientWidth / 2),
                    behavior: 'smooth'
                });
            }
        },
        async loadStudioImagesFromGithub() {
            try {
                // 1. Try server-side cached endpoint first
                const res = await fetch('/api/studio-images');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && Array.isArray(data.images) && data.images.length > 0) {
                        this.studioInfrastructure = data.images;
                        this.studioImagesList = data.images.map(img => img.imageUrl);
                        if (this.activeStudioIndex >= this.studioInfrastructure.length) {
                            this.activeStudioIndex = 0;
                        }
                        return;
                    }
                }
            } catch (e) {
                console.warn('Server API image sync fallback to direct GitHub API:', e);
            }

            try {
                // 2. Direct GitHub API fallback
                const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/img?ref=${GITHUB_BRANCH}`, {
                    headers: { 'Accept': 'application/vnd.github.v3+json' }
                });
                if (ghRes.ok) {
                    const ghData = await ghRes.json();
                    if (Array.isArray(ghData)) {
                        const imageExts = /\.(jpe?g|png|webp|svg|gif|avif)$/i;
                        const liveImages = ghData
                            .filter(item => item.type === 'file' && imageExts.test(item.name))
                            .map((item, idx) => ({
                                id: `studio_img_${idx + 1}`,
                                index: idx + 1,
                                title: `후미디어 전문 스튜디오 전경 #${String(idx + 1).padStart(2, '0')}`,
                                fileName: item.name,
                                imageUrl: getStudioCdnUrl(item.name),
                                rawUrl: item.download_url || getGithubRawUrl(item.name),
                                thumbUrl: getStudioCdnUrl(item.name)
                            }));

                        if (liveImages.length > 0) {
                            this.studioInfrastructure = liveImages;
                            this.studioImagesList = liveImages.map(img => img.imageUrl);
                            if (this.activeStudioIndex >= this.studioInfrastructure.length) {
                                this.activeStudioIndex = 0;
                            }
                        }
                    }
                }
            } catch (ghErr) {
                console.warn('Direct GitHub API sync exception (using default assets):', ghErr);
            }
        },
        startAboutAutoPlay() {
            if (this.aboutAutoTimer) clearInterval(this.aboutAutoTimer);
            this.aboutAutoTimer = setInterval(() => {
                this.nextAboutCard();
            }, 4500);
        },
        stopAboutAutoPlay() {
            if (this.aboutAutoTimer) {
                clearInterval(this.aboutAutoTimer);
                this.aboutAutoTimer = null;
            }
        },
        nextAboutCard() {
            this.aboutActiveIndex = (this.aboutActiveIndex + 1) % 5;
            this.scrollToAboutCard();
        },
        prevAboutCard() {
            this.aboutActiveIndex = (this.aboutActiveIndex + 4) % 5;
            this.scrollToAboutCard();
        },
        selectAboutCard(index) {
            this.aboutActiveIndex = index;
            this.scrollToAboutCard();
        },
        scrollToAboutCard() {
            const container = document.getElementById('about-cards-container');
            const targetCard = document.getElementById('about-card-' + this.aboutActiveIndex);
            if (container && targetCard) {
                const scrollLeft = targetCard.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (targetCard.clientWidth / 2);
                container.scrollTo({
                    left: Math.max(0, scrollLeft),
                    behavior: 'smooth'
                });
            }
        },
        loadMore() {
            this.portfolioLimit += 8;
        }
    }));
});
