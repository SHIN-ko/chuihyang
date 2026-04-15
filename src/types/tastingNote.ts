export interface TastingNoteRatings {
  taste: number;       // 맛 (1-5)
  aroma: number;       // 향 (1-5)
  appearance: number;  // 외관 (1-5)
  body: number;        // 바디감 (1-5)
  finish: number;      // 여운 (1-5)
  overall: number;     // 전체 (1-5)
}

export interface TastingNote {
  ratings: TastingNoteRatings;
  color: string;         // 색상 설명
  memo: string;          // 자유 시음 메모
  tastingDate: string;   // 시음 날짜 (ISO string)
  createdAt: string;
  updatedAt: string;
}

export interface TasteType {
  title: string;
  description: string;
}

export interface TasteStats {
  totalTastings: number;
  averageOverall: number;
  highestDimension: { label: string; average: number };
  lowestDimension: { label: string; average: number };
  favoriteRecipe: { name: string; count: number } | null;
}

export const RATING_DIMENSIONS: { key: keyof TastingNoteRatings; label: string }[] = [
  { key: 'taste', label: '맛' },
  { key: 'aroma', label: '향' },
  { key: 'appearance', label: '외관' },
  { key: 'body', label: '바디감' },
  { key: 'finish', label: '여운' },
  { key: 'overall', label: '전체' },
];
