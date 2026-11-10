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
      "version": 2,
      "title": "화요일의 관객",
      "setup": "나는 예순하나다. 은퇴하고는 평일 낮에 영화를 본다. 오늘 영화에는 아버지가 딸의 전화를 끝까지 받지 않는 장면이 있다. 이유는 나오지 않는다. 나도 딸이 있다. 전화는 주로 딸이 건다. 상영이 끝나고 감독과의 대화가 시작됐다. 관객은 열네 명, 나 말고는 다 젊다.",
      "question": "손을 들까?",
      "conditions": [
        "객석에 그 장면을 물을 사람은 나뿐이었다",
        "앞줄 청년도 같은 질문을 준비해 왔다"
      ],
      "art": {
        "setup": {
          "mood": "neutral"
        },
        "conditions": [
          "bubble-q",
          "copy"
        ]
      },
      "choices": [
        {
          "label": "그 장면을 묻는다",
          "short": "그 장면을 묻는다",
          "endings": [
            {
              "title": "용건 없는 전화",
              "text": "손을 들었다. 감독이 한참 생각했다. \"제 아버지가 그랬어요. 저도 이유를 몰라서 찍었어요.\" 집에 오는 길에 딸에게 전화했다. 딸이 받자마자 물었다. \"무슨 일 있어?\" 아무 일 없이 거는 전화는 처음이었다.",
              "art": {
                "mood": "surprised",
                "prop": "phone"
              }
            },
            {
              "title": "토씨까지",
              "text": "손을 들었다. 앞줄 청년도 들었다. 마이크는 청년에게 갔다. 내 질문이었다. 토씨까지 같았다. 감독의 대답을 들었다. 답은 왔다. 질문한 사람은 내가 아니었다.",
              "art": {
                "mood": "blank"
              }
            }
          ]
        },
        {
          "label": "듣기만 한다",
          "short": "듣기만 한다",
          "endings": [
            {
              "title": "부재중 한 통",
              "text": "듣기만 했다. 아무도 그 장면을 묻지 않았다. 감독은 촬영 장비 이야기를 40분 했다. 극장을 나와 휴대폰을 켜니 딸의 부재중 전화가 한 통 있었다. 다시 걸지는 않았다. 내일 하면 된다. 영화 속 아버지도 아마 그렇게 생각했다.",
              "art": {
                "mood": "sad",
                "prop": "phone"
              }
            },
            {
              "title": "대신 물어 준 사람",
              "text": "듣기만 했다. 앞줄 청년이 손을 들었다. 내 질문이었다. 토씨까지 같았다. 감독은 자기 아버지가 그랬다고 했다. 이유를 몰라서 찍었다고. 손을 들지 않아도 답은 왔다. 저 나이에 그게 궁금한 청년이 조금 걱정됐다.",
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
      "version": 2,
      "title": "주저앉은 식빵",
      "setup": "나는 예순여섯이다. 은퇴하고 제빵 학원에 다닌다. 오늘은 식빵 실기 연습 날이다. 옆자리 스물셋 수강생이 반씩 바꿔 먹어 보자고 한다. 내 빵은 한쪽이 주저앉았다. 그 친구 빵은 겉으로는 반듯하다.",
      "question": "바꿔 먹을까?",
      "conditions": [
        "옆자리 빵은 속까지 잘 익었다",
        "옆자리 빵은 가운데가 덜 익었다"
      ],
      "art": {
        "setup": {
          "mood": "neutral"
        },
        "conditions": [
          "extra-tray",
          "timer10"
        ]
      },
      "choices": [
        {
          "label": "반씩 바꾼다",
          "short": "반씩 바꾼다",
          "endings": [
            {
              "title": "할머니 빵",
              "text": "반씩 바꿨다. 옆자리 빵은 결이 고왔다. 내 빵을 먹은 청년이 말했다. \"저희 할머니 빵 맛이에요.\" 칭찬이었다. 그 할머니는 작년에 돌아가셨다고 했다. 내 빵은 추억이 될 만큼 못생겼다.",
              "art": {
                "mood": "flustered"
              }
            },
            {
              "title": "익은 쪽",
              "text": "반씩 바꿨다. 옆자리 빵은 가운데가 덜 익어 있었다. 둘이 강사에게 가서 오븐 온도 설명을 같이 들었다. 강사가 내 빵을 들어 보였다. \"모양은 이래도 다 익었어요.\" 주저앉아도 익은 빵이 이긴다.",
              "art": {
                "mood": "proud"
              }
            }
          ]
        },
        {
          "label": "각자 가져가자고 한다",
          "short": "각자 가져가자고 한다",
          "endings": [
            {
              "title": "비닐봉지",
              "text": "각자 가져가자고 했다. 청년이 자기 빵을 잘랐다. 속까지 결이 고왔다. 나는 내 빵을 비닐봉지에 넣었다. 비교당하지 않는 데는 성공했다. 배우지 못하는 데도 성공했다.",
              "art": {
                "mood": "tired"
              }
            },
            {
              "title": "결국 내가 한 말",
              "text": "각자 가져가자고 했다. 청년이 자기 빵을 자르다 멈췄다. 가운데가 덜 익었다. 청년이 내 빵을 한참 봤다. 주저앉았지만 익은 빵이었다. 반을 잘라 줬다. 나눠 먹자는 말은 결국 내가 했다.",
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
      "version": 2,
      "title": "합칠 것은 저녁",
      "setup": "나는 일흔하나다. 이혼한 지 8년, 혼자 산다. 2년째 만나는 사람과 제주 여행 숙소를 고르다가 그 사람이 물었다. \"우리, 언젠가 같이 살 생각도 있어요?\" 나는 그 사람이 좋다. 내 집의 조용한 아침도 좋다.",
      "question": "뭐라고 할까?",
      "conditions": [
        "그 사람도 자기 집의 아침을 내줄 생각이 없었다",
        "그 사람은 이미 자기 집을 내놓을지 알아보고 있었다"
      ],
      "art": {
        "setup": {
          "mood": "neutral",
          "prop": "phone"
        },
        "conditions": [
          "half",
          "tag"
        ]
      },
      "choices": [
        {
          "label": "따로 살고 싶다고 말한다",
          "short": "따로 살고 싶다고 말한다",
          "endings": [
            {
              "title": "방 두 개",
              "text": "따로 살고 싶다고 했다. 그 사람이 크게 숨을 내쉬었다. \"다행이다. 물어봐야 하는 줄 알았어요.\" 숙소는 방 두 개짜리로 잡았다. 아침은 같이 먹기로 했다. 8년 만에 같은 걸 원하는 사람을 만났다. 원하는 게 따로 사는 거였다.",
              "art": {
                "mood": "glad"
              }
            },
            {
              "title": "부동산 앱",
              "text": "따로 살고 싶다고 했다. 그 사람은 고개를 끄덕이고 휴대폰을 엎었다. 엎기 전에 화면이 보였다. 자기 집 시세를 보던 중이었다. 여행은 가기로 했다. 할 이야기가 하나 늘었다.",
              "art": {
                "mood": "surprised",
                "prop": "phone"
              }
            }
          ]
        },
        {
          "label": "여행 얘기부터 하자고 한다",
          "short": "여행 얘기부터 하자고 한다",
          "endings": [
            {
              "title": "숙소 설명",
              "text": "여행 얘기부터 하자고 했다. 그 사람은 숙소 사진을 넘기다 방 두 개짜리에서 멈췄다. \"이거 어때요? 아침엔 각자 조용히.\" 내가 하려던 말이 숙소 설명에 들어 있었다. 대답은 미뤘는데 답은 들었다.",
              "art": {
                "mood": "calm"
              }
            },
            {
              "title": "더 큰 질문",
              "text": "여행 얘기부터 하자고 했다. 그 사람은 숙소 사진을 넘기다 말했다. \"사실 집을 내놓을까 알아보고 있어요.\" 여행 얘기는 거기서 끝났다. 미룬 질문이 더 큰 질문을 데리고 돌아왔다.",
              "art": {
                "mood": "surprised"
              }
            }
          ]
        }
      ]
    },
    {
      "id": "70s-coffee-time",
      "version": 2,
      "title": "아침형 두 사람",
      "setup": "나는 일흔여섯이다. 사별하고 몇 년 뒤 독서 모임에서 사람을 만났다. 그 사람이 토요일 아침 8시에 커피를 마시자고 한다. 혼자 살게 된 뒤로 나는 9시에 일어난다. 늦잠은 내가 나에게 준 몇 안 되는 선물이다.",
      "question": "뭐라고 할까?",
      "conditions": [
        "그 사람도 사실은 늦게 일어나는 사람이었다",
        "그 사람은 10시부터 손주를 봐야 했다"
      ],
      "art": {
        "setup": {
          "mood": "neutral",
          "prop": "coffee"
        },
        "conditions": [
          "asleep",
          "timer10"
        ]
      },
      "choices": [
        {
          "label": "10시는 어떠냐고 묻는다",
          "short": "10시는 어떠냐고 묻는다",
          "endings": [
            {
              "title": "잘 잔 얼굴",
              "text": "10시는 어떠냐고 물었다. 답이 바로 왔다. \"좋아요! 사실 저도 8시는 힘들어요.\" 내가 아침형인 줄 알고 맞춘 시간이었다고 했다. 둘 다 상대를 아침형으로 알았다. 10시 커피는 둘 다 잘 잔 얼굴로 마셨다.",
              "art": {
                "mood": "glad",
                "prop": "coffee"
              }
            },
            {
              "title": "다음 주",
              "text": "10시는 어떠냐고 물었다. 그 사람은 10시부터 손주를 봐야 한다고 했다. 다음 주로 미뤘다. 토요일에 늦잠을 잤다. 잘 잤는데 개운하지 않았다.",
              "art": {
                "mood": "tired"
              }
            }
          ]
        },
        {
          "label": "8시에 나가겠다고 한다",
          "short": "8시에 나가겠다고 한다",
          "endings": [
            {
              "title": "다섯 번의 하품",
              "text": "8시에 나갔다. 그 사람은 하품을 세 번 했다. 나도 두 번 했다. 헤어질 때 그 사람이 말했다. \"사실 저 아침형 아니에요.\" 둘 다 서로를 위해 일찍 일어났다. 다섯 번의 하품은 같은 이유였다.",
              "art": {
                "mood": "tired",
                "prop": "coffee"
              }
            },
            {
              "title": "정확히 두 시간",
              "text": "8시에 나갔다. 졸렸다. 9시 50분에 그 사람이 일어섰다. 10시부터 손주를 본다고 했다. 8시가 아니면 안 되는 약속이었다. 일찍 일어난 보람이 정확히 두 시간 있었다.",
              "art": {
                "mood": "tired"
              }
            }
          ]
        }
      ]
    }
  ]
});
