# Autobot 문서 디렉토리

**최종 업데이트**: 2024-12-03  
**문서 정리 완료**: Deprecated 문서 제거, 구조 최적화

---

## 📚 문서 목록

### ⭐ 필수 읽기 문서 (새 세션 시작 시)

1. **[SESSION_CONTINUITY.md](./SESSION_CONTINUITY.md)** ⭐⭐⭐
   - **새 채팅 시작 시 가장 먼저 읽어야 할 문서**
   - 프로젝트 개요 및 현재 상태
   - 완료된 작업 요약
   - 다음 우선순위 작업
   - 빠른 참조 가이드

2. **[DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)** ⭐⭐
   - **통합 마스터 개발 계획서** (버전 3.0.0)
   - Phase별 체크리스트 (모든 체크리스트는 여기서만 관리)
   - 아키텍처 원칙
   - 멀티 테넌트 데이터 모델
   - 우선순위 요약

3. **[DOCUMENT_UPDATE_GUIDE.md](./DOCUMENT_UPDATE_GUIDE.md)** ⭐
   - 문서 업데이트 워크플로우
   - 작업 완료 시 문서 업데이트 방법

### 📖 아키텍처 및 설계 문서

4. **[ARCHITECTURE.md](./ARCHITECTURE.md)**
   - 전체 아키텍처 설계
   - 프론트엔드/백엔드 아키텍처
   - 보안 아키텍처
   - 데이터 플로우

5. **[MODULE_DEPENDENCIES.md](./MODULE_DEPENDENCIES.md)**
   - 모듈 의존성 맵
   - 의존성 규칙 및 검증
   - 순환 의존성 체크

6. **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)**
   - 현재 프로젝트 구조
   - 생성된 파일 목록
   - 경로 별칭 설정

### 🛠️ 설정 및 가이드

7. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**
   - 프로젝트 초기 설정 가이드
   - Supabase 설정
   - 외부 API 설정
   - 개발 환경 구축

8. **[SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md)**
   - 설정 체크리스트
   - 단계별 확인 사항

9. **[SUPABASE_OAUTH_SETUP.md](./SUPABASE_OAUTH_SETUP.md)**
   - Supabase OAuth 설정 가이드
   - Google, GitHub, Kakao OAuth 설정

10. **[SUPABASE_OAUTH_TROUBLESHOOTING.md](./SUPABASE_OAUTH_TROUBLESHOOTING.md)**
    - OAuth 문제 해결 가이드
    - 일반적인 문제 및 해결 방법

11. **[VERCEL_ENV_DETAILED_SETUP.md](./VERCEL_ENV_DETAILED_SETUP.md)**
    - Vercel 환경 변수 상세 설정 가이드

12. **[DEBUGGING_CHECKLIST.md](./DEBUGGING_CHECKLIST.md)**
    - 디버깅 체크리스트
    - 배포 후 확인 사항

### 📊 상태 및 피드백

13. **[CURRENT_STATUS.md](./CURRENT_STATUS.md)**
    - 현재 프로젝트 상태 요약
    - Phase별 완료 상태
    - 다음 단계 요약

14. **[PROJECT_FEEDBACK.md](./PROJECT_FEEDBACK.md)**
    - 프로젝트 피드백 및 개선 제안
    - 아키텍처 개선 방안

### 🔑 참고 문서

15. **[API_KEYS.md](./API_KEYS.md)**
    - API 키 관리 (민감 정보)
    - ⚠️ Git에 커밋되지 않음

16. **[ffmpeg.md](./ffmpeg.md)**
    - n8n 기반 영상 생성 참고 문서
    - FFmpeg 구현 참고 자료

17. **[lighthouse.json](./lighthouse.json)**
    - Lighthouse 설정 파일

---

## 🎯 문서 사용 가이드

### 새 세션 시작 시 (가장 중요!)
1. **`SESSION_CONTINUITY.md`** 먼저 읽기 ⭐
2. **`DEVELOPMENT_PLAN.md`** 확인 (체크리스트 및 Phase 진행 상황)
3. **`DOCUMENT_UPDATE_GUIDE.md`** 확인 (작업 시 문서 업데이트 방법)

### 프로젝트 설정 시
1. `SETUP_GUIDE.md` 따라하기
2. `SETUP_CHECKLIST.md` 확인
3. `SUPABASE_OAUTH_SETUP.md` (OAuth 필요 시)
4. `VERCEL_ENV_DETAILED_SETUP.md` (배포 시)

### 모듈 개발 시
1. `DEVELOPMENT_PLAN.md`에서 해당 모듈 설계 확인
2. `MODULE_DEPENDENCIES.md`에서 의존성 확인
3. `ARCHITECTURE.md`에서 아키텍처 패턴 확인
4. `PROJECT_STRUCTURE.md`에서 구조 확인

### 문제 해결 시
1. `DEBUGGING_CHECKLIST.md` 확인
2. `SETUP_GUIDE.md`의 문제 해결 섹션 확인
3. `SUPABASE_OAUTH_TROUBLESHOOTING.md` (OAuth 문제 시)
4. `MODULE_DEPENDENCIES.md`에서 의존성 문제 확인

---

## 📝 문서 업데이트 규칙

### ⚠️ 중요 원칙
- **모든 체크리스트와 Phase 진행 상황은 `DEVELOPMENT_PLAN.md`에서만 관리**
- 작업 완료 시 `DEVELOPMENT_PLAN.md` 먼저 업데이트
- 필요 시 관련 문서도 업데이트

### 문서 업데이트 순서
1. `DEVELOPMENT_PLAN.md` - 체크리스트 및 Phase 진행 상황 업데이트
2. `SESSION_CONTINUITY.md` - 현재 상태 요약 업데이트 (필요 시)
3. `CURRENT_STATUS.md` - 상태 요약 업데이트 (필요 시)
4. 기타 관련 문서 업데이트

### Deprecated 문서
다음 문서들은 `DEVELOPMENT_PLAN.md`에 통합되어 삭제되었습니다:
- ~~`QUALITY_AUTOMATION_PLAN.md`~~ (삭제됨)
- ~~`FFMPEG_IMPLEMENTATION_PLAN.md`~~ (삭제됨)
- ~~`MULTI_TENANT_ARCHITECTURE.md`~~ (삭제됨)

---

## 🔄 문서 정리 이력

**2024-12-03**: 문서 정리 완료
- Deprecated 문서 3개 삭제
- README.md 업데이트 및 구조 최적화
- 문서 사용 가이드 개선

---

**최종 업데이트**: 2024-12-03

