# 문서 업데이트 가이드

**작성일**: 2024-12-03  
**목적**: 중앙집중식 문서 관리 시스템 사용 가이드

---

## 🎯 핵심 원칙

**`DEVELOPMENT_PLAN.md`가 마스터 문서입니다.**  
모든 체크리스트, Phase별 진행 상황, 우선순위는 이 문서에서만 관리합니다.

---

## 📋 문서 구조

```
DEVELOPMENT_PLAN.md (마스터 문서) ⭐
├── 체크리스트 (모든 Phase)
├── Phase별 진행 상황 (✅ 완료 / ⏳ 진행 중 / ❌ 미시작)
├── 우선순위 요약
└── 기술 스택

다른 문서들 (이 문서 참조)
├── SESSION_CONTINUITY.md → 현재 상태 요약
├── CURRENT_STATUS.md → Phase별 완료 상태 요약
├── ARCHITECTURE.md → 아키텍처 설계 (고유 내용)
├── PROJECT_STRUCTURE.md → 프로젝트 구조 (고유 내용)
└── MODULE_DEPENDENCIES.md → 모듈 의존성 (고유 내용)
```

---

## 🔄 업데이트 워크플로우

### 1. 체크리스트 완료 시

**작업 순서:**
1. ✅ `DEVELOPMENT_PLAN.md`의 해당 Phase 체크리스트에서 `[ ]` → `[x]` 변경
2. ✅ Phase가 완료되면 Phase 상태 업데이트 (예: `⏳ 진행 중` → `✅ 완료`)
3. ✅ 필요 시 `CURRENT_STATUS.md`의 "완료된 작업" 섹션 업데이트

**예시:**
```markdown
# DEVELOPMENT_PLAN.md
- [x] Supabase에서 통계 데이터 조회  ← 체크 완료
- [x] 블로그 게시물 수 집계  ← 체크 완료

# Phase 1.5: 대시보드 데이터 연동 ✅ 완료  ← 상태 변경
```

---

### 2. Phase 진행 상황 변경 시

**작업 순서:**
1. ✅ `DEVELOPMENT_PLAN.md`의 Phase 상태 업데이트
   - `✅ 완료`: 모든 체크리스트 완료
   - `⏳ 진행 중`: 일부 체크리스트 완료
   - `❌ 미시작`: 아직 시작하지 않음
2. ✅ `SESSION_CONTINUITY.md`의 "완료된 작업" 섹션 업데이트
3. ✅ `CURRENT_STATUS.md`의 "다음 단계" 섹션 업데이트

**예시:**
```markdown
# DEVELOPMENT_PLAN.md
### Phase 1.5: 대시보드 데이터 연동 ⏳ 진행 중
- [x] Supabase에서 통계 데이터 조회
- [ ] 블로그 게시물 수 집계  ← 아직 진행 중

# SESSION_CONTINUITY.md
### Phase 1.5: 대시보드 데이터 연동 ⏳ 진행 중
- [x] Supabase에서 통계 데이터 조회
```

---

### 3. 우선순위 변경 시

**작업 순서:**
1. ✅ `DEVELOPMENT_PLAN.md`의 "우선순위 요약" 섹션 업데이트
2. ✅ `SESSION_CONTINUITY.md`의 "당장 해야 할 작업" 섹션 업데이트

**예시:**
```markdown
# DEVELOPMENT_PLAN.md
### 즉시 진행 (우선순위 1)
1. 대시보드 데이터 연동 (Phase 1.5)  ← 우선순위 변경
2. 성과 분석 대시보드 (Phase 1.6)
```

---

### 4. 아키텍처 변경 시

**작업 순서:**
1. ✅ `DEVELOPMENT_PLAN.md`의 "프로젝트 아키텍처 원칙" 업데이트
2. ✅ `ARCHITECTURE.md` 업데이트 (상세 설계)
3. ✅ `MODULE_DEPENDENCIES.md` 업데이트 (의존성 변경)

**예시:**
```markdown
# DEVELOPMENT_PLAN.md
### 멀티 테넌트 원칙
- **새로운 원칙 추가**: API 키 자동 갱신  ← 아키텍처 변경

# ARCHITECTURE.md
## 🏢 멀티 테넌트 아키텍처
### API 키 자동 갱신
- 구현 방법 상세 설명...
```

---

### 5. 프로젝트 구조 변경 시

**작업 순서:**
1. ✅ `DEVELOPMENT_PLAN.md`의 "프로젝트 구조 설계" 업데이트
2. ✅ `PROJECT_STRUCTURE.md` 업데이트 (실제 구조)

**예시:**
```markdown
# DEVELOPMENT_PLAN.md
├── features/
│   ├── analytics/  ← 새 모듈 추가
│   │   └── components/

# PROJECT_STRUCTURE.md
│   ├── analytics/  ← 실제 구조 반영
│   │   └── components/
```

---

## ✅ 체크리스트 업데이트 예시

### 작업 완료 시

**Before:**
```markdown
### Phase 1.5: 대시보드 데이터 연동 ⏳ 진행 중
- [ ] Supabase에서 통계 데이터 조회
- [ ] 블로그 게시물 수 집계
```

**After:**
```markdown
### Phase 1.5: 대시보드 데이터 연동 ⏳ 진행 중
- [x] Supabase에서 통계 데이터 조회  ← 완료
- [ ] 블로그 게시물 수 집계
```

### Phase 완료 시

**Before:**
```markdown
### Phase 1.5: 대시보드 데이터 연동 ⏳ 진행 중
- [x] Supabase에서 통계 데이터 조회
- [x] 블로그 게시물 수 집계
- [x] 최근 활동 목록 구현
```

**After:**
```markdown
### Phase 1.5: 대시보드 데이터 연동 ✅ 완료
- [x] Supabase에서 통계 데이터 조회
- [x] 블로그 게시물 수 집계
- [x] 최근 활동 목록 구현
```

---

## 🚫 하지 말아야 할 것

1. ❌ **다른 문서에 체크리스트 중복 작성 금지**
   - 체크리스트는 `DEVELOPMENT_PLAN.md`에만 존재해야 함
   - 다른 문서는 참조만 함

2. ❌ **여러 문서에서 Phase 상태를 각각 관리 금지**
   - Phase 상태는 `DEVELOPMENT_PLAN.md`에서만 관리
   - 다른 문서는 이를 참조하여 요약만 함

3. ❌ **우선순위를 여러 문서에서 각각 관리 금지**
   - 우선순위는 `DEVELOPMENT_PLAN.md`에서만 관리
   - 다른 문서는 이를 참조하여 요약만 함

---

## 📝 작업 시 체크리스트

작업 시작 전:
- [ ] `DEVELOPMENT_PLAN.md`에서 해당 Phase 체크리스트 확인
- [ ] 현재 진행 상황 파악

작업 완료 시:
- [ ] `DEVELOPMENT_PLAN.md`의 체크리스트 업데이트
- [ ] Phase 상태 업데이트 (필요 시)
- [ ] 관련 문서 업데이트 (필요 시)

---

## 🔗 관련 문서

- **DEVELOPMENT_PLAN.md**: 마스터 문서 ⭐
- **SESSION_CONTINUITY.md**: 현재 상태 요약
- **CURRENT_STATUS.md**: Phase별 완료 상태 요약

---

**최종 업데이트**: 2024-12-03

