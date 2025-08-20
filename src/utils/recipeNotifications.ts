import { Project } from '@/src/types';

// 레시피별 맞춤 알림 메시지 데이터
export const RECIPE_NOTIFICATIONS = {
  yare_yare: {
    name: '야레야레',
    type: 'whiskey',
    duration: 60,
    messages: {
      threeDaysBeforeCompletion: {
        title: '🥃 야레야레 완성 임박!',
        body: '위스키 야레야레가 3일 후 완성됩니다. 마지막 숙성을 지켜봐 주세요.',
        emoji: '🥃'
      },
      oneDayBeforeCompletion: {
        title: '🎯 내일이면 완성!',
        body: '야레야레 위스키가 내일 완성됩니다. 시음 준비를 해보세요!',
        emoji: '🎯'
      },
      completionDay: {
        title: '🍻 야레야레 완성!',
        body: '60일간의 숙성이 끝났습니다! 이제 진짜 위스키의 맛을 경험해보세요.',
        emoji: '🍻'
      },
      midpointCheck: {
        title: '📊 야레야레 중간 점검',
        body: '30일차입니다! 색깔과 향의 변화를 확인해보세요. 위스키다운 향이 나기 시작할 거예요.',
        emoji: '📊'
      },
      weeklyCheck: {
        title: '🔍 주간 체크',
        body: '야레야레의 숙성 상태를 확인해보세요. 색이 더 진해졌나요?',
        emoji: '🔍'
      }
    },
    tips: [
      '온도 변화가 적은 서늘한 곳에 보관하세요',
      '직사광선을 피해 어두운 곳에 두세요',
      '2-3주차부터 색깔 변화를 관찰해보세요',
      '완성 후에는 냉장고에서 차게 드시는 것을 추천합니다'
    ]
  },
  blabla: {
    name: '블라블라',
    type: 'gin',
    duration: 30,
    messages: {
      threeDaysBeforeCompletion: {
        title: '🍸 블라블라 완성 임박!',
        body: '진 블라블라가 3일 후 완성됩니다. 향긋한 허브향이 기대되네요!',
        emoji: '🍸'
      },
      oneDayBeforeCompletion: {
        title: '🌿 내일이면 완성!',
        body: '블라블라 진이 내일 완성됩니다. 토닉워터 준비는 하셨나요?',
        emoji: '🌿'
      },
      completionDay: {
        title: '🎉 블라블라 완성!',
        body: '30일간의 숙성이 끝났습니다! 깔끔하고 향긋한 진의 맛을 즐겨보세요.',
        emoji: '🎉'
      },
      midpointCheck: {
        title: '🌱 블라블라 중간 점검',
        body: '15일차입니다! 허브와 스파이스의 향이 잘 우러나고 있는지 확인해보세요.',
        emoji: '🌱'
      },
      weeklyCheck: {
        title: '🌿 주간 체크',
        body: '블라블라의 향을 살짝 맡아보세요. 진다운 향이 나나요?',
        emoji: '🌿'
      }
    },
    tips: [
      '허브류는 너무 오래 우리면 쓴맛이 날 수 있어요',
      '일주일에 한 번씩 가볍게 흔들어주세요',
      '향을 확인할 때는 뚜껑을 살짝만 열어보세요',
      '완성 후에는 칵테일로 즐기시는 것을 추천합니다'
    ]
  },
  oz: {
    name: '오즈',
    type: 'rum',
    duration: 90,
    messages: {
      threeDaysBeforeCompletion: {
        title: '🏴‍☠️ 오즈 완성 임박!',
        body: '럼 오즈가 3일 후 완성됩니다. 90일간의 긴 여행이 끝나갑니다!',
        emoji: '🏴‍☠️'
      },
      oneDayBeforeCompletion: {
        title: '🌴 내일이면 완성!',
        body: '오즈 럼이 내일 완성됩니다. 캐리비안의 향이 기대되네요!',
        emoji: '🌴'
      },
      completionDay: {
        title: '🥳 오즈 완성!',
        body: '90일간의 긴 숙성이 끝났습니다! 진짜 럼의 깊은 맛을 경험해보세요.',
        emoji: '🥳'
      },
      midpointCheck: {
        title: '⚓ 오즈 중간 점검',
        body: '45일차입니다! 럼의 색깔과 향이 많이 진해졌을 거예요. 확인해보세요!',
        emoji: '⚓'
      },
      weeklyCheck: {
        title: '🗺️ 주간 체크',
        body: '오즈의 숙성 상태를 확인해보세요. 럼다운 달콤한 향이 나나요?',
        emoji: '🗺️'
      }
    },
    tips: [
      '럼은 온도에 민감하니 일정한 온도를 유지하세요',
      '숙성이 길수록 더 부드러운 맛이 납니다',
      '한 달에 한 번씩 맛을 살짝 봐도 좋아요',
      '완성 후에는 스트레이트로도 즐길 수 있습니다'
    ]
  },
  pachinko: {
    name: '파친코',
    type: 'fruit',
    duration: 45,
    messages: {
      threeDaysBeforeCompletion: {
        title: '🍓 파친코 완성 임박!',
        body: '과실주 파친코가 3일 후 완성됩니다. 달콤한 과일향이 기대되네요!',
        emoji: '🍓'
      },
      oneDayBeforeCompletion: {
        title: '🍑 내일이면 완성!',
        body: '파친코 과실주가 내일 완성됩니다. 상큼달콤한 맛이 기대돼요!',
        emoji: '🍑'
      },
      completionDay: {
        title: '🍹 파친코 완성!',
        body: '45일간의 숙성이 끝났습니다! 과일의 달콤함이 가득한 파친코를 즐겨보세요.',
        emoji: '🍹'
      },
      midpointCheck: {
        title: '🍇 파친코 중간 점검',
        body: '22일차입니다! 과일의 색깔과 향이 술에 잘 우러나고 있는지 확인해보세요.',
        emoji: '🍇'
      },
      weeklyCheck: {
        title: '🍊 주간 체크',
        body: '파친코의 색깔 변화를 관찰해보세요. 과일의 색이 예쁘게 우러났나요?',
        emoji: '🍊'
      }
    },
    tips: [
      '과일은 신선한 것을 사용하세요',
      '과일 조각이 너무 크면 우러나는 속도가 느려집니다',
      '설탕의 양은 과일의 단맛에 따라 조절하세요',
      '완성 후에는 냉장보관하여 시원하게 드세요'
    ]
  },
  gyeaeba: {
    name: '계애바',
    type: 'vodka',
    duration: 21,
    messages: {
      threeDaysBeforeCompletion: {
        title: '❄️ 계애바 완성 임박!',
        body: '보드카 계애바가 3일 후 완성됩니다. 깔끔하고 순수한 맛이 기대되네요!',
        emoji: '❄️'
      },
      oneDayBeforeCompletion: {
        title: '🧊 내일이면 완성!',
        body: '계애바 보드카가 내일 완성됩니다. 순수하고 깔끔한 맛을 준비하세요!',
        emoji: '🧊'
      },
      completionDay: {
        title: '✨ 계애바 완성!',
        body: '21일간의 숙성이 끝났습니다! 깔끔하고 순수한 계애바를 즐겨보세요.',
        emoji: '✨'
      },
      midpointCheck: {
        title: '💎 계애바 중간 점검',
        body: '10일차입니다! 보드카의 깔끔함이 더해지고 있는지 확인해보세요.',
        emoji: '💎'
      },
      weeklyCheck: {
        title: '🔍 주간 체크',
        body: '계애바의 맑기를 확인해보세요. 투명하고 깔끔한가요?',
        emoji: '🔍'
      }
    },
    tips: [
      '보드카는 순수한 맛이 생명이니 깨끗한 용기를 사용하세요',
      '다른 향이 섞이지 않도록 밀폐 보관하세요',
      '숙성 기간이 짧아 변화를 자주 관찰해보세요',
      '완성 후에는 차갑게 해서 스트레이트로 드세요'
    ]
  }
};

// 레시피 ID에서 알림 데이터 가져오기
export const getRecipeNotificationData = (recipeId: string) => {
  return RECIPE_NOTIFICATIONS[recipeId as keyof typeof RECIPE_NOTIFICATIONS];
};

// 프로젝트에 맞는 맞춤 알림 메시지 생성
export const generateCustomNotificationMessage = (
  project: Project,
  notificationType: 'threeDaysBeforeCompletion' | 'oneDayBeforeCompletion' | 'completionDay' | 'midpointCheck' | 'weeklyCheck'
) => {
  const recipeData = getRecipeNotificationData(project.recipeId || '');
  
  if (!recipeData) {
    // 기본 메시지 반환
    const defaultMessages = {
      threeDaysBeforeCompletion: {
        title: '📅 완성 3일 전',
        body: `${project.name}이(가) 3일 후 완성됩니다!`,
        emoji: '📅'
      },
      oneDayBeforeCompletion: {
        title: '⏰ 완성 1일 전',
        body: `${project.name}이(가) 내일 완성됩니다!`,
        emoji: '⏰'
      },
      completionDay: {
        title: '🎉 완성!',
        body: `${project.name}이(가) 완성되었습니다!`,
        emoji: '🎉'
      },
      midpointCheck: {
        title: '📊 중간 점검',
        body: `${project.name}의 진행 상황을 확인해보세요!`,
        emoji: '📊'
      },
      weeklyCheck: {
        title: '🔍 주간 체크',
        body: `${project.name}의 상태를 확인해보세요!`,
        emoji: '🔍'
      }
    };
    return defaultMessages[notificationType];
  }

  return recipeData.messages[notificationType];
};

// 레시피별 팁 가져오기
export const getRecipeTips = (recipeId: string): string[] => {
  const recipeData = getRecipeNotificationData(recipeId);
  return recipeData?.tips || [];
};

// 진행률에 따른 동기부여 메시지
export const getProgressMotivationMessage = (project: Project, progressPercentage: number) => {
  const recipeData = getRecipeNotificationData(project.recipeId || '');
  const recipeName = recipeData?.name || project.name;

  if (progressPercentage <= 25) {
    return `${recipeName} 시작이 반이에요! 🚀`;
  } else if (progressPercentage <= 50) {
    return `${recipeName} 벌써 반이나 왔네요! 💪`;
  } else if (progressPercentage <= 75) {
    return `${recipeName} 이제 얼마 안 남았어요! 🎯`;
  } else if (progressPercentage < 100) {
    return `${recipeName} 거의 다 왔어요! 마지막까지 화이팅! 🔥`;
  } else {
    return `${recipeName} 완성! 축하드려요! 🎉`;
  }
};
