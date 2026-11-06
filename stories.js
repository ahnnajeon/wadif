// Everyday what-if episodes, grouped by age. No network or AI call is made.
//
// Each episode has two hidden conditions (conditions[0], conditions[1]).
// One is drawn when the player chooses and stays fixed for the day.
// choices[i].endings[k] is what happens if the player picks choice i
// on a day when condition k holds. The player sees their own ending first,
// then the other choice's ending under the same condition (the counterfactual).
//
// Writing rule: every detail an ending relies on should already appear in
// the setup, so the outcome follows from what the player saw. The hidden
// condition is the only thing they could not know.
window.WADIF_AGE_GROUPS = [
  { id: "10s", label: "10대" },
  { id: "20s", label: "20대" },
  { id: "30s", label: "30대" },
  { id: "40s", label: "40대" },
  { id: "50s", label: "50대" },
  { id: "60s", label: "60대" },
  { id: "70s", label: "70대 이상" }
];

window.WADIF_STORIES = {
  "10s": [
    {
      id: "10s-unpaid-icecream",
      title: "결제는 됐는데",
      setup: "학원 끝나고 들른 무인 아이스크림 가게. 2천 원짜리 하나를 골라 체크카드로 결제했다. 승인 메시지는 떴는데, 통장 잔고가 줄지 않았다. 천장 구석에 CCTV가 보인다.",
      question: "어떻게 할까?",
      conditions: [
        "사장님은 매일 기계로 매출을 맞춰 보고 있었다",
        "사장님은 가게 일에 거의 신경을 쓰지 않았다"
      ],
      art: { setup: { mood: "neutral", prop: "icecream" }, conditions: ["ledger", "asleep"] },
      choices: [
        { label: "사장님께 메시지를 남긴다", endings: [
          { title: "1+1", text: "사장님 답장이 왔다. \"정직한 학생이군요. 고마워요. 다음에 오면 학생에게만 특별히 1+1 해 줄게요.\"", art: { mood: "glad", prop: "icecream" } },
          { title: "나도 모르게 실천한 정직", text: "집에 가니 오랜만에 할머니가 와 계셨다. 용돈으로 5만 원을 주셨다.", art: { mood: "proud", prop: "money" } }
        ] },
        { label: "그냥 간다", endings: [
          { title: "휴업 안내", text: "다음 날 가게 문에 종이가 붙어 있다. \"기계 오류로 결제가 안 되는 일이 잦아 당분간 휴업합니다.\"", art: { mood: "flustered" } },
          { title: "공짜 아이스크림", text: "아이들에게 소문을 내고 매일 공짜로 아이스크림을 먹었다. 유지방 때문에 살이 찌고 여드름이 많이 났다.", art: { mood: "blank", prop: "icecream" } }
        ] }
      ]
    },
    {
      id: "10s-silent-teammate",
      title: "읽기만 하는 조원",
      setup: "수행평가 조별 발표가 내일이다. 단톡방은 네 명인데, 한 명이 일주일째 읽기만 하고 답이 없다. 그 친구 몫은 자료 조사다.",
      question: "어떻게 할까?",
      conditions: [
        "그 친구는 말없이 혼자 다 해 두고 있었다",
        "그 친구는 정말로 손을 놓고 있었다"
      ],
      art: { setup: { mood: "neutral" }, conditions: ["usb", "blank-page"] },
      choices: [
        { label: "내가 대신 한다", endings: [
          { title: "자료가 두 벌", text: "새벽 2시까지 그 친구 몫을 만들었다. 아침에 그 친구가 USB를 내민다. 똑같은 자료가 두 벌이 됐다.", art: { mood: "tired", prop: "papers" } },
          { title: "넷이 똑같이 A", text: "밤새 두 사람 몫을 했다. 점수는 넷이 똑같이 A. 억울한데 A다.", art: { mood: "blank" } }
        ] },
        { label: "선생님께 말씀드린다", endings: [
          { title: "조용해진 단톡방", text: "선생님이 그 친구를 불렀다. 친구는 다 만든 자료를 꺼냈다. 그날 단톡방은 아무도 말이 없었다.", art: { mood: "flustered" } },
          { title: "이름 옆 빈칸", text: "선생님이 역할 분담표를 내라고 했다. 그 친구 이름 옆은 비어 있었고, 점수는 따로 매겨졌다.", art: { mood: "calm" } }
        ] }
      ]
    },
    {
      id: "10s-last-donkatsu",
      title: "마지막 돈가스",
      setup: "오늘 급식은 돈가스. 배식 줄 맨 끝, 내 차례에 딱 한 조각 남았다. 바로 뒤에서 늦게 온 친구가 숨을 몰아쉬고 있다.",
      question: "마지막 돈가스는?",
      conditions: [
        "오늘은 그 친구 생일이었다",
        "조리실에 돈가스가 한 판 더 있었다"
      ],
      art: { setup: { mood: "neutral" }, conditions: ["cake", "extra-tray"] },
      choices: [
        { label: "내가 먹는다", endings: [
          { title: "생일 노래", text: "맛있게 먹었다. 종례 시간에 반 아이들이 그 친구 생일 노래를 부른다. 조금 미안해진다.", art: { mood: "sad" } },
          { title: "새 판", text: "먹기 시작하자 조리사님이 새 판을 들고 나온다. 친구는 두 조각을 받았다.", art: { mood: "calm" } }
        ] },
        { label: "친구에게 양보한다", endings: [
          { title: "어떻게 알았어?", text: "친구가 눈을 동그랗게 뜬다. \"오늘 내 생일인 거 어떻게 알았어?\" 몰랐다. 말하지 않기로 했다.", art: { mood: "proud" } },
          { title: "공짜 양보", text: "양보하자마자 조리사님이 새 판을 들고 나온다. 둘 다 먹었다. 양보는 공짜였다.", art: { mood: "glad" } }
        ] }
      ]
    }
  ],

  "20s": [
    {
      id: "20s-thirty-more",
      title: "30분만 더",
      setup: "카페 마감 알바, 퇴근 10분 전. 사장님이 \"오늘 30분만 더 해 줄 수 있어?\" 하고 묻는다. 오늘은 불금이라 술 약속이 있다. 친구들은 벌써 술집에 자리를 잡았다.",
      question: "어떻게 할까?",
      conditions: [
        "사장님이 다음 달 시급 올려 줄 사람을 고르는 중이었다",
        "10분 뒤 단체 손님 열두 명이 들어왔다"
      ],
      art: { setup: { mood: "neutral" }, conditions: ["raise", "crowd"] },
      choices: [
        { label: "남는다", endings: [
          { title: "500원", text: "30분 뒤 사장님이 말한다. \"다음 달부터 시급 500원 올려 줄게.\" 친구들은 이미 2차로 옮겼다.", art: { mood: "proud" } },
          { title: "2시간짜리 30분", text: "단체 손님 열두 명. 30분은 2시간이 됐다. 막차를 놓쳐 택시를 탔다. 택시비가 수당보다 많다.", art: { mood: "tired" } }
        ] },
        { label: "거절하고 간다", endings: [
          { title: "동생만 오른 시급", text: "사장님은 웃으며 보내 줬다. 다음 달, 같이 일하는 동생 시급만 올랐다.", art: { mood: "blank" } },
          { title: "퀭한 눈", text: "다음 날 출근하니 사장님 눈이 퀭하다. \"어제 단체 열두 명 왔어.\" 뭐, 그래도 어쩔 수 없다.", art: { mood: "calm" } }
        ] }
      ]
    },
    {
      id: "20s-roommate-icecream",
      title: "룸메이트의 하*다즈",
      setup: "새벽 2시, 자취방 공용 냉장고. 룸메이트의 하*다즈 아이스크림이 하나 있다. 내일 아침 하나 사다 놓으면 모를 것 같다.",
      question: "어떻게 할까?",
      conditions: [
        "룸메이트도 그 아이스크림을 먹으려고 깨어 있었다",
        "룸메이트는 유통기한이 지나 버리려던 참이었다"
      ],
      art: { setup: { mood: "neutral", prop: "icecream" }, conditions: ["awake", "expired"] },
      choices: [
        { label: "먹는다", endings: [
          { title: "마지막 한 입", text: "마지막 한 입에 룸메이트 방문이 열린다. 서로 눈만 봤다. 다음 날 냉장고에 이름표가 붙었다.", art: { mood: "surprised", prop: "icecream" } },
          { title: "시큼한 맛", text: "맛이 좀 시큼했다. 아침에 룸메이트가 묻는다. \"그거 기한 3년 지났던데, 버렸어?\" 대답 대신 배를 문질렀다.", art: { mood: "flustered" } }
        ] },
        { label: "참는다", endings: [
          { title: "반쪽 아이스크림", text: "10분 뒤 룸메이트가 나와 아이스크림을 뜯는다. 나를 보더니 반을 덜어 준다.", art: { mood: "glad", prop: "icecream" } },
          { title: "참길 잘했다", text: "아침에 룸메이트가 아이스크림을 버리며 말한다. \"비싼 건데 기한이 심하게 지났더라.\"", art: { mood: "proud" } }
        ] }
      ]
    },
    {
      id: "20s-star-rating",
      title: "별점 몇 개?",
      setup: "배달 앱 리뷰 이벤트로 콜라를 받았다. 조건은 별 5개 리뷰. 그런데 떡볶이가 불어서 왔다.",
      question: "별점은?",
      conditions: [
        "사장님 혼자 하는 가게라 리뷰마다 직접 답을 단다",
        "리뷰 답글은 전부 복사해 붙인 것이다"
      ],
      art: { setup: { mood: "neutral", prop: "phone" }, conditions: ["reply-pen", "copy"] },
      choices: [
        { label: "솔직하게 3개", endings: [
          { title: "칼같은 취소", text: "사장님 답글. \"불어서 죄송해요. 다음엔 요청사항에 '떡 따로'라고 적어 주세요.\" 리뷰 이벤트를 받고 3개를 줘서인지, 그 뒤로는 주문하면 칼같이 취소된다.", art: { mood: "blank", prop: "phone" } },
          { title: "감사합니다^^", text: "답글이 달렸다. \"소중한 리뷰 감사합니다^^\" 다른 리뷰 50개에도 똑같이 달려 있다.", art: { mood: "calm" } }
        ] },
        { label: "약속대로 5개", endings: [
          { title: "힘이 납니다", text: "사장님 답글. \"맛있게 드셨다니 힘이 납니다!\" 앞으로 리뷰 이벤트 하는 가게의 리뷰는 믿지 말아야겠다고 생각했다.", art: { mood: "tired" } },
          { title: "피카츄 돈가스", text: "별 5개를 주되, 사장님에게만 보이게 솔직한 불평을 달았다. 다음 주문에는 감사 메시지와 함께 피카츄 돈가스가 서비스로 왔다.", art: { mood: "glad" } }
        ] }
      ]
    }
  ],

  "30s": [
    {
      id: "30s-friday-message",
      title: "금요일 밤 10시의 메시지",
      setup: "금요일 밤 10시, 사내 메신저 알림이 온다. 팀장님이다. 미리보기에는 \"월요일에 잠깐…\"까지만 보이고, 열면 '읽음'이 뜬다.",
      question: "언제 열까?",
      conditions: [
        "다음 달부터 팀장을 맡아 달라는 내용이었다",
        "월요일 아침 7시 긴급 회의 소집이었다"
      ],
      art: { setup: { mood: "neutral", prop: "phone" }, conditions: ["promotion", "alarm"] },
      choices: [
        { label: "지금 연다", endings: [
          { title: "좋은 주말", text: "\"내가 사정상 부서를 옮기게 됐는데, 다음 달부터 팀장 맡아 줄 수 있어요?\" 예상치 못한 승진에 주말 내내 기분이 좋았다.", art: { mood: "glad" } },
          { title: "짧아진 주말", text: "\"월요일 7시 회의 가능해요?\" 읽음이 떴으니 \"네\"라고 답했다. 일요일 밤 9시에 잤다.", art: { mood: "tired", prop: "phone" } }
        ] },
        { label: "월요일에 연다", endings: [
          { title: "늦은 축하", text: "월요일 아침에 열었다. 팀장님이 \"주말엔 못 봤구나\" 하고 웃는다. 금요일 밤에 받았으면 좋았을 소식이다.", art: { mood: "sad" } },
          { title: "회의는 7시였다", text: "월요일 8시 50분, 메시지를 열었다. 회의는 7시였다. 근무 시간에 보낸 메시지가 아니니 괜찮다고 스스로 위로한다.", art: { mood: "surprised", sweat: true } }
        ] }
      ]
    },
    {
      id: "30s-gym-pass",
      title: "1년권 40% 할인",
      setup: "회사 앞 헬스장. 월 회원권은 9만 원, 1년권은 오늘까지 40% 할인해서 65만 원이다. 올해 운동은 세 번 결심하고 세 번 그만뒀다.",
      question: "무엇을 끊을까?",
      conditions: [
        "석 달 뒤 사무실이 다른 동네로 이전했다",
        "다음 주에 옆자리 동료도 같은 헬스장에 등록했다"
      ],
      art: { setup: { mood: "neutral" }, conditions: ["moving", "buddy"] },
      choices: [
        { label: "1년권", endings: [
          { title: "양도 수수료", text: "석 달 다니고 사무실이 이전했다. 남은 9개월을 넘기려니 양도 수수료가 10만 원이다.", art: { mood: "blank" } },
          { title: "돈이 시킨 운동", text: "아까워서 갔고, 동료가 기다려서 갔다. 1년 뒤 체지방이 6% 줄었다.", art: { mood: "proud" } }
        ] },
        { label: "한 달만", endings: [
          { title: "깔끔한 이별", text: "석 달 다니고 끝냈다. 새 사무실 앞 헬스장은 첫 달 무료다.", art: { mood: "glad" } },
          { title: "이번 달은 패스", text: "동료는 1년권, 나는 월권. 두 달째부터 \"이번 달은 패스\"가 늘었다. 동료는 혼자 1년을 다녔다.", art: { mood: "tired" } }
        ] }
      ]
    },
    {
      id: "30s-job-offer",
      title: "연봉 15%",
      setup: "헤드헌터에게서 전화가 온다. 비슷한 일을 하는 회사, 연봉은 15% 인상. 지금 팀은 일이 많지만 사람이 좋다.",
      question: "어떻게 할까?",
      conditions: [
        "그 회사는 반년 뒤 조직 개편을 했다",
        "지금 팀장님이 다음 달 퇴사할 예정이었다"
      ],
      art: { setup: { mood: "neutral" }, conditions: ["org-chart", "empty-chair"] },
      choices: [
        { label: "옮긴다", endings: [
          { title: "다시 만난 상사", text: "연봉은 올랐다. 반년 뒤 조직 개편 공지가 떴다. 예전에 같이 일했던 최악의 상사와 다시 일하게 됐다.", art: { mood: "sad" } },
          { title: "송별회의 고백", text: "송별회에서 팀장님이 자기도 다음 달 그만둔다고 털어놓는다. 남았으면 그 자리가 내 차례였을지도 모른다.", art: { mood: "blank" } }
        ] },
        { label: "남는다", endings: [
          { title: "기사로 본 개편", text: "반년 뒤 그 회사 조직 개편 기사를 봤다. 순간의 선택이 중요하다는 걸 느끼며 커피를 마신다.", art: { mood: "calm", prop: "coffee" } },
          { title: "빈자리", text: "다음 달 팀장님이 퇴사했다. 그 자리를 내가 이어받았다. 이런 게 럭키비키다.", art: { mood: "proud" } }
        ] }
      ]
    }
  ],

  "40s": [
    {
      id: "40s-one-more-academy",
      title: "학원 하나 더",
      setup: "초등학생 아이가 수학 학원을 하나 더 다니고 싶다고 한다. 단짝 친구가 다니는 곳이다. 한 달에 35만 원.",
      question: "어떻게 할까?",
      conditions: [
        "아이는 사실 친구랑 같이 있고 싶었다",
        "아이가 진짜로 수학이 좋아지던 참이었다"
      ],
      art: { setup: { mood: "neutral" }, conditions: ["friends", "math"] },
      choices: [
        { label: "보낸다", endings: [
          { title: "105만 원짜리 우정", text: "석 달 뒤 친구가 학원을 옮겼다. 아이도 그만두겠다고 한다. 수학 실력은 거기서 거기다.", art: { mood: "blank" } },
          { title: "저녁 퀴즈", text: "아이가 저녁마다 문제를 내 준다. 나는 풀어 주기도 버겁다. 학원을 다닌 덕인지 수학 실력이 부쩍 늘었다.", art: { mood: "glad", sweat: true } }
        ] },
        { label: "아직은 안 보낸다", endings: [
          { title: "외로워진 아이", text: "아이 친구가 다니는 학원은 커리큘럼이 빡빡하기로 유명하다. 아이는 이제 같이 놀 친구가 없다.", art: { mood: "sad" } },
          { title: "만 2천 원", text: "아이가 인강으로 혼자 수학을 판다. 문제집 한 권만 사 달란다. 만 2천 원. 스스로 공부하는 힘이 늘었다.", art: { mood: "proud" } }
        ] }
      ]
    },
    {
      id: "40s-reunion",
      title: "20년 만의 동창회",
      setup: "고등학교 동창 단톡방에 초대됐다. 20년 만의 동창회가 이번 토요일이다. 반장이던 친구가 유난히 열심히 연락을 돌린다.",
      question: "갈까?",
      conditions: [
        "반장은 그냥 친구들이 보고 싶었다",
        "반장은 다단계 사업을 시작했다"
      ],
      art: { setup: { mood: "neutral" }, conditions: ["heart", "pyramid"] },
      choices: [
        { label: "간다", endings: [
          { title: "이름표", text: "다들 이름표를 보고서야 서로를 알아봤다. 새벽 1시까지 술 마시며 재미있게 추억을 꺼냈다.", art: { mood: "glad" } },
          { title: "카탈로그", text: "2차 자리에서 반장이 카탈로그를 꺼냈다. 20년 만의 '잘 지냈어?'는 영업이었다.", art: { mood: "blank" } }
        ] },
        { label: "안 간다", endings: [
          { title: "단체 사진", text: "다음 날 단톡방에 단체 사진이 올라왔다. 다들 웃고 있다. 다음 모임 날짜를 먼저 물었다.", art: { mood: "sad" } },
          { title: "올라온 사진", text: "다음 날 단톡방에 카탈로그 사진이 올라왔다. 안 가길 잘했다.", art: { mood: "proud" } }
        ] }
      ]
    },
    {
      id: "40s-new-hire-mistake",
      title: "신입의 실수",
      setup: "금요일 오후, 신입이 보낸 견적서에서 숫자 하나가 틀린 걸 발견했다. 0이 하나 빠졌다. 신입은 얼굴이 하얘져서 \"팀장님께는 말하지 말아 주세요\" 한다.",
      question: "어떻게 할까?",
      conditions: [
        "고객사가 이미 그 견적서로 결재를 올렸다",
        "고객사는 아직 메일을 열지 않았다"
      ],
      art: { setup: { mood: "neutral", prop: "papers" }, conditions: ["stamp", "unread-mail"] },
      choices: [
        { label: "조용히 고쳐 준다", endings: [
          { title: "둘이 같이", text: "월요일 아침 고객사에서 전화가 왔다. 결국 팀장 앞에 둘이 같이 섰다. 경위서를 쓰게 됐다.", art: { mood: "tired", prop: "papers" } },
          { title: "둘만 아는 일", text: "정정 메일을 보냈다. 고객사는 정정본만 열었다. 아는 사람은 둘뿐이다.", art: { mood: "calm" } }
        ] },
        { label: "팀장에게 보고한다", endings: [
          { title: "작게 끝난 일", text: "팀장이 먼저 고객사에 전화했다. 일은 작게 끝났다. 한 달 뒤 신입이 말했다. \"그때 말해 주셔서 다행이었어요.\"", art: { mood: "proud" } },
          { title: "경위서 세 장", text: "아무도 모를 일이었는데 경위서가 세 장이 됐다. 신입은 그 주 내내 나를 피했다.", art: { mood: "sad", prop: "papers" } }
        ] }
      ]
    }
  ],

  "50s": [
    {
      id: "50s-return-text",
      title: "반송 예정 문자",
      setup: "\"[국제발신] 주소 불일치로 택배 반송 예정. 주소 확인: (링크)\" 지난주 해외 직구로 등산화를 주문하긴 했다. 서울 사는 아들은 이런 문자가 오면 꼭 물어보라고 했다.",
      question: "어떻게 할까?",
      conditions: [
        "진짜 택배사 문자였다",
        "사기 문자였다"
      ],
      art: { setup: { mood: "neutral", prop: "phone" }, conditions: ["parcel", "hook"] },
      choices: [
        { label: "링크를 누른다", endings: [
          { title: "도착한 등산화", text: "진짜였다. 주소를 고치자 이틀 뒤 등산화가 왔다. 아들에게는 말하지 않았다.", art: { mood: "proud" } },
          { title: "멈춘 손가락", text: "'앱을 설치하세요' 화면이 뜬다. 손가락이 멈췄다. 휴대폰을 끄고 은행에 전화했다. 다행히 아무 일도 없었다.", art: { mood: "flustered", prop: "phone" } }
        ] },
        { label: "아들에게 먼저 묻는다", endings: [
          { title: "하루 늦은 등산화", text: "아들이 \"택배사에 직접 전화해 보세요\" 한다. 진짜였다. 등산화는 하루 늦게 왔다.", art: { mood: "calm" } },
          { title: "30분 통화", text: "아들 답장. \"절대 누르지 마세요!!\" 그날 저녁 아들이 전화를 걸어 왔다. 오랜만에 30분을 통화했다.", art: { mood: "glad", prop: "phone" } }
        ] }
      ]
    },
    {
      id: "50s-kiosk",
      title: "키오스크 앞",
      setup: "동네에 새로 생긴 카페. 주문은 키오스크로만 받는다. 뒤에 세 사람이 줄을 섰고, 카운터에는 직원이 한 명 있다.",
      question: "어떻게 할까?",
      conditions: [
        "직원은 혼자 음료를 만드느라 바빴다",
        "키오스크 구석에 '큰 글씨' 버튼이 있었다"
      ],
      art: { setup: { mood: "neutral" }, conditions: ["busy-staff", "big-text"] },
      choices: [
        { label: "키오스크에 도전한다", endings: [
          { title: "따뜻한 아이스", text: "5분이 걸렸다. 뒤에서 한숨 소리가 들렸지만 끝까지 했다. 아이스 아메리카노가 따뜻한 걸로 나왔다.", art: { mood: "flustered", prop: "coffee" } },
          { title: "큰 글씨", text: "구석의 '큰 글씨' 버튼을 눌렀다. 1분 만에 주문 끝. 뒷사람보다 빨랐다. 용기 내길 잘했다.", art: { mood: "proud" } }
        ] },
        { label: "카운터에 가서 말한다", endings: [
          { title: "두 번 선 줄", text: "직원이 미안한 얼굴로 \"키오스크로 부탁드려요\" 한다. 줄을 다시 섰다.", art: { mood: "sad" } },
          { title: "배운 버튼", text: "직원이 나와서 '큰 글씨' 버튼을 알려 줬다. 다음부터는 혼자 한다.", art: { mood: "glad" } }
        ] }
      ]
    },
    {
      id: "50s-too-much-lettuce",
      title: "너무 많이 자란 상추",
      setup: "주말농장 상추가 한꺼번에 자랐다. 두 식구가 먹기엔 한 소쿠리가 넘는다. 옆집은 이번 봄에 이사 왔다.",
      question: "상추를 어떻게 할까?",
      conditions: [
        "옆집이 그날 저녁 고기를 굽기로 했다",
        "옆집도 주말농장을 해서 상추가 넘쳐났다"
      ],
      art: { setup: { mood: "neutral", prop: "lettuce" }, conditions: ["grill", "lettuce"] },
      choices: [
        { label: "옆집에 나눈다", endings: [
          { title: "고기로 돌아온 상추", text: "옆집이 \"오늘 삼겹살인데 같이 드세요\" 한다. 상추가 고기가 되어 돌아왔다.", art: { mood: "glad" } },
          { title: "상추 맞교환", text: "옆집 문이 열리자 거기도 상추 한 소쿠리. 서로 들고 한참 웃었다.", art: { mood: "surprised", prop: "lettuce" } }
        ] },
        { label: "그냥 우리끼리 먹는다", endings: [
          { title: "넘어온 냄새", text: "저녁에 옆집 고기 굽는 냄새가 베란다로 넘어온다. 상추를 나눠 드릴 걸, 하는 생각이 뒤늦게 든다.", art: { mood: "sad" } },
          { title: "당근 나눔", text: "다음 날 옆집이 상추 한 소쿠리를 들고 왔다. 상추가 처치 곤란이 돼서 당근에 나눔 글을 올렸다.", art: { mood: "tired", prop: "lettuce" } }
        ] }
      ]
    }
  ]
};


Object.assign(window.WADIF_STORIES, {
  "60s": [
    {
      "id": "60s-free-tuesday",
      "title": "화요일의 관객",
      "setup": "예순한 살 은퇴자 최해수. 혼자 평일 낮 영화에 왔다. 상영 뒤 감독과의 대화가 있다. 집에 돌아가 할 일은 없다. 없다는 말을 결함처럼 고치지는 않기로 했다.",
      "question": "대화까지 듣고 갈까?",
      "conditions": [
        "대화는 공지대로 30분에 끝난다.",
        "대화가 길어져 한 시간을 넘긴다."
      ],
      "art": {
        "setup": {
          "mood": "neutral"
        },
        "conditions": [
          "calendar-mon",
          "coffee-treat"
        ]
      },
      "choices": [
        {
          "label": "끝까지 듣는다",
          "short": "끝까지 듣는다",
          "endings": [
            {
              "title": "질문 하나",
              "text": "30분 동안 듣고 마지막에 질문했다. 감독이 잠시 생각했다. 내가 오늘 한 말 중 가장 오래 살아남은 문장이었다.",
              "art": {
                "mood": "calm"
              }
            },
            {
              "title": "긴 감독판",
              "text": "한 시간을 넘겨서야 끝났다. 감독은 편집의 중요성을 이야기했다. 나는 마지막까지 들은 관객으로서 증언할 수 있었다.",
              "art": {
                "mood": "calm"
              }
            }
          ]
        },
        {
          "label": "영화만 보고 나온다",
          "short": "영화만 보고 나온다",
          "endings": [
            {
              "title": "내 감상",
              "text": "정시에 끝난 대화 소식을 나중에 봤다. 나는 먼저 나와 영화 장면을 생각하며 점심을 먹었다. 해설 없는 감상도 남았다.",
              "art": {
                "mood": "calm"
              }
            },
            {
              "title": "정해진 러닝타임",
              "text": "나는 영화가 끝날 때 나왔다. 대화가 길어졌다는 소식은 산책하다 읽었다. 오늘 본 영화에는 엔딩이 하나였다.",
              "art": {
                "mood": "calm"
              }
            }
          ]
        }
      ]
    },
    {
      "id": "60s-first-bread",
      "title": "수강생 번호",
      "setup": "예순여섯 살 조은영. 은퇴 뒤 제빵을 배우기 시작했다. 오늘 구운 빵을 옆자리 수강생과 바꿔 먹자는 제안을 받았다. 내 빵은 모양이 당당하지 못하다.",
      "question": "빵을 바꿀까?",
      "conditions": [
        "상대의 빵은 속까지 잘 익었다.",
        "상대의 빵은 가운데가 덜 익었다."
      ],
      "art": {
        "setup": {
          "mood": "neutral"
        },
        "conditions": [
          "calendar-mon",
          "coffee-treat"
        ]
      },
      "choices": [
        {
          "label": "반씩 나눈다",
          "short": "반씩 나눈다",
          "endings": [
            {
              "title": "비교 시식",
              "text": "상대 빵은 잘 익었다. 우리는 내 빵도 나눠 먹고 반죽 시간을 비교했다. 자기소개보다 쓸모 있는 정보가 오갔다.",
              "art": {
                "mood": "calm"
              }
            },
            {
              "title": "추가 수업",
              "text": "상대 빵 가운데가 덜 익어 강사에게 물었다. 다시 오븐에 넣고 기다리며 이야기했다. 실패가 수업 시간을 연장했다.",
              "art": {
                "mood": "calm"
              }
            }
          ]
        },
        {
          "label": "오늘은 각자 먹는다",
          "short": "오늘은 각자 먹는다",
          "endings": [
            {
              "title": "각자의 결과",
              "text": "상대는 잘 익은 빵을, 나는 못생긴 빵을 싸 갔다. 다음에는 반죽을 어떻게 했는지 물어보기로 했다.",
              "art": {
                "mood": "calm"
              }
            },
            {
              "title": "포장 전 검사",
              "text": "상대가 자기 빵을 잘랐다가 덜 익은 걸 발견했다. 나는 옆에서 같이 강사의 설명을 들었다. 교환하지 않아도 배울 것은 있었다.",
              "art": {
                "mood": "calm"
              }
            }
          ]
        }
      ]
    }
  ],
  "70s": [
    {
      "id": "70s-separate-homes",
      "title": "합칠 것은 저녁",
      "setup": "일흔한 살 오미경. 이혼한 지 8년, 혼자 산다. 최근 만나는 사람과 여행을 의논하다 상대가 언젠가 같이 살 생각도 있는지 물었다. 나는 그 사람은 좋지만 내 집의 조용한 아침도 좋다.",
      "question": "내 생각을 지금 말할까?",
      "conditions": [
        "상대도 각자 집에서 지내기를 원한다.",
        "상대는 언젠가 함께 살기를 원한다."
      ],
      "art": {
        "setup": {
          "mood": "neutral"
        },
        "conditions": [
          "calendar-mon",
          "coffee-treat"
        ]
      },
      "choices": [
        {
          "label": "따로 살고 싶다고 말한다",
          "short": "따로 살고 싶다고 말한다",
          "endings": [
            {
              "title": "집 두 채",
              "text": "상대도 같은 생각이었다. 저녁은 함께 먹고 집에는 각자 갔다. 관계가 진전돼도 열쇠 수는 줄지 않았다.",
              "art": {
                "mood": "calm"
              }
            },
            {
              "title": "다른 미래",
              "text": "상대는 함께 살고 싶다고 했다. 당장 결론 내리지 않고 생각할 시간을 갖기로 했다. 좋아한다는 말로 평면도까지 합쳐지지는 않았다.",
              "art": {
                "mood": "calm"
              }
            }
          ]
        },
        {
          "label": "오늘은 여행 얘기만 하자고 한다",
          "short": "오늘은 여행 얘기만 하자고 한다",
          "endings": [
            {
              "title": "보류한 질문",
              "text": "상대는 여행 얘기로 돌아갔다. 둘 다 따로 살고 싶었지만 확인하지는 못했다. 숙소 예약이 인생 계획보다 먼저 끝났다.",
              "art": {
                "mood": "calm"
              }
            },
            {
              "title": "남은 질문",
              "text": "상대는 여행 얘기를 하면서도 아까 질문을 다시 꺼냈다. 나는 아직 답할 준비가 없다고 했다. 여행 가방에 넣어 둘 수 없는 질문이었다.",
              "art": {
                "mood": "calm"
              }
            }
          ]
        }
      ]
    },
    {
      "id": "70s-coffee-time",
      "title": "아침형 두 사람",
      "setup": "일흔여섯 살 김도현. 몇 년 전 사별한 뒤 독서 모임에서 새 사람을 만났다. 상대가 오전 8시에 커피를 마시자고 한다. 나는 혼자 살기 시작한 뒤 늦게 일어나는 자유를 꽤 정성껏 지켜 왔다.",
      "question": "몇 시에 만나자고 할까?",
      "conditions": [
        "상대는 그날 10시에도 시간이 된다.",
        "상대는 그날 8시에만 시간이 된다."
      ],
      "art": {
        "setup": {
          "mood": "neutral"
        },
        "conditions": [
          "calendar-mon",
          "coffee-treat"
        ]
      },
      "choices": [
        {
          "label": "10시를 제안한다",
          "short": "10시를 제안한다",
          "endings": [
            {
              "title": "두 시간의 합의",
              "text": "10시로 바꿨다. 잘 잔 얼굴로 커피를 마셨다. 만남에 대한 성의가 기상 시각으로만 측정되지는 않았다.",
              "art": {
                "mood": "calm"
              }
            },
            {
              "title": "다른 날",
              "text": "상대가 8시만 된다기에 다른 날을 찾기로 했다. 조금 아쉬웠다. 약속이 늦춰졌고, 내 아침은 그대로 남았다.",
              "art": {
                "mood": "calm"
              }
            }
          ]
        },
        {
          "label": "8시에 나가 본다",
          "short": "8시에 나가 본다",
          "endings": [
            {
              "title": "이른 커피",
              "text": "상대는 10시도 됐다고 했다. 나는 다음엔 10시에 보자고 했다. 첫 만남에서 유용한 정보를 하나 수집했다.",
              "art": {
                "mood": "calm"
              }
            },
            {
              "title": "아침의 비용",
              "text": "8시에 만나 이야기를 나눴다. 커피가 두 잔 필요했다. 즐거웠지만 다음 약속은 오후로 잡았다.",
              "art": {
                "mood": "calm"
              }
            }
          ]
        }
      ]
    }
  ]
});
